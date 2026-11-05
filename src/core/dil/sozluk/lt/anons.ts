import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı: saygılı ‑kite emri, kısa; secde karşılığı yok. Sıra Türkçe şablonlarla
 * BİREBİR eşleşir. Dakika tek biçimle ("{süre} minučių") yazılır, `dakikaUyumu` sayıya göre
 * YALIN hâlde çeker → dakika yalnız yalın hâl isteyen kalıpta durur ("liko/praėjo {süre} …");
 * "po/už {süre}" yazılmaz (ilgi/belirtme hâli bozulur).
 */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'liko', girisindenItibaren: 'praėjo' },
  cip: { vakit: 'Maldos pavadinimas', sure: 'Minutės', yon: 'liko / praėjo', cuma: 'Džumua', yatsi: 'Isha' },
  sablon: {
    muhafizCikis: [
      '{vakit} laikas baigiasi, liko {süre} minučių.',
      'Nepraleiskite {vakit} maldos, liko {süre} minučių.',
      'Laikas senka, iki {vakit} pabaigos liko {süre} minučių.',
    ],
    muhafizGiris: [
      'Prasidėjo {vakit} laikas, praėjo {süre} minučių.',
      'Neatidėliokite {vakit} maldos, praėjo jau {süre} minučių.',
      'Laikas eina, stokite {vakit} maldai, praėjo {süre} minučių.',
    ],
    nafile: [
      '{vakit} laikas, {yön} {süre} minučių. Geras metas dviem rakatams.',
      '{vakit} laikas tęsiasi. Gera proga atlikti du rakatus.',
      '{vakit}: {yön} {süre} minučių.',
    ],
    cuma: [
      'Iki Džumua maldos liko {süre} minučių. Pasiruoškite ir vykite į mečetę.',
      'Artėja Džumua malda, liko {süre} minučių.',
      'Spėkite į pamokslą, iki Džumua maldos liko {süre} minučių.',
    ],
    camiyeGit: [
      'Iki {vakit} maldos liko {süre} minučių. Vykite į mečetę.',
      'Metas eiti į mečetę, iki {vakit} maldos liko {süre} minučių.',
      'Vykite į mečetę {vakit} maldai.',
    ],
    yatis: ['Prieš eidami miegoti atlikite Isha maldą.', 'Isha laikas dar tęsiasi, stokite maldai prieš miegą.', 'Neikite miegoti neatlikę Isha maldos.'],
    takvim: [
      'Įvykis jūsų kalendoriuje sutampa su {vakit} maldos laiku.',
      '{vakit} laikas sutampa su įvykiu; nepamirškite pirma pasimelsti.',
      'Liko {süre} minučių, kol {vakit} laikas sutaps su jūsų įvykiu; nepamirškite maldos.',
    ],
  },
  otomatik: {
    cuma: 'Iki Džumua maldos (Dhuhr laiko) liko {sure}. Pasiruoškite ir vykite į mečetę.',
    camiyeGiris: 'Iki {vakit} maldos liko {sure}.',
    camiyeHazirlan: 'Pasiruoškite ir vykite į mečetę.',
    camiyeYola: 'Vykite į mečetę.',
    takvimGiris: 'Įvykis jūsų kalendoriuje sutampa su {vakit} maldos laiku.',
    takvimOnce: 'Nepamirškite pasimelsti prieš įvykį.',
    takvimKaplar: 'Nepamirškite padaryti pertraukos ir pasimelsti.',
    yatsi: 'Prieš eidami miegoti atlikite Isha maldą.',
    muhasebeTek: 'Šiandien {vakit} malda atrodo nepažymėta.',
    muhasebeCoklu: cogul({ one: 'Šiandien {n} malda atrodo nepažymėta.', few: 'Šiandien {n} maldos atrodo nepažymėtos.', many: 'Šiandien {n} maldos atrodo nepažymėtos.', other: 'Šiandien {n} maldų atrodo nepažymėta.' }),
    geceCapasi: 'Iki nakties ramybės liko {süre} minučių. Prieš eidami miegoti atlikite {vakit} maldą.',
    kuslukSuruyor: 'Duha laikas tęsiasi.',
    kuslukGirdi: 'Prasidėjo Duha laikas. Geras metas dviem rakatams.',
    kuslukBitiyor: cogul({ one: 'Iki Duha laiko pabaigos liko {n} minutė.', few: 'Iki Duha laiko pabaigos liko {n} minutės.', many: 'Iki Duha laiko pabaigos liko {n} minutės.', other: 'Iki Duha laiko pabaigos liko {n} minučių.' }),
    evvabinSuruyor: 'Awwabin maldai dar yra laiko.',
    evvabinGirdi: 'Awwabin laikas. Geras metas dviem rakatams.',
    evvabinKalan: cogul({ one: 'Awwabin maldai liko {n} minutė.', few: 'Awwabin maldai liko {n} minutės.', many: 'Awwabin maldai liko {n} minutės.', other: 'Awwabin maldai liko {n} minučių.' }),
    teheccudSonUcte: 'Tahadžud laikas. Prasidėjo paskutinis nakties trečdalis.',
    teheccudKalan: cogul({ one: 'Tahadžud laikas. Iki Fajr liko {n} minutė.', few: 'Tahadžud laikas. Iki Fajr liko {n} minutės.', many: 'Tahadžud laikas. Iki Fajr liko {n} minutės.', other: 'Tahadžud laikas. Iki Fajr liko {n} minučių.' }),
  },
};
