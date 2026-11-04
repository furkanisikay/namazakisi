import type { Sozluk } from '../tr';

/**
 * Filipinli Müslümanların kalıpları (çeviri değil): fiil kökü "tanggapin" QuranEnc
 * `tagalog_rwwad` 2:127 ("Panginoon Namin, tanggapin Mo mula sa amin") + dilek eki "nawa"
 * (türetildi); bayram, cuma ve Ramazan için yerleşik Arapça "Mubarak" kalıpları ve ortak
 * "Taqabbal Allahu minna wa minkum". Kandil ve hicrî yılbaşı selamı Filipinler'de söylenmez
 * (`selam.ts > KANDIL_ULKELERI`); buradaki karşılıklar tip bütünlüğü içindir. Övgü ve "!" yok.
 * Yerli okuyucuyla DOĞRULANMADI.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: "Nawa'y maging pinagpala.",
  kabulDualari: ['Tanggapin nawa ni Allah', 'Taqabbal Allahu minna wa minkum', 'Tanggapin nawa ni Allah', 'Tanggapin nawa ng ating Panginoon'],
  kabulDuasi: 'Tanggapin nawa ni Allah',
  ekSabah: 'Mapagpalang umaga',
  ekYatsi: 'Mapagpalang gabi',
  tamGunAna: 'Tanggapin nawa ni Allah',
  tamGunAlt: 'Naidasal ninyo ngayong araw ang limang dasal.',
  kazaKabul: 'Nabawasan ng isang qada ng {vakit} ang inyong talaan. {dua}.',
  kandilGeceleri: {
    regaib: 'Mapagpalang gabi ng Raghaib',
    mirac: "Mapagpalang Isra' at Mi'raj",
    berat: "Mapagpalang gabi ng Bara'ah",
    mevlid: 'Mapagpalang Mawlid',
  },
  selamlar: {
    sahur: 'Mapagpalang sahur',
    bayram: 'Eid Mubarak',
    iftar: 'Mapagpalang iftar',
    kadir: 'Mapagpalang Laylat al-Qadr',
    arefe: 'Mapagpalang bisperas ng Eid',
    hicriYilbasi: 'Mapagpalang Bagong Taon ng Hijri',
    cuma: "Jumu'ah Mubarak",
    ramazan: 'Ramadan Mubarak',
    sabah: 'Mapagpalang umaga',
  },
};
