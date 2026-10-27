import type { Sozluk } from '../tr';

/**
 * Arapça konuşan Müslümanların yerleşik kalıpları (çeviri değil). Ana kalıp تقبّل الله
 * (Mısır Dârü'l-İftâ meşru sayar; İbn Bâz "تقبل الله منك"de sakınca görmez). "حرماً" YOK
 * (İbn Bâz: aslı bilinmiyor). Kandil ve hicrî yılbaşı selamı ülkeye göre gösterilir
 * (`selam.ts > KANDIL_ULKELERI`); buradaki karşılıklar o ülkeler içindir.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'جعله الله مباركًا.',
  kabulDualari: ['تقبّل الله', 'تقبّل الله منّا ومنكم', 'تقبّل الله', 'تقبّل الله طاعتكم'],
  kabulDuasi: 'تقبّل الله',
  ekSabah: 'صباح الخير',
  ekYatsi: 'تصبحون على خير',
  tamGunAna: 'تقبّل الله',
  tamGunAlt: 'اكتملت الصلوات الخمس اليوم.',
  kazaKabul: 'خُصم قضاء واحد ({vakit}) من سجلك. {dua}.',
  kandilGeceleri: {
    regaib: 'ليلة رغائب مباركة',
    mirac: 'ذكرى إسراء ومعراج مباركة',
    berat: 'ليلة النصف من شعبان مباركة',
    mevlid: 'مولد نبوي مبارك',
  },
  selamlar: {
    sahur: 'سحور مبارك',
    bayram: 'عيد مبارك',
    iftar: 'إفطار مبارك',
    kadir: 'ليلة قدر مباركة',
    arefe: 'وقفة عيد مباركة',
    hicriYilbasi: 'عام هجري مبارك',
    cuma: 'جمعة مباركة',
    ramazan: 'رمضان مبارك',
    sabah: 'صباح الخير',
  },
};
