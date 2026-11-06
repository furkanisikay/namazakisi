import type { Sozluk } from '../tr';

/**
 * Kaynak fetvalar Türkçedir; etiket bunu söyler. Hüküm kipi yok (bilgi aktarımı). Yolcu "sochanda"
 * (QuranEnc 4:43), yol almak "sochɛndi"; kasr ve cem Arapça adlarıyla.
 */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'Hanafi', safii: 'Shaafi’i' },
  kaynaklar: {
    vatan: 'Yiŋa, zaŋ zali luɣili mini sochɛndi zaŋ chiŋ (Turkish ni)',
    cem: 'Bɛ ni tooi laɣim jiŋa (jam’)? (Turkish ni)',
    baslangic: 'Sochɛndi piligiri saha bo? (Turkish ni)',
    ziyaret: 'Ŋun chaŋ o ba mini o ma tiŋa nyɛla sochanda? (Turkish ni)',
  },
  bilgiNotu:
    'Ŋɔ nyɛla lahabali, pa hukumi. Yi yi nyɛ sochanda bee pa, di doli la yi sochɛndi daliri mini di waɣilim mini yi niya.',
  baslik: 'Di wuhiya ni yi sochɛndi',
  mesafeSatiri: 'Yi zooya kamani km {km} yi zaŋ zali luɣili ni, ka di nyɛ soli din tiri. Diyanet ni wuhi shɛli {mezhep} mazhab zuɣu:',
  maddeler: {
    hanefi: [
      'Hanafi mazhab ni, sochɛndi (safar) zuliŋ nyɛla kamani km 90. Ŋun niya ni o ni be o ni chaŋ luɣ’ shɛli dabsa 15 ka di bi paai, o nyɛla sochanda.',
      'Sochanda puhirila jiŋli talahi din mali rakaa anahi rakaa ayi (qasr).',
      'Hanafi mazhab ni, jiŋa ayi laɣimbu (jam’) be Hajji saha ni koŋko, Arafa mini Muzdalifa. Diyanet lahi yɛli ni daliri din kpɛŋ kamani sochɛndi ni, so ni tooi doli mazhab shɛŋa yɛltɔɣa.',
    ],
    safii: [
      'Shaafi’i mazhab ni gba, sochɛndi zuliŋ nyɛla kamani km 90. Yi yi be luɣ’ shɛli dabsa 4 ka di bi paai, ka bi kali kpɛbu mini yibu dabsa, sochɛndi hukumi na beni.',
      'Sochanda puhirila jiŋli talahi din mali rakaa anahi rakaa ayi (qasr).',
      'Shaafi’i mazhab ni, sochɛndi nyɛla daliri n-ti Azafari mini Lahisari laɣimbu, ni Magarbi mini Isha’i laɣimbu (jam’).',
    ],
  },
  ozetAcik: 'Yooya · {mezhep}',
  ozetKapali: 'Kpariya',
  baglantiAcilamadi: 'Soli maa bi tooi yooi. Lihimi ya yi intanɛt.',
  ikametGuncellendi: 'Bɛ taɣi yi zaŋ zali luɣili',
  ikametKaydedilemedi: 'Bɛ bi tooi zali yi zaŋ zali luɣili',
  kartiKapatin: 'Kpihimi ya sochɛndi kaati',
  burasiEvimErisim: 'Ŋɔ nyɛla n yiŋa, zalimi li n zaŋ zali luɣili',
  burasiEvim: 'Ŋɔ nyɛla n yiŋa',
  diyanetteOkuyunErisim: 'Karimmi ya Diyanet fatwa maa intanɛt ni',
  diyanetteOkuyun: 'Karimmi ya Diyanet ni',
  sayfa: {
    kayitliKonum: 'Luɣili din zali',
    henuzKaydedilmedi: 'Bɛ na bi zali — yi luɣili din daŋ n-nyɛ yi zaŋ zali luɣili',
    buradasiniz: 'Yi be kpe pumpɔŋɔ',
    uzaktasiniz: 'Yi zooya kamani km {km} pumpɔŋɔ, soli din tiri',
    konumBilinmiyor: 'Bɛ na bi baŋ yi luɣili; piimi ya luɣili tooni',
    giris:
      'Yi yi zooi kamani km {km} yi zaŋ zali luɣili, lahabali kaati din tiri Diyanet fatwa nima jia ni yi solɔɣu yaɣili zuɣu. Kaati maa yiri la sochɛndi kam sahayini ka bi tumdi lahabali.',
    bilgiKarti: 'Lahabali kaati',
    kartBaslik: 'Sochɛndi lahabali kaati',
    gosterilir: 'Bɛ wuhiri li solɔɣu yaɣili zuɣu',
    gosterilmez: 'Bɛ bi wuhiri li',
    mezhepNotu: 'Kaati maa doli la yi mazhab; yi ni tooi piri li Malizali › Jiŋli saha ni.',
    ikametYeri: 'Zaŋ zali luɣili',
    ikametYapErisim: 'Zalimi ya yi pumpɔŋɔ luɣili ka di nyɛ yi zaŋ zali luɣili',
    ikametYap: 'Zalimi ya pumpɔŋɔ luɣili n yiŋa',
    kaynaklar: 'Yibu shee nima (Diyanet High Board of Religious Affairs)',
    kaynakErisim: '{etiket}. Di yooiri intanɛt ni',
    /** Not shown outside Turkish (Türkiye-only service). */
    fetvaHatti: 'Bohisi zuɣu, yi ni tooi boli Diyanet fatwa tilifoŋ 190.',
  },
};
