/**
 * Dakika cinsinden süreyi etkin dilde yazar. Tek kaynak: sayaç, sade görünüm, bildirim
 * gövdesi ve sesli okuma aynı birimleri kullanır. SAF.
 */
import { metin, sayili } from './aktifDil';

/** "42 dk", "1 sa 5 dk", "2 sa" (başlık, sayaç). */
export function dakikaKisa(dk: number): string {
  const k = metin().sure.kisa;
  const d = Math.max(0, Math.floor(dk));
  if (d < 60) return `${d} ${k.dk}`;
  const sa = Math.floor(d / 60);
  const kalan = d % 60;
  return kalan === 0 ? `${sa} ${k.sa}` : `${sa} ${k.sa} ${kalan} ${k.dk}`;
}

/** "42 dakika", "1 saat 5 dakika" (cümle, sesli okuma). */
export function dakikaUzun(dk: number): string {
  const s = metin().sure;
  const d = Math.max(0, Math.floor(dk));
  if (d < 60) return sayili(s.dakika, d);
  const sa = Math.floor(d / 60);
  const kalan = d % 60;
  return kalan === 0 ? sayili(s.saat, sa) : `${sayili(s.saat, sa)} ${sayili(s.dakika, kalan)}`;
}
