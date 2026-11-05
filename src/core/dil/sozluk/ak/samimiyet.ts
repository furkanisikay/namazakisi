import type { Sozluk } from '../tr';

/**
 * Akan Müslümanlarının kalıpları (çeviri değil). "gye ... tom" (kabul etmek) QE 98:8 "Nyankopɔn agye
 * wɔn atom", istek kipi HadeethEnc ak "Allah nnye no ntom"; "nhyira" (bereket) HadeethEnc ak "Allah
 * nhyira ne n'asomdwoeɛ nka no"; bayram "Afehyia pa" Gana'nın bayram tebriği. Yerli okuyucu baksın.
 * Kandil ve hicrî yılbaşı selamı yalnız Türkiye geleneğinde söylenir (`selam.ts > GELENEK_SELAMI_DILLERI`);
 * buradaki karşılıklar tip bütünlüğü içindir.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Allah nhyira mu.',
  kabulDualari: ['Allah nnye ntom', 'Allah nnye wo Nyamefrɛ ntom', 'Allah nnye ntom', 'Yɛn Wura nnye ntom'],
  kabulDuasi: 'Allah nnye ntom',
  ekSabah: 'Anɔpa a nhyira wɔ mu',
  ekYatsi: 'Anadwo a nhyira wɔ mu',
  tamGunAna: 'Allah nnye ntom',
  tamGunAlt: 'Ɛnnɛ woayɛ Nyamefrɛ mprɛ anum no nyinaa.',
  kazaKabul: 'Wɔayi {vakit} Qada baako afiri wo nwoma mu. {dua}.',
  kandilGeceleri: {
    regaib: 'Raghaib anadwo a nhyira wɔ mu',
    mirac: 'Isra ne Mi’raj a nhyira wɔ mu',
    berat: 'Bara’ah anadwo a nhyira wɔ mu',
    mevlid: 'Mawlid a nhyira wɔ mu',
  },
  selamlar: {
    sahur: 'Suhur a nhyira wɔ mu',
    bayram: 'Afehyia pa',
    iftar: 'Iftar a nhyira wɔ mu',
    kadir: 'Laylat al-Qadr a nhyira wɔ mu',
    arefe: 'Eid anim da a nhyira wɔ mu',
    hicriYilbasi: 'Hijra afe foforo pa',
    cuma: 'Efiada a nhyira wɔ mu',
    ramazan: 'Ramadan a nhyira wɔ mu',
    sabah: 'Anɔpa a nhyira wɔ mu',
  },
};
