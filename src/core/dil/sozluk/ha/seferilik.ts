import type { Sozluk } from '../tr';

/** Kaynak fetvalar Türkçedir; etiket bunu söyler. Hüküm kipi yok (bilgi aktarımı). Kasr "kasaru" (Gummi 4:101 dipnotu), cem "haɗa salla". */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'Hanafi', safii: 'Shafiʼi' },
  kaynaklar: {
    vatan: 'Gida, mazauni da zaman wucin gadi game da tafiya (da Harshen Turkiyya)',
    cem: 'Ana iya haɗa salloli? (da Harshen Turkiyya)',
    baslangic: 'Yaushe tafiya take farawa? (da Harshen Turkiyya)',
    ziyaret: 'Wanda ke ziyartar garin iyayensa matafiyi ne? (da Harshen Turkiyya)',
  },
  bilgiNotu:
    'Wannan bayani ne, ba hukunci ba. Ko kuna matsayin matafiyi ya dogara ne ga manufa da tsawon tafiyarku da kuma niyyarku.',
  baslik: 'Da alama kuna tafiya',
  mesafeSatiri: 'Kuna nesa da mazauninku da kusan km {km} a miƙe. Abin da Diyanet ke isarwa game da mazhabar {mezhep}:',
  maddeler: {
    hanefi: [
      'A mazhabar Hanafi, nisan tafiya kusan km 90 ne. Wanda ya yi niyyar zama ƙasa da kwana 15 a inda ya nufa yana matsayin matafiyi.',
      'Matafiyi yana yin sallolin farilla masu rakaʼa huɗu a matsayin rakaʼa biyu (kasaru).',
      'A mazhabar Hanafi, haɗa salloli biyu sai lokacin Hajji kaɗai, a Arafa da Muzdalifa. Diyanet kuma ta lura cewa a cikin manyan uzuri kamar tafiya, ana iya bin raʼayin sauran mazhabobi.',
    ],
    safii: [
      'A mazhabar Shafiʼi ma, nisan tafiya kusan km 90 ne. Idan zaman a inda aka nufa ya gaza kwana 4, ba tare da ƙidaya ranar isowa da ta tashi ba, hukunce-hukuncen tafiya suna ci gaba.',
      'Matafiyi yana yin sallolin farilla masu rakaʼa huɗu a matsayin rakaʼa biyu (kasaru).',
      'A mazhabar Shafiʼi, tafiya uzuri ne ingantacce na haɗa Azahar da Laʼasar, da Magariba da Isha.',
    ],
  },
  ozetAcik: 'A kunne · {mezhep}',
  ozetKapali: 'A kashe',
  baglantiAcilamadi: 'Ba a iya buɗe mahaɗin ba. Ku duba haɗin intanet ɗinku.',
  ikametGuncellendi: 'An sabunta mazauninku',
  ikametKaydedilemedi: 'Ba a iya ajiye mazauninku ba',
  kartiKapatin: 'Rufe katin tafiya',
  burasiEvimErisim: 'Nan ne gidana, ajiye shi a matsayin mazaunina',
  burasiEvim: 'Nan ne gida',
  diyanetteOkuyunErisim: 'Karanta fatawar Diyanet a burauza',
  diyanetteOkuyun: 'Karanta a Diyanet',
  sayfa: {
    kayitliKonum: 'Wurin da aka ajiye',
    henuzKaydedilmedi: 'Ba a ajiye ba tukuna — wurinku na farko zai zama mazauninku',
    buradasiniz: 'Kuna nan yanzu',
    uzaktasiniz: 'Yanzu kuna nesa da kusan km {km} a miƙe',
    konumBilinmiyor: 'Ba a san wurinku ba tukuna; ku fara zaɓar wuri',
    giris:
      'Idan kuna nesa da mazauninku da kusan km {km}, ƙaramin katin bayani mai taƙaita fatawowin Diyanet zai bayyana a allon gida. Katin yana bayyana sau ɗaya a kowace tafiya kuma ba ya aika sanarwa.',
    bilgiKarti: 'Katin bayani',
    kartBaslik: 'Katin bayanin tafiya',
    gosterilir: 'Ana nunawa a allon gida',
    gosterilmez: 'Ba a nunawa',
    mezhepNotu: 'Katin yana bin mazhabarku; kuna iya zaɓar ta a Saituna › Lokutan salla.',
    ikametYeri: 'Mazauni',
    ikametYapErisim: 'Ajiye wurinku na yanzu a matsayin mazauninku',
    ikametYap: 'Mai da wurina na yanzu mazaunina',
    kaynaklar: 'Tushe (Babban Kwamitin Harkokin Addini na Diyanet)',
    kaynakErisim: '{etiket}. Yana buɗewa a burauza',
    fetvaHatti: 'Don tambayoyi, kuna iya kiran layin fatawa na Diyanet a 190.',
  },
};
