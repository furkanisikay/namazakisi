import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı: 2. çoğul kibar emir, kısa; secde yok. Sıra Türkçe şablonlarla BİREBİR eşleşir.
 * Dakika tek biçimle ("{süre} minute") yazılır; `dakikaUyumu` sayıya göre çeker ("1 minut", "25 de minute").
 */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'rămase', girisindenItibaren: 'trecute' },
  cip: { vakit: 'Numele rugăciunii', sure: 'Minute', yon: 'rămase / trecute', cuma: 'Jumu’ah', yatsi: 'Ișa' },
  sablon: {
    muhafizCikis: [
      'Timpul de {vakit} se încheie, mai sunt {süre} minute.',
      'Nu pierdeți {vakit}, mai sunt {süre} minute.',
      'Timpul se scurtează, mai sunt {süre} minute până se încheie {vakit}.',
    ],
    muhafizGiris: [
      'A început timpul de {vakit}, au trecut {süre} minute.',
      'Nu amânați {vakit}, au trecut {süre} minute.',
      'Timpul înaintează, ridicați-vă la {vakit}, au trecut {süre} minute.',
    ],
    nafile: [
      'Timpul de {vakit}, {süre} minute {yön}. Un moment bun pentru două rak’ah.',
      'Timpul de {vakit} continuă. O ocazie bună pentru două rak’ah.',
      '{süre} minute {yön} pentru {vakit}.',
    ],
    cuma: [
      'Mai sunt {süre} minute până la Jumu’ah. Pregătiți-vă și mergeți la moschee.',
      'Se apropie Jumu’ah, mai sunt {süre} minute.',
      'Prindeți predica, mai sunt {süre} minute până la Jumu’ah.',
    ],
    camiyeGit: [
      'Mai sunt {süre} minute până la {vakit}. Mergeți la moschee.',
      'Este timpul să mergeți la moschee, mai sunt {süre} minute până la {vakit}.',
      'Mergeți la moschee pentru {vakit}.',
    ],
    yatis: [
      'Efectuați rugăciunea Ișa înainte de culcare.',
      'Timpul de Ișa continuă, ridicați-vă la rugăciune înainte să adormiți.',
      'Nu vă culcați înainte de a efectua rugăciunea Ișa.',
    ],
    takvim: [
      'Un eveniment din calendar cade în timpul de {vakit}.',
      'Timpul de {vakit} se suprapune cu un eveniment; nu uitați să vă rugați mai întâi.',
      'Peste {süre} minute, timpul de {vakit} se suprapune cu evenimentul; nu uitați de rugăciune.',
    ],
  },
  otomatik: {
    cuma: 'Mai sunt {sure} până la Dhuhr pentru Jumu’ah. Pregătiți-vă și mergeți la moschee.',
    camiyeGiris: 'Mai sunt {sure} până la {vakit}.',
    camiyeHazirlan: 'Pregătiți-vă și mergeți la moschee.',
    camiyeYola: 'Mergeți la moschee.',
    takvimGiris: 'Un eveniment din calendar cade în timpul de {vakit}.',
    takvimOnce: 'Nu uitați să vă rugați înainte de eveniment.',
    takvimKaplar: 'Nu uitați să faceți o pauză și să vă rugați.',
    yatsi: 'Efectuați rugăciunea Ișa înainte de culcare.',
    muhasebeTek: '{vakit} pare nemarcată astăzi.',
    muhasebeCoklu: cogul({
      one: '{n} rugăciune pare nemarcată astăzi.',
      few: '{n} rugăciuni par nemarcate astăzi.',
      other: '{n} de rugăciuni par nemarcate astăzi.',
    }),
    geceCapasi: 'Orele de liniște încep peste {süre} minute. Efectuați {vakit} înainte de culcare.',
    kuslukSuruyor: 'Timpul de Duha continuă.',
    kuslukGirdi: 'A început timpul de Duha. Un moment bun pentru două rak’ah.',
    kuslukBitiyor: cogul({
      one: 'Mai este {n} minut din timpul de Duha.',
      few: 'Mai sunt {n} minute din timpul de Duha.',
      other: 'Mai sunt {n} de minute din timpul de Duha.',
    }),
    evvabinSuruyor: 'Mai este timp pentru Awwabin.',
    evvabinGirdi: 'Timpul de Awwabin. Un moment bun pentru două rak’ah.',
    evvabinKalan: cogul({
      one: 'Mai este {n} minut pentru Awwabin.',
      few: 'Mai sunt {n} minute pentru Awwabin.',
      other: 'Mai sunt {n} de minute pentru Awwabin.',
    }),
    teheccudSonUcte: 'Timpul de Tahajjud. A început ultima treime a nopții.',
    teheccudKalan: cogul({
      one: 'Timpul de Tahajjud. Mai este {n} minut până la Fajr.',
      few: 'Timpul de Tahajjud. Mai sunt {n} minute până la Fajr.',
      other: 'Timpul de Tahajjud. Mai sunt {n} de minute până la Fajr.',
    }),
  },
};
