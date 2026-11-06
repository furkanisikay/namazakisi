import type { Sozluk } from '../tr';

/** Kaynak fetvalar Türkçedir; etiket bunu söyler. Hüküm kipi yok (bilgi aktarımı). */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'Hanafi', safii: 'Shaafi’i' },
  kaynaklar: {
    vatan: 'Galle, hoɗorde e jooɗorde seeɗa e fii safaru (e Turkeere)',
    cem: 'Hino waawi hawrinde juulɗe (jam’u)? (e Turkeere)',
    baslangic: 'Ko honde tuma safaru fuɗɗotoo? (e Turkeere)',
    ziyaret: 'Mo yillotoo wuro jibinɓe makko, hari ko seteejo? (e Turkeere)',
  },
  bilgiNotu:
    'Ɗum ko humpito, wonaa fatawa. So on ngonii seteejo walla on ngonaa, ɗum rewi e faandaare e njuuteendi laawol mon e anniyee mon.',
  baslik: 'Hino wa no hiɗon e safaru',
  mesafeSatiri: 'Hiɗon woɗɗi hoɗorde mon wa {km} kiloomeeteraaji e laawol peewngol. Ko Diyanet hollirta fii mazhab {mezhep}:',
  maddeler: {
    hanefi: [
      'E mazhab Hanafi, woɗɗeendi safaru ko wa kiloomeeteraaji 90. Mo anniyii jooɗaade ñalɗe ɓuri famɗude 15 e nokku o yahata, ko seteejo.',
      'Seteejo juulata juulɗe farilla raka’aaji nay ɗe raka’aaji ɗiɗi (qasru).',
      'E mazhab Hanafi, hawrinde juulɗe ɗiɗi (jam’u) ko e Hajju tan, e Arafa e Muzdalifa. Diyanet kadi hollii ko e caɗeele mawɗe wa safaru, hino waawi rewde miijo mazhabuuji goɗɗi ɗin.',
    ],
    safii: [
      'E mazhab Shaafi’i kadi, woɗɗeendi safaru ko wa kiloomeeteraaji 90. So jooɗaade e nokku o yahata ɓuri famɗude ñalɗe 4, tawa ñalɗe hewtugol e yaltugol limaaka, sariyaaji safaru ɗin jokkoto.',
      'Seteejo juulata juulɗe farilla raka’aaji nay ɗe raka’aaji ɗiɗi (qasru).',
      'E mazhab Shaafi’i, safaru ko caɗeele moƴƴe ngam hawrinde (jam’u) fanaa e alansaraa, futuroo e geeƴe.',
    ],
  },
  ozetAcik: 'Huɓɓinaa · {mezhep}',
  ozetKapali: 'Ñifaa',
  baglantiAcilamadi: 'Jokkol ngol udditaaki. Ndaaree jokkol enternet mon.',
  ikametGuncellendi: 'Hoɗorde mon hesɗitinaama',
  ikametKaydedilemedi: 'Hoɗorde mon mooftaaki',
  kartiKapatin: 'Uddee kaartal safaru',
  burasiEvimErisim: 'Ɗoo ko galle am, mooftee ɗoo ko hoɗorde am',
  burasiEvim: 'Ɗoo ko galle am',
  diyanetteOkuyunErisim: 'Janngee fatawa Diyanet e wanngorde',
  diyanetteOkuyun: 'Janngee e Diyanet',
  sayfa: {
    kayitliKonum: 'Nokkuure mooftaande',
    henuzKaydedilmedi: 'Mooftaaka haa jooni — nokkuure mon arannde limtoto ko hoɗorde mon',
    buradasiniz: 'Hiɗon ɗoo jooni',
    uzaktasiniz: 'Jooni hiɗon woɗɗi wa {km} kiloomeeteraaji e laawol peewngol',
    konumBilinmiyor: 'Nokkuure mon anndaaka haa jooni; suɓee nokkuure adii',
    giris:
      'So on woɗɗii hoɗorde mon wa {km} kiloomeeteraaji, kaartal humpito rawnungal fatawaaji Diyanet ɓannginto e yaynirde arannde. Kaartal ngal ɓannginto laawol go’o e safaru kala, nelataa tintinal.',
    bilgiKarti: 'Kaartal humpito',
    kartBaslik: 'Kaartal humpito safaru',
    gosterilir: 'Hino ɓanngina e yaynirde arannde',
    gosterilmez: 'Ɓannginaaka',
    mezhepNotu: 'Kaartal ngal rewi mazhab mon; hiɗon mbaawi suɓude ngal e Teelte › Saa’iiji juulɗe.',
    ikametYeri: 'Hoɗorde',
    ikametYapErisim: 'Mooftee nokkuure mon jooni ko hoɗorde mon',
    ikametYap: 'Waɗee nokkuure am jooni hoɗorde am',
    kaynaklar: 'Iwdi (Goomu Toownde Fii Diine, Diyanet)',
    kaynakErisim: '{etiket}. Udditoto e wanngorde',
    /** Turkçe dışında gösterilmez (yalnız Türkiye hizmeti). */
    fetvaHatti: 'Ngam naamne, hiɗon mbaawi noddude laini fatawa Diyanet 190.',
  },
};
