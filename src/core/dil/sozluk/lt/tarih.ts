// `aylar` tarih içi ilgi hâli (CLDR "2026 m. lapkričio 4 d."), `aylarYalin` takvim başlığı yalın (CLDR "2026 m. lapkritis"); CLDR tarih sırası yıl önce.
// Gün adı tek başına satır başında durduğu için büyük harfle başlar ("Trečiadienis, 2026 m.").
import type { Sozluk } from '../tr';

export const tarih: Sozluk['tarih'] = {
  gunler: ['Sekmadienis', 'Pirmadienis', 'Antradienis', 'Trečiadienis', 'Ketvirtadienis', 'Penktadienis', 'Šeštadienis'],
  gunlerKisa: ['Sk', 'Pr', 'An', 'Tr', 'Kt', 'Pn', 'Št'],
  aylar: ['sausio', 'vasario', 'kovo', 'balandžio', 'gegužės', 'birželio', 'liepos', 'rugpjūčio', 'rugsėjo', 'spalio', 'lapkričio', 'gruodžio'],
  aylarYalin: ['Sausis', 'Vasaris', 'Kovas', 'Balandis', 'Gegužė', 'Birželis', 'Liepa', 'Rugpjūtis', 'Rugsėjis', 'Spalis', 'Lapkritis', 'Gruodis'],
  aylarKisa: ['saus.', 'vas.', 'kov.', 'bal.', 'geg.', 'birž.', 'liep.', 'rugp.', 'rugs.', 'spal.', 'lapkr.', 'gruod.'],
  haftaHarfleri: ['Pr', 'An', 'Tr', 'Kt', 'Pn', 'Št', 'Sk'],
  uzun: '{yil} m. {ay} {gun} d.',
  gunAdiYil: '{gunAdi}, {yil} m.',
};
