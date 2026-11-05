import type { Sozluk } from '../tr';

/**
 * Mooré: CLDR verisi yok. Gün adları Arapça kökenli Mooré adları (tẽne, lamusa, arzũma, sibri
 * HadeethEnc/QuranEnc mos'ta geçer; hado, talaato, arba doğrulanmadı). Ay adları Burkina Faso'da
 * kullanılan Fransızca kökenli adların Mooré imlasıyla yazımı (türetildi). Gün ayın önünde.
 */
export const tarih: Sozluk['tarih'] = {
  gunler: ['Hado', 'Tẽne', 'Talaato', 'Arba', 'Lamusa', 'Arzũma', 'Sibri'],
  gunlerKisa: ['Had', 'Tẽn', 'Tal', 'Arb', 'Lam', 'Arz', 'Sib'],
  aylar: ['Zanvye', 'Fevrye', 'Mars', 'Avril', 'Mee', 'Zuẽ', 'Zulye', 'Ut', 'Sɛtãmbr', 'Oktoobr', 'Novãmbr', 'Desãmbr'],
  aylarYalin: ['Zanvye', 'Fevrye', 'Mars', 'Avril', 'Mee', 'Zuẽ', 'Zulye', 'Ut', 'Sɛtãmbr', 'Oktoobr', 'Novãmbr', 'Desãmbr'],
  aylarKisa: ['Zan', 'Fev', 'Mar', 'Avr', 'Mee', 'Zuẽ', 'Zul', 'Ut', 'Sɛt', 'Okt', 'Nov', 'Des'],
  haftaHarfleri: ['Tẽ', 'Ta', 'Ar', 'La', 'Az', 'Si', 'Ha'],
  uzun: '{gun} {ay} {yil}',
  gunAdiYil: '{gunAdi}, {yil}',
};
