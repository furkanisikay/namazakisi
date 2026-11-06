import type { Sozluk } from '../tr';

/** Çeşme pätwalar türk dilinde; bellik muny aýdýar. Höküm görnüşi ýok (maglumat beriş). */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'Hanafy', safii: 'Şafygy' },
  kaynaklar: {
    vatan: 'Syýahat nukdaýnazaryndan watan, ýaşaýyş ýeri we wagtlaýyn bolýan ýer (türk dilinde)',
    cem: 'Namazlary jemläp bolarmy? (türk dilinde)',
    baslangic: 'Syýahat haçan başlaýar? (türk dilinde)',
    ziyaret: 'Ene-atasynyň şäherine baran adam ýolagçymy? (türk dilinde)',
  },
  bilgiNotu:
    'Bu höküm däl, maglumat. Ýolagçy hasaplanýandygyňyz syýahatyňyzyň maksadyna, dowamlylygyna we niýetiňize bagly.',
  baslik: 'Syýahatda bolmagyňyz mümkin',
  mesafeSatiri: 'Ýaşaýyş ýeriňizden göni çyzyk boýunça takmynan {km} km uzaklykdasyňyz. Diyanetiň {mezhep} mezhebi üçin beýan edýänleri:',
  maddeler: {
    hanefi: [
      'Hanafy mezhebinde syýahat (sefer) aralygy takmynan 90 km. Baran ýerinde 15 günden az galmagy niýet eden adam ýolagçy hasaplanýar.',
      'Ýolagçy dört rekagatly parz namazlary iki rekagat okaýar (kasr).',
      'Hanafy mezhebinde iki namazy jemlemek diňe hajda, Arafatda we Müzdelifede bolýar. Diyanet syýahat ýaly agyr ötünç ýagdaýlarynda beýleki mezhepleriň garaýşyna eýerip bolýandygyny hem belleýär.',
    ],
    safii: [
      'Şafygy mezhebinde hem syýahat aralygy takmynan 90 km. Baran ýerinde gelen we giden günleri hasaba alynmanda 4 günden az galynsa, syýahat hökümleri dowam edýär.',
      'Ýolagçy dört rekagatly parz namazlary iki rekagat okaýar (kasr).',
      'Şafygy mezhebinde syýahat öýläni ikindi bilen, agşamy ýassy bilen jemlemek üçin dogry ötünçdir.',
    ],
  },
  ozetAcik: 'Açyk · {mezhep}',
  ozetKapali: 'Öçük',
  baglantiAcilamadi: 'Salgy açylmady. Internet baglanyşygyňyzy barlaň.',
  ikametGuncellendi: 'Ýaşaýyş ýeriňiz täzelendi',
  ikametKaydedilemedi: 'Ýaşaýyş ýeriňiz ýatda saklanmady',
  kartiKapatin: 'Syýahat kartyny ýapyň',
  burasiEvimErisim: 'Bu meniň öýüm, ony ýaşaýyş ýerim hökmünde ýatda sakla',
  burasiEvim: 'Bu meniň öýüm',
  diyanetteOkuyunErisim: 'Diyanetiň pätwasyny brauzerde okaň',
  diyanetteOkuyun: 'Diyanetde okaň',
  sayfa: {
    kayitliKonum: 'Ýatda saklanan ýer',
    henuzKaydedilmedi: 'Entek ýatda saklanmady — ilkinji ýerleşişiňiz ýaşaýyş ýeriňiz hasaplanýar',
    buradasiniz: 'Häzir şu ýerdesiňiz',
    uzaktasiniz: 'Häzir göni çyzyk boýunça takmynan {km} km uzaklykdasyňyz',
    konumBilinmiyor: 'Ýerleşişiňiz entek belli däl; ilki ýer saýlaň',
    giris:
      'Ýaşaýyş ýeriňizden takmynan {km} km uzaklaşanyňyzda, baş ekranda Diyanetiň pätwalaryny gysgaça beýan edýän maglumat kartasy peýda bolýar. Karta her syýahatda bir gezek görünýär we habarnama ibermeýär.',
    bilgiKarti: 'Maglumat kartasy',
    kartBaslik: 'Syýahat maglumat kartasy',
    gosterilir: 'Baş ekranda görkezilýär',
    gosterilmez: 'Görkezilmeýär',
    mezhepNotu: 'Karta siziň mezhebiňize eýerýär; ony Sazlamalar › Namaz wagtlary bölüminde saýlap bilersiňiz.',
    ikametYeri: 'Ýaşaýyş ýeri',
    ikametYapErisim: 'Häzirki ýerleşişiňizi ýaşaýyş ýeriňiz hökmünde ýatda saklaň',
    ikametYap: 'Häzirki ýerimi ýaşaýyş ýerim et',
    kaynaklar: 'Çeşmeler (Diyanetiň Dini işler ýokary geňeşi)',
    kaynakErisim: '{etiket}. Brauzerde açylýar',
    /** Türkçe dışında gösterilmez (yalnız Türkiye hizmeti). */
    fetvaHatti: 'Soraglaryňyz üçin Diyanetiň 190 pätwa liniýasyna jaň edip bilersiňiz.',
  },
};
