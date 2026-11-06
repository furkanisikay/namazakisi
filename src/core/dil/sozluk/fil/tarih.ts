import type { Sozluk } from '../tr';

/** CLDR fil: "Nobyembre 4, 2026"; ay ve gün adları büyük harfle, ay çekimsiz. */
export const tarih: Sozluk['tarih'] = {
  gunler: ['Linggo', 'Lunes', 'Martes', 'Miyerkules', 'Huwebes', 'Biyernes', 'Sabado'],
  gunlerKisa: ['Lin', 'Lun', 'Mar', 'Miy', 'Huw', 'Biy', 'Sab'],
  aylar: ['Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo', 'Hulyo', 'Agosto', 'Setyembre', 'Oktubre', 'Nobyembre', 'Disyembre'],
  aylarYalin: ['Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo', 'Hulyo', 'Agosto', 'Setyembre', 'Oktubre', 'Nobyembre', 'Disyembre'],
  aylarKisa: ['Ene', 'Peb', 'Mar', 'Abr', 'May', 'Hun', 'Hul', 'Ago', 'Set', 'Okt', 'Nob', 'Dis'],
  haftaHarfleri: ['Lu', 'Ma', 'Mi', 'Hu', 'Bi', 'Sa', 'Li'],
  uzun: '{ay} {gun}, {yil}',
  gunAdiYil: '{gunAdi}, {yil}',
};
