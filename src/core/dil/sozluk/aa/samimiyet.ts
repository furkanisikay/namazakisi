import type { Sozluk } from '../tr';

/**
 * Qafar af kalıpları (çeviri değil, türetildi; yerli okuyucu baksın). "Kabul etmek" kökü
 * QuranEnc `afar_hamza` 2:127 ("nek oggolaay") ve 2:37 ("oggoleh"); Allah adı arayüzde "Allah"
 * (ana oturum kararı, mealin "Yalla"sı değil). "yakkay" (olsun) IslamHouse aa metninden.
 * Kandil ve hicrî yılbaşı selamı yalnız Türkiye geleneğinde söylenir
 * (`selam.ts > GELENEK_SELAMI_DILLERI`); buradakiler tip bütünlüğü içindir.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Meqe yakkay.',
  kabulDualari: ['Allah oggolay', 'Oggolime yakkay', 'Allah oggolay', 'Ni Rabbi oggolay'],
  kabulDuasi: 'Allah oggolay',
  ekSabah: 'Saaku meqe yakkay',
  ekYatsi: 'Bar meqe yakkay',
  tamGunAna: 'Allah oggolay',
  tamGunAlt: 'Asaaku konoy salat duudusteenih.',
  kazaKabul: 'Inki {vakit} qadaa sinni kitaabak kalime. {dua}.',
  kandilGeceleri: {
    regaib: "Barakat le Ragaa'ib bar",
    mirac: 'Barakat le Israa kee Miqraaj',
    berat: "Barakat le Baraa'a bar",
    mevlid: 'Barakat le Mawliid',
  },
  selamlar: {
    sahur: 'Barakat le sahuur',
    bayram: 'Qiid Mubaarak',
    iftar: 'Barakat le iftaar',
    kadir: 'Barakat le Laylatul Qadri',
    arefe: 'Barakat le Qarafa ayro',
    hicriYilbasi: 'Barakat le Hijri liggida',
    cuma: 'Jumqa Mubaarak',
    ramazan: 'Ramadaan Kariim',
    sabah: 'Saaku meqe yakkay',
  },
};
