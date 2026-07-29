/**
 * Ayarlar aramasının vurgulayabileceği alt-ayar ("çapa") kimlikleri.
 *
 * Bu id'ler `aramaIndeksi.ts`'teki kayıtlarla eşleşir; hangi çapanın hangi
 * sayfada yaşadığı kaynak koddan doğrulanmıştır (bkz. task-3-brief.md'deki
 * çapa→sayfa tablosu). Vurgu (highlight) altyapısı sonraki görevin işidir —
 * burası yalnız kimlikleri sabitler.
 */
export const CAPALAR = [
  'konumModu',
  'akilliTakip',
  'tema',
  'palet',
  'vakitBildirimleri',
  'cumaHatirlatmasi',
  'vakitSayaci',
  'gunSonuBildirimi',
  'tamGunEsigi',
  'ozelGunModu',
  'iftarSayaci',
  'sahurSayaci',
  'takvimSenkron',
  'muhafizAnaSwitch',
  'muhafizYogunluk',
  'disaAktar',
  'iceAktar',
] as const;

export type CapaId = (typeof CAPALAR)[number];
