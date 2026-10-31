import type { Sozluk } from '../tr';

/**
 * İtalyanca konuşan Müslümanların kalıpları (çeviri değil): "Che Allah l’accetti" (meal 2:127
 * "accettala da parte nostra" kökü; türetildi), Arapça "Taqabbal Allah" (İtalya'daki topluluklarda
 * aynen söylenir), "Che il nostro Signore l’accetti". Övgü ve "!" yok. "Eid Mubarak", "Ramadan
 * Mubarak", "Jumu’ah Mubarak" Arapça kalıptır, aynen yazılır. Kandil ve hicrî yılbaşı selamı
 * ülke başına gösterilir (`selam.ts`); karşılıklar o durum içindir.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Che sia di buon auspicio.',
  kabulDualari: ['Che Allah l’accetti', 'Taqabbal Allah', 'Che Allah l’accetti', 'Che il nostro Signore l’accetti'],
  kabulDuasi: 'Che Allah l’accetti',
  ekSabah: 'Una mattinata benedetta',
  ekYatsi: 'Una notte benedetta',
  tamGunAna: 'Che Allah l’accetti',
  tamGunAlt: 'Oggi ha compiuto tutte e cinque le preghiere.',
  kazaKabul: 'Un recupero di {vakit} è stato tolto dal suo registro. {dua}.',
  kandilGeceleri: {
    regaib: 'Benedetta notte di Raghaib',
    mirac: 'Benedetta notte dell’Isra e del Mi’raj',
    berat: 'Benedetta notte di Bara’ah',
    mevlid: 'Benedetto Mawlid',
  },
  selamlar: {
    sahur: 'Suhur benedetto',
    bayram: 'Eid Mubarak',
    iftar: 'Iftar benedetto',
    kadir: 'Benedetta Laylat al-Qadr',
    arefe: 'Benedetta vigilia dell’Eid',
    hicriYilbasi: 'Benedetto anno nuovo dell’Egira',
    cuma: 'Jumu’ah Mubarak',
    ramazan: 'Ramadan Mubarak',
    sabah: 'Una mattinata benedetta',
  },
};
