import type { Sozluk } from '../tr';

export const kible: Sozluk['kible'] = {
  baslik: 'Qibla',
  yon: {
    hizali: 'Bozali kotala Qibla',
    arkada: 'Qibla ezali nsima na bino, bobaluka',
    sagda: 'Qibla ezali {derece}° na loboko na bino ya mobali',
    solda: 'Qibla ezali {derece}° na loboko na bino ya mwasi',
  },
  harf: { kuzey: 'N', dogu: 'E', guney: 'S', bati: 'W' },
  sekme: {
    pusula: 'Busole',
    pusulaErisim: 'Ndɛngɛ ya busole',
    pusulaAciklama: 'Ntango elembo ya Kaaba ekomi na esika ya likolo, bozali kotala Qibla.',
    kamera: 'Kamera',
    kameraErisim: 'Ndɛngɛ ya kamera',
    kameraAciklama: 'Bosimba telefone semba; elembo ya Kaaba ekomonana na ngambo ya Qibla.',
  },
  sayfa: {
    baslatiliyor: 'Busole ezali kobanda…',
    izinKapali: 'Ndingisa ya esika ekangami; esika na bino esengeli mpɔ na koyeba ngambo.',
  },
  hata: {
    izinGerekli: 'Ndingisa ya esika esengeli mpɔ na koyeba ngambo ya Qibla.',
    konumServisi: 'Misala ya esika ekoki kozwama te. Botala mibongiseli ya esika na telefone na bino.',
    baslatilamadi: 'Mosala ya Qibla ekoki kobanda te.',
  },
  pusula: {
    ufuk: 'suka ya likolo',
    konumAliniyor: 'Ezali kozwa esika na bino…',
    hazirlaniyor: 'Busole ezali komibongisa…',
    kuzeydenAci: 'Qibla ezali {derece}° kobanda nɔrdi',
    kabeUzakta: 'Kaaba ezali mosika {mesafe}',
    kuzeydenSaatYonu: 'Kobanda nɔrdi, na ngambo ya montre',
    kuzeyden: '{derece}° kobanda nɔrdi',
    kabeUzaktaKuzeyden: 'Kaaba ezali mosika {mesafe}, {derece}° kobanda nɔrdi',
    pusulaErisim: 'Busole ya Qibla. {cumle}',
    pusulaYok: 'Telefone oyo ezali na busole te; tozali kolakisa ngambo na kotalela nɔrdi.',
    kayiyorsa: 'Soki ngambo ezali koningana, boningisa telefone na bino na likolo lokola motango 8.',
    kamerayla: 'Botala na kamera',
  },
  kamera: {
    pusulayiKullanin: 'Bosalela busole',
    kullanilamiyorBaslik: 'Kotala na kamera ekoki te na telefone oyo',
    kullanilamiyorMetin:
      'Ba capteur ya telefone na bino epesaka ngambo ya solo te soki esimbami semba. Busole ezali kaka kolakisa ngambo malamu.',
    izinBaslik: 'Bomona Qibla na kamera na bino',
    izinMetin:
      'Bosimba telefone na bino semba mpe botala zingazinga; elembo ya Kaaba ekomonana na ngambo ya Qibla. Esengeli ndingisa ya kamera; elilingi ebombamaka te mpe ebimaka te na telefone na bino.',
    kamerayiAcin: 'Bofungola kamera',
    izinKapaliBaslik: 'Ndingisa ya kamera ekangami',
    izinKapaliMetin: 'Bokoki kopesa ndingisa ya kamera na Mibongiseli mpɔ na kotala na kamera. Busole esalaka kozanga yango.',
    ayarlariAcin: 'Bofungola Mibongiseli',
    acilamadiBaslik: 'Kamera efungwami te',
    acilamadiMetin: 'Kamera ezali te sikoyo. Bokoki koyeba Qibla na busole.',
    hesaplaniyor: 'Ezali koluka ngambo…',
    dikTutun: 'Bosimba telefone na bino semba',
  },
  kalibrasyon: {
    tesekkurErisim: 'Matɔndi, ngambo ezali sikoyo malamu koleka',
    tesekkur: 'Matɔndi, ngambo ezali sikoyo malamu koleka ✓',
    baslik: 'Bobongisa busole',
    sallayin: 'Boningisa telefone na bino na likolo lokola motango 8.',
    metal: 'Botika mosika na bilɔkɔ ya ebende mpe ba étui ya magnetiki.',
    dogruluk: 'Bosolo',
    simdiDegil: 'Sikoyo te',
  },
};
