import type { Sozluk } from '../tr';

/**
 * Makedonca konuşan Müslümanların (Torbeş, Boşnak, Türk toplulukları) Balkan ortak kalıpları,
 * Kiril yazımla (çeviri değil): namaz sonrası "Аллах нека прими" (kök meal 2:127 "прими го ова
 * од нас" + HadeethEnc dilek kalıbı "Аллах нека е задоволен"), "Нека е примено", "Кабул олсун";
 * selamlarda "Хаирли …" ve "… мубарек олсун" (sr/bs emsali). Hiçbiri mk kaynakta birebir
 * doğrulanmadı (yerli okuyucu baksın). Övgü, "!" ve kılınmadıya yargı yok.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Хаирли олсун.',
  kabulDualari: ['Аллах нека прими', 'Нека е примено', 'Аллах нека прими', 'Кабул олсун'],
  kabulDuasi: 'Аллах нека прими',
  ekSabah: 'Хаирли сабах',
  ekYatsi: 'Хаирли ноќ',
  tamGunAna: 'Аллах нека прими',
  tamGunAlt: 'Денес ги клањавте сите пет намази.',
  kazaKabul: 'Од вашата евиденција е отстранет еден пропуштен намаз: {vakit}. {dua}.',
  kandilGeceleri: {
    regaib: 'Лејлету-р-регаиб мубарек олсун',
    mirac: 'Лејлету-л-мираџ мубарек олсун',
    berat: 'Лејлету-л-берат мубарек олсун',
    mevlid: 'Мевлуд мубарек олсун',
  },
  selamlar: {
    sahur: 'Хаирли сехур',
    bayram: 'Бајрам шериф мубарек олсун',
    iftar: 'Хаирли ифтар',
    kadir: 'Лејлету-л-кадр мубарек олсун',
    arefe: 'Хаирли арефат',
    hicriYilbasi: 'Хаирли нова хиџретска година',
    cuma: 'Хаирли џума',
    ramazan: 'Хаирли рамазан',
    sabah: 'Хаирли сабах',
  },
};
