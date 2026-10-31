import type { Sozluk } from '../tr';

/** Gün ve ay adları CLDR (Hausa); kesme ʼ U+02BC ("Jummaʼa"). */
export const tarih: Sozluk['tarih'] = {
  gunler: ['Lahadi', 'Litinin', 'Talata', 'Laraba', 'Alhamis', 'Jummaʼa', 'Asabar'],
  gunlerKisa: ['Lah', 'Lit', 'Tal', 'Lar', 'Alh', 'Jum', 'Asa'],
  aylar: ['Janairu', 'Faburairu', 'Maris', 'Afirilu', 'Mayu', 'Yuni', 'Yuli', 'Agusta', 'Satumba', 'Oktoba', 'Nuwamba', 'Disamba'],
  aylarYalin: ['Janairu', 'Faburairu', 'Maris', 'Afirilu', 'Mayu', 'Yuni', 'Yuli', 'Agusta', 'Satumba', 'Oktoba', 'Nuwamba', 'Disamba'],
  aylarKisa: ['Jan', 'Fab', 'Mar', 'Afi', 'May', 'Yun', 'Yul', 'Agu', 'Sat', 'Okt', 'Nuw', 'Dis'],
  haftaHarfleri: ['Li', 'Ta', 'La', 'Al', 'Ju', 'As', 'Lh'],
  uzun: '{gun} {ay}, {yil}',
  gunAdiYil: '{gunAdi}, {yil}',
};
