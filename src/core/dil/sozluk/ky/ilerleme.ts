import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Жетишкендик',
  kilma: {
    baslik: 'Намаз окуу көрсөткүчү',
    haftalik: 'Апталык',
    aylik: 'Айлык',
    donemErisim: 'Намаз окуу көрсөткүчүнүн мезгили',
    hesaplaniyor: 'Намаз окуу көрсөткүчүңүз эсептелүүдө',
    bosBaslik: 'Азырынча жазуу жок',
    bosAciklama: 'Намаздарыңызды белгилегенде бул жерде көрүнөт.',
    yuzde: '{n}%',
    kilinan: 'Окулган',
    oran: 'Көрсөткүч',
    enIyiGun: 'Эң жакшы күн',
    haftaHedefi: 'Бул аптанын максаты',
    hedefAlt: cogul({ one: 'Катар максатыңызга жараша: күнүнө {n} намаз', other: 'Катар максатыңызга жараша: күнүнө {n} намаз' }),
    kilinanNamaz: 'Окулган намаздар',
    hedefeUlasan: 'Максатка жеткен күндөр',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Намаз окулган күндөр',
    vakitVakit: 'Намаз боюнча',
    yuzdeErisim: '{ad}: {n} пайыз',
  },
  rozetler: {
    baslik: 'Деңгээл жана төш белгилер',
    seviye: '{n}-деңгээл',
    puan: 'Упай',
    kalanErisim: cogul({ one: '{rank} деңгээлине {n} упай калды', other: '{rank} деңгээлине {n} упай калды' }),
    enYuksek: 'Сиз эң жогорку деңгээлдесиз',
    kalan: cogul({ one: '{rank} үчүн {n} упай калды', other: '{rank} үчүн {n} упай калды' }),
    kilinanErisim: cogul({ one: '{n} намаз окулду', other: '{n} намаз окулду' }),
    namaz: cogul({ one: 'намаз', other: 'намаз' }),
    rozetErisim: '{toplam} төш белгиден {n} алынды',
    rozet: cogul({ one: 'төш белги', other: 'төш белги' }),
  },
};
