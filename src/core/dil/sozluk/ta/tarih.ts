import type { Sozluk } from '../tr';

/**
 * Tamilce gün/ay adları CLDR biçimidir; ay adı çekimsizdir (`aylar` = `aylarYalin`). Kısa
 * biçimler CLDR kısaltmaları (ஞாயி., ஜன.…), haftalık panel CLDR dar biçimi (Pazartesi başlar).
 * Uzun tarih CLDR sırasıyla "18 ஜனவரி, 2026".
 */
export const tarih: Sozluk['tarih'] = {
  gunler: ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'],
  gunlerKisa: ['ஞாயி.', 'திங்.', 'செவ்.', 'புத.', 'வியா.', 'வெள்.', 'சனி'],
  aylar: ['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'],
  aylarYalin: ['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'],
  aylarKisa: ['ஜன.', 'பிப்.', 'மார்.', 'ஏப்.', 'மே', 'ஜூன்', 'ஜூலை', 'ஆக.', 'செப்.', 'அக்.', 'நவ.', 'டிச.'],
  haftaHarfleri: ['தி', 'செ', 'பு', 'வி', 'வெ', 'ச', 'ஞா'],
  uzun: '{gun} {ay}, {yil}',
  gunAdiYil: '{gunAdi}, {yil}',
};
