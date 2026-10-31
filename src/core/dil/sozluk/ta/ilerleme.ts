import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'முன்னேற்றம்',
  kilma: {
    baslik: 'தொழுகை விகிதம்',
    haftalik: 'வாராந்திரம்',
    aylik: 'மாதாந்திரம்',
    donemErisim: 'தொழுகை விகிதக் காலம்',
    hesaplaniyor: 'உங்கள் தொழுகை விகிதம் கணக்கிடப்படுகிறது',
    bosBaslik: 'இன்னும் பதிவுகள் இல்லை',
    bosAciklama: 'உங்கள் தொழுகைகளைக் குறிக்கும்போது இங்கே தோன்றும்.',
    yuzde: '{n}%',
    kilinan: 'தொழுதவை',
    oran: 'விகிதம்',
    enIyiGun: 'சிறந்த நாள்',
    haftaHedefi: 'இந்த வார இலக்கு',
    hedefAlt: cogul({ one: 'உங்கள் தொடர் இலக்கின்படி: நாளுக்கு {n} தொழுகை', other: 'உங்கள் தொடர் இலக்கின்படி: நாளுக்கு {n} தொழுகைகள்' }),
    kilinanNamaz: 'தொழுத தொழுகைகள்',
    hedefeUlasan: 'இலக்கை எட்டிய நாட்கள்',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'தொழுகை நடந்த நாட்கள்',
    vakitVakit: 'நேர வாரியாக',
    yuzdeErisim: '{ad}: {n} சதவீதம்',
  },
  rozetler: {
    baslik: 'நிலை மற்றும் பதக்கங்கள்',
    seviye: 'நிலை {n}',
    puan: 'புள்ளிகள்',
    kalanErisim: cogul({ one: '{rank} நிலைக்கு {n} புள்ளி உள்ளது', other: '{rank} நிலைக்கு {n} புள்ளிகள் உள்ளன' }),
    enYuksek: 'நீங்கள் மிக உயர்ந்த நிலையில் உள்ளீர்கள்',
    kalan: cogul({ one: '{rank} நிலைக்கு {n} புள்ளி', other: '{rank} நிலைக்கு {n} புள்ளிகள்' }),
    kilinanErisim: cogul({ one: '{n} தொழுகை தொழப்பட்டது', other: '{n} தொழுகைகள் தொழப்பட்டன' }),
    namaz: cogul({ one: 'தொழுகை', other: 'தொழுகைகள்' }),
    rozetErisim: '{toplam} பதக்கங்களில் {n} பெறப்பட்டன',
    rozet: cogul({ one: 'பதக்கம்', other: 'பதக்கங்கள்' }),
  },
};
