import type { Sozluk } from '../tr';

/**
 * Kabul duası "אללה יקבל" QE 2:127 "קבל מאתנו" kökünden türetildi (İbranice İslami kurum metni yok);
 * "ריבוננו" aynı ayetin hitabı. Selamlar "… מבורך" kalıbıyla; "רמדאן כרים" yerleşik kalıp.
 * Kandil ve hicrî yılbaşı selamı yalnız Türkiye geleneğinde söylenir (`selam.ts > GELENEK_SELAMI_DILLERI`);
 * buradaki karşılıklar tip bütünlüğü içindir. Yerli okuyucu gözden geçirmeli.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'שיהיה בברכה.',
  kabulDualari: ['אללה יקבל', 'שתתקבל', 'אללה יקבל', 'ריבוננו יקבל'],
  kabulDuasi: 'אללה יקבל',
  ekSabah: 'בוקר מבורך',
  ekYatsi: 'לילה מבורך',
  tamGunAna: 'אללה יקבל',
  tamGunAlt: 'היום השלמתם את חמש התפילות.',
  kazaKabul: 'תפילת השלמה אחת של {vakit} נוכתה מהיומן שלכם. {dua}.',
  kandilGeceleri: {
    regaib: "ליל אל-רע'איב מבורך",
    mirac: "ליל אל-אסראא ואל-מעראג' מבורך",
    berat: 'ליל אל-בראאה מבורך',
    mevlid: 'מוולד א-נבי מבורך',
  },
  selamlar: {
    sahur: 'סחור מבורך',
    bayram: 'חג מבורך',
    iftar: 'אפטאר מבורך',
    kadir: 'ליילת אל-קדר מבורכת',
    arefe: 'ערב חג מבורך',
    hicriYilbasi: "שנה הג'רית חדשה מבורכת",
    cuma: "יום ג'ומעה מבורך",
    ramazan: 'רמדאן כרים',
    sabah: 'בוקר מבורך',
  },
};
