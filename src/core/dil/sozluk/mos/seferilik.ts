import type { Sozluk } from '../tr';

/** Kaynak fetvalar Türkçedir; etiket bunu söyler. Hüküm kipi yok (bilgi aktarımı). */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'Hanafi', safii: 'Shaafiʼi' },
  kaynaklar: {
    vatan: 'Zĩnd-zĩiga, zakã la zĩndg bilf sor zug yell pʋgẽ (Turki goamẽ)',
    cem: 'B tõe n lagem pʋʋs-rãmbã (jam\')? (Turki goamẽ)',
    baslangic: 'Sor-kẽndr sɩngda wakat bõe? (Turki goamẽ)',
    ziyaret: 'Ned sẽn kẽng n ges a ma la a ba tẽngã yaa sor-kẽnda? (Turki goamẽ)',
  },
  bilgiNotu:
    'Woto yaa bãngre, pa saria ye. Y sẽn yaa sor-kẽnd maa ka yaa ye bee y sor-kẽndrã raabã, a wogdo la y niyã pʋgẽ.',
  baslik: 'A wõnda y bee sor zug',
  mesafeSatiri: 'Y zãrgame wala {km} km ne y zĩnd-zĩigã, sor sẽn tɩrg zugu. Diyanet sẽn togsd {mezhep} mazhabã yĩnga:',
  maddeler: {
    hanefi: [
      'Hanafi mazhabã pʋgẽ, sor-kẽndr (safar) zãrgã yaa wala km 90. Ned ning sẽn dat n zĩnd zĩig a sẽn kẽngdẽ wã rasem sẽn pa ta 15 ye yaa sor-kẽnda.',
      'Sor-kẽnd pʋʋsda farila pʋʋsg sẽn tar rakaa a naase wã rakaa a yiibu (qasr).',
      'Hanafi mazhabã pʋgẽ, pʋʋsg a yiib lagmã (jam\') yaa Hajj wakatẽ bala, Arafat la Muzdalifa. Diyanet me wilgdame tɩ yell-kʋʋs wala sor-kẽndr pʋgẽ, ned tõe n tũ mazhab a taabã tagsgo.',
    ],
    safii: [
      'Shaafiʼi mazhabã pʋgẽ me, sor-kẽndr zãrgã yaa wala km 90. Zĩndgã zĩig a sẽn kẽngdẽ wã sã n pa ta rasem 4 ye, sẽn ka sõd ta-raarã la yi-raarã, sor-kẽndr sariyã kelgda.',
      'Sor-kẽnd pʋʋsda farila pʋʋsg sẽn tar rakaa a naase wã rakaa a yiibu (qasr).',
      'Shaafiʼi mazhabã pʋgẽ, sor-kẽndr yaa sabab sẽn sõmb n lagem (jam\') Zafar ne Laansar la Magrib ne Sãanfo.',
    ],
  },
  ozetAcik: 'Pakame · {mezhep}',
  ozetKapali: 'Pagame',
  baglantiAcilamadi: 'B pa tõog n pak lagmã ye. Ges-y y internet lagmã.',
  ikametGuncellendi: 'B teega y zĩnd-zĩigã',
  ikametKaydedilemedi: 'B pa tõog n bĩng y zĩnd-zĩigã ye',
  kartiKapatin: 'Pag-y sor-kẽndr kaartã',
  burasiEvimErisim: 'Ka yaa m zakã, bĩng-y-a wala m zĩnd-zĩiga',
  burasiEvim: 'Ka yaa m zakã',
  diyanetteOkuyunErisim: 'Karem-y Diyanet fatwã internet pʋgẽ',
  diyanetteOkuyun: 'Karem-y Diyanet zugu',
  sayfa: {
    kayitliKonum: 'Zĩig sẽn bĩnge',
    henuzKaydedilmedi: 'B nan ka bĩng-a ye — y zĩig sẽn deng pĩndã na n yɩ y zĩnd-zĩiga',
    buradasiniz: 'Y bee ka masã',
    uzaktasiniz: 'Masã y zãrgame wala {km} km, sor sẽn tɩrg zugu',
    konumBilinmiyor: 'B nan ka bãng y zĩigã ye; tũus-y zĩig pĩnda',
    giris:
      'Y sã n zãrg wala {km} km ne y zĩnd-zĩigã, bãngr kaart sẽn wilgd Diyanet fatwa-rãmbã na n puk sɩngr ekraanẽ wã. Kaartã pukda noor a ye sor-kẽndr fãa, la a pa tʋmd kibar ye.',
    bilgiKarti: 'Bãngr kaarte',
    kartBaslik: 'Sor-kẽndr bãngr kaarte',
    gosterilir: 'B wilgda-a sɩngr ekraanẽ',
    gosterilmez: 'B pa wilgd-a ye',
    mezhepNotu: 'Kaartã tũuda y mazhabã; y tõe n tũus-a Seglgo › Pʋʋsg wakato pʋgẽ.',
    ikametYeri: 'Zĩnd-zĩiga',
    ikametYapErisim: 'Bĩng-y y zĩig ning y sẽn be masã wala y zĩnd-zĩiga',
    ikametYap: 'M zĩig ning m sẽn be masã yɩ m zĩnd-zĩiga',
    kaynaklar: 'Yi-zĩisi (Diyanet dĩinã yɛl taoor-kẽndb siglgã)',
    kaynakErisim: '{etiket}. A pakda internet pʋgẽ',
    /** Türkçe dışında gösterilmez (yalnız Türkiye'deki hizmet). */
    fetvaHatti: 'Sokr yĩnga, y tõe n bool Diyanet fatwa telefõn 190.',
  },
};
