import type { Sozluk } from '../tr';

/**
 * Telugu gün/ay adları CLDR biçimidir; ay adı çekimsizdir (`aylar` = `aylarYalin`). Kısa
 * biçimler CLDR kısaltmaları (ఆది, జన…), haftalık panel CLDR dar biçimi (Pazartesi başlar).
 * Uzun tarih CLDR sırasıyla "4 నవంబర్, 2026"; gün adı + yıl CLDR gibi yıl önce ("2026 బుధవారం").
 */
export const tarih: Sozluk['tarih'] = {
  gunler: ['ఆదివారం', 'సోమవారం', 'మంగళవారం', 'బుధవారం', 'గురువారం', 'శుక్రవారం', 'శనివారం'],
  gunlerKisa: ['ఆది', 'సోమ', 'మంగళ', 'బుధ', 'గురు', 'శుక్ర', 'శని'],
  aylar: ['జనవరి', 'ఫిబ్రవరి', 'మార్చి', 'ఏప్రిల్', 'మే', 'జూన్', 'జులై', 'ఆగస్టు', 'సెప్టెంబర్', 'అక్టోబర్', 'నవంబర్', 'డిసెంబర్'],
  aylarYalin: ['జనవరి', 'ఫిబ్రవరి', 'మార్చి', 'ఏప్రిల్', 'మే', 'జూన్', 'జులై', 'ఆగస్టు', 'సెప్టెంబర్', 'అక్టోబర్', 'నవంబర్', 'డిసెంబర్'],
  aylarKisa: ['జన', 'ఫిబ్ర', 'మార్చి', 'ఏప్రి', 'మే', 'జూన్', 'జులై', 'ఆగ', 'సెప్టెం', 'అక్టో', 'నవం', 'డిసెం'],
  haftaHarfleri: ['సో', 'మ', 'బు', 'గు', 'శు', 'శ', 'ఆ'],
  uzun: '{gun} {ay}, {yil}',
  gunAdiYil: '{yil} {gunAdi}',
};
