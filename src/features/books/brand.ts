/**
 * Print branding policy. This is the ONLY brand text allowed in an exported book.
 *  - Front cover and spine: 100% user content (title, family names, emblem, photo). No brand marks.
 *  - Back cover: one small hallmark, bottom centre.
 * Any change here needs sign-off from the brand owner.
 */
export const BACK_COVER_HALLMARK = 'Curated with Keep Forever • Protected by The Keep';

/** Muted antique gold, set in small caps so the stamp reads as a quiet maker's mark. */
export const HALLMARK_STYLE = {
  color: '#8C7A5B',
  fontSizePt: 7.5,
  letterSpacingEm: 0.14,
  bottomIn: 0.6, // from the trim edge
} as const;
