"""
VCE Methods — Diagram Extractor

Renders exam PDF pages at high resolution, uses Claude Vision to identify
diagram bounding boxes, then crops and saves each diagram as a PNG.

Usage:
  python3 scripts/extract-diagrams.py                          # all PDFs
  python3 scripts/extract-diagrams.py --file 2023-mm1.pdf      # single PDF
  python3 scripts/extract-diagrams.py --file 2023-mm1.pdf --page 4  # single page

Output:  scripts/diagrams/{year}-mm{n}/  with cropped PNGs + manifest.json
"""

import fitz  # PyMuPDF
import json
import os
import sys
import base64
import re
import argparse
from pathlib import Path
from typing import Optional

# ── Config ────────────────────────────────────────────────────────────

EXAMS_DIR = Path(__file__).parent.parent / "exams" / "questions"
OUTPUT_DIR = Path(__file__).parent / "diagrams"
RENDER_SCALE = 3  # 3x = 216 DPI (crisp on retina)
PREVIEW_SCALE = 1  # 1x for sending to Claude (saves tokens)

# ── Claude API ────────────────────────────────────────────────────────

def get_api_key():
    """Read ANTHROPIC_API_KEY from .env.local"""
    env_file = Path(__file__).parent.parent / ".env.local"
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            if line.startswith("ANTHROPIC_API_KEY="):
                return line.split("=", 1)[1].strip().strip('"')
    return os.environ.get("ANTHROPIC_API_KEY")


def ask_claude_for_diagrams(page_image_b64: str, page_num: int, pdf_name: str) -> list[dict]:
    """Send a page image to Claude and get diagram bounding boxes back."""
    import urllib.request

    api_key = get_api_key()
    if not api_key:
        print("  WARNING: No ANTHROPIC_API_KEY found, skipping Claude analysis")
        return []

    prompt = f"""You are analyzing page {page_num} of the VCE Mathematical Methods exam "{pdf_name}".

Look at this exam page image and identify ALL graphs, diagrams, charts, or visual figures.
Do NOT include: blank answer spaces, lined areas, page borders, headers/footers, or text-only content.

For each diagram found, return its bounding box as approximate percentages of the page dimensions:
- x: left edge (0-100%)
- y: top edge (0-100%)
- w: width (0-100%)
- h: height (0-100%)

Also provide:
- question: the question number this diagram belongs to (e.g. "3", "5a")
- type: one of "graph", "chart", "diagram", "table", "number_line", "tree_diagram", "normal_distribution"
- description: brief description (e.g. "Cartesian plane with axes from -3 to 4, y from -2 to 6")

Return ONLY a JSON array. If no diagrams on this page, return [].

Example:
[
  {{"x": 15, "y": 40, "w": 55, "h": 35, "question": "3a", "type": "graph", "description": "Cartesian plane axes -3 to 4, -2 to 6"}}
]"""

    body = json.dumps({
        "model": "claude-sonnet-4-20250514",
        "max_tokens": 1024,
        "messages": [{
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/png",
                        "data": page_image_b64,
                    },
                },
                {"type": "text", "text": prompt},
            ],
        }],
    }).encode()

    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=body,
        headers={
            "Content-Type": "application/json",
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read())
            text = data["content"][0]["text"]
            # Extract JSON array from response
            match = re.search(r'\[.*\]', text, re.DOTALL)
            if match:
                return json.loads(match.group())
            return []
    except Exception as e:
        print(f"  WARNING: Claude API error: {e}")
        return []


# ── PDF Processing ────────────────────────────────────────────────────

