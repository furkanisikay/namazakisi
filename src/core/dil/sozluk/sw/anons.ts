import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Wito wa ibada: mfupi na wa moja kwa moja; "kusujudu" haitumiki. Mpangilio unalingana MOJA KWA MOJA na violezo vya Kituruki. */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'zimebaki', girisindenItibaren: 'zimepita' },
  cip: { vakit: 'Jina la Swala', sure: 'Dakika', yon: 'zimebaki / zimepita', cuma: 'Ijumaa', yatsi: 'Isha' },
  sablon: {
    muhafizCikis: [
      'Wakati wa {vakit} unaisha, zimebaki dakika {süre}.',
      'Usiikose {vakit}, zimebaki dakika {süre}.',
      'Muda unapungua, dakika {süre} hadi {vakit} iishe.',
    ],
    muhafizGiris: [
      'Wakati wa {vakit} umeingia, zimepita dakika {süre}.',
      'Usiichelewesha {vakit}, zimepita dakika {süre}.',
      'Muda unasonga, simamisha Swala ya {vakit}, zimepita dakika {süre}.',
    ],
    nafile: [
      'Wakati wa {vakit}, dakika {süre} {yön}. Ni wakati mzuri wa rakaa mbili.',
      'Wakati wa {vakit} unaendelea. Ni nafasi nzuri ya kuswali rakaa mbili.',
      'Dakika {süre} {yön} kwa {vakit}.',
    ],
    cuma: [
      'Zimebaki dakika {süre} hadi Ijumaa. Jitayarishe uende msikitini.',
      'Ijumaa inakaribia, zimebaki dakika {süre}.',
      'Wahi khutba, zimebaki dakika {süre} hadi Ijumaa.',
    ],
    camiyeGit: [
      'Zimebaki dakika {süre} hadi {vakit}. Elekea msikitini.',
      'Ni wakati wa kwenda msikitini, dakika {süre} hadi {vakit}.',
      'Elekea msikitini kwa ajili ya {vakit}.',
    ],
    yatis: ['Simamisha Swala ya Isha kabla ya kwenda kulala.', 'Wakati wa Isha bado unaendelea, simamisha Swala kabla ya kulala.', 'Usilale kabla ya kuswali Isha.'],
    takvim: [
      'Tukio katika kalenda yako linaangukia wakati wa {vakit}.',
      'Wakati wa {vakit} unagongana na tukio; usisahau kuswali kwanza.',
      'Baada ya dakika {süre} wakati wa {vakit} unagongana na tukio lako; usisahau Swala yako.',
    ],
  },
  otomatik: {
    cuma: '{sure} hadi Adhuhuri ya Ijumaa. Jitayarishe uende msikitini.',
    camiyeGiris: '{sure} hadi {vakit}.',
    camiyeHazirlan: 'Jitayarishe uende msikitini.',
    camiyeYola: 'Elekea msikitini.',
    takvimGiris: 'Tukio katika kalenda yako linaangukia wakati wa {vakit}.',
    takvimOnce: 'Usisahau kuswali kabla ya tukio.',
    takvimKaplar: 'Usisahau kupumzika kidogo na kuswali.',
    yatsi: 'Simamisha Swala ya Isha kabla ya kwenda kulala.',
    muhasebeTek: '{vakit} inaonekana haijawekwa alama leo.',
    muhasebeCoklu: cogul({ one: 'Swala {n} inaonekana haijawekwa alama leo.', other: 'Swala {n} zinaonekana hazijawekwa alama leo.' }),
    geceCapasi: 'Saa za utulivu zinaanza baada ya dakika {süre}. Simamisha Swala ya {vakit} kabla ya kwenda kulala.',
    kuslukSuruyor: 'Wakati wa Dhuha unaendelea.',
    kuslukGirdi: 'Wakati wa Dhuha umeingia. Ni wakati mzuri wa rakaa mbili.',
    kuslukBitiyor: cogul({ one: 'Imebaki dakika {n} katika wakati wa Dhuha.', other: 'Zimebaki dakika {n} katika wakati wa Dhuha.' }),
    evvabinSuruyor: 'Bado kuna muda wa Awwabin.',
    evvabinGirdi: 'Wakati wa Awwabin. Ni wakati mzuri wa rakaa mbili.',
    evvabinKalan: cogul({ one: 'Imebaki dakika {n} kwa Awwabin.', other: 'Zimebaki dakika {n} kwa Awwabin.' }),
    teheccudSonUcte: 'Wakati wa Tahajjud. Theluthi ya mwisho ya usiku imeingia.',
    teheccudKalan: cogul({ one: 'Wakati wa Tahajjud. Imebaki dakika {n} hadi Alfajiri.', other: 'Wakati wa Tahajjud. Zimebaki dakika {n} hadi Alfajiri.' }),
  },
};
