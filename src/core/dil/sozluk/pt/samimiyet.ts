import type { Sozluk } from '../tr';

/**
 * Portekizce konuşan Müslümanların kalıpları (çeviri değil): "Que Allah aceite" (fiil "aceitar",
 * meal 2:127 "Aceita-a de nós"; kalıp türetildi), Arapça "Taqabbal Allah" (topluluklarda aynen
 * söylenir; es emsali), "Que Allah aceite de nós". Övgü ve "!" yok. Ramazan Avrupa yazımıyla
 * "Ramadão". Kandil ve hicrî yılbaşı selamı ülke başına gösterilir (`selam.ts`); karşılıklar o durum içindir.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Que seja para o bem.',
  kabulDualari: ['Que Allah aceite', 'Taqabbal Allah', 'Que Allah aceite', 'Que Allah aceite de nós'],
  kabulDuasi: 'Que Allah aceite',
  ekSabah: 'Que tenha uma manhã abençoada',
  ekYatsi: 'Que tenha uma noite abençoada',
  tamGunAna: 'Que Allah aceite',
  tamGunAlt: 'Hoje completou as cinco orações.',
  kazaKabul: 'Foi descontada do seu registo uma reposição de {vakit}. {dua}.',
  kandilGeceleri: {
    regaib: 'Abençoada noite de Ragaib',
    mirac: 'Abençoada noite do Isra e Mi’raj',
    berat: 'Abençoada noite de Bara’ah',
    mevlid: 'Abençoado Mawlid',
  },
  selamlar: {
    sahur: 'Abençoado suhur',
    bayram: 'Eid Mubarak',
    iftar: 'Abençoado iftar',
    kadir: 'Abençoada Noite do Decreto',
    arefe: 'Abençoada véspera do Eid',
    hicriYilbasi: 'Abençoado Ano Novo da Hégira',
    cuma: 'Jumu’ah Mubarak',
    ramazan: 'Ramadão Mubarak',
    sabah: 'Que tenha uma manhã abençoada',
  },
};
