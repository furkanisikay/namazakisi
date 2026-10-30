// Ge'ez yazısında büyük/küçük harf yok: `buyuk` ve `kucuk` `adlar` ile aynı yazılır.
import type { Sozluk } from '../tr';

/**
 * Amharca terim kararları (kaynaklar: `scratchpad/w4/dalga8-terimler.md` + HadeethEnc Amharca):
 * - Namaz ሶላት (QuranEnc `amharic_sadiq` 17:78); Hristiyan "dua/ibadet" sözcüğü KULLANILMAZ (terim tablosu).
 *   Namaz kılmak መስገድ (ሰገደ; tekil emir ስገድ, QE 17:78).
 * - Vakitler: ፈጅር (çizelge satırı `imsakVakti` de fecir adı), ፀሐይ መውጣት (QE 50:39), ዙህር, አስር,
 *   መግሪብ, ኢሻ (youth-mission.com/salat, tiriyachen.org).
 * - Cuma ጁሙዓ ("የጁሙዓ ሶላት", https://hadeethenc.com/am/browse/hadith/5394).
 * - Kaza ቀዷእ ("ቀዷእ ማድረግ", https://hadeethenc.com/am/browse/hadith/65088); farz የግዴታ ሶላት.
 * - Nafile የፈቃደኝነት ሶላት / ሱና ሶላት (https://hadeethenc.com/am/browse/category/483).
 * - Abdest ዉዱእ (hadeethenc 5394). Kıble ቂብላ (QE 2:144). Cami መስጂድ. Ezan አዛን.
 * - Kerahat vakti "ሶላት ክልክል የሆነበት ወቅት" (hadeethenc 10604 kategori adı).
 * - Kıldım ሰገድኩ, Kılındı ተሰግዷል, "Allah kabul etsin" አላህ ይቀበለው: kökten TÜRETİLDİ
 *   (ሰገደ, ተቀበለ QE 2:127), yerli okuyucuyla DOĞRULANMADI.
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'ፈጅር', gunes: 'ፀሐይ መውጣት', ogle: 'ዙህር', ikindi: 'አስር', aksam: 'መግሪብ', yatsi: 'ኢሻ' },
  buyuk: { imsak: 'ፈጅር', gunes: 'ፀሐይ መውጣት', ogle: 'ዙህር', ikindi: 'አስር', aksam: 'መግሪብ', yatsi: 'ኢሻ' },
  kucuk: { imsak: 'ፈጅር', gunes: 'ፀሐይ መውጣት', ogle: 'ዙህር', ikindi: 'አስር', aksam: 'መግሪብ', yatsi: 'ኢሻ' },
  imsakVakti: 'ፈጅር',
  cuma: 'ጁሙዓ',
  cumaKucuk: 'ጁሙዓ',
  gunesDogusu: 'ፀሐይ መውጣት',
  gunesDogusuKucuk: 'ፀሐይ መውጣት',
  durum: { kilindi: 'ተሰግዷል', vaktiGeldi: 'ሰዓቱ ደርሷል', girmedi: 'ገና አልገባም', gecti: 'አልተሰገደም' },
  durumKucuk: { kilindi: 'ተሰግዷል', vaktiGeldi: 'ሰዓቱ ደርሷል', girmedi: 'ገና አልገባም', gecti: 'አልተሰገደም' },
  eylem: { kildim: 'ሰገድኩ', kilindi: 'ተሰግዷል' },
  kerahatVakti: 'ሶላት ክልክል የሆነበት ወቅት',
  isaretle: 'እንደተሰገደ ምልክት አድርግ',
  geriAlEtiketi: '{durum}፣ ለመቀልበስ ይንኩ',
  geriAlindi: 'ምልክቱ ተነስቷል',
};
