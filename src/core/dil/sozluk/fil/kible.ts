import type { Sozluk } from '../tr';

/** Kıble QE/HE "qiblah" (diakritiksiz); yön harfleri Tagalog H/S/T/K (Hilaga, Silangan, Timog, Kanluran). */
export const kible: Sozluk['kible'] = {
  baslik: 'Qiblah',
  yon: {
    hizali: 'Nakaharap kayo sa Qiblah',
    arkada: 'Nasa likod ninyo ang Qiblah, umikot',
    sagda: 'Nasa {derece}° sa inyong kanan ang Qiblah',
    solda: 'Nasa {derece}° sa inyong kaliwa ang Qiblah',
  },
  harf: { kuzey: 'H', dogu: 'S', guney: 'T', bati: 'K' },
  sekme: {
    pusula: 'Compass',
    pusulaErisim: 'Mode ng compass',
    pusulaAciklama: 'Kapag umabot ang marka ng Kaaba sa bingaw sa itaas, nakaharap na kayo sa Qiblah.',
    kamera: 'Camera',
    kameraErisim: 'Mode ng camera',
    kameraAciklama: 'Hawakan nang patayo ang telepono; lilitaw ang marka ng Kaaba sa direksyon ng Qiblah.',
  },
  sayfa: {
    baslatiliyor: 'Sinisimulan ang compass…',
    izinKapali: 'Naka-off ang pahintulot sa lokasyon; kailangan ang inyong lokasyon para mahanap ang direksyon.',
  },
  hata: {
    izinGerekli: 'Kailangan ang pahintulot sa lokasyon para mahanap ang direksyon ng Qiblah.',
    konumServisi: 'Hindi maabot ang mga serbisyo ng lokasyon. Suriin ang mga setting ng lokasyon ng inyong device.',
    baslatilamadi: 'Hindi masimulan ang serbisyo ng Qiblah.',
  },
  pusula: {
    ufuk: 'abot-tanaw',
    konumAliniyor: 'Kinukuha ang inyong lokasyon…',
    hazirlaniyor: 'Inihahanda ang compass…',
    kuzeydenAci: 'Nasa {derece}° mula sa hilaga ang Qiblah',
    kabeUzakta: '{mesafe} ang layo ng Kaaba',
    kuzeydenSaatYonu: 'Pakanan mula sa hilaga',
    kuzeyden: '{derece}° mula sa hilaga',
    kabeUzaktaKuzeyden: '{mesafe} ang layo ng Kaaba, {derece}° mula sa hilaga',
    pusulaErisim: 'Compass ng Qiblah. {cumle}',
    pusulaYok: 'Walang compass ang device na ito; ipinapakita namin ang direksyon batay sa hilaga.',
    kayiyorsa: 'Kung gumagalaw ang direksyon, igalaw ang telepono nang pa-figure 8 sa hangin.',
    kamerayla: 'Tingnan gamit ang camera',
  },
  kamera: {
    pusulayiKullanin: 'Gamitin ang compass',
    kullanilamiyorBaslik: 'Hindi available ang camera view sa teleponong ito',
    kullanilamiyorMetin:
      'Hindi nagbibigay ng maaasahang direksyon ang mga sensor ng inyong telepono kapag hawak nang patayo. Tama pa ring ipinapakita ng compass ang direksyon.',
    izinBaslik: 'Tingnan ang Qiblah gamit ang camera',
    izinMetin:
      'Hawakan nang patayo ang telepono at tumingin sa paligid; lilitaw ang marka ng Kaaba sa direksyon ng Qiblah. Kailangan nito ng pahintulot sa camera; hindi nire-record ang larawan at hindi ito umaalis sa inyong telepono.',
    kamerayiAcin: 'I-on ang camera',
    izinKapaliBaslik: 'Naka-off ang pahintulot sa camera',
    izinKapaliMetin: 'Mapapayagan ninyo ang access sa camera sa Mga setting para sa camera view. Gumagana ang compass kahit wala ito.',
    ayarlariAcin: 'Buksan ang Mga setting',
    acilamadiBaslik: 'Hindi mabuksan ang camera',
    acilamadiMetin: 'Hindi available ang camera ngayon. Mahahanap ninyo ang Qiblah gamit ang compass.',
    hesaplaniyor: 'Hinahanap ang direksyon…',
    dikTutun: 'Hawakan nang patayo ang telepono',
  },
  kalibrasyon: {
    tesekkurErisim: 'Salamat, mas tumpak na ang direksyon',
    tesekkur: 'Salamat, mas tumpak na ang direksyon ✓',
    baslik: 'I-calibrate ang compass',
    sallayin: 'Igalaw ang telepono nang pa-figure 8 sa hangin.',
    metal: 'Lumayo sa mga bagay na metal at sa mga magnetic na case.',
    dogruluk: 'Katumpakan',
    simdiDegil: 'Hindi ngayon',
  },
};
