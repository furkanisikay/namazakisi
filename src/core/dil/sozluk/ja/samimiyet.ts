import type { Sozluk } from '../tr';

/**
 * 日本のムスリムが使う言い回し（翻訳ではない）。Kabul duası QuranEnc `japanese_saeedsato` 2:127
 * "我らが主*よ、私たちから…お受け入れ下さい" kalıbından kısaltıldı (kısa biçim türetildi, yerli okuyucu
 * onaylamalı); "Rabbim" yuvası mealin "主". Kadir gecesi mealdeki "誉れの夜" (97:1). Bayram, cuma ve
 * Ramazan selamı Japon Müslümanlarının Arapçadan aldığı "〜・ムバーラク" kalıbı. Kandil ve hicrî yılbaşı
 * selamı yalnız Türkiye geleneğinde söylenir (`selam.ts > GELENEK_SELAMI_DILLERI`); buradaki karşılıklar
 * tip bütünlüğü içindir. Övgü ve "！" yok.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'アッラーの祝福がありますように。',
  kabulDualari: [
    'アッラーが受け入れてくださいますように',
    '受け入れられますように',
    'アッラーが受け入れてくださいますように',
    '主が受け入れてくださいますように',
  ],
  kabulDuasi: 'アッラーが受け入れてくださいますように',
  ekSabah: '恵みある朝になりますように',
  ekYatsi: '安らかな夜になりますように',
  tamGunAna: 'アッラーが受け入れてくださいますように',
  tamGunAlt: '今日は5回の礼拝をすべて終えました。',
  kazaKabul: '{vakit}のやり直しを記録から1回差し引きました。{dua}。',
  kandilGeceleri: {
    regaib: '恵みあるラガーイブの夜を',
    mirac: '恵みあるイスラーとミウラージュの夜を',
    berat: '恵みあるバラーアの夜を',
    mevlid: '恵みあるマウリドを',
  },
  selamlar: {
    sahur: '恵みあるサフールを',
    bayram: 'イード・ムバーラク',
    iftar: '恵みあるイフタールを',
    kadir: '恵みある誉れの夜を',
    arefe: '恵みあるイード前日を',
    hicriYilbasi: '恵みあるイスラーム新年を',
    cuma: 'ジュムア・ムバーラク',
    ramazan: 'ラマダーン・ムバーラク',
    sabah: '恵みある朝になりますように',
  },
};
