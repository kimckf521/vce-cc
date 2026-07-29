"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { CONTENT_HEIGHT_PX, PAGE_WIDTH_PX } from "./page-geometry";

/**
 * Page-by-page print preview: carves the continuous PaperSheet into discrete
 * A4 page cards on screen, so teachers see real page boundaries before
 * printing. Print output is untouched — @page still does the real pagination.
 *
 * IMPLEMENTATION CHOICE (of the two shapes the design allows): the pages are
 * inert DOM CLONES of the one React-rendered PaperSheet, not React re-renders
 * of chunks. Why:
 *   - PaperSheet stays the single source of markup, byte-identical for print:
 *     the continuous sheet never moves, never restructures, and is the ONLY
 *     thing visible in @media print. Re-rendering chunks per page via React
 *     would have required flattening PaperSheet's nested wrappers (sections,
 *     .subparts, the guide-solution rail) and re-deriving their margins —
 *     exactly the kind of restructuring that risks print regressions.
 *   - React hydration stays sane: React never manages the cloned region. The
 *     measurer and page hosts are rendered as empty divs that this component
 *     fills imperatively; reconciliation leaves unknown DOM children alone.
 *   - KaTeX renders once. MathContent output is static markup + CSS, so
 *     clones are pixel-identical without re-running KaTeX per page.
 *
 * Pipeline (see build()): clone the sheet into a hidden fixed-position
 * measurer at exactly A4 width (174mm content box) → measure every
 * [data-chunk] block → greedily pack chunks into 255mm-tall pages → build
 * page cards from chunk clones, reconstructing each chunk's wrapper chain
 * (question section, .subparts indent, guide-solution rail) per page.
 *
 * Timing: first build waits for document.fonts.ready + double rAF so KaTeX
 * fonts have settled; a ResizeObserver on the sheet re-paginates if late
 * layout shifts change its height. Until the first build lands (and forever
 * if it throws), the continuous sheet shows as before — graceful fallback,
 * no blank flash. The swap itself is committed with flushSync inside one
 * task, so there is no frame showing both (or neither) representations.
 *
 * ACCURACY: this is an approximation of the browser's print fragmentation.
 * Chunk packing models Chrome's spec behaviour of truncating margins that
 * adjoin an unforced page break (the first chunk on each page gets its top
 * margin zeroed). Marking-guide part solutions are treated as atomic even
 * though print may break inside them — an over-tall chunk gets its own page
 * that grows beyond A4, with a caption saying print may split it.
 */

type Mode = "measuring" | "paged" | "fallback";

/** Tolerance for sub-pixel measurement noise when packing pages. */
const EPS = 0.5;
/** Debounce for ResizeObserver-triggered re-pagination. */
const REBUILD_DEBOUNCE_MS = 150;

interface MeasuredChunk {
  el: HTMLElement;
  top: number;
  height: number;
}

interface PageSpec {
  chunks: MeasuredChunk[];
  /** True when a chunk alone exceeds the page budget — the card grows. */
  overflow: boolean;
}

const isOversize = (c: MeasuredChunk) => c.height > CONTENT_HEIGHT_PX + EPS;

/**
 * Collect the chunk partition and enforce the data-chunk contract from
 * PaperSheet.tsx: no nesting, and no visible content outside a chunk (which
 * would silently vanish from the preview). Violations throw → fallback.
 */
function collectChunks(root: HTMLElement): HTMLElement[] {
  const chunks = Array.from(root.querySelectorAll<HTMLElement>("[data-chunk]"));
  if (chunks.length === 0) {
    throw new Error("print-preview: sheet has no data-chunk blocks");
  }
  for (const chunk of chunks) {
    if (chunk.parentElement?.closest("[data-chunk]")) {
      throw new Error("print-preview: nested data-chunk");
    }
  }
  assertCovered(root);
  return chunks;
}

