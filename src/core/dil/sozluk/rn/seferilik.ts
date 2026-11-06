import type { Sozluk } from '../tr';

/** Kaynak fetvalar Türkçedir; etiket bunu söyler. Hüküm kipi yok (bilgi aktarımı). */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'Hanafi', safii: 'Shafi’i' },
  kaynaklar: {
    vatan: 'Ikibanza c’iwabo, aho umuntu aba n’aho aba igihe gito mu rugendo (mu Giturukiya)',
    cem: 'Amasengesho arashobora gukusanyirizwa hamwe (jam’)? (mu Giturukiya)',
    baslangic: 'Urugendo rutangura ryari? (mu Giturukiya)',
    ziyaret: 'Uwugenda kuraba abavyeyi biwe i wabo ni umugenzi? (mu Giturukiya)',
  },
  bilgiNotu:
    'Iyi ni inkuru, si itegeko. Ukuba umugenzi biterwa n’intumbero n’uburebure bw’urugendo rwanyu, hamwe n’umugambi wanyu.',
  baslik: 'Bisa n’uko muri mu rugendo',
  mesafeSatiri: 'Muri kure nka {km} km y’aho mubamwo, ku murongo ugororotse. Ivyo Diyanet ivuga kuri mazhab ya {mezhep}:',
  maddeler: {
    hanefi: [
      'Mu mazhab ya Hanafi, intera y’urugendo (safar) ni nka km 90. Uwugambiriye kuguma aho agiye munsi y’imisi 15 afatwa nk’umugenzi.',
      'Umugenzi asenga amasengesho ategekwa ya rakaa zine nka rakaa zibiri (qasr).',
      'Mu mazhab ya Hanafi, gukusanya amasengesho abiri (jam’) biba gusa mu Hija, i Arafat n’i Muzdalifa. Diyanet ivuga kandi ko mu mvo zikomeye nk’urugendo, umuntu ashobora gukurikira iciyumviro c’ayandi mazhab.',
    ],
    safii: [
      'Mu mazhab ya Shafi’i, intera y’urugendo nayo ni nka km 90. Nimba kuguma aho bagiye ari munsi y’imisi 4, hatarimwo umusi wo gushika n’uwo kugenda, amategeko y’urugendo arabandanya.',
      'Umugenzi asenga amasengesho ategekwa ya rakaa zine nka rakaa zibiri (qasr).',
      'Mu mazhab ya Shafi’i, urugendo ni imvo yemewe yo gukusanya (jam’) Adhuhuri na Asr, na Maghrib na Isha.',
    ],
  },
  ozetAcik: 'Irakora · {mezhep}',
  ozetKapali: 'Yazimijwe',
  baglantiAcilamadi: 'Ihuriro ntiryashoboye kwuguruka. Musuzume interineti yanyu.',
  ikametGuncellendi: 'Aho mubamwo havuguruwe',
  ikametKaydedilemedi: 'Aho mubamwo ntihashoboye kubikwa',
  kartiKapatin: 'Mwugare ikarata y’urugendo',
  burasiEvimErisim: 'Aha ni iwanje, hibikwe nk’aho mbamwo',
  burasiEvim: 'Aha ni iwanje',
  diyanetteOkuyunErisim: 'Musome fatwa ya Diyanet muri mushakisha',
  diyanetteOkuyun: 'Musome kuri Diyanet',
  sayfa: {
    kayitliKonum: 'Ikibanza cabitswe',
    henuzKaydedilmedi: 'Ntikirabikwa — ikibanza canyu ca mbere gifatwa nk’aho mubamwo',
    buradasiniz: 'Ubu muri ngaha',
    uzaktasiniz: 'Ubu muri kure nka {km} km ku murongo ugororotse',
    konumBilinmiyor: 'Ikibanza canyu ntikiramenyekana; mubanze muhitemwo ikibanza',
    giris:
      'Iyo muri kure nka {km} km y’aho mubamwo, ikarata ntoya y’inkuru ivunagura fatwa za Diyanet iboneka ku rupapuro nyamukuru. Ikarata iboneka rimwe ku rugendo kandi ntirungika amamenyesha.',
    bilgiKarti: 'Ikarata y’inkuru',
    kartBaslik: 'Ikarata y’inkuru y’urugendo',
    gosterilir: 'Yerekanwa ku rupapuro nyamukuru',
    gosterilmez: 'Ntiyerekanwa',
    mezhepNotu: 'Ikarata ikurikira mazhab yanyu; murashobora kuyihitamwo mu Mahitamwo › Ibihe vy’isengesho.',
    ikametYeri: 'Aho mubamwo',
    ikametYapErisim: 'Mubike ikibanza murimwo nk’aho mubamwo',
    ikametYap: 'Ikibanza ndimwo kibe aho mbamwo',
    kaynaklar: 'Isoko (Inama Nkuru y’Ivy’Idini ya Diyanet)',
    kaynakErisim: '{etiket}. Vyuguruka muri mushakisha',
    /** Türkçe dışında gösterilmez (yalnız Türkiye'de geçerli hizmet). */
    fetvaHatti: 'Ku bibazo, murashobora guhamagara umurongo wa fatwa wa Diyanet 190.',
  },
};
