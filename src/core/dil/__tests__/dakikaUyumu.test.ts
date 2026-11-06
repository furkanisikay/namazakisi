/**
 * Sesli okuma cümlesinde sayı + dakika sözcüğü sayıya göre çekilir (Rusça/Boşnakça çoğul,
 * İngilizce tekil); başka metne ve Türkçeye dokunulmaz.
 */
import { dakikaUyumu } from '../sure';

it('Rusça: 1 минута, 3 минуты, 5 минут, 21 минута', () => {
  expect(dakikaUyumu('Осталось 1 минут.', 1, 'ru')).toBe('Осталось 1 минута.');
  expect(dakikaUyumu('Осталось 3 минут.', 3, 'ru')).toBe('Осталось 3 минуты.');
  expect(dakikaUyumu('Осталось 5 минута', 5, 'ru')).toBe('Осталось 5 минут');
  expect(dakikaUyumu('прошло 21 минут, Зухр', 21, 'ru')).toBe('прошло 21 минута, Зухр');
});

it('İngilizce tekil düzelir; yalnız aynı sayı ve dakika sözcüğü değişir', () => {
  expect(dakikaUyumu('Dhuhr ends in 1 minutes.', 1, 'en')).toBe('Dhuhr ends in 1 minute.');
  expect(dakikaUyumu('11 minutes left', 1, 'en')).toBe('11 minutes left');
  expect(dakikaUyumu('1 minutesque', 1, 'en')).toBe('1 minutesque');
});

it('Türkçe metin birebir aynı kalır', () => {
  const t = 'Öğle vakti çıkıyor, son 1 dakika.';
  expect(dakikaUyumu(t, 1, 'tr')).toBe(t);
});
