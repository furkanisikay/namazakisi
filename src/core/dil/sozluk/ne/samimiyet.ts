import type { Sozluk } from '../tr';

/**
 * Nepalce konuşan Müslümanların kalıpları (çeviri değil). Kabul duası: "स्वीकार गर्नु" (QE 2:127) ile
 * saygılı dilek kipi ("अल्लाहले स्वीकार गरून्", türetildi) ve HadeethEnc ne dua kalıbı
 * ("हे अल्लाह! … स्वीकार गर्नुहोस्"). Selamlarda Urduca kökenli yerleşik "मुबारक". Övgü ve "!" yok.
 * Kandil selamı yalnız ülke listesindeki gecelerde söylenir (`selam.ts > KANDIL_ULKELERI`); buradaki
 * karşılıklar tip bütünlüğü içindir (doğrulanmadı).
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'मुबारक होस्।',
  kabulDualari: ['अल्लाहले स्वीकार गरून्', 'हे अल्लाह, स्वीकार गर्नुहोस्', 'अल्लाहले स्वीकार गरून्', 'हाम्रा पालनकर्ताले स्वीकार गरून्'],
  kabulDuasi: 'अल्लाहले स्वीकार गरून्',
  ekSabah: 'शुभ बिहानी',
  ekYatsi: 'शुभ रात्रि',
  tamGunAna: 'अल्लाहले स्वीकार गरून्',
  tamGunAlt: 'आज तपाईंले पाँचै वक्तको नमाज पूरा गर्नुभयो।',
  kazaKabul: 'तपाईंको कजा रेकर्डबाट {vakit}को एउटा कजा नमाज घटाइयो। {dua}।',
  kandilGeceleri: {
    regaib: 'शब-ए-रगाइब मुबारक',
    mirac: 'शब-ए-मेराज मुबारक',
    berat: 'शब-ए-बरात मुबारक',
    mevlid: 'ईद मिलादुन्नबी मुबारक',
  },
  selamlar: {
    sahur: 'सेहरी मुबारक',
    bayram: 'ईद मुबारक',
    iftar: 'इफ्तार मुबारक',
    kadir: 'शब-ए-कद्र मुबारक',
    arefe: 'ईदको पूर्वसन्ध्या मुबारक',
    hicriYilbasi: 'नयाँ इस्लामी वर्ष मुबारक',
    cuma: 'जुमा मुबारक',
    ramazan: 'रमजान मुबारक',
    sabah: 'शुभ बिहानी',
  },
};
