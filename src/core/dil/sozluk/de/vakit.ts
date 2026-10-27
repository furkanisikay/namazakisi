import type { Sozluk } from '../tr';

/**
 * Almancada vakit adları özel addır (temel takım; seçenekler `core/dil/vakitTakimlari.ts`). Almancada
 * isimler cümle içinde de büyük harfle başlar → `kucuk` adlarla aynıdır; yalnız sıfat/ortaç
 * biçimleri (`durumKucuk`) küçük yazılır.
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Fajr', gunes: 'Sonnenaufgang', ogle: 'Dhuhr', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isha' },
  buyuk: { imsak: 'FAJR', gunes: 'SONNENAUFGANG', ogle: 'DHUHR', ikindi: 'ASR', aksam: 'MAGHRIB', yatsi: 'ISHA' },
  kucuk: { imsak: 'Fajr', gunes: 'Sonnenaufgang', ogle: 'Dhuhr', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isha' },
  /** Mawaqit vb.'de "Imsak" Fajr'dan ~10 dk önceki ihtiyat saatidir; uygulamanın imsak saati fecrin girişidir (Diyanet DE takımı "Imsak" der: Diyanet'te ikisi aynı saattir). */
  imsakVakti: 'Fajr',
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
