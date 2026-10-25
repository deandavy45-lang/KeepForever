import type { BookWithPages } from '@/data';
import { renderBookHtml } from './renderBookHtml';

/** Browser preview: open the print-ready HTML in a new tab and invoke "Save as PDF". */
export async function exportBookPdf(book: BookWithPages, { bleed = true } = {}) {
  const w = window.open('', '_blank');
  if (!w) throw new Error('Allow pop-ups to preview the print layout');
  w.document.write(renderBookHtml(book, { bleed }));
  w.document.close();
  w.onload = () => w.print();
  return null;
}
