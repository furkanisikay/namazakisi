import type { Sozluk } from '../tr';

/**
 * Tay Müslümanlarının kalıpları (çeviri değil). "ขออัลลอฮ์ทรงตอบรับ" IslamHouse Tayca namaz kitapçığındaki
 * kalıptır (amin = "ขออัลลอฮฺทรงตอบรับ"; thanthakhat ile yazıldı); "ทรงรับ" fiili meal 5:27, "พระผู้อภิบาลของเรา
 * โปรดรับ…" meal 2:127. Kandil ve hicrî yılbaşı selamı yalnız Türkiye geleneğinde söylenir
 * (`selam.ts > GELENEK_SELAMI_DILLERI`); buradaki karşılıklar tip bütünlüğü içindir. Yerli okuyucu
 * gözden geçirmedi.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'ขออัลลอฮ์ทรงประทานความจำเริญ',
  kabulDualari: ['ขออัลลอฮ์ทรงตอบรับ', 'ขอพระผู้อภิบาลของเราทรงรับจากพวกเรา', 'ขออัลลอฮ์ทรงตอบรับ', 'ขออัลลอฮ์ทรงรับการงานของเรา'],
  kabulDuasi: 'ขออัลลอฮ์ทรงตอบรับ',
  ekSabah: 'ขอให้เป็นเช้าที่จำเริญ',
  ekYatsi: 'ขอให้เป็นค่ำคืนที่จำเริญ',
  tamGunAna: 'ขออัลลอฮ์ทรงตอบรับ',
  tamGunAlt: 'วันนี้คุณละหมาดครบทั้งห้าเวลา',
  kazaKabul: 'หักละหมาดชดใช้{vakit}ออกจากสมุดแล้ว 1 ครั้ง {dua}',
  kandilGeceleri: {
    regaib: 'ขอให้เป็นคืนเราะฆออิบที่จำเริญ',
    mirac: 'ขอให้เป็นคืนอิสรออ์และมิอ์รอจญ์ที่จำเริญ',
    berat: 'ขอให้เป็นคืนนิศฟูชะอ์บานที่จำเริญ',
    mevlid: 'ขอให้เป็นวันเมาลิดที่จำเริญ',
  },
  selamlar: {
    sahur: 'ขอให้เป็นซะฮูรที่จำเริญ',
    bayram: 'อีดมุบาร็อก',
    iftar: 'ขอให้เป็นการละศีลอดที่จำเริญ',
    kadir: 'ขอให้เป็นคืนลัยละตุลก็อดร์ที่จำเริญ',
    arefe: 'ขอให้เป็นวันอะเราะฟะฮ์ที่จำเริญ',
    hicriYilbasi: 'ขอให้เป็นปีใหม่ฮิจเราะฮ์ที่จำเริญ',
    cuma: 'ขอให้เป็นวันศุกร์ที่จำเริญ',
    ramazan: 'เราะมะฎอนมุบาร็อก',
    sabah: 'ขอให้เป็นเช้าที่จำเริญ',
  },
};
