import type { Sozluk } from '../tr';

/**
 * Uygur Müslümanlarının namaz sonrası ve selam için kullandığı yerleşik kalıplar (çeviri değil).
 * Kabul duası "ئاللاھ قوبۇل قىلسۇن" ve yaygın varyantları ("قوبۇل بولسۇن", "ئاللاھ تائالا قوبۇل
 * قىلسۇن"); övgü ve "!" yok. Kandil selamı yalnız ülke listesindeki gecelerde söylenir
 * (`selam.ts > KANDIL_ULKELERI`); buradaki karşılıklar tip bütünlüğü içindir.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'مۇبارەك بولسۇن.',
  kabulDualari: ['ئاللاھ قوبۇل قىلسۇن', 'قوبۇل بولسۇن', 'ئاللاھ قوبۇل قىلسۇن', 'ئاللاھ تائالا قوبۇل قىلسۇن'],
  kabulDuasi: 'ئاللاھ قوبۇل قىلسۇن',
  ekSabah: 'خەيرلىك ئەتىگەن',
  ekYatsi: 'خەيرلىك كېچە',
  tamGunAna: 'ئاللاھ قوبۇل قىلسۇن',
  tamGunAlt: 'بۈگۈن بەش ۋاخ نامازنى تولۇق ئادا قىلدىڭىز.',
  kazaKabul: 'خاتىرىڭىزدىن بىر {vakit} قازاسى چىقىرىۋېتىلدى. {dua}.',
  kandilGeceleri: {
    regaib: 'رەغائىب كېچىڭىز مۇبارەك بولسۇن',
    mirac: 'مىراج كېچىڭىز مۇبارەك بولسۇن',
    berat: 'بەرات كېچىڭىز مۇبارەك بولسۇن',
    mevlid: 'مەۋلۇد كېچىڭىز مۇبارەك بولسۇن',
  },
  selamlar: {
    sahur: 'سەھەرلىكىڭىز مۇبارەك بولسۇن',
    bayram: 'ھېيتىڭىز مۇبارەك بولسۇن',
    iftar: 'ئىپتارىڭىز مۇبارەك بولسۇن',
    kadir: 'قەدىر كېچىڭىز مۇبارەك بولسۇن',
    arefe: 'ئەرەپە كۈنىڭىز مۇبارەك بولسۇن',
    hicriYilbasi: 'ھىجرىيە يېڭى يىلىڭىز مۇبارەك بولسۇن',
    cuma: 'جۈمە مۇبارەك بولسۇن',
    ramazan: 'رامىزان ئېيىڭىز مۇبارەك بولسۇن',
    sabah: 'خەيرلىك ئەتىگەن',
  },
};
