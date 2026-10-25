import type { Sozluk } from '../tr';

/** Fransızcada gün ve ay adları küçük harfle yazılır ("samedi 24 octobre 2026"). */
export const tarih: Sozluk['tarih'] = {
  gunler: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  gunlerKisa: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  aylar: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  aylarKisa: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  haftaHarfleri: ['lu', 'ma', 'me', 'je', 've', 'sa', 'di'],
  uzun: '{gun} {ay} {yil}',
};
