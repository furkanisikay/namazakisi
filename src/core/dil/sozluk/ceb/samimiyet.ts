import type { Sozluk } from '../tr';

/**
 * Filipinli (Bisaya) Müslümanların kalıpları (çeviri değil): fiil kökü "dawata" QuranEnc
 * `bisayan_rwwad` 2:127 ("dawata (kini) gikan kanamo") + dilek edatı "unta" (türetildi); bayram,
 * cuma ve Ramazan için yerleşik Arapça "Mubarak" kalıpları ve ortak "Taqabbal Allahu minna wa
 * minkum". Kandil ve hicrî yılbaşı selamı Filipinler'de söylenmez (`selam.ts`); buradaki
 * karşılıklar tip bütünlüğü içindir. Övgü ve "!" yok. Yerli okuyucuyla DOĞRULANMADI.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Hinaut nga mapanalanginon kini.',
  kabulDualari: ['Dawaton unta sa Allah', 'Taqabbal Allahu minna wa minkum', 'Dawaton unta sa Allah', 'Dawaton unta sa atong Ginoo'],
  kabulDuasi: 'Dawaton unta sa Allah',
  ekSabah: 'Bulahan nga buntag',
  ekYatsi: 'Bulahan nga gabii',
  tamGunAna: 'Dawaton unta sa Allah',
  tamGunAlt: 'Nahimo ninyo karong adlawa ang lima ka Salah.',
  kazaKabul: 'Nakuhaan og usa ka qada sa {vakit} ang inyong listahan. {dua}.',
  kandilGeceleri: {
    regaib: 'Bulahan nga gabii sa Raghaib',
    mirac: "Bulahan nga Isra' ug Mi'raj",
    berat: "Bulahan nga gabii sa Bara'ah",
    mevlid: 'Bulahan nga Mawlid',
  },
  selamlar: {
    sahur: 'Bulahan nga suhur',
    bayram: 'Eid Mubarak',
    iftar: 'Bulahan nga iftar',
    kadir: 'Bulahan nga Laylat al-Qadr',
    arefe: 'Bulahan nga bisperas sa Eid',
    hicriYilbasi: 'Bulahan nga Bag-ong Tuig sa Hijri',
    cuma: "Jum'ah Mubarak",
    ramazan: 'Ramadan Mubarak',
    sabah: 'Bulahan nga buntag',
  },
};
