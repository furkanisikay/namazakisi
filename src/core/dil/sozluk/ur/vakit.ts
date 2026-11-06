import type { Sozluk } from '../tr';

/**
 * Urduca vakit adları (Pakistan çizelgelerindeki yerleşik biçim): فجر · طلوعِ آفتاب · ظہر ·
 * عصر · مغرب · عشاء; cuma جمعہ. Arap harfinde büyük/küçük yoktur: `buyuk` ve `kucuk` `adlar`
 * ile aynıdır. Çizelge satırı (`imsakVakti`) fecir adıdır, "Imsak" değil.
 * Terimler: Kıldım = "نماز پڑھ لی" (nesneye uyar, cinsiyetsiz) · Kılındı = "ادا شدہ" ·
 * kaza قضا نماز · nafile نفل · kerahat مکروہ وقت/اوقات (zeval زوال) · kıble قبلہ ·
 * seri تسلسل · Namaz Muhafızı نماز محافظ · hesap yöntemi حساب کا طریقہ · kuşluk چاشت
 * (işrak اشراق) · evvâbîn اوابین · teheccüd تہجد.
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'فجر', gunes: 'طلوعِ آفتاب', ogle: 'ظہر', ikindi: 'عصر', aksam: 'مغرب', yatsi: 'عشاء' },
  buyuk: { imsak: 'فجر', gunes: 'طلوعِ آفتاب', ogle: 'ظہر', ikindi: 'عصر', aksam: 'مغرب', yatsi: 'عشاء' },
  kucuk: { imsak: 'فجر', gunes: 'طلوعِ آفتاب', ogle: 'ظہر', ikindi: 'عصر', aksam: 'مغرب', yatsi: 'عشاء' },
  imsakVakti: 'فجر',
  cuma: 'جمعہ',
  cumaKucuk: 'جمعہ',
  gunesDogusu: 'طلوعِ آفتاب',
  gunesDogusuKucuk: 'طلوعِ آفتاب',
  durum: { kilindi: 'ادا شدہ', vaktiGeldi: 'وقت ہو گیا', girmedi: 'ابھی وقت نہیں ہوا', gecti: 'ادا نہیں ہوئی' },
  durumKucuk: { kilindi: 'ادا شدہ', vaktiGeldi: 'وقت ہو گیا', girmedi: 'ابھی وقت نہیں ہوا', gecti: 'ادا نہیں ہوئی' },
  eylem: { kildim: 'نماز پڑھ لی', kilindi: 'ادا شدہ' },
  kerahatVakti: 'مکروہ وقت',
  isaretle: 'ادا شدہ کے طور پر نشان لگائیں',
  geriAlEtiketi: '{durum}، واپس لینے کے لیے تھپتھپائیں',
  geriAlindi: 'نشان ہٹا دیا گیا',
};
