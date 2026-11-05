import type { Sozluk } from '../tr';

/** Kaynak fetvalar Türkçedir; etiket bunu söyler. Hüküm kipi yok (bilgi aktarımı). */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'Hanafi', safii: 'Shafi’i' },
  kaynaklar: {
    vatan: 'Fie, tenabea ne berɛ tiawa tenabea wɔ akwantuo mu (Tɛɛki kasa)',
    cem: 'Wobɛtumi aka Nyamefrɛ abom (jam’)? (Tɛɛki kasa)',
    baslangic: 'Ɛberɛ bɛn na akwantuo hyɛ ase? (Tɛɛki kasa)',
    ziyaret: 'Obi a ɔkɔsra n’awofoɔ wɔ wɔn kuro mu no yɛ ɔkwantuni? (Tɛɛki kasa)',
  },
  bilgiNotu:
    'Yei yɛ nsɛm a ɛkyerɛ wo, ɛnyɛ mmara. Sɛ wobɛyɛ ɔkwantuni anaa, ɛgyina wo akwantuo botaeɛ ne ne tenten ne wo adwene so.',
  baslik: 'Ɛte sɛ woretu kwan',
  mesafeSatiri: 'Wo ne wo tenabea ntam yɛ bɛyɛ {km} km (kwan tẽẽ). Deɛ Diyanet ka fa {mezhep} kuo ho:',
  maddeler: {
    hanefi: [
      'Wɔ Hanafi kuo mu no, akwantuo (safar) kwan tenten yɛ bɛyɛ 90 km. Obi a ɔpɛ sɛ ɔtena baabi a ɔrekɔ no nna a ɛnnu 15 no yɛ ɔkwantuni.',
      'Ɔkwantuni yɛ Nyamefrɛ a ɛyɛ raka anan a ɛyɛ nhyɛ no raka mmienu (qasr).',
      'Wɔ Hanafi kuo mu no, wɔka Nyamefrɛ mmienu bom (jam’) Hajj berɛ mu nko ara, wɔ Arafat ne Muzdalifah. Diyanet ka nso sɛ, sɛ asɛm a emu yɛ den te sɛ akwantuo ba a, obi betumi adi kuo afoforo no adwene akyi.',
    ],
    safii: [
      'Wɔ Shafi’i kuo mu nso no, akwantuo kwan tenten yɛ bɛyɛ 90 km. Sɛ tenabea a ɔrekɔ no nna nnu 4 a (da a ɔduruu ne da a ɔfiri hɔ nka ho), akwantuo mmara no kɔ so.',
      'Ɔkwantuni yɛ Nyamefrɛ a ɛyɛ raka anan a ɛyɛ nhyɛ no raka mmienu (qasr).',
      'Wɔ Shafi’i kuo mu no, akwantuo yɛ asɛm a ɛfata sɛ wɔka Dhuhr ne Asr bom, ne Maghrib ne Isha bom (jam’).',
    ],
  },
  ozetAcik: 'Abue · {mezhep}',
  ozetKapali: 'Ato mu',
  baglantiAcilamadi: 'Wɔantumi ammue link no. Hwɛ wo intanɛt.',
  ikametGuncellendi: 'Wɔasesa wo tenabea',
  ikametKaydedilemedi: 'Wɔantumi ansie wo tenabea',
  kartiKapatin: 'To akwantuo kaad no mu',
  burasiEvimErisim: 'Ha ne me fie, fa sie sɛ me tenabea',
  burasiEvim: 'Ha ne me fie',
  diyanetteOkuyunErisim: 'Kenkan Diyanet fatwa no wɔ browsa mu',
  diyanetteOkuyun: 'Kenkan wɔ Diyanet so',
  sayfa: {
    kayitliKonum: 'Beaeɛ a wɔasie',
    henuzKaydedilmedi: 'Wɔnnya nsiei — wo beaeɛ a edi kan no na ɛyɛ wo tenabea',
    buradasiniz: 'Wowɔ ha seesei',
    uzaktasiniz: 'Seesei wowɔ bɛyɛ {km} km (kwan tẽẽ) akyiri',
    konumBilinmiyor: 'Wɔnnya nhunuu wo beaeɛ; di kan paw beaeɛ bi',
    giris:
      'Sɛ wowɔ bɛyɛ {km} km firi wo tenabea a, kaad tiawa bi a ɛka Diyanet fatwa no tiawa bɛda adi wɔ skrin titire so. Kaad no da adi prɛko pɛ wɔ akwantuo biara mu na ɛmmena amaneɛbɔ biara.',
    bilgiKarti: 'Nsɛm kaad',
    kartBaslik: 'Akwantuo nsɛm kaad',
    gosterilir: 'Ɛda adi wɔ skrin titire so',
    gosterilmez: 'Ɛnda adi',
    mezhepNotu: 'Kaad no di wo kuo (mazhab) akyi; wobɛtumi apaw no wɔ Nhyehyɛe › Nyamefrɛ mmerɛ mu.',
    ikametYeri: 'Tenabea',
    ikametYapErisim: 'Fa wo beaeɛ a wowɔ seesei sie sɛ wo tenabea',
    ikametYap: 'Fa me beaeɛ seesei yɛ me tenabea',
    kaynaklar: 'Nsɛm fibea (Diyanet Nyamesom Nsɛm Badwa Kɛseɛ)',
    kaynakErisim: '{etiket}. Ɛbue wɔ browsa mu',
    /** Not shown outside Turkish (Türkiye-only service). */
    fetvaHatti: 'Sɛ wowɔ nsɛmmisa a, wobɛtumi afrɛ Diyanet fatwa fon nɔma 190.',
  },
};
