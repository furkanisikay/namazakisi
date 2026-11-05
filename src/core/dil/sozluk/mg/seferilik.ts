import type { Sozluk } from '../tr';

/** Kaynak fetvalar Türkçedir; etiket bunu söyler. Hüküm kipi yok (bilgi aktarımı). */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'Hanafi', safii: "Shafi'i" },
  kaynaklar: {
    vatan: "Tanàna niaviana, toerana ipetrahana ary fijanonana vetivety raha ny amin'ny dia (amin'ny teny tiorka)",
    cem: "Azo atambatra ve ny soalat (jam')? (amin'ny teny tiorka)",
    baslangic: "Rahoviana no manomboka ny dia? (amin'ny teny tiorka)",
    ziyaret: "Mpandeha ve ny olona mitsidika ny tanànan'ny ray aman-dreniny? (amin'ny teny tiorka)",
  },
  bilgiNotu:
    "Fampahalalana ity fa tsy didy. Miankina amin'ny tanjona sy ny halavan'ny dianao ary amin'ny fikasanao ny hoe heverina ho mpandeha ianao na tsia.",
  baslik: 'Toa mandeha lavitra ianao',
  mesafeSatiri:
    "Eo amin'ny {km} km eo ho eo, raha refesina mahitsy, no elanelanao amin'ny toerana ipetrahanao. Izay ampitain'ny Diyanet ho an'ny madhab {mezhep}:",
  maddeler: {
    hanefi: [
      "Ao amin'ny madhab Hanafi, eo amin'ny 90 km eo ho eo ny halavan'ny dia (safar). Heverina ho mpandeha izay mikasa hijanona latsaky ny 15 andro any amin'ny toerana alehany.",
      "Ny mpandeha dia manao ho rakat roa ny soalat farz misy rakat efatra (qasr).",
      "Ao amin'ny madhab Hanafi, ny fanambatrana soalat roa (jam') dia mandritra ny Hajj ihany, any Arafat sy Muzdalifah. Ambaran'ny Diyanet koa fa amin'ny antony matotra toy ny dia, dia azo arahina ny hevitry ny madhab hafa.",
    ],
    safii: [
      "Ao amin'ny madhab Shafi'i koa, eo amin'ny 90 km eo ho eo ny halavan'ny dia. Raha latsaky ny 4 andro ny fijanonana any amin'ny toerana alehany, tsy isaina ny andro nahatongavana sy niaingana, dia mitohy ny didin'ny dia.",
      "Ny mpandeha dia manao ho rakat roa ny soalat farz misy rakat efatra (qasr).",
      "Ao amin'ny madhab Shafi'i, antony ekena ny dia hanambatrana (jam') ny Zohr sy ny Asr ary ny Maghrib sy ny Isha.",
    ],
  },
  ozetAcik: 'Mandeha · {mezhep}',
  ozetKapali: 'Tsy mandeha',
  baglantiAcilamadi: "Tsy nety nosokafana ny rohy. Jereo ny fifandraisanao amin'ny aterineto.",
  ikametGuncellendi: 'Nohavaozina ny toerana ipetrahanao',
  ikametKaydedilemedi: 'Tsy voatahiry ny toerana ipetrahanao',
  kartiKapatin: 'Hidio ny karatry ny dia',
  burasiEvimErisim: 'Tranoko ity, tehirizo ho toerana ipetrahako',
  burasiEvim: 'Tranoko ity',
  diyanetteOkuyunErisim: "Vakio ao amin'ny mpitety tranonkala ny fatwa an'ny Diyanet",
  diyanetteOkuyun: "Vakio ao amin'ny Diyanet",
  sayfa: {
    kayitliKonum: 'Toerana voatahiry',
    henuzKaydedilmedi: 'Mbola tsy voatahiry — ny toerana voalohany anananao no heverina ho toerana ipetrahanao',
    buradasiniz: 'Eto ianao izao',
    uzaktasiniz: "Eo amin'ny {km} km eo ho eo, raha refesina mahitsy, ny halaviranao izao",
    konumBilinmiyor: 'Mbola tsy fantatra ny toeranao; mifidiana toerana aloha',
    giris:
      "Rehefa eo amin'ny {km} km eo ho eo miala amin'ny toerana ipetrahanao ianao, dia misy karatra fampahalalana fohy mamintina ny fatwa an'ny Diyanet miseho eo amin'ny efijery fandraisana. Indray mandeha isaky ny dia no miseho ilay karatra ary tsy mandefa fampandrenesana izy.",
    bilgiKarti: 'Karatra fampahalalana',
    kartBaslik: 'Karatra fampahalalana momba ny dia',
    gosterilir: "Aseho eo amin'ny efijery fandraisana",
    gosterilmez: 'Tsy aseho',
    mezhepNotu: "Manaraka ny madhab-nao ilay karatra; azonao fidiana ao amin'ny Fikirana › Fotoanan'ny soalat.",
    ikametYeri: 'Toerana ipetrahana',
    ikametYapErisim: 'Tehirizo ho toerana ipetrahanao ny toerana misy anao ankehitriny',
    ikametYap: 'Ataovy toerana ipetrahako ity',
    kaynaklar: "Loharano (Filankevitra Ambony momba ny Raharaha Ara-pivavahana, Diyanet)",
    kaynakErisim: "{etiket}. Misokatra ao amin'ny mpitety tranonkala",
    /** Not shown outside Turkish (Türkiye-only service). */
    fetvaHatti: "Raha misy fanontaniana, afaka miantso ny laharana 190 an'ny Diyanet ho an'ny fatwa ianao.",
  },
};
