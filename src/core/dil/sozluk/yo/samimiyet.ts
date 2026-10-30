import type { Sozluk } from '../tr';

/**
 * Yoruba Müslümanlarının kalıpları (çeviri değil). Kabul duası "gbà" fiiliyle (2:127 "Olúwa wa,
 * gbà á lọ́wọ́ wa" birebir meal; diğerleri o kökten). Selamlar Yorubanın "Ẹ kú …" tebrik kalıbı
 * (Ẹ kú ọdún = bayram, Ẹ kú ààwẹ̀ = Ramazan). Yerli okuyucuyla DOĞRULANMADI. Kandil ve hicrî
 * yılbaşı selamı yalnız Türkiye geleneğinde söylenir; buradaki karşılıklar tip bütünlüğü içindir.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Kí Allāhu fi ìbùkún sí i.',
  kabulDualari: ['Kí Allāhu gbà á', 'Kí ó di àtẹ́wọ́gbà', 'Kí Allāhu gbà á lọ́wọ́ wa', 'Olúwa wa, gbà á lọ́wọ́ wa'],
  kabulDuasi: 'Kí Allāhu gbà á',
  ekSabah: 'Kí òwúrọ̀ yín ní ìbùkún',
  ekYatsi: 'Kí alẹ́ yín ní ìbùkún',
  tamGunAna: 'Kí Allāhu gbà á',
  tamGunAlt: 'Ẹ ti kí ìrun márààrún lónìí.',
  kazaKabul: 'A ti yọ Ƙaḍā’ {vakit} kan kúrò nínú àkọsílẹ̀ yín. {dua}.',
  kandilGeceleri: {
    regaib: 'Alẹ́ Raghā’ib alábùkún',
    mirac: 'Isrā’ àti Mi‘rāj alábùkún',
    berat: 'Alẹ́ Barā’ah alábùkún',
    mevlid: 'Mawlid alábùkún',
  },
  selamlar: {
    sahur: 'Ẹ kú sààrì',
    bayram: 'Ẹ kú ọdún',
    iftar: 'Ẹ kú ìsinu',
    kadir: 'Laylatul-Ƙadr alábùkún',
    arefe: 'Ẹ kú àìsùn ọdún',
    hicriYilbasi: 'Ẹ kú ọdún tuntun Hijrah',
    cuma: 'Ẹ kú ọjọ́ Jum‘ah',
    ramazan: 'Ẹ kú ààwẹ̀',
    sabah: 'Kí òwúrọ̀ yín ní ìbùkún',
  },
};
