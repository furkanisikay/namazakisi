import type { Sozluk } from '../tr';

/**
 * Farsça vakit adları (İran Farsçası temel takımı): صبح · طلوع آفتاب · ظهر · عصر · مغرب · عشا;
 * cuma جمعه. Afganistan (Darî) adları ayrı takımdır (`vakitTakimlari.ts > afgan`).
 * Arap harfinde büyük/küçük harf yoktur: `buyuk` ve `kucuk` `adlar` ile aynıdır.
 * Çizelge satırı (`imsakVakti`) fecir/sabah adıdır, "امساک" değil.
 * Terimler: Kıldım = "خواندم" · Kılındı = "خوانده شد" · kaza قضا (نماز قضا) · nafile نافله ·
 * kıble قبله · kerahat وقت مکروه · teheccüd تهجد · kuşluk ضحی · evvâbîn اوابین · vitir وتر ·
 * seri زنجیره · Namaz Muhafızı نگهبان نماز · hesap yöntemi روش محاسبه · ezan اذان ·
 * kasr/cem قصر/جمع · Hanefî/Şâfiî حنفی/شافعی. Yönetim metni "شما" + "…کنید"; ibadete
 * çağrı "تو" + emir ("نماز بخوان").
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'صبح', gunes: 'طلوع آفتاب', ogle: 'ظهر', ikindi: 'عصر', aksam: 'مغرب', yatsi: 'عشا' },
  buyuk: { imsak: 'صبح', gunes: 'طلوع آفتاب', ogle: 'ظهر', ikindi: 'عصر', aksam: 'مغرب', yatsi: 'عشا' },
  kucuk: { imsak: 'صبح', gunes: 'طلوع آفتاب', ogle: 'ظهر', ikindi: 'عصر', aksam: 'مغرب', yatsi: 'عشا' },
  imsakVakti: 'صبح',
  cuma: 'جمعه',
  cumaKucuk: 'جمعه',
  gunesDogusu: 'طلوع آفتاب',
  gunesDogusuKucuk: 'طلوع آفتاب',
  durum: { kilindi: 'خوانده شد', vaktiGeldi: 'وقتش رسیده', girmedi: 'هنوز وقتش نشده', gecti: 'خوانده نشد' },
  durumKucuk: { kilindi: 'خوانده شد', vaktiGeldi: 'وقتش رسیده', girmedi: 'هنوز وقتش نشده', gecti: 'خوانده نشد' },
  eylem: { kildim: 'خواندم', kilindi: 'خوانده شد' },
  kerahatVakti: 'وقت مکروه',
  isaretle: 'علامت‌گذاری به‌عنوان خوانده‌شده',
  geriAlEtiketi: '{durum}، برای لغو ضربه بزنید',
  geriAlindi: 'علامت برداشته شد',
};
