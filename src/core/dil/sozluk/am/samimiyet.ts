import type { Sozluk } from '../tr';

/**
 * Amharca konuşan Müslümanların kalıpları (çeviri değil). Dua fiili ተቀበለ ("ከእኛ ተቀበል", QE 2:127);
 * çekimli kalıplar (አላህ ይቀበለው, ጌታችን ይቀበለን) TÜRETİLDİ, yerli okuyucuyla doğrulanmadı.
 * Kandil ve hicrî yılbaşı selamı yalnız Türkiye geleneğinde söylenir; buradaki karşılıklar tip
 * bütünlüğü içindir.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'የተባረከ ይሁን።',
  kabulDualari: ['አላህ ይቀበለው', 'ተቀባይነት ያግኝ', 'አላህ ይቀበለው', 'ጌታችን ይቀበለን'],
  kabulDuasi: 'አላህ ይቀበለው',
  ekSabah: 'የተባረከ ጠዋት ይሁንልዎ',
  ekYatsi: 'የተባረከ ምሽት ይሁንልዎ',
  tamGunAna: 'አላህ ይቀበለው',
  tamGunAlt: 'ዛሬ አምስቱንም ሶላቶች አጠናቀዋል።',
  kazaKabul: 'አንድ የ{vakit} ቀዷእ ከመዝገብዎ ተቀንሷል። {dua}።',
  kandilGeceleri: {
    regaib: 'የተባረከ የረጋኢብ ሌሊት',
    mirac: 'የተባረከ ኢስራእ እና ሚዕራጅ',
    berat: 'የተባረከ የበራኣ ሌሊት',
    mevlid: 'የተባረከ መውሊድ',
  },
  selamlar: {
    sahur: 'የተባረከ ሱሑር',
    bayram: 'ዒድ ሙባረክ',
    iftar: 'የተባረከ ኢፍጣር',
    kadir: 'የተባረከ ለይለቱል ቀድር',
    arefe: 'የተባረከ የዒድ ዋዜማ',
    hicriYilbasi: 'የተባረከ የሂጅራ አዲስ ዓመት',
    cuma: 'ጁሙዓ ሙባረክ',
    ramazan: 'ረመዳን ሙባረክ',
    sabah: 'የተባረከ ጠዋት ይሁንልዎ',
  },
};