function assertCovered(el: HTMLElement): void {
  // Bare text nodes are invisible to `.children`/querySelector but very much
  // visible on the sheet — and renderPages only ever clones [data-chunk]
  // elements, so uncovered text would silently vanish from the preview.
  for (const node of Array.from(el.childNodes)) {
    if (
      node.nodeType === Node.TEXT_NODE &&
      (node.textContent ?? "").trim() !== ""
    ) {
      throw new Error(
        `print-preview: bare text outside any data-chunk ("${(
          node.textContent ?? ""
        )
          .trim()
          .slice(0, 40)}")`
      );
    }
  }
  for (const child of Array.from(el.children) as HTMLElement[]) {
    if (child.hasAttribute("data-chunk")) continue;
    if (child.querySelector("[data-chunk]")) {
      // Wrapper around chunks — recurse to vet its other children.
      assertCovered(child);
      continue;
    }
    if (child.offsetHeight > 0 || (child.textContent ?? "").trim() !== "") {
      throw new Error(
        `print-preview: content outside any data-chunk (<${child.tagName.toLowerCase()} class="${child.className}">)`
      );
    }
  }
}

/** Positions relative to the (untransformed, off-screen) measurer. */
function measureChunks(
  chunks: HTMLElement[],
  within: HTMLElement
): MeasuredChunk[] {
  const origin = within.getBoundingClientRect().top;
  return chunks.map((el) => {
    const rect = el.getBoundingClientRect();
    return { el, top: rect.top - origin, height: rect.height };
  });
}

/**
 * Greedy packing. A chunk's cost is its height plus the flow gap separating
 * it from the previous chunk (which captures collapsed CSS margins); the
 * first chunk on a page pays no gap — mirroring print, where margins
 * adjoining an unforced break are truncated. An over-tall chunk always lands
 * alone on its own (growing) page: the previous page can never fit it, and
 * nothing more fits after it.
 */
function packPages(items: MeasuredChunk[]): PageSpec[] {
  const pages: PageSpec[] = [];
  let current: MeasuredChunk[] = [];
  let used = 0;
  let prevBottom = 0;
  for (const item of items) {
    const gap = current.length > 0 ? Math.max(0, item.top - prevBottom) : 0;
    const needed = gap + item.height;
    if (current.length > 0 && used + needed > CONTENT_HEIGHT_PX + EPS) {
      pages.push({ chunks: current, overflow: current.some(isOversize) });
      current = [item];
      used = item.height;
    } else {
      current.push(item);
      used += needed;
    }
    prevBottom = item.top + item.height;
  }
  if (current.length > 0) {
    pages.push({ chunks: current, overflow: current.some(isOversize) });
  }
  return pages;
}

/**
 * Deep-clone one chunk into a page, first rebuilding its ancestor wrappers
 * (shallow clones) so per-wrapper styling — question-block spacing, .subparts
 * indent, .guide-question sizing, the guide-solution border rail — carries
 * over. Consecutive chunks sharing a wrapper share its reconstruction, so a
 * question that continues onto a page keeps one section, not one per chunk.
 */
function appendChunkClone(
  chunk: HTMLElement,
  pageContent: HTMLElement,
  sheetRoot: HTMLElement,
  uidOf: (el: Element) => string
): void {
  const chain: HTMLElement[] = [];
  let ancestor = chunk.parentElement;
  while (ancestor && ancestor !== sheetRoot) {
    chain.unshift(ancestor);
    ancestor = ancestor.parentElement;
  }
  if (ancestor !== sheetRoot) {
    throw new Error("print-preview: chunk is not inside the sheet");
  }
  let host = pageContent;
  for (const anc of chain) {
    const uid = uidOf(anc);
    const last = host.lastElementChild as HTMLElement | null;
    if (last && last.getAttribute("data-pp-uid") === uid) {
      host = last;
      continue;
    }
    const shallow = anc.cloneNode(false) as HTMLElement;
    shallow.setAttribute("data-pp-uid", uid);
    host.appendChild(shallow);
    host = shallow;
  }
  host.appendChild(chunk.cloneNode(true));
}

/**
 * A first child's top margin collapses with `el`'s own (escaping `el`'s box
 * entirely) only when `el` is a plain in-flow block with nothing — border,
 * padding, a formatting context — separating the two margins.
 */
function marginCanCollapseThrough(el: HTMLElement): boolean {
  const cs = getComputedStyle(el);
  return (
    cs.display === "block" &&
    cs.overflowY === "visible" &&
    parseFloat(cs.borderTopWidth) === 0 &&
    parseFloat(cs.paddingTop) === 0
  );
}

