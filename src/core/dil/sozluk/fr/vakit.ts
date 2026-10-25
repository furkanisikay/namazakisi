import type { Sozluk } from '../tr';

/**
 * Fransızcada vakit adları özel addır (Fransa/Belçika varsayılan takımı: Fajr, Lever du soleil,
 * Dhuhr, Asr, Maghrib, Isha; Mağrip biçimleri ayrı seçenek takımıdır, burada değil).
 * Cümle içinde de büyük harfle başlar, yalnız "lever du soleil" küçük harflidir.
 * Ad, artikel/elizyon sorunu çıkmasın diye cümlede özne ya da iki noktadan sonra durur.
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Fajr', gunes: 'Lever du soleil', ogle: 'Dhuhr', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isha' },
  buyuk: { imsak: 'FAJR', gunes: 'LEVER DU SOLEIL', ogle: 'DHUHR', ikindi: 'ASR', aksam: 'MAGHRIB', yatsi: 'ISHA' },
  kucuk: { imsak: 'Fajr', gunes: 'lever du soleil', ogle: 'Dhuhr', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isha' },
  imsakVakti: 'Imsak',
  cuma: 'Joumoua',
  cumaKucuk: 'Joumoua',
  gunesDogusu: 'Lever du soleil',
  gunesDogusuKucuk: 'lever du soleil',
  durum: { kilindi: 'Accomplie', vaktiGeldi: 'C’est l’heure', girmedi: 'Pas encore l’heure', gecti: 'Non accomplie' },
  durumKucuk: { kilindi: 'accomplie', vaktiGeldi: 'c’est l’heure', girmedi: 'pas encore l’heure', gecti: 'non accomplie' },
  eylem: { kildim: 'J’ai prié', kilindi: 'Accomplie' },
  kerahatVakti: 'Moment makrouh',
  isaretle: 'Marquer comme accomplie',
  geriAlEtiketi: '{durum}, touchez pour annuler',
  geriAlindi: 'Marque retirée',
};
