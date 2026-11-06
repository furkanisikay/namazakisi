import type { Sozluk } from '../tr';

/**
 * Arapça vakit adları (Ürdün Evkaf çizelgesi biçimi): الفجر · الشروق · الظهر · العصر · المغرب · العشاء.
 * Arap yazısında büyük/küçük harf yoktur → `buyuk` ve `kucuk` `adlar` ile aynıdır.
 * Çizelgedeki sabah satırı (`imsakVakti`) fecir adıdır; imsak ayrı bir vakit olarak gösterilmez.
 * "Kıldım" = صلّيتُ (1. tekil geçmiş, cinsiyetsiz), "Kılındı" = تمّت.
 * Terimler: kaza قضاء · nafile النوافل (tekil نافلة) · kıble القبلة · kerahat vakti وقت الكراهة ·
 * teheccüd التهجد · kuşluk الضحى · evvâbîn الأوابين · muhafız "قبل خروج الوقت" · seri سلسلة المواظبة ·
 * hesap yöntemi طريقة الحساب.
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'الفجر', gunes: 'الشروق', ogle: 'الظهر', ikindi: 'العصر', aksam: 'المغرب', yatsi: 'العشاء' },
  buyuk: { imsak: 'الفجر', gunes: 'الشروق', ogle: 'الظهر', ikindi: 'العصر', aksam: 'المغرب', yatsi: 'العشاء' },
  kucuk: { imsak: 'الفجر', gunes: 'الشروق', ogle: 'الظهر', ikindi: 'العصر', aksam: 'المغرب', yatsi: 'العشاء' },
  imsakVakti: 'الفجر',
  cuma: 'الجمعة',
  cumaKucuk: 'الجمعة',
  gunesDogusu: 'الشروق',
  gunesDogusuKucuk: 'الشروق',
  durum: { kilindi: 'تمّت', vaktiGeldi: 'حان الوقت', girmedi: 'لم يدخل بعد', gecti: 'لم تُؤدَّ' },
  durumKucuk: { kilindi: 'تمّت', vaktiGeldi: 'حان الوقت', girmedi: 'لم يدخل بعد', gecti: 'لم تُؤدَّ' },
  eylem: { kildim: 'صلّيتُ', kilindi: 'تمّت' },
  kerahatVakti: 'وقت الكراهة',
  isaretle: 'وضع علامة «تمّت»',
  geriAlEtiketi: '{durum}، انقر للتراجع',
  geriAlindi: 'أُزيلت العلامة',
};
