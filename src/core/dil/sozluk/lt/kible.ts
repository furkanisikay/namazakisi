import type { Sozluk } from '../tr';

/** Kıble "kibla" (QE 2:144, HE 3078), Kâbe "Kaaba" (Vikipedi). Yön harfleri: Šiaurė, Rytai, Pietūs, Vakarai. */
export const kible: Sozluk['kible'] = {
  baslik: 'Kibla',
  yon: {
    hizali: 'Esate atsisukę į kiblą',
    arkada: 'Kibla už jūsų, apsisukite',
    sagda: 'Kibla {derece}° į dešinę',
    solda: 'Kibla {derece}° į kairę',
  },
  harf: { kuzey: 'Š', dogu: 'R', guney: 'P', bati: 'V' },
  sekme: {
    pusula: 'Kompasas',
    pusulaErisim: 'Kompaso režimas',
    pusulaAciklama: 'Kai Kaabos ženklas pasiekia viršuje esančią įpjovą, esate atsisukę į kiblą.',
    kamera: 'Kamera',
    kameraErisim: 'Kameros režimas',
    kameraAciklama: 'Laikykite telefoną vertikaliai; Kaabos ženklas pasirodo kiblos kryptimi.',
  },
  sayfa: {
    baslatiliyor: 'Paleidžiamas kompasas…',
    izinKapali: 'Vietovės leidimas išjungtas; kryptiai rasti reikia jūsų vietovės.',
  },
  hata: {
    izinGerekli: 'Kiblos krypčiai rasti reikia vietovės leidimo.',
    konumServisi: 'Nepavyksta pasiekti vietovės paslaugų. Patikrinkite įrenginio vietovės nustatymus.',
    baslatilamadi: 'Nepavyko paleisti kiblos paslaugos.',
  },
  pusula: {
    ufuk: 'horizontas',
    konumAliniyor: 'Nustatoma jūsų vietovė…',
    hazirlaniyor: 'Ruošiamas kompasas…',
    kuzeydenAci: 'Kibla {derece}° nuo šiaurės',
    kabeUzakta: 'Iki Kaabos {mesafe}',
    kuzeydenSaatYonu: 'Nuo šiaurės pagal laikrodžio rodyklę',
    kuzeyden: '{derece}° nuo šiaurės',
    kabeUzaktaKuzeyden: 'Iki Kaabos {mesafe}, {derece}° nuo šiaurės',
    pusulaErisim: 'Kiblos kompasas. {cumle}',
    pusulaYok: 'Šiame įrenginyje nėra kompaso; kryptį rodome šiaurės atžvilgiu.',
    kayiyorsa: 'Jei kryptis slenka, pajudinkite telefoną ore lyg piešdami aštuoniukę.',
    kamerayla: 'Žiūrėti per kamerą',
  },
  kamera: {
    pusulayiKullanin: 'Naudoti kompasą',
    kullanilamiyorBaslik: 'Kameros rodinys šiame telefone nepasiekiamas',
    kullanilamiyorMetin:
      'Laikant telefoną vertikaliai, jo jutikliai nepateikia patikimos krypties. Kompasas ir toliau rodo kryptį teisingai.',
    izinBaslik: 'Matykite kiblą per kamerą',
    izinMetin:
      'Laikykite telefoną vertikaliai ir apsidairykite; Kaabos ženklas pasirodys kiblos kryptimi. Tam reikia kameros leidimo; vaizdas neįrašomas ir neišeina iš jūsų telefono.',
    kamerayiAcin: 'Įjungti kamerą',
    izinKapaliBaslik: 'Kameros leidimas išjungtas',
    izinKapaliMetin: 'Kameros rodiniui kameros leidimą galite įjungti nustatymuose. Kompasas veikia ir be jo.',
    ayarlariAcin: 'Atidaryti nustatymus',
    acilamadiBaslik: 'Nepavyko atidaryti kameros',
    acilamadiMetin: 'Kamera šiuo metu nepasiekiama. Kiblos kryptį galite rasti kompasu.',
    hesaplaniyor: 'Nustatoma kryptis…',
    dikTutun: 'Laikykite telefoną vertikaliai',
  },
  kalibrasyon: {
    tesekkurErisim: 'Ačiū, kryptis dabar tikslesnė',
    tesekkur: 'Ačiū, kryptis dabar tikslesnė ✓',
    baslik: 'Kalibruokite kompasą',
    sallayin: 'Pajudinkite telefoną ore lyg piešdami aštuoniukę.',
    metal: 'Atsitraukite nuo metalinių daiktų ir magnetinių dėklų.',
    dogruluk: 'Tikslumas',
    simdiDegil: 'Ne dabar',
  },
};
