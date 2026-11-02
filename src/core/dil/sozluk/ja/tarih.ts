// ÇEVİRİ: ja — İngilizce iskelet, çevrilince bu satır silinir
// Tarih kalıbı Çince deseni: `uzun` "{yil}年{ay}{gun}日", `aylar` "1月"…"12月" → "2026年11月2日"; `gunAdiYil` "{yil}年 {gunAdi}".
import type { Sozluk } from '../tr';

export const tarih: Sozluk['tarih'] = {
  gunler: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  gunlerKisa: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  aylar: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  aylarYalin: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  aylarKisa: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  haftaHarfleri: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  uzun: '{gun} {ay} {yil}',
  gunAdiYil: '{gunAdi}, {yil}',
};
