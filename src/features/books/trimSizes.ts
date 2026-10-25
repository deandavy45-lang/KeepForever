import type { TrimSize } from '@/data';

/** Physical book formats. Dimensions in inches; PDF generation uses 72 points per inch. */
export const trimSizes: Record<TrimSize, { label: string; widthIn: number; heightIn: number }> = {
  square_8: { label: '8 × 8 in square', widthIn: 8, heightIn: 8 },
  letter_portrait: { label: 'US Letter 8.5 × 11 in', widthIn: 8.5, heightIn: 11 },
  a4_portrait: { label: 'A4 210 × 297 mm', widthIn: 8.27, heightIn: 11.69 },
  landscape_11x8_5: { label: 'Landscape 11 × 8.5 in', widthIn: 11, heightIn: 8.5 },
};

/** Standard print-shop bleed. Exports add it on every edge so full-bleed photos trim cleanly. */
export const BLEED_IN = 0.125;
export const SAFE_MARGIN_IN = 0.5;

export function pageSizePoints(trim: TrimSize, withBleed: boolean) {
  const t = trimSizes[trim];
  const b = withBleed ? BLEED_IN * 2 : 0;
  return { width: Math.round((t.widthIn + b) * 72), height: Math.round((t.heightIn + b) * 72) };
}
