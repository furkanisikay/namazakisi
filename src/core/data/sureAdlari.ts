/**
 * Sûre adları (Türkçe) — Diyanet Kur'an Yolu yazımı, okunuş işaretleri "â/î/û" ile.
 *
 * Özel addır, çevrilmez (dil çırçırı dışında: `scripts/dil/turkceMetinSay.js` → `HARIC`).
 * Değişken yazımı olanlarda tercih: 40 Mü'min (Gâfir), 75 Kıyâme, 76 İnsân (Dehr),
 * 97 Kadr, 111 Tebbet (Mesed); kalın ünlü işareti tutarlı olarak "â" (Kur'an Yolu'ndaki
 * "ā" yerine: Furkân, Ahkâf, Kâf, Tegâbün, İnşikâk, Gâşiye, Kâria).
 */

/** Dizin = sûre numarası - 1. */
export const SURE_ADLARI_TR: readonly string[] = [
  'Fâtiha', 'Bakara', 'Âl-i İmrân', 'Nisâ', 'Mâide', "En'âm", "A'râf", 'Enfâl', 'Tevbe', 'Yûnus',
  'Hûd', 'Yûsuf', "Ra'd", 'İbrâhîm', 'Hicr', 'Nahl', 'İsrâ', 'Kehf', 'Meryem', 'Tâhâ',
  'Enbiyâ', 'Hac', "Mü'minûn", 'Nûr', 'Furkân', 'Şuarâ', 'Neml', 'Kasas', 'Ankebût', 'Rûm',
  'Lokmân', 'Secde', 'Ahzâb', "Sebe'", 'Fâtır', 'Yâsîn', 'Sâffât', 'Sâd', 'Zümer', "Mü'min",
  'Fussılet', 'Şûrâ', 'Zuhruf', 'Duhân', 'Câsiye', 'Ahkâf', 'Muhammed', 'Fetih', 'Hucurât', 'Kâf',
  'Zâriyât', 'Tûr', 'Necm', 'Kamer', 'Rahmân', 'Vâkıa', 'Hadîd', 'Mücâdele', 'Haşr', 'Mümtehine',
  'Saf', 'Cuma', 'Münâfikûn', 'Tegâbün', 'Talâk', 'Tahrîm', 'Mülk', 'Kalem', 'Hâkka', 'Meâric',
  'Nûh', 'Cin', 'Müzzemmil', 'Müddessir', 'Kıyâme', 'İnsân', 'Mürselât', "Nebe'", 'Nâziât', 'Abese',
  'Tekvîr', 'İnfitâr', 'Mutaffifîn', 'İnşikâk', 'Bürûc', 'Târık', "A'lâ", 'Gâşiye', 'Fecr', 'Beled',
  'Şems', 'Leyl', 'Duhâ', 'İnşirâh', 'Tîn', 'Alak', 'Kadr', 'Beyyine', 'Zilzâl', 'Âdiyât',
  'Kâria', 'Tekâsür', 'Asr', 'Hümeze', 'Fîl', 'Kureyş', 'Mâûn', 'Kevser', 'Kâfirûn', 'Nasr',
  'Tebbet', 'İhlâs', 'Felak', 'Nâs',
];

/** Sûre numarasından (1–114) Türkçe ad; aralık dışında boş dize. */
export function sureAdiTr(sure: number): string {
  return SURE_ADLARI_TR[sure - 1] ?? '';
}
