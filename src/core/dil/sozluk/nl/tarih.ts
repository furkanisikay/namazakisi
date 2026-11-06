import type { Sozluk } from '../tr';

/** Felemenkçede gün ve ay adları küçük harfle yazılır ("zaterdag 24 oktober 2026"); tek başına ay (takvim başlığı) büyük harfle. */
export const tarih: Sozluk['tarih'] = {
  gunler: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'],
  gunlerKisa: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
  aylar: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'],
  aylarYalin: ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'],
  aylarKisa: ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'],
  haftaHarfleri: ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'],
  uzun: '{gun} {ay} {yil}',
  gunAdiYil: '{gunAdi}, {yil}',
};
