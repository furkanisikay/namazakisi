// ÇEVİRİ: ro — İngilizce iskelet, çevrilince bu satır silinir
// Rumencede ay adı tarihte de yalın (CLDR "31 octombrie 2026"): `aylar` ile `aylarYalin` aynı biçim; ay adı küçük harfle başlar.
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
