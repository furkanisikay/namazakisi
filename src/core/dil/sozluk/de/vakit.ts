import type { Sozluk } from '../tr';

/**
 * Almancada vakit adları özel addır (geçici temel takım; ülkeye göre biçim sonra). Almancada
 * isimler cümle içinde de büyük harfle başlar → `kucuk` adlarla aynıdır; yalnız sıfat/ortaç
 * biçimleri (`durumKucuk`) küçük yazılır.
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Fajr', gunes: 'Sonnenaufgang', ogle: 'Dhuhr', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isha' },
  buyuk: { imsak: 'FAJR', gunes: 'SONNENAUFGANG', ogle: 'DHUHR', ikindi: 'ASR', aksam: 'MAGHRIB', yatsi: 'ISHA' },
  kucuk: { imsak: 'Fajr', gunes: 'Sonnenaufgang', ogle: 'Dhuhr', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isha' },
  imsakVakti: 'Imsak',
  cuma: 'Freitagsgebet',
  cumaKucuk: 'Freitagsgebet',
  gunesDogusu: 'Sonnenaufgang',
  gunesDogusuKucuk: 'Sonnenaufgang',
  durum: { kilindi: 'Gebetet', vaktiGeldi: 'Gebetszeit', girmedi: 'Noch nicht begonnen', gecti: 'Nicht gebetet' },
  durumKucuk: { kilindi: 'gebetet', vaktiGeldi: 'Gebetszeit', girmedi: 'noch nicht begonnen', gecti: 'nicht gebetet' },
  eylem: { kildim: 'Ich habe gebetet', kilindi: 'Gebetet' },
  kerahatVakti: 'Makruh-Zeit',
  isaretle: 'Als gebetet markieren',
  geriAlEtiketi: '{durum}, zum Rückgängigmachen tippen',
  geriAlindi: 'Markierung entfernt',
};
