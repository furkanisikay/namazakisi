import type { Sozluk } from '../tr';

/**
 * Vakit adları QMDB (muftyat.kz namaz vakitleri çizelgesi) takımı: Таң · Күн · Бесін · Екінті ·
 * Ақшам · Құптан. Kazakçada vakit adı cins isimdir: cümle içinde küçük harf ("бесін намазы").
 * Çizelgedeki sabah satırı (`imsakVakti`) fecir adı "Таң"dır. "Kıldım" = "Оқыдым",
 * durum "Kılındı" = "Оқылды" (namaz оқу: Kazakçada namaz "okunur"). Kerahat = "мәкрүһ уақыт".
 * Hitap: yönetim "Сіз" + kibar emir ("қосыңыз"); ibadete çağrı "сен" + emir ("намазға тұр").
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Таң', gunes: 'Күн', ogle: 'Бесін', ikindi: 'Екінті', aksam: 'Ақшам', yatsi: 'Құптан' },
  buyuk: { imsak: 'ТАҢ', gunes: 'КҮН', ogle: 'БЕСІН', ikindi: 'ЕКІНТІ', aksam: 'АҚШАМ', yatsi: 'ҚҰПТАН' },
  kucuk: { imsak: 'таң', gunes: 'күн шығуы', ogle: 'бесін', ikindi: 'екінті', aksam: 'ақшам', yatsi: 'құптан' },
  imsakVakti: 'Таң',
  cuma: 'Жұма',
  cumaKucuk: 'жұма',
  gunesDogusu: 'Күн шығуы',
  gunesDogusuKucuk: 'күн шығуы',
  durum: { kilindi: 'Оқылды', vaktiGeldi: 'Уақыты кірді', girmedi: 'Әлі кірмеді', gecti: 'Оқылмады' },
  durumKucuk: { kilindi: 'оқылды', vaktiGeldi: 'уақыты кірді', girmedi: 'әлі кірмеді', gecti: 'оқылмады' },
  eylem: { kildim: 'Оқыдым', kilindi: 'Оқылды' },
  kerahatVakti: 'Мәкрүһ уақыт',
  isaretle: 'Оқылды деп белгілеу',
  geriAlEtiketi: '{durum}, кері қайтару үшін түртіңіз',
  geriAlindi: 'Белгі алынып тасталды',
};
