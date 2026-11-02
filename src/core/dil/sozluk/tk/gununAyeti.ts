import type { Sozluk } from '../tr';

/**
 * Türkmen dilinde QuranEnc terjimesi ýok: günüň aýaty diňe arapça tekst we salgy bilen görkezilýär
 * (eýesiniň karary). Terjime salgysy meýdanlary (`mealKaynagi`, `sayfaKunye`) orun tutujy toplumy üçin
 * ýazyldy; terjimäniň ýoklugyny beýan edýän tekstler arapça teksti beýan edýär.
 */
export const gununAyeti: Sozluk['gununAyeti'] = {
  baslik: 'Günüň aýaty',
  etiket: 'GÜNÜŇ AÝATY',
  kisaKunye: '{sure} {ref}',
  kuran: 'Kuran',
  mealKaynagi: '{yayimci}, QuranEnc {surum}',
  sayfaKunye: 'Kuran {ref} · Terjime: {yayimci}, QuranEnc {surum} · Arapça tekst: Tanzil taslamasy',
  arapcaKaynagi: 'Arapça: Tanzil',
  sigmiyor: 'Şu günki aýat bu ölçege sygmaýar. Okamak üçin basyň.',
  acin: 'Açyň',
  sayfa: {
    tarih: '{gun} {ay}, {gunAdi}',
    kisaTarih: '{gun} {ay}',
    metniPaylasin: 'Teksti paýlaşyň',
    paylasilamadi: 'Bu enjamda paýlaşmak elýeter däl.',
    gorselPaylasin: 'Surat hökmünde paýlaşyň',
    widgetVeDuvar: 'Widjet we diwar kagyzy',
    widgetVeDuvarAciklama: 'Baş ekrana goşuň, gulp ekranynda görüň',
    oncekiGunler: 'Öňki günler',
    dun: 'Düýn',
    kaynakNotu: 'Aýatyň arapça teksti Tanzil taslamasyndan üýtgedilmän alynýar.',
    mealYok: 'Aýat arapça teksti bilen görkezilýär.',
    tanzilBaglanti: 'Arapça tekst: Tanzil taslamasy (tanzil.net)',
  },
  ayar: {
    widgetBolum: 'Widjet',
    widgetEkleyin: 'Baş ekranyňyza widjet goşuň',
    widgetEkleyinAciklama: 'Baş ekranyňyzdaky boş ýere uzak basyň, Widjetler, Namaz Akışı, Günüň aýaty',
    widgetEkleyinAciklamaIos: 'Baş ekranyňyzdaky boş ýere uzak basyň, Üýtget, Widjet goş, Namaz Akışı',
    widgetEkleDugme: 'Baş ekrana goşuň',
    duvarBolum: 'Diwar kagyzy',
    duvarAnahtar: 'Her gün üýtgetsin',
    duvarAcikOzet: 'Açyk · her gün ertir wagtynda täzelenýär',
    duvarKapaliOzet: 'Öçük',
    yer: 'Nirede',
    yerler: { kilit: 'Gulp ekrany', ana: 'Baş ekran', ikisi: 'Ikisi hem' },
    zemin: 'Fon',
    zeminler: { gece: 'Gije', kagit: 'Kagyz', palet: 'Palitra' },
    arapca: 'Arapça teksti hem görkezsin',
    arapcaNot: 'Käbir alymlar ekranynda aýat görkezýän telefony hajathana äkitmezligi maslahat berýärler.',
    onizleyin: 'Şu günki suratyň deslapky görnüşi',
    kapatNotu: 'Öçürseňiz, soňky surat ekranda galýar; öňki diwar kagyzyňyzy galereýadan gaýtadan saýlaň.',
    kullanilamiyor: 'Elýeter däl',
    engelli: 'Bu enjamda diwar kagyzyny üýtgetmek öçürilen (iş ýa-da mekdep dolandyryşy), şonuň üçin bu sazlamany açyp bolmaýar.',
    yazilamadi: 'Şu günki surat goýulmady. Programmany açanyňyzda gaýtadan synanyşylar.',
    yerlestirildi: 'Diwar kagyzy goýuldy',
    onizlemeErisim: 'Şu günki diwar kagyzynyň deslapky görnüşi',
  },
  onay: {
    baslik: 'Diwar kagyzyňyz üýtgär',
    metin:
      'Her gün ertir wagtynda günüň aýaty gulp ekranyňyza gelýär. Programma häzirki diwar kagyzyňyzy saklap bilmeýär: muny öçürseňiz, ony galereýadan gaýtadan saýlaň.',
    acin: 'Açyň',
  },
  ios: {
    aciklama:
      'iPhone-da programmalar diwar kagyzyny özleri üýtgedip bilmeýär. Gysga ýollar programmasy muny her irden siziň üçin edip biler; ony bir gezek sazlaýarsyňyz.',
    ucAdim: 'Üç ädim',
    adim1:
      'Gysga ýollar programmasynda täze gysga ýol dörediň. Ilki "Günüň aýatynyň suraty" hereketini, soňra diwar kagyzynyň suratyny goýýan hereketi goşuň ("Wallpaper" gözläň).',
    kisayollariAcin: 'Gysga ýollary açyň',
    adim2: 'Gysga ýollarda Awtomatlaşdyrma bölüminde täze "Günüň wagty" awtomatlaşdyrmasyny dörediň we ertir namazyndan soňky bir wagty saýlaň (meselem, 07:30).',
    adim3: '"Derrew işlet" saýlaň we goşan gysga ýoluňyzy birikdiriň.',
    elle: 'Ýa-da el bilen',
    gorseliKaydedin: 'Şu günki suraty ýatda saklaň',
    kaydetIpucu: 'Açylan paýlaşmak menýusynda suraty Suratlara ýatda saklap bilersiňiz.',
    not: 'Awtomatlaşdyrma siziň saýlan bellenen wagtyňyzda işleýär we ertir wagtyna eýerip bilmeýär; ertir wagtyndan öň işlese, düýnki aýaty goýýar.',
  },
};
