import type { Sozluk } from '../tr';

/**
 * Tatarca söyleyen Müslümanların yerleşik kalıpları (çeviri değil): namazdan sonra "Кабул булсын"
 * (IslamHouse tt "Догаң кабул булсын…"), "Аллаһ кабул кылсын" (ana oturum kararı, kısa kalıp
 * türetildi), "Аллаһы Тәгалә кабул кылсын" ("Аллаһы Тәгалә" dumrt kullanımı); selamlarda "…
 * мөбарәк булсын", "Хәерле иртә/төн". Kandil ve bayram adları ДУМ РТ 2027 takvimi (Рәгаиб, Мигъраҗ,
 * Бәраәт, Кадер кичәсе, Ураза/Корбан гаете, Гарәфә көне, Мәүлид) — yerli okuyucuyla DOĞRULANMADI.
 * Övgü ve "!" yok.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Хәерле булсын.',
  kabulDualari: ['Аллаһ кабул кылсын', 'Кабул булсын', 'Аллаһ кабул кылсын', 'Аллаһы Тәгалә кабул кылсын'],
  kabulDuasi: 'Аллаһ кабул кылсын',
  ekSabah: 'Хәерле иртә',
  ekYatsi: 'Хәерле төн',
  tamGunAna: 'Аллаһ кабул кылсын',
  tamGunAlt: 'Бүген биш вакыт намазны тулысынча укыдыгыз.',
  kazaKabul: 'Дәфтәрегездән бер {vakit} казасы төшереп калдырылды. {dua}.',
  kandilGeceleri: {
    regaib: 'Рәгаиб кичәсе мөбарәк булсын',
    mirac: 'Мигъраҗ кичәсе мөбарәк булсын',
    berat: 'Бәраәт кичәсе мөбарәк булсын',
    mevlid: 'Мәүлид мөбарәк булсын',
  },
  selamlar: {
    sahur: 'Сәхәрегез кабул булсын',
    bayram: 'Гаетегез мөбарәк булсын',
    iftar: 'Авыз ачуыгыз кабул булсын',
    kadir: 'Кадер кичәсе мөбарәк булсын',
    arefe: 'Гарәфә көне мөбарәк булсын',
    hicriYilbasi: 'Һиҗри яңа ел мөбарәк булсын',
    cuma: 'Җомгагыз мөбарәк булсын',
    ramazan: 'Рамазан ае мөбарәк булсын',
    sabah: 'Хәерле иртә',
  },
};
