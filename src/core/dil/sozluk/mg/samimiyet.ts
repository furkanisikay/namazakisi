import type { Sozluk } from '../tr';

/**
 * Malgaşça konuşan Müslümanların kalıpları (çeviri değil): dilek edatı "anie" (HadeethEnc mg 10945
 * "Ho aminareo anie…"), kabul kökü "raisina" (QE `malagasy_rwwad` 2:127 "Ekeo ny asa vitanay"),
 * malgaşça bereket dileği "Ho tahin'… anie" ve bayram/cuma/Ramazan için yerleşik Arapça "Mubarak"
 * kalıpları; ortak "Taqabbal Allahu minna wa minkum". Kandil ve hicrî yılbaşı selamı Madagaskar'da
 * söylenmez (`selam.ts > KANDIL_ULKELERI`); buradaki karşılıklar tip bütünlüğü içindir. Övgü ve "!"
 * yok. Hepsi türetildi; yerli okuyucuyla DOĞRULANMADI.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: "Ho tahin'Allah anie.",
  kabulDualari: ["Raisin'Allah anie", 'Taqabbal Allahu minna wa minkum', "Raisin'Allah anie", "Raisin'ny Tomponay anie"],
  kabulDuasi: "Raisin'Allah anie",
  ekSabah: 'Maraina feno fitahiana',
  ekYatsi: 'Alina feno fitahiana',
  tamGunAna: "Raisin'Allah anie",
  tamGunAlt: 'Vitanao androany ny soalat dimy.',
  kazaKabul: "Nesorina tao amin'ny bokinao ny fanefana {vakit} iray. {dua}.",
  kandilGeceleri: {
    regaib: 'Alin\'ny Raghaib feno fitahiana',
    mirac: "Isra sy Mi'raj feno fitahiana",
    berat: "Alin'ny Bara'ah feno fitahiana",
    mevlid: 'Mawlid feno fitahiana',
  },
  selamlar: {
    sahur: 'Sohor feno fitahiana',
    bayram: 'Eid Mubarak',
    iftar: 'Iftar feno fitahiana',
    kadir: "Alin'ny Lahatra feno fitahiana",
    arefe: "Andro alohan'ny Eid feno fitahiana",
    hicriYilbasi: 'Taom-baovao hijriana feno fitahiana',
    cuma: 'Zoma Mubarak',
    ramazan: 'Ramadany Mubarak',
    sabah: 'Maraina feno fitahiana',
  },
};
