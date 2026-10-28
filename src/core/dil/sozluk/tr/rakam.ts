/**
 * Rakam sistemi seçimi (`core/dil/rakam.ts`; Ayarlar > Dil, yalnız yerel rakamı olan dilde
 * görünür: Arapça, Bengalce). `dogu` = o dilin YEREL rakamı (Arapçada Doğu Arap, Bengalcede
 * Bengalce). Örnek rakamlar SÖZLÜĞE YAZILMAZ (yerel rakam sözlükte yasak, nöbetçi
 * `rakam.test.ts`): ekran kodda üretir.
 */
export const rakam = {
  baslik: 'Rakamlar',
  aciklama: 'Saat, tarih ve sayıların hangi rakamlarla yazılacağını seçin.',
  otomatik: 'Ülkenize göre',
  otomatikAciklama: 'Konumunuzun ülkesinde yaygın olan rakamlar kullanılır.',
  dogu: 'Doğu Arap rakamları',
  bati: 'Batı rakamları',
} as const;
