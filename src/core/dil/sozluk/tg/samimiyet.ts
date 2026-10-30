import type { Sozluk } from '../tr';

/**
 * Tacik Müslümanlarının namaz sonrası ve selam için kullandığı yerleşik kalıplar (çeviri değil):
 * "Худо қабул кунад" (baskın, iki yuva), Fars geleneğinden "Қабул бошад" ve "Аллоҳ қабул кунад".
 * Selamlar "… муборак" kalıbıyla (Ҷумъа муборак, Рамазон муборак, Ид муборак). Övgü ve "!" yok.
 * Kandil ve hicrî yılbaşı selamı yalnız ülke listesindeki gecelerde söylenir
 * (`selam.ts > KANDIL_ULKELERI`).
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Муборак бошад.',
  kabulDualari: ['Худо қабул кунад', 'Қабул бошад', 'Худо қабул кунад', 'Аллоҳ қабул кунад'],
  kabulDuasi: 'Худо қабул кунад',
  ekSabah: 'Субҳ ба хайр',
  ekYatsi: 'Шаб ба хайр',
  tamGunAna: 'Худо қабул кунад',
  tamGunAlt: 'Имрӯз ҳар панҷ намозро хондед.',
  kazaKabul: 'Як намози қазои {vakit} аз дафтаратон кам шуд. {dua}.',
  kandilGeceleri: {
    regaib: 'Шаби Рағоиб муборак',
    mirac: 'Шаби Меъроҷ муборак',
    berat: 'Шаби Барот муборак',
    mevlid: 'Мавлуди Пайғамбар муборак',
  },
  selamlar: {
    sahur: 'Саҳарии пурбаракат',
    bayram: 'Ид муборак',
    iftar: 'Ифтори пурбаракат',
    kadir: 'Шаби Қадр муборак',
    arefe: 'Пешакӣ Ид муборак',
    hicriYilbasi: 'Соли нави ҳиҷрӣ муборак',
    cuma: 'Ҷумъа муборак',
    ramazan: 'Рамазон муборак',
    sabah: 'Субҳ ба хайр',
  },
};
