import type { Sozluk } from '../tr';

/** Kaynak fetvalar Türkçedir; etiket bunu söyler. Hüküm kipi yok (bilgi aktarımı). */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'Hanafi', safii: "Shafi'i" },
  kaynaklar: {
    vatan: 'Mboka, esika ya kofanda mpe kofanda mwa moke na makambo ya mobembo (na Litiliki)',
    cem: "Bokoki kosangisa losambo (jam')? (na Litiliki)",
    baslangic: 'Mobembo ebandaka ntango nini? (na Litiliki)',
    ziyaret: 'Moto oyo akei kotala baboti na ye na engumba na bango azali moto ya mobembo? (na Litiliki)',
  },
  bilgiNotu:
    'Oyo ezali sango, ezali mobeko te. Soki bozali moto ya mobembo to te, ezali na kolanda ntina mpe molai ya mobembo na bino, mpe mokano na bino.',
  baslik: 'Emonani ete bozali na mobembo',
  mesafeSatiri: 'Bozali pene na km {km} na esika na bino ya kofanda (na molɔngɔ semba). Oyo Diyanet eyebisaka mpɔ na eteyelo ya {mezhep}:',
  maddeler: {
    hanefi: [
      'Na eteyelo ya Hanafi, molai ya mobembo (safar) ezali pene na km 90. Moto oyo akani kofanda na esika akei mikɔlɔ moke koleka 15 azali moto ya mobembo.',
      'Moto ya mobembo asambelaka losambo ya obligatwa ya rakat minei na rakat mibale (qasr).',
      "Na eteyelo ya Hanafi, kosangisa losambo mibale (jam') ezali kaka na ntango ya Hajj, na Arafat mpe na Muzdalifah. Diyanet eyebisi mpe ete na makambo makasi lokola mobembo, moto akoki kolanda makanisi ya biteyelo mosusu.",
    ],
    safii: [
      "Na eteyelo ya Shafi'i mpe, molai ya mobembo ezali pene na km 90. Soki kofanda na esika akei ezali mikɔlɔ moke koleka 4, longola mikɔlɔ ya kokoma mpe ya kozonga, mibeko ya mobembo ekobi.",
      'Moto ya mobembo asambelaka losambo ya obligatwa ya rakat minei na rakat mibale (qasr).',
      "Na eteyelo ya Shafi'i, mobembo ezali ntina ya malamu mpɔ na kosangisa (jam') Dhuhr na Asr, mpe Maghrib na Isha.",
    ],
  },
  ozetAcik: 'Efungwami · {mezhep}',
  ozetKapali: 'Ekangami',
  baglantiAcilamadi: 'Lien efungwami te. Botala internet na bino.',
  ikametGuncellendi: 'Esika na bino ya kofanda ebongwani',
  ikametKaydedilemedi: 'Esika na bino ya kofanda ebombami te',
  kartiKapatin: 'Bokanga kartɛ ya mobembo',
  burasiEvimErisim: 'Awa ezali ndako na ngai, bobomba yango lokola esika na ngai ya kofanda',
  burasiEvim: 'Awa ezali ndako',
  diyanetteOkuyunErisim: 'Botanga fatwa ya Diyanet na navigatɛrɛ',
  diyanetteOkuyun: 'Botanga na Diyanet',
  sayfa: {
    kayitliKonum: 'Esika ebombami',
    henuzKaydedilmedi: 'Ebombami naino te — esika na bino ya liboso ekozala esika na bino ya kofanda',
    buradasiniz: 'Bozali awa sikoyo',
    uzaktasiniz: 'Sikoyo bozali mosika pene na km {km} (na molɔngɔ semba)',
    konumBilinmiyor: 'Esika na bino eyebani naino te; bopona esika liboso',
    giris:
      'Soki bozali pene na km {km} na esika na bino ya kofanda, kartɛ moke ya sango oyo ezali kolobela na mokuse fatwa ya Diyanet ekomonana na ekran ya liboso. Kartɛ ekomonana mbala mɔkɔ na mobembo mɔkɔ mpe etindaka liyebisi te.',
    bilgiKarti: 'Kartɛ ya sango',
    kartBaslik: 'Kartɛ ya sango ya mobembo',
    gosterilir: 'Emonanaka na ekran ya liboso',
    gosterilmez: 'Emonanaka te',
    mezhepNotu: 'Kartɛ elandaka eteyelo na bino; bokoki kopona yango na Mibongiseli › Bangonga ya losambo.',
    ikametYeri: 'Esika ya kofanda',
    ikametYapErisim: 'Bobomba esika bozali sikoyo lokola esika na bino ya kofanda',
    ikametYap: 'Esika nazali ezala esika na ngai ya kofanda',
    kaynaklar: 'Mikanda (Diyanet, Likita monene ya makambo ya losambo)',
    kaynakErisim: '{etiket}. Efungwamaka na navigatɛrɛ',
    /** Not shown outside Turkish (Türkiye-only service). */
    fetvaHatti: 'Mpɔ na mituna, bokoki kobenga molɔngɔ ya fatwa 190 ya Diyanet.',
  },
};
