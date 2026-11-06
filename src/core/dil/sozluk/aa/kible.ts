import type { Sozluk } from '../tr';

/**
 * Kıble "kiblat", Kâbe "Kaqba" (QuranEnc `afar_hamza`); sağ/sol "migda le gambi" / "gura le
 * gambi" (QE 18:17, IslamHouse aa). Pusula harfleri uluslararası N/E/S/W kalır (Afarca dört yön
 * adı kaynakta yok); kuzey "Shimaal" türetildi.
 */
export const kible: Sozluk['kible'] = {
  baslik: 'Kiblat',
  yon: {
    hizali: 'Kiblat fanah afkuntaanam',
    arkada: 'Kiblat sin lakal tan, gaca',
    sagda: 'Kiblat sinni migda le gambil {derece}°',
    solda: 'Kiblat sinni gura le gambil {derece}°',
  },
  harf: { kuzey: 'N', dogu: 'E', guney: 'S', bati: 'W' },
  sekme: {
    pusula: 'Kompaas',
    pusulaErisim: 'Kompaas caala',
    pusulaAciklama: 'Kaqbah calaamat fayya le qaxxal yemeeten waqdi, kiblat fanah afkuntaanam.',
    kamera: 'Kaamera',
    kameraErisim: 'Kaamera caala',
    kameraAciklama: 'Telefoon soolisa; Kaqbah calaamat kiblat gital ubbulta.',
  },
  sayfa: {
    baslatiliyor: 'Kompaas qimbisimta…',
    izinKapali: 'Arac idni alifime; gita geyaanamah sinni arac faxxima.',
  },
  hata: {
    izinGerekli: 'Kiblat gita geyaanamah arac idni faxxima.',
    konumServisi: 'Arac caagid ma geyimta. Sinni aalatih arac massossiyya ubla.',
    baslatilamadi: 'Kiblat caagid qimbisime wee.',
  },
  pusula: {
    ufuk: 'qaran qaxxa',
    konumAliniyor: 'Sinni arac beyimta…',
    hazirlaniyor: 'Kompaas massoysimta…',
    kuzeydenAci: 'Kiblat Shimaalak {derece}°',
    kabeUzakta: 'Kaqba {mesafe} farakka tan',
    kuzeydenSaatYonu: 'Shimaalak saaqatih gital',
    kuzeyden: 'Shimaalak {derece}°',
    kabeUzaktaKuzeyden: 'Kaqba {mesafe} farakka tan, Shimaalak {derece}°',
    pusulaErisim: 'Kiblat kompaas. {cumle}',
    pusulaYok: 'Ama aalat kompaas mali; gita Shimaalak ubulsenno.',
    kayiyorsa: 'Gita korsittek, sinni telefoon qaranal 8 innal gexsa.',
    kamerayla: 'Kaamerat ubla',
  },
  kamera: {
    pusulayiKullanin: 'Kompaas taamita',
    kullanilamiyorBaslik: 'Kaamerah ubla ama telefoonal mali',
    kullanilamiyorMetin:
      'Sinni telefoonih sensorti, telefoon soolisime waqdi diggah gita ma yacan. Kompaas hanna gita meqeh ubulta.',
    izinBaslik: 'Kiblat kaamerat ubla',
    izinMetin:
      'Sinni telefoon soolisaay alle ubla; Kaqbah calaamat kiblat gital ubbulta. Kaamera idni faxxima; suura ma dacrisimtaay sinni telefoonak ma yawqa.',
    kamerayiAcin: 'Kaamera faka',
    izinKapaliBaslik: 'Kaamera idni alifime',
    izinKapaliMetin: 'Kaamerah ubla, Massossiyya addal kaamera idni acuwaanam duddan. Kompaas toh malik taamitta.',
    ayarlariAcin: 'Massossiyya faka',
    acilamadiBaslik: 'Kaamera fakime wee',
    acilamadiMetin: 'Kaamera asaaku mali. Kiblat kompaasat geyaanam duddan.',
    hesaplaniyor: 'Gita geyimta…',
    dikTutun: 'Sinni telefoon soolisa',
  },
  kalibrasyon: {
    tesekkurErisim: 'Galatah, gita asaaku diggah tan',
    tesekkur: 'Galatah, gita asaaku diggah tan ✓',
    baslik: 'Kompaas massosa',
    sallayin: 'Sinni telefoon qaranal 8 innal gexsa.',
    metal: 'Birtak kee magnet le galaafak farakka gexa.',
    dogruluk: 'Diggaluk',
    simdiDegil: 'Asaaku hinna',
  },
};
