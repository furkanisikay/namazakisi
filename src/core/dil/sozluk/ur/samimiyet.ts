import type { Sozluk } from '../tr';

/**
 * Urdu konuşan Müslümanların namaz sonrası ve selam için kullandığı yerleşik kalıplar (çeviri
 * değil). Kabul duası "اللہ قبول فرمائے" ve yaygın varyantları; övgü ve "!" yok. Kandil selamı
 * yalnız ülke listesindeki gecelerde söylenir (`selam.ts > KANDIL_ULKELERI`; Pakistan: Mevlid).
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'مبارک ہو۔',
  kabulDualari: ['اللہ قبول فرمائے', 'اللہ تعالیٰ قبول فرمائے', 'اللہ قبول فرمائے', 'اللہ پاک قبول فرمائے'],
  kabulDuasi: 'اللہ قبول فرمائے',
  ekSabah: 'صبح بخیر',
  ekYatsi: 'شب بخیر',
  tamGunAna: 'اللہ قبول فرمائے',
  tamGunAlt: 'آج آپ نے پانچوں نمازیں مکمل کر لیں۔',
  kazaKabul: 'آپ کے ریکارڈ سے {vakit} کی ایک قضا نماز کم کر دی گئی۔ {dua}۔',
  kandilGeceleri: {
    regaib: 'شبِ رغائب مبارک',
    mirac: 'شبِ معراج مبارک',
    berat: 'شبِ برات مبارک',
    mevlid: 'عید میلاد النبی مبارک',
  },
  selamlar: {
    sahur: 'سحری بابرکت ہو',
    bayram: 'عید مبارک',
    iftar: 'افطار بابرکت ہو',
    kadir: 'شبِ قدر مبارک',
    arefe: 'عید کی آمد مبارک',
    hicriYilbasi: 'نیا اسلامی سال مبارک',
    cuma: 'جمعہ مبارک',
    ramazan: 'رمضان مبارک',
    sabah: 'صبح بخیر',
  },
};
