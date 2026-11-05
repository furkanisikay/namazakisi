import type { Sozluk } from '../tr';

/**
 * Dagbani arayüz hitabı: mealin saygılı çoğul emri ("Puhimi ya jiŋli", 2:43 → fiil + "‑mi ya"),
 * iyelik ve özne "yi" (siz). Sözcük kaynağı: MediaWiki Dagbani çevirisi (Nyahima "vazgeç", Labi
 * niŋ "yeniden dene", iin/Aayi "evet/hayır") çoğul emre çekildi. Yerli okuyucuyla DOĞRULANMADI.
 */
export const ortak: Sozluk['ortak'] = {
  devamEdin: 'Chaŋmi ya tooni',
  vazgecin: 'Nyahimi ya',
  kapatin: 'Kpihimi ya',
  ayarlariAcin: 'Yoomi ya malizali',
  simdilikGecin: 'Chɛmi ya pumpɔŋɔ',
  tekrarDeneyin: 'Lahi niŋmi ya',
  evet: 'Iin',
  hayir: 'Aayi',
  ayrintilariAcar: 'Di yooiri kahigibu',
  marka: 'Namaz Akışı',
};
