import type { BookWithPages } from '@/data';
import { BLEED_IN, SAFE_MARGIN_IN, trimSizes } from './trimSizes';

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/**
 * Renders a book as print-ready HTML: one CSS page per book page, trim + bleed sized,
 * photos as background images so they crop like a print layout. `resolve` lets native
 * callers swap file:// URIs for embedded data URIs before handing HTML to the PDF engine.
 */
export function renderBookHtml(book: BookWithPages, opts: { bleed: boolean; resolve?: (uri: string) => string }) {
  const t = trimSizes[book.trimSize];
  const bleed = opts.bleed ? BLEED_IN : 0;
  const w = t.widthIn + bleed * 2;
  const h = t.heightIn + bleed * 2;
  const src = (u: string) => esc(opts.resolve ? opts.resolve(u) : u);
  const img = (u: string) => `<div class="img" style="background-image:url('${src(u)}')"></div>`;

  const pages = book.pages
    .map((p) => {
      const heading = p.heading ? `<h2>${esc(p.heading)}</h2>` : '';
      const body = p.body ? `<p>${esc(p.body)}</p>` : '';
      switch (p.layout) {
        case 'cover':
          return `<section class="page cover">${p.uris[0] ? img(p.uris[0]) : ''}<div class="cover-title"><h1>${esc(p.heading ?? book.title)}</h1>${book.subtitle ? `<p>${esc(book.subtitle)}</p>` : ''}</div></section>`;
        case 'full_bleed':
          return `<section class="page full">${p.uris[0] ? img(p.uris[0]) : ''}${heading ? `<div class="overlay">${heading}</div>` : ''}</section>`;
        case 'photo_caption':
          return `<section class="page safe caption">${p.uris[0] ? img(p.uris[0]) : ''}<div>${heading}${body}</div></section>`;
        case 'two_up':
          return `<section class="page safe"><div class="text">${heading}</div><div class="grid two">${p.uris.map(img).join('')}</div>${body ? `<div class="text">${body}</div>` : ''}</section>`;
        case 'grid_four':
          return `<section class="page safe">${heading}<div class="grid four">${p.uris.map(img).join('')}</div>${body}</section>`;
        case 'story':
        default:
          return `<section class="page safe story">${heading}${body}</section>`;
      }
    })
    .join('\n');

  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(book.title)}</title><style>
@page { size: ${w}in ${h}in; margin: 0; }
* { box-sizing: border-box; margin: 0; }
html, body { background: #fff; color: #2B2622; font-family: Georgia, 'Times New Roman', serif; }
.page { width: ${w}in; height: ${h}in; position: relative; overflow: hidden; page-break-after: always; break-after: page; }
.page:last-child { page-break-after: auto; break-after: auto; }
.safe { padding: ${SAFE_MARGIN_IN + bleed}in; display: flex; flex-direction: column; gap: 0.25in; }
.img { background-size: cover; background-position: center; background-color: #F3ECE2; }
.full .img, .cover .img { position: absolute; inset: 0; }
.cover-title { position: absolute; left: 0; right: 0; bottom: ${0.9 + bleed}in; text-align: center; color: #fff; text-shadow: 0 1px 12px rgba(0,0,0,.5); }
.cover-title h1 { font-size: 34pt; font-weight: 600; }
.overlay { position: absolute; left: ${SAFE_MARGIN_IN + bleed}in; bottom: ${SAFE_MARGIN_IN + bleed}in; color: #fff; text-shadow: 0 1px 10px rgba(0,0,0,.5); }
.caption .img { flex: 1; border-radius: 2pt; }
.grid { flex: 1; display: grid; gap: 0.15in; }
.grid.two { grid-template-columns: 1fr 1fr; }
.grid.four { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
.story { justify-content: center; }
h2 { font-size: 18pt; font-weight: 600; }
p { font-size: 11.5pt; line-height: 1.55; }
</style></head><body>${pages}</body></html>`;
}
