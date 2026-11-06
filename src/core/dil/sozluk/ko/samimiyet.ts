import type { Sozluk } from '../tr';

/**
 * Korece Müslüman topluluğunun kalıpları (çeviri değil). Kabul duası KMF'nin "하나님께서 우리의
 * 예배를 온전히 받아주시길 기도드립니다" kalıbından kısaltılmıştır (kısa biçim türetildi); "Rabbim"
 * yuvası mealin 주님'i (2:127 "저희의 주님! 저희를 받아 주십시오"). Kadir gecesi mealdeki 운명의 밤
 * (97:1), oruç 단식 (2:183). Kandil ve hicrî yılbaşı selamı yalnız Türkiye geleneğinde söylenir
 * (`selam.ts > GELENEK_SELAMI_DILLERI`); buradaki karşılıklar tip bütünlüğü içindir.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: '하나님의 축복이 함께하시길 바랍니다.',
  kabulDualari: ['하나님께서 받아주시길', '예배가 받아들여지길', '하나님께서 받아주시길', '주님께서 받아주시길'],
  kabulDuasi: '하나님께서 받아주시길',
  ekSabah: '복된 아침 되세요',
  ekYatsi: '복된 밤 되세요',
  tamGunAna: '하나님께서 받아주시길',
  tamGunAlt: '오늘 다섯 번의 예배를 모두 드렸습니다.',
  kazaKabul: '보충 예배 기록에서 {vakit} 예배 1번을 뺐습니다. {dua}.',
  kandilGeceleri: {
    regaib: '복된 라가이브의 밤',
    mirac: '복된 이스라와 미으라즈의 밤',
    berat: '복된 바라아의 밤',
    mevlid: '복된 마울리드',
  },
  selamlar: {
    sahur: '복된 수후르 되세요',
    bayram: '이드 무바라크',
    iftar: '복된 이프타르 되세요',
    kadir: '복된 운명의 밤 되세요',
    arefe: '복된 이드 전날 되세요',
    hicriYilbasi: '복된 이슬람 새해 되세요',
    cuma: '복된 금요일 되세요',
    ramazan: '복된 라마단 되세요',
    sabah: '복된 아침 되세요',
  },
};
