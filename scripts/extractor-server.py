"""
VCE Figure Extractor — Remote API Server

Deploy this on a DigitalOcean droplet to allow all admins to extract
figures from PDFs via the Vercel-hosted web app.

Usage:
    python3 extractor-server.py --port 8080

Environment variables:
    EXTRACTOR_API_KEY     — shared secret to authenticate requests
    SUPABASE_URL          — Supabase project URL
    SUPABASE_SERVICE_KEY  — Supabase service role key

Setup on DigitalOcean:
    1. Create a droplet (Ubuntu 22.04, $4-6/mo is enough)
    2. SSH in and run:
        sudo apt update && sudo apt install -y python3-pip tesseract-ocr
        pip3 install pymupdf numpy scipy pillow pytesseract flask supabase gunicorn
    3. Clone the repo or copy this file + figure-extractor.py
    4. Set environment variables
    5. Run with gunicorn:
        gunicorn -w 2 -b 0.0.0.0:8080 --timeout 300 extractor-server:app
    6. Set up nginx reverse proxy + SSL (optional but recommended)
"""

from __future__ import annotations

import json
import os
import secrets
import sys
import tempfile
import time
from pathlib import Path

import fitz  # PyMuPDF, used for the cached label-context build
from flask import Flask, request, jsonify

# Add scripts directory to path so we can import the extractor
sys.path.insert(0, str(Path(__file__).resolve().parent))
from importlib import import_module
extractor = import_module("figure-extractor")

app = Flask(__name__)

API_KEY = os.environ.get("EXTRACTOR_API_KEY", "")
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")
BUCKET = "extraction"

# Persistent cache for source PDFs across requests. Source PDFs never change for
# a given jobId, so caching forever is safe. Wipe /var/cache/vce-extractor/ to
# clear if disk pressure becomes an issue.
PDF_CACHE_DIR = Path(os.environ.get("VCE_EXTRACTOR_CACHE", "/var/cache/vce-extractor")) / "jobs"
PDF_CACHE_DIR.mkdir(parents=True, exist_ok=True)

# In-memory cache of document_label_contexts per jobId. Populated lazily on
# first recrop; reused for every subsequent recrop on the same PDF. Each
# gunicorn worker keeps its own copy. Wiped on worker restart, which is fine.
_LABEL_CONTEXT_CACHE: dict[str, list] = {}


def _supabase_client():
    from supabase import create_client
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def _get_or_download_source_pdf(job_id: str) -> Path:
    """Return a path to the cached source PDF, downloading from Supabase if needed."""
    cached = PDF_CACHE_DIR / job_id / "source.pdf"
    if cached.exists():
        return cached
    cached.parent.mkdir(parents=True, exist_ok=True)
    pdf_data = _supabase_client().storage.from_(BUCKET).download(f"jobs/{job_id}/source.pdf")
    cached.write_bytes(pdf_data)
    return cached


def _get_or_build_label_contexts(job_id: str, source_pdf: Path) -> list:
    """Return cached document label contexts, building once per worker per job."""
    cached = _LABEL_CONTEXT_CACHE.get(job_id)
    if cached is not None:
        return cached
    pdf = fitz.open(source_pdf)
    try:
        contexts = extractor._build_document_label_contexts(pdf)
    finally:
        pdf.close()
    _LABEL_CONTEXT_CACHE[job_id] = contexts
    return contexts


def check_auth():
    """Verify the API key from the Authorization header."""
    if not API_KEY:
        return  # No key configured = no auth required (dev mode)
    auth = request.headers.get("Authorization", "")
    if auth != f"Bearer {API_KEY}":
        return jsonify({"error": "Unauthorized"}), 401


def upload_to_supabase(job_dir: Path, job_id: str) -> dict[str, str]:
    """Upload all artifacts to Supabase Storage and return URL mapping."""
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        return {}

    from supabase import create_client
    client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    # Ensure bucket exists
    try:
        client.storage.create_bucket(BUCKET, options={"public": True})
    except Exception:
        pass  # Already exists

    url_map: dict[str, str] = {}

    for file_path in job_dir.rglob("*"):
        if file_path.is_dir():
            continue

        relative = str(file_path.relative_to(job_dir))
        storage_path = f"jobs/{job_id}/{relative}"

        content_type = "image/png"
        if file_path.suffix == ".pdf":
            content_type = "application/pdf"
        elif file_path.suffix == ".csv":
            content_type = "text/csv"
        elif file_path.suffix == ".json":
            content_type = "application/json"

        try:
            with open(file_path, "rb") as f:
                client.storage.from_(BUCKET).upload(
                    storage_path,
                    f.read(),
                    file_options={"content-type": content_type, "upsert": "true"},
                )

            public_url = client.storage.from_(BUCKET).get_public_url(storage_path)
            original_url = f"/artifacts/{job_id}/{relative}"
            url_map[original_url] = public_url
        except Exception as e:
            print(f"[upload] Failed {storage_path}: {e}")

    return url_map


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "vce-figure-extractor"})


