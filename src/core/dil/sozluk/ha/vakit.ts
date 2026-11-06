import type { Sozluk } from '../tr';

/**
 * Hausa (Nijerya imlası): kancalı ɓ ɗ ƙ, ʼy; gırtlak durağı ve kesme her yerde ʼ (U+02BC, CLDR
 * "Jummaʼa" ile aynı); ton/uzunluk işareti YOK (Gummi mealindeki ã ẽ arayüze taşınmaz).
 * Vakit adları (IslamHouse "Lokutan Sallah", FirdawsWay ha, QuranEnc `hausa_gummi`): Asuba ·
 * Fitowar Rana · Azahar · Laʼasar · Magariba · Isha; `imsakVakti` = "Asuba" (fecir). Cümle içinde de
 * özel ad (büyük harfle); yalnız güneş doğuşu cümlede küçük ("fitowar rana"). `buyuk` elle yazılır.
 * Hitap: arayüzde düğme/etiket çıplak fiil (kişisiz: "Ajiye", "Rufe"), açıklama cümlesinde 2. çoğul
 * "ku" + iyelik "-ku/-nku" ("Ku zaɓi birninku"; kibar tekil "siz" için kaynak yok); ibadete çağrı
 * tekil "Ka …" (17:78 "Ka tsayar da salla"). Terimler: salla (namaz; tek başına "Sallah" bayram da
 * demektir, tebrikte kullanılmaz), Jumuʼa, Alƙibla, masallaci, ramuwa (kaza; "sallar da za a rama"),
 * Littafin ramuwa (Kaza Defteri), nafila, wutiri, tahajjudi, walaha (kuşluk), kasaru (kasr), kiran
 * salla (ezan), alwala, lokacin makaruhi (kerahat), Hanyar lissafi (hesap yöntemi), Mai Tsaron Salla
 * (Namaz Muhafızı), jeri (seri), farfaɗowa (toparlanma), matafiyi (seferî), Saituna, sanarwa,
 * tunatarwa, wuri (konum), karatu da murya (sesli okuma). "Na yi salla" (Kıldım) / "An yi salla"
 * (Kılındı) türetilmiştir: yerli okuyucu doğrulamalı.
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Asuba', gunes: 'Fitowar Rana', ogle: 'Azahar', ikindi: 'Laʼasar', aksam: 'Magariba', yatsi: 'Isha' },
  buyuk: { imsak: 'ASUBA', gunes: 'FITOWAR RANA', ogle: 'AZAHAR', ikindi: 'LAʼASAR', aksam: 'MAGARIBA', yatsi: 'ISHA' },
  kucuk: { imsak: 'Asuba', gunes: 'fitowar rana', ogle: 'Azahar', ikindi: 'Laʼasar', aksam: 'Magariba', yatsi: 'Isha' },
  imsakVakti: 'Asuba',
  cuma: 'Jumuʼa',
  cumaKucuk: 'Jumuʼa',
  gunesDogusu: 'Fitowar rana',
  gunesDogusuKucuk: 'fitowar rana',
  durum: { kilindi: 'An yi salla', vaktiGeldi: 'Lokaci ya yi', girmedi: 'Lokaci bai yi ba', gecti: 'Ba a yi ba' },
  durumKucuk: { kilindi: 'an yi salla', vaktiGeldi: 'lokaci ya yi', girmedi: 'lokaci bai yi ba', gecti: 'ba a yi ba' },
  /** "Na yi salla" = kişinin kendi beyanı (1. tekil, cinsiyetsiz); durum "An yi salla". */
  eylem: { kildim: 'Na yi salla', kilindi: 'An yi salla' },
  kerahatVakti: 'Lokacin makaruhi',
  isaretle: 'Yi alama an yi salla',
  geriAlEtiketi: '{durum}, ku taɓa don sokewa',
  geriAlindi: 'An cire alamar',
};
