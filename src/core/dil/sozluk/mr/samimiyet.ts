import type { Sozluk } from '../tr';

/**
 * Marathi konuşan Müslümanların namaz sonrası ve selam için kullandığı kalıplar (çeviri değil;
 * Dakhni/Urduca kalıpların Devanagari yazımı, nuktasız). Kabul duası "अल्लाह कबूल करो" (Marathi
 * dilek kipi ‑ओ, "देव भले करो" yapısı; türetildi, yerli okuyucu baksın) ve QE 2:127 "स्वीकार कर"
 * kökünden "अल्लाह स्वीकार करो". Sabah/gece selamı yerleşik Marathi "सुप्रभात", "शुभ रात्री".
 * Övgü ve "!" yok. Kandil selamı yalnız ülke listesindeki gecelerde söylenir
 * (`selam.ts > KANDIL_ULKELERI`); buradaki karşılıklar tip bütünlüğü içindir.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'मुबारक असो.',
  kabulDualari: ['अल्लाह कबूल करो', 'अल्लाह तआला कबूल करो', 'अल्लाह कबूल करो', 'अल्लाह स्वीकार करो'],
  kabulDuasi: 'अल्लाह कबूल करो',
  ekSabah: 'सुप्रभात',
  ekYatsi: 'शुभ रात्री',
  tamGunAna: 'अल्लाह कबूल करो',
  tamGunAlt: 'आज तुम्ही पाचही नमाज पूर्ण केल्या.',
  kazaKabul: 'तुमच्या नोंदीतून {vakit} ची एक कजा नमाज कमी केली. {dua}.',
  kandilGeceleri: {
    regaib: 'शब-ए-रगाइब मुबारक',
    mirac: 'शब-ए-मेराज मुबारक',
    berat: 'शब-ए-बरात मुबारक',
    mevlid: 'ईद-ए-मिलादुन्नबी मुबारक',
  },
  selamlar: {
    sahur: 'सहरी मुबारक',
    bayram: 'ईद मुबारक',
    iftar: 'इफ्तार मुबारक',
    kadir: 'शब-ए-कद्र मुबारक',
    arefe: 'ईदच्या आगमनाच्या शुभेच्छा',
    hicriYilbasi: 'नवीन इस्लामी वर्ष मुबारक',
    cuma: 'जुमा मुबारक',
    ramazan: 'रमजान मुबारक',
    sabah: 'सुप्रभात',
  },
};