/**
 * Zero the top margins down the first chunk's wrapper chain, mirroring the
 * print engine truncating margins after an unforced break (content starts at
 * the top margin line, exactly as on paper). Margins can also collapse
 * THROUGH the border/padding-less chunk from its leading descendants (e.g. a
 * guide chunk whose first child is a .guide-solution-heading with margin-top
 * 10px) — print truncates those at the break too, and the packer's budget
 * never included them — so keep zeroing down the first-child chain while
 * collapse-through is possible. Needs the page DOM attached: computed style.
 */
function zeroLeadingMargins(pageContent: HTMLElement): void {
  let node = pageContent.firstElementChild as HTMLElement | null;
  while (node) {
    node.style.marginTop = "0";
    if (!node.hasAttribute("data-pp-uid")) break; // reached the chunk itself
    node = node.firstElementChild as HTMLElement | null;
  }
  while (node && marginCanCollapseThrough(node)) {
    node = node.firstElementChild as HTMLElement | null;
    if (node) node.style.marginTop = "0";
  }
}

/** Build the page-card DOM (inert clones, outside React) into the host. */
function renderPages(
  pages: PageSpec[],
  host: HTMLElement,
  sheetRoot: HTMLElement
): void {
  const uids = new WeakMap<Element, string>();
  let uidSeq = 0;
  const uidOf = (el: Element): string => {
    let id = uids.get(el);
    if (id === undefined) {
      id = String(++uidSeq);
      uids.set(el, id);
    }
    return id;
  };

  const scale = document.createElement("div");
  scale.className = "paper-pages-scale";
  const total = pages.length;
  const cardContents: HTMLElement[] = [];
  pages.forEach((page, index) => {
    const card = document.createElement("div");
    card.className = "paper-page";
    const content = document.createElement("div");
    content.className = "paper-page-content";
    for (const { el } of page.chunks) {
      appendChunkClone(el, content, sheetRoot, uidOf);
    }
    cardContents.push(content);
    card.appendChild(content);
    if (page.overflow) {
      card.setAttribute("data-overflow", "");
      const note = document.createElement("p");
      note.className = "paper-page-overflow-note";
      // Chunk-type-neutral wording: the over-tall block is most often a
      // marking-guide part SOLUTION, not the question itself.
      note.textContent =
        "This content is taller than one page and may split when printed.";
      card.appendChild(note);
    }
    const footer = document.createElement("div");
    footer.className = "paper-page-footer";
    footer.textContent = `Page ${index + 1} of ${total}`;
    card.appendChild(footer);
    scale.appendChild(card);
  });
  host.replaceChildren(scale);
  // After attach: zeroLeadingMargins detects margin collapse-through with
  // computed style, which is empty on detached DOM. Same task, no paint
  // in between.
  for (const content of cardContents) {
    zeroLeadingMargins(content);
  }
}

