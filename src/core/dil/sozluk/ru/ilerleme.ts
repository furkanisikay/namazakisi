import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Прогресс',
  kilma: {
    baslik: 'Доля совершённых',
    haftalik: 'Неделя',
    aylik: 'Месяц',
    donemErisim: 'Период доли совершённых намазов',
    hesaplaniyor: 'Подсчитываем долю совершённых намазов',
    bosBaslik: 'Записей пока нет',
    bosAciklama: 'Появится здесь, когда вы начнёте отмечать намазы.',
    yuzde: '{n}%',
    kilinan: 'Совершено',
    oran: 'Доля',
    enIyiGun: 'Лучший день',
    haftaHedefi: 'Цель этой недели',
    hedefAlt: cogul({
      one: 'По цели серии: {n} намаз в день',
      few: 'По цели серии: {n} намаза в день',
      many: 'По цели серии: {n} намазов в день',
      other: 'По цели серии: {n} намаза в день',
    }),
    kilinanNamaz: 'Совершено намазов',
    hedefeUlasan: 'Дней с выполненной целью',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Дней с намазом',
    vakitVakit: 'По намазам',
    yuzdeErisim: '{ad}: {n} процентов',
  },
  rozetler: {
    baslik: 'Уровень и значки',
    seviye: 'Уровень {n}',
    puan: 'Баллы',
    kalanErisim: cogul({
      one: 'До уровня «{rank}» остался {n} балл',
      few: 'До уровня «{rank}» осталось {n} балла',
      many: 'До уровня «{rank}» осталось {n} баллов',
      other: 'До уровня «{rank}» осталось {n} балла',
    }),
    enYuksek: 'Вы на самом высоком уровне',
    kalan: cogul({
      one: 'До «{rank}» — {n} балл',
      few: 'До «{rank}» — {n} балла',
      many: 'До «{rank}» — {n} баллов',
      other: 'До «{rank}» — {n} балла',
    }),
    kilinanErisim: cogul({
      one: 'Совершён {n} намаз',
      few: 'Совершено {n} намаза',
      many: 'Совершено {n} намазов',
      other: 'Совершено {n} намаза',
    }),
    namaz: cogul({ one: 'намаз', few: 'намаза', many: 'намазов', other: 'намаза' }),
    rozetErisim: 'Получено значков: {n} из {toplam}',
    rozet: cogul({ one: 'значок', few: 'значка', many: 'значков', other: 'значка' }),
  },
};
