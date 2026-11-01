import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Прогрес',
  kilma: {
    baslik: 'Частка молитов',
    haftalik: 'Тиждень',
    aylik: 'Місяць',
    donemErisim: 'Період частки молитов',
    hesaplaniyor: 'Обчислюємо частку молитов',
    bosBaslik: 'Записів ще немає',
    bosAciklama: 'З’явиться тут, коли ви позначатимете молитви.',
    yuzde: '{n}%',
    kilinan: 'Здійснено',
    oran: 'Частка',
    enIyiGun: 'Найкращий день',
    haftaHedefi: 'Мета тижня',
    hedefAlt: cogul({
      one: 'За метою серії: {n} молитва на день',
      few: 'За метою серії: {n} молитви на день',
      many: 'За метою серії: {n} молитов на день',
      other: 'За метою серії: {n} молитви на день',
    }),
    kilinanNamaz: 'Здійснені молитви',
    hedefeUlasan: 'Дні з досягнутою метою',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Дні з молитвою',
    vakitVakit: 'За молитвами',
    yuzdeErisim: '{ad}: {n} відсотків',
  },
  rozetler: {
    baslik: 'Рівень і значки',
    seviye: 'Рівень {n}',
    puan: 'Бали',
    kalanErisim: cogul({ one: '{n} бал до рівня {rank}', few: '{n} бали до рівня {rank}', many: '{n} балів до рівня {rank}', other: '{n} бала до рівня {rank}' }),
    enYuksek: 'Ви на найвищому рівні',
    kalan: cogul({ one: '{n} бал до рівня {rank}', few: '{n} бали до рівня {rank}', many: '{n} балів до рівня {rank}', other: '{n} бала до рівня {rank}' }),
    kilinanErisim: cogul({ one: 'Здійснено {n} молитву', few: 'Здійснено {n} молитви', many: 'Здійснено {n} молитов', other: 'Здійснено {n} молитви' }),
    namaz: cogul({ one: 'молитва', few: 'молитви', many: 'молитов', other: 'молитви' }),
    rozetErisim: 'Отримано значків: {n} з {toplam}',
    rozet: cogul({ one: 'значок', few: 'значки', many: 'значків', other: 'значка' }),
  },
};
