import type { Sozluk } from '../tr';

/**
 * Yön harfleri: Kaaba (kuzey) ve Kibba (güney) aynı harfle başlar → "Ka" / "Ki"; Baha (B),
 * Lixa (L). Kâbe "Ka'abaa" yazılır (kuzey "kaaba" ile karışmasın).
 */
export const kible: Sozluk['kible'] = {
  baslik: 'Qiblaa',
  yon: {
    hizali: 'Gara qiblaatti garagaltaniittu',
    arkada: 'Qiblaan duuba keessan jira, garagalaa',
    sagda: 'Qiblaan gara mirga keessanii {derece}° irra jira',
    solda: 'Qiblaan gara bitaa keessanii {derece}° irra jira',
  },
  harf: { kuzey: 'Ka', dogu: 'B', guney: 'Ki', bati: 'L' },
  sekme: {
    pusula: 'Kompaasii',
    pusulaErisim: 'Haala kompaasii',
    pusulaAciklama: "Yeroo mallattoon Ka'abaa qaawwa gubbaa gahu, gara qiblaatti garagaltaniittu.",
    kamera: 'Kaameraa',
    kameraErisim: 'Haala kaameraa',
    kameraAciklama: "Bilbila ol qajeelchaa qabadhaa; mallattoon Ka'abaa kallattii qiblaatti mul'ata.",
  },
  sayfa: {
    baslatiliyor: 'Kompaasiin jalqabaa jira…',
    izinKapali: 'Eeyyamni bakkaa cufaa dha; kallattii argachuuf bakki keessan barbaachisa.',
  },
  hata: {
    izinGerekli: 'Kallattii qiblaa argachuuf eeyyamni bakkaa barbaachisa.',
    konumServisi: "Tajaajilli bakkaa hin argamu. Qindaa'ina bakkaa meeshaa keessanii ilaalaa.",
    baslatilamadi: 'Tajaajilli qiblaa jalqabuu hin dandeenye.',
  },
  pusula: {
    ufuk: 'dachaa',
    konumAliniyor: 'Bakki keessan fudhatamaa jira…',
    hazirlaniyor: "Kompaasiin qophaa'aa jira…",
    kuzeydenAci: 'Qiblaan kaaba irraa {derece}° irra jira',
    kabeUzakta: "Ka'abaan {mesafe} fagaatti",
    kuzeydenSaatYonu: "Kaaba irraa gara kallattii sa'aatiitti",
    kuzeyden: 'Kaaba irraa {derece}°',
    kabeUzaktaKuzeyden: "Ka'abaan {mesafe} fagaatti, kaaba irraa {derece}°",
    pusulaErisim: 'Kompaasii qiblaa. {cumle}',
    pusulaYok: 'Meeshaan kun kompaasii hin qabu; kallattii kaaba irraa ibsina.',
    kayiyorsa: 'Yoo kallattiin jijjiirame, bilbila keessan qilleensa irratti akka lakkoofsa 8tti sochoosaa.',
    kamerayla: 'Kaameraan ilaalaa',
  },
  kamera: {
    pusulayiKullanin: 'Kompaasii fayyadamaa',
    kullanilamiyorBaslik: "Mul'anni kaameraa bilbila kana irratti hin jiru",
    kullanilamiyorMetin:
      'Senseroonni bilbila keessanii yeroo ol qajeelchitanii qabattan kallattii amansiisaa hin kennan. Kompaasiin garuu kallattii sirriitti agarsiisa.',
    izinBaslik: 'Qiblaa kaameraa keessaniin ilaalaa',
    izinMetin:
      "Bilbila keessan ol qajeelchaa qabadhaatii naannoo ilaalaa; mallattoon Ka'abaa kallattii qiblaatti mul'ata. Kun eeyyama kaameraa barbaada; suuraan hin galmeeffamu, bilbila keessan irraas gonkumaa hin ba'u.",
    kamerayiAcin: 'Kaameraa banaa',
    izinKapaliBaslik: 'Eeyyamni kaameraa cufaa dha',
    izinKapaliMetin: "Mul'ata kaameraaf Qindaa'ina keessatti kaameraa hayyamuu dandeessu. Kompaasiin isa malee ni hojjeta.",
    ayarlariAcin: "Qindaa'ina banaa",
    acilamadiBaslik: 'Kaameraan banamuu hin dandeenye',
    acilamadiMetin: 'Kaameraan amma hin jiru. Qiblaa kompaasiin argachuu dandeessu.',
    hesaplaniyor: 'Kallattiin barbaadamaa jira…',
    dikTutun: 'Bilbila keessan ol qajeelchaa qabadhaa',
  },
  kalibrasyon: {
    tesekkurErisim: 'Galatoomaa, kallattiin amma caalaa sirrii dha',
    tesekkur: 'Galatoomaa, kallattiin amma caalaa sirrii dha ✓',
    baslik: 'Kompaasii sirreessaa',
    sallayin: 'Bilbila keessan qilleensa irratti akka lakkoofsa 8tti sochoosaa.',
    metal: 'Meeshaalee sibiilaafi uwwisa maagneetii irraa fagaadhaa.',
    dogruluk: 'Sirrummaa',
    simdiDegil: 'Amma miti',
  },
};
