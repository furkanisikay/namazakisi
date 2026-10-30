import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı: tekil emir, kısa; secde ifadesi yok. Takvim şablonları (kullanıcıyı
 * yöneten bilgi) kibar çoğul. Sıra Türkçe şablonlarla BİREBİR eşleşir; jetonlar aynı.
 */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'hafe', girisindenItibaren: 'darbe' },
  cip: { vakit: 'Maqaa salaataa', sure: 'Daqiiqaa', yon: 'hafe / darbe', cuma: 'Jimaata', yatsi: "Ishaa'ii" },
  sablon: {
    muhafizCikis: [
      'Yeroon {vakit} xumuramaa jira, daqiiqaan {süre} hafe.',
      '{vakit} hin dabarsin, daqiiqaan {süre} hafeera.',
      'Yeroon gabaabbachaa jira, hanga {vakit} xumuramutti daqiiqaa {süre}.',
    ],
    muhafizGiris: [
      'Yeroon {vakit} gaheera, daqiiqaan {süre} darbeera.',
      '{vakit} hin tursiin, daqiiqaan {süre} darbeera.',
      "Yeroon darbaa jira, {vakit}f dhaabadhu, daqiiqaa {süre} ta'eera.",
    ],
    nafile: [
      "Yeroo {vakit}, daqiiqaa {süre} {yön}. Raka'aa lamaaf yeroo gaarii dha.",
      "Yeroon {vakit} itti fufaa jira. Raka'aa lama salaatuuf carraa gaarii dha.",
      '{vakit}f daqiiqaa {süre} {yön}.',
    ],
    cuma: [
      "Hanga salaata Jimaataatti daqiiqaan {süre} hafeera. Qophaa'iitii gara masjiidaa deemi.",
      'Yeroon Jimaataa dhiyaachaa jira, daqiiqaan {süre} hafeera.',
      'Khutbaa gahi, hanga Jimaataatti daqiiqaan {süre} hafeera.',
    ],
    camiyeGit: [
      'Hanga yeroo {vakit}tti daqiiqaan {süre} hafeera. Gara masjiidaa deemi.',
      'Yeroo gara masjiidaa deemuu ti, hanga {vakit}tti daqiiqaa {süre}.',
      'Salaata {vakit}f gara masjiidaa deemi.',
    ],
    yatis: ["Osoo hin ciisin Ishaa'ii salaati.", "Yeroon Ishaa'ii itti fufaa jira, osoo hin rafin salaataaf dhaabadhu.", "Osoo Ishaa'ii hin salaatin hin rafin."],
    takvim: [
      'Taateen kaalaandara keessanii tokko yeroo {vakit} wajjin wal qabata.',
      'Yeroon {vakit} taatee tokko wajjin wal qabata; dursitanii salaatuu hin dagatinaa.',
      'Daqiiqaa {süre} booda yeroon {vakit} taatee keessan wajjin wal qabata; salaata hin dagatinaa.',
    ],
  },
  otomatik: {
    cuma: "Hanga Zuhrii Jimaataatti {sure}. Qophaa'iitii gara masjiidaa deemi.",
    camiyeGiris: 'Hanga {vakit}tti {sure}.',
    camiyeHazirlan: "Qophaa'iitii gara masjiidaa deemi.",
    camiyeYola: 'Gara masjiidaa deemi.',
    takvimGiris: 'Taateen kaalaandara keessanii tokko yeroo {vakit} wajjin wal qabata.',
    takvimOnce: 'Taatee dura salaatuu hin dagatinaa.',
    takvimKaplar: 'Boqonnaa fudhattanii salaatuu hin dagatinaa.',
    yatsi: "Osoo hin ciisin Ishaa'ii salaati.",
    muhasebeTek: "Har'a {vakit} hin mallattoofne fakkaata.",
    muhasebeCoklu: cogul({ one: "Har'a salaanni {n} hin mallattoofne fakkaata.", other: "Har'a salaanni {n} hin mallattoofne fakkaata." }),
    geceCapasi: "Sa'aatiin callisaa daqiiqaa {süre} booda jalqaba. Osoo hin ciisin {vakit} salaati.",
    kuslukSuruyor: 'Yeroon Duhaa itti fufaa jira.',
    kuslukGirdi: "Yeroon Duhaa gaheera. Raka'aa lamaaf yeroo gaarii dha.",
    kuslukBitiyor: cogul({ one: 'Yeroo Duhaa keessaa daqiiqaan {n} hafeera.', other: 'Yeroo Duhaa keessaa daqiiqaan {n} hafeera.' }),
    evvabinSuruyor: 'Awwaabiiniif ammallee yeroon jira.',
    evvabinGirdi: "Yeroo Awwaabiin. Raka'aa lamaaf yeroo gaarii dha.",
    evvabinKalan: cogul({ one: 'Awwaabiiniif daqiiqaan {n} hafeera.', other: 'Awwaabiiniif daqiiqaan {n} hafeera.' }),
    teheccudSonUcte: 'Yeroo Tahajjudii. Harki sadaffaan dhumaa halkanii jalqabeera.',
    teheccudKalan: cogul({ one: 'Yeroo Tahajjudii. Hanga Subhiitti daqiiqaan {n} hafeera.', other: 'Yeroo Tahajjudii. Hanga Subhiitti daqiiqaan {n} hafeera.' }),
  },
};
