/**
 * Dakika cinsinden süreyi etkin dilde yazar. Tek kaynak: sayaç, sade görünüm, bildirim
 * gövdesi ve sesli okuma aynı birimleri kullanır. SAF.
 *
 * Sayı ile birim ve ardışık iki parça arasındaki boşluk DİLİN kararıdır, kodda sabit
 * boşluk YAZILMAZ: sözlük `sure.birimli` ('{n} {birim}', Çince '{n}{birim}') ve
 * `sure.parcali` ('{once} {sonra}', Çince '{once}{sonra}'). İki ayrı kalıp, çünkü iki
 * karar bağımsızdır (Korece "5분" bitişik ama "1시간 5분" boşluklu).
 */
import { aktifDil, bicim, sayili, sozluk } from './aktifDil';
import type { DilKodu } from './diller';
import type { CogulMetin } from './tipler';

/** `{a}<ayıraç>{b}` kalıbında iki yer tutucu arasındaki metin; kalıp bozuksa tek boşluk. */
function ayirac(kalip: string, a: string, b: string): string {
  const i = kalip.indexOf(a);
  const j = kalip.indexOf(b);
  return i >= 0 && j >= i + a.length ? kalip.slice(i + a.length, j) : ' ';
}

/** Sayı ile kısa birim arasındaki metin (" " ya da Çincede ""); ayrı stilli çizim için. */
export function birimAyiraci(kod: DilKodu = aktifDil()): string {
  return ayirac(sozluk(kod).sure.birimli, '{n}', '{birim}');
}

/** Ardışık iki süre parçası arasındaki metin (" " ya da Çincede ""); ayrı stilli çizim için. */
export function parcaAyiraci(kod: DilKodu = aktifDil()): string {
  return ayirac(sozluk(kod).sure.parcali, '{once}', '{sonra}');
}

/** Sayı + kısa birim: "5 dk", "+3 dk", Çince "5分钟". */
export function birimli(n: number | string, birim: string, kod: DilKodu = aktifDil()): string {
  return bicim(sozluk(kod).sure.birimli, { n, birim });
}

/** Ardışık süre parçaları: "1 sa 5 dk", "1 saat 5 dakika", Çince "1小时5分钟". */
export function parcali(parcalar: readonly string[], kod: DilKodu = aktifDil()): string {
  const kalip = sozluk(kod).sure.parcali;
  return parcalar.length ? parcalar.reduce((once, sonra) => bicim(kalip, { once, sonra })) : '';
}

/** "42 dk", "1 sa 5 dk", "2 sa" (başlık, sayaç). */
export function dakikaKisa(dk: number, kod: DilKodu = aktifDil()): string {
  const k = sozluk(kod).sure.kisa;
  const d = Math.max(0, Math.floor(dk));
  if (d < 60) return birimli(d, k.dk, kod);
  const sa = Math.floor(d / 60);
  const kalan = d % 60;
  return kalan === 0 ? birimli(sa, k.sa, kod) : parcali([birimli(sa, k.sa, kod), birimli(kalan, k.dk, kod)], kod);
}

/** "42 dakika", "1 saat 5 dakika" (cümle, sesli okuma). */
export function dakikaUzun(dk: number, kod: DilKodu = aktifDil()): string {
  const s = sozluk(kod).sure;
  const d = Math.max(0, Math.floor(dk));
  if (d < 60) return sayili(s.dakika, d, {}, kod);
  const sa = Math.floor(d / 60);
  const kalan = d % 60;
  return kalan === 0 ? sayili(s.saat, sa, {}, kod) : parcali([sayili(s.saat, sa, {}, kod), sayili(s.dakika, kalan, {}, kod)], kod);
}

const KACIS = /[.*+?^${}()|[\]\\]/g;

/**
 * Doldurulmuş cümlede "{sayı} <dakika sözcüğü>" ikilisini sayının doğru çoğul biçimine çeker.
 * Sesli okuma şablonları ve kullanıcının yazdığı metin dakikayı tek biçimle yazar
 * ("{süre} минут"); Rusça/Boşnakçada sayıya göre değişir (2 минуты, 5 минут), İngilizcede
 * "1 minutes" düzelir. Dakika sözcüğünün o dildeki herhangi bir biçimi tanınır; başka metne
 * dokunulmaz. Kalıp boşluksuzsa ('{n}分钟') sayıdan sonra boşluk aranmaz; boşluklu dillerde
 * en az bir boşluk şarttır (eski davranış).
 */
export function dakikaUyumu(cumle: string, n: number, kod: DilKodu = aktifDil()): string {
  return dakikaKalibinaUydur(cumle, n, sozluk(kod).sure.dakika, kod);
}

/** `dakikaUyumu`'nun çekirdeği; dakika kalıbı dışarıdan (test: henüz çevrilmemiş boşluksuz dil). */
export function dakikaKalibinaUydur(cumle: string, n: number, sablon: CogulMetin, kod: DilKodu): string {
  const kaliplar = Object.entries(sablon)
    .filter(([k, v]) => k !== '__cogul' && typeof v === 'string' && v.startsWith('{n}'))
    .map(([, v]) => v as string);
  const bicimler = [...new Set(kaliplar.map((v) => v.slice(3).trim()).filter(Boolean))].sort((a, b) => b.length - a.length);
  if (!bicimler.length) return cumle;
  const bitisik = kaliplar.some((v) => !/^\{n\}\s/.test(v));
  const ifade = new RegExp(`(^|[^\\d])${n}([ \\u00a0]${bitisik ? '*' : '+'})(?:${bicimler.map((b) => b.replace(KACIS, '\\$&')).join('|')})(?=$|[\\s.,;:!?…)»"'”’-])`, 'g');
  const dogru = sayili(sablon, n, {}, kod).slice(String(n).length).trim();
  return cumle.replace(ifade, (_, once: string, bosluk: string) => `${once}${n}${bosluk}${dogru}`);
}
