import type { Sozluk } from '../tr';

/** Kaynak fetvalar Türkçedir; etiket bunu söyler. Hüküm kipi yok (bilgi aktarımı). */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'Xanafi', safii: 'Shaafiqi' },
  kaynaklar: {
    vatan: 'Safarih gital buxa, gali kee dago raaqa (Turkish afat)',
    cem: 'Salat gacsaanam (jamqi) duddaa? (Turkish afat)',
    baslangic: 'Safar ma qimbisaa? (Turkish afat)',
    ziyaret: 'Isi abba kee inah magaala yeceeloh gexa num musaafiraa? (Turkish afat)',
  },
  bilgiNotu:
    'Ama baxxaqqa, xukmi hinna. Musaafir tekkeenim sinni safarih faxxi, kay xeerimaa kee sinni niya elle tan.',
  baslik: 'Safarat tanin yaybulle',
  mesafeSatiri: 'Isin sinni gali arac kak garab {km} km fan farakka tanin. {mezhep} madhabah Diyanet yaysiisem:',
  maddeler: {
    hanefi: [
      'Xanafi madhabal, safarih farakka garab 90 km. Gexxa aracal 15 ayrok dagom raaqam niyatta num musaafir kinni.',
      'Musaafir affara rakqat le fardi salat namma rakqat abta (qasri).',
      'Xanafi madhabal, namma salat gacsaanam (jamqi) Xajjil sa, Qarafaat kee Muzdalifal. Diyanet kaadu safar innah tan gibdi xiqitih, aka madhabih ribta raacaanam dudda iyye.',
    ],
    safii: [
      'Shaafiqi madhabal kaadu safarih farakka garab 90 km. Yamaateeh yewqe ayro loowimak, gexxa aracal raaqa 4 ayrok dago tekkek, safarih xukmi tan.',
      'Musaafir affara rakqat le fardi salat namma rakqat abta (qasri).',
      'Shaafiqi madhabal, safar Dohori kee Qasri, Magrib kee Qisha gacsaanamah (jamqi) xiqitta.',
    ],
  },
  ozetAcik: 'Faka · {mezhep}',
  ozetKapali: 'Alifime',
  baglantiAcilamadi: 'Gita fakime wee. Sinni internet ubla.',
  ikametGuncellendi: 'Sinni gali arac qusbisime',
  ikametKaydedilemedi: 'Sinni gali arac dacrisime wee',
  kartiKapatin: 'Safarih kaarda alifa',
  burasiEvimErisim: 'Ahal yi buxa, yi gali arac kinnim dacrisa',
  burasiEvim: 'Ahal yi buxa',
  diyanetteOkuyunErisim: 'Diyanet fatwa browseril ikriya',
  diyanetteOkuyun: 'Diyanetil ikriya',
  sayfa: {
    kayitliKonum: 'Dacrisime arac',
    henuzKaydedilmedi: 'Hanna ma dacrisimin — sinni naharsi arac sinni gali arac kinni',
    buradasiniz: 'Asaaku ahal tanin',
    uzaktasiniz: 'Asaaku garab {km} km fan farakka tanin',
    konumBilinmiyor: 'Sinni arac hanna ma aaxigimin; naharat arac doorita',
    giris:
      'Sinni gali arac kak garab {km} km fan farakka tanin waqdi, Diyanet fatwa koobaasa qunxa baxxaqqa kaarda qimbiso foocal ubbulta. Kaarda inki safarah inki adda ubbulta, warsa ma rubta.',
    bilgiKarti: 'Baxxaqqa kaarda',
    kartBaslik: 'Safarih baxxaqqa kaarda',
    gosterilir: 'Qimbiso foocal ubbulta',
    gosterilmez: 'Ma ubbullan',
    mezhepNotu: 'Kaarda sinni madhab raacta; Massossiyya › Salat wakti addal doorittaanam duddan.',
    ikametYeri: 'Gali arac',
    ikametYapErisim: 'Sinni asaaku arac gali arac kinnim dacrisa',
    ikametYap: 'Asaaku arac gali arac hayisa',
    kaynaklar: 'Qaxxa (Diyanet Diini Caagiidih Kaxxa Majlis)',
    kaynakErisim: '{etiket}. Browseril fakta',
    fetvaHatti: 'Esserih, Diyanet 190 fatwa telefoonal seeca dudda.',
  },
};
