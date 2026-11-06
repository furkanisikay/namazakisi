import type { Sozluk } from '../tr';

/**
 * İsveççede gün ve ay adları küçük harfle yazılır (CLDR sv: "31 oktober 2026", "lördag 31 oktober");
 * ay adının hâli yok (`aylar` = `aylarYalin`), takvim başlığında tek başına büyük harfle başlar.
 */
export const tarih: Sozluk['tarih'] = {
  gunler: ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'],
  gunlerKisa: ['sön', 'mån', 'tis', 'ons', 'tors', 'fre', 'lör'],
  aylar: ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'],
  aylarYalin: ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'],
  aylarKisa: ['jan.', 'feb.', 'mars', 'apr.', 'maj', 'juni', 'juli', 'aug.', 'sep.', 'okt.', 'nov.', 'dec.'],
  /** Pazartesi başlar (CLDR dar biçim tek harf ve iki T'li olduğu için iki harf). */
  haftaHarfleri: ['må', 'ti', 'on', 'to', 'fr', 'lö', 'sö'],
  uzun: '{gun} {ay} {yil}',
  gunAdiYil: '{gunAdi} {yil}',
};
