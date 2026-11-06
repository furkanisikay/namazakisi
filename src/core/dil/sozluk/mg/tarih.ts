import type { Sozluk } from '../tr';

/** CLDR mg gün ve ay adları (büyük harfle). `haftaHarfleri` türetildi: CLDR dar biçimi ayırt etmez (A/A/T/A/A/Z/A). */
export const tarih: Sozluk['tarih'] = {
  gunler: ['Alahady', 'Alatsinainy', 'Talata', 'Alarobia', 'Alakamisy', 'Zoma', 'Asabotsy'],
  gunlerKisa: ['Alah', 'Alats', 'Tal', 'Alar', 'Alak', 'Zom', 'Asab'],
  aylar: ['Janoary', 'Febroary', 'Martsa', 'Aprily', 'Mey', 'Jona', 'Jolay', 'Aogositra', 'Septambra', 'Oktobra', 'Novambra', 'Desambra'],
  aylarYalin: ['Janoary', 'Febroary', 'Martsa', 'Aprily', 'Mey', 'Jona', 'Jolay', 'Aogositra', 'Septambra', 'Oktobra', 'Novambra', 'Desambra'],
  aylarKisa: ['Jan', 'Feb', 'Mar', 'Apr', 'Mey', 'Jon', 'Jol', 'Aog', 'Sep', 'Okt', 'Nov', 'Des'],
  haftaHarfleri: ['Ts', 'Ta', 'Ar', 'Ak', 'Zo', 'As', 'Ah'],
  uzun: '{gun} {ay} {yil}',
  gunAdiYil: '{gunAdi}, {yil}',
};
