// Türkmencede `buyuk` elle yazılır (`toUpperCase` YASAK; ç ä ň ö ş ü ý ž → Ç Ä Ň Ö Ş Ü Ý Ž). Noktasız ı yok: i → I (CLDR tk).
import type { Sozluk } from '../tr';

/**
 * Türkmen dilinde wagt atlary IslamHouse "Namaz kitaby" we tk.wikipedia "Namaz" makalasyndaky
 * tertipdir: Ertir · Gün dogşy · Öýle · Ikindi · Agşam · Ýassy ("ertir namazy", "öýle namazy",
 * "ikindi (asr) namazy", "agşam (magrib) namazy", "ýassy (işa) namazy"). "Gün dogşy" umumy söz
 * (dini çeşmede at görnüşinde tapylmady). Tablisadaky ertir setiri (`imsakVakti`) fejriň girýän
 * wagtydyr, şonuň üçin "Ertir". Juma: "juma namazy" (Namaz kitaby). Namaz okamak: "Okadym" /
 * "Okaldy" (kök "namaz okamak", edilgen "okalýar"). Terminler: kaza namazy, nafile namaz, kybla,
 * metjit, azan, täret, mekruh wagt, hasaplama usuly, Namaz goragçysy, yzygiderlik (seri), dikeliş
 * (toparlanma), ýolagçy (seferîlik), Kaza depderi, Sazlamalar, habarnama, ýerleşiş. Alla (IslamHouse
 * "Alla tagala"), Kuran.
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Ertir', gunes: 'Gün dogşy', ogle: 'Öýle', ikindi: 'Ikindi', aksam: 'Agşam', yatsi: 'Ýassy' },
  buyuk: { imsak: 'ERTIR', gunes: 'GÜN DOGŞY', ogle: 'ÖÝLE', ikindi: 'IKINDI', aksam: 'AGŞAM', yatsi: 'ÝASSY' },
  kucuk: { imsak: 'ertir', gunes: 'gün dogşy', ogle: 'öýle', ikindi: 'ikindi', aksam: 'agşam', yatsi: 'ýassy' },
  imsakVakti: 'Ertir',
  cuma: 'Juma',
  cumaKucuk: 'juma',
  gunesDogusu: 'Gün dogşy',
  gunesDogusuKucuk: 'gün dogşy',
  durum: { kilindi: 'Okaldy', vaktiGeldi: 'Namaz wagty', girmedi: 'Entek wagty däl', gecti: 'Okalmady' },
  durumKucuk: { kilindi: 'okaldy', vaktiGeldi: 'namaz wagty', girmedi: 'entek wagty däl', gecti: 'okalmady' },
  /** "Okadym" = ulanyjynyň öz aýdany (1-nji şahs); ýagdaý "Okaldy". */
  eylem: { kildim: 'Okadym', kilindi: 'Okaldy' },
  kerahatVakti: 'Mekruh wagt',
  isaretle: 'Okaldy diýip belläň',
  geriAlEtiketi: '{durum}, yzyna almak üçin basyň',
  geriAlindi: 'Bellik aýryldy',
};
