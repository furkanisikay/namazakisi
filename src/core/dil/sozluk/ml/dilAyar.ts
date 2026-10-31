// ÇEVİRİ: ml — İngilizce iskelet, çevrilince bu satır silinir
import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Language · Dil',
  aciklama: 'Choose the app language. Notifications and read-aloud use it too.',
  grup: 'App language',
  dilAdlari: { tr: 'ടർക്കിഷ്', en: 'ഇംഗ്ലീഷ്', id: 'ഇന്തോനേഷ്യൻ', de: 'ജർമ്മൻ', fr: 'ഫ്രഞ്ച്', bs: 'ബോസ്നിയൻ', ru: 'റഷ്യൻ', ms: 'മലെയ്', ar: 'അറബിക്', ur: 'ഉറുദു', es: 'സ്‌പാനിഷ്', nl: 'ഡച്ച്', sq: 'അൽബേനിയൻ', hi: 'ഹിന്ദി', bn: 'ബംഗ്ലാ', fa: 'പേർഷ്യൻ', ps: 'പഷ്‌തോ', ckb: 'സെൻട്രൽ കുർദിഷ്', ug: 'ഉയ്ഘുർ', az: 'അസർബൈജാനി', uz: 'ഉസ്‌ബെക്ക്', kk: 'കസാഖ്', ky: 'കിർഗിസ്', tg: 'താജിക്', sw: 'സ്വാഹിലി', ha: 'ഹൗസ', am: 'അംഹാരിക്', om: 'ഒറോമോ', so: 'സോമാലി', ff: 'ഫുല', yo: 'യൊറൂബാ', zh: 'ലളിതമാക്കിയ ചൈനീസ്', ta: 'തമിഴ്', ml: 'മലയാളം', th: 'തായ്', ko: 'കൊറിയൻ', vi: 'വിയറ്റ്നാമീസ്' },
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
      other: '{n} read-aloud texts you wrote are still in the previous language. Replace them with the ready-made texts in the new language?',
    }),
    degistir: 'Replace with ready-made text',
    koru: 'Keep as is',
    degisti: cogul({ one: '{n} text replaced.', other: '{n} texts replaced.' }),
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
  sihirbazBaglantisi: 'Language · Dil',
  sihirbazBaglantisiAciklama: 'Change the app language',
};
