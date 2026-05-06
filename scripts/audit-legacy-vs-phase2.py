#!/usr/bin/env python3
"""
Audit the 1st Generated Question Set (the legacy 1,575-item set built from
scripts/output/qset-*.json) against the standards/requirements that are
enforced by `scripts/seed-phase2.ts validateItem()` for the 1st Generated
Exam Set.

Rules enforced (mirroring `seed-phase2.ts`):
 1. Required fields per type; difficulty in {EASY, MEDIUM, HARD}.
 2. Marks ranges:
       MCQ = 1
       SHORT_ANSWER ∈ {1, 2, 3}
       EXTENDED_ANSWER ∈ [4..8]
       EXTENDED_RESPONSE ∈ [9..21]
 3. MCQ: 4 options, `**Answer: X**` marker, stated answer matches `correctOption`,
       no thinking-out-loud in solution.
 4. SHORT_ANSWER: must NOT have multi-part structure (no `**a.**` headers).
 5. EXTENDED_ANSWER / EXTENDED_RESPONSE: ≥2 part headers (`**a.**`, `**b.**`),
       part-mark sum equals item.marks, sub-part marks sum to parent.
 6. No "thinking-out-loud" phrases in any solution.
 7. No chained equalities in $$...$$.
 8. LaTeX delimiter balance ($, $$).
 9. Step-header marks (`*Step k (m mark[s]):*`) sum to item.marks for SA, or to
    each part's marks for EA/ER.
10. MCQ solution must end with `**Answer: X**` marker.

Output: prints summary + writes scripts/output/legacy-audit-report.json.
"""

import json
import os
import re
import sys
from pathlib import Path
from collections import defaultdict

OUT_DIR = Path(__file__).parent / "output"
FILES = sorted(OUT_DIR.glob("qset-*.json"))

# ──────────────────────────────────────────────────────────────────────────────
# Patterns
# ──────────────────────────────────────────────────────────────────────────────

THINKING_PATTERNS = [
    (re.compile(r"\bWait[,\s]", re.I), "wait"),
    (re.compile(r"\brecompute", re.I), "recompute"),
    (re.compile(r"\bre-?check", re.I), "re-check"),
    (re.compile(r"\bre-?examine", re.I), "re-examine"),
    (re.compile(r"intended answer", re.I), "intended answer"),
    (re.compile(r"\(assume corrected", re.I), "assume corrected"),
    (re.compile(r"hmm[,\s]", re.I), "hmm"),
    (re.compile(r"\bretry with", re.I), "retry with"),
    (re.compile(r"let me (?:re-?|double-?)check", re.I), "let me check"),
    (re.compile(r"assume intended", re.I), "assume intended"),
    (re.compile(r"\bactually,", re.I), "actually,"),
    (re.compile(r"re-?read", re.I), "re-read"),
    (re.compile(r"something's weird", re.I), "something's weird"),
    (re.compile(r"let me think", re.I), "let me think"),
    (re.compile(r"\(Or\b.*check", re.I), "(or...check)"),
]

PART_HEADER = re.compile(r"^\s*\*\*([a-z])(?:\.[ivx]+)?\.\s*\*\*", re.M | re.I)
PART_HEADER_WITH_MARKS = re.compile(
    r"\*\*([a-z])(?:\.([ivx]+))?\.\s*\((\d+)\s*marks?\)\*\*", re.I
)
SUBPART_HEADER_WITH_MARKS = re.compile(
    r"\*\*([a-z])\.([ivx]+)\.\s*\((\d+)\s*marks?\)\*\*", re.I
)
STEP_HEADER = re.compile(r"\*+\s*Step\s+\d+\s*\((\d+)\s*marks?\)", re.I)
ANSWER_MARKER = re.compile(r"\*\*Answer:\s*([A-D])\*\*")

# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────

def strip_images(text: str) -> str:
    """Remove markdown image tags (very large base64 SVGs) for cleaner scanning."""
    return re.sub(r"!\[[^\]]*\]\([^)]*\)", "", text or "")


