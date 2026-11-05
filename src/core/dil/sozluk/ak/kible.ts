import type { Sozluk } from '../tr';

/** Kıble QE "Qibla" (2:144), Kâbe QE "Ka’aba". Yön harfleri N/E/S/W kalır: Akan yön adlarının dördü de A ile başlar (Atifi, Apueɛ, Anafoɔ, Atɔeɛ). */
export const kible: Sozluk['kible'] = {
  baslik: 'Qibla',
  yon: {
    hizali: 'Wo ani kyerɛ Qibla',
    arkada: 'Qibla wɔ w’akyi, dane wo ho',
    sagda: 'Qibla wɔ wo nifa so {derece}°',
    solda: 'Qibla wɔ wo benkum so {derece}°',
  },
  harf: { kuzey: 'N', dogu: 'E', guney: 'S', bati: 'W' },
  sekme: {
    pusula: 'Kompas',
    pusulaErisim: 'Kompas tebea',
    pusulaAciklama: 'Sɛ Ka’aba agyiraeɛ no du atifi akyerɛnne no so a, na wo ani kyerɛ Qibla.',
    kamera: 'Kamera',
    kameraErisim: 'Kamera tebea',
    kameraAciklama: 'Kura fon no tee; Ka’aba agyiraeɛ no bɛda adi wɔ Qibla fam.',
  },
  sayfa: {
    baslatiliyor: 'Ɛrebue kompas no…',
    izinKapali: 'Beaeɛ kwan no ato mu; ɛsɛ sɛ wohunu wo beaeɛ ansa na wɔahu fam no.',
  },
  hata: {
    izinGerekli: 'Ɛsɛ sɛ wode beaeɛ kwan ma ansa na wɔahu Qibla fam.',
    konumServisi: 'Wɔntumi nnu beaeɛ dwumadie ho. Hwɛ wo afidie beaeɛ nhyehyɛe.',
    baslatilamadi: 'Qibla dwumadie no antumi anhyɛ ase.',
  },
  pusula: {
    ufuk: 'ewiem ano',
    konumAliniyor: 'Ɛrehwehwɛ wo beaeɛ…',
    hazirlaniyor: 'Ɛresiesie kompas no…',
    kuzeydenAci: 'Qibla wɔ {derece}° firi atifi',
    kabeUzakta: 'Ka’aba wɔ {mesafe} akyiri',
    kuzeydenSaatYonu: 'Firi atifi kɔ nifa',
    kuzeyden: '{derece}° firi atifi',
    kabeUzaktaKuzeyden: 'Ka’aba wɔ {mesafe} akyiri, {derece}° firi atifi',
    pusulaErisim: 'Qibla kompas. {cumle}',
    pusulaYok: 'Kompas nni afidie yi mu; yɛrekyerɛ fam no sɛdeɛ ɛte fa atifi ho.',
    kayiyorsa: 'Sɛ fam no kyinkyim a, twe wo fon no sɛ nɔma 8 wɔ wim.',
    kamerayla: 'Hwɛ no kamera so',
  },
  kamera: {
    pusulayiKullanin: 'Fa kompas no di dwuma',
    kullanilamiyorBaslik: 'Kamera nhwɛ nni fon yi so',
    kullanilamiyorMetin:
      'Sɛ wokura wo fon no tee a, ne sensa ahodoɔ mma fam a wotumi de wo ho to so. Kompas no da so kyerɛ fam no yie.',
    izinBaslik: 'Fa wo kamera hwɛ Qibla',
    izinMetin:
      'Kura wo fon no tee na hwɛ wo ho hyia; Ka’aba agyiraeɛ no bɛda adi wɔ Qibla fam. Ɛhia kamera kwan; wɔnkora mfoni no na ɛmfiri wo fon so da.',
    kamerayiAcin: 'Bue kamera',
    izinKapaliBaslik: 'Kamera kwan no ato mu',
    izinKapaliMetin: 'Wobɛtumi de kamera kwan ama wɔ Nhyehyɛe mu ama kamera nhwɛ no. Kompas no yɛ adwuma a ɛnhia.',
    ayarlariAcin: 'Bue Nhyehyɛe',
    acilamadiBaslik: 'Kamera no anbue',
    acilamadiMetin: 'Kamera no nni hɔ mprempren. Wobɛtumi de kompas no ahwehwɛ Qibla.',
    hesaplaniyor: 'Ɛrehwehwɛ fam no…',
    dikTutun: 'Kura wo fon no tee',
  },
  kalibrasyon: {
    tesekkurErisim: 'Meda wo ase, seesei fam no yɛ pɛpɛɛpɛ',
    tesekkur: 'Meda wo ase, seesei fam no yɛ pɛpɛɛpɛ ✓',
    baslik: 'Siesie kompas no',
    sallayin: 'Twe wo fon no sɛ nɔma 8 wɔ wim.',
    metal: 'Twe wo ho firi dade nneɛma ne magnet kotoku ho.',
    dogruluk: 'Pɛpɛɛpɛyɛ',
    simdiDegil: 'Ɛnnɛ deɛ, daabi',
  },
};
