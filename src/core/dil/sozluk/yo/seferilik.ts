import type { Sozluk } from '../tr';

/** Kaynak fetvalar Türkçedir; etiket bunu söyler. Hüküm kipi yok (bilgi aktarımı). Safar = "ìrìn-àjò" (5:6). */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'Hanafi', safii: 'Shāfi‘ī' },
  kaynaklar: {
    vatan: 'Ilé, ibùgbé àti ìdúró fún ìgbà díẹ̀ nípa ìrìn-àjò (ní Èdè Tọọkisi)',
    cem: 'Ṣé a lè pa àwọn ìrun pọ̀ (jam‘)? (ní Èdè Tọọkisi)',
    baslangic: 'Nígbà wo ni ìrìn-àjò ń bẹ̀rẹ̀? (ní Èdè Tọọkisi)',
    ziyaret: 'Ṣé ẹni tí ó lọ bẹ àwọn òbí rẹ̀ wò ní ìlú wọn jẹ́ arìnrìn-àjò? (ní Èdè Tọọkisi)',
  },
  bilgiNotu:
    'Àlàyé ni èyí, kì í ṣe ìdájọ́. Bóyá a ka yín sí arìnrìn-àjò gbára lé èrèdí àti gígùn ìrìn-àjò yín àti lórí àníyàn yín.',
  baslik: 'Ó dà bí ẹni pé ẹ ń rìnrìn-àjò',
  mesafeSatiri: 'Ẹ wà ní nǹkan bí km {km} sí ibùgbé yín ní ọ̀nà tààrà. Ohun tí Diyanet sọ fún mazhab {mezhep}:',
  maddeler: {
    hanefi: [
      'Nínú mazhab Hanafi, jíjìn ìrìn-àjò (safar) jẹ́ nǹkan bí km 90. Ẹni tí ó ní àníyàn láti dúró fún ọjọ́ tí kò tó 15 ní ibi tí ó ń lọ ni a kà sí arìnrìn-àjò.',
      'Arìnrìn-àjò ń kí àwọn ìrun ọ̀ran-anyàn oní-rak‘ah mẹ́rin ní rak‘ah méjì (qasr).',
      'Nínú mazhab Hanafi, pípa ìrun méjì pọ̀ (jam‘) wà nígbà Hajj nìkan, ní ‘Arafah àti Muzdalifah. Diyanet tún sọ pé nínú àwọn àwáwí ńlá bí ìrìn-àjò, ènìyàn lè tẹ̀lé èrò àwọn mazhab yòókù.',
    ],
    safii: [
      'Nínú mazhab Shāfi‘ī pẹ̀lú, jíjìn ìrìn-àjò jẹ́ nǹkan bí km 90. Tí ìdúró ní ibi tí a ń lọ bá kéré sí ọjọ́ 4, láìka ọjọ́ dídé àti ọjọ́ ìlọ, àwọn ìdájọ́ ìrìn-àjò ń bá a lọ.',
      'Arìnrìn-àjò ń kí àwọn ìrun ọ̀ran-anyàn oní-rak‘ah mẹ́rin ní rak‘ah méjì (qasr).',
      'Nínú mazhab Shāfi‘ī, ìrìn-àjò jẹ́ àwáwí tó tọ́ fún pípa (jam‘) Ṭḥuhr pọ̀ mọ́ ‘Asr àti Mọgrib pọ̀ mọ́ ‘Iṣā’.',
    ],
  },
  ozetAcik: 'Ó wà ní títàn · {mezhep}',
  ozetKapali: 'Ó wà ní pípa',
  baglantiAcilamadi: 'A kò lè ṣí ìjápọ̀ náà. Ẹ ṣàyẹ̀wò ìsopọ̀ íntánẹ́ẹ̀tì yín.',
  ikametGuncellendi: 'A ti ṣe àfikún ibùgbé yín',
  ikametKaydedilemedi: 'A kò lè fi ibùgbé yín pamọ́',
  kartiKapatin: 'Pa káàdì ìrìn-àjò dé',
  burasiEvimErisim: 'Ilé mi nìyí, fi í pamọ́ gẹ́gẹ́ bí ibùgbé mi',
  burasiEvim: 'Ilé mi nìyí',
  diyanetteOkuyunErisim: 'Ka fatwā Diyanet nínú aṣàwákiri',
  diyanetteOkuyun: 'Kà á lórí Diyanet',
  sayfa: {
    kayitliKonum: 'Ibùdó tí a fi pamọ́',
    henuzKaydedilmedi: 'A kò tíì fi pamọ́ — ibùdó yín àkọ́kọ́ ni a ó kà sí ibùgbé yín',
    buradasiniz: 'Ẹ wà níbí báyìí',
    uzaktasiniz: 'Ẹ wà ní nǹkan bí km {km} sí ibẹ̀ báyìí ní ọ̀nà tààrà',
    konumBilinmiyor: 'A kò tíì mọ ibùdó yín; ẹ kọ́kọ́ yan ibùdó kan',
    giris:
      'Nígbà tí ẹ bá wà ní nǹkan bí km {km} sí ibùgbé yín, káàdì àlàyé kúkúrú tí ó ṣe àkópọ̀ àwọn fatwā Diyanet yóò hàn lórí ojú-ìwé àkọ́kọ́. Káàdì náà ń hàn lẹ́ẹ̀kan fún ìrìn-àjò kọ̀ọ̀kan, kò sì ń fi ìfitónilétí ránṣẹ́.',
    bilgiKarti: 'Káàdì àlàyé',
    kartBaslik: 'Káàdì àlàyé ìrìn-àjò',
    gosterilir: 'Ó ń hàn lórí ojú-ìwé àkọ́kọ́',
    gosterilmez: 'Kò ní hàn',
    mezhepNotu: 'Káàdì náà ń tẹ̀lé mazhab yín; ẹ lè yàn án nínú Ètò › Àwọn àkókò ìrun.',
    ikametYeri: 'Ibùgbé',
    ikametYapErisim: 'Fi ibùdó yín lọ́wọ́lọ́wọ́ pamọ́ gẹ́gẹ́ bí ibùgbé yín',
    ikametYap: 'Sọ ibùdó mi lọ́wọ́lọ́wọ́ di ibùgbé mi',
    kaynaklar: 'Àwọn orísun (Ìgbìmọ̀ Gíga fún Ọ̀rọ̀ Ẹ̀sìn ti Diyanet)',
    kaynakErisim: '{etiket}. Ó ń ṣí nínú aṣàwákiri',
    /** Türkçe dışında gösterilmez (yalnız Türkiye hizmeti). */
    fetvaHatti: 'Fún ìbéèrè, ẹ lè pe ìlà fatwā 190 ti Diyanet.',
  },
};