def latex_balance(text: str) -> dict:
    """Return inline-$ count parity and block-$$ pair parity (after escaping \\$)."""
    # Strip block first to count inline accurately
    no_escape = re.sub(r"\\\$", "", text or "")
    no_block = re.sub(r"\$\$", "", no_escape)
    inline = no_block.count("$")
    block = (text or "").count("$$")
    return {
        "inline_odd": inline % 2 != 0,
        "block_odd": block % 2 != 0,
        "inline_count": inline,
        "block_count": block,
    }


def chained_equalities(text: str) -> list:
    """Return list of $$ blocks containing 2+ top-level equals signs (chained)."""
    findings = []
    for m in re.finditer(r"\$\$([\s\S]*?)\$\$", text or ""):
        inside = m.group(1)
        depth = 0
        eqs = 0
        for i, c in enumerate(inside):
            if c in "({[":
                depth += 1
            elif c in ")}]":
                depth -= 1
            elif c == "=" and depth == 0:
                # Skip => and \=
                if i + 1 < len(inside) and inside[i + 1] == ">":
                    continue
                if i > 0 and inside[i - 1] == "\\":
                    continue
                eqs += 1
        if eqs >= 2 and not re.search(
            r",|\\\\|\\implies|\\Rightarrow|\\iff|\\Leftrightarrow|\\quad|\\qquad",
            inside,
        ):
            findings.append(inside[:80])
    return findings


def parse_legacy_parts(content: str, solution: str):
    """
    Legacy EA/ER items embed parts in the markdown like:
        **a.** ...question text... (2 marks)
        **b.** ... (1 mark)
        **e.** ...preamble for parent...
            **i.** ... (1 mark)
            **ii.** ... (2 marks)
    Sub-parts are roman numerals scoped to the most recently opened parent.
    A parent that has sub-parts has its effective marks = sum(sub-part marks),
    and may carry no parenthesised mark count of its own.

    Return: ( {label: effective_marks_int}, {parent_label: {subLabel: marks}} )
    """
    parts: dict[str, int] = {}
    sub_parts: dict[str, dict[str, int]] = defaultdict(dict)

    # Tokenise: find every `**LABEL.**` header in document order, then classify.
    # A label is classified as roman (sub-part) if:
    #   - It is multi-character roman (ii, iii, iv, vi, vii, viii, ix, x), OR
    #   - It is single-char i/v/x AND a top-level alpha part has already opened.
    # Otherwise a single-letter a-z label is a top-level part.
    HEADER_RE = re.compile(r"\*\*([a-z]+)\.\*\*", re.I)
    MARKS_RE = re.compile(r"\((\d+)\s*marks?\)", re.I)
    UNAMBIGUOUS_ROMAN = {"ii", "iii", "iv", "vi", "vii", "viii", "ix", "x",
                          "xi", "xii"}

    matches = list(HEADER_RE.finditer(content))
    if not matches:
        return parts, dict(sub_parts)

    current_parent: str | None = None
    for idx, m in enumerate(matches):
        next_start = matches[idx + 1].start() if idx + 1 < len(matches) else len(content)
        segment = content[m.end():next_start]
        marks_match = MARKS_RE.search(segment)
        marks_val = int(marks_match.group(1)) if marks_match else None

        label = m.group(1).lower()
        is_roman = (
            label in UNAMBIGUOUS_ROMAN
            or (label in {"i", "v", "x"} and current_parent is not None)
        )

        if not is_roman and len(label) == 1:
            current_parent = label
            if marks_val is not None:
                parts[label] = marks_val
            else:
                parts.setdefault(label, 0)
        else:
            if current_parent is None:
                current_parent = "?"
            if marks_val is not None:
                sub_parts[current_parent][label] = marks_val

    # Roll sub-parts up: parent's effective marks = sum of children if children exist.
    for parent, subs in sub_parts.items():
        if parent in parts and subs:
            parts[parent] = sum(subs.values())
        elif subs:
            parts[parent] = sum(subs.values())

    return parts, dict(sub_parts)


def find_thinking(text: str):
    text = text or ""
    for rx, name in THINKING_PATTERNS:
        m = rx.search(text)
        if m:
            return name, m.group(0)
    return None, None


# ──────────────────────────────────────────────────────────────────────────────
# Item validators (mirrors seed-phase2.ts validateItem)
# ──────────────────────────────────────────────────────────────────────────────

