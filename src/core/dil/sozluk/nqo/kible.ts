import type { Sozluk } from '../tr';

/** Kıble adı Manding'deki Arapça kökenli "kibila" (N'Ko kaynakta ad yok, QE 2:144 betimleyici ߢߊߛߌ߲߫; türetildi). Yön harfleri: saheli (kuzey), kɔrɔn (doğu), worodugu (güney), tlebin (batı). */
export const kible: Sozluk['kible'] = {
  baslik: 'ߞߌߓߌߟߊ',
  yon: {
    hizali: 'ߊߟߎ߫ ߢߍ߫ ߓߍ߫ ߞߌߓߌߟߊ ߝߍ߬',
    arkada: 'ߞߌߓߌߟߊ ߓߍ߫ ߊߟߎ߫ ߞߐ߫ ߝߍ߬߸ ߊߟߎ߫ ߦߋ߫ ߊߟߎ߫ ߦߍߟߍߡߊ',
    sagda: 'ߞߌߓߌߟߊ ߓߍ߫ ߊߟߎ߫ ߞߌߣߌ߲ߓߟߏ߫ ߝߍ߬ {derece}°',
    solda: 'ߞߌߓߌߟߊ ߓߍ߫ ߊߟߎ߫ ߣߎߡߊ߲ߓߏߟߏ ߝߍ߬ {derece}°',
  },
  harf: { kuzey: 'ߛ', dogu: 'ߞ', guney: 'ߥ', bati: 'ߕ' },
  sekme: {
    pusula: 'ߓߎߛߐߟߌ',
    pusulaErisim: 'ߓߎߛߐߟߌ ߗߏߜߏ',
    pusulaAciklama: 'ߣߌ߫ ߞߊ߯ߓߊ ߕߊ߯ߡߊߛߌߦߍ߲ ߛߋߙߊ ߛߊ߲ߝߍ߬ ߘߊߞߎ߲ ߡߊ߬߸ ߊߟߎ߫ ߢߍ߫ ߓߍ߫ ߞߌߓߌߟߊ ߝߍ߬.',
    kamera: 'ߞߊߡߋߙߊ',
    kameraErisim: 'ߞߊߡߋߙߊ ߗߏߜߏ',
    kameraAciklama: 'ߊߟߎ߫ ߦߋ߫ ߕߋߟߋߝߐߣߌ ߖߐ߫; ߞߊ߯ߓߊ ߕߊ߯ߡߊߛߌߦߍ߲ ߓߍ߫ ߓߐ߫ ߞߌߓߌߟߊ ߝߍ߬.',
  },
  sayfa: {
    baslatiliyor: 'ߓߎߛߐߟߌ ߓߍ߫ ߘߊߡߌ߬ߣߊ߬…',
    izinKapali: 'ߦߙߐ߫ ߘߊߢߍ ߘߊߕߎߜߎ߲ߠߍ߲ ߘߏ߲߬; ߊߟߎ߫ ߦߙߐ߫ ߞߊ߬ ߞߊ߲ ߥߊߟߊߛߊ ߞߊ߬ ߢߊߛߌ߲߫ ߛߐ߬ߘߐ߲߬.',
  },
  hata: {
    izinGerekli: 'ߦߙߐ߫ ߘߊߢߍ ߞߊ߬ ߞߊ߲ ߥߊߟߊߛߊ ߞߊ߬ ߞߌߓߌߟߊ ߢߊߛߌ߲߫ ߛߐ߬ߘߐ߲߬.',
    konumServisi: 'ߦߙߐ߫ ߓߊ߯ߙߊ ߕߍ߫ ߛߐ߬ߘߐ߲߬. ߊߟߎ߫ ߦߋ߫ ߊߟߎ߫ ߟߊ߫ ߡߌߣߍ߲ ߦߙߐ߫ ߟߊ߬ߓߍ߲߬ߢߐ߲߰ߡߊ ߟߊߛߍߜߍߛߍߜߍ.',
    baslatilamadi: 'ߞߌߓߌߟߊ ߓߊ߯ߙߊ ߡߊ߬ ߛߋ߫ ߞߊ߬ ߘߊߡߌ߬ߣߊ߬.',
  },
  pusula: {
    ufuk: 'ߛߊ߲ߞߏߟߏ ߘߊ߲߫',
    konumAliniyor: 'ߊߟߎ߫ ߦߙߐ߫ ߓߍ߫ ߢߌߣߌ…',
    hazirlaniyor: 'ߓߎߛߐߟߌ ߓߍ߫ ߟߊߓߍ߲߬…',
    kuzeydenAci: 'ߞߌߓߌߟߊ ߓߍ߫ ߛߊߤߋߟߌ ߟߊ߫ {derece}°',
    kabeUzakta: 'ߞߊ߯ߓߊ ߖߊ߲߬ߧߊ ߦߋ߫ {mesafe} ߦߋ߫',
    kuzeydenSaatYonu: 'ߞߊ߬ ߓߐ߫ ߛߊߤߋߟߌ ߟߊ߫ ߡߐ߲ߕߎߙߎ ߛߌߙߊ ߝߍ߬',
    kuzeyden: 'ߛߊߤߋߟߌ ߟߊ߫ {derece}°',
    kabeUzaktaKuzeyden: 'ߞߊ߯ߓߊ ߖߊ߲߬ߧߊ ߦߋ߫ {mesafe} ߦߋ߫߸ ߛߊߤߋߟߌ ߟߊ߫ {derece}°',
    pusulaErisim: 'ߞߌߓߌߟߊ ߓߎߛߐߟߌ. {cumle}',
    pusulaYok: 'ߓߎߛߐߟߌ ߕߍ߫ ߣߌ߲߬ ߡߌߣߍ߲ ߣߊ߬; ߊ߲ ߓߍ߫ ߢߊߛߌ߲߫ ߦߌ߬ߘߊ߬ ߞߊ߬ ߞߍߢߍ ߣߌ߫ ߛߊߤߋߟߌ ߦߋ߫.',
    kayiyorsa: 'ߣߌ߫ ߢߊߛߌ߲߫ ߓߍ߫ ߦߙߍߦߙߍ߸ ߊߟߎ߫ ߦߋ߫ ߕߋߟߋߝߐߣߌ ߟߊߡߊߜߊ ߝߌߢߍ ߣߊ߬ ߌ ߣߴߊ߬ ߝߐ߫ 8.',
    kamerayla: 'ߊ߬ ߟߊߖߍ ߞߊߡߋߙߊ ߟߊ߫',
  },
  kamera: {
    pusulayiKullanin: 'ߊߟߎ߫ ߦߋ߫ ߓߎߛߐߟߌ ߞߍ߫',
    kullanilamiyorBaslik: 'ߞߊߡߋߙߊ ߟߊߖߍߟߌ ߕߍ߫ ߛߐ߬ߘߐ߲߬ ߣߌ߲߬ ߕߋߟߋߝߐߣߌ ߣߊ߬',
    kullanilamiyorMetin:
      'ߊߟߎ߫ ߟߊ߫ ߕߋߟߋߝߐߣߌ ߛߍ߲ߛߐߙߌ ߟߎ߬ ߕߍ߫ ߢߊߛߌ߲߫ ߕߌߟߋ߲ߠߍ߲ ߘߌ߫ ߣߌ߫ ߊ߬ ߖߐߟߋ߲ ߘߏ߲߬. ߓߎߛߐߟߌ ߓߍ߫ ߢߊߛߌ߲߫ ߦߌ߬ߘߊ߬ ߞߊ߬ ߢߍ߫ ߝߟߐ.',
    izinBaslik: 'ߊߟߎ߫ ߦߋ߫ ߞߌߓߌߟߊ ߟߊߖߍ ߞߊߡߋߙߊ ߟߊ߫',
    izinMetin:
      'ߊߟߎ߫ ߦߋ߫ ߕߋߟߋߝߐߣߌ ߖߐ߫ ߞߊ߬ ߊߟߎ߫ ߟߊߡߌߣߌ ߟߊߖߍ; ߞߊ߯ߓߊ ߕߊ߯ߡߊߛߌߦߍ߲ ߓߍ߫ ߓߐ߫ ߞߌߓߌߟߊ ߝߍ߬. ߞߊߡߋߙߊ ߘߊߢߍ ߞߊ߬ ߞߊ߲; ߖߊ߭ ߕߍ߫ ߡߙߊ߬߸ ߊ߬ ߕߍ߫ ߓߐ߫ ߊߟߎ߫ ߟߊ߫ ߕߋߟߋߝߐߣߌ ߞߐ߬ߣߐ ߊߓߊߘߊ.',
    kamerayiAcin: 'ߞߊߡߋߙߊ ߘߊߦߟߍ߬',
    izinKapaliBaslik: 'ߞߊߡߋߙߊ ߘߊߢߍ ߘߊߕߎߜߎ߲ߠߍ߲ ߘߏ߲߬',
    izinKapaliMetin: 'ߊߟߎ߫ ߓߍ߫ ߛߋ߫ ߞߊ߬ ߞߊߡߋߙߊ ߘߊߢߍ ߘߌ߫ ߟߊ߬ߓߍ߲߬ߢߐ߲߰ߡߊ ߞߐ߬ߣߐ ߞߊߡߋߙߊ ߟߊߖߍߟߌ ߞߊߡߊ߬. ߓߎߛߐߟߌ ߓߍ߫ ߓߊ߯ߙߊ ߞߍ߫ ߣߌ߫ ߊ߬ ߕߍ߫.',
    ayarlariAcin: 'ߟߊ߬ߓߍ߲߬ߢߐ߲߰ߡߊ ߘߊߦߟߍ߬',
    acilamadiBaslik: 'ߞߊߡߋߙߊ ߡߊ߬ ߛߋ߫ ߞߊ߬ ߘߊߦߟߍ߬',
    acilamadiMetin: 'ߞߊߡߋߙߊ ߕߍ߫ ߛߐ߬ߘߐ߲߬ ߛߌߛߍ߲߬. ߊߟߎ߫ ߓߍ߫ ߛߋ߫ ߞߊ߬ ߞߌߓߌߟߊ ߛߐ߬ߘߐ߲߬ ߓߎߛߐߟߌ ߟߊ߫.',
    hesaplaniyor: 'ߢߊߛߌ߲߫ ߓߍ߫ ߢߌߣߌ…',
    dikTutun: 'ߊߟߎ߫ ߦߋ߫ ߕߋߟߋߝߐߣߌ ߖߐ߫',
  },
  kalibrasyon: {
    tesekkurErisim: 'ߓߊߙߌߞߊ߸ ߢߊߛߌ߲߫ ߕߌߟߋ߲ߠߍ߲ ߘߏ߲߬ ߛߌߛߍ߲߬',
    tesekkur: 'ߓߊߙߌߞߊ߸ ߢߊߛߌ߲߫ ߕߌߟߋ߲ߠߍ߲ ߘߏ߲߬ ߛߌߛߍ߲߬ ✓',
    baslik: 'ߓߎߛߐߟߌ ߟߊߓߍ߲߬',
    sallayin: 'ߊߟߎ߫ ߦߋ߫ ߕߋߟߋߝߐߣߌ ߟߊߡߊߜߊ ߝߌߢߍ ߣߊ߬ ߌ ߣߴߊ߬ ߝߐ߫ 8.',
    metal: 'ߊߟߎ߫ ߦߋ߫ ߦߙߐ߫ ߖߊ߲߬ߧߊ ߣߍߜߍ ߝߍ߲ ߟߎ߬ ߣߌ߫ ߡߊߜߌߣߋ ߝߍ߲ ߟߎ߬ ߟߊ߫.',
    dogruluk: 'ߕߌߟߋ߲ߠߌ',
    simdiDegil: 'ߛߌߛߍ߲߬ ߕߍ߫',
  },
};