def process_page(doc, page_idx: int, pdf_name: str, out_dir: Path) -> list[dict]:
    """Process a single page: render, detect diagrams, crop."""
    page = doc[page_idx]
    page_num = page_idx + 1

    print(f"  Page {page_num}: analyzing...")

    # Render at preview resolution for Claude
    preview_mat = fitz.Matrix(PREVIEW_SCALE, PREVIEW_SCALE)
    preview_pix = page.get_pixmap(matrix=preview_mat)
    preview_bytes = preview_pix.tobytes("png")
    preview_b64 = base64.b64encode(preview_bytes).decode()

    # Ask Claude to find diagrams
    diagrams = ask_claude_for_diagrams(preview_b64, page_num, pdf_name)

    if not diagrams:
        print(f"  Page {page_num}: no diagrams found")
        return []

    print(f"  Page {page_num}: {len(diagrams)} diagram(s) found")

    # Render at high resolution for cropping
    hires_mat = fitz.Matrix(RENDER_SCALE, RENDER_SCALE)
    page_w = page.rect.width
    page_h = page.rect.height

    results = []
    for i, diag in enumerate(diagrams):
        # Convert percentage coordinates to PDF points
        x0 = page_w * diag["x"] / 100
        y0 = page_h * diag["y"] / 100
        x1 = x0 + page_w * diag["w"] / 100
        y1 = y0 + page_h * diag["h"] / 100

        # Add padding (10 pts)
        pad = 10
        clip = fitz.Rect(
            max(0, x0 - pad),
            max(0, y0 - pad),
            min(page_w, x1 + pad),
            min(page_h, y1 + pad),
        )

        # Crop at high resolution
        crop_pix = page.get_pixmap(matrix=hires_mat, clip=clip)

        # Build filename: 2023-mm1-p4-q3a-1.png
        q_label = str(diag.get("question", "unknown")).replace(" ", "")
        filename = f"p{page_num}-q{q_label}.png"
        if i > 0:
            filename = f"p{page_num}-q{q_label}-{i+1}.png"

        filepath = out_dir / filename
        crop_pix.save(str(filepath))

        result = {
            "file": filename,
            "page": page_num,
            "question": diag.get("question", ""),
            "type": diag.get("type", "graph"),
            "description": diag.get("description", ""),
            "bbox_pct": {"x": diag["x"], "y": diag["y"], "w": diag["w"], "h": diag["h"]},
            "bbox_pts": {"x0": round(clip.x0, 1), "y0": round(clip.y0, 1), "x1": round(clip.x1, 1), "y1": round(clip.y1, 1)},
            "size": {"width": crop_pix.width, "height": crop_pix.height},
        }
        results.append(result)
        print(f"    -> {filename} ({crop_pix.width}x{crop_pix.height}) Q{q_label}: {diag.get('type', '?')}")

    return results


def process_pdf(pdf_path: Path, specific_page: Optional[int] = None):
    """Process an entire PDF or a specific page."""
    pdf_name = pdf_path.stem  # e.g. "2023-mm1"
    out_dir = OUTPUT_DIR / pdf_name
    out_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n{'='*60}")
    print(f"Processing: {pdf_name}.pdf")
    print(f"Output: {out_dir}")
    print(f"{'='*60}")

    doc = fitz.open(str(pdf_path))
    manifest = []

    if specific_page is not None:
        # Process single page (1-based input)
        idx = specific_page - 1
        if 0 <= idx < len(doc):
            results = process_page(doc, idx, pdf_name, out_dir)
            manifest.extend(results)
        else:
            print(f"  ERROR: Page {specific_page} out of range (1-{len(doc)})")
    else:
        # Process all pages
        for idx in range(len(doc)):
            results = process_page(doc, idx, pdf_name, out_dir)
            manifest.extend(results)

    doc.close()

    # Save manifest
    manifest_path = out_dir / "manifest.json"

    # Merge with existing manifest if processing a single page
    if specific_page is not None and manifest_path.exists():
        existing = json.loads(manifest_path.read_text())
        # Remove entries for this page, add new ones
        existing = [e for e in existing if e["page"] != specific_page]
        manifest = sorted(existing + manifest, key=lambda d: (d["page"], d["question"]))

    manifest_path.write_text(json.dumps(manifest, indent=2))
    print(f"\nManifest: {manifest_path} ({len(manifest)} diagrams)")
    return manifest


# ── Main ──────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Extract diagrams from VCE exam PDFs")
    parser.add_argument("--file", help="Process a single PDF (e.g. 2023-mm1.pdf)")
    parser.add_argument("--page", type=int, help="Process only this page number (1-based)")
    args = parser.parse_args()

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    if args.file:
        pdf_path = EXAMS_DIR / args.file
        if not pdf_path.exists():
            print(f"ERROR: {pdf_path} not found")
            sys.exit(1)
        process_pdf(pdf_path, args.page)
    else:
        # Process all PDFs
        pdfs = sorted(EXAMS_DIR.glob("*.pdf"))
        if not pdfs:
            print(f"ERROR: No PDFs found in {EXAMS_DIR}")
            sys.exit(1)
        print(f"Found {len(pdfs)} PDFs to process")
        for pdf_path in pdfs:
            process_pdf(pdf_path)

    print("\nDone!")


if __name__ == "__main__":
    main()
