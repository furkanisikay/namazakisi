import type { Sozluk } from '../tr';

/** Kaynak fetvalar Türkçedir; etiket bunu söyler. Hüküm kipi yok (bilgi aktarımı). */
export const seferilik: Sozluk['seferilik'] = {
  /** Seçim çipinde de görünür: çekimsiz özel ad ("pagal Hanafi mokyklą"). */
  mezhepler: { hanefi: 'Hanafi', safii: 'Šafii' },
  kaynaklar: {
    vatan: 'Gimtoji vieta, gyvenamoji vieta ir laikina buveinė kelionės atžvilgiu (turkų kalba)',
    cem: 'Ar galima maldas sujungti (džam)? (turkų kalba)',
    baslangic: 'Kada prasideda kelionė? (turkų kalba)',
    ziyaret: 'Ar laikomas keliautoju žmogus, vykstantis į tėvų gyvenamąją vietovę? (turkų kalba)',
  },
  bilgiNotu:
    'Tai informacija, o ne sprendimas. Ar esate laikomi keliautoju, priklauso nuo kelionės tikslo, trukmės ir jūsų ketinimo.',
  baslik: 'Panašu, kad keliaujate',
  mesafeSatiri: 'Tiesia linija esate maždaug už {km} km nuo savo gyvenamosios vietos. Ką Diyanet nurodo pagal {mezhep} mokyklą:',
  maddeler: {
    hanefi: [
      'Hanafitų mokykloje kelionės (safar) atstumas yra maždaug 90 km. Žmogus, ketinantis kelionės tikslo vietoje praleisti mažiau nei 15 dienų, laikomas keliautoju.',
      'Keliautoju laikomas žmogus keturių rakatų privalomas maldas atlieka po du rakatus (kasr).',
      'Hanafitų mokykloje dvi maldos sujungiamos (džam) tik per hadžą, Arafate ir Muzdalifoje. Diyanet taip pat nurodo, kad esant rimtai priežasčiai, pavyzdžiui, kelionei, galima vadovautis kitų mokyklų nuomone.',
    ],
    safii: [
      'Šafiitų mokykloje kelionės atstumas taip pat yra maždaug 90 km. Jei kelionės tikslo vietoje, neskaičiuojant atvykimo ir išvykimo dienų, būnama mažiau nei 4 dienas, kelionės nuostatos galioja toliau.',
      'Keliautoju laikomas žmogus keturių rakatų privalomas maldas atlieka po du rakatus (kasr).',
      'Šafiitų mokykloje kelionė laikoma pateisinama priežastimi sujungti (džam) Dhuhr su Asr ir Maghrib su Isha.',
    ],
  },
  ozetAcik: 'Įjungta · {mezhep}',
  ozetKapali: 'Išjungta',
  baglantiAcilamadi: 'Nepavyko atidaryti nuorodos. Patikrinkite interneto ryšį.',
  ikametGuncellendi: 'Gyvenamoji vieta atnaujinta',
  ikametKaydedilemedi: 'Nepavyko išsaugoti gyvenamosios vietos',
  kartiKapatin: 'Uždaryti kelionės kortelę',
  burasiEvimErisim: 'Čia mano namai, išsaugoti kaip gyvenamąją vietą',
  burasiEvim: 'Čia mano namai',
  diyanetteOkuyunErisim: 'Skaityti Diyanet fatvą naršyklėje',
  diyanetteOkuyun: 'Skaityti Diyanet svetainėje',
  sayfa: {
    kayitliKonum: 'Išsaugota vietovė',
    henuzKaydedilmedi: 'Dar neišsaugota — pirmoji jūsų vietovė laikoma gyvenamąja vieta',
    buradasiniz: 'Dabar esate čia',
    uzaktasiniz: 'Dabar esate maždaug už {km} km tiesia linija',
    konumBilinmiyor: 'Jūsų vietovė dar nežinoma; pirmiausia pasirinkite vietovę',
    giris:
      'Kai nuo gyvenamosios vietos nutolsite maždaug {km} km, pagrindiniame ekrane matysite trumpą informacinę kortelę, apibendrinančią Diyanet fatvas. Kortelė rodoma kartą per kelionę ir pranešimų nesiunčia.',
    bilgiKarti: 'Informacinė kortelė',
    kartBaslik: 'Kelionės informacinė kortelė',
    gosterilir: 'Rodoma pagrindiniame ekrane',
    gosterilmez: 'Nerodoma',
    mezhepNotu: 'Kortelės turinys priklauso nuo jūsų mokyklos (mazhabo); ją galite pasirinkti skiltyje Nustatymai › Maldų laikai.',
    ikametYeri: 'Gyvenamoji vieta',
    ikametYapErisim: 'Išsaugoti dabartinę vietovę kaip gyvenamąją vietą',
    ikametYap: 'Dabartinę vietovę paversti gyvenamąja vieta',
    kaynaklar: 'Šaltiniai (Diyanet Aukščiausioji religinių reikalų taryba)',
    kaynakErisim: '{etiket}. Atidaroma naršyklėje',
    fetvaHatti: 'Kilus klausimų, galite skambinti Diyanet 190 fatvų linija.',
  },
};
