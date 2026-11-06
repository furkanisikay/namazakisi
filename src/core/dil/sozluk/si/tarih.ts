import type { Sozluk } from '../tr';

/**
 * Sinhala gün/ay adları CLDR'dir; ay adı çekimsizdir (`aylar` = `aylarYalin`). Kısa biçimler CLDR
 * kısaltmaları, hafta harfleri CLDR narrow. Uzun tarih CLDR gibi yıl önce: "2026 ඔක්තෝබර් 30";
 * gün adı + yıl da CLDR sırası: "2026 සිකුරාදා".
 */
export const tarih: Sozluk['tarih'] = {
  gunler: ['ඉරිදා', 'සඳුදා', 'අඟහරුවාදා', 'බදාදා', 'බ්‍රහස්පතින්දා', 'සිකුරාදා', 'සෙනසුරාදා'],
  gunlerKisa: ['ඉරිදා', 'සඳුදා', 'අඟහ', 'බදාදා', 'බ්‍රහස්', 'සිකු', 'සෙන'],
  aylar: ['ජනවාරි', 'පෙබරවාරි', 'මාර්තු', 'අප්‍රේල්', 'මැයි', 'ජූනි', 'ජූලි', 'අගෝස්තු', 'සැප්තැම්බර්', 'ඔක්තෝබර්', 'නොවැම්බර්', 'දෙසැම්බර්'],
  aylarYalin: ['ජනවාරි', 'පෙබරවාරි', 'මාර්තු', 'අප්‍රේල්', 'මැයි', 'ජූනි', 'ජූලි', 'අගෝස්තු', 'සැප්තැම්බර්', 'ඔක්තෝබර්', 'නොවැම්බර්', 'දෙසැම්බර්'],
  aylarKisa: ['ජන', 'පෙබ', 'මාර්', 'අප්‍රේල්', 'මැයි', 'ජූනි', 'ජූලි', 'අගෝ', 'සැප්', 'ඔක්', 'නොවැ', 'දෙසැ'],
  haftaHarfleri: ['ස', 'අ', 'බ', 'බ්‍ර', 'සි', 'සෙ', 'ඉ'],
  uzun: '{yil} {ay} {gun}',
  gunAdiYil: '{yil} {gunAdi}',
};
