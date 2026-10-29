import type { Sozluk } from '../tr';

/**
 * Özbekçe (KİRİL kaynak; Latin biçim `kirildenLatine` ile çalışma anında üretilir).
 * Vakit adları muslim.uz / islom.uz kullanımı: Бомдод · Қуёш · Пешин · Аср · Шом · Хуфтон; cümle
 * içinde küçük harf (cins isim). Cuma "Жума". Çizelge satırı (`imsakVakti`) namaz adıyla aynı
 * "Бомдод" (muslim.uz çizelgesi "Тонг" da yazar; DOĞRULANMADI, tutarlılık için Бомдод).
 * "Kıldım" = "Ўқидим" (1. tekil, cinsiyetsiz), "Kılındı" = "Ўқилди". Terimler: kaza қазо, nafile
 * нафл, kıble қибла, kerahat макруҳ вақт, "Allah kabul etsin" = "Аллоҳ қабул қилсин".
 * İmla: kelime başı /e/ "э" (е kelime başında "ye" okunur); х (x) ≠ ҳ (h); щ/ы yok.
 * Hitap: yönetimde "Сиз" + -инг emri; ibadete çağrıda "сен" + yalın emir.
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Бомдод', gunes: 'Қуёш', ogle: 'Пешин', ikindi: 'Аср', aksam: 'Шом', yatsi: 'Хуфтон' },
  buyuk: { imsak: 'БОМДОД', gunes: 'ҚУЁШ', ogle: 'ПЕШИН', ikindi: 'АСР', aksam: 'ШОМ', yatsi: 'ХУФТОН' },
  kucuk: { imsak: 'бомдод', gunes: 'қуёш', ogle: 'пешин', ikindi: 'аср', aksam: 'шом', yatsi: 'хуфтон' },
  imsakVakti: 'Бомдод',
  cuma: 'Жума',
  cumaKucuk: 'жума',
  gunesDogusu: 'Қуёш чиқиши',
  gunesDogusuKucuk: 'қуёш чиқиши',
  durum: { kilindi: 'Ўқилди', vaktiGeldi: 'Вақти кирди', girmedi: 'Ҳали кирмади', gecti: 'Ўқилмади' },
  durumKucuk: { kilindi: 'ўқилди', vaktiGeldi: 'вақти кирди', girmedi: 'ҳали кирмади', gecti: 'ўқилмади' },
  eylem: { kildim: 'Ўқидим', kilindi: 'Ўқилди' },
  kerahatVakti: 'Макруҳ вақт',
  isaretle: 'Ўқилди деб белгилаш',
  geriAlEtiketi: '{durum}, бекор қилиш учун босинг',
  geriAlindi: 'Белги олиб ташланди',
};
