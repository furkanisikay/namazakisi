import type { Sozluk } from '../tr';

/**
 * Dagbani kalıpları (çeviri değil): dua "Allah ni deei" ("Allah kabul etsin"; kabul fiili QuranEnc
 * `dagbani_ghatubo` 2:127 "Deemi ti suhigu", "ni" dilek kipi; Allah adı sahip kararıyla "Allah",
 * mealin "Naawuni"si değil), "ti Duuma" (Rabbimiz, 2:127), "alibarika" (bereket, QE 17:1). Bütün
 * kalıplar TÜRETİLDİ, yerli okuyucuyla DOĞRULANMADI. Kandil ve hicrî yılbaşı selamı yalnız
 * Türkiye geleneğinde söylenir (`selam.ts > GELENEK_SELAMI_DILLERI`); buradaki karşılıklar tip
 * bütünlüğü içindir.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Allah ni niŋ alibarika.',
  kabulDualari: ['Allah ni deei', 'Allah ni deei ti jiŋli', 'Allah ni deei', 'Ti Duuma ni deei'],
  kabulDuasi: 'Allah ni deei',
  ekSabah: 'Asiba alibarika',
  ekYatsi: 'Yuŋ alibarika',
  tamGunAna: 'Allah ni deei',
  tamGunAlt: 'Zuŋɔ yi puhi jiŋa anu maa zaa.',
  kazaKabul: 'Bɛ yihi {vakit} labi puhibu yini yi gbaŋ maa ni. {dua}.',
  kandilGeceleri: {
    regaib: 'Ragaa’ibi yuŋ alibarika',
    mirac: 'Israa’i mini Mi’iraj alibarika',
    berat: 'Baraa’a yuŋ alibarika',
    mevlid: 'Mawlid alibarika',
  },
  selamlar: {
    sahur: 'Saɣila alibarika',
    bayram: 'Chuɣu alibarika',
    iftar: 'Iftar alibarika',
    kadir: 'Lailatul Qadri alibarika',
    arefe: 'Arafa dabsili alibarika',
    hicriYilbasi: 'Hijira yuun palli alibarika',
    cuma: 'Alizumma alibarika',
    ramazan: 'Nolɔri goli alibarika',
    sabah: 'Asiba alibarika',
  },
};
