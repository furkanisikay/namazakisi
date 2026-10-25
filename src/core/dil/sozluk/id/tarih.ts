import type { Sozluk } from '../tr';

export const tarih: Sozluk['tarih'] = {
  gunler: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
  gunlerKisa: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
  aylar: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
  aylarKisa: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
  haftaHarfleri: ['Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb', 'Mg'],
  uzun: '{gun} {ay} {yil}',
};
