import type { Sozluk } from '../tr';

export const kible: Sozluk['kible'] = {
  baslik: 'Qibla',
  yon: {
    hizali: 'Nag-atubang kamo sa Qibla',
    arkada: 'Ang Qibla anaa sa inyong luyo, tuyok',
    sagda: 'Ang Qibla anaa {derece}° sa inyong tuo',
    solda: 'Ang Qibla anaa {derece}° sa inyong wala',
  },
  harf: { kuzey: 'A', dogu: 'S', guney: 'H', bati: 'K' },
  sekme: {
    pusula: 'Kompas',
    pusulaErisim: 'Mode sa kompas',
    pusulaAciklama: 'Kon moabot ang marka sa Kaaba sa tumoy sa ibabaw, nag-atubang na kamo sa Qibla.',
    kamera: 'Kamera',
    kameraErisim: 'Mode sa kamera',
    kameraAciklama: 'Ipatindog ang telepono; makita ang marka sa Kaaba sa direksyon sa Qibla.',
  },
  sayfa: {
    baslatiliyor: 'Gisugdan ang kompas…',
    izinKapali: 'Naka-off ang pagtugot sa lokasyon; kinahanglan ang inyong lokasyon aron makit-an ang direksyon.',
  },
  hata: {
    izinGerekli: 'Kinahanglan ang pagtugot sa lokasyon aron makit-an ang direksyon sa Qibla.',
    konumServisi: 'Dili maabot ang serbisyo sa lokasyon. Susiha ang mga setting sa lokasyon sa inyong device.',
    baslatilamadi: 'Dili masugdan ang serbisyo sa Qibla.',
  },
  pusula: {
    ufuk: 'kapunawpunawan',
    konumAliniyor: 'Gikuha ang inyong lokasyon…',
    hazirlaniyor: 'Giandam ang kompas…',
    kuzeydenAci: 'Ang Qibla {derece}° gikan sa amihanan',
    kabeUzakta: 'Ang Kaaba {mesafe} ang gilay-on',
    kuzeydenSaatYonu: 'Sunod sa tuyok sa orasan gikan sa amihanan',
    kuzeyden: '{derece}° gikan sa amihanan',
    kabeUzaktaKuzeyden: 'Ang Kaaba {mesafe} ang gilay-on, {derece}° gikan sa amihanan',
    pusulaErisim: 'Kompas sa Qibla. {cumle}',
    pusulaYok: 'Walay kompas kining device; gipakita namo ang direksyon gikan sa amihanan.',
    kayiyorsa: 'Kon mabalhin-balhin ang direksyon, ilihok ang telepono sama sa numero 8 sa hangin.',
    kamerayla: 'Tan-awa gamit ang kamera',
  },
  kamera: {
    pusulayiKullanin: 'Gamita ang kompas',
    kullanilamiyorBaslik: 'Dili magamit ang kamera niining telepono',
    kullanilamiyorMetin:
      'Ang mga sensor sa inyong telepono dili makahatag og saktong direksyon kon gipatindog. Husto gihapon ang direksyon nga gipakita sa kompas.',
    izinBaslik: 'Tan-awa ang Qibla gamit ang kamera',
    izinMetin:
      'Ipatindog ang telepono ug tan-aw sa palibot; makita ang marka sa Kaaba sa direksyon sa Qibla. Kinahanglan kini og pagtugot sa kamera; dili irekord ang hulagway ug dili kini mogawas sa inyong telepono.',
    kamerayiAcin: 'I-on ang kamera',
    izinKapaliBaslik: 'Naka-off ang pagtugot sa kamera',
    izinKapaliMetin: 'Mahimo ninyong tugotan ang kamera sa Mga setting alang sa view sa kamera. Molihok ang kompas bisan wala kini.',
    ayarlariAcin: 'Ablihi ang Mga setting',
    acilamadiBaslik: 'Dili maablihan ang kamera',
    acilamadiMetin: 'Dili magamit ang kamera karon. Makit-an ninyo ang Qibla gamit ang kompas.',
    hesaplaniyor: 'Gipangita ang direksyon…',
    dikTutun: 'Ipatindog ang inyong telepono',
  },
  kalibrasyon: {
    tesekkurErisim: 'Salamat, mas tukma na ang direksyon',
    tesekkur: 'Salamat, mas tukma na ang direksyon ✓',
    baslik: 'I-calibrate ang kompas',
    sallayin: 'Ilihok ang telepono sama sa numero 8 sa hangin.',
    metal: 'Paglayo sa mga butang nga metal ug magnetic nga case.',
    dogruluk: 'Katukma',
    simdiDegil: 'Dili karon',
  },
};
