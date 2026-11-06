/**
 * Vakit adları ve namaz durumu. Anahtarlar `VakitAdi` kodlarıdır (depolama anahtarı;
 * çevrilmez). `buyuk`/`kucuk` sabit haritadır: `toUpperCase`/`toLowerCase` Türkçe İ/ı'yı bozar.
 */
export const vakit = {
  adlar: { imsak: 'Sabah', gunes: 'Güneş', ogle: 'Öğle', ikindi: 'İkindi', aksam: 'Akşam', yatsi: 'Yatsı' },
  buyuk: { imsak: 'SABAH', gunes: 'GÜNEŞ', ogle: 'ÖĞLE', ikindi: 'İKİNDİ', aksam: 'AKŞAM', yatsi: 'YATSI' },
  /** Cümle içinde ("… yatsı bugün 6 sa 40 dk"). */
  kucuk: { imsak: 'sabah', gunes: 'güneş', ogle: 'öğle', ikindi: 'ikindi', aksam: 'akşam', yatsi: 'yatsı' },
  /** Vakit çizelgesinde sabahın başlangıcı (Diyanet "İmsak"). */
  imsakVakti: 'İmsak',
  /** Cuma günü öğlenin GÖRÜNEN adı (kimlik hep öğledir). */
  cuma: 'Cuma',
  cumaKucuk: 'cuma',
  gunesDogusu: 'Güneş doğuşu',
  gunesDogusuKucuk: 'güneş doğuşu',
  /** Namaz durumu (sentence case) ve cümle içi küçük hâli. */
  durum: { kilindi: 'Kılındı', vaktiGeldi: 'Vakti geldi', girmedi: 'Henüz girmedi', gecti: 'Kılınmadı' },
  durumKucuk: { kilindi: 'kılındı', vaktiGeldi: 'vakti geldi', girmedi: 'henüz girmedi', gecti: 'kılınmadı' },
  /** Tek eylem adı: düğme "Kıldım", sonuç "Kılındı". */
  eylem: { kildim: 'Kıldım', kilindi: 'Kılındı' },
  kerahatVakti: 'Kerahat vakti',
  isaretle: 'Kılındı olarak işaretle',
  geriAlEtiketi: '{durum}, geri almak için dokunun',
  geriAlindi: 'İşaret kaldırıldı',
} as const;
