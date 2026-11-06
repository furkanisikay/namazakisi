import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'प्रगती',
  kilma: {
    baslik: 'नमाजचे प्रमाण',
    haftalik: 'साप्ताहिक',
    aylik: 'मासिक',
    donemErisim: 'नमाजच्या प्रमाणाचा कालावधी',
    hesaplaniyor: 'तुमच्या नमाजचे प्रमाण मोजले जात आहे',
    bosBaslik: 'अजून नोंदी नाहीत',
    bosAciklama: 'तुम्ही नमाजची नोंद करत गेल्यावर इथे दिसेल.',
    yuzde: '{n}%',
    kilinan: 'अदा झाल्या',
    oran: 'प्रमाण',
    enIyiGun: 'सर्वोत्तम दिवस',
    haftaHedefi: 'या आठवड्याचे ध्येय',
    hedefAlt: cogul({ one: 'तुमच्या मालिकेच्या ध्येयानुसार: दिवसाला {n} नमाज', other: 'तुमच्या मालिकेच्या ध्येयानुसार: दिवसाला {n} नमाज' }),
    kilinanNamaz: 'अदा झालेल्या नमाज',
    hedefeUlasan: 'ध्येय गाठलेले दिवस',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'नमाज अदा झालेले दिवस',
    vakitVakit: 'नमाजनुसार',
    yuzdeErisim: '{ad}: {n} टक्के',
  },
  rozetler: {
    baslik: 'स्तर आणि बॅज',
    seviye: 'स्तर {n}',
    puan: 'गुण',
    kalanErisim: cogul({ one: '{rank} स्तरासाठी {n} गुण बाकी', other: '{rank} स्तरासाठी {n} गुण बाकी' }),
    enYuksek: 'तुम्ही सर्वोच्च स्तरावर आहात',
    kalan: cogul({ one: '{rank} साठी {n} गुण', other: '{rank} साठी {n} गुण' }),
    kilinanErisim: cogul({ one: '{n} नमाज अदा झाली', other: '{n} नमाज अदा झाल्या' }),
    namaz: cogul({ one: 'नमाज', other: 'नमाज' }),
    rozetErisim: '{toplam} पैकी {n} बॅज मिळाले',
    rozet: cogul({ one: 'बॅज', other: 'बॅज' }),
  },
};