def validate_mcq(item, where, errs):
    """Phase 2 MCQ rules."""
    diff = item.get("difficulty")
    if diff not in {"EASY", "MEDIUM", "HARD"}:
        errs.append((where, "difficulty", f"bad difficulty {diff!r}"))
    marks = item.get("marks")
    if marks != 1:
        errs.append((where, "mcq-marks", f"MCQ marks should be 1, got {marks}"))
    for key in ("optionA", "optionB", "optionC", "optionD"):
        if not item.get(key):
            errs.append((where, "mcq-options", f"missing {key}"))
    co = item.get("correctOption")
    if co not in {"A", "B", "C", "D"}:
        errs.append((where, "mcq-options", f"bad correctOption {co!r}"))
    sol = item.get("solutionContent") or ""
    if not sol:
        errs.append((where, "mcq-solution-empty", "missing solutionContent"))
    else:
        m = ANSWER_MARKER.search(sol)
        if not m:
            errs.append((where, "mcq-missing-answer", "missing **Answer: X**"))
        elif m.group(1) != co:
            errs.append(
                (where, "mcq-answer-mismatch",
                 f"stated {m.group(1)} but correctOption={co}")
            )
        thinking, snippet = find_thinking(sol)
        if thinking:
            errs.append((where, "thinking-out-loud", f"({thinking}) {snippet!r}"))


def validate_sa(item, where, errs):
    """Phase 2 SHORT_ANSWER rules."""
    diff = item.get("difficulty")
    if diff not in {"EASY", "MEDIUM", "HARD"}:
        errs.append((where, "difficulty", f"bad difficulty {diff!r}"))
    marks = item.get("marks")
    if marks not in {1, 2, 3}:
        errs.append((where, "sa-marks-out-of-range",
                     f"SA marks should be 1/2/3, got {marks}"))
    if not item.get("content"):
        errs.append((where, "sa-content-empty", "missing content"))
    sol = item.get("solutionContent") or ""
    if not sol.strip():
        errs.append((where, "sa-solution-empty", "missing solutionContent"))
    # Steps should sum to marks
    step_marks = [int(m.group(1)) for m in STEP_HEADER.finditer(sol)]
    if step_marks and sum(step_marks) != marks:
        errs.append((where, "sa-step-marks-mismatch",
                     f"steps sum to {sum(step_marks)}, marks {marks}"))
    # SA must NOT have parts (single-part)
    parts, _ = parse_legacy_parts(item.get("content", ""), sol)
    if len(parts) >= 2:
        errs.append((where, "sa-has-parts",
                     f"SA has {len(parts)} part headers; should be single-part"))
    thinking, snippet = find_thinking(sol)
    if thinking:
        errs.append((where, "thinking-out-loud", f"({thinking}) {snippet!r}"))


def validate_ea_or_er(item, where, errs, kind: str):
    """Phase 2 EXTENDED_ANSWER / EXTENDED_RESPONSE rules."""
    diff = item.get("difficulty")
    if diff not in {"EASY", "MEDIUM", "HARD"}:
        errs.append((where, "difficulty", f"bad difficulty {diff!r}"))
    marks = item.get("marks", 0)
    if kind == "EA" and not (4 <= marks <= 8):
        errs.append((where, "ea-marks-out-of-range",
                     f"EA marks should be 4-8, got {marks}"))
    if kind == "ER" and not (9 <= marks <= 21):
        errs.append((where, "er-marks-out-of-range",
                     f"ER marks should be 9-21, got {marks}"))
    content = item.get("content") or ""
    sol = item.get("solutionContent") or ""
    if not content.strip():
        errs.append((where, f"{kind.lower()}-content-empty", "missing content"))
    if not sol.strip():
        errs.append((where, f"{kind.lower()}-solution-empty", "missing solutionContent"))
    parts, sub_parts = parse_legacy_parts(content, sol)
    if len(parts) < 2:
        errs.append(
            (where, f"{kind.lower()}-too-few-parts",
             f"{kind} needs >=2 parts, found {len(parts)}")
        )
    else:
        part_sum = sum(parts.values())
        if part_sum != marks:
            errs.append(
                (where, f"{kind.lower()}-part-marks-mismatch",
                 f"parts {parts} sum to {part_sum}, item marks {marks}")
            )
        for parent, subs in sub_parts.items():
            if parent in parts:
                sub_sum = sum(subs.values())
                if sub_sum != parts[parent]:
                    errs.append(
                        (where, f"{kind.lower()}-subpart-marks-mismatch",
                         f"part {parent} has subparts {subs} (sum={sub_sum}) "
                         f"but part marks={parts[parent]}")
                    )
    thinking, snippet = find_thinking(sol)
    if thinking:
        errs.append((where, "thinking-out-loud", f"({thinking}) {snippet!r}"))


