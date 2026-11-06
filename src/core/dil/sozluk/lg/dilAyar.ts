import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Olulimi · Language',
  aciklama: 'Londa olulimi lwa app. Obubaka n’okusoma mu ddoboozi nabyo bilukozesa.',
  grup: 'Olulimi lwa app',
  dilAdlari: { tr: 'Lutake', en: 'Lungereza', id: 'Luyindonezya', de: 'Ludaaki', fr: 'Lufalansa', bs: 'Bosnian', ru: 'Lulasa', ms: 'Lumalayi', ar: 'Luwarabu', ur: 'Lu-urudu', es: 'Lusipanya', nl: 'Luholandi', sq: 'Albanian', hi: 'Luhindu', bn: 'Lubengali', fa: 'Luperusi', ps: 'Pashto', ckb: 'Central Kurdish', ug: 'Uyghur', az: 'Azerbaijani', uz: 'Uzbek', kk: 'Kazakh', ky: 'Kyrgyz', tg: 'Tajik', sw: 'Swahili', ha: 'Luhawuza', am: 'Lu-amhariki', om: 'Oromo', so: 'Lusomaliya', ff: 'Fula', yo: 'Luyoruba', zh: 'Lucayina', ta: 'Lutamiiru', ml: 'Malayalam', th: 'Luttaayi', ko: 'Lukoreya', vi: 'Luvyetinaamu', pt: 'Lupotugiizi', it: 'Luyitale', sv: 'Luswideni', uk: 'Luyukurayine', ro: 'Lulomaniya', hr: 'Croatian', sr: 'Serbian', el: 'Lugereeki/Luyonaani', ku: 'Kurdish (Kurmancî)', tk: 'Turkmen', tt: 'Tatar', sd: 'Sindhi', pl: 'Lupolandi', ja: 'Lujapani', gu: 'Gujarati', bg: 'Lubulugariya', mk: 'Macedonian', fil: 'Filipino', te: 'Telugu', kn: 'Kannada', mr: 'Marathi', pa: 'Lupunjabi (Pakisitaani)', as: 'Assamese', ne: 'Lunepali', si: 'Sinhala', km: 'Lukme', he: 'Hebrew', ka: 'Georgian', lt: 'Lithuanian', mg: 'Malagasy', lg: 'Luganda', rw: 'Lunarwanda', rn: 'Rundi', ln: 'Lingala', dag: 'Dagbani', mos: 'Mossi', aa: 'Afar', mdh: 'Maguindanao', ak: 'Lu-akaani', ceb: 'Cebuano', nqo: 'N’Ko' },
  cihazDili: 'Olulimi lw’essimu',
  cihazDiliKullaniliyor: 'Kati {ad}',
  cihazDiliDesteklenmiyor: 'Olulimi lw’essimu yo terunnaba kufunika; Olutake lwe lukozesebwa.',
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'Enkyusa za Beta zikyakeberebwa; ebigambo ebimu biyinza obutaba bituufu ddala.',
    vakit: 'Olulimi terukyusa ngeri biseera by’esswala gye bibalibwamu.',
    nass: 'Mu nnimi endala ezitali Lutake, enkyusa za Kulaani zokka ze zirabika; ebiwandiiko bya hadiisi biva mu nsibuko ey’Olutake, n’olwekyo tebirabika.',
  },
  ozelAnons: {
    baslik: 'Ebiwandiiko by’okusoma mu ddoboozi bye wawandiika',
    govde: cogul({
      one: 'Ekiwandiiko {n} eky’okusoma mu ddoboozi kye wawandiika kikyali mu lulimi olwasooka. Kikyuse n’ekiwandiiko ekyategekebwa mu lulimi olupya?',
      other: 'Ebiwandiiko {n} eby’okusoma mu ddoboozi bye wawandiika bikyali mu lulimi olwasooka. Bikyuse n’ebiwandiiko ebyategekebwa mu lulimi olupya?',
    }),
    degistir: 'Kyusa n’ekyategekebwa',
    koru: 'Leka bwe kiri',
    degisti: cogul({ one: 'Ekiwandiiko {n} kikyusiddwa.', other: 'Ebiwandiiko {n} bikyusiddwa.' }),
  },
  vakitAdlari: {
    baslik: 'Amannya g’esswala',
    aciklama: 'Londa engeri ebiseera by’esswala gye biyitibwamu.',
    otomatik: 'Okusinziira ku nsi',
    otomatikAciklama: 'Ekozesa amannya agamanyiddwa mu nsi gy’oli.',
    takimlar: { temel: 'Amannya ag’Oluwarabu', diyanetDe: 'Diyanet (Ludaaki)', turkce: 'Amannya ag’Olutake', magrip: 'Empandiika ya Maghreb', cezayir: 'Empandiika ya Algeria', afgan: 'Amannya ga Afghanistan' },
  },
  yazi: {
    baslik: 'Ennukuta',
    aciklama: 'Londa ennukuta ebiwandiiko mwe biwandiikibwa.',
    otomatik: 'Okusinziira ku nsi',
    otomatikAciklama: 'Ekozesa ennukuta ezimanyiddwa mu nsi gy’oli.',
    latin: 'Ennukuta za Latin',
    kiril: 'Ennukuta za Cyrillic',
  },
  kaydedilemedi: 'Olulimi terusobodde kuterekebwa. Ddamu ogezeeko.',
  sihirbazBaglantisi: 'Olulimi · Language',
  sihirbazBaglantisiAciklama: 'Kyusa olulimi lwa app',
};
