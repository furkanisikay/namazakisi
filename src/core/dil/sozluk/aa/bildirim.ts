import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ Salat abe', kazayaEkle: 'Qadaal ossa', inceleyin: 'Ubla' },
  kanal: {
    genel: 'Inkih warsa',
    muhafiz: 'Salat Dacrisiyya',
    muhafizAciklama: 'Salat waktih kassisiyya',
    acil: 'Sissik le salat kassisiyya',
    acilAciklama: 'Salat wakti gexam yaybulle - sissik le kassisiyya',
    vakit: 'Salat wakti',
    vakitAciklama: 'Salat wakti culek rubimta kassisiyya',
    muhafizSes: 'Salat Dacrisiyya · {ses}',
    acilSes: 'Sissik le kassisiyya · {ses}',
    acilSesAciklama: 'Salat wakti gexam yaybulle — sissik le kassisiyya',
    titresimli: '{kanal} · Ruqrusa',
    alarm: 'Salat alarm',
    alarmSes: 'Salat alarm · {ses}',
    uygulamaSesi: 'App xongolo',
    seciliSes: 'Dooritteen xongolo',
  },
  cuma: {
    baslik: 'Jumqatta · {sure} raqte · salat xayyo',
    govdeIlk: 'Dohori fanah {sure}. Massoowaay masgid fan gexa.',
    govde: 'Dohori fanah {sure}. Masgid fan gexa.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · adan fanah {dk}daq · masgidih massoowa',
    hazirlanGovde: '{ad} masgidil geyaanamkeh massoowa; {sonra} daq lakal yawqa — adan {dk} daq lakal.',
    yolaCikBaslik: '{ad} · adan fanah {dk}daq · masgid fan gexa',
    yolaCikGovde: '{ad} geyaanamkeh masgid fan gexa — adan {dk} daq lakal.',
  },
  takvim: {
    etkinlikTek: '“{ad}”',
    etkinlikCoklu: cogul({ one: 'Sinni kalendaril {n} taama ittal tan', other: 'Sinni kalendaril {n} taama ittal tan' }),
    etkinlikBir: 'Sinni kalendaril tan taama',
    sonAnIkindi: 'Qasrih ellecabo meqe wakti {saat} (toh lakal karaaha le)',
    sonAnVakit: '{kucuk} wakti {saat} duddumta',
    onceBaslik: '{ad} · taama {saat} · naharat salat aba',
    onceGovde: '{etkinlik} {aralik} tan; {sonAn}. Taama qimbisam dumak {kucuk} salat aba.',
    kaplarBaslik: '{ad} · taama salat wakti haysita',
    kaplarGovde:
      '{etkinlik} {aralik} tan, {kucuk} wakti ({giris}–{son}) haysita. Dago cabaanaah {kucuk} salat abaanamah asaaku massoowa.',
  },
  yatis: {
    yatsiBaslik: '{ad} · xiinam dumak salat aba 🌙',
    yatsiGovde: '{ad} wakti hanna tan; xiinam dumak salaatah soola.',
    ozet: 'Asaaku {kilinan}/5 · {liste} calaamat mali',
    tekOto: 'Abteenik calaamisa. {oto}',
    tekKaza: 'Abteenik calaamisa; duddinnaanik Qadaa kitaabal ossa.',
    tekSuruyor: 'Abteenik calaamisa. Salat wakti hanna tan.',
    cokluOto: 'Abteen salat ublaanaah calaamisaanamah app faka. {oto}',
    coklu: 'Abteen salat ublaanaah calaamisaanamah app faka.',
    otoSor: 'Calaamisinnaanik, ama ayrok Qadaa kitaabal sin esseraanam.',
    otoEkle: 'Calaamisinnaanik, salat ayro duddumek qadaal osimta.',
  },
  gunSonu: {
    baslik: 'Asaaku ma duudumin · gexso',
    govde: 'Ayro duddumam dumak abteen salat calaamisseenik, sinni gexso tatrusta.',
  },
};
