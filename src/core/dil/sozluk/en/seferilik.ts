import type { Sozluk } from '../tr';

/** Kaynak fetvalar Türkçedir; etiket bunu söyler. Hüküm kipi yok (bilgi aktarımı). */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'Hanafi', safii: "Shafi'i" },
  kaynaklar: {
    vatan: 'Home, residence and temporary stay in terms of travel (in Turkish)',
    cem: 'Can prayers be combined (jam\')? (in Turkish)',
    baslangic: 'When does travel begin? (in Turkish)',
    ziyaret: "Is someone visiting their parents' town a traveler? (in Turkish)",
  },
  bilgiNotu:
    'This is information, not a ruling. Whether you count as a traveler depends on the purpose and length of your journey and on your intention.',
  baslik: 'It looks like you are traveling',
  mesafeSatiri: 'You are about {km} km from your place of residence as the crow flies. What Diyanet conveys for the {mezhep} school:',
  maddeler: {
    hanefi: [
      'In the Hanafi school, the travel (safar) distance is about 90 km. Someone who intends to stay less than 15 days at the destination counts as a traveler.',
      'A traveler prays the four-rakat obligatory prayers as two rakats (qasr).',
      "In the Hanafi school, combining two prayers (jam') is only during Hajj, at Arafat and Muzdalifah. Diyanet also notes that in serious excuses such as travel, one may follow the view of the other schools.",
    ],
    safii: [
      "In the Shafi'i school, too, the travel distance is about 90 km. If the stay at the destination is less than 4 days, not counting the days of arrival and departure, the travel rulings continue.",
      'A traveler prays the four-rakat obligatory prayers as two rakats (qasr).',
      "In the Shafi'i school, travel is a valid excuse for combining (jam') Dhuhr with Asr and Maghrib with Isha.",
    ],
  },
  ozetAcik: 'On · {mezhep}',
  ozetKapali: 'Off',
  baglantiAcilamadi: "The link couldn't be opened. Check your internet connection.",
  ikametGuncellendi: 'Your place of residence was updated',
  ikametKaydedilemedi: "Your place of residence couldn't be saved",
  kartiKapatin: 'Close the travel card',
  burasiEvimErisim: 'This is my home, save it as my place of residence',
  burasiEvim: 'This is home',
  diyanetteOkuyunErisim: 'Read the Diyanet fatwa in the browser',
  diyanetteOkuyun: 'Read on Diyanet',
};
