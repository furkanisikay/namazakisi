import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Lingua · Language',
  aciklama: 'Scelga la lingua dell’app. La usano anche le notifiche e la lettura ad alta voce.',
  grup: 'Lingua dell’app',
  dilAdlari: { tr: 'Turco', en: 'Inglese', id: 'Indonesiano', de: 'Tedesco', fr: 'Francese', bs: 'Bosniaco', ru: 'Russo', ms: 'Malese', ar: 'Arabo', ur: 'Urdu', es: 'Spagnolo', nl: 'Olandese', sq: 'Albanese', hi: 'Hindi', bn: 'Bengalese', fa: 'Persiano', ps: 'Pashto', ckb: 'Curdo centrale', ug: 'Uiguro', az: 'Azerbaigiano', uz: 'Uzbeco', kk: 'Kazako', ky: 'Kirghiso', tg: 'Tagico', sw: 'Swahili', ha: 'Hausa', am: 'Amarico', om: 'Oromo', so: 'Somalo', ff: 'Fulah', yo: 'Yoruba', zh: 'Cinese semplificato', ta: 'Tamil', ml: 'Malayalam', th: 'Thailandese', ko: 'Coreano', vi: 'Vietnamita', pt: 'Portoghese', it: 'Italiano', sv: 'Svedese', uk: 'Ucraino', ro: 'Rumeno', hr: 'Croato', sr: 'Serbo', el: 'Greco', ku: 'Curdo (Kurmancî)', tk: 'Turcomanno', tt: 'Tataro', sd: 'Sindhi', pl: 'Polacco', ja: 'Giapponese', gu: 'Gujarati', bg: 'Bulgaro', mk: 'Macedone', fil: 'Filippino', te: 'Telugu', kn: 'Kannada', mr: 'Marathi', pa: 'Punjabi (arabo, Pakistan)', as: 'Assamese', ne: 'Nepalese', si: 'Singalese', km: 'Khmer' },
  cihazDili: 'Lingua del dispositivo',
  cihazDiliKullaniliyor: 'Attualmente {ad}',
  cihazDiliDesteklenmiyor: 'La lingua del dispositivo non è ancora disponibile; si usa il turco.',
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'Le traduzioni beta sono in revisione; alcuni testi potrebbero essere imperfetti.',
    vakit: 'La lingua non cambia il calcolo degli orari di preghiera.',
    nass: 'Nelle lingue diverse dal turco si mostrano solo le traduzioni del Corano; i testi degli hadith provengono da una fonte turca e quindi non vengono mostrati.',
  },
  ozelAnons: {
    baslik: 'Testi di lettura scritti da lei',
    govde: cogul({
      one: '{n} testo di lettura ad alta voce scritto da lei è ancora nella lingua precedente. Sostituirlo con il testo pronto nella nuova lingua?',
      many: '{n} di testi di lettura ad alta voce scritti da lei sono ancora nella lingua precedente. Sostituirli con i testi pronti nella nuova lingua?',
      other: '{n} testi di lettura ad alta voce scritti da lei sono ancora nella lingua precedente. Sostituirli con i testi pronti nella nuova lingua?',
    }),
    degistir: 'Sostituire con il testo pronto',
    koru: 'Lasciare com’è',
    degisti: cogul({ one: '{n} testo sostituito.', many: '{n} di testi sostituiti.', other: '{n} testi sostituiti.' }),
  },
  vakitAdlari: {
    baslik: 'Nomi delle preghiere',
    aciklama: 'Scelga come chiamare gli orari di preghiera.',
    otomatik: 'In base al paese',
    otomatikAciklama: 'Si usano i nomi diffusi nel paese in cui si trova.',
    takimlar: { temel: 'Nomi arabi', diyanetDe: 'Diyanet (tedesco)', turkce: 'Nomi turchi', magrip: 'Grafia maghrebina', cezayir: 'Grafia algerina', afgan: 'Nomi afghani' },
  },
  yazi: {
    baslik: 'Alfabeto',
    aciklama: 'Scelga in quale alfabeto scrivere i testi.',
    otomatik: 'In base al paese',
    otomatikAciklama: 'Si usa l’alfabeto diffuso nel paese in cui si trova.',
    latin: 'Alfabeto latino',
    kiril: 'Alfabeto cirillico',
  },
  kaydedilemedi: 'Non è stato possibile salvare la lingua. Riprovi.',
  sihirbazBaglantisi: 'Lingua · Language',
  sihirbazBaglantisiAciklama: 'Cambiare la lingua dell’app',
};
