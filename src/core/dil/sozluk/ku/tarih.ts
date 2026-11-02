// `aylar` tarih içi izafet hâli (CLDR "2ê mijdara 2026an"), `aylarYalin` takvim başlığı yalın ("Mijdar 2026").
import type { Sozluk } from '../tr';

export const tarih: Sozluk['tarih'] = {
  gunler: ['Yekşem', 'Duşem', 'Sêşem', 'Çarşem', 'Pêncşem', 'Înî', 'Şemî'],
  gunlerKisa: ['Yşm', 'Dşm', 'Sşm', 'Çşm', 'Pşm', 'Înî', 'Şem'],
  aylar: ['rêbendana', 'sibata', 'adara', 'nîsana', 'gulana', 'hezîrana', 'tîrmeha', 'tebaxa', 'îlona', 'cotmeha', 'mijdara', 'berfanbara'],
  aylarYalin: ['Rêbendan', 'Sibat', 'Adar', 'Nîsan', 'Gulan', 'Hezîran', 'Tîrmeh', 'Tebax', 'Îlon', 'Cotmeh', 'Mijdar', 'Berfanbar'],
  aylarKisa: ['rbn', 'sbt', 'adr', 'nsn', 'gln', 'hzr', 'trm', 'tbx', 'îln', 'cot', 'mjd', 'brf'],
  haftaHarfleri: ['Dş', 'Sş', 'Çş', 'Pş', 'În', 'Şm', 'Yş'],
  uzun: '{gun}ê {ay} {yil}an',
  gunAdiYil: '{gunAdi}, {yil}',
};
