import type { Sozluk } from '../tr';

export const kible: Sozluk['kible'] = {
  baslik: 'Kibla',
  yon: {
    hizali: 'Jeni drejt kibles',
    arkada: 'Kibla është pas jush, kthehuni',
    sagda: 'Kibla është {derece}° në të djathtën tuaj',
    solda: 'Kibla është {derece}° në të majtën tuaj',
  },
  harf: { kuzey: 'V', dogu: 'L', guney: 'J', bati: 'P' },
  sekme: {
    pusula: 'Busulla',
    pusulaErisim: 'Modaliteti i busullës',
    pusulaAciklama: 'Kur shenja e Qabes arrin te shenja në krye, jeni drejt kibles.',
    kamera: 'Kamera',
    kameraErisim: 'Modaliteti i kamerës',
    kameraAciklama: 'Mbajeni telefonin drejt; shenja e Qabes shfaqet në drejtim të kibles.',
  },
  sayfa: {
    baslatiliyor: 'Po niset busulla…',
    izinKapali: 'Leja e vendndodhjes është e çaktivizuar; për të gjetur drejtimin nevojitet vendndodhja juaj.',
  },
  hata: {
    izinGerekli: 'Për të gjetur drejtimin e kibles nevojitet leja e vendndodhjes.',
    konumServisi: 'Shërbimet e vendndodhjes nuk arrihen. Kontrolloni cilësimet e vendndodhjes së pajisjes.',
    baslatilamadi: 'Shërbimi i kibles nuk u nis.',
  },
  pusula: {
    ufuk: 'horizonti',
    konumAliniyor: 'Po merret vendndodhja juaj…',
    hazirlaniyor: 'Po përgatitet busulla…',
    kuzeydenAci: 'Kibla është {derece}° nga veriu',
    kabeUzakta: 'Qabeja është {mesafe} larg',
    kuzeydenSaatYonu: 'Nga veriu, në drejtim të akrepave të orës',
    kuzeyden: '{derece}° nga veriu',
    kabeUzaktaKuzeyden: 'Qabeja është {mesafe} larg, {derece}° nga veriu',
    pusulaErisim: 'Busulla e kibles. {cumle}',
    pusulaYok: 'Kjo pajisje nuk ka busull; po e tregojmë drejtimin në raport me veriun.',
    kayiyorsa: 'Nëse drejtimi lëviz, lëvizni telefonin në ajër sikur të vizatoni një 8.',
    kamerayla: 'Shikojeni me kamerë',
  },
  kamera: {
    pusulayiKullanin: 'Përdorni busullën',
    kullanilamiyorBaslik: 'Pamja me kamerë nuk mund të përdoret në këtë telefon',
    kullanilamiyorMetin:
      'Sensorët e telefonit tuaj nuk japin drejtim të besueshëm kur mbahet drejt. Busulla vazhdon ta tregojë drejtimin saktë.',
    izinBaslik: 'Shikojeni kiblen me kamerë',
    izinMetin:
      'Mbajeni telefonin drejt dhe shikoni përreth; shenja e Qabes shfaqet në drejtim të kibles. Për këtë nevojitet leja e kamerës; pamja nuk regjistrohet dhe nuk del nga telefoni juaj.',
    kamerayiAcin: 'Hapni kamerën',
    izinKapaliBaslik: 'Leja e kamerës është e çaktivizuar',
    izinKapaliMetin: 'Për pamjen me kamerë mund ta lejoni kamerën te Cilësimet. Busulla punon edhe pa të.',
    ayarlariAcin: 'Hapni Cilësimet',
    acilamadiBaslik: 'Kamera nuk u hap',
    acilamadiMetin: 'Kamera nuk është në dispozicion tani. Kiblen mund ta gjeni me busullë.',
    hesaplaniyor: 'Po gjendet drejtimi…',
    dikTutun: 'Mbajeni telefonin drejt',
  },
  kalibrasyon: {
    tesekkurErisim: 'Faleminderit, tani drejtimi është më i saktë',
    tesekkur: 'Faleminderit, tani drejtimi është më i saktë ✓',
    baslik: 'Kalibroni busullën',
    sallayin: 'Lëvizni telefonin në ajër sikur të vizatoni një 8.',
    metal: 'Largohuni nga sendet metalike dhe këllëfët me magnet.',
    dogruluk: 'Saktësia',
    simdiDegil: 'Jo tani',
  },
};
