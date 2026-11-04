import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Ziman · Language',
  aciklama: 'Zimanê sepanê hilbijêrin. Agahdarî û bi deng xwendin jî wî bi kar tînin.',
  grup: 'Zimanê sepanê',
  cihazDili: 'Zimanê cîhazê',
  dilAdlari: { tr: 'Tirkî', en: 'Îngilîzî', id: 'Endonezyayî', de: 'Almanî', fr: 'Fransizî', bs: 'Bosnî', ru: 'Rûsî', ms: 'Malezî', ar: 'Erebî', ur: 'Urdûyî', es: 'Spanî', nl: 'Holendî', sq: 'Arnawidî', hi: 'Hindî', bn: 'Bengalî', fa: 'Farisî', ps: 'Peştûyî', ckb: 'Kurdî (Soranî)', ug: 'Oygurî', az: 'Azerî', uz: 'Ozbekî', kk: 'Qazaxî', ky: 'Kirgizî', tg: 'Tacikî', sw: 'Swahîlî', ha: 'Hawsayî', am: 'Amharî', om: 'Oromoyî', so: 'Somalî', ff: 'Fulahî', yo: 'Yorubayî', zh: 'Çînîya sadekirî', ta: 'Tamîlî', ml: 'Malayalamî', th: 'Tayî', ko: 'Koreyî', vi: 'Vîetnamî', pt: 'Portugalî', it: 'Îtalî', sv: 'Swêdî', uk: 'Ukraynî', ro: 'Romanî', hr: 'Xirwatî', sr: 'Sirbî', el: 'Yûnanî', ku: 'Kurdî (Kurmancî)', tk: 'Tirkmenî', tt: 'Teterî', sd: 'Sindhî', pl: 'Polonî', ja: 'Japonî', gu: 'Gujaratî', bg: 'Bulgarî', mk: 'Makedonî', fil: 'Fîlîpînoyî', te: 'Telûgûyî', kn: 'Kannadayî', mr: 'Maratî', pa: 'Puncabî (erebî, Pakistan)', as: 'Asamî', ne: 'Nepalî', si: 'Kîngalî', km: 'Ximêrî' },
  cihazDiliKullaniliyor: 'Niha {ad}',
  cihazDiliDesteklenmiyor: 'Zimanê cîhaza we hîn tune; Tirkî tê bikaranîn.',
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'Wergerên beta têne venêrîn; dibe ku hin nivîs ne bêkêmasî bin.',
    vakit: 'Ziman awayê hesabkirina demên nimêjê naguherîne.',
    nass: 'Di zimanên ji bilî Tirkî de tenê wergerên Quranê têne nîşandan; nivîsên hedîsan ji çavkaniyeke Tirkî ne, ji ber vê nayên nîşandan.',
  },
  ozelAnons: {
    baslik: 'Nivîsên bi deng xwendinê yên ku we nivîsîn',
    govde: cogul({
      one: '{n} nivîsa bi deng xwendinê ya ku we nivîsî hîn bi zimanê berê ye. Bila bi nivîsa amade ya zimanê nû were guhertin?',
      other: '{n} nivîsên bi deng xwendinê yên ku we nivîsîn hîn bi zimanê berê ne. Bila bi nivîsên amade yên zimanê nû werin guhertin?',
    }),
    degistir: 'Bi nivîsa amade biguherînin',
    koru: 'Wekî xwe bihêlin',
    degisti: cogul({ one: '{n} nivîs hate guhertin.', other: '{n} nivîs hatin guhertin.' }),
  },
  vakitAdlari: {
    baslik: 'Navên nimêjan',
    aciklama: 'Hilbijêrin ka demên nimêjê çawa bên binavkirin.',
    otomatik: 'Li gorî welat',
    otomatikAciklama: 'Navên ku li welatê cihê we berbelav in bi kar tîne.',
    takimlar: { temel: 'Navên Erebî', diyanetDe: 'Diyanet (Almanî)', turkce: 'Navên Tirkî', magrip: 'Rastnivîsa Mexribê', cezayir: 'Rastnivîsa Cezayîrê', afgan: 'Navên Afganî' },
  },
  yazi: {
    baslik: 'Alfabe',
    aciklama: 'Hilbijêrin ka nivîs bi kîjan alfabeyê were nivîsîn.',
    otomatik: 'Li gorî welat',
    otomatikAciklama: 'Alfabeya ku li welatê cihê we berbelav e bi kar tîne.',
    latin: 'Alfabeya latînî',
    kiril: 'Alfabeya kirîlî',
  },
  kaydedilemedi: 'Ziman nehate tomarkirin. Dîsa biceribînin.',
  sihirbazBaglantisi: 'Ziman · Language',
  sihirbazBaglantisiAciklama: 'Zimanê sepanê biguherînin',
};
