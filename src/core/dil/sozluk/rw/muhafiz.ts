import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Guhamagarira iswala mu Kinyarwanda: itegeko rigufi ribwira umuntu umwe (u-…, «Hagurukira iswala»,
 * «Ntucyereze»), nk’uko QuranEnc 17:78 na 11:114 bivuga «Ujye uhozaho iswala»; ahandi muri porogaramu
 * ni ubwubahane (mu-…-e). Nta «!».
 * «Gupfukama/kubama» ntibyandikwa (secde ni igice cy’iswala) → «hagurukira iswala».
 * Mu mutwe, umunota wandikwa «min» ufatanye n’umubare: «Adhuhuri · 45min» ikwirwa mu nyuguti 16.
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: '{ad} · {dk}min irashize · igihe cy’iswala ⏰',
    giris2: '{ad} · {dk}min irashize · ntucyereze iswala ⚠️',
    giris3: '{ad} · {dk}min irashize · iswala iragutegereje 🔥',
    giris4: '{ad} · {dk}min irashize · HAGURUKIRA ISWALA 🚨',
    erken3: '{ad} · {dk}min isigaye · iswala iragutegereje 🔥',
    erken4: '{ad} · {dk}min isigaye · HAGURUKIRA ISWALA 🚨',
    cikis1: '{ad} · {dk}min isigaye ⏰',
    cikis2: '{ad} · {dk}min · igihe kiragabanuka ⚠️',
    cikis3: '{ad} · {dk}min · igihe kirashira 🔥',
    cikis4: '{ad} · {dk}min · IGIHE KIRARANGIRA 🚨',
  },
  girisHavuzu: {
    s1: ['Ni igihe cy’iswala; sali ukiri mu mahirwe.', 'Sali igihe kikikwemerera; ntubisubike.'],
    s2: ['Uko ubisubika, ni ko biremera; ntutegereze impera y’igihe ngo usali.', 'Igihe kirakomeza — sali ubu.'],
    s3: [
      'Uko ucyereza, ni ko wegera kuyicikanwa; sali ubu.',
      'Ntuvuge ngo «Nzasali nyuma»; ushobora gusali ubu.',
      'Haguruka ubu aho kuvuga ngo «iyo mbimenya» mu minota mike.',
    ],
    s4: ['Ntwongere gucyereza iswala — hagurukira iswala ubu.', 'Rekera aho ibyo ukora maze uhagurukire iswala.'],
  },
  govde: {
    s1: 'Igihe gitangiye kugabanuka; sali ukiri mu mahirwe.',
    s2: 'Ntutegereze impera y’igihe ngo usali; ubu ni igihe cyiza cyo gusali.',
    s3: 'Igihe kigiye gushira; uracyashobora gusali ubu.',
    s4: 'Niba wasali, kanda «Nasali»; niba utarasali, hagurukira iswala ubu.',
  },
  serit: {
    giris4: 'NTUCYEREZE ISWALA. Hagurukira iswala ubu. (hashize {dk} min)',
    giris2: 'Igihe kirakomeza; ntutegereze impera y’igihe ngo usali. (hashize {dk} min)',
    giris1: cogul({ one: 'Hashize iminota {n} igihe cy’iswala gitangiye.', other: 'Hashize iminota {n} igihe cy’iswala gitangiye.' }),
    erken4: 'Ntucyereze iswala; hagurukira iswala ubu. (hasigaye {dk} min)',
    cikis4: 'IGIHE KIRARANGIRA. Hagurukira iswala ubu. (hasigaye {dk} min)',
    cikis2: 'Igihe kiragabanuka; ntutegereze impera y’igihe ngo usali. (hasigaye {dk} min)',
    cikis1: cogul({ one: 'Hasigaye iminota {n} ngo igihe cy’iswala kirangire.', other: 'Hasigaye iminota {n} ngo igihe cy’iswala kirangire.' }),
  },
  geceCapasi: {
    baslik: '{ad} · sali mbere yo gusinzira ⏰',
    govde: 'Amasaha y’ituze atangira mu minota {dk}; sali Isha mbere yo kuryama.',
  },
  icerik: {
    firsat: 'Igihe gitangiye kugabanuka; sali ukiri mu mahirwe.',
    sonaBirakma: 'Ntutegereze impera y’igihe ngo usali; ubu ni igihe cyiza cyo gusali.',
    fisilti: 'Ntuvuge ngo «Nzasali nyuma»; igihe kigiye gushira, ushobora gusali ubu.',
    omur: 'Igihe kirahita; uracyafite amahirwe yo gusali iyi swala ku gihe cyayo.',
    keske: 'Haguruka ubu aho kuvuga ngo «iyo mbimenya» mu minota mike.',
    namazaDur: 'Niba wasali, kanda «Nasali»; niba utarasali, hagurukira iswala ubu.',
    sonDakika: 'Iminota ya nyuma. Rekera aho ibyo ukora maze uhagurukire iswala.',
  },
};
