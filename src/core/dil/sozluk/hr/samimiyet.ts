import type { Sozluk } from '../tr';

/**
 * Hırvatistan Müslümanları (IZH, çoğunluk Boşnak geleneği) Bosna'daki yerleşik kalıpları kullanır
 * (çeviri değil): namaz sonrası "Allah kabul ejlesun", "Allah primio", "Kabul olsun"; selamlarda
 * "hajirli …" ve "… mubarek olsun". Kandiller IZ takvimindeki yerel adlarla. Çevreleyen cümleler
 * Hırvat standardında ("vaš" küçük). Övgü, "!" ve kılınmadıya yargı yok. Dış kaynakla DOĞRULANMADI.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Hajirli olsun.',
  kabulDualari: ['Allah kabul ejlesun', 'Allah primio', 'Allah kabul ejlesun', 'Kabul olsun'],
  kabulDuasi: 'Allah kabul ejlesun',
  ekSabah: 'Hajirli sabah',
  ekYatsi: 'Hajirli noć',
  tamGunAna: 'Allah kabul ejlesun',
  tamGunAlt: 'Danas ste klanjali svih pet namaza.',
  kazaKabul: 'Iz vaše evidencije uklonjen je jedan kada-namaz: {vakit}. {dua}.',
  kandilGeceleri: {
    regaib: 'Lejletu-r-regaib mubarek olsun',
    mirac: "Lejletu-l-mi'radž mubarek olsun",
    berat: 'Lejletu-l-berat mubarek olsun',
    mevlid: 'Mevlud mubarek olsun',
  },
  selamlar: {
    sahur: 'Hajirli sehur',
    bayram: 'Bajram šerif mubarek olsun',
    iftar: 'Hajirli iftar',
    kadir: 'Lejletu-l-kadr mubarek olsun',
    arefe: 'Hajirli arefat',
    hicriYilbasi: 'Hajirli nova hidžretska godina',
    cuma: 'Hajirli džuma',
    ramazan: 'Hajirli ramazan',
    sabah: 'Hajirli sabah',
  },
};
