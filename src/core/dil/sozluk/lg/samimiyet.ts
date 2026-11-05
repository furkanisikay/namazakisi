import type { Sozluk } from '../tr';

/**
 * Luganda kalıpları (çeviri değil): "Allah akkirize" QE 2:127 "kkiriza" kökünden türetildi,
 * "emikisa" (bereket) gündelik Luganda selamıdır. Kandil ve hicrî yılbaşı selamı yalnız Türkiye
 * geleneğinde söylenir (`selam.ts > GELENEK_SELAMI_DILLERI`); buradaki karşılıklar tip
 * bütünlüğü içindir. Yerli okuyucu bakmalı.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Allah akuwe emikisa.',
  kabulDualari: ['Allah akkirize', 'Allah akkirize esswala', 'Allah akkirize', 'Allah atukkirize'],
  kabulDuasi: 'Allah akkirize',
  ekSabah: 'Enkya ey’emikisa',
  ekYatsi: 'Ekiro eky’emikisa',
  tamGunAna: 'Allah akkirize',
  tamGunAlt: 'Leero osaaze esswala zonna ettaano.',
  kazaKabul: 'Qadha emu eya {vakit} eggyiddwa ku lukalala lwo. {dua}.',
  kandilGeceleri: {
    regaib: 'Ekiro kya Raghaib eky’emikisa',
    mirac: 'Isra ne Mi’raj ez’emikisa',
    berat: 'Ekiro kya Bara’ah eky’emikisa',
    mevlid: 'Mawlid ey’emikisa',
  },
  selamlar: {
    sahur: 'Sahur ey’emikisa',
    bayram: 'Idd ey’emikisa',
    iftar: 'Iftar ey’emikisa',
    kadir: 'Laylat al-Qadr ey’emikisa',
    arefe: 'Olunaku lwa Arafa olw’emikisa',
    hicriYilbasi: 'Omwaka omuggya ogw’Obusiraamu ogw’emikisa',
    cuma: 'Ejjuma ey’emikisa',
    ramazan: 'Lamanzaane ey’emikisa',
    sabah: 'Enkya ey’emikisa',
  },
};
