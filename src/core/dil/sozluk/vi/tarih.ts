import type { Sozluk } from '../tr';

/** CLDR vi: ay sayıyla ("tháng 10"); uzun tarih "31 tháng 10, 2026"; başlık "Tháng 10 2026". */
export const tarih: Sozluk['tarih'] = {
  gunler: ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'],
  gunlerKisa: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
  aylar: ['tháng 1', 'tháng 2', 'tháng 3', 'tháng 4', 'tháng 5', 'tháng 6', 'tháng 7', 'tháng 8', 'tháng 9', 'tháng 10', 'tháng 11', 'tháng 12'],
  aylarYalin: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
  aylarKisa: ['Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6', 'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12'],
  haftaHarfleri: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
  uzun: '{gun} {ay}, {yil}',
};
