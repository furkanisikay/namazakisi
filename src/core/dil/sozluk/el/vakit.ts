// Yunancada büyük harfte vurgu (tonos) DÜŞER, diyalitika kalır: `buyuk` elle yazılır ("Μάγριμπ" → "ΜΑΓΡΙΜΠ"; `toUpperCase` YASAK). Soru işareti ";" (U+003B).
import type { Sozluk } from '../tr';

/**
 * Vakit adları QuranEnc `greek_rwwad` 1.0.2 mealindeki harf çevirisiyle (özel ad: cümle içinde de
 * büyük harfle başlar, çekimsiz): Φατζρ (24:58), Δουχρ (30:18), ‘Ασρ (30:18), Μάγριμπ ve ‘Ισά’
 * (30:17; ‘Ισά’ İsa peygamberin adı "Ίσα" ile karışmasın diye ‘ … ’ işaretleri korunur), güneş
 * "ανατολή του ηλίου" (50:39). Namaz "προσευχή" ("ναμάζ" hiçbir Yunanca kaynakta yok). Cuma kısa
 * adı mealin 62:9 parantezindeki "Τζούμου‘α"; cümlede "προσευχή της Παρασκευής". "Kıldım"
 * (Προσευχήθηκα) ve "Kılındı" (Τελέστηκε) türetildi, yerli okuyucuyla DOĞRULANMADI.
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Φατζρ', gunes: 'Ανατολή ηλίου', ogle: 'Δουχρ', ikindi: '‘Ασρ', aksam: 'Μάγριμπ', yatsi: '‘Ισά’' },
  buyuk: { imsak: 'ΦΑΤΖΡ', gunes: 'ΑΝΑΤΟΛΗ ΗΛΙΟΥ', ogle: 'ΔΟΥΧΡ', ikindi: '‘ΑΣΡ', aksam: 'ΜΑΓΡΙΜΠ', yatsi: '‘ΙΣΑ’' },
  kucuk: { imsak: 'Φατζρ', gunes: 'ανατολή ηλίου', ogle: 'Δουχρ', ikindi: '‘Ασρ', aksam: 'Μάγριμπ', yatsi: '‘Ισά’' },
  imsakVakti: 'Φατζρ',
  cuma: 'Τζούμου‘α',
  cumaKucuk: 'Τζούμου‘α',
  gunesDogusu: 'Ανατολή ηλίου',
  gunesDogusuKucuk: 'ανατολή ηλίου',
  durum: { kilindi: 'Τελέστηκε', vaktiGeldi: 'Ώρα προσευχής', girmedi: 'Όχι ακόμη', gecti: 'Δεν τελέστηκε' },
  durumKucuk: { kilindi: 'τελέστηκε', vaktiGeldi: 'ώρα προσευχής', girmedi: 'όχι ακόμη', gecti: 'δεν τελέστηκε' },
  eylem: { kildim: 'Προσευχήθηκα', kilindi: 'Τελέστηκε' },
  kerahatVakti: 'Αποδοκιμαστέα ώρα',
  isaretle: 'Σήμανση ως τελεσμένη',
  geriAlEtiketi: '{durum}, πατήστε για αναίρεση',
  geriAlindi: 'Η σήμανση αφαιρέθηκε',
};
