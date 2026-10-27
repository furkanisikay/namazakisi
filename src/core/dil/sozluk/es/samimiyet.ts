import type { Sozluk } from '../tr';

/**
 * İspanyolca konuşan Müslümanların yerleşik kalıpları (çeviri değil): "Que Allah lo acepte",
 * Arapça "Taqabbal Allah" (İspanya ve Latin Amerika topluluklarında aynen söylenir),
 * "Que Allah nos lo acepte". Övgü ve "!" yok. Kandil ve hicrî yılbaşı selamı ülke başına
 * gösterilir (`selam.ts`); karşılıklar o durum içindir.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Que sea para bien.',
  kabulDualari: ['Que Allah lo acepte', 'Taqabbal Allah', 'Que Allah lo acepte', 'Que Allah nos lo acepte'],
  kabulDuasi: 'Que Allah lo acepte',
  ekSabah: 'Que tenga una mañana bendecida',
  ekYatsi: 'Que tenga una noche bendecida',
  tamGunAna: 'Que Allah lo acepte',
  tamGunAlt: 'Hoy completó los cinco rezos.',
  kazaKabul: 'Se descontó de su registro un qada de {vakit}. {dua}.',
  kandilGeceleri: {
    regaib: 'Bendita sea la noche de Ragaib',
    mirac: 'Bendita sea la noche del Isra y el Mi’ray',
    berat: 'Bendita sea la noche de Bara’a',
    mevlid: 'Bendito Mawlid',
  },
  selamlar: {
    sahur: 'Bendito suhur',
    bayram: 'Eid Mubarak',
    iftar: 'Bendito iftar',
    kadir: 'Bendita sea la Noche del Decreto',
    arefe: 'Bendita sea la víspera del Eid',
    hicriYilbasi: 'Bendito año nuevo de la Hégira',
    cuma: 'Yumu’a Mubarak',
    ramazan: 'Ramadán Mubarak',
    sabah: 'Que tenga una mañana bendecida',
  },
};
