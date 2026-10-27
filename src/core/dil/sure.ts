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

const KACIS = /[.*+?^${}()|[\]\\]/g;

/**
 * Doldurulmuş cümlede "{sayı} <dakika sözcüğü>" ikilisini sayının doğru çoğul biçimine çeker.
 * Sesli okuma şablonları ve kullanıcının yazdığı metin dakikayı tek biçimle yazar
 * ("{süre} минут"); Rusça/Boşnakçada sayıya göre değişir (2 минуты, 5 минут), İngilizcede
 * "1 minutes" düzelir. Dakika sözcüğünün o dildeki herhangi bir biçimi tanınır; başka metne
 * dokunulmaz.
 */
export function dakikaUyumu(cumle: string, n: number, kod: DilKodu = aktifDil()): string {
  const sablon = sozluk(kod).sure.dakika;
  const bicimler = [
    ...new Set(
      Object.entries(sablon)
        .filter(([k, v]) => k !== '__cogul' && typeof v === 'string' && v.startsWith('{n} '))
        .map(([, v]) => (v as string).slice(4).trim()),
    ),
  ].sort((a, b) => b.length - a.length);
  if (!bicimler.length) return cumle;
  const ifade = new RegExp(`(^|[^\\d])${n}([ \\u00a0]+)(?:${bicimler.map((b) => b.replace(KACIS, '\\$&')).join('|')})(?=$|[\\s.,;:!?…)»"'”’-])`, 'g');
  const dogru = sayili(sablon, n, {}, kod).slice(String(n).length).trim();
  return cumle.replace(ifade, (_, once: string, bosluk: string) => `${once}${n}${bosluk}${dogru}`);
}
