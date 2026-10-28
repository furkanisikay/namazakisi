// ÇEVİRİ: ps — İngilizce iskelet, çevrilince bu satır silinir
import type { Sozluk } from '../tr';

/** İngilizcede vakit adları özel addır; cümle içinde de büyük harfle başlar. */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Fajr', gunes: 'Sunrise', ogle: 'Dhuhr', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isha' },
  buyuk: { imsak: 'FAJR', gunes: 'SUNRISE', ogle: 'DHUHR', ikindi: 'ASR', aksam: 'MAGHRIB', yatsi: 'ISHA' },
  kucuk: { imsak: 'Fajr', gunes: 'sunrise', ogle: 'Dhuhr', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isha' },
  imsakVakti: 'Fajr',
  cuma: "Jumu'ah",
  cumaKucuk: "Jumu'ah",
  gunesDogusu: 'Sunrise',
  gunesDogusuKucuk: 'sunrise',
  durum: { kilindi: 'Prayed', vaktiGeldi: 'Time to pray', girmedi: 'Not yet time', gecti: 'Not prayed' },
  durumKucuk: { kilindi: 'prayed', vaktiGeldi: 'time to pray', girmedi: 'not yet time', gecti: 'not prayed' },
  eylem: { kildim: "I've prayed", kilindi: 'Prayed' },
  kerahatVakti: 'Makruh time',
  isaretle: 'Mark as prayed',
  geriAlEtiketi: '{durum}, tap to undo',
  geriAlindi: 'Unmarked',
};
