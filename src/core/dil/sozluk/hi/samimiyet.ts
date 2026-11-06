import type { Sozluk } from '../tr';

/**
 * Hintçe konuşan Hint Müslümanlarının namaz sonrası ve selam için kullandığı yerleşik kalıplar
 * (çeviri değil; Urduca kalıpların Devanagari yazımı). Kabul duası "अल्लाह क़बूल करे" ve yaygın
 * varyantları; övgü ve "!" yok. Kandil selamı yalnız ülke listesindeki gecelerde söylenir
 * (`selam.ts > KANDIL_ULKELERI`); buradaki karşılıklar tip bütünlüğü içindir.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'मुबारक हो।',
  kabulDualari: ['अल्लाह क़बूल करे', 'अल्लाह तआला क़बूल फ़रमाए', 'अल्लाह क़बूल करे', 'अल्लाह पाक क़बूल फ़रमाए'],
  kabulDuasi: 'अल्लाह क़बूल करे',
  ekSabah: 'सुबह बख़ैर',
  ekYatsi: 'शब बख़ैर',
  tamGunAna: 'अल्लाह क़बूल करे',
  tamGunAlt: 'आज आपने पाँचों नमाज़ें पूरी कर लीं।',
  kazaKabul: 'आपके क़ज़ा रिकॉर्ड से {vakit} की एक क़ज़ा नमाज़ कम कर दी गई। {dua}।',
  kandilGeceleri: {
    regaib: 'शब-ए-रग़ाइब मुबारक',
    mirac: 'शब-ए-मेराज मुबारक',
    berat: 'शब-ए-बरात मुबारक',
    mevlid: 'ईद मीलादुन्नबी मुबारक',
  },
  selamlar: {
    sahur: 'सहरी बाबरकत हो',
    bayram: 'ईद मुबारक',
    iftar: 'इफ़्तार बाबरकत हो',
    kadir: 'शब-ए-क़द्र मुबारक',
    arefe: 'ईद की आमद मुबारक',
    hicriYilbasi: 'नया इस्लामी साल मुबारक',
    cuma: 'जुमा मुबारक',
    ramazan: 'रमज़ान मुबारक',
    sabah: 'सुबह बख़ैर',
  },
};
