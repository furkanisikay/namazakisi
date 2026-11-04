// ÇEVİRİ: lt — İngilizce iskelet, çevrilince bu satır silinir
import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Kalba · Language',
  aciklama: 'Choose the app language. Notifications and read-aloud use it too.',
  grup: 'App language',
  dilAdlari: { tr: 'Turkų', en: 'Anglų', id: 'Indoneziečių', de: 'Vokiečių', fr: 'Prancūzų', bs: 'Bosnių', ru: 'Rusų', ms: 'Malajiečių', ar: 'Arabų', ur: 'Urdų', es: 'Ispanų', nl: 'Olandų', sq: 'Albanų', hi: 'Hindi', bn: 'Bengalų', fa: 'Persų', ps: 'Puštūnų', ckb: 'Soranių kurdų', ug: 'Uigūrų', az: 'Azerbaidžaniečių', uz: 'Uzbekų', kk: 'Kazachų', ky: 'Kirgizų', tg: 'Tadžikų', sw: 'Suahilių', ha: 'Hausų', am: 'Amharų', om: 'Oromų', so: 'Somaliečių', ff: 'Fulahų', yo: 'Jorubų', zh: 'Supaprastintoji kinų', ta: 'Tamilų', ml: 'Malajalių', th: 'Tajų', ko: 'Korėjiečių', vi: 'Vietnamiečių', pt: 'Portugalų', it: 'Italų', sv: 'Švedų', uk: 'Ukrainiečių', ro: 'Rumunų', hr: 'Kroatų', sr: 'Serbų', el: 'Graikų', ku: 'Kurdų (Kurmancî)', tk: 'Turkmėnų', tt: 'Totorių', sd: 'Sindų', pl: 'Lenkų', ja: 'Japonų', gu: 'Gudžaratų', bg: 'Bulgarų', mk: 'Makedonų', fil: 'Filipiniečių', te: 'Telugų', kn: 'Kanadų', mr: 'Maratų', pa: 'Pendžabų (arabų, Pakistanas)', as: 'Asamų', ne: 'Nepaliečių', si: 'Sinhalų', km: 'Khmerų', he: 'Hebrajų', ka: 'Gruzinų', lt: 'Lietuvių', mg: 'Malagasų', lg: 'Ganda', rw: 'Kinjaruandų', rn: 'Rundi', ln: 'Ngalų', dag: 'Dagbani', mos: 'Mosi', aa: 'Afarų', mdh: 'Maguindanao', ak: 'Akanų', ceb: 'Sebuanų', nqo: 'Enko' },
  cihazDili: 'Device language',
  cihazDiliKullaniliyor: 'Currently {ad}',
  cihazDiliDesteklenmiyor: "Your device language isn't available yet; Turkish is used.",
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'Beta translations are being reviewed; some text may be imperfect.',
    vakit: "The language doesn't change how prayer times are calculated.",
    nass: 'In languages other than Turkish, only Quran translations are shown; hadith texts come from a Turkish source, so they are not shown.',
  },
  ozelAnons: {
    baslik: 'Read-aloud texts you wrote',
    govde: cogul({
      one: '{n} read-aloud text you wrote is still in the previous language. Replace it with the ready-made text in the new language?',
      few: '{n} read-aloud texts you wrote are still in the previous language. Replace them with the ready-made texts in the new language?',
      many: '{n} read-aloud texts you wrote are still in the previous language. Replace them with the ready-made texts in the new language?',
      other: '{n} read-aloud texts you wrote are still in the previous language. Replace them with the ready-made texts in the new language?',
    }),
    degistir: 'Replace with ready-made text',
    koru: 'Keep as is',
    degisti: cogul({ one: '{n} text replaced.', few: '{n} texts replaced.', many: '{n} texts replaced.', other: '{n} texts replaced.' }),
  },
  vakitAdlari: {
    baslik: 'Prayer names',
    aciklama: 'Choose how prayer times are named.',
    otomatik: 'By country',
    otomatikAciklama: 'Uses the names common in the country of your location.',
    takimlar: { temel: 'Arabic names', diyanetDe: 'Diyanet (German)', turkce: 'Turkish names', magrip: 'Maghrebi spelling', cezayir: 'Algerian spelling', afgan: 'Afghan names' },
  },
  yazi: {
    baslik: 'Alphabet',
    aciklama: 'Choose which alphabet text is written in.',
    otomatik: 'By country',
    otomatikAciklama: 'Uses the alphabet common in the country of your location.',
    latin: 'Latin alphabet',
    kiril: 'Cyrillic alphabet',
  },
  kaydedilemedi: "The language couldn't be saved. Try again.",
  sihirbazBaglantisi: 'Kalba · Language',
  sihirbazBaglantisiAciklama: 'Change the app language',
};
