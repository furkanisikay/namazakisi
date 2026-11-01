// Rumencede ay adı tarihte de yalın (CLDR "31 octombrie 2026"): `aylar` ile `aylarYalin` aynı biçim; ay adı küçük harfle başlar.
import type { Sozluk } from '../tr';

/** CLDR ro (Node ICU 77): gün ve ay adları küçük harf, kısa biçimler noktalı; uzun tarih "31 octombrie 2026". */
export const tarih: Sozluk['tarih'] = {
  gunler: ['duminică', 'luni', 'marți', 'miercuri', 'joi', 'vineri', 'sâmbătă'],
  gunlerKisa: ['dum.', 'lun.', 'mar.', 'mie.', 'joi', 'vin.', 'sâm.'],
  aylar: ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'],
  aylarYalin: ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'],
  aylarKisa: ['ian.', 'feb.', 'mar.', 'apr.', 'mai', 'iun.', 'iul.', 'aug.', 'sept.', 'oct.', 'nov.', 'dec.'],
  haftaHarfleri: ['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ', 'Du'],
  uzun: '{gun} {ay} {yil}',
  gunAdiYil: '{gunAdi}, {yil}',
};
