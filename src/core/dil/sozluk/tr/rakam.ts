/**
 * Rakam sistemi seçimi (`core/dil/rakam.ts`; Ayarlar > Dil, yalnız Arapçada görünür).
 * Seçenek açıklamasındaki örnek rakamlar SÖZLÜĞE YAZILMAZ (Doğu Arap rakamı sözlükte yasak,
 * nöbetçi `rakam.test.ts`): ekran kodda üretir.
 */
export const rakam = {
  baslik: 'Rakamlar',
  aciklama: 'Saat, tarih ve sayıların hangi rakamlarla yazılacağını seçin.',
  otomatik: 'Ülkenize göre',
  otomatikAciklama: 'Konumunuzun ülkesinde yaygın olan rakamlar kullanılır.',
  dogu: 'Doğu Arap rakamları',
  bati: 'Batı rakamları',
} as const;
