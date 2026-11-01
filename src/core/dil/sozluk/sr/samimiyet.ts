import type { Sozluk } from '../tr';

/**
 * Sırpça konuşan Müslümanların (Sancak, Belgrad) Boşnakçayla ortak yerleşik kalıpları, Kiril
 * yazımla (çeviri değil): namaz sonrası "Аллах примио" (kök HadeethEnc/meal "примити": 2:127
 * "прими то од нас"), "Аллах кабул ејлесун", "Кабул олсун"; selamlarda "хајирли …" ve
 * "… мубарек олсун". Kiril kaynakta doğrulanmadı (yerli okuyucu baksın). Övgü, "!" ve
 * kılınmadıya yargı yok.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Хајирли олсун.',
  kabulDualari: ['Аллах примио', 'Аллах кабул ејлесун', 'Аллах примио', 'Кабул олсун'],
  kabulDuasi: 'Аллах примио',
  ekSabah: 'Хајирли сабах',
  ekYatsi: 'Хајирли ноћ',
  tamGunAna: 'Аллах примио',
  tamGunAlt: 'Данас сте клањали свих пет намаза.',
  kazaKabul: 'Из ваше евиденције скинут је један пропуштени намаз: {vakit}. {dua}.',
  kandilGeceleri: {
    regaib: 'Лејлету-р-регаиб мубарек олсун',
    mirac: "Лејлету-л-ми'раџ мубарек олсун",
    berat: 'Лејлету-л-берат мубарек олсун',
    mevlid: 'Мевлуд мубарек олсун',
  },
  selamlar: {
    sahur: 'Хајирли сехур',
    bayram: 'Бајрам шериф мубарек олсун',
    iftar: 'Хајирли ифтар',
    kadir: 'Лејлету-л-кадр мубарек олсун',
    arefe: 'Хајирли арефат',
    hicriYilbasi: 'Хајирли нова хиџретска година',
    cuma: 'Хајирли џума',
    ramazan: 'Хајирли Рамазан',
    sabah: 'Хајирли сабах',
  },
};
