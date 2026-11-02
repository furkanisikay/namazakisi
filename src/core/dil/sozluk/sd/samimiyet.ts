import type { Sozluk } from '../tr';

/**
 * Sindhçe konuşan Müslümanların namaz sonrası ve selam için kullandığı kalıplar (çeviri değil).
 * Kabul duası "الله قبول ڪري" (fiil kökü "قبول ڪري" IslamHouse sd kitapçıklarında kaynaklı; kalıbın
 * kendisi türetildi, yerli okuyucuyla DOĞRULANMADI) ve Urduca emsalindeki yaygın varyantları;
 * övgü ve "!" yok. Kandil selamı yalnız ülke listesindeki gecelerde söylenir
 * (`selam.ts > KANDIL_ULKELERI`; Pakistan: Mevlid).
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'مبارڪ هجي.',
  kabulDualari: ['الله قبول ڪري', 'الله تعاليٰ قبول ڪري', 'الله قبول ڪري', 'الله پاڪ قبول ڪري'],
  kabulDuasi: 'الله قبول ڪري',
  ekSabah: 'صبح بخير',
  ekYatsi: 'شب بخير',
  tamGunAna: 'الله قبول ڪري',
  tamGunAlt: 'اڄ اوهان پنجئي نمازون پڙهيون.',
  kazaKabul: 'اوهان جي رڪارڊ مان {vakit} جي هڪ قضا نماز گهٽائي وئي. {dua}.',
  kandilGeceleri: {
    regaib: 'شبِ رغائب مبارڪ',
    mirac: 'شبِ معراج مبارڪ',
    berat: 'شبِ برات مبارڪ',
    mevlid: 'عيد ميلاد النبي مبارڪ',
  },
  selamlar: {
    sahur: 'سحري بابرڪت هجي',
    bayram: 'عيد مبارڪ',
    iftar: 'افطاري بابرڪت هجي',
    kadir: 'شبِ قدر مبارڪ',
    arefe: 'عيد جي آمد مبارڪ',
    hicriYilbasi: 'نئون اسلامي سال مبارڪ',
    cuma: 'جمعو مبارڪ',
    ramazan: 'رمضان مبارڪ',
    sabah: 'صبح بخير',
  },
};