export default function PaginatedSheet({ children }: { children: ReactNode }) {
  const flowRef = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("measuring");
  const [pageCount, setPageCount] = useState(0);
  const modeRef = useRef<Mode>("measuring");
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  /**
   * Fit pages to the container: scale DOWN only (never up), origin top-left,
   * and reserve the scaled height on the overflow-hidden host so the page
   * flow ends where the last card visually ends. transform doesn't change
   * layout metrics, so offsetHeight here is always the natural height.
   * The host carries padding (shadow breathing room inside the clip — see
   * .paper-pages in print.css): pages fit the CONTENT box, and the reserved
   * height adds the vertical padding back (border-box via Tailwind preflight).
   */
  const syncScale = useCallback(() => {
    const host = pagesRef.current;
    const scaleEl = host?.firstElementChild as HTMLElement | null;
    if (!host || !scaleEl) return;
    const hostStyle = getComputedStyle(host);
    const padX =
      parseFloat(hostStyle.paddingLeft) + parseFloat(hostStyle.paddingRight);
    const padY =
      parseFloat(hostStyle.paddingTop) + parseFloat(hostStyle.paddingBottom);
    const width = host.clientWidth - padX;
    if (width <= 0) return; // hidden (not in paged mode) — nothing to fit
    const s = Math.min(1, width / PAGE_WIDTH_PX);
    if (s < 1 - 1e-4) {
      scaleEl.style.transform = `scale(${s})`;
      host.style.height = `${scaleEl.offsetHeight * s + padY}px`;
    } else {
      scaleEl.style.transform = "";
      host.style.height = "";
    }
  }, []);

  useEffect(() => {
    const flow = flowRef.current;
    const pagesHost = pagesRef.current;
    const measureHost = measureRef.current;
    const sheet = flow?.firstElementChild as HTMLElement | null;
    if (!flow || !pagesHost || !measureHost || !sheet) return;

    let cancelled = false;
    let rebuildTimer: number | undefined;
    let lastSheetHeight = -1;

    const build = () => {
      if (cancelled) return;
      try {
        lastSheetHeight = sheet.offsetHeight;
        // Fresh clone every build: late KaTeX/font shifts re-enter here via
        // the ResizeObserver, so the measurer must mirror the live sheet.
        measureHost.replaceChildren();
        const measured = sheet.cloneNode(true) as HTMLElement;
        measureHost.appendChild(measured);
        const chunks = collectChunks(measured);
        const pages = packPages(measureChunks(chunks, measureHost));
        // Commit the mode swap synchronously so the browser never paints an
        // in-between frame (continuous sheet AND pages, or neither).
        flushSync(() => {
          setMode("paged");
          setPageCount(pages.length);
        });
        renderPages(pages, pagesHost, measured);
        syncScale();
      } catch (err) {
        // Honest fallback: keep (or restore) the continuous sheet.
        console.error(
          "[print-preview] pagination failed; showing continuous sheet",
          err
        );
        flushSync(() => {
          setMode("fallback");
          setPageCount(0);
        });
      } finally {
        // Drop the measurement clone either way: renderPages deep-clones
        // chunks OUT of it, so after build() nothing references it — keeping
        // it would hold a third fully-laid-out copy of a KaTeX-heavy sheet
        // in the DOM for the life of the page.
        measureHost.replaceChildren();
      }
    };

    // First build: after webfonts settle plus two frames for KaTeX/layout.
    const start = () => {
      if (cancelled) return;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!cancelled) build();
        });
      });
    };
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(start, start);
    } else {
      window.setTimeout(start, 300);
    }

    // Re-paginate when the sheet's height changes after the first build
    // (late hydration, images, viewport-width reflow of the fallback sheet —
    // pagination itself is width-independent, so spurious rebuilds are
    // harmless, just debounced).
    const observer = new ResizeObserver(() => {
      if (cancelled || modeRef.current === "measuring") return;
      if (Math.abs(sheet.offsetHeight - lastSheetHeight) < 1) return;
      window.clearTimeout(rebuildTimer);
      rebuildTimer = window.setTimeout(build, REBUILD_DEBOUNCE_MS);
    });
    observer.observe(sheet);

    const onResize = () => {
      if (modeRef.current === "paged") syncScale();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      observer.disconnect();
      window.clearTimeout(rebuildTimer);
      window.removeEventListener("resize", onResize);
    };
  }, [syncScale]);

  return (
    <div className="paginate-root" data-mode={mode}>
      {mode === "paged" && pageCount > 0 && (
        <div
          className="page-count-chip"
          title="Approximate preview of the browser's print pagination — the printer's exact page breaks may differ slightly."
        >
          {/* "≈" is the visible honesty cue: the title tooltip never shows on
              touch devices, and most users are on phones. */}
          &asymp; {pageCount} {pageCount === 1 ? "page" : "pages"}
        </div>
      )}
      {/* The one React-managed PaperSheet: phase-1 preview, measurement
          source, screen-reader copy (clipped, not hidden, when paged) and —
          critically — the print flow, exactly as before this feature. */}
      <div ref={flowRef} className="paginate-flow">
        {children}
      </div>
      {/* Imperatively-filled page cards (inert clones); aria-hidden so
          assistive tech reads the real sheet once, not twice. */}
      <div ref={pagesRef} className="paper-pages" aria-hidden="true" />
      {/* Hidden fixed-position measurer pinned to exact A4 metrics. */}
      <div ref={measureRef} className="paginate-measure" aria-hidden="true" />
    </div>
  );
}
