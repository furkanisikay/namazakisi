import type { Sozluk } from '../tr';

/** Yön harfleri iki harf (Avaratra, Atsinanana, Atsimo, Andrefana hepsi A ile başlar; türetildi). */
export const kible: Sozluk['kible'] = {
  baslik: 'Kibla',
  yon: {
    hizali: 'Manatrika ny Kibla ianao',
    arkada: 'Ao aorianao ny Kibla, mitodiha',
    sagda: "Eo amin'ny {derece}° ankavananao ny Kibla",
    solda: "Eo amin'ny {derece}° ankavianao ny Kibla",
  },
  harf: { kuzey: 'Av', dogu: 'At', guney: 'As', bati: 'An' },
  sekme: {
    pusula: 'Kompà',
    pusulaErisim: 'Fomba kompà',
    pusulaAciklama: "Rehefa tonga eo amin'ny marika kely eo ambony ny marika Kaaba, dia manatrika ny Kibla ianao.",
    kamera: 'Fakantsary',
    kameraErisim: 'Fomba fakantsary',
    kameraAciklama: "Atsangano mahitsy ny finday; miseho eo amin'ny lalan'ny Kibla ny marika Kaaba.",
  },
  sayfa: {
    baslatiliyor: 'Manomboka ny kompà…',
    izinKapali: 'Tsy mandeha ny alalana amin\'ny toerana; ilaina ny toeranao mba hahitana ny lalana.',
  },
  hata: {
    izinGerekli: "Ilaina ny alalana amin'ny toerana mba hahitana ny lalan'ny Kibla.",
    konumServisi: "Tsy azo idirana ny serivisy toerana. Jereo ny fikirana toeran'ny fitaovanao.",
    baslatilamadi: 'Tsy nety nanomboka ny serivisy Kibla.',
  },
  pusula: {
    ufuk: 'faravodilanitra',
    konumAliniyor: 'Alaina ny toeranao…',
    hazirlaniyor: 'Omanina ny kompà…',
    kuzeydenAci: "{derece}° avy amin'ny avaratra ny Kibla",
    kabeUzakta: "{mesafe} no halaviran'ny Kaaba",
    kuzeydenSaatYonu: "Araka ny fihodin'ny famantaranandro, avy amin'ny avaratra",
    kuzeyden: "{derece}° avy amin'ny avaratra",
    kabeUzaktaKuzeyden: "{mesafe} no halaviran'ny Kaaba, {derece}° avy amin'ny avaratra",
    pusulaErisim: 'Kompà Kibla. {cumle}',
    pusulaYok: "Tsy misy kompà ity fitaovana ity; ny lalana raha oharina amin'ny avaratra no asehonay.",
    kayiyorsa: "Raha mivily ny lalana, ahetsiketsiho amin'ny endrika 8 eny amin'ny rivotra ny findainao.",
    kamerayla: "Jereo amin'ny fakantsary",
  },
  kamera: {
    pusulayiKullanin: 'Ampiasao ny kompà',
    kullanilamiyorBaslik: "Tsy misy ny fijerena amin'ny fakantsary amin'ity finday ity",
    kullanilamiyorMetin:
      "Tsy manome lalana azo antoka ny fitaovana mpandrefy ao amin'ny findainao rehefa atsangana mahitsy. Mbola mampiseho tsara ny lalana ny kompà.",
    izinBaslik: "Jereo amin'ny fakantsary ny Kibla",
    izinMetin:
      "Atsangano mahitsy ny findainao ary jereo manodidina; miseho eo amin'ny lalan'ny Kibla ny marika Kaaba. Mila alalana amin'ny fakantsary izany; tsy voarakitra ny sary ary tsy miala amin'ny findainao mihitsy.",
    kamerayiAcin: 'Alefaso ny fakantsary',
    izinKapaliBaslik: "Tsy mandeha ny alalana amin'ny fakantsary",
    izinKapaliMetin: "Afaka manome alalana amin'ny fakantsary ao amin'ny Fikirana ianao ho an'ny fijerena amin'ny fakantsary. Mandeha na tsy misy izany aza ny kompà.",
    ayarlariAcin: 'Sokafy ny Fikirana',
    acilamadiBaslik: 'Tsy nety nisokatra ny fakantsary',
    acilamadiMetin: "Tsy azo ampiasaina ny fakantsary amin'izao. Afaka mahita ny Kibla amin'ny kompà ianao.",
    hesaplaniyor: 'Tadiavina ny lalana…',
    dikTutun: 'Atsangano mahitsy ny findainao',
  },
  kalibrasyon: {
    tesekkurErisim: 'Misaotra, marina kokoa ny lalana izao',
    tesekkur: 'Misaotra, marina kokoa ny lalana izao ✓',
    baslik: 'Amboary ny kompà',
    sallayin: "Ahetsiketsiho amin'ny endrika 8 eny amin'ny rivotra ny findainao.",
    metal: 'Mialà amin\'ny zavatra vy sy ny fonony misy andriamby.',
    dogruluk: 'Fahamarinana',
    simdiDegil: 'Tsy izao',
  },
};
