// Dagbanide `buyuk` elle yazılır (`toUpperCase` YASAK; ɛ ɔ ŋ ɣ ʒ → Ɛ Ɔ Ŋ Ɣ Ʒ).
import type { Sozluk } from '../tr';

/**
 * Dagbani (Gana; Latin ɛ ɣ ŋ ʒ ɔ). Namaz "jiŋli" (QuranEnc `dagbani_ghatubo` 2:43 "Puhimi ya
 * jiŋli"), kılmak "puhi jiŋli", çoğul "jiŋa". QE camiyi de "jiŋli" der (17:1 "Makka jiŋli",
 * 9:108): ayrım bağlamdan, camiler çoğul "jiŋa".
 * Vakit adları: Subaahi (QE 24:58) · Wuntaŋ puhibu (QE 18:90, 20:130 "güneşin doğuşu",
 * betimleyici) · Azafari (yalnız dag.wikipedia "Asalaati") · Lahisari (QE 2:238) · Magarbi (QE
 * 11:114 dipnotu, tek tanık; Vikipedi "Mangaribi") · Isha’i (QE 24:58). Cuma Alizumma (QE 62:9).
 * Cümle içinde de özel ad (büyük harfle); yalnız güneş doğuşu cümlede küçük.
 * "Kıldım" N puhi jiŋli, durum "Puhiya" (türetildi: QE'de 1. tekil tanık yok). Kerahat "makruhi
 * saha" (Arapça kökenli, türetildi).
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Subaahi', gunes: 'Wuntaŋ puhibu', ogle: 'Azafari', ikindi: 'Lahisari', aksam: 'Magarbi', yatsi: 'Isha’i' },
  buyuk: { imsak: 'SUBAAHI', gunes: 'WUNTAŊ PUHIBU', ogle: 'AZAFARI', ikindi: 'LAHISARI', aksam: 'MAGARBI', yatsi: 'ISHA’I' },
  kucuk: { imsak: 'Subaahi', gunes: 'wuntaŋ puhibu', ogle: 'Azafari', ikindi: 'Lahisari', aksam: 'Magarbi', yatsi: 'Isha’i' },
  imsakVakti: 'Subaahi',
  cuma: 'Alizumma',
  cumaKucuk: 'Alizumma',
  gunesDogusu: 'Wuntaŋ puhibu',
  gunesDogusuKucuk: 'wuntaŋ puhibu',
  durum: { kilindi: 'Puhiya', vaktiGeldi: 'Saha paaya', girmedi: 'Saha na bi paai', gecti: 'Bi puhi' },
  durumKucuk: { kilindi: 'puhiya', vaktiGeldi: 'saha paaya', girmedi: 'saha na bi paai', gecti: 'bi puhi' },
  /** "N puhi jiŋli" = kişinin kendi beyanı (1. tekil, cinsiyetsiz); durum "Puhiya". */
  eylem: { kildim: 'N puhi jiŋli', kilindi: 'Puhiya' },
  kerahatVakti: 'Makruhi saha',
  isaretle: 'Dalimmi ya ni yi puhi',
  geriAlEtiketi: '{durum}, dihimi ya n-labi li',
  geriAlindi: 'Dalibu maa yihiya',
};
