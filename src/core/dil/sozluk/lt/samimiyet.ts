import type { Sozluk } from '../tr';

/**
 * Litvanya Müslümanlarının (Lietuvos Muftiatas) kalıplarından küme (çeviri değil). Kabul duası
 * "Tepriima Allahas" QE 2:127 "priimk" ve HE 3731 "malda bus priimta" kökünden TÜRETİLDİ
 * (yerli okuyucu baksın). Selamlar Litvancanın ilgi hâlli dilek kalıbıyla ("Palaimingo …");
 * bayram ve kandil adları müftülük yazımından ("Ramadano šventė", "Regaib naktis", "Miradžo
 * naktis"), Kadir Gecesi Vikipedi "Didybės naktis", Mevlid "Maulidas". Sahur DOĞRULANMADI.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Tebūna palaiminta.',
  kabulDualari: ['Tepriima Allahas', 'Tebūna priimta', 'Tepriima Allahas', 'Tepriima mūsų Viešpats'],
  kabulDuasi: 'Tepriima Allahas',
  ekSabah: 'Palaimingo ryto',
  ekYatsi: 'Palaimingos nakties',
  tamGunAna: 'Tepriima Allahas',
  tamGunAlt: 'Šiandien atlikote visas penkias maldas.',
  kazaKabul: 'Iš jūsų žurnalo išbraukta viena praleista {vakit} malda. {dua}.',
  kandilGeceleri: {
    regaib: 'Palaimingos Regaib nakties',
    mirac: 'Palaimingos Miradžo nakties',
    berat: 'Palaimingos Berat nakties',
    mevlid: 'Palaimingo Maulido',
  },
  selamlar: {
    sahur: 'Palaimingo sahuro',
    bayram: 'Palaimingos šventės',
    iftar: 'Palaimingo iftaro',
    kadir: 'Palaimingos Didybės nakties',
    arefe: 'Palaimingų šventės išvakarių',
    hicriYilbasi: 'Palaimingų Naujųjų hidžros metų',
    cuma: 'Palaimingo penktadienio',
    ramazan: 'Palaimingo Ramadano',
    sabah: 'Palaimingo ryto',
  },
};
