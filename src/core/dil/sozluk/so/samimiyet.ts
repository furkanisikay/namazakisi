import type { Sozluk } from '../tr';

/**
 * Qaababka caadiga ah ee Muslimiinta Soomaaliyeed (tarjumaad ma aha). Falka "aqbal" waxaa laga
 * soo qaatay QuranEnc `somali_yacob` 2:127 ("Rabbigayow! Naga aqbal"), Alle = "Alle" (5:27).
 * Salaanta Kandiilka iyo sannadka cusub ee Hijriga waxaa la yiraahdaa oo kaliya dhaqanka Turkiga
 * (`selam.ts > GELENEK_SELAMI_DILLERI`); halkan waa dhammaystirka nooca.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Khayr ha ku noqoto.',
  kabulDualari: ['Alle ha aqbalo', 'Ilaahay ha aqbalo', 'Alle ha aqbalo', 'Alle ha inaga aqbalo'],
  kabulDuasi: 'Alle ha aqbalo',
  ekSabah: 'Subax wanaagsan',
  ekYatsi: 'Habeen wanaagsan',
  tamGunAna: 'Alle ha aqbalo',
  tamGunAlt: 'Maanta waxaad dhammaystirtay shanta salaadood.',
  kazaKabul: 'Hal qadaa oo {vakit} ah ayaa laga dhimay buuggaaga. {dua}.',
  kandilGeceleri: {
    regaib: "Habeenka Raghaa'ib barakaysan",
    mirac: 'Israa iyo Micraaj barakaysan',
    berat: "Habeenka Baraa'a barakaysan",
    mevlid: 'Mawliid barakaysan',
  },
  selamlar: {
    sahur: 'Suxuur barakaysan',
    bayram: 'Ciid Mubaarak',
    iftar: 'Afur barakaysan',
    kadir: 'Laylatul Qadar barakaysan',
    arefe: 'Maalinta Carafo barakaysan',
    hicriYilbasi: 'Sannad cusub oo Hijri ah oo barakaysan',
    cuma: 'Jimce Mubaarak',
    ramazan: 'Ramadaan Kariim',
    sabah: 'Subax wanaagsan',
  },
};
