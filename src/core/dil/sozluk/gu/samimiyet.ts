import type { Sozluk } from '../tr';

/**
 * Gucaratça konuşan Hint Müslümanlarının namaz sonrası ve selam için kullandığı yerleşik kalıplar
 * (çeviri değil; Urduca kökenli kalıpların Gucarati yazımı, Hintçe emsali). Kabul duası
 * "અલ્લાહ કબૂલ કરે" ve yaygın varyantları ("અલ્લાહ તઆલા" HadeethEnc gu yazımı); övgü ve "!" yok.
 * Kandil selamı yalnız ülke listesindeki gecelerde söylenir (`selam.ts > KANDIL_ULKELERI`);
 * buradaki karşılıklar tip bütünlüğü içindir. Yerli okuyucuyla DOĞRULANMADI.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'મુબારક હો.',
  kabulDualari: ['અલ્લાહ કબૂલ કરે', 'અલ્લાહ તઆલા કબૂલ ફરમાવે', 'અલ્લાહ કબૂલ કરે', 'અલ્લાહ પાક કબૂલ ફરમાવે'],
  kabulDuasi: 'અલ્લાહ કબૂલ કરે',
  ekSabah: 'સુબહ બખૈર',
  ekYatsi: 'શબ બખૈર',
  tamGunAna: 'અલ્લાહ કબૂલ કરે',
  tamGunAlt: 'આજે તમે પાંચેય નમાઝો પૂરી કરી.',
  kazaKabul: 'તમારી કઝા નોંધપોથીમાંથી {vakit}ની એક કઝા ઓછી કરવામાં આવી. {dua}.',
  kandilGeceleri: {
    regaib: 'શબે રગાઇબ મુબારક',
    mirac: 'શબે મેરાજ મુબારક',
    berat: 'શબે બરાત મુબારક',
    mevlid: 'ઈદ મિલાદુન્નબી મુબારક',
  },
  selamlar: {
    sahur: 'સહરીમાં બરકત થાય',
    bayram: 'ઈદ મુબારક',
    iftar: 'ઇફતારીમાં બરકત થાય',
    kadir: 'શબે કદ્ર મુબારક',
    arefe: 'ઈદની આમદ મુબારક',
    hicriYilbasi: 'નવું ઇસ્લામી વર્ષ મુબારક',
    cuma: 'જુમ્મા મુબારક',
    ramazan: 'રમઝાન મુબારક',
    sabah: 'સુબહ બખૈર',
  },
};
