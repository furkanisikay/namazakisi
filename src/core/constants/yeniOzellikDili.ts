/**
 * "Neler Yeni" duyurularının etkin dildeki hâli. Türkçe kayıt (`YeniOzellikler.ts`) kaynaktır
 * ve README üreticisi onu doğrudan okur; diğer dillerde YALNIZ `ceviri`si olan öğe gösterilir
 * (eski duyurular yeni dilin kullanıcısına anlamsız, yarım çeviri gösterilmez). SAF.
 */
import { aktifDil } from '../dil/aktifDil';
import type { DilKodu } from '../dil/diller';
import { YENI_OZELLIKLER, type YeniOzellik } from './YeniOzellikler';

/** Öğenin verilen dildeki hâli; o dilde çevirisi yoksa `null`. */
export function yeniOzellikDilde(o: YeniOzellik, dil: DilKodu = aktifDil()): YeniOzellik | null {
  if (dil === 'tr') return o;
  const c = o.ceviri?.[dil];
  if (!c) return null;
  return {
    ...o,
    baslik: c.baslik,
    aciklama: c.aciklama,
    detayAciklama: c.detayAciklama,
    ctaEtiketi: c.ctaEtiketi,
    detaylar: c.detaylar,
  };
}

/** Katalog etkin dilde (çevirisi olmayan öğeler düşer). */
export function yeniOzelliklerDilde(dil: DilKodu = aktifDil()): YeniOzellik[] {
  return YENI_OZELLIKLER.map((o) => yeniOzellikDilde(o, dil)).filter((o): o is YeniOzellik => o !== null);
}
