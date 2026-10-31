import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Idioma · Language',
  aciklama: 'Elija el idioma de la aplicación. Las notificaciones y la lectura en voz alta también lo usan.',
  grup: 'Idioma de la aplicación',
  dilAdlari: { tr: 'Turco', en: 'Inglés', id: 'Indonesio', de: 'Alemán', fr: 'Francés', bs: 'Bosnio', ru: 'Ruso', ms: 'Malayo', ar: 'Árabe', ur: 'Urdu', es: 'Español', nl: 'Neerlandés', sq: 'Albanés', hi: 'Hindi', bn: 'Bengalí', fa: 'Persa', ps: 'Pastún', ckb: 'Kurdo sorani', ug: 'Uigur', az: 'Azerbaiyano', uz: 'Uzbeko', kk: 'Kazajo', ky: 'Kirguís', tg: 'Tayiko', sw: 'Suajili', ha: 'Hausa', am: 'Amárico', om: 'Oromo', so: 'Somalí', ff: 'Fula', yo: 'Yoruba', zh: 'Chino simplificado', ta: 'Tamil', ml: 'Malayálam', th: 'Tailandés', ko: 'Coreano', vi: 'Vietnamita' },
  cihazDili: 'Idioma del dispositivo',
  cihazDiliKullaniliyor: 'Ahora {ad}',
  cihazDiliDesteklenmiyor: 'El idioma de su dispositivo aún no está disponible; se usa el turco.',
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'Las traducciones beta están en revisión; algunos textos pueden tener errores.',
    vakit: 'El idioma no cambia el cálculo de las horas de rezo.',
    nass: 'En los idiomas distintos del turco solo se muestran traducciones del Corán; los hadices no se muestran porque proceden de una fuente en turco.',
  },
  ozelAnons: {
    baslik: 'Textos de lectura en voz alta que usted escribió',
    govde: cogul({
      one: '{n} texto de lectura en voz alta que usted escribió quedó en el idioma anterior. ¿Reemplazarlo por el texto predefinido del nuevo idioma?',
      other: '{n} textos de lectura en voz alta que usted escribió quedaron en el idioma anterior. ¿Reemplazarlos por los textos predefinidos del nuevo idioma?',
      many: '{n} de textos de lectura en voz alta que usted escribió quedaron en el idioma anterior. ¿Reemplazarlos por los textos predefinidos del nuevo idioma?',
    }),
    degistir: 'Reemplazar por el texto predefinido',
    koru: 'Dejar como está',
    degisti: cogul({ one: '{n} texto reemplazado.', other: '{n} textos reemplazados.', many: '{n} de textos reemplazados.' }),
  },
  vakitAdlari: {
    baslik: 'Nombres de los rezos',
    aciklama: 'Elija cómo se nombran las horas de rezo.',
    otomatik: 'Según su país',
    otomatikAciklama: 'Se usan los nombres habituales en el país de su ubicación.',
    takimlar: { temel: 'Nombres árabes', diyanetDe: 'Diyanet (alemán)', turkce: 'Nombres turcos', magrip: 'Grafía magrebí', cezayir: 'Grafía argelina', afgan: 'Nombres afganos' },
  },
  yazi: {
    baslik: 'Alfabeto',
    aciklama: 'Elija en qué alfabeto se escriben los textos.',
    otomatik: 'Según su país',
    otomatikAciklama: 'Se usa el alfabeto habitual en el país de su ubicación.',
    latin: 'Alfabeto latino',
    kiril: 'Alfabeto cirílico',
  },
  kaydedilemedi: 'No se pudo guardar el idioma. Vuelva a intentarlo.',
  sihirbazBaglantisi: 'Idioma · Language',
  sihirbazBaglantisiAciklama: 'Cambiar el idioma de la aplicación',
};
