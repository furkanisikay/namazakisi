import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ Mi juulii', kazayaEkle: 'Ɓeydee e qadaa', inceleyin: 'Ndaaree' },
  kanal: {
    genel: 'Tintine kuuɓɗe',
    muhafiz: 'Ndeenoowo Juulde',
    muhafizAciklama: 'Siftinooje waqutu juulde',
    acil: 'Siftinoore juulde teeŋtunde',
    acilAciklama: 'Waqutu juulde ɓadii gasde - siftinooje teeŋtuɗe',
    vakit: 'Saa’iiji juulɗe',
    vakitAciklama: 'Siftinooje neldeteeje so waqutu juulde heewii',
    muhafizSes: 'Ndeenoowo Juulde · {ses}',
    acilSes: 'Siftinoore teeŋtunde · {ses}',
    acilSesAciklama: 'Waqutu juulde ɓadii gasde — siftinooje teeŋtuɗe',
    titresimli: '{kanal} · Dillinde',
    alarm: 'Alarm juulde',
    alarmSes: 'Alarm juulde · {ses}',
    uygulamaSesi: 'Sowto jaaɓngal',
    seciliSes: 'Sowto ngo on suɓi',
  },
  cuma: {
    baslik: 'Juma · {sure} heddii · juulde ɓadike',
    govdeIlk: '{sure} heddii haa fanaa. Moƴƴin hoore maa, yah juulirde.',
    govde: '{sure} heddii haa fanaa. Yah juulirde.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · {dk}hj haa ewnaango · moƴƴin hoore maa ngam juulirde',
    hazirlanGovde: 'Moƴƴin hoore maa ngam hewtude {ad} e juulirde; yaltu caggal {sonra} hojomaaji — ewnaango caggal {dk} hojomaaji.',
    yolaCikBaslik: '{ad} · {dk}hj haa ewnaango · yah juulirde',
    yolaCikGovde: 'Yah juulirde ngam hewtude {ad} — ewnaango caggal {dk} hojomaaji.',
  },
  takvim: {
    etkinlikTek: '“{ad}”',
    etkinlikCoklu: cogul({ one: '{n} golle e kalandar maa', other: '{n} golle jokkondirɗe e kalandar maa' }),
    etkinlikBir: 'Golle e kalandar maa',
    sonAnIkindi: 'waqutu sakkitoro moƴƴo ngam alansaraa ko {saat} (makruuhu caggal ɗuum)',
    sonAnVakit: 'waqutu {kucuk} gasay e {saat}',
    onceBaslik: '{ad} · golle e {saat} · juulu adii',
    onceGovde: '{etkinlik} hino jokki {aralik}; {sonAn}. Juulu {kucuk} adii golle ɗen fuɗɗaade.',
    kaplarBaslik: '{ad} · golle hino suuɗa waqutu juulde',
    kaplarGovde:
      '{etkinlik} hino jokki {aralik} e hino suuɗa waqutu {kucuk} ({giris}–{son}). Feewnu jooni ngam accude golle seeɗa e juulude {kucuk}.',
  },
  yatis: {
    yatsiBaslik: '{ad} · juulu adii lelaade 🌙',
    yatsiGovde: 'Waqutu {ad} hino jokki; ñiiɓu juulde adii ɗaanaade.',
    ozet: 'Hannde {kilinan}/5 · {liste} maandinaaka',
    tekOto: 'So a juulii ɗum, maandin ɗum. {oto}',
    tekKaza: 'So a juulii ɗum, maandin ɗum; so a waawaali, ɓeydu ɗum e Deftere qadaa maa.',
    tekSuruyor: 'So a juulii ɗum, maandin ɗum. Waqutu juulde on hino jokki.',
    cokluOto: 'Uddit jaaɓngal ngal ngam ndaarude e maandinde juulɗe ɗe a juulii. {oto}',
    coklu: 'Uddit jaaɓngal ngal ngam ndaarude e maandinde juulɗe ɗe a juulii.',
    otoSor: 'So a maandinaali ɗe, a naamnete fii ñalawma oo e Deftere qadaa.',
    otoEkle: 'So a maandinaali ɗe, ɗe ɓeydoyte e qadaa so ñalawma juulde gasii.',
  },
  gunSonu: {
    baslik: 'Hannde timmaali · jokkondiral',
    govde: 'So on maandinii juulɗe ɗe on juulii adii ñalawma gasde, jokkondiral mon jokkoto.',
  },
};
