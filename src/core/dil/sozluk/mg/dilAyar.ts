import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Fiteny · Language',
  aciklama: "Fidio ny fitenin'ny fampiharana. Ampiasain'ny fampandrenesana sy ny famakiana mafy koa izy.",
  grup: "Fitenin'ny fampiharana",
  dilAdlari: { tr: 'Tiorka', en: 'Anglisy', id: 'Indonezianina', de: 'Alemanina', fr: 'Frantsay', bs: 'Bosnian', ru: 'Rosianina', ms: 'Malay', ar: 'Arabo', ur: 'Ordò', es: 'Espaniola', nl: 'Holandey', sq: 'Albanian', hi: 'Hindi', bn: 'Bengali', fa: 'Persa', ps: 'Pashto', ckb: 'Central Kurdish', ug: 'Uyghur', az: 'Azerbaijani', uz: 'Uzbek', kk: 'Kazakh', ky: 'Kyrgyz', tg: 'Tajik', sw: 'Swahili', ha: 'Haoussa', am: 'Amharika', om: 'Oromo', so: 'Somalianina', ff: 'Fula', yo: 'Yôrobà', zh: 'Simplified Chinese', ta: 'Tamoila', ml: 'Malayalam', th: 'Taioaney', ko: 'Koreanina', vi: 'Vietnamianina', pt: 'Portiogey', it: 'Italianina', sv: 'Soisa', uk: 'Okrainianina', ro: 'Romanianina', hr: 'Croatian', sr: 'Serbian', el: 'Grika', ku: 'Kurdish (Kurmancî)', tk: 'Turkmen', tt: 'Tatar', sd: 'Sindhi', pl: 'Poloney', ja: 'Japoney', gu: 'Gujarati', bg: 'Biolgara', mk: 'Macedonian', fil: 'Filipino', te: 'Telugu', kn: 'Kannada', mr: 'Marathi', pa: 'Penjabi (Pakistan)', as: 'Assamese', ne: 'Nepale', si: 'Sinhala', km: 'Khmer', he: 'Hebrew', ka: 'Georgian', lt: 'Lithuanian', mg: 'Malagasy', lg: 'Ganda', rw: 'Roande', rn: 'Rundi', ln: 'Lingala', dag: 'Dagbani', mos: 'Mossi', aa: 'Afar', mdh: 'Maguindanao', ak: 'Akan', ceb: 'Cebuano', nqo: 'N’Ko' },
  cihazDili: "Fitenin'ny fitaovana",
  cihazDiliKullaniliyor: "Amin'izao: {ad}",
  cihazDiliDesteklenmiyor: "Mbola tsy misy ny fitenin'ny fitaovanao; ny teny tiorka no ampiasaina.",
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'Mbola dinihina ny fandikan-teny Beta; mety misy soratra tsy lavorary.',
    vakit: "Tsy manova ny fomba fikajiana ny fotoanan'ny soalat ny fiteny.",
    nass: "Amin'ny fiteny hafa ankoatra ny teny tiorka, ny dikan-tenin'ny Kor'any ihany no aseho; avy amin'ny loharano tiorka ny lahatsoratry ny hadisy, ka tsy aseho izy ireo.",
  },
  ozelAnons: {
    baslik: 'Lahatsoratra famakiana mafy nosoratanao',
    govde: cogul({
      one: "Mbola amin'ny fiteny teo aloha ny lahatsoratra famakiana mafy {n} nosoratanao. Hosoloina ny lahatsoratra efa vonona amin'ny fiteny vaovao ve?",
      other: "Mbola amin'ny fiteny teo aloha ny lahatsoratra famakiana mafy {n} nosoratanao. Hosoloina ny lahatsoratra efa vonona amin'ny fiteny vaovao ve?",
    }),
    degistir: 'Soloy lahatsoratra efa vonona',
    koru: 'Avelao toy izao',
    degisti: cogul({ one: 'Lahatsoratra {n} no nosoloina.', other: 'Lahatsoratra {n} no nosoloina.' }),
  },
  vakitAdlari: {
    baslik: "Anaran'ny soalat",
    aciklama: "Fidio ny fomba hanononana ny fotoanan'ny soalat.",
    otomatik: 'Araka ny firenena',
    otomatikAciklama: "Ampiasaina ny anarana mahazatra ao amin'ny firenena misy anao.",
    takimlar: { temel: 'Anarana arabo', diyanetDe: 'Diyanet (alemanina)', turkce: 'Anarana tiorka', magrip: 'Tsipelina maghrebiana', cezayir: 'Tsipelina alzeriana', afgan: 'Anarana afgana' },
  },
  yazi: {
    baslik: 'Abidia',
    aciklama: 'Fidio ny abidia hanoratana ny soratra.',
    otomatik: 'Araka ny firenena',
    otomatikAciklama: "Ampiasaina ny abidia mahazatra ao amin'ny firenena misy anao.",
    latin: 'Abidia latina',
    kiril: 'Abidia sirilika',
  },
  kaydedilemedi: 'Tsy voatahiry ny fiteny. Andramo indray.',
  sihirbazBaglantisi: 'Fiteny · Language',
  sihirbazBaglantisiAciklama: "Ovay ny fitenin'ny fampiharana",
};
