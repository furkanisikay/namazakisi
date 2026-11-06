import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Guhamagarira iswala (umurinzi, Ijuma, kujya ku musigiti, Isha mbere yo kuryama): bigufi, bitaziguye,
 * itegeko ribwira umuntu umwe (u-…, nka QuranEnc 17:78 «Ujye uhozaho iswala»); kalendari n’ibindi ni
 * ubwubahane (mu-…-e). Nta «!». Urutonde ruhura neza n’inyandikorugero z’Igiturukiya.
 */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'isigaye', girisindenItibaren: 'ishize' },
  cip: { vakit: 'Izina ry’iswala', sure: 'Iminota', yon: 'isigaye / ishize', cuma: 'Ijuma', yatsi: 'Isha' },
  sablon: {
    muhafizCikis: [
      'Igihe cya {vakit} kirarangira, hasigaye iminota {süre}.',
      'Ntucikwe na {vakit}, hasigaye iminota {süre}.',
      'Igihe kirashira, hasigaye iminota {süre} ngo {vakit} irangire.',
    ],
    muhafizGiris: [
      'Igihe cya {vakit} cyatangiye, hashize iminota {süre}.',
      'Ntucyereze {vakit}, hashize iminota {süre}.',
      'Igihe kirakomeza, hagurukira {vakit}, hashize iminota {süre}.',
    ],
    nafile: [
      'Igihe cya {vakit}, iminota {süre} {yön}. Ni akanya keza ko gusali raka ebyiri.',
      'Igihe cya {vakit} kirakomeje. Ni amahirwe meza yo gusali raka ebyiri.',
      'Iminota {süre} {yön} kuri {vakit}.',
    ],
    cuma: [
      'Hasigaye iminota {süre} ngo Ijuma igere. Itegure ujye ku musigiti.',
      'Ijuma iregereje, hasigaye iminota {süre}.',
      'Gera ku nyigisho, hasigaye iminota {süre} ngo Ijuma igere.',
    ],
    camiyeGit: [
      'Hasigaye iminota {süre} ngo {vakit} igere. Jya ku musigiti.',
      'Ni igihe cyo kujya ku musigiti, iminota {süre} ngo {vakit} igere.',
      'Jya ku musigiti kuri {vakit}.',
    ],
    yatis: ['Sali Isha mbere yo kuryama.', 'Igihe cya Isha kiracyakomeje, hagurukira iswala mbere yo gusinzira.', 'Ntuzaryame utarasali Isha.'],
    takvim: [
      'Igikorwa kiri muri kalendari yanyu kiri mu gihe cya {vakit}.',
      'Igihe cya {vakit} gihuriranye n’igikorwa; ntimwibagirwe kubanza gusali.',
      'Mu minota {süre} igihe cya {vakit} kirahurirana n’igikorwa cyanyu; ntimwibagirwe iswala yanyu.',
    ],
  },
  otomatik: {
    cuma: 'Hasigaye {sure} kugeza Adhuhuri ya Ijuma. Itegure ujye ku musigiti.',
    camiyeGiris: 'Hasigaye {sure} ngo {vakit} igere.',
    camiyeHazirlan: 'Itegure ujye ku musigiti.',
    camiyeYola: 'Jya ku musigiti.',
    takvimGiris: 'Igikorwa kiri muri kalendari yanyu kiri mu gihe cya {vakit}.',
    takvimOnce: 'Ntimwibagirwe gusali mbere y’igikorwa.',
    takvimKaplar: 'Ntimwibagirwe gufata akaruhuko mugasali.',
    yatsi: 'Sali Isha mbere yo kuryama.',
    muhasebeTek: 'Uyu munsi {vakit} isa n’itaremejwe.',
    muhasebeCoklu: cogul({ one: 'Uyu munsi iswala {n} zisa n’izitaremejwe.', other: 'Uyu munsi iswala {n} zisa n’izitaremejwe.' }),
    geceCapasi: 'Amasaha y’ituze atangira mu minota {süre}. Sali {vakit} mbere yo kuryama.',
    kuslukSuruyor: 'Igihe cya Duha kirakomeje.',
    kuslukGirdi: 'Igihe cya Duha cyatangiye. Ni akanya keza ko gusali raka ebyiri.',
    kuslukBitiyor: cogul({ one: 'Hasigaye iminota {n} mu gihe cya Duha.', other: 'Hasigaye iminota {n} mu gihe cya Duha.' }),
    evvabinSuruyor: 'Haracyari igihe cya Awwabin.',
    evvabinGirdi: 'Igihe cya Awwabin. Ni akanya keza ko gusali raka ebyiri.',
    evvabinKalan: cogul({ one: 'Hasigaye iminota {n} kuri Awwabin.', other: 'Hasigaye iminota {n} kuri Awwabin.' }),
    teheccudSonUcte: 'Igihe cya Tahajudi. Igice cya gatatu cya nyuma cy’ijoro cyatangiye.',
    teheccudKalan: cogul({ one: 'Igihe cya Tahajudi. Hasigaye iminota {n} ngo Fajri igere.', other: 'Igihe cya Tahajudi. Hasigaye iminota {n} ngo Fajri igere.' }),
  },
};
