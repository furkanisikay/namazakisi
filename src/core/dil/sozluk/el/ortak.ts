import type { Sozluk } from '../tr';

/**
 * Yunanca hitap: 2. çoğul kibar fiil, zamir yazılmaz ("Επιλέξτε πόλη"); düğmede kısa isim
 * ("Άκυρο", "Κλείσιμο"). Soru işareti ";" (U+003B), "?" yazılmaz. Tırnak « ».
 */
export const ortak: Sozluk['ortak'] = {
  devamEdin: 'Συνέχεια',
  vazgecin: 'Άκυρο',
  kapatin: 'Κλείσιμο',
  ayarlariAcin: 'Άνοιγμα ρυθμίσεων',
  simdilikGecin: 'Παράλειψη για τώρα',
  tekrarDeneyin: 'Δοκιμάστε ξανά',
  evet: 'Ναι',
  hayir: 'Όχι',
  ayrintilariAcar: 'Ανοίγει λεπτομέρειες',
  marka: 'Namaz Akışı',
};
