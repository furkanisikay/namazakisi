import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** İbadete çağrı kaydı: "ianao" kipinde kısa emir; secde yok. Sıra Türkçe şablonlarla BİREBİR eşleşir. */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'sisa', girisindenItibaren: 'lasa' },
  cip: { vakit: "Anaran'ny soalat", sure: 'Minitra', yon: 'sisa / lasa', cuma: 'Zoma', yatsi: 'Isha' },
  sablon: {
    muhafizCikis: [
      "Efa ho tapitra ny fotoanan'ny {vakit}, {süre} minitra sisa.",
      'Aza avela handalo ny {vakit}, {süre} minitra sisa.',
      "Mihafohy ny fotoana, {süre} minitra sisa mandra-pifaranan'ny {vakit}.",
    ],
    muhafizGiris: [
      "Tonga ny fotoanan'ny {vakit}, {süre} minitra no lasa.",
      'Aza ahemotra ny {vakit}, {süre} minitra no lasa.',
      "Mandeha ny fotoana, mitsangàna ho an'ny {vakit}, {süre} minitra izao.",
    ],
    nafile: [
      "Fotoanan'ny {vakit}, {süre} minitra {yön}. Fotoana tsara ho an'ny rakat roa.",
      "Mitohy ny fotoanan'ny {vakit}. Fahafahana tsara hanaovana rakat roa.",
      "{süre} minitra {yön} ho an'ny {vakit}.",
    ],
    cuma: [
      "{süre} minitra sisa mankany amin'ny Zoma. Miomàna ary mankanesa any amin'ny moske.",
      'Manakaiky ny Zoma, {süre} minitra sisa.',
      "Aza tara amin'ny khotba, {süre} minitra sisa mankany amin'ny Zoma.",
    ],
    camiyeGit: [
      "{süre} minitra sisa mankany amin'ny {vakit}. Mankanesa any amin'ny moske.",
      "Fotoana handehanana any amin'ny moske, {süre} minitra mankany amin'ny {vakit}.",
      "Mankanesa any amin'ny moske ho an'ny {vakit}.",
    ],
    yatis: [
      "Ataovy ny soalat Isha alohan'ny hatoriana.",
      "Mbola mitohy ny fotoanan'ny Isha, mitsangàna hivavaka alohan'ny hatoriana.",
      'Aza matory raha tsy efa nanao ny soalat Isha.',
    ],
    takvim: [
      "Misy hetsika ao amin'ny tetiandroanao mifanandrify amin'ny fotoanan'ny {vakit}.",
      "Mifanindry amin'ny hetsika iray ny fotoanan'ny {vakit}; aza adino ny mivavaka aloha.",
      "Afaka {süre} minitra dia mifanindry amin'ny hetsikao ny fotoanan'ny {vakit}; aza adino ny soalatrao.",
    ],
  },
  otomatik: {
    cuma: "{sure} mankany amin'ny Zohr ho an'ny Zoma. Miomàna ary mankanesa any amin'ny moske.",
    camiyeGiris: "{sure} mankany amin'ny {vakit}.",
    camiyeHazirlan: "Miomàna ary mankanesa any amin'ny moske.",
    camiyeYola: "Mankanesa any amin'ny moske.",
    takvimGiris: "Misy hetsika ao amin'ny tetiandroanao mifanandrify amin'ny fotoanan'ny {vakit}.",
    takvimOnce: "Aza adino ny mivavaka alohan'ny hetsika.",
    takvimKaplar: 'Aza adino ny miala sasatra kely mba hivavaka.',
    yatsi: "Ataovy ny soalat Isha alohan'ny hatoriana.",
    muhasebeTek: 'Toa tsy voamarika androany ny {vakit}.',
    muhasebeCoklu: cogul({ one: 'Toa tsy voamarika androany ny soalat {n}.', other: 'Toa tsy voamarika androany ny soalat {n}.' }),
    geceCapasi: "Manomboka afaka {süre} minitra ny ora mangina. Ataovy ny soalat {vakit} alohan'ny hatoriana.",
    kuslukSuruyor: "Mitohy ny fotoanan'ny Duha.",
    kuslukGirdi: "Tonga ny fotoanan'ny Duha. Fotoana tsara ho an'ny rakat roa.",
    kuslukBitiyor: cogul({ one: "{n} minitra sisa amin'ny fotoanan'ny Duha.", other: "{n} minitra sisa amin'ny fotoanan'ny Duha." }),
    evvabinSuruyor: "Mbola misy fotoana ho an'ny Awwabin.",
    evvabinGirdi: "Fotoanan'ny Awwabin. Fotoana tsara ho an'ny rakat roa.",
    evvabinKalan: cogul({ one: "{n} minitra sisa ho an'ny Awwabin.", other: "{n} minitra sisa ho an'ny Awwabin." }),
    teheccudSonUcte: "Fotoanan'ny Tahadjoud. Nanomboka ny ampahatelony farany amin'ny alina.",
    teheccudKalan: cogul({
      one: "Fotoanan'ny Tahadjoud. {n} minitra sisa mankany amin'ny Fajr.",
      other: "Fotoanan'ny Tahadjoud. {n} minitra sisa mankany amin'ny Fajr.",
    }),
  },
};
