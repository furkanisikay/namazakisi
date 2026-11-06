import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Dil adları CLDR lt ("turkų", "anglų"; "kalba" sözcüğü düşer), seçicide satır başı olduğu için büyük harfle. */
export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Kalba · Language',
  aciklama: 'Pasirinkite programos kalbą. Ja bus ir pranešimai, ir skaitymas garsiai.',
  grup: 'Programos kalba',
  dilAdlari: { tr: 'Turkų', en: 'Anglų', id: 'Indoneziečių', de: 'Vokiečių', fr: 'Prancūzų', bs: 'Bosnių', ru: 'Rusų', ms: 'Malajiečių', ar: 'Arabų', ur: 'Urdų', es: 'Ispanų', nl: 'Olandų', sq: 'Albanų', hi: 'Hindi', bn: 'Bengalų', fa: 'Persų', ps: 'Puštūnų', ckb: 'Soranių kurdų', ug: 'Uigūrų', az: 'Azerbaidžaniečių', uz: 'Uzbekų', kk: 'Kazachų', ky: 'Kirgizų', tg: 'Tadžikų', sw: 'Suahilių', ha: 'Hausų', am: 'Amharų', om: 'Oromų', so: 'Somaliečių', ff: 'Fulahų', yo: 'Jorubų', zh: 'Supaprastintoji kinų', ta: 'Tamilų', ml: 'Malajalių', th: 'Tajų', ko: 'Korėjiečių', vi: 'Vietnamiečių', pt: 'Portugalų', it: 'Italų', sv: 'Švedų', uk: 'Ukrainiečių', ro: 'Rumunų', hr: 'Kroatų', sr: 'Serbų', el: 'Graikų', ku: 'Kurdų (Kurmancî)', tk: 'Turkmėnų', tt: 'Totorių', sd: 'Sindų', pl: 'Lenkų', ja: 'Japonų', gu: 'Gudžaratų', bg: 'Bulgarų', mk: 'Makedonų', fil: 'Filipiniečių', te: 'Telugų', kn: 'Kanadų', mr: 'Maratų', pa: 'Pendžabų (arabų, Pakistanas)', as: 'Asamų', ne: 'Nepaliečių', si: 'Sinhalų', km: 'Khmerų', he: 'Hebrajų', ka: 'Gruzinų', lt: 'Lietuvių', mg: 'Malagasų', lg: 'Ganda', rw: 'Kinjaruandų', rn: 'Rundi', ln: 'Ngalų', dag: 'Dagbani', mos: 'Mosi', aa: 'Afarų', mdh: 'Maguindanao', ak: 'Akanų', ceb: 'Sebuanų', nqo: 'Enko' },
  cihazDili: 'Įrenginio kalba',
  cihazDiliKullaniliyor: 'Dabar: {ad}',
  cihazDiliDesteklenmiyor: 'Jūsų įrenginio kalbos dar nėra; naudojama turkų kalba.',
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'Beta vertimai peržiūrimi; kai kurie tekstai gali būti netobuli.',
    vakit: 'Kalba nekeičia maldų laikų skaičiavimo.',
    nass: 'Kitomis nei turkų kalbomis rodomi tik Korano vertimai; hadisų tekstai gaunami iš turkiško šaltinio, todėl nerodomi.',
  },
  ozelAnons: {
    baslik: 'Jūsų parašyti skaitymo garsiai tekstai',
    govde: cogul({
      one: '{n} jūsų parašytas skaitymo garsiai tekstas liko ankstesne kalba. Pakeisti jį paruoštu naujos kalbos tekstu?',
      few: '{n} jūsų parašyti skaitymo garsiai tekstai liko ankstesne kalba. Pakeisti juos paruoštais naujos kalbos tekstais?',
      many: '{n} jūsų parašyto skaitymo garsiai teksto liko ankstesne kalba. Pakeisti juos paruoštais naujos kalbos tekstais?',
      other: '{n} jūsų parašytų skaitymo garsiai tekstų liko ankstesne kalba. Pakeisti juos paruoštais naujos kalbos tekstais?',
    }),
    degistir: 'Pakeisti paruoštu tekstu',
    koru: 'Palikti, kaip yra',
    degisti: cogul({ one: 'Pakeistas {n} tekstas.', few: 'Pakeisti {n} tekstai.', many: 'Pakeista {n} teksto.', other: 'Pakeista {n} tekstų.' }),
  },
  vakitAdlari: {
    baslik: 'Maldų pavadinimai',
    aciklama: 'Pasirinkite, kokiais pavadinimais rašyti maldų laikus.',
    otomatik: 'Pagal šalį',
    otomatikAciklama: 'Naudojami pavadinimai, įprasti jūsų vietovės šalyje.',
    takimlar: { temel: 'Arabiški pavadinimai', diyanetDe: 'Diyanet (vokiečių)', turkce: 'Turkiški pavadinimai', magrip: 'Magribo rašyba', cezayir: 'Alžyro rašyba', afgan: 'Afganistano pavadinimai' },
  },
  yazi: {
    baslik: 'Abėcėlė',
    aciklama: 'Pasirinkite, kokia abėcėle rašyti tekstus.',
    otomatik: 'Pagal šalį',
    otomatikAciklama: 'Naudojama abėcėlė, įprasta jūsų vietovės šalyje.',
    latin: 'Lotynų abėcėlė',
    kiril: 'Kirilica',
  },
  kaydedilemedi: 'Nepavyko išsaugoti kalbos. Bandykite dar kartą.',
  sihirbazBaglantisi: 'Kalba · Language',
  sihirbazBaglantisiAciklama: 'Pakeisti programos kalbą',
};
