import type { Sozluk } from '../tr';

/** Kaynak fetvalar Türkçedir; etiket bunu söyler. Hüküm kipi yok (bilgi aktarımı). */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'Hanafi', safii: 'Shafi’i' },
  kaynaklar: {
    vatan: 'Awaka, aw’obeera n’aw’obeera okumala akaseera mu lugendo (mu Lutake)',
    cem: 'Esswala zisobola okugattibwa (jam’)? (mu Lutake)',
    baslangic: 'Olugendo lutandika ddi? (mu Lutake)',
    ziyaret: 'Omuntu akyalira ekibuga ky’abazadde be aba mutambuze? (mu Lutake)',
  },
  bilgiNotu:
    'Kino kyakumanya, si kiragiro. Okubalibwa ng’omutambuze kusinziira ku kigendererwa n’obuwanvu bw’olugendo lwo, ne ku niyya yo.',
  baslik: 'Kirabika oli ku lugendo',
  mesafeSatiri: 'Oli km nga {km} okuva w’obeera, ng’opimira mu bbanga. Diyanet ky’etegeeza ku madhhab ya {mezhep}:',
  maddeler: {
    hanefi: [
      'Mu madhhab ya Hanafi, obuwanvu bw’olugendo (safar) buli nga km 90. Omuntu agenderera okubeera ennaku ezitasukka 15 gy’agenda abalibwa ng’omutambuze.',
      'Omutambuze asaala esswala za faradha eza raaka nnya nga raaka bbiri (qasr).',
      'Mu madhhab ya Hanafi, okugatta esswala bbiri (jam’) kuli mu Hijja yokka, e Arafa ne Muzdalifa. Diyanet era eraga nti mu nsonga enkulu ng’olugendo, omuntu ayinza okugoberera endowooza ya madhhab endala.',
    ],
    safii: [
      'Ne mu madhhab ya Shafi’i, obuwanvu bw’olugendo buli nga km 90. Singa okubeera gy’agenda kuli wansi w’ennaku 4, nga tobaze nnaku za kutuuka na kuvaayo, amateeka g’olugendo gagenda mu maaso.',
      'Omutambuze asaala esswala za faradha eza raaka nnya nga raaka bbiri (qasr).',
      'Mu madhhab ya Shafi’i, olugendo nsonga ntuufu ey’okugatta (jam’) Dhuhur ne Aswiri, ne Magaribi ne Ishai.',
    ],
  },
  ozetAcik: 'Kiri ku · {mezhep}',
  ozetKapali: 'Kiggyiddwako',
  baglantiAcilamadi: 'Enkolagana tesobodde kugguka. Kebera intaneeti yo.',
  ikametGuncellendi: 'W’obeera wazzibwawo obuggya',
  ikametKaydedilemedi: 'W’obeera tewasobodde kuterekebwa',
  kartiKapatin: 'Ggalawo kaadi y’olugendo',
  burasiEvimErisim: 'Wano we mbeera, terekawo nga w’obeera',
  burasiEvim: 'Wano we mbeera',
  diyanetteOkuyunErisim: 'Soma fatwa ya Diyanet mu browser',
  diyanetteOkuyun: 'Soma ku Diyanet',
  sayfa: {
    kayitliKonum: 'Ekifo ekiterekeddwa',
    henuzKaydedilmedi: 'Tekinnaterekebwa — ekifo kyo ekisooka kibalibwa nga w’obeera',
    buradasiniz: 'Kati oli wano',
    uzaktasiniz: 'Kati oli km nga {km} okuva wano, ng’opimira mu bbanga',
    konumBilinmiyor: 'Ekifo kyo tekinnamanyika; sooka olonde ekifo',
    giris:
      'Bw’oba oli km nga {km} okuva w’obeera, kaadi entono ey’okumanya ewumbako fatwa za Diyanet erabika ku lupapula olukulu. Kaadi erabika omulundi gumu buli lugendo era tesindika bubaka.',
    bilgiKarti: 'Kaadi ey’okumanya',
    kartBaslik: 'Kaadi ey’okumanya ku lugendo',
    gosterilir: 'Erabika ku lupapula olukulu',
    gosterilmez: 'Terabika',
    mezhepNotu: 'Kaadi egoberera madhhab yo; osobola okugironda mu Ntegeka › Ebiseera by’esswala.',
    ikametYeri: 'W’obeera',
    ikametYapErisim: 'Tereka ekifo kyo ekya kati nga w’obeera',
    ikametYap: 'Ekifo kya kati kibe we mbeera',
    kaynaklar: 'Ensibuko (Olukiiko Olukulu olw’Eddiini olwa Diyanet)',
    kaynakErisim: '{etiket}. Kigguka mu browser',
    /** Not shown outside Turkish (Türkiye-only service). */
    fetvaHatti: 'Ku bibuuzo, osobola okukuba essimu ku layini ya fatwa eya Diyanet 190.',
  },
};
