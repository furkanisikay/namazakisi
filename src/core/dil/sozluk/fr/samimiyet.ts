import type { Sozluk } from '../tr';

/**
 * Fransızca konuşan Müslümanların yerleşik kalıpları (çeviri değil): "Qu’Allah l’accepte",
 * Arapça "Taqabbal Allah", "Qu’Allah l’agrée". Övgü ve "!" yok. Kandil ve hicrî yılbaşı
 * selamı ülke başına gösterilir (`selam.ts`); karşılıklar o durum içindir.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Qu’Allah y mette Sa baraka.',
  kabulDualari: ['Qu’Allah l’accepte', 'Taqabbal Allah', 'Qu’Allah l’accepte', 'Qu’Allah l’agrée'],
  kabulDuasi: 'Qu’Allah l’accepte',
  ekSabah: 'Bonne matinée',
  ekYatsi: 'Bonne nuit',
  tamGunAna: 'Qu’Allah l’accepte',
  tamGunAlt: 'Vous avez accompli les cinq prières aujourd’hui.',
  kazaKabul: 'Un rattrapage {vakit} a été retiré de votre carnet. {dua}.',
  kandilGeceleri: {
    regaib: 'Bénie soit la nuit de Raghaïb',
    mirac: 'Bénie soit la nuit d’Isra et Mi’raj',
    berat: 'Bénie soit la nuit de la Bara’a',
    mevlid: 'Mawlid béni',
  },
  selamlar: {
    sahur: 'Bon souhour',
    bayram: 'Aïd moubarak',
    iftar: 'Bon iftar',
    kadir: 'Bénie soit la Nuit du Destin',
    arefe: 'Bénie soit la veille de l’Aïd',
    hicriYilbasi: 'Bonne année de l’Hégire',
    cuma: 'Joumoua moubaraka',
    ramazan: 'Ramadan moubarak',
    sabah: 'Bonne matinée',
  },
};
