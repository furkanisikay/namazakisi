// Pencapça YALNIZ Şahmuki (Arap harfli, Pakistan normu; Gurmuki yazılmaz), SAĞDAN SOLA; büyük/küçük harf yok (`buyuk` = `adlar`). Rakam çizimde Fars (`arabext`, CLDR `pa-Arab`), sözlükte Batı rakamı.
import type { Sozluk } from '../tr';

/**
 * Pencapça (Şahmuki) vakit adları: فجر · طلوعِ آفتاب · ظہر · عصر · مغرب · عشاء (pnb.wikipedia
 * "نماز" maddesi; güneş adı yalnız `ur` emsali, Pencapça kaynakta doğrulanmadı); cuma جمعہ. Halk
 * adları (سرگی، پیشی، دیگر، شاماں، کفتاں) arayüzde kullanılmaz. Çizelge satırı (`imsakVakti`)
 * fecir adıdır. Terimler: Kıldım = "نماز پڑھ لئی" (nesneye uyar; türetildi) · Kılındı =
 * "ادا ہو گئی" (türetildi) · kaza قضا نماز · nafile نفل · kerahat مکروہ وقت (doğrulanmadı) ·
 * kıble قبلہ · cami مسجد · seri تسلسل · Namaz Muhafızı نماز محافظ · hesap yöntemi حساب دا طریقہ ·
 * teheccüd تہجد. Hitap "تسیں" + ‑و emri (Urduca ‑یں emri taşınmaz).
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
  durum: { kilindi: 'ادا ہو گئی', vaktiGeldi: 'وقت ہو گیا', girmedi: 'اجے وقت نہیں ہویا', gecti: 'ادا نہیں ہوئی' },
  durumKucuk: { kilindi: 'ادا ہو گئی', vaktiGeldi: 'وقت ہو گیا', girmedi: 'اجے وقت نہیں ہویا', gecti: 'ادا نہیں ہوئی' },
  eylem: { kildim: 'نماز پڑھ لئی', kilindi: 'ادا ہو گئی' },
  kerahatVakti: 'مکروہ وقت',
  isaretle: 'ادا ہو گئی دا نشان لاؤ',
  geriAlEtiketi: '{durum}، واپس لین لئی ٹیپ کرو',
  geriAlindi: 'نشان ہٹا دتا گیا',
};
