// Lugandada `buyuk` elle yazılır (`toUpperCase` YASAK; ŋ → Ŋ).
import type { Sozluk } from '../tr';

/** Vakit adları IslamHouse lg (OKWETUKUZA N’ESSWALA); güneş doğuşu QE 15:73 kökünden türetildi. */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Subuhi', gunes: 'Enjuba okuvaayo', ogle: 'Dhuhur', ikindi: 'Aswiri', aksam: 'Magaribi', yatsi: 'Ishai' },
  buyuk: { imsak: 'SUBUHI', gunes: 'ENJUBA OKUVAAYO', ogle: 'DHUHUR', ikindi: 'ASWIRI', aksam: 'MAGARIBI', yatsi: 'ISHAI' },
  kucuk: { imsak: 'Subuhi', gunes: 'enjuba okuvaayo', ogle: 'Dhuhur', ikindi: 'Aswiri', aksam: 'Magaribi', yatsi: 'Ishai' },
  imsakVakti: 'Subuhi',
  cuma: 'Ejjuma',
  cumaKucuk: 'Ejjuma',
  gunesDogusu: 'Enjuba okuvaayo',
  gunesDogusuKucuk: 'enjuba okuvaayo',
  durum: { kilindi: 'Esaaliddwa', vaktiGeldi: 'Ekiseera kituuse', girmedi: 'Tekinnatuuka', gecti: 'Tesaaliddwa' },
  durumKucuk: { kilindi: 'esaaliddwa', vaktiGeldi: 'ekiseera kituuse', girmedi: 'tekinnatuuka', gecti: 'tesaaliddwa' },
  eylem: { kildim: 'Nsaaze', kilindi: 'Esaaliddwa' },
  kerahatVakti: 'Ekiseera ekikyayibwa',
  isaretle: 'Laga nti osaaze',
  geriAlEtiketi: '{durum}, nyiga okukomyawo',
  geriAlindi: 'Akabonero kaggyiddwawo',
};
