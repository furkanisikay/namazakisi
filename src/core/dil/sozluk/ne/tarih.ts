import type { Sozluk } from '../tr';

/**
 * Nepalce gün/ay adları CLDR `ne` biçimidir; ay adı çekimsizdir (`aylar` = `aylarYalin`). CLDR kısa ay
 * adı tam addır; takvim yaprağı için ilk heceler kullanılır. Uzun tarih CLDR sırasıyla yıl önce: "2026 नोभेम्बर 4".
 */
export const tarih: Sozluk['tarih'] = {
  gunler: ['आइतबार', 'सोमबार', 'मङ्गलबार', 'बुधबार', 'बिहिबार', 'शुक्रबार', 'शनिबार'],
  gunlerKisa: ['आइत', 'सोम', 'मङ्गल', 'बुध', 'बिहि', 'शुक्र', 'शनि'],
  aylar: ['जनवरी', 'फेब्रुअरी', 'मार्च', 'अप्रिल', 'मे', 'जुन', 'जुलाई', 'अगस्ट', 'सेप्टेम्बर', 'अक्टोबर', 'नोभेम्बर', 'डिसेम्बर'],
  aylarYalin: ['जनवरी', 'फेब्रुअरी', 'मार्च', 'अप्रिल', 'मे', 'जुन', 'जुलाई', 'अगस्ट', 'सेप्टेम्बर', 'अक्टोबर', 'नोभेम्बर', 'डिसेम्बर'],
  aylarKisa: ['जन', 'फेब', 'मार्च', 'अप्रि', 'मे', 'जुन', 'जुलाई', 'अग', 'सेप', 'अक्टो', 'नोभे', 'डिसे'],
  haftaHarfleri: ['सो', 'म', 'बु', 'बि', 'शु', 'श', 'आ'],
  uzun: '{yil} {ay} {gun}',
  gunAdiYil: '{gunAdi}, {yil}',
};
