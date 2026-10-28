import type { Sozluk } from '../tr';

/**
 * Arnavut Müslümanlarının yerleşik kalıpları (çeviri değil): namaz sonrası "Allahu e pranoftë",
 * "Kabull qoftë", "Zoti e pranoftë"; selamlarda "… mubarek" ve "… të bekuar", "Me hajër qoftë".
 * Kandiller BIK/KMSH takvimindeki yerel adlarla (Regaib, Miraxh, Berat, Mevlud). Övgü, "!" ve
 * kılınmadıya yargı yok.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Me hajër qoftë.',
  kabulDualari: ['Allahu e pranoftë', 'Kabull qoftë', 'Allahu e pranoftë', 'Zoti e pranoftë'],
  kabulDuasi: 'Allahu e pranoftë',
  ekSabah: 'Mëngjes të mbarë',
  ekYatsi: 'Natë të mbarë',
  tamGunAna: 'Allahu e pranoftë',
  tamGunAlt: 'Sot i falët të pesë namazet.',
  kazaKabul: 'Nga regjistri juaj u zbrit një namaz kaza: {vakit}. {dua}.',
  kandilGeceleri: {
    regaib: 'Nata e Regaibit mubarek',
    mirac: 'Nata e Miraxhit mubarek',
    berat: 'Nata e Beratit mubarek',
    mevlid: 'Mevludi mubarek',
  },
  selamlar: {
    sahur: 'Syfyr të bekuar',
    bayram: 'Bajrami mubarek',
    iftar: 'Iftar të bekuar',
    kadir: 'Nata e Kadrit mubarek',
    arefe: 'Arefe të bekuar',
    hicriYilbasi: 'Viti i Ri Hixhri mubarek',
    cuma: 'Xhumaja mubarek',
    ramazan: 'Ramazani mubarek',
    sabah: 'Mëngjes të mbarë',
  },
};
