import type { Sozluk } from '../tr';

/**
 * İsveççe terim kararları (kaynak: scratchpad dalga 10 terim tablosu; Islamiska Förbundet bönetider,
 * HadeethEnc sv, QuranEnc `swedish_rwwad`, Stockholms moské):
 * - Vakit adları Arapça özel ad (Fajr · Dhuhr · Asr · Maghrib · Isha; HadeethEnc ve IF yazımı),
 *   güneş İsveççe "soluppgång" (meal 50:39, Stockholms moské). Özel adlar cümle içinde de büyük
 *   harfle başlar; yalnız "soluppgång" cins isimdir (`kucuk`). `buyuk` elle (Å). Betimleyici
 *   "nattbönen" kullanılmaz (Vikipedi yatsı, HadeethEnc teheccüd der).
 * - Namaz "bön/bönen" (meal, HadeethEnc, IF), kılmak "be"; ibadete çağrı "Förrätta bönen" (17:78).
 * - Cuma "fredagsbön", cami "moské", abdest "tvagning", ezan "böneutrop", Kur'an "Koranen",
 *   nafile "frivillig bön"; arayüzde "Allah" (meal "Gud" der, HadeethEnc ve IF "Allah").
 * - Kıble "Qibla" (Vikipedi; açıklamada "böneriktning"), kaza "qada", kerahat "makruh-tid",
 *   seri "svit", muhafız "Bönevakt" — bu dördü kaynaksız, yerli okuyucu baksın.
 * - "Kıldım" = "Jag har bett", "Kılındı" = "Förrättad" (türetildi; "bett" tek başına "ısırık"
 *   anlamına da geldiği için durum etiketinde kullanılmaz).
 * - Hitap "du" (İsveççede yazılı kibar ayrı zamir yok, "ni" yok); mümkünse zamirsiz emir.
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Fajr', gunes: 'Soluppgång', ogle: 'Dhuhr', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isha' },
  buyuk: { imsak: 'FAJR', gunes: 'SOLUPPGÅNG', ogle: 'DHUHR', ikindi: 'ASR', aksam: 'MAGHRIB', yatsi: 'ISHA' },
  kucuk: { imsak: 'Fajr', gunes: 'soluppgång', ogle: 'Dhuhr', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isha' },
  /** Çizelgedeki sabah satırı fecir adıdır (IF çizelgesi "Fajr"), "Imsak" değil. */
  imsakVakti: 'Fajr',
  cuma: 'Fredagsbön',
  cumaKucuk: 'fredagsbön',
  gunesDogusu: 'Soluppgång',
  gunesDogusuKucuk: 'soluppgång',
  durum: { kilindi: 'Förrättad', vaktiGeldi: 'Dags att be', girmedi: 'Inte inne än', gecti: 'Inte förrättad' },
  durumKucuk: { kilindi: 'förrättad', vaktiGeldi: 'dags att be', girmedi: 'inte inne än', gecti: 'inte förrättad' },
  eylem: { kildim: 'Jag har bett', kilindi: 'Förrättad' },
  kerahatVakti: 'Makruh-tid',
  isaretle: 'Markera som förrättad',
  geriAlEtiketi: '{durum}, tryck för att ångra',
  geriAlindi: 'Markering borttagen',
};
