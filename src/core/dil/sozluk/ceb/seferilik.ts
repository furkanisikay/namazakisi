import type { Sozluk } from '../tr';

/** Kaynak fetvalar Türkçedir; etiket bunu söyler. Hüküm kipi yok (bilgi aktarımı). */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'Hanafi', safii: "Shafi'i" },
  kaynaklar: {
    vatan: 'Puy-anan, pinuy-anan ug temporaryong pagpabilin bahin sa pagbiyahe (sa Turkish)',
    cem: "Mahimo bang tipunon ang mga Salah (jam')? (sa Turkish)",
    baslangic: 'Kanus-a magsugod ang pagbiyahe? (sa Turkish)',
    ziyaret: 'Biyahero ba ang usa nga mobisita sa lungsod sa iyang mga ginikanan? (sa Turkish)',
  },
  bilgiNotu:
    'Kini impormasyon, dili hukom. Kon giisip ba kamong biyahero nagdepende sa tumong ug gitas-on sa inyong biyahe ug sa inyong tuyo.',
  baslik: 'Morag nagbiyahe kamo',
  mesafeSatiri: 'Mga {km} km kamo gikan sa inyong pinuy-anan kon tul-id nga linya. Ang gipasabot sa Diyanet alang sa eskwelahan nga {mezhep}:',
  maddeler: {
    hanefi: [
      'Sa eskwelahan nga Hanafi, ang gilay-on sa pagbiyahe (safar) mga 90 km. Ang usa nga nagtuyo nga mopabilin og ubos sa 15 ka adlaw sa padulngan giisip nga biyahero.',
      "Ang biyahero mohimo sa upat ka rak'ah nga obligadong Salah og duha ka rak'ah (qasr).",
      "Sa eskwelahan nga Hanafi, ang pagtipon sa duha ka Salah (jam') sa panahon lang sa Hajj, sa Arafat ug Muzdalifah. Matod pa usab sa Diyanet nga sa seryosong hinungdan sama sa pagbiyahe, mahimong sundon ang panglantaw sa ubang eskwelahan.",
    ],
    safii: [
      "Sa eskwelahan nga Shafi'i, mga 90 km usab ang gilay-on sa pagbiyahe. Kon ang pagpabilin sa padulngan ubos sa 4 ka adlaw, gawas sa adlaw sa pag-abot ug paggikan, magpadayon ang mga hukom sa pagbiyahe.",
      "Ang biyahero mohimo sa upat ka rak'ah nga obligadong Salah og duha ka rak'ah (qasr).",
      "Sa eskwelahan nga Shafi'i, ang pagbiyahe balido nga hinungdan sa pagtipon (jam') sa Dhuhr ug Asr ug sa Maghrib ug Isha.",
    ],
  },
  ozetAcik: 'Naka-on · {mezhep}',
  ozetKapali: 'Naka-off',
  baglantiAcilamadi: 'Dili maablihan ang link. Susiha ang inyong koneksyon sa internet.',
  ikametGuncellendi: 'Na-update ang inyong pinuy-anan',
  ikametKaydedilemedi: 'Dili ma-save ang inyong pinuy-anan',
  kartiKapatin: 'Isira ang card sa pagbiyahe',
  burasiEvimErisim: 'Kini ang akong puy-anan, i-save isip akong pinuy-anan',
  burasiEvim: 'Kini ang puy-anan',
  diyanetteOkuyunErisim: 'Basaha ang fatwa sa Diyanet sa browser',
  diyanetteOkuyun: 'Basaha sa Diyanet',
  sayfa: {
    kayitliKonum: 'Na-save nga lokasyon',
    henuzKaydedilmedi: 'Wala pa ma-save — ang inyong unang lokasyon giisip nga pinuy-anan',
    buradasiniz: 'Ania kamo karon dinhi',
    uzaktasiniz: 'Mga {km} km kamo karon ang gilay-on kon tul-id nga linya',
    konumBilinmiyor: 'Wala pa mahibaloi ang inyong lokasyon; pagpili una og lokasyon',
    giris:
      'Kon mga {km} km kamo gikan sa inyong pinuy-anan, makita sa home screen ang mubong card sa impormasyon nga nagsumaryo sa mga fatwa sa Diyanet. Makita ang card kausa matag biyahe ug walay ipadalang pahibalo.',
    bilgiKarti: 'Card sa impormasyon',
    kartBaslik: 'Card sa impormasyon sa pagbiyahe',
    gosterilir: 'Makita sa home screen',
    gosterilmez: 'Dili makita',
    mezhepNotu: 'Nagsunod ang card sa inyong eskwelahan sa fiqh; mapili ninyo kini sa Mga setting › Mga oras sa Salah.',
    ikametYeri: 'Pinuy-anan',
    ikametYapErisim: 'I-save ang inyong karon nga lokasyon isip pinuy-anan',
    ikametYap: 'Himoang pinuy-anan ang karon nga lokasyon',
    kaynaklar: 'Mga tinubdan (Diyanet High Board of Religious Affairs)',
    kaynakErisim: '{etiket}. Maabli sa browser',
    /** Not shown outside Turkish (Türkiye-only service). */
    fetvaHatti: 'Alang sa mga pangutana, mahimo kamong motawag sa 190 nga linya sa fatwa sa Diyanet.',
  },
};
