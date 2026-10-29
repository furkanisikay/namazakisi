import type { Sozluk } from '../tr';

/**
 * Özbek Müslümanlarının namazdan sonra ve mübarek günlerde söylediği yerleşik kalıplar
 * (muslim.uz / islom.uz kullanımı), çeviri değil. "Аллоҳ қабул қилсин" baskın kalıp (iki yuva),
 * "Қабул бўлсин" ve "Намозингиз қабул бўлсин" gündelik kullanım. Kandil geceleri Özbekistan'da
 * resmî din kurumu takviminde (Рағоиб, Меърож, Бароат, Мавлид). Övgü ve "!" yok.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Хайрли бўлсин.',
  kabulDualari: ['Аллоҳ қабул қилсин', 'Қабул бўлсин', 'Аллоҳ қабул қилсин', 'Намозингиз қабул бўлсин'],
  kabulDuasi: 'Аллоҳ қабул қилсин',
  ekSabah: 'Хайрли тонг',
  ekYatsi: 'Хайрли тун',
  tamGunAna: 'Аллоҳ қабул қилсин',
  tamGunAlt: 'Бугун беш вақт намозни тўлиқ ўқидингиз.',
  kazaKabul: 'Битта {vakit} қазоси дафтарингиздан чиқарилди. {dua}.',
  kandilGeceleri: {
    regaib: 'Рағоиб кечаси муборак бўлсин',
    mirac: 'Меърож кечаси муборак бўлсин',
    berat: 'Бароат кечаси муборак бўлсин',
    mevlid: 'Мавлид муборак бўлсин',
  },
  selamlar: {
    sahur: 'Саҳарлигингиз хайрли бўлсин',
    bayram: 'Ҳайитингиз муборак бўлсин',
    iftar: 'Ифторингиз муборак бўлсин',
    kadir: 'Қадр кечаси муборак бўлсин',
    arefe: 'Арафа кунингиз муборак бўлсин',
    hicriYilbasi: 'Ҳижрий янги йил муборак бўлсин',
    cuma: 'Жума муборак',
    ramazan: 'Рамазон ойи муборак бўлсин',
    sabah: 'Хайрли тонг',
  },
};
