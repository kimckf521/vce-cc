from __future__ import annotations

import contextlib
import csv
import io
import re
import secrets
import time
from pathlib import Path
from typing import Any

import fitz
import numpy as np
import pytesseract
from PIL import Image

# Ensure pytesseract can find the tesseract binary.
for _candidate in ("/opt/homebrew/bin/tesseract", "/usr/local/bin/tesseract"):
    if Path(_candidate).is_file():
        pytesseract.pytesseract.tesseract_cmd = _candidate
        break
from scipy import ndimage


def _rect_area(rect: fitz.Rect) -> float:
    """Compatibility: older PyMuPDF lacks .get_area()."""
    if hasattr(rect, "get_area"):
        return float(rect.get_area())
    return float(abs(rect))


PREVIEW_SCALE = 1.35
RASTER_SCALE = 2.0
EXPORT_SCALE = 3.0
TEXT_CONFIDENCE = 25.0
MIN_REGION_AREA_RATIO = 0.0065
MIN_REGION_INK = 0.01
EDGE_SIDEBAR_WIDTH_RATIO = 0.18
EDGE_SIDEBAR_HEIGHT_RATIO = 0.72
SOURCE_PDF_NAME = "source.pdf"
ROMAN_NUMERALS = r"(?:viii|vii|vi|iv|iii|ii|v|i)"
QUESTION_LABEL_PATTERN = re.compile(
    rf"^Q\d+(?:[a-h](?:{ROMAN_NUMERALS})?|[A-E])?$"
)
QUESTION_LINE_PATTERN = re.compile(
    rf"\bquestion\s+(\d{{1,3}})([a-h])?({ROMAN_NUMERALS})?\b", re.IGNORECASE
)
NUMBERED_QUESTION_PATTERN = re.compile(r"^(\d{1,3})[\.\)]\s+\S")
PART_LINE_PATTERN = re.compile(r"^(?:\(\s*([a-h])\s*\)|([a-h])[\.\):])\s+\S")
SUBPART_LINE_PATTERN = re.compile(
    rf"^(?:\(\s*({ROMAN_NUMERALS})\s*\)|({ROMAN_NUMERALS})[\.\):])\s+\S"
)
OPTION_WORD_PATTERN = re.compile(r"^\(?([A-E])\)?[\.\):]?$", re.IGNORECASE)
QUESTION_SUFFIX_PATTERN = re.compile(
    rf"^(Q\d+(?:[a-h](?:{ROMAN_NUMERALS})?|[A-E])?)-(\d+)$"
)
PRINTED_PAGE_PATTERN = re.compile(r"\bpage\s+(\d{1,3})\s+of\s+\d{1,3}\b", re.IGNORECASE)
END_OF_PAPER_PATTERN = re.compile(r"end\s+of\s+question\s+and\s+answer\s+book", re.IGNORECASE)
SECTION_INSTRUCTIONS_PATTERN = re.compile(r"\binstructions?\b", re.IGNORECASE)


def extract_pdf(pdf_bytes: bytes, filename: str, artifacts_root: Path) -> dict[str, Any]:
    job_id = f"{time.strftime('%Y%m%d-%H%M%S')}-{secrets.token_hex(4)}"
    job_dir = artifacts_root / job_id
    pages_dir = job_dir / "pages"
    items_dir = job_dir / "items"
    tables_dir = job_dir / "tables"

    pages_dir.mkdir(parents=True, exist_ok=True)
    items_dir.mkdir(parents=True, exist_ok=True)
    tables_dir.mkdir(parents=True, exist_ok=True)
    (job_dir / SOURCE_PDF_NAME).write_bytes(pdf_bytes)

    pdf = fitz.open(stream=pdf_bytes, filetype="pdf")
    try:
        pages_payload: list[dict[str, Any]] = []
        items_payload: list[dict[str, Any]] = []
        document_label_contexts = _build_document_label_contexts(pdf)

        for page_index in range(pdf.page_count):
            page = pdf[page_index]
            preview_name, preview_width, preview_height = _save_page_preview(
                page, pages_dir, page_index
            )
            page_label_context = document_label_contexts[page_index]

            # Skip pages before Question 1 and after "END OF QUESTION AND ANSWER BOOK".
            if not page_label_context.get("extractable", True):
                pages_payload.append(
                    {
                        "pageNumber": page_index + 1,
                        "width": preview_width,
                        "height": preview_height,
                        "imageUrl": f"/artifacts/{job_id}/pages/{preview_name}",
                        "detections": [],
                    }
                )
                continue

            native_candidates = _detect_native_candidates(page)
            raster_candidates = _detect_raster_candidates(page)
            candidates = _merge_candidates(page, native_candidates, raster_candidates)

            # On the page where Question 1 starts, skip candidates above it
            # (e.g. Instructions section).
            extract_from_y = page_label_context.get("extractFromY")
            if extract_from_y is not None:
                candidates = [c for c in candidates if c["rect"].y0 >= extract_from_y]

            # Skip candidates that overlap with "Instructions" zones.
            skip_zones = page_label_context.get("skipZones", [])
            if skip_zones:
                candidates = [
                    c for c in candidates
                    if not any(
                        c["rect"].y0 < zone_end and c["rect"].y1 > zone_start
                        for zone_start, zone_end in skip_zones
                    )
                ]

            # Skip tables that are Section A MCQ answer tables or mark tables.
            candidates = [c for c in candidates if not _is_skippable_table(c, page)]

            page_detections: list[dict[str, Any]] = []

            for candidate_index, candidate in enumerate(candidates, start=1):
                item_payload = _export_candidate(
                    page=page,
                    candidate=candidate,
                    page_index=page_index,
                    candidate_index=candidate_index,
                    items_dir=items_dir,
                    tables_dir=tables_dir,
                    job_id=job_id,
                    label=_derive_base_label(
                        document_label_contexts,
                        page_index + 1,
                        candidate["rect"],
                        candidate["kind"],
                    ),
                )
                items_payload.append(item_payload)
                page_detections.append(
                    {
                        "id": item_payload["id"],
                        "kind": item_payload["kind"],
                        "label": item_payload["label"],
                        "confidence": item_payload["confidence"],
                        "box": item_payload["box"],
                    }
                )

            pages_payload.append(
                {
                    "pageNumber": page_index + 1,
                    "width": preview_width,
                    "height": preview_height,
                    "imageUrl": f"/artifacts/{job_id}/pages/{preview_name}",
                    "detections": page_detections,
                }
            )

        counts: dict[str, int] = {}
        _apply_question_labels(items_payload, pages_payload)
        for item in items_payload:
            counts[item["kind"]] = counts.get(item["kind"], 0) + 1

        return {
            "jobId": job_id,
            "filename": filename,
            "summary": {
                "pages": pdf.page_count,
                "items": len(items_payload),
                "counts": counts,
            },
            "pages": pages_payload,
            "items": items_payload,
        }
    finally:
        pdf.close()


