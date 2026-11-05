// Ikinyarwanda: `buyuk` yandikwa n’intoki (`toUpperCase` IRABUJIJWE).
import type { Sozluk } from '../tr';

/** Amazina y’ibihe by’iswala ya HadeethEnc (rw); ni amazina bwite, atangirwa n’inyuguti nkuru no mu nteruro (uretse «izuba rirashe»). */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Fajri', gunes: 'Izuba rirashe', ogle: 'Adhuhuri', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isha' },
  buyuk: { imsak: 'FAJRI', gunes: 'IZUBA RIRASHE', ogle: 'ADHUHURI', ikindi: 'ASR', aksam: 'MAGHRIB', yatsi: 'ISHA' },
  kucuk: { imsak: 'Fajri', gunes: 'izuba rirashe', ogle: 'Adhuhuri', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isha' },
  imsakVakti: 'Fajri',
  cuma: 'Ijuma',
  cumaKucuk: 'Ijuma',
  gunesDogusu: 'Izuba rirashe',
  gunesDogusuKucuk: 'izuba rirashe',
  durum: { kilindi: 'Yasaliwe', vaktiGeldi: 'Igihe kirageze', girmedi: 'Igihe ntikiragera', gecti: 'Ntiyasaliwe' },
  durumKucuk: { kilindi: 'yasaliwe', vaktiGeldi: 'igihe kirageze', girmedi: 'igihe ntikiragera', gecti: 'ntiyasaliwe' },
  eylem: { kildim: 'Nasali', kilindi: 'Yasaliwe' },
  kerahatVakti: 'Igihe kidakwiye',
  isaretle: 'Kwemeza ko yasaliwe',
  geriAlEtiketi: '{durum}, mukande mwisubireho',
  geriAlindi: 'Byakuweho',
};
