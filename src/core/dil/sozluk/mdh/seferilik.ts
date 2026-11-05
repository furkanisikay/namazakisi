import type { Sozluk } from '../tr';

/** Kaynak fetvalar Türkçedir; etiket bunu söyler. Hüküm kipi yok (bilgi aktarımı). Yolculuk "safar", yolcu "musafir". */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'Hanafi', safii: "Shafi'i" },
  kaynaklar: {
    vatan: 'Walay, kawalayan endu kapagtagak sa safar (sa Turkish)',
    cem: "Makatimu bu su manga sambayang (jam')? (sa Turkish)",
    baslangic: 'Sa ngin a timpu magpamula su safar? (sa Turkish)',
    ziyaret: 'Musafir ba su taw a pedlakaw sa inged nu manga lukes nin? (sa Turkish)',
  },
  bilgiNotu:
    'Ini na impormasyun, kena hukuman. Su kapakamusafir nu na nasabap sa maksud endu kalendu nu kalakaw nu endu sa niyat nu.',
  baslik: 'Mailay a lu kanu sa safar',
  mesafeSatiri: 'Tantya {km} km i kawatan nu sa kawalayan nu, tidtu a linya. Su pidtalu nu Diyanet para sa mazhab a {mezhep}:',
  maddeler: {
    hanefi: [
      'Sa mazhab a Hanafi, su kawatan nu safar na tantya 90 km. Su taw a pedniyat a tumagak sa di pan 15 gay sa lugar a pedlakawan nin na musafir.',
      'Su musafir na edsambayang sa manga fardu a pat a rakaat sa dua a rakaat (qasr).',
      "Sa mazhab a Hanafi, su katimu nu dua a sambayang (jam') na sa Hajj bu, sa Arafat endu Muzdalifah. Pidtalu bun nu Diyanet i sa mabegat a udzur (lagid nu safar), makaunut su taw sa pikilan nu salakaw a manga mazhab.",
    ],
    safii: [
      "Sa mazhab a Shafi'i, tantya 90 km bun su kawatan nu safar. Amayka su kapagtagak sa lugar a pedlakawan na di pan 4 gay (di maisap su gay a kakawma endu kalyu), na ituluy su manga hukuman nu safar.",
      'Su musafir na edsambayang sa manga fardu a pat a rakaat sa dua a rakaat (qasr).',
      "Sa mazhab a Shafi'i, su safar na mapya a udzur para makatimu (jam') su Dhuhur endu Asr, endu su Maghrib endu Isha.",
    ],
  },
  ozetAcik: 'Naka-on · {mezhep}',
  ozetKapali: 'Naka-off',
  baglantiAcilamadi: 'Di nabukatan su link. Ilay su internet nu.',
  ikametGuncellendi: 'Nailisan su kawalayan nu',
  ikametKaydedilemedi: 'Di natagu su kawalayan nu',
  kartiKapatin: 'Takepen su card nu safar',
  burasiEvimErisim: 'Ini i walay ku, itagu sa kawalayan ku',
  burasiEvim: 'Ini i walay ku',
  diyanetteOkuyunErisim: 'Basaen su fatwa nu Diyanet sa browser',
  diyanetteOkuyun: 'Basaen sa Diyanet',
  sayfa: {
    kayitliKonum: 'Lokasyun a natagu',
    henuzKaydedilmedi: 'Da pan natagu — su paganay a lokasyun nu i kawalayan nu',
    buradasiniz: 'Lu kanu sya saguna',
    uzaktasiniz: 'Saguna, tantya {km} km i kawatan nu, tidtu a linya',
    konumBilinmiyor: 'Di pan katawan su lokasyun nu; pamili pan sa lokasyun',
    giris:
      'Amayka tantya {km} km i kawatan nu sa kawalayan nu, mailay sa home screen su isa a mapendek a card a impormasyun a pedsimpul sa manga fatwa nu Diyanet. Isa bu mailay su card sa uman safar endu di pedsugu sa notification.',
    bilgiKarti: 'Card a impormasyun',
    kartBaslik: 'Card a impormasyun sa safar',
    gosterilir: 'Mailay sa home screen',
    gosterilmez: 'Di mailay',
    mezhepNotu: 'Su card na pedsunud sa mazhab nu; mapamili nu sya kanu Manga setting › Manga waktu nu sambayang.',
    ikametYeri: 'Kawalayan',
    ikametYapErisim: 'Itagu su lokasyun nu saguna sa kawalayan nu',
    ikametYap: 'Kawalayan ku su lokasyun ku saguna',
    kaynaklar: 'Manga ebpunan (Diyanet High Board of Religious Affairs)',
    kaynakErisim: '{etiket}. Pedbukat sa browser',
    /** Türkçe dışında gösterilmez (yalnız Türkiye hizmeti). */
    fetvaHatti: 'Para sa manga pangeni, makatawag kanu sa fatwa line nu Diyanet a 190.',
  },
};
