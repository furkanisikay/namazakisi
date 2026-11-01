import type { Sozluk } from '../tr';

/**
 * Yunanca konuşan Müslümanların kalıpları (çeviri değil). Yunanca İslami kurum metni çok az
 * (Batı Trakya toplulukları Türkçe yayın yapar); dua kalıpları QuranEnc `greek_rwwad` mealindeki
 * "δέχομαι" kökünden (2:127 "Κύριέ μας, δέξου από μας"; 5:27 "Ο Αλλάχ δέχεται…") TÜRETİLDİ, yerli
 * okuyucuyla DOĞRULANMADI. Bayram ve Ramazan için Yunancada yerleşik "Μπαϊράμι", "Ραμαζάνι"
 * (meal 2:185 "Ραμαντάν (Ραμαζανιού)"); Kadir gecesi meal 97:1 "Νύχτα του Αλ-Κάντρ". Övgü ve "!" yok.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Ας είναι ευλογημένο.',
  kabulDualari: ['Ας τη δεχτεί ο Αλλάχ', 'Ας γίνει δεκτή', 'Ας τη δεχτεί ο Αλλάχ', 'Ας τη δεχτεί ο Κύριός μας'],
  kabulDuasi: 'Ας τη δεχτεί ο Αλλάχ',
  ekSabah: 'Ευλογημένο πρωινό',
  ekYatsi: 'Ευλογημένη νύχτα',
  tamGunAna: 'Ας τις δεχτεί ο Αλλάχ',
  tamGunAlt: 'Σήμερα τελέσατε και τις πέντε προσευχές.',
  kazaKabul: 'Μία αναπλήρωση {vakit} αφαιρέθηκε από το αρχείο σας. {dua}.',
  kandilGeceleri: {
    regaib: 'Ευλογημένη νύχτα Ραγάιμπ',
    mirac: 'Ευλογημένη νύχτα Ισρά και Μιράτζ',
    berat: 'Ευλογημένη νύχτα Μπαράα',
    mevlid: 'Ευλογημένο Μεβλίντ',
  },
  selamlar: {
    sahur: 'Ευλογημένο σαχούρ',
    bayram: 'Καλό Μπαϊράμι',
    iftar: 'Ευλογημένο ιφτάρ',
    kadir: 'Ευλογημένη Νύχτα του Αλ-Κάντρ',
    arefe: 'Ευλογημένη παραμονή του Μπαϊραμιού',
    hicriYilbasi: 'Ευλογημένο νέο έτος Εγίρας',
    cuma: 'Ευλογημένη Παρασκευή',
    ramazan: 'Καλό Ραμαζάνι',
    sabah: 'Ευλογημένο πρωινό',
  },
};
