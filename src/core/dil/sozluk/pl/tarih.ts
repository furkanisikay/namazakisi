// `aylar` tarih içi ilgi hâli ("2 listopada 2026"), `aylarYalin` takvim başlığı yalın hâl ("Listopad 2026").
// Gün adı tek başına satır başında durduğu için büyük harfle başlar ("Poniedziałek, 2026").
import type { Sozluk } from '../tr';

export const tarih: Sozluk['tarih'] = {
  gunler: ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'],
  gunlerKisa: ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb'],
  aylar: ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'],
  aylarYalin: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'],
  aylarKisa: ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'],
  haftaHarfleri: ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'],
  uzun: '{gun} {ay} {yil}',
  gunAdiYil: '{gunAdi}, {yil}',
};
