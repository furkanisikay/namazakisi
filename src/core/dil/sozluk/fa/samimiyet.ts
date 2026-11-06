import type { Sozluk } from '../tr';

/**
 * Farsça konuşan Müslümanların namaz sonrası ve selam için kullandığı yerleşik kalıplar (çeviri
 * değil). Kabul duası "قبول باشد" (baskın, iki yuva) ve "خدا/خداوند قبول کند"; "التماس دعا"
 * dua isteğidir, kabul duası DEĞİL → yok. Övgü ve "!" yok. Kandil ve hicrî yılbaşı selamı
 * yalnız ülke listesindeki gecelerde söylenir (`selam.ts > KANDIL_ULKELERI`).
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'مبارک باشد.',
  kabulDualari: ['قبول باشد', 'خدا قبول کند', 'قبول باشد', 'خداوند قبول کند'],
  kabulDuasi: 'قبول باشد',
  ekSabah: 'صبح بخیر',
  ekYatsi: 'شب بخیر',
  tamGunAna: 'قبول باشد',
  tamGunAlt: 'امروز هر پنج نماز را خواندید.',
  kazaKabul: 'یک نماز قضای {vakit} از دفترتان کم شد. {dua}.',
  kandilGeceleri: {
    regaib: 'شب رغائب مبارک',
    mirac: 'شب معراج مبارک',
    berat: 'شب برات مبارک',
    mevlid: 'میلاد پیامبر مبارک',
  },
  selamlar: {
    sahur: 'سحرتان پربرکت',
    bayram: 'عید مبارک',
    iftar: 'افطارتان گوارا',
    kadir: 'شب قدرتان پربرکت',
    arefe: 'پیشاپیش عید مبارک',
    hicriYilbasi: 'سال نو هجری قمری مبارک',
    cuma: 'جمعه مبارک',
    ramazan: 'رمضان مبارک',
    sabah: 'صبح بخیر',
  },
};
