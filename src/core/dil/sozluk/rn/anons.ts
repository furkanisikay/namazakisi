import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** İbadete çağrı kaydı: doğrudan, kısa, 2. çoğul emir; secde yok. Sıra Türkçe şablonlarla BİREBİR eşleşir. */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'isigaye', girisindenItibaren: 'iheze' },
  cip: { vakit: 'Izina ry’isengesho', sure: 'Iminota', yon: 'isigaye / iheze', cuma: 'Ijuma', yatsi: 'Isha' },
  sablon: {
    muhafizCikis: [
      'Igihe ca {vakit} kiriko kirarangira, hasigaye iminota {süre}.',
      'Ntimucikanwe na {vakit}, hasigaye iminota {süre}.',
      'Igihe kiriko kiragabanuka, hasigaye iminota {süre} ngo {vakit} irangire.',
    ],
    muhafizGiris: [
      'Igihe ca {vakit} cageze, haciye iminota {süre}.',
      'Ntimutebaganye {vakit}, haciye iminota {süre}.',
      'Igihe kiriko kiragenda, muhagarare musenge {vakit}, haciye iminota {süre}.',
    ],
    nafile: [
      'Igihe ca {vakit}, iminota {süre} {yön}. Ni akanya keza ko gusenga rakaa zibiri.',
      'Igihe ca {vakit} kiracariho. Ni akaryo keza ko gusenga rakaa zibiri.',
      'Iminota {süre} {yön} ya {vakit}.',
    ],
    cuma: [
      'Hasigaye iminota {süre} ngo Ijuma ishike. Mwitegure mwerekeze ku musigiti.',
      'Ijuma iregereje, hasigaye iminota {süre}.',
      'Mushikire khutba, hasigaye iminota {süre} ngo Ijuma ishike.',
    ],
    camiyeGit: [
      'Hasigaye iminota {süre} ngo {vakit} ishike. Mwerekeze ku musigiti.',
      'Ni igihe co kuja ku musigiti, hasigaye iminota {süre} ngo {vakit} ishike.',
      'Mwerekeze ku musigiti kuri {vakit}.',
    ],
    yatis: ['Musenge Isha imbere yo kuryama.', 'Igihe ca Isha kiracariho, muhagarare musenge imbere yo gusinzira.', 'Ntimusinzire imbere yo gusenga Isha.'],
    takvim: [
      'Igikorwa kiri muri kalendari yanyu gihuye n’igihe ca {vakit}.',
      'Igihe ca {vakit} gihuye n’igikorwa; ntimwibagire gusenga imbere.',
      'Haciye iminota {süre}, igihe ca {vakit} kizohura n’igikorwa canyu; ntimwibagire isengesho ryanyu.',
    ],
  },
  otomatik: {
    cuma: 'Hasigaye {sure} ngo Adhuhuri ya Ijuma ishike. Mwitegure mwerekeze ku musigiti.',
    camiyeGiris: 'Hasigaye {sure} ngo {vakit} ishike.',
    camiyeHazirlan: 'Mwitegure mwerekeze ku musigiti.',
    camiyeYola: 'Mwerekeze ku musigiti.',
    takvimGiris: 'Igikorwa kiri muri kalendari yanyu gihuye n’igihe ca {vakit}.',
    takvimOnce: 'Ntimwibagire gusenga imbere y’igikorwa.',
    takvimKaplar: 'Ntimwibagire kuruhuka gato mugasenga.',
    yatsi: 'Musenge Isha imbere yo kuryama.',
    muhasebeTek: 'Uyu musi, {vakit} isa n’iyitaremezwa.',
    muhasebeCoklu: cogul({ one: 'Uyu musi, isengesho {n} risa n’iritaremezwa.', other: 'Uyu musi, amasengesho {n} asa n’ayataremezwa.' }),
    geceCapasi: 'Amasaha y’ituze atangura haciye iminota {süre}. Musenge {vakit} imbere yo kuryama.',
    kuslukSuruyor: 'Igihe ca Duha kiracariho.',
    kuslukGirdi: 'Igihe ca Duha cageze. Ni akanya keza ko gusenga rakaa zibiri.',
    kuslukBitiyor: cogul({ one: 'Hasigaye umunota {n} w’igihe ca Duha.', other: 'Hasigaye iminota {n} y’igihe ca Duha.' }),
    evvabinSuruyor: 'Haracari umwanya wa Awwabin.',
    evvabinGirdi: 'Igihe ca Awwabin. Ni akanya keza ko gusenga rakaa zibiri.',
    evvabinKalan: cogul({ one: 'Hasigaye umunota {n} wa Awwabin.', other: 'Hasigaye iminota {n} ya Awwabin.' }),
    teheccudSonUcte: 'Igihe ca Tahajudi. Igice ca gatatu ca nyuma c’ijoro catanguye.',
    teheccudKalan: cogul({ one: 'Igihe ca Tahajudi. Hasigaye umunota {n} ngo Fajri ishike.', other: 'Igihe ca Tahajudi. Hasigaye iminota {n} ngo Fajri ishike.' }),
  },
};
