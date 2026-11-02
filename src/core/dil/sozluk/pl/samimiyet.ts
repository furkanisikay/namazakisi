import type { Sozluk } from '../tr';

/**
 * Lehçe konuşan Müslümanların kalıpları (çeviri değil). "Niech Allah przyjmie" MZR Kur'an 2:127
 * "O Panie, przyjmij to od nas" (Arapça "ربنا تقبل منا") kalıbından kısaltma (baskın, iki yuva;
 * TÜRETİLDİ), "Niech nasz Pan przyjmie" aynı ayetin "Pan" hitabıyla; "Takabbal Allah" Arapça
 * kalıbın Lehçe harf çevirisi. Bayram "Bajram" (MZR "Ramadan Bajram", "Kurban Bajram"), Mevlid
 * "Miełlud" (MZR "Święta"); Kadir gecesi "Noc Przeznaczenia". Yerli okuyucu DOĞRULAMADI.
 * Kandil selamı Polonya'da yalnız Türk diasporası geleneğidir (`selam.ts > KANDIL_ULKELERI` PL'yi
 * içermez); tip bütünlüğü için yazıldı.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Niech będzie błogosławione.',
  kabulDualari: ['Niech Allah przyjmie', 'Takabbal Allah', 'Niech Allah przyjmie', 'Niech nasz Pan przyjmie'],
  kabulDuasi: 'Niech Allah przyjmie',
  ekSabah: 'Błogosławionego poranka',
  ekYatsi: 'Błogosławionej nocy',
  tamGunAna: 'Niech Allah przyjmie',
  tamGunAlt: 'Dziś odprawiono wszystkie pięć modlitw.',
  kazaKabul: 'Z rejestru odliczono jedną zaległą modlitwę {vakit}. {dua}.',
  kandilGeceleri: {
    regaib: 'Błogosławionej nocy Ragaib',
    mirac: 'Błogosławionej nocy Isra i Miradż',
    berat: 'Błogosławionej nocy Barat',
    mevlid: 'Błogosławionego Miełludu',
  },
  selamlar: {
    sahur: 'Błogosławionego suhur',
    bayram: 'Błogosławionego Bajramu',
    iftar: 'Błogosławionego iftaru',
    kadir: 'Błogosławionej Nocy Przeznaczenia',
    arefe: 'Błogosławionego dnia przed świętem',
    hicriYilbasi: 'Błogosławionego Nowego Roku hidżry',
    cuma: 'Błogosławionego piątku',
    ramazan: 'Błogosławionego ramadanu',
    sabah: 'Błogosławionego poranka',
  },
};
