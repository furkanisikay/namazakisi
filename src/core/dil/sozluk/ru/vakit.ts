import type { Sozluk } from '../tr';

/**
 * Vakit adları ДУМ РФ / azan.ru biçiminde; özel ad olarak cümle içinde de büyük harfle başlar
 * ("намаз Зухр"; çekim "намаз" sözcüğünde). Yalnız "восход" cins isimdir. Durum ve "Kıldım"
 * CİNSİYETSİZ ("Намаз совершён"; "я помолился/помолилась" yazılmaz).
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Фаджр', gunes: 'Восход', ogle: 'Зухр', ikindi: 'Аср', aksam: 'Магриб', yatsi: 'Иша' },
  buyuk: { imsak: 'ФАДЖР', gunes: 'ВОСХОД', ogle: 'ЗУХР', ikindi: 'АСР', aksam: 'МАГРИБ', yatsi: 'ИША' },
  kucuk: { imsak: 'Фаджр', gunes: 'восход', ogle: 'Зухр', ikindi: 'Аср', aksam: 'Магриб', yatsi: 'Иша' },
  imsakVakti: 'Имсак',
  cuma: 'Джума',
  cumaKucuk: 'Джума',
  gunesDogusu: 'Восход солнца',
  gunesDogusuKucuk: 'восход солнца',
  durum: { kilindi: 'Совершён', vaktiGeldi: 'Время настало', girmedi: 'Ещё не время', gecti: 'Не совершён' },
  durumKucuk: { kilindi: 'совершён', vaktiGeldi: 'время настало', girmedi: 'ещё не время', gecti: 'не совершён' },
  eylem: { kildim: 'Намаз совершён', kilindi: 'Совершён' },
  kerahatVakti: 'Время макрух',
  isaretle: 'Отметить как совершённый',
  geriAlEtiketi: '{durum}, нажмите, чтобы отменить',
  geriAlindi: 'Отметка снята',
};
