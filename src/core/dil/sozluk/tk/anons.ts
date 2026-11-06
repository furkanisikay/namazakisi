import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Ybadata çagyryş: "sen" + gysga buýruk; "sejde et" ýazylmaýar (namaza dur). Tertip türkçe şablonlar bilen BIREBIR. */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'galdy', girisindenItibaren: 'geçdi' },
  cip: { vakit: 'Namazyň ady', sure: 'Minut', yon: 'galdy / geçdi', cuma: 'Juma', yatsi: 'Ýassy' },
  sablon: {
    muhafizCikis: [
      '{vakit} wagty çykýar, {süre} minut galdy.',
      '{vakit} namazyny gaçyrma, {süre} minut galdy.',
      'Wagt daralýar, {vakit} wagtynyň çykmagyna {süre} minut galdy.',
    ],
    muhafizGiris: [
      '{vakit} wagty girdi, {süre} minut geçdi.',
      '{vakit} namazyny gijikdirme, {süre} minut geçdi.',
      'Wagt geçýär, {vakit} namazyna dur, {süre} minut boldy.',
    ],
    nafile: [
      '{vakit} wagty, {süre} minut {yön}. Iki rekagat üçin gowy pursat.',
      '{vakit} wagty dowam edýär. Iki rekagat okamak üçin gowy mümkinçilik.',
      '{vakit} üçin {süre} minut {yön}.',
    ],
    cuma: [
      'Juma namazyna {süre} minut galdy. Taýýarlan, metjide ugra.',
      'Juma ýakynlaşýar, {süre} minut galdy.',
      'Hutba ýetiş, juma namazyna {süre} minut galdy.',
    ],
    camiyeGit: [
      '{vakit} namazyna {süre} minut galdy. Metjide ugra.',
      'Metjide gitmegiň wagty, {vakit} namazyna {süre} minut.',
      '{vakit} namazy üçin metjide ugra.',
    ],
    yatis: [
      'Ýatmazdan öň ýassy namazyny oka.',
      'Ýassy wagty entek dowam edýär, uklamazdan öň namaza dur.',
      'Ýassy namazyny okamazdan ýatma.',
    ],
    takvim: [
      'Senenamaňdaky bir çäre {vakit} wagtyna gabat gelýär.',
      '{vakit} wagty bir çäre bilen gabat gelýär; ilki namazyňy okamagy unutma.',
      '{süre} minutdan {vakit} wagty çäräň bilen gabat gelýär; namazyňy unutma.',
    ],
  },
  otomatik: {
    cuma: 'Juma üçin öýle wagtyna {sure} galdy. Taýýarlan, metjide ugra.',
    camiyeGiris: '{vakit} namazyna {sure} galdy.',
    camiyeHazirlan: 'Taýýarlan, metjide ugra.',
    camiyeYola: 'Metjide ugra.',
    takvimGiris: 'Senenamaňdaky bir çäre {vakit} wagtyna gabat gelýär.',
    takvimOnce: 'Çäreden öň namazyňy okamagy unutma.',
    takvimKaplar: 'Arakesme edip namazyňy okamagy unutma.',
    yatsi: 'Ýatmazdan öň ýassy namazyny oka.',
    muhasebeTek: 'Şu gün {vakit} bellenmedik ýaly görünýär.',
    muhasebeCoklu: cogul({ one: 'Şu gün {n} namaz bellenmedik ýaly görünýär.', other: 'Şu gün {n} namaz bellenmedik ýaly görünýär.' }),
    geceCapasi: '{süre} minutdan sessiz sagatlar başlaýar. Ýatmazdan öň {vakit} namazyny oka.',
    kuslukSuruyor: 'Duha wagty dowam edýär.',
    kuslukGirdi: 'Duha wagty girdi. Iki rekagat üçin gowy pursat.',
    kuslukBitiyor: cogul({ one: 'Duha wagtynyň gutarmagyna {n} minut galdy.', other: 'Duha wagtynyň gutarmagyna {n} minut galdy.' }),
    evvabinSuruyor: 'Ewwabin üçin entek wagt bar.',
    evvabinGirdi: 'Ewwabin wagty. Iki rekagat üçin gowy pursat.',
    evvabinKalan: cogul({ one: 'Ewwabin üçin {n} minut galdy.', other: 'Ewwabin üçin {n} minut galdy.' }),
    teheccudSonUcte: 'Tehejjüd wagty. Gijäniň soňky üçden biri başlandy.',
    teheccudKalan: cogul({
      one: 'Tehejjüd wagty. Ertir namazyna {n} minut galdy.',
      other: 'Tehejjüd wagty. Ertir namazyna {n} minut galdy.',
    }),
  },
};
