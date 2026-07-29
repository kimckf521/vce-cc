/**
 * A4 page geometry for the print route — the ONE place these numbers live.
 *
 * They must mirror the physical print set-up in ./print.css exactly:
 *   @page { size: A4; margin: 18mm; margin-bottom: 24mm; }
 * and the on-screen page cards (.paper-page) which are styled from the same
 * millimetre values. If the @page margins ever change, change them here too —
 * the preview paginator budgets pages from these constants.
 *
 * CSS px are defined as 1in/96, so mm→px is exact (not display-dependent):
 * Chrome lays the printed page out with the same 96dpi CSS px, which is what
 * makes an on-screen preview of print pagination possible at all.
 */

export const PAGE_WIDTH_MM = 210;
export const PAGE_HEIGHT_MM = 297;

export const MARGIN_TOP_MM = 18;
export const MARGIN_X_MM = 18; // left and right
export const MARGIN_BOTTOM_MM = 24; // deeper: the @bottom-center page counter lives here

/** Printable content box: 174mm × 255mm. */
export const CONTENT_WIDTH_MM = PAGE_WIDTH_MM - 2 * MARGIN_X_MM;
export const CONTENT_HEIGHT_MM = PAGE_HEIGHT_MM - MARGIN_TOP_MM - MARGIN_BOTTOM_MM;

export const MM_TO_PX = 96 / 25.4;

/** ~793.7px — natural on-screen width of one preview page. */
export const PAGE_WIDTH_PX = PAGE_WIDTH_MM * MM_TO_PX;
/** ~963.8px — vertical content budget the paginator packs chunks into. */
export const CONTENT_HEIGHT_PX = CONTENT_HEIGHT_MM * MM_TO_PX;
