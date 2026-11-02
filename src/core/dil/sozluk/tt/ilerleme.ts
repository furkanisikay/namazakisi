import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Алгарыш',
  kilma: {
    baslik: 'Уку дәрәҗәсе',
    haftalik: 'Атналык',
    aylik: 'Айлык',
    donemErisim: 'Уку дәрәҗәсе чоры',
    hesaplaniyor: 'Уку дәрәҗәгез исәпләнә',
    bosBaslik: 'Әлегә язма юк',
    bosAciklama: 'Намазларыгызны билгеләгән саен монда күренәчәк.',
    yuzde: '{n}%',
    kilinan: 'Укылган',
    oran: 'Өлеш',
    enIyiGun: 'Иң яхшы көн',
    haftaHedefi: 'Бу атнаның максаты',
    hedefAlt: cogul({ one: 'Серия максатыгызга карап: көненә {n} намаз', other: 'Серия максатыгызга карап: көненә {n} намаз' }),
    kilinanNamaz: 'Укылган намаз',
    hedefeUlasan: 'Максатка ирешкән көн',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Намаз укылган көн',
    vakitVakit: 'Вакытлар буенча',
    yuzdeErisim: '{ad}: {n} процент',
  },
  rozetler: {
    baslik: 'Дәрәҗә һәм бүләкләр',
    seviye: '{n} дәрәҗә',
    puan: 'Балл',
    kalanErisim: cogul({ one: '{rank} дәрәҗәсенә {n} балл калды', other: '{rank} дәрәҗәсенә {n} балл калды' }),
    enYuksek: 'Сез иң югары дәрәҗәдә',
    kalan: cogul({ one: '{rank} өчен {n} балл калды', other: '{rank} өчен {n} балл калды' }),
    kilinanErisim: cogul({ one: '{n} намаз укылды', other: '{n} намаз укылды' }),
    namaz: cogul({ one: 'намаз', other: 'намаз' }),
    rozetErisim: '{toplam} бүләктән {n} алынды',
    rozet: cogul({ one: 'бүләк', other: 'бүләк' }),
  },
};
