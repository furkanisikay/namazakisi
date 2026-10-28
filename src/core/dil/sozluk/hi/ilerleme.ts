import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'प्रगति',
  kilma: {
    baslik: 'नमाज़ की दर',
    haftalik: 'साप्ताहिक',
    aylik: 'मासिक',
    donemErisim: 'नमाज़ की दर की अवधि',
    hesaplaniyor: 'आपकी नमाज़ की दर का हिसाब हो रहा है',
    bosBaslik: 'अभी कोई रिकॉर्ड नहीं',
    bosAciklama: 'नमाज़ों पर निशान लगाने के साथ यहाँ दिखेगी।',
    yuzde: '{n}%',
    kilinan: 'पढ़ी गई',
    oran: 'दर',
    enIyiGun: 'सबसे अच्छा दिन',
    haftaHedefi: 'इस हफ़्ते का लक्ष्य',
    hedefAlt: cogul({ one: 'आपके सिलसिले के लक्ष्य के अनुसार: रोज़ाना {n} नमाज़', other: 'आपके सिलसिले के लक्ष्य के अनुसार: रोज़ाना {n} नमाज़ें' }),
    kilinanNamaz: 'पढ़ी गई नमाज़ें',
    hedefeUlasan: 'लक्ष्य पूरा होने वाले दिन',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'नमाज़ वाले दिन',
    vakitVakit: 'नमाज़ के हिसाब से',
    yuzdeErisim: '{ad}: {n} प्रतिशत',
  },
  rozetler: {
    baslik: 'दर्जा और बैज',
    seviye: 'दर्जा {n}',
    puan: 'पॉइंट',
    kalanErisim: cogul({ one: '{rank} दर्जे तक {n} पॉइंट बाक़ी', other: '{rank} दर्जे तक {n} पॉइंट बाक़ी' }),
    enYuksek: 'आप सबसे ऊँचे दर्जे पर हैं',
    kalan: cogul({ one: '{rank} तक {n} पॉइंट बाक़ी', other: '{rank} तक {n} पॉइंट बाक़ी' }),
    kilinanErisim: cogul({ one: '{n} नमाज़ पढ़ी गई', other: '{n} नमाज़ें पढ़ी गईं' }),
    namaz: cogul({ one: 'नमाज़', other: 'नमाज़ें' }),
    rozetErisim: '{toplam} में से {n} बैज हासिल किए',
    rozet: cogul({ one: 'बैज', other: 'बैज' }),
  },
};
