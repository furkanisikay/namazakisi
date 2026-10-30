import type { Sozluk } from '../tr';

/**
 * Oromo konuşan Müslümanların kalıpları (çeviri değil). "qeebaluu" (kabul etmek) kökü QuranEnc
 * `oromo_ababor` 2:127 ("nurraa qeebali") ve 5:27 ("Rabbiin kan qeebalu"), "Gooftaa" (Rab)
 * 17:79'dan; "haa …" dilek kipi dilbilgisiyle kuruldu, kalıp olarak kaynakta görülmedi —
 * yerli okuyucu gözden geçirmeli. Kandil ve hicrî yılbaşı selamı yalnız Türkiye geleneğinde
 * söylenir (`selam.ts`); buradaki karşılıklar tip bütünlüğü içindir.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Rabbiin isiniif haa eebbisu.',
  kabulDualari: ['Rabbiin haa qeebalu', 'Rabbiin isin irraa haa qeebalu', 'Rabbiin haa qeebalu', 'Gooftaan keenya haa qeebalu'],
  kabulDuasi: 'Rabbiin haa qeebalu',
  ekSabah: 'Ganama gaarii',
  ekYatsi: 'Halkan gaarii',
  tamGunAna: 'Rabbiin haa qeebalu',
  tamGunAlt: "Har'a salaata shanan hunda guuttaniittu.",
  kazaKabul: "Qadaan {vakit} tokko galmee keessan irraa hir'ifameera. {dua}.",
  kandilGeceleri: {
    regaib: "Halkan Ragaa'ibii eebbifamaa haa ta'u",
    mirac: "Israa'ii fi Mi'iraajii eebbifamaa haa ta'u",
    berat: "Halkan Baraa'aa eebbifamaa haa ta'u",
    mevlid: "Mawliidiin eebbifamaa haa ta'u",
  },
  selamlar: {
    sahur: 'Suhuura eebbifamaa',
    bayram: "Iidni keessan eebbifamaa haa ta'u",
    iftar: 'Afursaa eebbifamaa',
    kadir: "Laylatul Qadrii eebbifamaa haa ta'u",
    arefe: 'Halkan Arafaa eebbifamaa',
    hicriYilbasi: "Waggaan haaraan Hijraa eebbifamaa haa ta'u",
    cuma: 'Jimaata eebbifamaa',
    ramazan: "Ramadaanni eebbifamaa haa ta'u",
    sabah: 'Ganama gaarii',
  },
};
