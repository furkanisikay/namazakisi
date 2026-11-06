import type { Sozluk } from '../tr';

/**
 * Pular dua kalıpları (çeviri değil): "Yo Alla …" dilek yapısı sözlükte kaynaklı ("Yo Alla danndu
 * en", "Yo Alla reene ayna"); "kabul etmek" jaɓugol (QuranEnc 2:127 "jaɓan min"), "bereket vermek"
 * barkingol ("(Dieu) bénir"). Birleşik "Yo Alla jaɓu" kalıbı hiçbir kaynakta görülmedi — yerli
 * okuyucu doğrulamalı. Kandil ve hicrî yılbaşı selamı yalnız Türkiye geleneğinde söylenir
 * (`selam.ts > GELENEK_SELAMI_DILLERI`); buradaki karşılıklar tip bütünlüğü içindir. Övgü yok.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Yo Alla barkin ɗun.',
  kabulDualari: ['Yo Alla jaɓu', 'Yo Alla jaɓan en', 'Yo Alla jaɓu', 'Yo Joomiraaɗo jaɓu'],
  kabulDuasi: 'Yo Alla jaɓu',
  ekSabah: 'Yo Alla barkin bimmbi mon',
  ekYatsi: 'Yo Alla barkin jemma mon',
  tamGunAna: 'Yo Alla jaɓu',
  tamGunAlt: 'Hannde on juulii juulɗe njoy ɗen fow.',
  kazaKabul: 'Qadaa {vakit} go’o ittaama e deftere mon. {dua}.',
  kandilGeceleri: {
    regaib: 'Yo Alla barkin jemma Ragaa’ib',
    mirac: 'Yo Alla barkin Israa’ e Mi’raaji',
    berat: 'Yo Alla barkin jemma Baraa’a',
    mevlid: 'Yo Alla barkin Mawluud',
  },
  selamlar: {
    sahur: 'Yo Alla barkin suhuur mon',
    bayram: 'Yo Alla barkin juldeere nde',
    iftar: 'Yo Alla barkin huntaari mon',
    kadir: 'Yo Alla barkin Laylatul Qadri',
    arefe: 'Yo Alla barkin ñalawma Arafa',
    hicriYilbasi: 'Yo Alla barkin hitaande hesere Islaam',
    cuma: 'Yo Alla barkin Juma',
    ramazan: 'Yo Alla barkin Suumayee',
    sabah: 'Yo Alla barkin bimmbi mon',
  },
};
