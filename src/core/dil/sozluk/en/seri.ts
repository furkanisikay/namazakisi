import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Your streak is burning',
    enUzun: cogul({ one: 'Longest streak: {n} day', other: 'Longest streak: {n} days' }),
    gunBuyuk: cogul({ one: 'DAY', other: 'DAYS' }),
    sonrakiHedef: 'Next goal: day {hedef} ({durum})',
    kalanGun: cogul({ one: '{n} day left', other: '{n} days left' }),
    tamamlandi: 'Completed!',
    paylasErisim: 'Share your progress',
    paylasBuyuk: 'SHARE YOUR PROGRESS',
  },
};
