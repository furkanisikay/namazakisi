import type { Sozluk } from '../tr';

/**
 * Pencapça (Şahmuki) konuşan Müslümanların namaz sonrası ve selam kalıpları (çeviri değil).
 * Kabul duası "اللہ قبول کرے" türetildi, DOĞRULANMADI (`ur` "اللہ قبول فرمائے" emsali; Gurmuki
 * meal 2:127 kökü "قبول فرما"); "رب" Pencapçada yaygın Allah adıdır (Türkçe "Rabbim" yuvası).
 * Mübarek kalıpları (عید مبارک، جمعہ مبارک، رمضان مبارک) Urducayla ortaktır. Övgü ve "!" yok. Kandil selamı yalnız ülke listesindeki gecelerde söylenir
 * (`selam.ts > KANDIL_ULKELERI`; Pakistan: Mevlid).
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'مبارک ہووے۔',
  kabulDualari: ['اللہ قبول کرے', 'رب قبول کرے', 'اللہ قبول کرے', 'اللہ پاک قبول کرے'],
  kabulDuasi: 'اللہ قبول کرے',
  ekSabah: 'صبح بخیر',
  ekYatsi: 'شب بخیر',
  tamGunAna: 'اللہ قبول کرے',
  tamGunAlt: 'اج تسیں پنجے نمازاں پوریاں کر لئیاں۔',
  kazaKabul: 'تہاڈے ریکارڈ وچوں {vakit} دی اک قضا نماز گھٹا دتی گئی۔ {dua}۔',
  kandilGeceleri: {
    regaib: 'شبِ رغائب مبارک',
    mirac: 'شبِ معراج مبارک',
    berat: 'شبِ برات مبارک',
    mevlid: 'عید میلاد النبی مبارک',
  },
  selamlar: {
    sahur: 'سحری بابرکت ہووے',
    bayram: 'عید مبارک',
    iftar: 'افطار بابرکت ہووے',
    kadir: 'شبِ قدر مبارک',
    arefe: 'عید دی آمد مبارک',
    hicriYilbasi: 'نواں اسلامی سال مبارک',
    cuma: 'جمعہ مبارک',
    ramazan: 'رمضان مبارک',
    sabah: 'صبح بخیر',
  },
};
