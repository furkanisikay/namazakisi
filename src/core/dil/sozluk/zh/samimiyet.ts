// ÇEVİRİ: zh — İngilizce iskelet, çevrilince bu satır silinir
import type { Sozluk } from '../tr';

/**
 * İngilizce konuşan Müslümanların yerleşik kalıpları (çeviri değil). Kandil ve hicrî yılbaşı
 * selamı yalnız Türkiye geleneğinde söylenir (`selam.ts > GELENEK_SELAMI_DILLERI`); buradaki
 * karşılıklar tip bütünlüğü içindir.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'May it be blessed.',
  kabulDualari: ['May Allah accept it', 'May it be accepted', 'May Allah accept it', 'May our Lord accept it'],
  kabulDuasi: 'May Allah accept it',
  ekSabah: 'Have a blessed morning',
  ekYatsi: 'Have a blessed night',
  tamGunAna: 'May Allah accept it',
  tamGunAlt: 'You completed all five prayers today.',
  kazaKabul: 'One {vakit} qada was deducted from your log. {dua}.',
  kandilGeceleri: {
    regaib: 'Blessed night of Raghaib',
    mirac: "Blessed Isra and Mi'raj",
    berat: "Blessed night of Bara'ah",
    mevlid: 'Blessed Mawlid',
  },
  selamlar: {
    sahur: 'Blessed suhoor',
    bayram: 'Eid Mubarak',
    iftar: 'Blessed iftar',
    kadir: 'Blessed Laylat al-Qadr',
    arefe: 'Blessed eve of Eid',
    hicriYilbasi: 'Blessed Islamic New Year',
    cuma: "Jumu'ah Mubarak",
    ramazan: 'Ramadan Mubarak',
    sabah: 'Have a blessed morning',
  },
};
