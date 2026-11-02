// ÇEVİRİ: bg — İngilizce iskelet, çevrilince bu satır silinir
// `aylar` tarih içi biçim, `aylarYalin` takvim başlığı; Bulgarcada ay adı çekimsiz ve küçük harfli (CLDR "2 ноември 2026 г.", başlık "ноември 2026 г.").
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
