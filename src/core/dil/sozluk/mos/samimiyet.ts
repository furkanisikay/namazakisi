import type { Sozluk } from '../tr';

/**
 * Mooré konuşan Müslümanların dua kalıbı: "Allah na …" (dilek kipi "na"; HadeethEnc mos 65097
 * "… reegda y kosgã", QuranEnc 2:127 "Reeg d yĩnga" kökü), "… barka" bereket selamı. Allah adı
 * arayüzde "Allah" (sahip kararı). Hepsi türetildi; yerli okuyucu bakmalı. Kandil ve hicrî yılbaşı
 * selamı yalnız Türkiye geleneğinde söylenir; buradaki karşılıklar tip bütünlüğü içindir.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Allah na kõ barka.',
  kabulDualari: ['Allah na reege', 'Allah na reeg y pʋʋsgã', 'Allah na reeg tõnd fãa', 'Tõnd Soabã na reege'],
  kabulDuasi: 'Allah na reege',
  ekSabah: 'Allah na kõ yibeoog sõma',
  ekYatsi: 'Allah na kõ yʋng sõma',
  tamGunAna: 'Allah na reege',
  tamGunAlt: 'Rũndã y pʋʋsa pʋʋs-rãmbã a nu wã fãa.',
  kazaKabul: 'B yika {vakit} rolb a ye y Rolb sebrẽ wã. {dua}.',
  kandilGeceleri: {
    regaib: 'Ragaa-ib yʋng barka',
    mirac: 'Israa la Miraaj barka',
    berat: 'Baraa-a yʋng barka',
    mevlid: 'Mawliid barka',
  },
  selamlar: {
    sahur: 'Sahuur barka',
    bayram: 'Kibs barka',
    iftar: 'Noor-lokr barka',
    kadir: 'Kordgã yʋng barka',
    arefe: 'Arafa raar barka',
    hicriYilbasi: 'Hijra yʋʋm-paalg barka',
    cuma: 'Arzũm barka',
    ramazan: 'Ramadaan barka',
    sabah: 'Allah na kõ yibeoog sõma',
  },
};
