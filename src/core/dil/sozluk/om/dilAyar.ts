import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** `dilAdlari`: CLDR `om` adları; CLDR'de olmayanlar (ps, ckb, ug, kk, ky, tg, so, ff, yo) "Afaan …" kalıbıyla yazıldı; zh CLDR'de İngilizce ("Chinese Salphifame") → "Afaan Chaayinaa Salphifame"; dalga 11 dillerinden CLDR'de olmayanlar (ku, tt, sd) İngilizce kaldı. */
export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Afaan · Language',
  aciklama: "Afaan appichaa filadhaa. Beeksisniifi sagaleen dubbisuunis isa fayyadamu.",
  grup: 'Afaan appichaa',
  dilAdlari: { tr: 'Afaan Turkii', en: 'Afaan Ingilizii', id: 'Afaan Indoneziya', de: 'Afaan Jarmanii', fr: 'Afaan Faransaayii', bs: 'Afaan Bosniyaa', ru: 'Afaan Rushiyaa', ms: 'Malaayiffaa', ar: 'Arabiffaa', ur: 'Afaan Urdu', es: 'Afaan Ispeen', nl: 'Afaan Dachii', sq: 'Afaan Albaniyaa', hi: 'Afaan Hindii', bn: 'Afaan Baangladeshi', fa: 'Afaan Persia', ps: 'Afaan Pashtoo', ckb: 'Kurdii Giddugaleessaa', ug: 'Afaan Uyghurii', az: 'Afaan Azerbaijani', uz: 'Afaan Uzbek', kk: 'Afaan Qazaakii', ky: 'Afaan Kirgiizii', tg: 'Afaan Taajikii', sw: 'Suwahilii', ha: 'Hawusaa', am: 'Afaan Amaaraa', om: 'Oromoo', so: 'Afaan Somaalii', ff: 'Afaan Pular', yo: 'Afaan Yoorubaa', zh: 'Afaan Chaayinaa Salphifame', ta: 'Afaan Tamilii', ml: 'Malayaalamiffaa', th: 'Afaan Tayii', ko: 'Afaan Korea', vi: 'Afaan Veetinam', pt: 'Afaan Porchugaal', it: 'Afaan Xaaliyaani', sv: 'Afaan Suwidiin', uk: 'Afaan Ukreenii', ro: 'Afaan Romaniyaa', hr: 'Afaan Croatian', sr: 'Afaan Serbiya', el: 'Afaan Giriiki', ku: 'Kurdish (Kurmancî)', tk: 'Lammii Turkii', tt: 'Tatar', sd: 'Sindhi', pl: 'Afaan Polandii', ja: 'Afaan Japanii', gu: 'Afaan Gujarati', bg: 'Afaan Bulgariya', mk: 'Afaan Macedooniyaa', fil: 'Afaan Filippinii', te: 'Afaan Telugu', kn: 'Afaan Kannada', mr: 'Afaan Maratii', pa: 'Afaan Punjabii (Arabiffa, Paakistaan)', as: 'Assamese', ne: 'Afaan Nepalii', si: 'Afaan Sinhalese', km: 'Khmer', he: 'Afaan Hebrew', ka: 'Afaan Georgian', lt: 'Afaan Liituniyaa', mg: 'Malagasy', lg: 'Ganda', rw: 'Kinyarwanda', rn: 'Rundi', ln: 'Lingala', dag: 'Dagbani', mos: 'Mossi', aa: 'Afar', mdh: 'Maguindanao', ak: 'Akan', ceb: 'Kubuwanoo', nqo: 'N’Ko' },
  cihazDili: 'Afaan meeshaa',
  cihazDiliKullaniliyor: 'Amma {ad}',
  cihazDiliDesteklenmiyor: 'Afaan meeshaa keessanii ammaaf hin jiru; Afaan Turkii fayyadamama.',
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: "Hiikkaaleen Beta ilaalamaa jiru; barreeffamni tokko tokko guutuu ta'uu dhiisuu danda'a.",
    vakit: 'Afaan jijjiiruun akkaataa yeroon salaataa itti herregamu hin jijjiiru.',
    nass: "Afaanota Afaan Turkii ala jiran keessatti hiikkaan Qur'aanaa qofa mul'ata; barreeffamni hadiisaa madda Afaan Turkii irraa waan dhufuuf hin mul'atu.",
  },
  ozelAnons: {
    baslik: 'Barreeffamoota sagaleen dubbifamuu isin barreessitan',
    govde: cogul({
      one: "Barreeffamni sagaleen dubbifamu isin barreessitan {n} ammallee afaan duraanii keessa jira. Barreeffama qophaa'e afaan haaraatiin bakka buusuu barbaadduu?",
      other: "Barreeffamoonni sagaleen dubbifaman isin barreessitan {n} ammallee afaan duraanii keessa jiru. Barreeffamoota qophaa'an afaan haaraatiin bakka buusuu barbaadduu?",
    }),
    degistir: "Barreeffama qophaa'een bakka buusaa",
    koru: 'Akkuma jirutti dhiisaa',
    degisti: cogul({ one: "Barreeffamni {n} bakka bu'eera.", other: "Barreeffamoonni {n} bakka bu'aniiru." }),
  },
  vakitAdlari: {
    baslik: 'Maqaa salaataa',
    aciklama: 'Yeroon salaataa akkamitti akka moggaafamu filadhaa.',
    otomatik: 'Akka biyyaatti',
    otomatikAciklama: "Maqaalee biyya bakka keessanii keessatti baratamoo ta'an fayyadama.",
    takimlar: { temel: 'Maqaalee Arabaa', diyanetDe: 'Diyanet (Afaan Jarmanii)', turkce: 'Maqaalee Turkii', magrip: 'Barreeffama Magrib', cezayir: 'Barreeffama Aljeeriyaa', afgan: 'Maqaalee Afgaanistaan' },
  },
  yazi: {
    baslik: 'Qubee',
    aciklama: 'Barreeffamni qubee kamiin akka barreeffamu filadhaa.',
    otomatik: 'Akka biyyaatti',
    otomatikAciklama: "Qubee biyya bakka keessanii keessatti baratamaa ta'e fayyadama.",
    latin: 'Qubee Laatinii',
    kiril: 'Qubee Siriilikii',
  },
  kaydedilemedi: "Afaan olkaa'uun hin danda'amne. Irra deebi'aa yaalaa.",
  sihirbazBaglantisi: 'Afaan · Language',
  sihirbazBaglantisiAciklama: 'Afaan appichaa jijjiiraa',
};
