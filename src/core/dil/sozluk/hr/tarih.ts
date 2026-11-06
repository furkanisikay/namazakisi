// `aylar` tarih içi ilgi hâli ("31. listopada 2026."), `aylarYalin` yalın hâl ("Listopad 2026"); tarih sonda nokta taşır.
import type { Sozluk } from '../tr';

/** Hırvat standardı (CLDR hr): gün ve ay adları küçük harf, Hırvatça ay adları; uzun tarih "31. listopada 2026.". */
export const tarih: Sozluk['tarih'] = {
  gunler: ['nedjelja', 'ponedjeljak', 'utorak', 'srijeda', 'četvrtak', 'petak', 'subota'],
  gunlerKisa: ['ned', 'pon', 'uto', 'sri', 'čet', 'pet', 'sub'],
  aylar: ['siječnja', 'veljače', 'ožujka', 'travnja', 'svibnja', 'lipnja', 'srpnja', 'kolovoza', 'rujna', 'listopada', 'studenoga', 'prosinca'],
  aylarYalin: ['Siječanj', 'Veljača', 'Ožujak', 'Travanj', 'Svibanj', 'Lipanj', 'Srpanj', 'Kolovoz', 'Rujan', 'Listopad', 'Studeni', 'Prosinac'],
  aylarKisa: ['sij', 'velj', 'ožu', 'tra', 'svi', 'lip', 'srp', 'kol', 'ruj', 'lis', 'stu', 'pro'],
  haftaHarfleri: ['Po', 'Ut', 'Sr', 'Če', 'Pe', 'Su', 'Ne'],
  uzun: '{gun}. {ay} {yil}.',
  gunAdiYil: '{gunAdi}, {yil}.',
};
