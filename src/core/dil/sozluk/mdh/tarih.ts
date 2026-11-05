import type { Sozluk } from '../tr';

/**
 * CLDR'de `mdh` yok. Gün adları Bangsamoro'da yerleşik Malayca/Arapça kökenli takım (Ahad, Isnin,
 * Salasa, Arbaa, Kamis, Jum'at, Sabtu; türetildi), ay adları Filipinler ortak takımı (fil emsali),
 * tarih sırası Filipinler normu ("Nobyembre 4, 2026"). Yerli okuyucuyla DOĞRULANMADI.
 */
export const tarih: Sozluk['tarih'] = {
  gunler: ['Ahad', 'Isnin', 'Salasa', 'Arbaa', 'Kamis', "Jum'at", 'Sabtu'],
  gunlerKisa: ['Ahd', 'Isn', 'Sal', 'Arb', 'Kam', 'Jum', 'Sab'],
  aylar: ['Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo', 'Hulyo', 'Agosto', 'Setyembre', 'Oktubre', 'Nobyembre', 'Disyembre'],
  aylarYalin: ['Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo', 'Hulyo', 'Agosto', 'Setyembre', 'Oktubre', 'Nobyembre', 'Disyembre'],
  aylarKisa: ['Ene', 'Peb', 'Mar', 'Abr', 'May', 'Hun', 'Hul', 'Ago', 'Set', 'Okt', 'Nob', 'Dis'],
  haftaHarfleri: ['Is', 'Sl', 'Ar', 'Ka', 'Ju', 'Sb', 'Ah'],
  uzun: '{ay} {gun}, {yil}',
  gunAdiYil: '{gunAdi}, {yil}',
};
