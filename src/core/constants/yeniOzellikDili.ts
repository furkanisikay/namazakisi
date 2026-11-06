/**
 * "Neler Yeni" duyurularının etkin dildeki hâli. Türkçe kayıt (`YeniOzellikler.ts`) kaynaktır
 * ve README üreticisi onu doğrudan okur; diğer dillerde YALNIZ `ceviri`si olan öğe gösterilir
 * (eski duyurular yeni dilin kullanıcısına anlamsız, yarım çeviri gösterilmez). SAF.
 */
import { aktifDil, yaziyaCevir } from '../dil/aktifDil';
import type { DilKodu } from '../dil/diller';
import { YENI_OZELLIKLER, type YeniOzellik } from './YeniOzellikler';

/** Öğenin verilen dildeki hâli; o dilde çevirisi yoksa `null`. */
export function yeniOzellikDilde(o: YeniOzellik, dil: DilKodu = aktifDil()): YeniOzellik | null {
  if (dil === 'tr') return o;
  const c = o.ceviri?.[dil];
  if (!c) return null;
  // Çeviri sözlük dışıdır: Kiril yazılan dil (Özbekçe) Latin gösterilirken burada da çevrilir.
  const y = (m: string) => yaziyaCevir(m, dil);
  return {
    ...o,
    baslik: y(c.baslik),
    aciklama: y(c.aciklama),
    detayAciklama: c.detayAciklama === undefined ? undefined : y(c.detayAciklama),
    ctaEtiketi: c.ctaEtiketi === undefined ? undefined : y(c.ctaEtiketi),
    detaylar: c.detaylar?.map(y),
  };
}

/** Katalog etkin dilde (çevirisi olmayan öğeler düşer). */
export function yeniOzelliklerDilde(dil: DilKodu = aktifDil()): YeniOzellik[] {
  return YENI_OZELLIKLER.map((o) => yeniOzellikDilde(o, dil)).filter((o): o is YeniOzellik => o !== null);
}
