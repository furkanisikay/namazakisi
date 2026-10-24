import { cogul } from '../../tipler';

/** Seri: ana ekran seri kartı. Büyük harfli metinler sabit yazılır (`toUpperCase` YASAK). */
export const seri = {
  kart: {
    baslik: 'Seri ateşiniz yanıyor',
    enUzun: cogul({ one: 'En uzun seri: {n} gün', other: 'En uzun seri: {n} gün' }),
    gunBuyuk: cogul({ one: 'GÜN', other: 'GÜN' }),
    sonrakiHedef: 'Sonraki hedef: {hedef}. Gün ({durum})',
    kalanGun: cogul({ one: '{n} gün kaldı', other: '{n} gün kaldı' }),
    tamamlandi: 'Tamamlandı!',
    paylasErisim: 'Başarınızı paylaşın',
    paylasBuyuk: 'BAŞARINIZI PAYLAŞIN',
  },
} as const;
