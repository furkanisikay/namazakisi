import type { Sozluk } from '../tr';

export const kible: Sozluk['kible'] = {
  baslik: 'Qibla',
  yon: {
    hizali: 'Mureba Qibla',
    arkada: 'Qibla iri inyuma yanyu, muhindukire',
    sagda: 'Qibla iri iburyo bwanyu kuri {derece}°',
    solda: 'Qibla iri ibumoso bwanyu kuri {derece}°',
  },
  harf: { kuzey: 'N', dogu: 'E', guney: 'S', bati: 'W' },
  sekme: {
    pusula: 'Kompasi',
    pusulaErisim: 'Uburyo bwa kompasi',
    pusulaAciklama: 'Iyo ikimenyetso cya Al Ka’abat kigeze ku kamenyetso ko hejuru, muba mureba Qibla.',
    kamera: 'Kamera',
    kameraErisim: 'Uburyo bwa kamera',
    kameraAciklama: 'Mufate telefoni ihagaze; ikimenyetso cya Al Ka’abat kigaragara mu cyerekezo cya Qibla.',
  },
  sayfa: {
    baslatiliyor: 'Kompasi iri gutangira…',
    izinKapali: 'Uruhushya rw’aho muherereye rurafunze; aho muherereye harakenewe kugira ngo icyerekezo kiboneke.',
  },
  hata: {
    izinGerekli: 'Uruhushya rw’aho muherereye rurakenewe kugira ngo icyerekezo cya Qibla kiboneke.',
    konumServisi: 'Serivisi z’aho uri ntizishobora kugerwaho. Murebe igenamiterere ry’aho uri ry’igikoresho cyanyu.',
    baslatilamadi: 'Serivisi ya Qibla ntiyashoboye gutangira.',
  },
  pusula: {
    ufuk: 'ikirere',
    konumAliniyor: 'Aho muherereye hari gushakishwa…',
    hazirlaniyor: 'Kompasi iri gutegurwa…',
    kuzeydenAci: 'Qibla iri kuri {derece}° uhereye mu majyaruguru',
    kabeUzakta: 'Al Ka’abat iri kuri {mesafe}',
    kuzeydenSaatYonu: 'Uhereye mu majyaruguru, mu cyerekezo cy’inshinge z’isaha',
    kuzeyden: '{derece}° uhereye mu majyaruguru',
    kabeUzaktaKuzeyden: 'Al Ka’abat iri kuri {mesafe}, {derece}° uhereye mu majyaruguru',
    pusulaErisim: 'Kompasi ya Qibla. {cumle}',
    pusulaYok: 'Iki gikoresho nta kompasi gifite; turagaragaza icyerekezo hagendewe ku majyaruguru.',
    kayiyorsa: 'Niba icyerekezo kinyeganyega, muzunguze telefoni yanyu mu kirere nk’umubare 8.',
    kamerayla: 'Kureba na kamera',
  },
  kamera: {
    pusulayiKullanin: 'Gukoresha kompasi',
    kullanilamiyorBaslik: 'Kureba na kamera ntibiboneka kuri iyi telefoni',
    kullanilamiyorMetin:
      'Ibyuma bipima bya telefoni yanyu ntibitanga icyerekezo cyizewe iyo ifashwe ihagaze. Kompasi yo ikomeza kugaragaza icyerekezo neza.',
    izinBaslik: 'Kureba Qibla na kamera yanyu',
    izinMetin:
      'Mufate telefoni yanyu ihagaze maze murebe hirya no hino; ikimenyetso cya Al Ka’abat kigaragara mu cyerekezo cya Qibla. Ibi bikenera uruhushya rwa kamera; ishusho ntibikwa kandi ntiva na rimwe muri telefoni yanyu.',
    kamerayiAcin: 'Gufungura kamera',
    izinKapaliBaslik: 'Uruhushya rwa kamera rurafunze',
    izinKapaliMetin: 'Mushobora kwemera kamera muri Igenamiterere kugira ngo murebe na kamera. Kompasi ikora hatari rwo.',
    ayarlariAcin: 'Gufungura Igenamiterere',
    acilamadiBaslik: 'Kamera ntiyashoboye gufunguka',
    acilamadiMetin: 'Kamera ntiboneka ubu. Mushobora kubona Qibla mukoresheje kompasi.',
    hesaplaniyor: 'Icyerekezo kiri gushakishwa…',
    dikTutun: 'Mufate telefoni yanyu ihagaze',
  },
  kalibrasyon: {
    tesekkurErisim: 'Murakoze, ubu icyerekezo kiranoze kurushaho',
    tesekkur: 'Murakoze, ubu icyerekezo kiranoze kurushaho ✓',
    baslik: 'Gutunganya kompasi',
    sallayin: 'Muzunguze telefoni yanyu mu kirere nk’umubare 8.',
    metal: 'Mwitarure ibintu by’ibyuma n’ibifuniko bya rukuruzi.',
    dogruluk: 'Ubunyakuri',
    simdiDegil: 'Si ubu',
  },
};
