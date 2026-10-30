import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'እድገት',
  kilma: {
    baslik: 'የሶላት መጠን',
    haftalik: 'ሳምንታዊ',
    aylik: 'ወርሃዊ',
    donemErisim: 'የሶላት መጠን ጊዜ',
    hesaplaniyor: 'የሶላት መጠንዎ በማስላት ላይ',
    bosBaslik: 'እስካሁን ምንም መዝገብ የለም',
    bosAciklama: 'ሶላቶችዎን ምልክት ሲያደርጉ እዚህ ይታያል።',
    yuzde: '{n}%',
    kilinan: 'የተሰገዱ',
    oran: 'መጠን',
    enIyiGun: 'ምርጥ ቀን',
    haftaHedefi: 'የዚህ ሳምንት ግብ',
    hedefAlt: cogul({ one: 'በተከታታይነት ግብዎ መሠረት፦ በቀን {n} ሶላት', other: 'በተከታታይነት ግብዎ መሠረት፦ በቀን {n} ሶላቶች' }),
    kilinanNamaz: 'የተሰገዱ ሶላቶች',
    hedefeUlasan: 'ግብ የደረሱ ቀናት',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'ሶላት የተሰገደባቸው ቀናት',
    vakitVakit: 'በየሶላቱ',
    yuzdeErisim: '{ad}፦ {n} በመቶ',
  },
  rozetler: {
    baslik: 'ደረጃ እና ባጆች',
    seviye: 'ደረጃ {n}',
    puan: 'ነጥቦች',
    kalanErisim: cogul({ one: 'የ{rank} ደረጃ ለመድረስ {n} ነጥብ ይቀራል', other: 'የ{rank} ደረጃ ለመድረስ {n} ነጥቦች ይቀራሉ' }),
    enYuksek: 'ከፍተኛው ደረጃ ላይ ነዎት',
    kalan: cogul({ one: '{rank} ለመድረስ {n} ነጥብ', other: '{rank} ለመድረስ {n} ነጥቦች' }),
    kilinanErisim: cogul({ one: '{n} ሶላት ተሰግዷል', other: '{n} ሶላቶች ተሰግደዋል' }),
    namaz: cogul({ one: 'ሶላት', other: 'ሶላቶች' }),
    rozetErisim: 'ከ{toplam} ባጆች {n} ተገኝተዋል',
    rozet: cogul({ one: 'ባጅ', other: 'ባጆች' }),
  },
};
