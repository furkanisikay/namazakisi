// Akan (Twi) dilinde `buyuk` elle yazılır (`toUpperCase` YASAK; ɛ ɔ → Ɛ Ɔ).
import type { Sozluk } from '../tr';

/**
 * Akan vakit adları: QE `asante_harun` yalnız "Asr"ı (2:238) Arapça adla verir; öteki adlar
 * Latin Arapça yazımla (Fajr, Dhuhr, Maghrib, Isha; türetildi), güneş doğuşu QE 20:130 "awia apue".
 * Cuma HadeethEnc ak "Efiada" (Cuma namazı anlamında da). Namaz QE "Nyamefrɛ"; fiil "yɛ Nyamefrɛ".
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Fajr', gunes: 'Awia apue', ogle: 'Dhuhr', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isha' },
  buyuk: { imsak: 'FAJR', gunes: 'AWIA APUE', ogle: 'DHUHR', ikindi: 'ASR', aksam: 'MAGHRIB', yatsi: 'ISHA' },
  kucuk: { imsak: 'Fajr', gunes: 'awia apue', ogle: 'Dhuhr', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isha' },
  imsakVakti: 'Fajr',
  cuma: 'Efiada',
  cumaKucuk: 'Efiada',
  gunesDogusu: 'Awia apue',
  gunesDogusuKucuk: 'awia apue',
  durum: { kilindi: 'Wɔayɛ', vaktiGeldi: 'Berɛ adu', girmedi: 'Berɛ nnuruiɛ', gecti: 'Wɔanyɛ' },
  durumKucuk: { kilindi: 'wɔayɛ', vaktiGeldi: 'berɛ adu', girmedi: 'berɛ nnuruiɛ', gecti: 'wɔanyɛ' },
  eylem: { kildim: 'Mayɛ Nyamefrɛ', kilindi: 'Wɔayɛ' },
  kerahatVakti: 'Makruh berɛ',
  isaretle: 'Kyerɛ sɛ mayɛ',
  geriAlEtiketi: '{durum}, mia so na yi',
  geriAlindi: 'Wɔayi',
};
