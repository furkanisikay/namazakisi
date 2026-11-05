// Malgaşçada `buyuk` elle yazılır (`toUpperCase` YASAK).
import type { Sozluk } from '../tr';

/**
 * Malgaşça vakit adları HadeethEnc mg ve IslamHouse mg'den: Fajr · Zohr · Asr · Maghrib · Isha
 * (Isha türetildi: HE "icha"/"isa"; "isa" Malgaşçada "sayı" demektir). Güneş satırı Türkçedeki gibi
 * kısa "Masoandro", doğuş anı "Fiposahan'ny masoandro" (QE 15:73). Vakit adları özel addır, cümle
 * içinde de büyük harfle başlar; yalnız "masoandro" küçülür. Namaz terimi "soalat" (QE + HE),
 * genel cümlede "vavaka", fiil "mivavaka". "Kıldım" = "Nivavaka aho" (HE 10945), durum "Vita".
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Fajr', gunes: 'Masoandro', ogle: 'Zohr', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isha' },
  buyuk: { imsak: 'FAJR', gunes: 'MASOANDRO', ogle: 'ZOHR', ikindi: 'ASR', aksam: 'MAGHRIB', yatsi: 'ISHA' },
  kucuk: { imsak: 'Fajr', gunes: 'masoandro', ogle: 'Zohr', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isha' },
  imsakVakti: 'Fajr',
  cuma: 'Zoma',
  cumaKucuk: 'Zoma',
  gunesDogusu: "Fiposahan'ny masoandro",
  gunesDogusuKucuk: "fiposahan'ny masoandro",
  durum: { kilindi: 'Vita', vaktiGeldi: 'Tonga ny fotoana', girmedi: 'Mbola tsy tonga', gecti: 'Tsy vita' },
  durumKucuk: { kilindi: 'vita', vaktiGeldi: 'tonga ny fotoana', girmedi: 'mbola tsy tonga', gecti: 'tsy vita' },
  eylem: { kildim: 'Nivavaka aho', kilindi: 'Vita' },
  kerahatVakti: 'Fotoana tsy tokony hivavahana',
  isaretle: 'Mariho ho vita',
  geriAlEtiketi: '{durum}, kitiho raha hanafoana',
  geriAlindi: 'Nesorina ny marika',
};
