import type { Sozluk } from '../tr';

/**
 * Rusça konuşan Müslümanların yerleşik kalıpları (ДУМ РФ, azan.ru), çeviri değil. "Да примет
 * Аллах" baskın kalıp (iki yuva). Kandil selamları Kafkasya/Orta Asya kullanıcısına da gider
 * (`selam.ts > KANDIL_ULKELERI`). Övgü ve "!" yok.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Пусть будет во благо.',
  kabulDualari: ['Да примет Аллах', 'Пусть Аллах примет', 'Да примет Аллах', 'Да примет Всевышний'],
  kabulDuasi: 'Да примет Аллах',
  ekSabah: 'Благословенного утра',
  ekYatsi: 'Благословенной ночи',
  tamGunAna: 'Да примет Аллах',
  tamGunAlt: 'Сегодня вы совершили все пять намазов.',
  kazaKabul: 'Один намаз-каза ({vakit}) списан из вашего журнала. {dua}.',
  kandilGeceleri: {
    regaib: 'Благословенной ночи Рагаиб',
    mirac: 'Благословенной ночи Исра и Мирадж',
    berat: 'Благословенной ночи Бараат',
    mevlid: 'Благословенного Мавлида',
  },
  selamlar: {
    sahur: 'Благословенного сухура',
    bayram: 'Ид мубарак',
    iftar: 'Благословенного ифтара',
    kadir: 'Благословенной Ночи предопределения',
    arefe: 'Благословенного дня Арафа',
    hicriYilbasi: 'С новым годом по хиджре',
    cuma: 'Джума мубарак',
    ramazan: 'Рамадан мубарак',
    sabah: 'Благословенного утра',
  },
};
