import type { Sozluk } from '../tr';

/**
 * Sinhala konuşan Sri Lanka Müslümanlarının kalıpları (çeviri değil). Kabul duası ACJU
 * bayram/Ramazan mesajlarındaki "සර්වබලධාරී අල්ලාහ් … පිළිගනු මැනව" cümlesinin kısaltmasıdır
 * ("අල්ලාහ් තආලා" ACJU yazımı); selamlar ACJU'nun "සුබපැතුම්" ve "මුබාරක්" kullanımından.
 * Övgü ve "!" yok. Kandil selamı yalnız ülke listesindeki gecelerde söylenir
 * (`selam.ts > KANDIL_ULKELERI`); buradaki karşılıklar tip bütünlüğü içindir.
 * Yerli okuyucuyla DOĞRULANMADI.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'සුබ ආරම්භයක් වේවා.',
  kabulDualari: ['අල්ලාහ් පිළිගනු මැනව', 'අල්ලාහ් තආලා පිළිගනු මැනව', 'අල්ලාහ් පිළිගනු මැනව', 'සර්වබලධාරී අල්ලාහ් පිළිගනු මැනව'],
  kabulDuasi: 'අල්ලාහ් පිළිගනු මැනව',
  ekSabah: 'ආශිර්වාදිත උදෑසනක් වේවා',
  ekYatsi: 'ආශිර්වාදිත රාත්‍රියක් වේවා',
  tamGunAna: 'අල්ලාහ් පිළිගනු මැනව',
  tamGunAlt: 'අද ඔබ සලාත් පහම ඉටු කළා.',
  kazaKabul: 'ඔබගේ ලේඛනයෙන් අතපසු වූ {vakit} සලාතයක් අඩු කළා. {dua}.',
  kandilGeceleri: {
    regaib: 'රගාඉබ් රාත්‍රිය සුබ වේවා',
    mirac: 'ඉස්රා සහ මිඃරාජ් රාත්‍රිය සුබ වේවා',
    berat: 'බරාඅත් රාත්‍රිය සුබ වේවා',
    mevlid: 'මීලාදුන් නබි සුබ වේවා',
  },
  selamlar: {
    sahur: 'ආශිර්වාදිත සහර් වේලාවක් වේවා',
    bayram: 'ඊද් මුබාරක්',
    iftar: 'ආශිර්වාදිත ඉෆ්තාර් වේලාවක් වේවා',
    kadir: 'ලයිලතුල් කද්ර් රාත්‍රිය සුබ වේවා',
    arefe: 'සුබ ඊද් පෙරදිනයක් වේවා',
    hicriYilbasi: 'සුබ හිජ්රි නව වසරක් වේවා',
    cuma: 'ජුමුආ මුබාරක්',
    ramazan: 'රමළාන් මුබාරක්',
    sabah: 'ආශිර්වාදිත උදෑසනක් වේවා',
  },
};
