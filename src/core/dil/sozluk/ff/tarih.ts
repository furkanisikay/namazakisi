import type { Sozluk } from '../tr';

/**
 * Pular gün ve ay adları (fulapula sözlüğü): günler Arapça kökenli (alati, alarba, alkamisa,
 * aljuma, asewe; "altine" ve "talaata" sözlükte yok, Batı Afrika ortak biçimi — doğrulanmadı),
 * aylar Fransızca kökenli (sanwiye, feeburuyee, maarasi, awril, juwen, suwiye, ut, settaambur,
 * ottoombur, nofambar, deesaambur; "mee" sözlükte yok — doğrulanmadı). CLDR `ff` adları (dewo,
 * siilo…) Pulaar'dır, kullanılmaz. Tarih içinde ay küçük harf, tek başına büyük harfle başlar.
 * Kısaltmalar türetildi.
 */
export const tarih: Sozluk['tarih'] = {
  gunler: ['Alati', 'Altine', 'Talaata', 'Alarba', 'Alkamisa', 'Aljuma', 'Asewe'],
  gunlerKisa: ['Ati', 'Tin', 'Tal', 'Arb', 'Kam', 'Jum', 'Sew'],
  aylar: ['sanwiye', 'feeburuyee', 'maarasi', 'awril', 'mee', 'juwen', 'suwiye', 'ut', 'settaambur', 'ottoombur', 'nofambar', 'deesaambur'],
  aylarYalin: ['Sanwiye', 'Feeburuyee', 'Maarasi', 'Awril', 'Mee', 'Juwen', 'Suwiye', 'Ut', 'Settaambur', 'Ottoombur', 'Nofambar', 'Deesaambur'],
  aylarKisa: ['San', 'Fee', 'Maa', 'Awr', 'Mee', 'Juw', 'Suw', 'Ut', 'Set', 'Ott', 'Nof', 'Dee'],
  haftaHarfleri: ['Ti', 'Ta', 'Ar', 'Ka', 'Ju', 'Se', 'At'],
  uzun: '{gun} {ay} {yil}',
};
