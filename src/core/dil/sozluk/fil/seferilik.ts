import type { Sozluk } from '../tr';

/** Kaynak fetvalar Türkçedir; etiket bunu söyler. Hüküm kipi yok (bilgi aktarımı). */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'Hanafi', safii: "Shafi'i" },
  kaynaklar: {
    vatan: 'Tahanan, paninirahan at pansamantalang pananatili kaugnay ng paglalakbay (sa Turkish)',
    cem: "Maaari bang pagsamahin ang mga dasal (jam')? (sa Turkish)",
    baslangic: 'Kailan nagsisimula ang paglalakbay? (sa Turkish)',
    ziyaret: 'Manlalakbay ba ang dumadalaw sa bayan ng kanyang mga magulang? (sa Turkish)',
  },
  bilgiNotu:
    'Ito ay impormasyon, hindi hatol. Kung ituturing kayong manlalakbay ay nakadepende sa layunin at haba ng inyong biyahe at sa inyong niyyah.',
  baslik: 'Mukhang naglalakbay kayo',
  mesafeSatiri: 'Mga {km} km kayo mula sa inyong tinitirhan, sa tuwid na guhit. Ang ipinapahayag ng Diyanet para sa mazhab na {mezhep}:',
  maddeler: {
    hanefi: [
      'Sa mazhab na Hanafi, mga 90 km ang layo ng paglalakbay (safar). Ang may balak manatili nang mas mababa sa 15 araw sa pupuntahan ay itinuturing na manlalakbay.',
      "Idinadasal ng manlalakbay nang tig-dalawang rak'ah ang mga obligadong dasal na may apat na rak'ah (qasr).",
      "Sa mazhab na Hanafi, ang pagsasama ng dalawang dasal (jam') ay sa Hajj lang, sa Arafat at Muzdalifah. Binabanggit din ng Diyanet na sa mabibigat na dahilan tulad ng paglalakbay, maaaring sundin ang pananaw ng ibang mazhab.",
    ],
    safii: [
      "Sa mazhab na Shafi'i, mga 90 km din ang layo ng paglalakbay. Kung wala pang 4 na araw ang pananatili sa pupuntahan, hindi kasama ang araw ng pagdating at pag-alis, nananatili ang mga hatol ng paglalakbay.",
      "Idinadasal ng manlalakbay nang tig-dalawang rak'ah ang mga obligadong dasal na may apat na rak'ah (qasr).",
      "Sa mazhab na Shafi'i, ang paglalakbay ay wastong dahilan para pagsamahin (jam') ang Dhuhr at Asr, at ang Maghrib at Isha.",
    ],
  },
  ozetAcik: 'Naka-on · {mezhep}',
  ozetKapali: 'Naka-off',
  baglantiAcilamadi: 'Hindi mabuksan ang link. Suriin ang inyong koneksyon sa internet.',
  ikametGuncellendi: 'Na-update ang inyong tinitirhan',
  ikametKaydedilemedi: 'Hindi ma-save ang inyong tinitirhan',
  kartiKapatin: 'Isara ang card ng paglalakbay',
  burasiEvimErisim: 'Ito ang aking tahanan, i-save bilang aking tinitirhan',
  burasiEvim: 'Ito ang tahanan ko',
  diyanetteOkuyunErisim: 'Basahin ang fatwa ng Diyanet sa browser',
  diyanetteOkuyun: 'Basahin sa Diyanet',
  sayfa: {
    kayitliKonum: 'Naka-save na lokasyon',
    henuzKaydedilmedi: 'Hindi pa naka-save — ang inyong unang lokasyon ang ituturing na tinitirhan',
    buradasiniz: 'Narito kayo ngayon',
    uzaktasiniz: 'Mga {km} km ang layo ninyo ngayon, sa tuwid na guhit',
    konumBilinmiyor: 'Hindi pa alam ang inyong lokasyon; pumili muna ng lokasyon',
    giris:
      'Kapag mga {km} km kayo mula sa inyong tinitirhan, lalabas sa home screen ang maikling info card na nagbubuod ng mga fatwa ng Diyanet. Isang beses lumalabas ang card sa bawat biyahe at hindi ito nagpapadala ng notification.',
    bilgiKarti: 'Info card',
    kartBaslik: 'Info card sa paglalakbay',
    gosterilir: 'Ipinapakita sa home screen',
    gosterilmez: 'Hindi ipinapakita',
    mezhepNotu: 'Sinusunod ng card ang inyong mazhab; mapipili ninyo ito sa Mga setting › Mga oras ng dasal.',
    ikametYeri: 'Tinitirhan',
    ikametYapErisim: 'I-save ang kasalukuyang lokasyon bilang inyong tinitirhan',
    ikametYap: 'Gawing tinitirhan ang kasalukuyang lokasyon',
    kaynaklar: 'Mga sanggunian (Diyanet High Board of Religious Affairs)',
    kaynakErisim: '{etiket}. Bubukas sa browser',
    /** Türkçe dışında gösterilmez (yalnız Türkiye hizmeti). */
    fetvaHatti: 'Para sa mga tanong, maaari ninyong tawagan ang 190 fatwa line ng Diyanet.',
  },
};
