import type { Sozluk } from '../tr';

/**
 * Kıble "Alichibla", Kâbe "Ka’aba" (QuranEnc 2:144); sağ "nudirigu", sol "nuzaa" (18:17), dönmek
 * "ŋmalgi" (2:144). Pusula harfleri uluslararası N/E/S/W kalır (Dagbani kuzey/güney adı kaynakta yok).
 */
export const kible: Sozluk['kible'] = {
  baslik: 'Alichibla',
  yon: {
    hizali: 'Yi nini kpa Alichibla',
    arkada: 'Alichibla be yi nyaaŋa, ŋmalgimi ya',
    sagda: 'Alichibla be yi nudirigu polo {derece}°',
    solda: 'Alichibla be yi nuzaa polo {derece}°',
  },
  harf: { kuzey: 'N', dogu: 'E', guney: 'S', bati: 'W' },
  sekme: {
    pusula: 'Kɔmpas',
    pusulaErisim: 'Kɔmpas soli',
    pusulaAciklama: 'Ka’aba dalibu yi paai zuɣusaa luɣili maa, yi nini kpa Alichibla.',
    kamera: 'Kamera',
    kameraErisim: 'Kamera soli',
    kameraAciklama: 'Gbibimi ya tilifoŋ maa ka di zani; Ka’aba dalibu ni yi polo Alichibla soli ni.',
  },
  sayfa: {
    baslatiliyor: 'Kɔmpas piligiri…',
    izinKapali: 'Luɣili soli kpariya; bɛ bɔrila yi luɣili n-ti nya soli maa.',
  },
  hata: {
    izinGerekli: 'Bɛ bɔrila luɣili soli n-ti nya Alichibla soli.',
    konumServisi: 'Luɣili tuma bi paai. Lihimi ya yi tilifoŋ luɣili malizali.',
    baslatilamadi: 'Alichibla tuma bi tooi piligi.',
  },
  pusula: {
    ufuk: 'sagbana bahigu',
    konumAliniyor: 'Yi luɣili ka bɛ bɔri…',
    hazirlaniyor: 'Kɔmpas kpaŋsiri…',
    kuzeydenAci: 'Alichibla nyɛla {derece}° n-yi N polo',
    kabeUzakta: 'Ka’aba zooya {mesafe}',
    kuzeydenSaatYonu: 'N-yi N polo, wɔɔchi soli doli',
    kuzeyden: '{derece}° n-yi N polo',
    kabeUzaktaKuzeyden: 'Ka’aba zooya {mesafe}, {derece}° n-yi N polo',
    pusulaErisim: 'Alichibla kɔmpas. {cumle}',
    pusulaYok: 'Tilifoŋ ŋɔ ka kɔmpas; ti wuhiri soli maa ka di doli N polo.',
    kayiyorsa: 'Soli maa yi chani, gilgimi ya yi tilifoŋ sagbana ni kamani 8.',
    kamerayla: 'Lihimi ya ni kamera',
  },
  kamera: {
    pusulayiKullanin: 'Zaŋmi ya kɔmpas',
    kullanilamiyorBaslik: 'Kamera lihibu kani tilifoŋ ŋɔ zuɣu',
    kullanilamiyorMetin:
      'Yi tilifoŋ sɛnsa nima bi wuhiri soli din tabili yi yi gbibi li ka di zani. Kɔmpas na wuhiri soli maa viɛnyɛla.',
    izinBaslik: 'Lihimi ya Alichibla ni yi kamera',
    izinMetin:
      'Gbibimi ya yi tilifoŋ ka di zani ka lihi yi gilisi; Ka’aba dalibu ni yi polo Alichibla soli ni. Di bɔrila kamera soli; bɛ bi sabiri foto maa, di mi bi yiri yi tilifoŋ ni.',
    kamerayiAcin: 'Yoomi ya kamera',
    izinKapaliBaslik: 'Kamera soli kpariya',
    izinKapaliMetin: 'Yi ni tooi ti kamera soli Malizali ni n-ti kamera lihibu. Kɔmpas tumdi ka di kani.',
    ayarlariAcin: 'Yoomi ya Malizali',
    acilamadiBaslik: 'Kamera bi tooi yooi',
    acilamadiMetin: 'Kamera kani pumpɔŋɔ. Yi ni tooi nya Alichibla ni kɔmpas.',
    hesaplaniyor: 'Soli maa bɔri…',
    dikTutun: 'Gbibimi ya yi tilifoŋ ka di zani',
  },
  kalibrasyon: {
    tesekkurErisim: 'Ti paɣiya, soli maa tabili pumpɔŋɔ',
    tesekkur: 'Ti paɣiya, soli maa tabili pumpɔŋɔ ✓',
    baslik: 'Malimi ya kɔmpas',
    sallayin: 'Gilgimi ya yi tilifoŋ sagbana ni kamani 8.',
    metal: 'Zoomi ya kuriti binyɛra mini makinta kɔlisi.',
    dogruluk: 'Tabili',
    simdiDegil: 'Pa pumpɔŋɔ',
  },
};
