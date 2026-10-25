import type { Sozluk } from '../tr';

/**
 * Boşnakça vakit adları IZ BiH (vaktija.ba) takımıdır; namaz "sabah", çizelgedeki vakit satırı "Zora"dır
 * (Türkçedeki Sabah / İmsak ayrımı). `kucuk` cümle içi biçim; Boşnakçada
 * vakit adı küçük harfle yazılır. `buyuk` elle yazılır (kodda `toUpperCase` yok).
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Sabah', gunes: 'Izlazak sunca', ogle: 'Podne', ikindi: 'Ikindija', aksam: 'Akšam', yatsi: 'Jacija' },
  buyuk: { imsak: 'SABAH', gunes: 'IZLAZAK SUNCA', ogle: 'PODNE', ikindi: 'IKINDIJA', aksam: 'AKŠAM', yatsi: 'JACIJA' },
  kucuk: { imsak: 'sabah', gunes: 'izlazak sunca', ogle: 'podne', ikindi: 'ikindija', aksam: 'akšam', yatsi: 'jacija' },
  imsakVakti: 'Zora',
  cuma: 'Džuma',
  cumaKucuk: 'džuma',
  gunesDogusu: 'Izlazak sunca',
  gunesDogusuKucuk: 'izlazak sunca',
  durum: { kilindi: 'Klanjano', vaktiGeldi: 'Nastupilo vrijeme', girmedi: 'Još nije nastupilo', gecti: 'Nije klanjano' },
  durumKucuk: { kilindi: 'klanjano', vaktiGeldi: 'nastupilo vrijeme', girmedi: 'još nije nastupilo', gecti: 'nije klanjano' },
  /** Cinsiyetsiz kalıp: "klanjao/klanjala sam" yerine edilgen "Klanjano". */
  eylem: { kildim: 'Klanjano', kilindi: 'Klanjano' },
  kerahatVakti: 'Mekruh vrijeme',
  isaretle: 'Označi kao klanjano',
  geriAlEtiketi: '{durum}, dodirnite za poništavanje',
  geriAlindi: 'Oznaka uklonjena',
};
