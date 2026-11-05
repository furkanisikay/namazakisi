import type { Sozluk } from '../tr';

/** Fatwa z’inkomoko ziri mu Giturukiya; akarango kabivuga. Nta mvugo y’itegeko (ni amakuru gusa). */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'Hanafi', safii: 'Shafi’i' },
  kaynaklar: {
    vatan: 'Urugo, aho umuntu atuye n’aho acumbika by’igihe gito mu rugendo (mu Giturukiya)',
    cem: 'Iswala zishobora guhuzwa (jam’)? (mu Giturukiya)',
    baslangic: 'Urugendo rutangira ryari? (mu Giturukiya)',
    ziyaret: 'Usura ababyeyi be mu mujyi wabo afatwa nk’umugenzi? (mu Giturukiya)',
  },
  bilgiNotu:
    'Aya ni amakuru, si fatwa. Kuba mufatwa nk’abagenzi biterwa n’intego n’uburebure bw’urugendo rwanyu n’umugambi wanyu.',
  baslik: 'Bigaragara ko muri mu rugendo',
  mesafeSatiri: 'Muri hafi km {km} uvuye aho mutuye, mu murongo ugororotse. Ibyo Diyanet itangaza kuri mazhabu ya {mezhep}:',
  maddeler: {
    hanefi: [
      'Muri mazhabu ya Hanafi, intera y’urugendo (safar) ni hafi km 90. Uteganya kumara munsi y’iminsi 15 aho agiye afatwa nk’umugenzi.',
      'Umugenzi asali iswala z’itegeko za raka enye nka raka ebyiri (qasr).',
      'Muri mazhabu ya Hanafi, guhuza iswala ebyiri (jam’) bikorwa gusa mu gihe cya Hija, i Arafat na Muzdalifah. Diyanet ivuga kandi ko mu mpamvu zikomeye nk’urugendo, umuntu ashobora gukurikiza imyumvire y’izindi mazhabu.',
    ],
    safii: [
      'Muri mazhabu ya Shafi’i nayo, intera y’urugendo ni hafi km 90. Niba igihe cyo kuguma aho agiye kiri munsi y’iminsi 4, hatabariwemo umunsi wo kuhagera n’uwo kuhava, amategeko y’urugendo arakomeza.',
      'Umugenzi asali iswala z’itegeko za raka enye nka raka ebyiri (qasr).',
      'Muri mazhabu ya Shafi’i, urugendo ni impamvu yemewe yo guhuza (jam’) Adhuhuri na Asr, na Maghrib na Isha.',
    ],
  },
  ozetAcik: 'Bifunguye · {mezhep}',
  ozetKapali: 'Bifunze',
  baglantiAcilamadi: 'Link ntiyashoboye gufunguka. Murebe interineti yanyu.',
  ikametGuncellendi: 'Aho mutuye havuguruwe',
  ikametKaydedilemedi: 'Aho mutuye ntihashoboye kubikwa',
  kartiKapatin: 'Gufunga ikarita y’urugendo',
  burasiEvimErisim: 'Aha ni mu rugo, kuhabika nk’aho ntuye',
  burasiEvim: 'Aha ni mu rugo',
  diyanetteOkuyunErisim: 'Gusoma fatwa ya Diyanet muri mushakisha',
  diyanetteOkuyun: 'Gusoma kuri Diyanet',
  sayfa: {
    kayitliKonum: 'Ahantu habitswe',
    henuzKaydedilmedi: 'Ntiharabikwa — aho mwabanje kuba hafatwa nk’aho mutuye',
    buradasiniz: 'Ubu muri hano',
    uzaktasiniz: 'Ubu muri kure hafi km {km} mu murongo ugororotse',
    konumBilinmiyor: 'Aho muherereye ntiharamenyekana; mubanze muhitemo ahantu',
    giris:
      'Iyo muri hafi km {km} uvuye aho mutuye, ikarita ngufi y’amakuru ikusanya fatwa za Diyanet igaragara ku rupapuro rw’ibanze. Ikarita igaragara rimwe kuri buri rugendo kandi ntiyohereza amamenyesha.',
    bilgiKarti: 'Ikarita y’amakuru',
    kartBaslik: 'Ikarita y’amakuru y’urugendo',
    gosterilir: 'Igaragara ku rupapuro rw’ibanze',
    gosterilmez: 'Ntigaragara',
    mezhepNotu: 'Ikarita ikurikiza mazhabu yanyu; mushobora kuyihitamo muri Igenamiterere › Ibihe by’iswala.',
    ikametYeri: 'Aho mutuye',
    ikametYapErisim: 'Kubika aho muri ubu nk’aho mutuye',
    ikametYap: 'Kugira aho ndi ubu aho ntuye',
    kaynaklar: 'Inkomoko (Inama Nkuru y’Iby’Idini ya Diyanet)',
    kaynakErisim: '{etiket}. Bifungukira muri mushakisha',
    /** Ntibigaragara hanze y’Igiturukiya (serivisi yo muri Türkiye gusa). */
    fetvaHatti: 'Ku bibazo, mushobora guhamagara umurongo wa fatwa wa Diyanet 190.',
  },
};
