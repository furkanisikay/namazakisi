import type { Sozluk } from '../tr';

/** Fatwooyinka ilaha ah waa Turki; calaamaddu taas ayay sheegaysaa. Qaab xukun ma jiro (gudbin macluumaad). */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'Xanafi', safii: 'Shaafici' },
  kaynaklar: {
    vatan: 'Guriga, deegaanka iyo joogitaanka ku-meel-gaarka ah ee xagga safarka (Turki)',
    cem: 'Ma la isku dari karaa salaadaha (jamac)? (Turki)',
    baslangic: 'Goorma ayuu safarku bilaabmaa? (Turki)',
    ziyaret: 'Qofka booqanaya magaalada waalidkiis ma musaafir baa? (Turki)',
  },
  bilgiNotu:
    'Kani waa macluumaad, ma aha xukun. Inaad tahay musaafir iyo in kale waxay ku xiran tahay ujeeddada iyo dhererka safarkaaga iyo niyaddaada.',
  baslik: 'Waxay u egtahay inaad safar ku jirto',
  mesafeSatiri: 'Waxaad qiyaastii {km} km toos ah u jirtaa deegaankaaga. Waxa Diyanet ka gudbisay madhabka {mezhep}:',
  maddeler: {
    hanefi: [
      'Madhabka Xanafi, masaafada safarku waa qiyaastii 90 km. Qofka niyadsan inuu meesha uu u socdo joogo wax ka yar 15 maalmood waa musaafir.',
      'Musaafirku salaadaha faralka ah ee afarta rakco wuxuu u tukadaa laba rakco (qasar).',
      'Madhabka Xanafi, isku darka laba salaadood (jamac) waa oo kaliya xajka, Carafo iyo Muzdalifa. Diyanet waxay sidoo kale xustay in cudurdaarrada culus sida safarka lagu raaci karo aragtida madaahibta kale.',
    ],
    safii: [
      'Madhabka Shaaficiga sidoo kale, masaafada safarku waa qiyaastii 90 km. Haddii joogitaanka meesha loo socdo uu ka yar yahay 4 maalmood, iyadoon la tirin maalmaha imaanshaha iyo ka bixitaanka, xukunnada safarku way sii socdaan.',
      'Musaafirku salaadaha faralka ah ee afarta rakco wuxuu u tukadaa laba rakco (qasar).',
      'Madhabka Shaaficiga, safarku waa cudurdaar sax ah oo lagu isku daro (jamac) Duhur iyo Casar, iyo Maghrib iyo Cishe.',
    ],
  },
  ozetAcik: 'Shidan · {mezhep}',
  ozetKapali: 'Dansan',
  baglantiAcilamadi: 'Xiriirka lama furi karin. Hubi xiriirka internetkaaga.',
  ikametGuncellendi: 'Deegaankaaga waa la cusboonaysiiyay',
  ikametKaydedilemedi: 'Deegaankaaga lama kaydin karin',
  kartiKapatin: 'Xir kaarka safarka',
  burasiEvimErisim: 'Halkani waa gurigayga, u kaydi deegaankayga ahaan',
  burasiEvim: 'Halkani waa gurigayga',
  diyanetteOkuyunErisim: 'Ka akhri fatwada Diyanet daaqadda internetka',
  diyanetteOkuyun: 'Ka akhri Diyanet',
  sayfa: {
    kayitliKonum: 'Goobta la kaydiyay',
    henuzKaydedilmedi: 'Weli lama kaydin — goobtaada ugu horreysa ayaa loo xisaabiyaa deegaankaaga',
    buradasiniz: 'Hadda halkan ayaad joogtaa',
    uzaktasiniz: 'Hadda waxaad qiyaastii {km} km toos ah u jirtaa',
    konumBilinmiyor: 'Goobtaada weli lama yaqaan; marka hore dooro goob',
    giris:
      'Marka aad qiyaastii {km} km u jirto deegaankaaga, kaar macluumaad oo gaaban oo soo koobaya fatwooyinka Diyanet ayaa ka soo baxa shaashadda hore. Kaarku hal mar ayuu safar kasta soo baxaa, ogeysiisna ma diro.',
    bilgiKarti: 'Kaarka macluumaadka',
    kartBaslik: 'Kaarka macluumaadka safarka',
    gosterilir: 'Waxaa lagu tusaa shaashadda hore',
    gosterilmez: 'Lama tuso',
    mezhepNotu: 'Kaarku wuxuu raacaa madhabkaaga; waxaad ka dooran kartaa Dejinta › Waqtiyada salaadda.',
    ikametYeri: 'Deegaanka',
    ikametYapErisim: 'U kaydi goobtaada hadda deegaankaaga ahaan',
    ikametYap: 'Goobtayda hadda ka dhig deegaankayga',
    kaynaklar: 'Ilaha (Golaha Sare ee Arrimaha Diinta ee Diyanet)',
    kaynakErisim: '{etiket}. Wuxuu ka furmaa daaqadda internetka',
    /** Lama tuso luqadaha aan Turkiga ahayn (adeeg Turkiga oo kaliya). */
    fetvaHatti: 'Su\'aalaha, waxaad wici kartaa khadka fatwada Diyanet ee 190.',
  },
};
