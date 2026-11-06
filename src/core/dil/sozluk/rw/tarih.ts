import type { Sozluk } from '../tr';

/** Amazina y’amezi n’iminsi ni aya CLDR rw; itariki yandikwa umunsi, ukwezi, umwaka («30 Ukwakira 2026»), nk’uko bikorwa mu Rwanda. */
export const tarih: Sozluk['tarih'] = {
  gunler: ['Ku cyumweru', 'Kuwa mbere', 'Kuwa kabiri', 'Kuwa gatatu', 'Kuwa kane', 'Kuwa gatanu', 'Kuwa gatandatu'],
  gunlerKisa: ['Cyu', 'Mbe', 'Kab', 'Gtu', 'Kan', 'Gnu', 'Gnd'],
  aylar: ['Mutarama', 'Gashyantare', 'Werurwe', 'Mata', 'Gicurasi', 'Kamena', 'Nyakanga', 'Kanama', 'Nzeri', 'Ukwakira', 'Ugushyingo', 'Ukuboza'],
  aylarYalin: ['Mutarama', 'Gashyantare', 'Werurwe', 'Mata', 'Gicurasi', 'Kamena', 'Nyakanga', 'Kanama', 'Nzeri', 'Ukwakira', 'Ugushyingo', 'Ukuboza'],
  aylarKisa: ['Mut', 'Gas', 'Wer', 'Mat', 'Gic', 'Kam', 'Nya', 'Kan', 'Nze', 'Ukw', 'Ugu', 'Uku'],
  haftaHarfleri: ['Mb', 'Kb', 'Gt', 'Kn', 'Gn', 'Gd', 'Cy'],
  uzun: '{gun} {ay} {yil}',
  gunAdiYil: '{gunAdi}, {yil}',
};
