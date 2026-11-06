import type { Sozluk } from '../tr';

/**
 * İtalyancada gün ve ay adları küçük harfle yazılır ("31 ottobre 2026", CLDR it); tek başına
 * takvim başlığında büyük harf. Kısaltmalar CLDR it (noktasız). Haftalık panel Pazartesi başlar.
 */
export const tarih: Sozluk['tarih'] = {
  gunler: ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'],
  gunlerKisa: ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'],
  aylar: ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'],
  aylarYalin: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
  aylarKisa: ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'],
  haftaHarfleri: ['L', 'M', 'M', 'G', 'V', 'S', 'D'],
  uzun: '{gun} {ay} {yil}',
  gunAdiYil: '{gunAdi}, {yil}',
};
