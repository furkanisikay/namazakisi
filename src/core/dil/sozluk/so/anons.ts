import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Codsiga cibaadada: toos ah, gaaban; sujuud laguma amro. Tartibku wuxuu la mid yahay qaababka Turkiga. */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'haray', girisindenItibaren: 'dhaafay' },
  cip: { vakit: 'Magaca salaadda', sure: 'Daqiiqado', yon: 'haray / dhaafay', cuma: 'Jimce', yatsi: 'Cishe' },
  sablon: {
    muhafizCikis: [
      'Waqtiga {vakit} wuu dhammaanayaa, {süre} daqiiqo ayaa haray.',
      'Ha ka tagin {vakit}, {süre} daqiiqo ayaa haray.',
      'Waqtigu wuu yaraanayaa, {süre} daqiiqo ayaa u hartay dhammaadka {vakit}.',
    ],
    muhafizGiris: [
      'Waqtiga {vakit} waa galay, {süre} daqiiqo ayaa dhaafay.',
      'Dib ha u dhigin {vakit}, {süre} daqiiqo ayaa dhaafay.',
      'Waqtigu wuu socdaa, oog salaadda {vakit}, {süre} daqiiqo ayaa dhaafay.',
    ],
    nafile: [
      'Waqtiga {vakit}, {süre} daqiiqo {yön}. Waa xilli wanaagsan oo laba rakco ah.',
      'Waqtiga {vakit} wuu socdaa. Waa fursad wanaagsan oo aad laba rakco ku tukato.',
      '{süre} daqiiqo {yön} waqtiga {vakit}.',
    ],
    cuma: [
      '{süre} daqiiqo ayaa u hartay Jimce. Diyaar garow oo u dhaqaaq masjidka.',
      'Jimce wuu soo dhowaanayaa, {süre} daqiiqo ayaa haray.',
      'Gaar khudbadda, {süre} daqiiqo ayaa u hartay Jimce.',
    ],
    camiyeGit: [
      '{süre} daqiiqo ayaa u hartay {vakit}. U dhaqaaq masjidka.',
      'Waa waqtigii masjidka loo socdo, {süre} daqiiqo ilaa {vakit}.',
      'U dhaqaaq masjidka salaadda {vakit}.',
    ],
    yatis: ['Tuko Cishe intaadan seexan.', 'Waqtiga Cishe weli wuu socdaa, oog salaadda intaadan seexan.', 'Ha seexan intaadan tukan Cishe.'],
    takvim: [
      'Dhacdo jadwalkaaga ku jirta ayaa ku beegan waqtiga {vakit}.',
      'Waqtiga {vakit} wuxuu ku beegan yahay dhacdo; ha ilaawin inaad marka hore tukato.',
      '{süre} daqiiqo kadib waqtiga {vakit} wuxuu ku beegan yahay dhacdadaada; ha ilaawin salaaddaada.',
    ],
  },
  otomatik: {
    cuma: '{sure} ayaa u hartay Duhur ee Jimce. Diyaar garow oo u dhaqaaq masjidka.',
    camiyeGiris: '{sure} ayaa u hartay {vakit}.',
    camiyeHazirlan: 'Diyaar garow oo u dhaqaaq masjidka.',
    camiyeYola: 'U dhaqaaq masjidka.',
    takvimGiris: 'Dhacdo jadwalkaaga ku jirta ayaa ku beegan waqtiga {vakit}.',
    takvimOnce: 'Ha ilaawin inaad tukato ka hor dhacdada.',
    takvimKaplar: 'Ha ilaawin inaad nasasho qaadato oo tukato.',
    yatsi: 'Tuko Cishe intaadan seexan.',
    muhasebeTek: '{vakit} maanta uma muuqato mid la calaamadeeyay.',
    muhasebeCoklu: cogul({ one: '{n} salaad maanta uma muuqato mid la calaamadeeyay.', other: '{n} salaadood maanta uma muuqdaan kuwo la calaamadeeyay.' }),
    geceCapasi: 'Saacadaha aamusnaantu waxay bilaabanayaan {süre} daqiiqo kadib. Tuko {vakit} intaadan seexan.',
    kuslukSuruyor: 'Waqtiga Duxaa wuu socdaa.',
    kuslukGirdi: 'Waqtiga Duxaa waa galay. Waa xilli wanaagsan oo laba rakco ah.',
    kuslukBitiyor: cogul({ one: '{n} daqiiqo ayaa ka hartay waqtiga Duxaa.', other: '{n} daqiiqo ayaa ka hartay waqtiga Duxaa.' }),
    evvabinSuruyor: 'Weli waqti ayaa u haray Awaabiin.',
    evvabinGirdi: 'Waqtiga Awaabiin. Waa xilli wanaagsan oo laba rakco ah.',
    evvabinKalan: cogul({ one: '{n} daqiiqo ayaa u hartay Awaabiin.', other: '{n} daqiiqo ayaa u hartay Awaabiin.' }),
    teheccudSonUcte: 'Waqtiga Tahajjud. Saddex meelood meel ee ugu dambeysa habeenka waa bilaabatay.',
    teheccudKalan: cogul({ one: 'Waqtiga Tahajjud. {n} daqiiqo ayaa u hartay Subax.', other: 'Waqtiga Tahajjud. {n} daqiiqo ayaa u hartay Subax.' }),
  },
};
