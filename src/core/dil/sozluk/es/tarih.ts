import type { Sozluk } from '../tr';

/** İspanyolcada gün ve ay adları küçük harfle yazılır ("24 de octubre de 2026"); tek başına başlıkta büyük harf. */
export const tarih: Sozluk['tarih'] = {
  gunler: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  gunlerKisa: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  aylar: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  aylarYalin: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  aylarKisa: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sept.', 'oct.', 'nov.', 'dic.'],
  /** Pazartesi başlar; çarşamba geleneksel olarak "X" (martes "M" ile karışmasın). */
  haftaHarfleri: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
  uzun: '{gun} de {ay} de {yil}',
};
