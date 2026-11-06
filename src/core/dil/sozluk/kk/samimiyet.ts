import type { Sozluk } from '../tr';

/**
 * Kazakça konuşan Müslümanların yerleşik kalıpları (çeviri değil): namazdan sonra "Алла қабыл
 * етсін" (baskın, iki yuva), "Қабыл болсын", "Алла Тағала қабыл етсін"; selamlarda "… құтты
 * болсын", "Қайырлы таң/түн". Kandil adları QMDB kullanımı (Рағайып, Миғраж, Бараат, Мәуліт) —
 * yerli okuyucuyla DOĞRULANMADI. Övgü ve "!" yok.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Құтты болсын.',
  kabulDualari: ['Алла қабыл етсін', 'Қабыл болсын', 'Алла қабыл етсін', 'Алла Тағала қабыл етсін'],
  kabulDuasi: 'Алла қабыл етсін',
  ekSabah: 'Қайырлы таң',
  ekYatsi: 'Қайырлы түн',
  tamGunAna: 'Алла қабыл етсін',
  tamGunAlt: 'Бүгін бес уақыт намазды толық оқыдыңыз.',
  kazaKabul: 'Дәптеріңізден бір {vakit} қазасы алып тасталды. {dua}.',
  kandilGeceleri: {
    regaib: 'Рағайып түні құтты болсын',
    mirac: 'Миғраж түні құтты болсын',
    berat: 'Бараат түні құтты болсын',
    mevlid: 'Мәуліт құтты болсын',
  },
  selamlar: {
    sahur: 'Сәресіңіз қабыл болсын',
    bayram: 'Айтыңыз құтты болсын',
    iftar: 'Ауызашарыңыз қабыл болсын',
    kadir: 'Қадір түні құтты болсын',
    arefe: 'Арафа күні құтты болсын',
    hicriYilbasi: 'Һижри жаңа жыл құтты болсын',
    cuma: 'Жұмаңыз мүбәрак болсын',
    ramazan: 'Рамазан айы құтты болсын',
    sabah: 'Қайырлы таң',
  },
};
