import type { Sozluk } from '../tr';

/**
 * Peştu konuşan Müslümanların namaz sonrası ve selam için kullandığı yerleşik kalıplar (çeviri
 * değil). Kabul duası "الله دې قبول کړي" (Allah kabul etsin) ve yaygın varyantları ("قبول دې
 * وي" kabul olsun, "الله تعالی دې قبول کړي"); bayram "اختر", sahur "پېشمنی". Övgü ve "!" yok.
 * Kandil selamı yalnız ülke listesindeki gecelerde söylenir (`selam.ts > KANDIL_ULKELERI`;
 * Pakistan: Mevlid). Yerli okuyucuyla DOĞRULANMADI.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'مبارک دې وي.',
  kabulDualari: ['الله دې قبول کړي', 'قبول دې وي', 'الله دې قبول کړي', 'الله تعالی دې قبول کړي'],
  kabulDuasi: 'الله دې قبول کړي',
  ekSabah: 'سهار مو پخیر',
  ekYatsi: 'شپه مو پخیر',
  tamGunAna: 'الله دې قبول کړي',
  tamGunAlt: 'تاسو نن ټول پنځه وخته لمونځونه بشپړ کړل.',
  kazaKabul: 'ستاسو له دفتر څخه د {vakit} یو قضا لمونځ کم شو. {dua}.',
  kandilGeceleri: {
    regaib: 'د رغائبو شپه مو مبارک شه',
    mirac: 'د معراج شپه مو مبارک شه',
    berat: 'د برات شپه مو مبارک شه',
    mevlid: 'میلاد النبي مو مبارک شه',
  },
  selamlar: {
    sahur: 'پېشمنی مو مبارک شه',
    bayram: 'اختر مو مبارک شه',
    iftar: 'افطار مو مبارک شه',
    kadir: 'د قدر شپه مو مبارک شه',
    arefe: 'د عرفې ورځ مو مبارک شه',
    hicriYilbasi: 'نوی هجري کال مو مبارک شه',
    cuma: 'جمعه مو مبارک شه',
    ramazan: 'رمضان مو مبارک شه',
    sabah: 'سهار مو پخیر',
  },
};
