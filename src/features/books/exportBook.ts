import { File } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { BookWithPages } from '@/data';
import { renderBookHtml } from './renderBookHtml';
import { pageSizePoints } from './trimSizes';

/**
 * Produces a PDF on-device and opens the system share sheet, so the family can AirDrop,
 * email, save to Files, or send to any local print shop. No server round-trip.
 */
export async function exportBookPdf(book: BookWithPages, { bleed = true } = {}) {
  const resolve = (uri: string) => {
    if (!uri.startsWith('file:')) return uri;
    const f = new File(uri);
    const mime = uri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
    return `data:${mime};base64,${f.base64Sync()}`;
  };
  const html = renderBookHtml(book, { bleed, resolve });
  const { width, height } = pageSizePoints(book.trimSize, bleed);
  const { uri } = await Print.printToFileAsync({ html, width, height, margins: { left: 0, right: 0, top: 0, bottom: 0 } });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: book.title });
  }
  return uri;
}
