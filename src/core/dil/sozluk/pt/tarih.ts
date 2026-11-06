import type { Sozluk } from '../tr';

/** pt-PT (CLDR): gün ve ay adları küçük harf ("sábado, 31 de outubro de 2026"); tek başına başlıkta büyük harf. */
export const tarih: Sozluk['tarih'] = {
  gunler: ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
  gunlerKisa: ['dom.', 'seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.'],
  aylar: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
  aylarYalin: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  aylarKisa: ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'],
  /** Pazartesi başlar (segunda, terça, quarta, quinta, sexta, sábado, domingo). */
  haftaHarfleri: ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'],
  uzun: '{gun} de {ay} de {yil}',
  gunAdiYil: '{gunAdi}, {yil}',
};
