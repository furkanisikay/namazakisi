import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Idioma · Language',
  aciklama: 'Escolha o idioma da aplicação. As notificações e a leitura em voz alta também usam este idioma.',
  grup: 'Idioma da aplicação',
  dilAdlari: { tr: 'Turco', en: 'Inglês', id: 'Indonésio', de: 'Alemão', fr: 'Francês', bs: 'Bósnio', ru: 'Russo', ms: 'Malaio', ar: 'Árabe', ur: 'Urdu', es: 'Espanhol', nl: 'Neerlandês', sq: 'Albanês', hi: 'Hindi', bn: 'Bengalês', fa: 'Persa', ps: 'Pastó', ckb: 'Curdo central', ug: 'Uigur', az: 'Azerbaijano', uz: 'Usbeque', kk: 'Cazaque', ky: 'Quirguiz', tg: 'Tajique', sw: 'Suaíli', ha: 'Haúça', am: 'Amárico', om: 'Oromo', so: 'Somali', ff: 'Fula', yo: 'Ioruba', zh: 'Chinês simplificado', ta: 'Tâmil', ml: 'Malaiala', th: 'Tailandês', ko: 'Coreano', vi: 'Vietnamita', pt: 'Português', it: 'Italiano', sv: 'Sueco', uk: 'Ucraniano', ro: 'Romeno', hr: 'Croata', sr: 'Sérvio', el: 'Grego', ku: 'Curdo (Kurmancî)', tk: 'Turcomano', tt: 'Tatar', sd: 'Sindi', pl: 'Polaco', ja: 'Japonês', gu: 'Guzerate', bg: 'Búlgaro', mk: 'Macedónio', fil: 'Filipino', te: 'Telugu', kn: 'Canarim', mr: 'Marata', pa: 'Panjabi (árabe, Paquistão)', as: 'Assamês', ne: 'Nepalês', si: 'Cingalês', km: 'Khmer', he: 'Hebraico', ka: 'Georgiano', lt: 'Lituano', mg: 'Malgaxe', lg: 'Ganda', rw: 'Quiniaruanda', rn: 'Rundi', ln: 'Lingala', dag: 'Dagbani', mos: 'Mossi', aa: 'Afar', mdh: 'Maguindanao', ak: 'Akan', ceb: 'Cebuano', nqo: 'N’ko' },
  cihazDili: 'Idioma do dispositivo',
  cihazDiliKullaniliyor: 'Atualmente: {ad}',
  cihazDiliDesteklenmiyor: 'O idioma do seu dispositivo ainda não está disponível; é usado o turco.',
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'As traduções beta estão a ser revistas; alguns textos podem ter imperfeições.',
    vakit: 'O idioma não altera o cálculo dos horários das orações.',
    nass: 'Nos idiomas que não o turco, só são mostradas traduções do Alcorão; os textos de hadith vêm de uma fonte turca e por isso não são mostrados.',
  },
  ozelAnons: {
    baslik: 'Textos de leitura em voz alta escritos por si',
    govde: cogul({
      one: '{n} texto de leitura em voz alta escrito por si ficou no idioma anterior. Substituí-lo pelo texto predefinido do novo idioma?',
      many: '{n} de textos de leitura em voz alta escritos por si ficaram no idioma anterior. Substituí-los pelos textos predefinidos do novo idioma?',
      other: '{n} textos de leitura em voz alta escritos por si ficaram no idioma anterior. Substituí-los pelos textos predefinidos do novo idioma?',
    }),
    degistir: 'Substituir pelo texto predefinido',
    koru: 'Deixar como está',
    degisti: cogul({ one: '{n} texto substituído.', many: '{n} de textos substituídos.', other: '{n} textos substituídos.' }),
  },
  vakitAdlari: {
    baslik: 'Nomes das orações',
    aciklama: 'Escolha com que nomes são escritas as orações.',
    otomatik: 'Conforme o país',
    otomatikAciklama: 'São usados os nomes comuns no país da sua localização.',
    takimlar: { temel: 'Nomes árabes', diyanetDe: 'Diyanet (alemão)', turkce: 'Nomes turcos', magrip: 'Grafia magrebina', cezayir: 'Grafia argelina', afgan: 'Nomes afegãos' },
  },
  yazi: {
    baslik: 'Alfabeto',
    aciklama: 'Escolha em que alfabeto são escritos os textos.',
    otomatik: 'Conforme o país',
    otomatikAciklama: 'É usado o alfabeto comum no país da sua localização.',
    latin: 'Alfabeto latino',
    kiril: 'Alfabeto cirílico',
  },
  kaydedilemedi: 'Não foi possível guardar o idioma. Tente novamente.',
  sihirbazBaglantisi: 'Idioma · Language',
  sihirbazBaglantisiAciklama: 'Alterar o idioma da aplicação',
};
