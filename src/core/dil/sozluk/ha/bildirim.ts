import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ Na yi salla', kazayaEkle: 'Saka a ramuwa', inceleyin: 'Duba' },
  kanal: {
    genel: 'Sanarwa na gaba ɗaya',
    muhafiz: 'Mai Tsaron Salla',
    muhafizAciklama: 'Tunatarwar lokutan salla',
    acil: 'Tunatarwar salla ta gaggawa',
    acilAciklama: 'Lokacin salla yana gab da ƙarewa - tunatarwa ta gaggawa',
    vakit: 'Lokutan salla',
    vakitAciklama: 'Tunatarwar da ake aikawa idan lokacin salla ya yi',
    muhafizSes: 'Mai Tsaron Salla · {ses}',
    acilSes: 'Tunatarwa ta gaggawa · {ses}',
    acilSesAciklama: 'Lokacin salla yana gab da ƙarewa — tunatarwa ta gaggawa',
    titresimli: '{kanal} · Da girgiza',
    alarm: 'Ƙararrawar salla',
    alarmSes: 'Ƙararrawar salla · {ses}',
    uygulamaSesi: 'Sautin manhaja',
    seciliSes: 'Sautin da kuka zaɓa',
  },
  cuma: {
    baslik: 'Jumuʼa · saura {sure} · salla ta kusa',
    govdeIlk: 'Saura {sure} zuwa Azahar. Ka shirya ka tafi masallaci.',
    govde: 'Saura {sure} zuwa Azahar. Ka tafi masallaci.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · {dk}m zuwa kiran salla · ka shirya zuwa masallaci',
    hazirlanGovde: 'Ka shirya don ka riski {ad} a masallaci; ka fita bayan minti {sonra} — kiran salla cikin minti {dk}.',
    yolaCikBaslik: '{ad} · {dk}m zuwa kiran salla · ka tafi masallaci',
    yolaCikGovde: 'Ka tafi masallaci don ka riski {ad} — kiran salla cikin minti {dk}.',
  },
  takvim: {
    etkinlikTek: '“{ad}”',
    etkinlikCoklu: cogul({ one: 'Taro {n} a kalandarku', other: 'Taruka {n} a jere a kalandarku' }),
    etkinlikBir: 'Wani taro a kalandarku',
    sonAnIkindi: 'lokaci na ƙarshe da ya dace don Laʼasar shi ne {saat} (makaruhi ne bayan haka)',
    sonAnVakit: 'lokacin {kucuk} zai ƙare da ƙarfe {saat}',
    onceBaslik: '{ad} · taro da ƙarfe {saat} · ka fara yin salla',
    onceGovde: '{etkinlik} zai kasance {aralik}; {sonAn}. Ka yi sallar {kucuk} kafin taron ya fara.',
    kaplarBaslik: '{ad} · wani taro ya rufe lokacin salla',
    kaplarGovde:
      '{etkinlik} zai kasance {aralik} kuma ya rufe lokacin {kucuk} ({giris}–{son}). Ka shirya tun yanzu ka ɗan huta ka yi sallar {kucuk}.',
  },
  yatis: {
    yatsiBaslik: '{ad} · ka yi salla kafin barci 🌙',
    yatsiGovde: 'Lokacin {ad} yana nan; ka tsayar da salla kafin barci ya ɗauke ka.',
    ozet: 'Yau {kilinan}/5 · ba a yi alamar {liste} ba',
    tekOto: 'Idan kun yi ta, ku yi mata alama. {oto}',
    tekKaza: 'Idan kun yi ta, ku yi mata alama; idan ba ku samu ba, ku saka ta a Littafin ramuwa.',
    tekSuruyor: 'Idan kun yi ta, ku yi mata alama. Lokacin sallar yana nan.',
    cokluOto: 'Ku buɗe manhajar don dubawa da yin alamar sallolin da kuka yi. {oto}',
    coklu: 'Ku buɗe manhajar don dubawa da yin alamar sallolin da kuka yi.',
    otoSor: 'Idan ba ku yi musu alama ba, za a tambaye ku game da wannan rana a Littafin ramuwa.',
    otoEkle: 'Idan ba ku yi musu alama ba, za a saka su a ramuwa idan ranar salla ta ƙare.',
  },
  gunSonu: {
    baslik: 'Yau ba ta cika ba · jeri',
    govde: 'Idan kuka yi alamar sallolin da kuka yi kafin rana ta ƙare, jerinku zai ci gaba.',
  },
};