@app.route("/api/extract", methods=["POST"])
def extract():
    auth_error = check_auth()
    if auth_error:
        return auth_error

    if "pdf" not in request.files:
        return jsonify({"error": "No PDF file provided"}), 400

    pdf_file = request.files["pdf"]
    if not pdf_file.filename or not pdf_file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "File must be a PDF"}), 400

    # Save to temp directory
    with tempfile.TemporaryDirectory(prefix="vce-extract-") as temp_dir:
        artifacts_dir = Path(temp_dir) / "artifacts"
        artifacts_dir.mkdir()

        pdf_bytes = pdf_file.read()
        filename = pdf_file.filename or "upload.pdf"

        try:
            result = extractor.extract_pdf(pdf_bytes, filename, artifacts_dir)
        except Exception as e:
            return jsonify({"error": f"Extraction failed: {str(e)}"}), 500

        job_id = result["jobId"]
        job_dir = artifacts_dir / job_id

        # Upload artifacts to Supabase
        url_map = upload_to_supabase(job_dir, job_id)

        # Rewrite URLs
        if url_map:
            for page in result.get("pages", []):
                if page.get("imageUrl") in url_map:
                    page["imageUrl"] = url_map[page["imageUrl"]]

            for item in result.get("items", []):
                if item.get("imageUrl") in url_map:
                    item["imageUrl"] = url_map[item["imageUrl"]]
                if item.get("downloadUrl") in url_map:
                    item["downloadUrl"] = url_map[item["downloadUrl"]]
                if item.get("tableUrl") and item["tableUrl"] in url_map:
                    item["tableUrl"] = url_map[item["tableUrl"]]

    return jsonify(result)


@app.route("/api/recrop", methods=["POST"])
def recrop():
    auth_error = check_auth()
    if auth_error:
        return auth_error

    payload = request.get_json(silent=True) or {}
    job_id = str(payload.get("jobId", ""))
    page_number = int(payload.get("pageNumber", 0))
    box = payload.get("box", {})
    kind = str(payload.get("kind", "auto"))
    item_id = str(payload["itemId"]) if payload.get("itemId") else None
    label_override = str(payload.get("labelOverride", "") or "")
    existing_labels = [
        str(label).strip()
        for label in payload.get("existingLabels", [])
        if str(label).strip()
    ]

    if not job_id or not page_number or not box:
        return jsonify({"error": "jobId, pageNumber, and box are required"}), 400

    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        return jsonify({"error": "Supabase not configured for recrop"}), 500

    timings: dict[str, int] = {}

    def tick(label: str, t0: float) -> None:
        timings[label] = int((time.perf_counter() - t0) * 1000)

    # Step 1 — get the source PDF (from disk cache, or download once)
    t0 = time.perf_counter()
    try:
        cached_pdf = _get_or_download_source_pdf(job_id)
    except Exception:
        return jsonify({"error": "Source PDF not found. Re-extract the PDF first."}), 404
    tick("source_pdf", t0)

    # Step 2 — build (or fetch from cache) the per-document label contexts
    t0 = time.perf_counter()
    try:
        contexts = _get_or_build_label_contexts(job_id, cached_pdf)
    except Exception as e:
        return jsonify({"error": f"Failed to load PDF context: {str(e)}"}), 500
    tick("label_contexts", t0)

    with tempfile.TemporaryDirectory(prefix="vce-recrop-") as temp_dir:
        artifacts_dir = Path(temp_dir) / "artifacts"
        job_dir = artifacts_dir / job_id
        (job_dir / "items").mkdir(parents=True, exist_ok=True)
        (job_dir / "tables").mkdir(exist_ok=True)
        # recrop_pdf_region needs source.pdf inside the job dir; symlink to the
        # cached file rather than copying the bytes.
        try:
            (job_dir / "source.pdf").symlink_to(cached_pdf)
        except (OSError, NotImplementedError):
            (job_dir / "source.pdf").write_bytes(cached_pdf.read_bytes())

        # Step 3 — actual recrop (PDF render + optional OCR + table extract)
        t0 = time.perf_counter()
        try:
            item = extractor.recrop_pdf_region(
                job_id=job_id,
                page_number=page_number,
                box=box,
                kind=kind,
                artifacts_root=artifacts_dir,
                item_id=item_id,
                label_override=label_override,
                existing_labels=existing_labels,
                document_label_contexts=contexts,
            )
        except FileNotFoundError as e:
            return jsonify({"error": str(e)}), 404
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        except Exception as e:
            return jsonify({"error": f"Recrop failed: {str(e)}"}), 500
        tick("recrop", t0)

        # Step 4 — upload artifacts to Supabase
        t0 = time.perf_counter()
        url_map = upload_to_supabase(job_dir, job_id)
        tick("upload", t0)

        if url_map:
            if item.get("imageUrl") in url_map:
                item["imageUrl"] = url_map[item["imageUrl"]]
            if item.get("downloadUrl") in url_map:
                item["downloadUrl"] = url_map[item["downloadUrl"]]
            if item.get("tableUrl") and item["tableUrl"] in url_map:
                item["tableUrl"] = url_map[item["tableUrl"]]

    print(
        f"[recrop-timing] job={job_id} page={page_number} kind={kind} "
        + " ".join(f"{k}={v}ms" for k, v in timings.items()),
        flush=True,
    )
    return jsonify({"item": item})


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="VCE Figure Extractor API Server")
    parser.add_argument("--port", type=int, default=8080)
    parser.add_argument("--host", default="0.0.0.0")
    args = parser.parse_args()

    print(f"Starting extractor server on {args.host}:{args.port}")
    app.run(host=args.host, port=args.port, debug=False)
