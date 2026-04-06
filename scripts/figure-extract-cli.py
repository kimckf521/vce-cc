"""CLI wrapper around figure-extractor.py for use as a subprocess.

Usage:
    python3 scripts/figure-extract-cli.py --file /path/to/exam.pdf --artifacts-dir /path/to/artifacts

Outputs JSON to stdout with the extraction results.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

# Import from the sibling module
sys.path.insert(0, str(Path(__file__).resolve().parent))
from importlib import import_module

extractor = import_module("figure-extractor")


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract figures from a PDF.")
    parser.add_argument("--file", required=True, help="Path to the PDF file")
    parser.add_argument("--artifacts-dir", required=True, help="Directory to store artifacts")
    args = parser.parse_args()

    pdf_path = Path(args.file)
    if not pdf_path.exists():
        print(json.dumps({"error": f"File not found: {pdf_path}"}))
        sys.exit(1)

    artifacts_root = Path(args.artifacts_dir)
    artifacts_root.mkdir(parents=True, exist_ok=True)

    pdf_bytes = pdf_path.read_bytes()
    try:
        result = extractor.extract_pdf(pdf_bytes, pdf_path.name, artifacts_root)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
