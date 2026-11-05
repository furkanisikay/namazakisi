/**
 * Sözlük paketleme (YALNIZ Node: paketleyici `scripts/dil/sozluk-paketle.js` ve testler).
 * Uygulama içe aktarmaz; paketi `aktifDil.paketiAc` açar. Deterministik: fflate zlib düzey 9,
 * JSON anahtar sırası kaynaktaki sıra.
 */
import { strToU8, zlibSync } from 'fflate';

export function sozluguPaketle(nesne: unknown): string {
  return Buffer.from(zlibSync(strToU8(JSON.stringify(nesne)), { level: 9 })).toString('base64');
}
