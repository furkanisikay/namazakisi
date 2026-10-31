// ÇEVİRİ: sr — İngilizce iskelet, çevrilince bu satır silinir
// `aylar` tarih içi biçim: CLDR yalın yazar ("31. октобар 2026."), günlük yazımda ilgi hâli ("31. октобра") de yaygın — çevirmen seçer; `aylarYalin` takvim başlığı ("октобар 2026"); tarih sonda nokta taşır.
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
