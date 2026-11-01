import type { Sozluk } from '../tr';

/**
 * Rumence konuşan Müslümanların kalıpları (çeviri değil). "Doamne, primește de la noi" QuranEnc
 * `romanian_project` 2:127'deki duadır (Rabbenâ tekabbel minnâ; köşeli ek ve "!" düşürüldü, virgüllü ș).
 * "Allah să primească" (Allah kabul etsin) fiil kökü kaynaklı (5:27 "Allah primește"), kalıp türetildi;
 * "Să fie primită" (kabul olsun) türetildi — yerli okuyucuyla DOĞRULANMADI. "Să fie într-un ceas bun"
 * Rumencenin yerleşik hayır dileğidir. Övgü ve "!" yok. Kandil ve hicrî yılbaşı selamı ülke başına
 * gösterilir (`selam.ts`); Romanya Müslümanları bayram/kandil adlarını Türkçe kökenli kullanır (Bayram, Berat).
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Să fie într-un ceas bun.',
  kabulDualari: ['Allah să primească', 'Doamne, primește de la noi', 'Allah să primească', 'Să fie primită'],
  kabulDuasi: 'Allah să primească',
  ekSabah: 'Dimineață binecuvântată',
  ekYatsi: 'Noapte binecuvântată',
  tamGunAna: 'Allah să primească',
  tamGunAlt: 'Astăzi ați efectuat toate cele cinci rugăciuni.',
  kazaKabul: 'O rugăciune {vakit} de recuperat a fost scăzută din registru. {dua}.',
  kandilGeceleri: {
    regaib: 'Noapte de Regaib binecuvântată',
    mirac: 'Noapte de Miraj binecuvântată',
    berat: 'Noapte de Berat binecuvântată',
    mevlid: 'Mevlid binecuvântat',
  },
  selamlar: {
    sahur: 'Suhur binecuvântat',
    bayram: 'Bayram binecuvântat',
    iftar: 'Iftar binecuvântat',
    kadir: 'Noaptea al-Qadr binecuvântată',
    arefe: 'Ajun de Bayram binecuvântat',
    hicriYilbasi: 'An Nou Hegirian binecuvântat',
    cuma: 'Vineri binecuvântată',
    ramazan: 'Ramadan binecuvântat',
    sabah: 'Dimineață binecuvântată',
  },
};
