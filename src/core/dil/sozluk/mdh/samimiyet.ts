import type { Sozluk } from '../tr';

/**
 * Maguindanao Müslümanlarının kalıpları (çeviri değil): kabul fiili "talima" QuranEnc
 * `maguindanao_rwwad` 2:127 ("Hay Kadenan nami! Talima ka sa lekami"), dilek biçimi "Talimaen nu
 * Allah" türetildi; ortak Arapça "Taqabbal Allahu minna wa minkum" ve "Barakallahu fikum";
 * bayram, cuma ve Ramazan için yerleşik "Mubarak" kalıpları; sabah/akşam selamı yerel "Mapya a
 * mapita / magabi" (mealdeki "mapya" yazımıyla). Kandil ve hicrî yılbaşı selamı Filipinler'de
 * söylenmez (`selam.ts > KANDIL_ULKELERI`); buradaki karşılıklar tip bütünlüğü içindir. Övgü ve
 * "!" yok. Yerli okuyucuyla DOĞRULANMADI.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Barakallahu fikum.',
  kabulDualari: ['Talimaen nu Allah', 'Taqabbal Allahu minna wa minkum', 'Talimaen nu Allah', 'Talimaen nu Kadenan tanu'],
  kabulDuasi: 'Talimaen nu Allah',
  ekSabah: 'Mapya a mapita',
  ekYatsi: 'Mapya a magabi',
  tamGunAna: 'Talimaen nu Allah',
  tamGunAlt: 'Nasambayang nu saguna a gay su langun nu lima a sambayang.',
  kazaKabul: 'Nakwa su isa a qada nu {vakit} kanu listahan nu. {dua}.',
  kandilGeceleri: {
    regaib: 'Mabarakat a magabi nu Raghaib',
    mirac: "Mabarakat a Isra' endu Mi'raj",
    berat: "Mabarakat a magabi nu Bara'ah",
    mevlid: 'Mabarakat a Mawlid',
  },
  selamlar: {
    sahur: 'Mabarakat a sahur',
    bayram: 'Eid Mubarak',
    iftar: 'Mabarakat a iftar',
    kadir: 'Mabarakat a Laylat al-Qadr',
    arefe: 'Mabarakat a bisperas nu Eid',
    hicriYilbasi: 'Mabarakat a bagu a lagun nu Hijri',
    cuma: "Jum'at Mubarak",
    ramazan: 'Ramadhan Mubarak',
    sabah: 'Mapya a mapita',
  },
};