def recrop_pdf_region(
    *,
    job_id: str,
    page_number: int,
    box: dict[str, float],
    kind: str,
    artifacts_root: Path,
    item_id: str | None = None,
    label_override: str | None = None,
    existing_labels: list[str] | None = None,
) -> dict[str, Any]:
    job_dir = artifacts_root / job_id
    source_pdf = job_dir / SOURCE_PDF_NAME
    if not source_pdf.exists():
        raise FileNotFoundError("The original PDF for this extraction job is no longer available.")

    pdf = fitz.open(source_pdf)
    try:
        if page_number < 1 or page_number > pdf.page_count:
            raise ValueError("Invalid page number.")

        document_label_contexts = _build_document_label_contexts(pdf)
        page = pdf[page_number - 1]
        rect = _rect_from_normalized_box(box, page.rect)
        rect = _clamp_rect(rect, page.rect)
        if rect.is_empty or rect.width < page.rect.width * 0.02 or rect.height < page.rect.height * 0.02:
            raise ValueError("Crop box is too small.")

        export_kind = kind if kind in {"chart", "diagram", "table"} else "auto"
        confidence = 1.0
        table_rows = None

        if export_kind == "auto":
            pixmap = page.get_pixmap(matrix=fitz.Matrix(EXPORT_SCALE, EXPORT_SCALE), clip=rect, alpha=False)
            crop = Image.frombytes("RGB", (pixmap.width, pixmap.height), pixmap.samples)
            export_kind, confidence = _classify_crop(crop, _ocr_words(crop))
            if export_kind == "image":
                export_kind = "diagram"
        if export_kind == "table":
            table_rows = _extract_table_rows_for_rect(page, rect)

        token = secrets.token_hex(4)
        export_id = item_id or f"manual-page-{page_number}-{token}"
        file_stub = f"manual-page-{page_number:03d}-{export_kind}-{token}"
        final_label = _resolve_manual_label(
            label_override=label_override,
            existing_labels=existing_labels or [],
            base_label=_derive_base_label(
                document_label_contexts,
                page_number,
                rect,
                export_kind,
            ),
        )
        return _export_region(
            page=page,
            rect=rect,
            page_number=page_number,
            kind=export_kind,
            source="manual-adjustment",
            confidence=confidence,
            items_dir=job_dir / "items",
            tables_dir=job_dir / "tables",
            job_id=job_id,
            item_id=export_id,
            file_stub=file_stub,
            table_rows=table_rows,
            label=final_label,
        )
    finally:
        pdf.close()


def _save_page_preview(page: fitz.Page, pages_dir: Path, page_index: int) -> tuple[str, int, int]:
    pixmap = page.get_pixmap(matrix=fitz.Matrix(PREVIEW_SCALE, PREVIEW_SCALE), alpha=False)
    file_name = f"page-{page_index + 1:03d}.png"
    output_path = pages_dir / file_name
    pixmap.save(output_path)
    return file_name, pixmap.width, pixmap.height


def _detect_native_candidates(page: fitz.Page) -> list[dict[str, Any]]:
    page_area = max(_rect_area(page.rect), 1)
    candidates: list[dict[str, Any]] = []

    with contextlib.redirect_stdout(io.StringIO()):
        tables = page.find_tables()

    for table in tables.tables:
        rect = _clamp_rect(fitz.Rect(table.bbox), page.rect)
        if rect.is_empty or _rect_area(rect) / page_area < 0.01:
            continue
        candidates.append(
            {
                "kind": "table",
                "source": "native-table",
                "confidence": 0.98,
                "rect": rect,
                "tableRows": table.extract(),
            }
        )

    return candidates


