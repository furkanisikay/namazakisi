import type { Sozluk } from '../tr';

/**
 * Hausa Müslümanlarının yerleşik kalıpları (çeviri değil): "Allah ya karɓa" (kök karɓa, QuranEnc
 * `hausa_gummi` 2:127 "Ka karɓa daga gare mu"), "Barka da …" tebrikleri ("Barka da Sallah" bayram
 * tebrikidir; "Sallah" orada bayram demektir). Kalıplar yerli okuyucuyla DOĞRULANMADI. Kandil ve
 * hicrî yılbaşı selamı yalnız Türkiye geleneğinde söylenir (`selam.ts > GELENEK_SELAMI_DILLERI`);
 * buradaki karşılıklar tip bütünlüğü içindir.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Allah ya sa albarka.',
  kabulDualari: ['Allah ya karɓa', 'Allah ya karɓi ibadarmu', 'Allah ya karɓa', 'Ubangiji ya karɓa'],
  kabulDuasi: 'Allah ya karɓa',
  ekSabah: 'Barka da safiya',
  ekYatsi: 'Mu kwana lafiya',
  tamGunAna: 'Allah ya karɓa',
  tamGunAlt: 'Yau kun kammala salloli biyar duka.',
  kazaKabul: 'An cire ramuwar {vakit} ɗaya daga littafinku. {dua}.',
  kandilGeceleri: {
    regaib: 'Daren Ragaʼib mai albarka',
    mirac: 'Isra da Miʼraj masu albarka',
    berat: 'Daren Baraʼa mai albarka',
    mevlid: 'Barka da Maulidi',
  },
  selamlar: {
    sahur: 'Barka da sahur',
    bayram: 'Barka da Sallah',
    iftar: 'Barka da buɗa baki',
    kadir: 'Daren Lailatul Ƙadri mai albarka',
    arefe: 'Barka da ranar Arafa',
    hicriYilbasi: 'Barka da sabuwar shekarar Musulunci',
    cuma: 'Barka da Jumuʼa',
    ramazan: 'Barka da azumin Ramadan',
    sabah: 'Barka da safiya',
  },
};
