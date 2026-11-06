import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** İbadete çağrı: çoğul kısa emir; secde yok. Sıra Türkçe şablonlarla BİREBİR eşleşir. */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'raqte', girisindenItibaren: 'gexe' },
  cip: { vakit: 'Salat migaq', sure: 'Daqiiqa', yon: 'raqte / gexe', cuma: 'Jumqatta', yatsi: 'Qisha' },
  sablon: {
    muhafizCikis: [
      '{vakit} wakti duddumta, {süre} daqiiqa raqte.',
      '{vakit} ma bayisina, {süre} daqiiqa raqte.',
      'Wakti dagoowta, {vakit} gexam fanah {süre} daqiiqa raqte.',
    ],
    muhafizGiris: [
      '{vakit} wakti cule, {süre} daqiiqa gexe.',
      '{vakit} ma raaqisina, {süre} daqiiqa gexe.',
      'Wakti gexa, {vakit} salaatah soola, {süre} daqiiqa gexe.',
    ],
    nafile: [
      '{vakit} wakti, {süre} daqiiqa {yön}. Namma rakqat abaanamah meqe wakti.',
      '{vakit} wakti tan. Namma rakqat abaanamah meqe dudda.',
      '{vakit} salaatah {süre} daqiiqa {yön}.',
    ],
    cuma: [
      'Jumqatta fanah {süre} daqiiqa raqte. Massoowaay masgid fan gexa.',
      'Jumqatta xayyoowta, {süre} daqiiqa raqte.',
      'Xutba geya, Jumqatta fanah {süre} daqiiqa raqte.',
    ],
    camiyeGit: [
      '{vakit} fanah {süre} daqiiqa raqte. Masgid fan gexa.',
      'Masgid fan gexxam wakti, {vakit} fanah {süre} daqiiqa.',
      '{vakit} salaatah masgid fan gexa.',
    ],
    yatis: ['Xiinam dumak Qisha salat aba.', 'Qisha wakti hanna tan, xiinam dumak salaatah soola.', 'Qisha salat abinnaay ma xiinina.'],
    takvim: [
      'Sinni kalendaril tan taama {vakit} waktil geytima.',
      '{vakit} wakti taama luk geytima; naharat salat abaanam ma hawwena.',
      '{süre} daqiiqa lakal {vakit} wakti sinni taama luk geytima; sinni salat ma hawwena.',
    ],
  },
  otomatik: {
    cuma: 'Jumqattah Dohori fanah {sure} raqte. Massoowaay masgid fan gexa.',
    camiyeGiris: '{vakit} fanah {sure} raqte.',
    camiyeHazirlan: 'Massoowaay masgid fan gexa.',
    camiyeYola: 'Masgid fan gexa.',
    takvimGiris: 'Sinni kalendaril tan taama {vakit} waktil geytima.',
    takvimOnce: 'Taama dumak salat abaanam ma hawwena.',
    takvimKaplar: 'Dago caba, salat abaanam ma hawwena.',
    yatsi: 'Xiinam dumak Qisha salat aba.',
    muhasebeTek: 'Asaaku {vakit} calaamat ma lino.',
    muhasebeCoklu: cogul({ one: 'Asaaku {n} salat calaamat ma lito.', other: 'Asaaku {n} salat calaamat ma lito.' }),
    geceCapasi: 'Xongolo mali saaqoota {süre} daqiiqa lakal qimbisa. Xiinam dumak {vakit} salat aba.',
    kuslukSuruyor: 'Duha wakti tan.',
    kuslukGirdi: 'Duha wakti cule. Namma rakqat abaanamah meqe wakti.',
    kuslukBitiyor: cogul({ one: 'Duha waktik {n} daqiiqa raqte.', other: 'Duha waktik {n} daqiiqa raqte.' }),
    evvabinSuruyor: 'Awwabinih wakti hanna tan.',
    evvabinGirdi: 'Awwabin wakti. Namma rakqat abaanamah meqe wakti.',
    evvabinKalan: cogul({ one: 'Awwabinih {n} daqiiqa raqte.', other: 'Awwabinih {n} daqiiqa raqte.' }),
    teheccudSonUcte: 'Tahajjud wakti. Barti ellecabo cule.',
    teheccudKalan: cogul({ one: 'Tahajjud wakti. Subci fanah {n} daqiiqa raqte.', other: 'Tahajjud wakti. Subci fanah {n} daqiiqa raqte.' }),
  },
};
