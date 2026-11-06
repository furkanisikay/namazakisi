import type { Sozluk } from '../tr';

/**
 * N'Ko (Manding) kalıpları: "kabul et" fiili QE 2:127 ߟߊߡߌ߬ߘߊ߬ (QuranEnc ankobambara_dayyan), dilek
 * kipi "Ala ye …" (Manding dua kalıbı; birebir kaynaklı değil, türetildi — yerli okuyucu baksın).
 * "Allah" her yerde ߊߟߊ߫ (sahip kararı 2026-11-04). Kandil ve hicrî yılbaşı selamı yalnız Türkiye geleneğinde
 * söylenir (`selam.ts > GELENEK_SELAMI_DILLERI`); buradaki karşılıklar tip bütünlüğü içindir.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'ߊߟߊ߫ ߦߋ߫ ߊ߬ ߞߍ߫ ߓߊߙߌߞߊ ߦߋ߫.',
  kabulDualari: ['ߊߟߊ߫ ߦߋ߫ ߊ߬ ߟߊߡߌ߬ߘߊ߬', 'ߊߟߊ߫ ߦߋ߫ ߊߟߎ߫ ߟߊ߫ ߛߊߟߌ ߟߊߡߌ߬ߘߊ߬', 'ߊߟߊ߫ ߦߋ߫ ߊ߲ ߟߊ߫ ߛߊߟߌ ߟߊߡߌ߬ߘߊ߬', 'ߊ߲ ߡߊߕߌߜߌ ߦߋ߫ ߊ߬ ߟߊߡߌ߬ߘߊ߬'],
  kabulDuasi: 'ߊߟߊ߫ ߦߋ߫ ߊ߬ ߟߊߡߌ߬ߘߊ߬',
  ekSabah: 'ߊߟߊ߫ ߦߋ߫ ߛߐߜߐߡߊ ߢߎ߬ߡߊ߲߬ ߘߌ߫',
  ekYatsi: 'ߊߟߊ߫ ߦߋ߫ ߛߎ ߢߎ߬ߡߊ߲߬ ߘߌ߫',
  tamGunAna: 'ߊߟߊ߫ ߦߋ߫ ߊ߬ ߟߊߡߌ߬ߘߊ߬',
  tamGunAlt: 'ߊߟߎ߫ ߓߘߊ߫ ߛߊߟߌ ߘߎ߬ߙߎ߫ ߓߍ߯ ߞߍ߫ ߓߌ߬.',
  kazaKabul: '{vakit} ߞߊߘߊ ߞߋߟߋ߲߫ ߓߘߊ߫ ߓߐ߫ ߊߟߎ߫ ߟߊ߫ ߛߓߍߟߌ ߞߐ߬ߣߐ. {dua}.',
  kandilGeceleri: {
    regaib: 'ߙߊߜߊߦߌߓߎ ߛߎ ߓߊߙߌߞߊߡߊ',
    mirac: 'ߌߛߌߙߊ ߣߌ߫ ߡߌߙߊߖߌ ߓߊߙߌߞߊߡߊ',
    berat: 'ߓߊߙߊߕߊ ߛߎ ߓߊߙߌߞߊߡߊ',
    mevlid: 'ߡߊߥߎߟߌߘߌ ߓߊߙߌߞߊߡߊ',
  },
  selamlar: {
    sahur: 'ߛߎߝߎߙߍ ߓߊߙߌߞߊߡߊ',
    bayram: 'ߛߊߟߌ ߓߊߙߌߞߊߡߊ',
    iftar: 'ߛߎ߲ߘߊߓߐ ߓߊߙߌߞߊߡߊ',
    kadir: 'ߟߊ߬ߕߍ߮ ߛߎ ߓߊߙߌߞߊߡߊ',
    arefe: 'ߊߙߊߝߊ߫ ߟߏ߲ ߓߊߙߌߞߊߡߊ',
    hicriYilbasi: 'ߛߌߟߊߡߍ ߛߊ߲߭ ߞߎߘߊ ߓߊߙߌߞߊߡߊ',
    cuma: 'ߛߌ߬ߣߌ߲߬ߟߏ߲ ߓߊߙߌߞߊߡߊ',
    ramazan: 'ߛߎ߲ߞߊߙߏ ߓߊߙߌߞߊߡߊ',
    sabah: 'ߊߟߊ߫ ߦߋ߫ ߛߐߜߐߡߊ ߢߎ߬ߡߊ߲߬ ߘߌ߫',
  },
};
