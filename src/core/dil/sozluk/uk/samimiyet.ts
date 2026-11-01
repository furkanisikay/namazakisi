import type { Sozluk } from '../tr';

/**
 * Ukraynaca konuşan Müslümanların kalıpları (çeviri değil). Fiil kökü kaynaklı: "прийми від нас"
 * (meal 2:127), "Аллаг приймає" (5:27); "Нехай Аллаг прийме" ru «Да примет Аллах» emsaliyle
 * TÜRETİLDİ (iki yuva), "Всевишній" umma.in.ua'nın "Всевишній Аллаг" kullanımından. Kadir gecesi
 * meal 97:1 "Ніч Величності". Kandil selamları yalnız `KANDIL_ULKELERI`'nde söylenir. Övgü ve "!" yok.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Нехай буде на благо.',
  kabulDualari: ['Нехай Аллаг прийме', 'Хай Аллаг прийме', 'Нехай Аллаг прийме', 'Нехай Всевишній прийме'],
  kabulDuasi: 'Нехай Аллаг прийме',
  ekSabah: 'Благословенного ранку',
  ekYatsi: 'Благословенної ночі',
  tamGunAna: 'Нехай Аллаг прийме',
  tamGunAlt: 'Сьогодні ви здійснили всі п’ять молитов.',
  kazaKabul: 'Одну молитву каза ({vakit}) списано з вашого журналу. {dua}.',
  kandilGeceleri: {
    regaib: 'Благословенної ночі Рагаїб',
    mirac: 'Благословенної ночі Ісра і Мірадж',
    berat: 'Благословенної ночі Бараат',
    mevlid: 'Благословенного Мавліду',
  },
  selamlar: {
    sahur: 'Благословенного сухуру',
    bayram: 'Ід мубарак',
    iftar: 'Благословенного іфтару',
    kadir: 'Благословенної Ночі Величності',
    arefe: 'Благословенного дня Арафа',
    hicriYilbasi: 'З Новим роком за хіджрою',
    cuma: 'Джума мубарак',
    ramazan: 'Рамадан мубарак',
    sabah: 'Благословенного ранку',
  },
};
