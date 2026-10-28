import type { Sozluk } from '../tr';

/**
 * Arnavutça vakit adları BIK (Kosova) / KMSH takvimi takımıdır. Çizelge satırı da "Sabahu":
 * bislame.net/takvimi tek sabah sütunu taşır ("Sabahu", fecrin girişi), "Imsaku" sütunu yok.
 * Adlar belirli yalın hâldedir; cümleler adı yalın hâlde tutacak biçimde kurulur (ilgi hâli türetilmez).
 * `kucuk` cümle içi biçim (küçük harf); `buyuk` elle yazılır (kodda `toUpperCase` yok).
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Sabahu', gunes: 'Lindja e Diellit', ogle: 'Dreka', ikindi: 'Ikindia', aksam: 'Akshami', yatsi: 'Jacia' },
  buyuk: { imsak: 'SABAHU', gunes: 'LINDJA E DIELLIT', ogle: 'DREKA', ikindi: 'IKINDIA', aksam: 'AKSHAMI', yatsi: 'JACIA' },
  kucuk: { imsak: 'sabahu', gunes: 'lindja e diellit', ogle: 'dreka', ikindi: 'ikindia', aksam: 'akshami', yatsi: 'jacia' },
  imsakVakti: 'Sabahu',
  cuma: 'Xhumaja',
  cumaKucuk: 'xhumaja',
  gunesDogusu: 'Lindja e Diellit',
  gunesDogusuKucuk: 'lindja e diellit',
  durum: { kilindi: 'U fal', vaktiGeldi: 'Ka hyrë koha', girmedi: 'Ende pa hyrë', gecti: 'Nuk u fal' },
  durumKucuk: { kilindi: 'u fal', vaktiGeldi: 'ka hyrë koha', girmedi: 'ende pa hyrë', gecti: 'nuk u fal' },
  /** "E fala" = "(namazı) kıldım", 1. tekil, cinsiyetsiz; durum "U fal" = kılındı. */
  eylem: { kildim: 'E fala', kilindi: 'U fal' },
  kerahatVakti: 'Koha mekruh',
  isaretle: 'Shënojeni si të falur',
  geriAlEtiketi: '{durum}, prekni për ta zhbërë',
  geriAlindi: 'Shënimi u hoq',
};
