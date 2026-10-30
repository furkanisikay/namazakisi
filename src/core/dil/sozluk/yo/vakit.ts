import type { Sozluk } from '../tr';

/**
 * Yoruba terim kararları (kaynak: QuranEnc `yoruba_mikail` meali; scratchpad terim tablosu).
 * - Namaz "ìrun", kılmak "kírun" (11:114 tekil emir "Kírun", 2:43 çoğul/saygı "Ẹ kírun").
 * - Vakit adları mealin Arapça kökenli yazımı (17:78 ve 11:114 dipnotları): Subh, Ṭḥuhr, ‘Asr,
 *   Mọgrib, ‘Iṣā’. Yerli adlar (Àsùbáà, Ààsìrì…) DOĞRULANMADI, bilinçli olarak kullanılmadı.
 *   Özel ad oldukları için cümle içinde de büyük harfle başlar. Güneş doğuşu "yíyọ òòrùn" (50:39).
 * - Cuma namazı "Jum‘ah" (62:9); haftanın günü adı ayrıdır (`tarih.gunler`: Ọjọ́ Ẹtì, CLDR).
 * - Kıble "Ƙiblah" (2:144), cami "mọ́sálásí" (9:18), Allah "Allāhu" (meal yazımı).
 * - "Kıldım" = "Mo ti kírun", "Kılındı" = "Ti kírun": kaynaklı kökten türetildi, yerli okuyucu baksın.
 * - Kaza "Ƙaḍā’", nafile "àṣegbọrẹ" (17:79 "iṣẹ́ àṣegbọrẹ"), ezan "ìpè ìrun" (62:9 "pe ìrun"),
 *   abdest "àlùwàlá": DOĞRULANMADI.
 * Metinler NFC'dir.
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Subh', gunes: 'Yíyọ òòrùn', ogle: 'Ṭḥuhr', ikindi: '‘Asr', aksam: 'Mọgrib', yatsi: '‘Iṣā’' },
  buyuk: { imsak: 'SUBH', gunes: 'YÍYỌ ÒÒRÙN', ogle: 'ṬḤUHR', ikindi: '‘ASR', aksam: 'MỌGRIB', yatsi: '‘IṢĀ’' },
  kucuk: { imsak: 'Subh', gunes: 'yíyọ òòrùn', ogle: 'Ṭḥuhr', ikindi: '‘Asr', aksam: 'Mọgrib', yatsi: '‘Iṣā’' },
  imsakVakti: 'Subh',
  cuma: 'Jum‘ah',
  cumaKucuk: 'Jum‘ah',
  gunesDogusu: 'Yíyọ òòrùn',
  gunesDogusuKucuk: 'yíyọ òòrùn',
  durum: { kilindi: 'Ti kírun', vaktiGeldi: 'Àkókò ti tó', girmedi: 'Àkókò kò tíì tó', gecti: 'Kò kírun' },
  durumKucuk: { kilindi: 'ti kírun', vaktiGeldi: 'àkókò ti tó', girmedi: 'àkókò kò tíì tó', gecti: 'kò kírun' },
  eylem: { kildim: 'Mo ti kírun', kilindi: 'Ti kírun' },
  kerahatVakti: 'Àkókò makrūh',
  isaretle: 'Sàmì sí i pé ẹ ti kírun',
  geriAlEtiketi: '{durum}, ẹ tẹ̀ ẹ́ láti dá a padà',
  geriAlindi: 'A ti yọ àmì náà kúrò',
};
