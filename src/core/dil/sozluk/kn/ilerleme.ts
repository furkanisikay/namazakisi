import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'ಪ್ರಗತಿ',
  kilma: {
    baslik: 'ನಮಾಝ್ ಪ್ರಮಾಣ',
    haftalik: 'ವಾರದ',
    aylik: 'ತಿಂಗಳ',
    donemErisim: 'ನಮಾಝ್ ಪ್ರಮಾಣದ ಅವಧಿ',
    hesaplaniyor: 'ನಿಮ್ಮ ನಮಾಝ್ ಪ್ರಮಾಣವನ್ನು ಲೆಕ್ಕ ಹಾಕಲಾಗುತ್ತಿದೆ',
    bosBaslik: 'ಇನ್ನೂ ದಾಖಲೆಗಳಿಲ್ಲ',
    bosAciklama: 'ನೀವು ನಮಾಝ್‌ಗಳನ್ನು ಗುರುತಿಸಿದಂತೆ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ.',
    yuzde: '{n}%',
    kilinan: 'ನಿರ್ವಹಿಸಿದ್ದು',
    oran: 'ಪ್ರಮಾಣ',
    enIyiGun: 'ಅತ್ಯುತ್ತಮ ದಿನ',
    haftaHedefi: 'ಈ ವಾರದ ಗುರಿ',
    hedefAlt: cogul({ one: 'ನಿಮ್ಮ ಸರಣಿ ಗುರಿಯ ಪ್ರಕಾರ: ದಿನಕ್ಕೆ {n} ನಮಾಝ್', other: 'ನಿಮ್ಮ ಸರಣಿ ಗುರಿಯ ಪ್ರಕಾರ: ದಿನಕ್ಕೆ {n} ನಮಾಝ್' }),
    kilinanNamaz: 'ನಿರ್ವಹಿಸಿದ ನಮಾಝ್',
    hedefeUlasan: 'ಗುರಿ ತಲುಪಿದ ದಿನಗಳು',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'ನಮಾಝ್ ನಿರ್ವಹಿಸಿದ ದಿನಗಳು',
    vakitVakit: 'ಪ್ರತಿ ನಮಾಝ್',
    yuzdeErisim: '{ad}: ಶೇಕಡಾ {n}',
  },
  rozetler: {
    baslik: 'ಹಂತ ಮತ್ತು ಬ್ಯಾಡ್ಜ್‌ಗಳು',
    seviye: 'ಹಂತ {n}',
    puan: 'ಅಂಕಗಳು',
    kalanErisim: cogul({ one: '{rank} ಹಂತಕ್ಕೆ {n} ಅಂಕ ಬಾಕಿ', other: '{rank} ಹಂತಕ್ಕೆ {n} ಅಂಕಗಳು ಬಾಕಿ' }),
    enYuksek: 'ನೀವು ಅತ್ಯುನ್ನತ ಹಂತದಲ್ಲಿದ್ದೀರಿ',
    kalan: cogul({ one: '{rank} ತಲುಪಲು {n} ಅಂಕ ಬಾಕಿ', other: '{rank} ತಲುಪಲು {n} ಅಂಕಗಳು ಬಾಕಿ' }),
    kilinanErisim: cogul({ one: '{n} ನಮಾಝ್ ನಿರ್ವಹಿಸಲಾಗಿದೆ', other: '{n} ನಮಾಝ್‌ಗಳನ್ನು ನಿರ್ವಹಿಸಲಾಗಿದೆ' }),
    namaz: cogul({ one: 'ನಮಾಝ್', other: 'ನಮಾಝ್‌ಗಳು' }),
    rozetErisim: '{toplam} ಬ್ಯಾಡ್ಜ್‌ಗಳಲ್ಲಿ {n} ಗಳಿಸಲಾಗಿದೆ',
    rozet: cogul({ one: 'ಬ್ಯಾಡ್ಜ್', other: 'ಬ್ಯಾಡ್ಜ್‌ಗಳು' }),
  },
};