def shared_validation(item, where, errs):
    """LaTeX balance + chained equalities, applied to all types."""
    all_text = "\n".join(
        strip_images(t) for t in (
            item.get("content") or "",
            item.get("solutionContent") or "",
            item.get("optionA") or "",
            item.get("optionB") or "",
            item.get("optionC") or "",
            item.get("optionD") or "",
        )
    )
    bal = latex_balance(all_text)
    if bal["inline_odd"]:
        errs.append((where, "latex-odd-inline-dollars",
                     f"inline $ count={bal['inline_count']}"))
    if bal["block_odd"]:
        errs.append((where, "latex-odd-block-dollars",
                     f"$$ count={bal['block_count']}"))
    chains = chained_equalities(all_text)
    for c in chains:
        errs.append((where, "chained-equality", c))


# ──────────────────────────────────────────────────────────────────────────────
# Run
# ──────────────────────────────────────────────────────────────────────────────

def main():
    findings = []  # list of (file, qset_bucket, idx, category, detail)
    counts = {
        "files": 0, "mcq": 0, "shortAnswer": 0,
        "extendedAnswer": 0, "extendedResponse": 0,
    }
    for path in FILES:
        counts["files"] += 1
        with open(path) as f:
            data = json.load(f)
        base = path.name
        for bucket, kind in [
            ("mcq", "MCQ"),
            ("shortAnswer", "SHORT_ANSWER"),
            ("extendedAnswer", "EXTENDED_ANSWER"),
            ("extendedResponse", "EXTENDED_RESPONSE"),
        ]:
            arr = data.get(bucket) or []
            counts[bucket] += len(arr)
            for i, item in enumerate(arr):
                where = f"{base}[{bucket}#{i}]"
                errs = []
                if kind == "MCQ":
                    validate_mcq(item, where, errs)
                elif kind == "SHORT_ANSWER":
                    validate_sa(item, where, errs)
                elif kind == "EXTENDED_ANSWER":
                    validate_ea_or_er(item, where, errs, "EA")
                elif kind == "EXTENDED_RESPONSE":
                    validate_ea_or_er(item, where, errs, "ER")
                shared_validation(item, where, errs)
                for w, cat, detail in errs:
                    findings.append({
                        "file": base, "bucket": bucket, "idx": i,
                        "category": cat, "detail": detail,
                    })

    # ── Report
    print(f"== Legacy 1st Generated Question Set audit ==")
    print(f"Files scanned : {counts['files']}")
    print(f"  MCQ items   : {counts['mcq']}")
    print(f"  SA items    : {counts['shortAnswer']}")
    print(f"  EA items    : {counts['extendedAnswer']}")
    print(f"  ER items    : {counts['extendedResponse']}")
    total_items = sum(counts[k] for k in ("mcq","shortAnswer","extendedAnswer","extendedResponse"))
    print(f"  TOTAL       : {total_items}")
    print()

    by_cat = defaultdict(list)
    for f in findings:
        by_cat[f["category"]].append(f)

    print(f"Total findings: {len(findings)}")
    if not findings:
        print("All items pass the Phase 2 standards. No deviations found.")
    print()
    for cat, items in sorted(by_cat.items(), key=lambda kv: -len(kv[1])):
        print(f"── {cat} ({len(items)}) ──")
        for f in items[:8]:
            print(f"   {f['file']}::{f['bucket']}#{f['idx']}  —  {f['detail']}")
        if len(items) > 8:
            print(f"   … +{len(items) - 8} more")
        print()

    out_path = OUT_DIR / "legacy-audit-report.json"
    out_path.write_text(json.dumps({
        "counts": counts, "findings": findings,
        "totals_by_category": {k: len(v) for k, v in by_cat.items()},
    }, indent=2))
    print(f"Full JSON report: {out_path}")


if __name__ == "__main__":
    main()
