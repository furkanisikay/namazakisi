import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'प्रगति',
  kilma: {
    baslik: 'नमाज दर',
    haftalik: 'साप्ताहिक',
    aylik: 'मासिक',
    donemErisim: 'नमाज दरको अवधि',
    hesaplaniyor: 'तपाईंको नमाज दर गणना हुँदै छ',
    bosBaslik: 'अहिलेसम्म कुनै रेकर्ड छैन',
    bosAciklama: 'नमाजमा चिन्ह लगाउँदै जाँदा यहाँ देखिन्छ।',
    yuzde: '{n}%',
    kilinan: 'पढिएको',
    oran: 'दर',
    enIyiGun: 'सबैभन्दा राम्रो दिन',
    haftaHedefi: 'यो हप्ताको लक्ष्य',
    hedefAlt: cogul({ one: 'तपाईंको निरन्तरता लक्ष्यअनुसार: दिनमा {n} नमाज', other: 'तपाईंको निरन्तरता लक्ष्यअनुसार: दिनमा {n} नमाज' }),
    kilinanNamaz: 'पढिएका नमाज',
    hedefeUlasan: 'लक्ष्य पुगेका दिन',
    ayYil: '{yil} {ay}',
    namazKilinanGun: 'नमाज पढिएका दिन',
    vakitVakit: 'नमाजअनुसार',
    yuzdeErisim: '{ad}: {n} प्रतिशत',
  },
  rozetler: {
    baslik: 'स्तर र ब्याज',
    seviye: 'स्तर {n}',
    puan: 'पोइन्ट',
    kalanErisim: cogul({ one: '{rank} स्तरसम्म {n} पोइन्ट बाँकी', other: '{rank} स्तरसम्म {n} पोइन्ट बाँकी' }),
    enYuksek: 'तपाईं सबैभन्दा माथिल्लो स्तरमा हुनुहुन्छ',
    kalan: cogul({ one: '{rank}सम्म {n} पोइन्ट बाँकी', other: '{rank}सम्म {n} पोइन्ट बाँकी' }),
    kilinanErisim: cogul({ one: '{n} नमाज पढियो', other: '{n} नमाज पढिए' }),
    namaz: cogul({ one: 'नमाज', other: 'नमाज' }),
    rozetErisim: '{toplam} मध्ये {n} ब्याज प्राप्त भए',
    rozet: cogul({ one: 'ब्याज', other: 'ब्याज' }),
  },
};
