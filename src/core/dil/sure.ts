/**
 * Dakika cinsinden süreyi etkin dilde yazar. Tek kaynak: sayaç, sade görünüm, bildirim
 * gövdesi ve sesli okuma aynı birimleri kullanır. SAF.
 */
import { aktifDil, sayili, sozluk } from './aktifDil';
import type { DilKodu } from './diller';

/** "42 dk", "1 sa 5 dk", "2 sa" (başlık, sayaç). */
export function dakikaKisa(dk: number, kod: DilKodu = aktifDil()): string {
  const k = sozluk(kod).sure.kisa;
  const d = Math.max(0, Math.floor(dk));
  if (d < 60) return `${d} ${k.dk}`;
  const sa = Math.floor(d / 60);
  const kalan = d % 60;
  return kalan === 0 ? `${sa} ${k.sa}` : `${sa} ${k.sa} ${kalan} ${k.dk}`;
}

/** "42 dakika", "1 saat 5 dakika" (cümle, sesli okuma). */
export function dakikaUzun(dk: number, kod: DilKodu = aktifDil()): string {
  const s = sozluk(kod).sure;
  const d = Math.max(0, Math.floor(dk));
  if (d < 60) return sayili(s.dakika, d, {}, kod);
  const sa = Math.floor(d / 60);
  const kalan = d % 60;
  return kalan === 0 ? sayili(s.saat, sa, {}, kod) : `${sayili(s.saat, sa, {}, kod)} ${sayili(s.dakika, kalan, {}, kod)}`;
}
