import type { Sozluk } from '../tr';

/**
 * Almanca konuşan Müslümanların yerleşik kalıpları (çeviri değil): "Möge Allah es annehmen"
 * baskın kalıp; "Taqabbal Allah" Arapça kalıbın Almanca metinlerde de kullanılan yazımı.
 * Kandil selamı Almanya'da yalnız Türk diasporası geleneğidir (`selam.ts > KANDIL_ULKELERI`
 * DE'yi içermez); DİTİB'in Almanca adlarıyla tip bütünlüğü için yazıldı.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Möge es Segen bringen.',
  kabulDualari: ['Möge Allah es annehmen', 'Taqabbal Allah', 'Möge Allah es annehmen', 'Möge unser Herr es annehmen'],
  kabulDuasi: 'Möge Allah es annehmen',
  ekSabah: 'Einen gesegneten Morgen',
  ekYatsi: 'Eine gesegnete Nacht',
  tamGunAna: 'Möge Allah es annehmen',
  tamGunAlt: 'Sie haben heute alle fünf Gebete verrichtet.',
  kazaKabul: 'Ein Nachholgebet ({vakit}) wurde aus Ihrem Nachholbuch ausgetragen. {dua}.',
  kandilGeceleri: {
    regaib: 'Eine gesegnete Regaib-Nacht',
    mirac: 'Eine gesegnete Miradsch-Nacht',
    berat: 'Eine gesegnete Berat-Nacht',
    mevlid: 'Eine gesegnete Mevlid-Nacht',
  },
  selamlar: {
    sahur: 'Einen gesegneten Suhur',
    bayram: 'Eid Mubarak',
    iftar: 'Ein gesegnetes Iftar',
    kadir: 'Eine gesegnete Nacht der Bestimmung',
    arefe: 'Einen gesegneten Vorabend des Festes',
    hicriYilbasi: 'Ein gesegnetes islamisches Neujahr',
    cuma: 'Einen gesegneten Freitag',
    ramazan: 'Einen gesegneten Ramadan',
    sabah: 'Einen gesegneten Morgen',
  },
};
