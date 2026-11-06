import type { Sozluk } from '../tr';

/**
 * Kirundi kalıpları (çeviri değil): kök meal 2:127'nin "kwakira" fiili ("Twakirire"); ana oturum
 * kararıyla "Allah" ("Imana" değil). Kalıpların hepsi TÜRETİLDİ, yerli okuyucu baksın. Kandil ve
 * hicrî yılbaşı selamı yalnız Türkiye geleneğinde söylenir (`selam.ts > GELENEK_SELAMI_DILLERI`);
 * buradaki karşılıklar tip bütünlüğü içindir.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Allah abihezagire.',
  kabulDualari: ['Allah abyakire', 'Allah atwakirire', 'Allah aryakire', 'Umukama wacu abyakire'],
  kabulDuasi: 'Allah abyakire',
  ekSabah: 'Igitondo c’umugisha',
  ekYatsi: 'Ijoro ry’umugisha',
  tamGunAna: 'Allah abyakire',
  tamGunAlt: 'Uyu musi mwasenze amasengesho yose uko ari atanu.',
  kazaKabul: 'Isengesho rimwe rya Qadha rya {vakit} ryakuwe mu gitabo canyu. {dua}.',
  kandilGeceleri: {
    regaib: 'Ijoro ry’umugisha rya Raghaib',
    mirac: 'Isra na Mi’raj vy’umugisha',
    berat: 'Ijoro ry’umugisha rya Bara’ah',
    mevlid: 'Mawlid y’umugisha',
  },
  selamlar: {
    sahur: 'Suhuri y’umugisha',
    bayram: 'Ilayidi y’umugisha',
    iftar: 'Ifutari y’umugisha',
    kadir: 'Ijoro ry’umugisha rya Qadr',
    arefe: 'Umusi w’umugisha wa Arafa',
    hicriYilbasi: 'Umwaka mushasha wa Hijiriya w’umugisha',
    cuma: 'Ijuma ry’umugisha',
    ramazan: 'Ramadhani y’umugisha',
    sabah: 'Igitondo c’umugisha',
  },
};
