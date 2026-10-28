import type { Sozluk } from '../tr';

/**
 * Uygurca (UEY, Arap harfli) vakit adları — Uygur halkının yerleşik namaz adları:
 * بامدات · قۇياش چىقىش · پېشىن · ئەسىر · شام · خۇپتەن; cuma جۈمە. Arap harfinde büyük/küçük
 * yoktur: `buyuk` ve `kucuk` `adlar` ile aynıdır. Çizelge satırı (`imsakVakti`) sabah adıdır, "Imsak" değil.
 * Kaynak: islamqa.info/ug (بامدات، پېشىن، ئەسىر، شام، خۇپتەن، نەپلە ناماز، ئەزان); güneş doğuşu
 * için aynı kaynakta "كۈن چىقىش" de geçer, çizelgede "قۇياش چىقىش" seçildi (yerli okuyucuyla DOĞRULANMADI).
 * Hitap: yönetim "سىز" + kibar emir (…ڭ / …ڭىز: "تاللاڭ"); ibadete çağrı "سەن" + emir ("نامازغا تۇر").
 * Terimler: Kıldım = "ناماز ئوقۇدۇم" · Kılındı = "ئوقۇلدى" · kaza قازا (قازا ناماز) · nafile نەپلە ·
 * kerahat مەكرۇھ ۋاقىت · kıble قىبلە · seri ئۇدا (ئۇدا كۈنلەر) · Namaz Muhafızı ناماز قوغدىغۇچى ·
 * hesap yöntemi ھېسابلاش ئۇسۇلى · kuşluk چاشگاھ · evvâbîn ئەۋۋابىن · teheccüd تەھەججۇد ·
 * ezan ئەزان · vitir ۋىتىر · seferîlik سەپەر (yolcu مۇساپىر) · Allah kabul etsin = "ئاللاھ قوبۇل قىلسۇن".
 * İmla: h = ھ (U+06BE), e = ە (U+06D5), i = ى (U+0649), ې ۇ ۆ ۈ ۋ ڭ, hemze taşıyıcı ئ;
 * Farsça ye/kef (U+06CC, U+06A9) ve Arapça he (U+0647) YOK. Rakamlar Batı (Uygurcada yerel rakam yok).
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'بامدات', gunes: 'قۇياش چىقىش', ogle: 'پېشىن', ikindi: 'ئەسىر', aksam: 'شام', yatsi: 'خۇپتەن' },
  buyuk: { imsak: 'بامدات', gunes: 'قۇياش چىقىش', ogle: 'پېشىن', ikindi: 'ئەسىر', aksam: 'شام', yatsi: 'خۇپتەن' },
  kucuk: { imsak: 'بامدات', gunes: 'قۇياش چىقىش', ogle: 'پېشىن', ikindi: 'ئەسىر', aksam: 'شام', yatsi: 'خۇپتەن' },
  imsakVakti: 'بامدات',
  cuma: 'جۈمە',
  cumaKucuk: 'جۈمە',
  gunesDogusu: 'قۇياش چىقىش',
  gunesDogusuKucuk: 'قۇياش چىقىش',
  durum: { kilindi: 'ئوقۇلدى', vaktiGeldi: 'ۋاقتى كىردى', girmedi: 'تېخى كىرمىدى', gecti: 'ئوقۇلمىدى' },
  durumKucuk: { kilindi: 'ئوقۇلدى', vaktiGeldi: 'ۋاقتى كىردى', girmedi: 'تېخى كىرمىدى', gecti: 'ئوقۇلمىدى' },
  eylem: { kildim: 'ناماز ئوقۇدۇم', kilindi: 'ئوقۇلدى' },
  kerahatVakti: 'مەكرۇھ ۋاقىت',
  isaretle: 'ئوقۇلدى دەپ بەلگىلەڭ',
  geriAlEtiketi: '{durum}، بىكار قىلىش ئۈچۈن چېكىڭ',
  geriAlindi: 'بەلگە ئېلىۋېتىلدى',
};
