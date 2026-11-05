import type { Sozluk } from '../tr';

/** CLDR ceb: "Nobyembre 5, 2026"; ay ve gün adları büyük harfle, ay çekimsiz ("Septyembre", "Domingo"). */
export const tarih: Sozluk['tarih'] = {
  gunler: ['Domingo', 'Lunes', 'Martes', 'Miyerkules', 'Huwebes', 'Biyernes', 'Sabado'],
  gunlerKisa: ['Dom', 'Lun', 'Mar', 'Miy', 'Huw', 'Biy', 'Sab'],
  aylar: ['Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo', 'Hulyo', 'Agosto', 'Septyembre', 'Oktubre', 'Nobyembre', 'Disyembre'],
  aylarYalin: ['Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo', 'Hulyo', 'Agosto', 'Septyembre', 'Oktubre', 'Nobyembre', 'Disyembre'],
  aylarKisa: ['Ene', 'Peb', 'Mar', 'Abr', 'May', 'Hun', 'Hul', 'Ago', 'Sep', 'Okt', 'Nob', 'Dis'],
  haftaHarfleri: ['Lu', 'Ma', 'Mi', 'Hu', 'Bi', 'Sa', 'Do'],
  uzun: '{ay} {gun}, {yil}',
  gunAdiYil: '{gunAdi}, {yil}',
};
