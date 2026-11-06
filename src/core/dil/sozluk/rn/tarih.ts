import type { Sozluk } from '../tr';

/** CLDR rn: "4 Munyonyo 2026", gün "Ku wa gatatu". Kısa ay ve gün adları uzun adlardan türetildi (ICU kısaltmaları uzun adlarla örtüşmüyor). */
export const tarih: Sozluk['tarih'] = {
  gunler: ['Ku w’indwi', 'Ku wa mbere', 'Ku wa kabiri', 'Ku wa gatatu', 'Ku wa kane', 'Ku wa gatanu', 'Ku wa gatandatu'],
  gunlerKisa: ['Cu.', 'Mbe.', 'Kab.', 'Gtu.', 'Kan.', 'Gnu.', 'Gnd.'],
  aylar: ['Nzero', 'Ruhuhuma', 'Ntwarante', 'Ndamukiza', 'Rusama', 'Ruheshi', 'Mukakaro', 'Nyandagaro', 'Nyakanga', 'Gitugutu', 'Munyonyo', 'Kigarama'],
  aylarYalin: ['Nzero', 'Ruhuhuma', 'Ntwarante', 'Ndamukiza', 'Rusama', 'Ruheshi', 'Mukakaro', 'Nyandagaro', 'Nyakanga', 'Gitugutu', 'Munyonyo', 'Kigarama'],
  aylarKisa: ['Nze.', 'Ruhu.', 'Ntw.', 'Nda.', 'Rus.', 'Ruhe.', 'Muk.', 'Nyand.', 'Nyak.', 'Gitu.', 'Muny.', 'Kig.'],
  haftaHarfleri: ['Mb', 'Kb', 'Gt', 'Kn', 'Gn', 'Gd', 'In'],
  uzun: '{gun} {ay} {yil}',
  gunAdiYil: '{gunAdi}, {yil}',
};