def _detect_raster_candidates(page: fitz.Page) -> list[dict[str, Any]]:
    pixmap = page.get_pixmap(matrix=fitz.Matrix(RASTER_SCALE, RASTER_SCALE), alpha=False)
    image = Image.frombytes("RGB", (pixmap.width, pixmap.height), pixmap.samples)

    grayscale = np.array(image.convert("L"))
    threshold = min(230, max(140, _otsu_threshold(grayscale) + 25))
    binary_mask = grayscale < threshold

    words = _ocr_words(image)
    cleaned_mask = binary_mask.copy()
    for word in words:
        if word["confidence"] < TEXT_CONFIDENCE:
            continue
        padding = 6
        x0 = max(0, word["left"] - padding)
        y0 = max(0, word["top"] - padding)
        x1 = min(cleaned_mask.shape[1], word["left"] + word["width"] + padding)
        y1 = min(cleaned_mask.shape[0], word["top"] + word["height"] + padding)
        cleaned_mask[y0:y1, x0:x1] = False

    kernel_size = max(12, min(cleaned_mask.shape) // 95)
    merged_mask = ndimage.binary_dilation(
        cleaned_mask,
        structure=np.ones((kernel_size, kernel_size), dtype=bool),
    )
    merged_mask = ndimage.binary_fill_holes(merged_mask)

    labels, _ = ndimage.label(merged_mask)
    regions = ndimage.find_objects(labels)
    page_area = image.width * image.height
    minimum_area = max(18000, int(page_area * MIN_REGION_AREA_RATIO))

    candidates: list[dict[str, Any]] = []
    for region in regions:
        if region is None:
            continue

        y0, y1 = region[0].start, region[0].stop
        x0, x1 = region[1].start, region[1].stop
        area = (x1 - x0) * (y1 - y0)
        if area < minimum_area:
            continue

        ink_density = float(binary_mask[y0:y1, x0:x1].mean())
        if ink_density < MIN_REGION_INK:
            continue

        if _looks_like_sidebar_pixels((x0, y0, x1, y1), image.width, image.height):
            continue

        margin = max(10, kernel_size // 2)
        x0 = max(0, x0 - margin)
        y0 = max(0, y0 - margin)
        x1 = min(image.width, x1 + margin)
        y1 = min(image.height, y1 + margin)

        crop = image.crop((x0, y0, x1, y1))
        crop_words = [
            {
                "text": word["text"],
                "confidence": word["confidence"],
                "left": word["left"] - x0,
                "top": word["top"] - y0,
                "width": word["width"],
                "height": word["height"],
            }
            for word in words
            if word["left"] >= x0
            and word["top"] >= y0
            and word["left"] + word["width"] <= x1
            and word["top"] + word["height"] <= y1
        ]

        kind, confidence = _classify_crop(crop, crop_words)
        if kind == "image":
            continue

        rect = fitz.Rect(x0 / RASTER_SCALE, y0 / RASTER_SCALE, x1 / RASTER_SCALE, y1 / RASTER_SCALE)
        rect = _clamp_rect(rect, page.rect)
        if rect.is_empty:
            continue

        candidates.append(
            {
                "kind": kind,
                "source": "raster-segmentation",
                "confidence": confidence,
                "rect": rect,
            }
        )

    return candidates


def _is_skippable_table(candidate: dict[str, Any], page: fitz.Page) -> bool:
    """Return True for tables that should not be extracted.

    Skipped tables:
    - Section A / Multiple-choice answer/statistics tables
    - Any table containing the word "Marks" (mark allocation tables)
    """
    if candidate["kind"] != "table":
        return False

    # Check native table cell content first (most reliable).
    table_rows = candidate.get("tableRows")
    if table_rows:
        table_text = " ".join(
            str(cell or "") for row in table_rows for cell in row
        ).lower()
    else:
        # Fall back to extracting text from the candidate's rect.
        table_text = page.get_text("text", clip=candidate["rect"]).lower()

    if "marks" in table_text:
        return True

    # Also check the surrounding page text above the table for
    # "Section A" / "Multiple-choice" headings.  This catches tables
    # that don't contain those words themselves but sit under such a heading.
    rect = candidate["rect"]
    above_rect = fitz.Rect(page.rect.x0, max(page.rect.y0, rect.y0 - 120), page.rect.x1, rect.y0)
    context_text = page.get_text("text", clip=above_rect).lower()
    combined_text = context_text + " " + table_text

    if "section a" in combined_text and "multiple" in combined_text:
        return True
    if "question" in table_text and "% " in table_text:
        # Exam report statistics table (Question, %A, %B, …)
        return True

    return False


def _merge_candidates(
    page: fitz.Page,
    native_candidates: list[dict[str, Any]],
    raster_candidates: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    ordered = sorted(native_candidates, key=_candidate_priority, reverse=True)

    for candidate in raster_candidates:
        duplicate = False
        for existing in ordered:
            overlap = _rect_overlap_ratio(existing["rect"], candidate["rect"])
            if overlap >= 0.72:
                duplicate = True
                break
        if not duplicate:
            ordered.append(candidate)

    ordered = sorted(ordered, key=lambda item: (item["rect"].y0, item["rect"].x0))
    return ordered


def _export_candidate(
    page: fitz.Page,
    candidate: dict[str, Any],
    page_index: int,
    candidate_index: int,
    items_dir: Path,
    tables_dir: Path,
    job_id: str,
    label: str,
) -> dict[str, Any]:
    rect = _clamp_rect(candidate["rect"], page.rect)
    return _export_region(
        page=page,
        rect=rect,
        page_number=page_index + 1,
        kind=candidate["kind"],
        source=candidate["source"],
        confidence=float(candidate["confidence"]),
        items_dir=items_dir,
        tables_dir=tables_dir,
        job_id=job_id,
        item_id=f"page-{page_index + 1}-{candidate_index}",
        file_stub=f"page-{page_index + 1:03d}-{candidate['kind']}-{candidate_index:02d}",
        table_rows=candidate.get("tableRows"),
        label=label,
    )


def _export_region(
    *,
    page: fitz.Page,
    rect: fitz.Rect,
    page_number: int,
    kind: str,
    source: str,
    confidence: float,
    items_dir: Path,
    tables_dir: Path,
    job_id: str,
    item_id: str,
    file_stub: str,
    table_rows: list[list[str | None]] | None = None,
    label: str | None = None,
) -> dict[str, Any]:
    pixmap = page.get_pixmap(matrix=fitz.Matrix(EXPORT_SCALE, EXPORT_SCALE), clip=rect, alpha=False)
    file_name = f"{file_stub}.png"
    output_path = items_dir / file_name
    pixmap.save(output_path)

    table_url = None
    if table_rows:
        table_name = f"{file_stub}.csv"
        with (tables_dir / table_name).open("w", newline="", encoding="utf-8") as handle:
            writer = csv.writer(handle)
            writer.writerows(table_rows)
        table_url = f"/artifacts/{job_id}/tables/{table_name}"

    return {
        "id": item_id,
        "pageNumber": page_number,
        "kind": kind,
        "label": label or _label_for_kind(kind),
        "confidence": round(float(confidence), 2),
        "source": source,
        "imageUrl": f"/artifacts/{job_id}/items/{file_name}",
        "downloadUrl": f"/artifacts/{job_id}/items/{file_name}",
        "tableUrl": table_url,
        "box": _normalized_box(rect, page.rect),
        "pixelSize": {
            "width": pixmap.width,
            "height": pixmap.height,
        },
    }


def _label_for_kind(kind: str) -> str:
    return {
        "chart": "Chart",
        "diagram": "Diagram",
        "table": "Table",
        "image": "Others",
    }.get(kind, "Figure")


def _build_document_label_contexts(pdf: fitz.Document) -> list[dict[str, Any]]:
    contexts: list[dict[str, Any]] = []
    previous_printed_page_number: int | None = None
    sequence_id = 0
    found_first_question = False
    found_end_of_paper = False

    for page_index in range(pdf.page_count):
        page = pdf[page_index]
        page_number = page_index + 1
        words = _extract_page_words(page)
        lines = _group_words_into_lines(words)
        printed_page_number = _extract_printed_page_number(lines)
        page_text = " ".join(str(line.get("text", "")) for line in lines)

        questions, inline_parts, inline_subparts = _extract_question_anchors(
            lines, page.rect, page_number, sequence_id
        )
        q1_y: float | None = None
        if not found_first_question:
            q1_anchor = next((q for q in questions if q["number"] == 1), None)
            if q1_anchor:
                found_first_question = True
                q1_y = float(q1_anchor["y0"])
        if not found_end_of_paper and END_OF_PAPER_PATTERN.search(page_text):
            found_end_of_paper = True

        # Detect "Instructions" headings and skip from there to the next
        # question on the same page (or to the bottom of the page).
        skip_zones: list[tuple[float, float]] = []
        for line in lines:
            line_text = str(line.get("text", "")).strip()
            if not SECTION_INSTRUCTIONS_PATTERN.search(line_text):
                continue
            # Only match lines where "Instructions" is the main content
            # (headings), not question text that happens to mention the word.
            if len(line_text.split()) > 8:
                continue
            instr_y = float(line["y0"])
            # Find the next question that starts below this heading.
            next_q_y = page.rect.y1
            for q in questions:
                if q["y0"] > instr_y:
                    next_q_y = min(next_q_y, float(q["y0"]))
            skip_zones.append((instr_y, next_q_y))

        is_discontinuous = (
            previous_printed_page_number is not None
            and printed_page_number is not None
            and printed_page_number != previous_printed_page_number + 1
        )
        if not contexts or is_discontinuous:
            sequence_id += 1

        # Merge inline part/subpart anchors (from "Question 3a" style headings)
        # with the standalone anchors detected by dedicated extractors.
        parts = _extract_part_anchors(lines, page.rect, page_number, sequence_id)
        parts.extend(inline_parts)
        subparts = _extract_subpart_anchors(lines, page.rect, page_number, sequence_id)
        subparts.extend(inline_subparts)

        contexts.append(
            {
                "pageNumber": page_number,
                "printedPageNumber": printed_page_number,
                "sequenceId": sequence_id,
                "questions": questions,
                "parts": parts,
                "subparts": subparts,
                "options": _extract_option_anchors(words, page.rect, page_number, sequence_id),
                "extractable": found_first_question and not found_end_of_paper,
                "extractFromY": q1_y,
                "skipZones": skip_zones,
            }
        )
        previous_printed_page_number = printed_page_number

    return contexts


def _extract_page_words(page: fitz.Page) -> list[dict[str, float | str]]:
    native_words = _extract_native_page_words(page)
    if len(native_words) >= 8:
        return native_words

    pixmap = page.get_pixmap(matrix=fitz.Matrix(RASTER_SCALE, RASTER_SCALE), alpha=False)
    image = Image.frombytes("RGB", (pixmap.width, pixmap.height), pixmap.samples)
    return [
        {
            "text": word["text"],
            "confidence": word["confidence"],
            "left": word["left"] / RASTER_SCALE,
            "top": word["top"] / RASTER_SCALE,
            "width": word["width"] / RASTER_SCALE,
            "height": word["height"] / RASTER_SCALE,
        }
        for word in _ocr_words(image)
        if word["text"]
    ]


def _extract_native_page_words(page: fitz.Page) -> list[dict[str, float | str]]:
    words: list[dict[str, float | str]] = []
    for x0, y0, x1, y1, text, *_ in page.get_text("words"):
        cleaned_text = str(text).strip()
        if not cleaned_text:
            continue
        words.append(
            {
                "text": cleaned_text,
                "confidence": 100.0,
                "left": float(x0),
                "top": float(y0),
                "width": float(x1 - x0),
                "height": float(y1 - y0),
            }
        )
    return words


def _group_words_into_lines(words: list[dict[str, float | str]]) -> list[dict[str, float | str]]:
    filtered_words = [
        word
        for word in words
        if str(word.get("text", "")).strip()
        and float(word.get("width", 0)) > 0
        and float(word.get("height", 0)) > 0
    ]
    if not filtered_words:
        return []

    ordered_words = sorted(
        filtered_words,
        key=lambda word: (
            float(word["top"]) + float(word["height"]) / 2.0,
            float(word["left"]),
        ),
    )
    heights = [float(word["height"]) for word in ordered_words]
    median_height = float(np.median(heights)) if heights else 8.0
    tolerance = max(4.0, median_height * 0.7)

    lines: list[list[dict[str, float | str]]] = []
    current_line: list[dict[str, float | str]] = []
    current_center = 0.0

    for word in ordered_words:
        center_y = float(word["top"]) + float(word["height"]) / 2.0
        if not current_line:
            current_line = [word]
            current_center = center_y
            continue

        if abs(center_y - current_center) <= tolerance:
            current_line.append(word)
            current_center = (current_center * (len(current_line) - 1) + center_y) / len(current_line)
            continue

        lines.append(current_line)
        current_line = [word]
        current_center = center_y

    if current_line:
        lines.append(current_line)

    return [_build_line(words_in_line) for words_in_line in lines]


def _build_line(words_in_line: list[dict[str, float | str]]) -> dict[str, float | str]:
    ordered_words = sorted(words_in_line, key=lambda word: float(word["left"]))
    return {
        "text": " ".join(str(word["text"]).strip() for word in ordered_words if str(word["text"]).strip()),
        "x0": min(float(word["left"]) for word in ordered_words),
        "y0": min(float(word["top"]) for word in ordered_words),
        "x1": max(float(word["left"]) + float(word["width"]) for word in ordered_words),
        "y1": max(float(word["top"]) + float(word["height"]) for word in ordered_words),
    }


def _extract_printed_page_number(lines: list[dict[str, float | str]]) -> int | None:
    for line in lines[:4]:
        match = PRINTED_PAGE_PATTERN.search(str(line.get("text", "")))
        if match:
            return int(match.group(1))
    return None


def _extract_question_anchors(
    lines: list[dict[str, float | str]],
    page_rect: fitz.Rect,
    page_number: int,
    sequence_id: int,
) -> list[dict[str, Any]]:
    anchors: list[dict[str, Any]] = []
    inline_parts: list[dict[str, Any]] = []
    inline_subparts: list[dict[str, Any]] = []
    left_margin_limit = page_rect.x0 + page_rect.width * 0.38

    for index, line in enumerate(lines):
        text = str(line["text"]).strip()
        if not text:
            continue
        if "continue" in text.lower():
            continue

        question_match = QUESTION_LINE_PATTERN.search(text)
        if question_match:
            anchors.append(
                {
                    "pageNumber": page_number,
                    "sequenceId": sequence_id,
                    "index": index,
                    "number": int(question_match.group(1)),
                    "x0": float(line["x0"]),
                    "y0": float(line["y0"]),
                }
            )
            # If the question line embeds a part letter (e.g. "Question 3a"),
            # generate an inline part anchor so _find_part_anchor can use it.
            inline_part = (question_match.group(2) or "").lower()
            if inline_part:
                inline_parts.append(
                    {
                        "pageNumber": page_number,
                        "sequenceId": sequence_id,
                        "index": index,
                        "part": inline_part,
                        "x0": float(line["x0"]),
                        "y0": float(line["y0"]),
                    }
                )
            # If it also embeds a roman numeral subpart (e.g. "Question 4bii"),
            # generate an inline subpart anchor.
            inline_subpart = (question_match.group(3) or "").lower()
            if inline_subpart and inline_part:
                inline_subparts.append(
                    {
                        "pageNumber": page_number,
                        "sequenceId": sequence_id,
                        "index": index,
                        "subpart": inline_subpart,
                        "x0": float(line["x0"]),
                        "y0": float(line["y0"]),
                    }
                )
            continue

        if float(line["x0"]) > left_margin_limit:
            continue

        numbered_match = NUMBERED_QUESTION_PATTERN.match(text)
        if numbered_match and len(text.split()) >= 2:
            anchors.append(
                {
                    "pageNumber": page_number,
                    "sequenceId": sequence_id,
                    "index": index,
                    "number": int(numbered_match.group(1)),
                    "x0": float(line["x0"]),
                    "y0": float(line["y0"]),
                }
            )

    return anchors, inline_parts, inline_subparts


def _extract_part_anchors(
    lines: list[dict[str, float | str]],
    page_rect: fitz.Rect,
    page_number: int,
    sequence_id: int,
) -> list[dict[str, Any]]:
    anchors: list[dict[str, Any]] = []
    left_margin_limit = page_rect.x0 + page_rect.width * 0.45

    for index, line in enumerate(lines):
        if float(line["x0"]) > left_margin_limit:
            continue

        text = str(line["text"]).strip()
        if not text:
            continue

        part_match = PART_LINE_PATTERN.match(text)
        if not part_match:
            continue

        part = (part_match.group(1) or part_match.group(2) or "").lower()
        if not part:
            continue

        anchors.append(
            {
                "pageNumber": page_number,
                "sequenceId": sequence_id,
                "index": index,
                "part": part,
                "x0": float(line["x0"]),
                "y0": float(line["y0"]),
            }
        )

    return anchors


def _extract_option_anchors(
    words: list[dict[str, float | str]],
    page_rect: fitz.Rect,
    page_number: int,
    sequence_id: int,
) -> list[dict[str, Any]]:
    """Detect MCQ option markers (A/B/C/D/E) from individual words.

    Works at the word level instead of the line level so that:
    - Bare letters like ``A`` (OCR dropped the period) are recognised.
    - Options side-by-side in a 2×2 grid (merged into one line by the
      line-grouper) are still detected individually.
    - Case errors (``c`` instead of ``C``) are handled.
    """
    anchors: list[dict[str, Any]] = []
    seen_options: set[str] = set()

    for index, word in enumerate(words):
        text = str(word.get("text", "")).strip()
        if not text:
            continue

        match = OPTION_WORD_PATTERN.fullmatch(text)
        if not match:
            continue

        option = match.group(1).upper()

        # Avoid duplicate anchors for the same letter on the same page
        # (OCR may emit the same word twice).
        if option in seen_options:
            continue
        seen_options.add(option)

        anchors.append(
            {
                "pageNumber": page_number,
                "sequenceId": sequence_id,
                "index": index,
                "option": option,
                "x0": float(word["left"]),
                "y0": float(word["top"]),
            }
        )

    return anchors


def _extract_subpart_anchors(
    lines: list[dict[str, float | str]],
    page_rect: fitz.Rect,
    page_number: int,
    sequence_id: int,
) -> list[dict[str, Any]]:
    """Detect Roman numeral sub-part markers (i, ii, iii, iv, …)."""
    anchors: list[dict[str, Any]] = []
    left_margin_limit = page_rect.x0 + page_rect.width * 0.50

    for index, line in enumerate(lines):
        if float(line["x0"]) > left_margin_limit:
            continue

        text = str(line["text"]).strip()
        if not text:
            continue

        subpart_match = SUBPART_LINE_PATTERN.match(text)
        if not subpart_match:
            continue

        subpart = (subpart_match.group(1) or subpart_match.group(2) or "").lower()
        if not subpart:
            continue

        anchors.append(
            {
                "pageNumber": page_number,
                "sequenceId": sequence_id,
                "index": index,
                "subpart": subpart,
                "x0": float(line["x0"]),
                "y0": float(line["y0"]),
            }
        )

    return anchors


def _derive_base_label(
    page_contexts: list[dict[str, Any]],
    page_number: int,
    rect: fitz.Rect,
    kind: str,
) -> str:
    question = _find_question_anchor(page_contexts, page_number, rect)
    if not question:
        return _label_for_kind(kind)

    part = _find_part_anchor(
        page_contexts=page_contexts,
        page_number=page_number,
        question_anchor=question,
        rect=rect,
    )
    if part:
        subpart = _find_subpart_anchor(
            page_contexts=page_contexts,
            page_number=page_number,
            part_anchor=part,
            rect=rect,
        )
        label = f"Q{question['number']}{part['part']}"
        if subpart:
            label += subpart["subpart"]
        return label

    return f"Q{question['number']}"


def _find_question_anchor(
    page_contexts: list[dict[str, Any]],
    page_number: int,
    rect: fitz.Rect,
) -> dict[str, Any] | None:
    page_context = page_contexts[page_number - 1]
    sequence_id = page_context["sequenceId"]
    target_key = _target_position_key(page_number, rect)

    eligible: list[dict[str, Any]] = []
    for context in page_contexts[:page_number]:
        if context["sequenceId"] != sequence_id:
            continue
        for question in context["questions"]:
            if _anchor_position_key(question) <= target_key:
                eligible.append(question)

    if not eligible:
        return None
    return max(eligible, key=_anchor_position_key)


def _find_part_anchor(
    *,
    page_contexts: list[dict[str, Any]],
    page_number: int,
    question_anchor: dict[str, Any],
    rect: fitz.Rect,
) -> dict[str, Any] | None:
    sequence_id = question_anchor["sequenceId"]
    question_key = _anchor_position_key(question_anchor)
    target_key = _target_position_key(page_number, rect)

    eligible_parts: list[dict[str, Any]] = []
    for context in page_contexts[:page_number]:
        if context["sequenceId"] != sequence_id:
            continue
        for part in context["parts"]:
            part_key = _anchor_position_key(part)
            if question_key < part_key <= target_key:
                eligible_parts.append(part)

    if not eligible_parts:
        return None
    return max(eligible_parts, key=_anchor_position_key)


def _find_subpart_anchor(
    *,
    page_contexts: list[dict[str, Any]],
    page_number: int,
    part_anchor: dict[str, Any],
    rect: fitz.Rect,
) -> dict[str, Any] | None:
    """Find the nearest Roman numeral sub-part (i, ii, …) between
    the given part anchor and the image rect."""
    sequence_id = part_anchor["sequenceId"]
    part_key = _anchor_position_key(part_anchor)
    target_key = _target_position_key(page_number, rect)

    eligible: list[dict[str, Any]] = []
    for context in page_contexts[:page_number]:
        if context["sequenceId"] != sequence_id:
            continue
        for subpart in context.get("subparts", []):
            subpart_key = _anchor_position_key(subpart)
            if part_key < subpart_key <= target_key:
                eligible.append(subpart)

    if not eligible:
        return None
    return max(eligible, key=_anchor_position_key)


def _find_option_anchor(
    *,
    page_contexts: list[dict[str, Any]],
    page_number: int,
    question_anchor: dict[str, Any],
    rect: fitz.Rect,
) -> dict[str, Any] | None:
    sequence_id = question_anchor["sequenceId"]
    question_key = _anchor_position_key(question_anchor)
    target_key = _target_position_key(page_number, rect)

    eligible_options: list[dict[str, Any]] = []
    for context in page_contexts[:page_number]:
        if context["sequenceId"] != sequence_id:
            continue
        for option in context["options"]:
            option_key = _anchor_position_key(option)
            if question_key < option_key <= target_key:
                eligible_options.append(option)

    if not eligible_options:
        return None

    # For options on the same page as the image, use nearest-neighbor by
    # Euclidean distance so that 2x2 grid layouts (A/B on top, C/D on bottom)
    # associate each image with the correct option rather than always picking
    # the rightmost one at the same y-level.
    same_page = [opt for opt in eligible_options if opt["pageNumber"] == page_number]
    if same_page:
        return min(
            same_page,
            key=lambda opt: (rect.y0 - opt["y0"]) ** 2 + (rect.x0 - opt["x0"]) ** 2,
        )

    # For options on earlier pages, fall back to the latest in reading order.
    return max(eligible_options, key=_anchor_position_key)


def _anchor_position_key(anchor: dict[str, Any]) -> tuple[int, float, float, int]:
    return (
        int(anchor["pageNumber"]),
        float(anchor["y0"]),
        float(anchor["x0"]),
        int(anchor["index"]),
    )


def _target_position_key(page_number: int, rect: fitz.Rect) -> tuple[int, float, float, float]:
    return (
        page_number,
        rect.y0 + rect.height * 0.5 + 2,
        rect.x0,
        float("inf"),
    )


def _apply_question_labels(items_payload: list[dict[str, Any]], pages_payload: list[dict[str, Any]]) -> None:
    groups: dict[str, list[dict[str, Any]]] = {}
    for item in items_payload:
        label = str(item.get("label", "")).strip()
        if not QUESTION_LABEL_PATTERN.fullmatch(label):
            continue
        groups.setdefault(label, []).append(item)

    for label, group in groups.items():
        ordered_group = sorted(
            group,
            key=lambda item: (
                int(item["pageNumber"]),
                float(item["box"]["top"]),
                float(item["box"]["left"]),
                str(item["id"]),
            ),
        )
        if len(ordered_group) == 1:
            continue

        # Extract the question-number stem (e.g. "Q12b" → "Q12", "Q12" → "Q12")
        # so that MCQ option labels use the question number only.
        question_stem_match = re.match(r"^(Q\d+)", label)
        question_stem = question_stem_match.group(1) if question_stem_match else label

        mcq_count = _detect_mcq_tail(ordered_group)
        if mcq_count > 0:
            # The last `mcq_count` items are MCQ options → A, B, C, …
            stem_items = ordered_group[:-mcq_count]
            option_items = ordered_group[-mcq_count:]

            # Number the stem images (if any) as Q1-1, Q1-2, …
            if len(stem_items) == 1:
                stem_items[0]["label"] = question_stem
            else:
                for index, item in enumerate(stem_items, start=1):
                    item["label"] = f"{question_stem}-{index}"

            # Letter the option images as Q1A, Q1B, …
            for index, item in enumerate(option_items):
                item["label"] = f"{question_stem}{chr(ord('A') + index)}"
        else:
            # Normal numeric suffixes.
            for index, item in enumerate(ordered_group, start=1):
                item["label"] = f"{label}-{index}"

    label_by_id = {str(item["id"]): str(item["label"]) for item in items_payload}
    for page in pages_payload:
        for detection in page["detections"]:
            detection["label"] = label_by_id.get(str(detection["id"]), str(detection["label"]))


def _detect_mcq_tail(ordered_items: list[dict[str, Any]]) -> int:
    """Return how many trailing items look like MCQ option images.

    Heuristic: the last 4 or 5 items in the group are MCQ options when
    they share a similar bounding-box size (width and height each within
    30 % of their median).  This catches the common 2×2 or 1×4 / 1×5
    grid layouts used for MCQ answer choices in exam papers, even when
    OCR-based option-letter detection fails.

    Returns 0 if no MCQ tail is detected.
    """
    total = len(ordered_items)
    for candidate_count in (5, 4):
        if total < candidate_count:
            continue

        tail = ordered_items[-candidate_count:]
        widths = [float(item["box"]["width"]) for item in tail]
        heights = [float(item["box"]["height"]) for item in tail]

        median_w = float(np.median(widths))
        median_h = float(np.median(heights))
        if median_w <= 0 or median_h <= 0:
            continue

        width_ok = all(abs(w - median_w) / median_w <= 0.30 for w in widths)
        height_ok = all(abs(h - median_h) / median_h <= 0.30 for h in heights)

        if width_ok and height_ok:
            return candidate_count

    return 0


def _resolve_manual_label(
    *,
    label_override: str | None,
    existing_labels: list[str],
    base_label: str,
) -> str:
    cleaned_override = str(label_override or "").strip()
    if cleaned_override:
        return cleaned_override
    if not QUESTION_LABEL_PATTERN.fullmatch(base_label):
        return base_label
    return _next_question_label(base_label, existing_labels)


def _next_question_label(base_label: str, existing_labels: list[str]) -> str:
    highest_index = 0
    for label in existing_labels:
        cleaned_label = str(label or "").strip()
        if not cleaned_label:
            continue
        if cleaned_label == base_label:
            highest_index = max(highest_index, 1)
            continue
        match = QUESTION_SUFFIX_PATTERN.fullmatch(cleaned_label)
        if match and match.group(1) == base_label:
            highest_index = max(highest_index, int(match.group(2)))

    if highest_index == 0:
        return base_label
    return f"{base_label}-{highest_index + 1}"


def _extract_table_rows_for_rect(page: fitz.Page, rect: fitz.Rect) -> list[list[str | None]] | None:
    with contextlib.redirect_stdout(io.StringIO()):
        tables = page.find_tables()

    for table in tables.tables:
        table_rect = _clamp_rect(fitz.Rect(table.bbox), page.rect)
        if _rect_overlap_ratio(table_rect, rect) >= 0.65:
            return table.extract()
    return None


def _ocr_words(image: Image.Image) -> list[dict[str, Any]]:
    data = pytesseract.image_to_data(
        image,
        output_type=pytesseract.Output.DICT,
        config="--psm 11",
    )
    words: list[dict[str, Any]] = []
    for index, text in enumerate(data["text"]):
        cleaned_text = text.strip()
        confidence_text = data["conf"][index]
        confidence = float(confidence_text) if confidence_text != "-1" else -1.0
        words.append(
            {
                "text": cleaned_text,
                "confidence": confidence,
                "left": int(data["left"][index]),
                "top": int(data["top"][index]),
                "width": int(data["width"][index]),
                "height": int(data["height"][index]),
            }
        )
    return words


def _classify_crop(crop: Image.Image, words: list[dict[str, Any]]) -> tuple[str, float]:
    grayscale = np.array(crop.convert("L"))
    threshold = min(230, max(140, _otsu_threshold(grayscale) + 25))
    mask = grayscale < threshold

    horizontal_lines = _line_centers(mask.mean(axis=1) > 0.4)
    vertical_lines = _line_centers(mask.mean(axis=0) > 0.4)
    x_grid = len(vertical_lines) >= 5 and _spacing_cv(vertical_lines) <= 0.18
    y_grid = len(horizontal_lines) >= 4 and _spacing_cv(horizontal_lines) <= 0.18

    strong_vertical = mask.mean(axis=0)
    strong_horizontal = mask.mean(axis=1)
    vertical_axis = (
        strong_vertical.size > 0
        and strong_vertical.max() > 0.55
        and 0.05 <= int(strong_vertical.argmax()) / max(mask.shape[1], 1) <= 0.6
    )
    horizontal_axis = (
        strong_horizontal.size > 0
        and strong_horizontal.max() > 0.55
        and 0.25 <= int(strong_horizontal.argmax()) / max(mask.shape[0], 1) <= 0.85
    )

    confident_words = [word for word in words if word["confidence"] >= TEXT_CONFIDENCE and word["text"]]
    word_count = len(confident_words)
    text_area = sum(word["width"] * word["height"] for word in confident_words)
    total_area = max(mask.shape[0] * mask.shape[1], 1)
    text_density = text_area / total_area
    ink_density = float(mask.mean())
    contrast = float(np.std(grayscale) / 255.0)

    # Detect coordinate/axis labels (x, y, O, and numbered tick marks).
    axis_label_words = {"x", "y", "o", "0"}
    axis_word_count = sum(
        1 for w in confident_words
        if w["text"].lower() in axis_label_words or w["text"].lstrip("-").isdigit()
    )
    has_axis_labels = axis_word_count >= 3
    # If most of the words are numbers / axis markers, this is a coordinate
    # diagram rather than a table — tables contain prose or mixed content.
    axis_word_ratio = axis_word_count / max(word_count, 1)
    looks_like_axes = has_axis_labels and axis_word_ratio >= 0.5

    # Detect equation text (contains "=") — strong graph/diagram indicator.
    # VCE exam tables contain raw values, not equations like "y = f(x)".
    has_equation_text = any("=" in w["text"] for w in confident_words)

    # Estimate fraction of ink that is non-text (curves, shading, drawn axes).
    # Graphs/diagrams have substantial graphical ink from curves and shading;
    # tables are mostly text with thin separating lines.
    text_region = np.zeros(mask.shape, dtype=bool)
    for w in confident_words:
        r0 = max(0, w["top"])
        r1 = min(mask.shape[0], w["top"] + w["height"])
        c0 = max(0, w["left"])
        c1 = min(mask.shape[1], w["left"] + w["width"])
        text_region[r0:r1, c0:c1] = True
    graphical_ink = mask & ~text_region
    graphical_ink_ratio = float(graphical_ink.sum()) / max(float(mask.sum()), 1)
    has_heavy_graphics = graphical_ink_ratio > 0.5 and ink_density > 0.04

    # Coordinate axes, axis labels, equation text, or heavy graphical ink
    # → always a diagram, never a table.
    if (vertical_axis or horizontal_axis
            or (has_axis_labels and (len(vertical_lines) >= 1 or len(horizontal_lines) >= 1))
            or has_equation_text
            or has_heavy_graphics):
        return "diagram", 0.9
    if x_grid and y_grid and not looks_like_axes and text_density >= 0.04 and _words_fill_grid(confident_words, mask.shape):
        return "table", 0.92
    if x_grid and y_grid:
        return "diagram", 0.9
    if not looks_like_axes and text_density >= 0.04 and word_count >= 12 and (len(horizontal_lines) >= 3 or len(vertical_lines) >= 3) and _words_fill_grid(confident_words, mask.shape):
        return "table", 0.76
    if ink_density <= 0.18 and contrast <= 0.28:
        return "diagram", 0.74
    if contrast >= 0.28:
        return "image", 0.72
    return "diagram", 0.62


def _words_fill_grid(words: list[dict[str, Any]], shape: tuple[int, ...]) -> bool:
    """Return True when words fill interior cells of the image.

    A real table has text **inside** the grid, not just along the edges.
    Coordinate diagrams only have labels along the axes (edges), so we
    require words in interior cells of a 3×3 grid to distinguish them.
    """
    if len(words) < 6:
        return False
    height, width = shape[:2]
    if width <= 0 or height <= 0:
        return False

    interior_words = 0
    for word in words:
        col = min(int(word["left"] / (width / 3)), 2)
        row = min(int(word["top"] / (height / 3)), 2)
        # Interior = not on an edge row/column of the 3×3 grid
        if row == 1 and col == 1:
            interior_words += 1

    # A real table must have multiple words in the centre region.
    return interior_words >= 3


def _otsu_threshold(grayscale: np.ndarray) -> int:
    histogram = np.bincount(grayscale.ravel(), minlength=256).astype(np.float64)
    total = grayscale.size
    sum_total = np.dot(np.arange(256), histogram)
    sum_background = 0.0
    weight_background = 0.0
    maximum_variance = -1.0
    threshold = 180

    for value in range(256):
        weight_background += histogram[value]
        if weight_background == 0:
            continue

        weight_foreground = total - weight_background
        if weight_foreground == 0:
            break

        sum_background += value * histogram[value]
        mean_background = sum_background / weight_background
        mean_foreground = (sum_total - sum_background) / weight_foreground
        variance = weight_background * weight_foreground * (mean_background - mean_foreground) ** 2

        if variance > maximum_variance:
            maximum_variance = variance
            threshold = value

    return int(threshold)


def _line_centers(flags: np.ndarray) -> list[int]:
    centers: list[int] = []
    start = None
    for index, value in enumerate(flags.tolist()):
        if value and start is None:
            start = index
        elif not value and start is not None:
            centers.append((start + index - 1) // 2)
            start = None
    if start is not None:
        centers.append((start + len(flags) - 1) // 2)
    return centers


def _spacing_cv(centers: list[int]) -> float:
    if len(centers) < 3:
        return 1.0
    spacings = np.diff(centers)
    mean_spacing = float(np.mean(spacings))
    if mean_spacing == 0:
        return 1.0
    return float(np.std(spacings) / mean_spacing)


def _candidate_priority(candidate: dict[str, Any]) -> tuple[int, float]:
    priority_by_source = {
        "native-table": 5,
        "raster-segmentation": 3,
    }
    return priority_by_source.get(candidate["source"], 0), float(candidate["confidence"])


def _rect_overlap_ratio(first: fitz.Rect, second: fitz.Rect) -> float:
    intersection = first & second
    if intersection.is_empty:
        return 0.0
    smaller_area = min(_rect_area(first), _rect_area(second))
    if smaller_area <= 0:
        return 0.0
    return _rect_area(intersection) / smaller_area


def _normalized_box(rect: fitz.Rect, page_rect: fitz.Rect) -> dict[str, float]:
    width = max(page_rect.width, 1)
    height = max(page_rect.height, 1)
    return {
        "left": round((rect.x0 - page_rect.x0) / width, 4),
        "top": round((rect.y0 - page_rect.y0) / height, 4),
        "width": round(rect.width / width, 4),
        "height": round(rect.height / height, 4),
    }


def _rect_from_normalized_box(box: dict[str, float], page_rect: fitz.Rect) -> fitz.Rect:
    left = float(box.get("left", 0))
    top = float(box.get("top", 0))
    width = float(box.get("width", 0))
    height = float(box.get("height", 0))

    x0 = page_rect.x0 + left * page_rect.width
    y0 = page_rect.y0 + top * page_rect.height
    x1 = page_rect.x0 + (left + width) * page_rect.width
    y1 = page_rect.y0 + (top + height) * page_rect.height
    return fitz.Rect(x0, y0, x1, y1)


def _looks_like_sidebar(rect: fitz.Rect, page_rect: fitz.Rect) -> bool:
    return _looks_like_sidebar_pixels(
        (rect.x0, rect.y0, rect.x1, rect.y1),
        page_rect.width,
        page_rect.height,
    )


def _looks_like_sidebar_pixels(
    bounds: tuple[float, float, float, float],
    width: float,
    height: float,
) -> bool:
    x0, y0, x1, y1 = bounds
    region_width = max(x1 - x0, 1)
    region_height = max(y1 - y0, 1)
    return (
        region_width / max(width, 1) <= EDGE_SIDEBAR_WIDTH_RATIO
        and region_height / max(height, 1) >= EDGE_SIDEBAR_HEIGHT_RATIO
        and (x0 <= width * 0.08 or x1 >= width * 0.82)
    )


def _clamp_rect(rect: fitz.Rect, page_rect: fitz.Rect) -> fitz.Rect:
    x0 = min(max(rect.x0, page_rect.x0), page_rect.x1)
    y0 = min(max(rect.y0, page_rect.y0), page_rect.y1)
    x1 = min(max(rect.x1, page_rect.x0), page_rect.x1)
    y1 = min(max(rect.y1, page_rect.y0), page_rect.y1)
    return fitz.Rect(x0, y0, x1, y1)
