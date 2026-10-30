import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ Ani salaateera', kazayaEkle: 'Qadaatti dabalaa', inceleyin: 'Ilaalaa' },
  kanal: {
    genel: 'Beeksisa waliigalaa',
    muhafiz: 'Eegduu Salaataa',
    muhafizAciklama: 'Yaadachiisa yeroo salaataa',
    acil: 'Yaadachiisa salaataa ariifachiisaa',
    acilAciklama: 'Yeroon salaataa xumuramuuf jira - yaadachiisa ariifachiisaa',
    vakit: 'Yeroo salaataa',
    vakitAciklama: 'Yaadachiisa yeroo yeroon salaataa gahu ergamu',
    muhafizSes: 'Eegduu Salaataa · {ses}',
    acilSes: 'Yaadachiisa ariifachiisaa · {ses}',
    acilSesAciklama: 'Yeroon salaataa xumuramuuf jira — yaadachiisa ariifachiisaa',
    titresimli: '{kanal} · Raafamaa',
    alarm: 'Alaarmii salaataa',
    alarmSes: 'Alaarmii salaataa · {ses}',
    uygulamaSesi: 'Sagalee appichaa',
    seciliSes: 'Sagalee isin filattan',
  },
  cuma: {
    baslik: 'Jimaata · {sure} hafe · salaanni dhiyaateera',
    govdeIlk: "Hanga Zuhriitti {sure}. Qophaa'iitii gara masjiidaa deemi.",
    govde: 'Hanga Zuhriitti {sure}. Gara masjiidaa deemi.',
  },
  camiye: {
    hazirlanBaslik: "{ad} · azaanaaf {dk}d · masjiidaaf qophaa'i",
    hazirlanGovde: "{ad} masjiida keessatti gahuuf qophaa'i; daqiiqaa {sonra} booda ka'i — azaanni daqiiqaa {dk} booda.",
    yolaCikBaslik: '{ad} · azaanaaf {dk}d · gara masjiidaa deemi',
    yolaCikGovde: '{ad} gahuuf gara masjiidaa deemi — azaanni daqiiqaa {dk} booda.',
  },
  takvim: {
    etkinlikTek: '“{ad}”',
    etkinlikCoklu: cogul({ one: 'Taateen {n} kaalaandara keessan keessaa', other: 'Taateewwan {n} walitti aanan kaalaandara keessan keessaa' }),
    etkinlikBir: 'Taatee kaalaandara keessanii tokko',
    sonAnIkindi: 'yeroon Asriif mijatu inni dhumaa {saat} dha (sana booda jibbamaa dha)',
    sonAnVakit: 'yeroon {kucuk} {saat}tti xumurama',
    onceBaslik: '{ad} · taatee {saat} · dursaa salaataa',
    onceGovde: '{etkinlik} {aralik} tura; {sonAn}. Osoo taateen hin jalqabin {kucuk} salaataa.',
    kaplarBaslik: '{ad} · taateen tokko yeroo salaataa uwwisa',
    kaplarGovde:
      '{etkinlik} {aralik} tura, yeroo {kucuk} ({giris}–{son}) ni uwwisa. Boqonnaa gabaabaa fudhattanii {kucuk} salaatuuf amma karoorfadhaa.',
  },
  yatis: {
    yatsiBaslik: '{ad} · osoo hin ciisin salaati 🌙',
    yatsiGovde: 'Yeroon {ad} itti fufaa jira; osoo hin rafin salaataaf dhaabadhu.',
    ozet: "Har'a {kilinan}/5 · {liste} hin mallattoofne",
    tekOto: 'Yoo salaattan, mallatteessaa. {oto}',
    tekKaza: 'Yoo salaattan, mallatteessaa; yoo hin dandeenye, galmee qadaa keessanitti dabalaa.',
    tekSuruyor: 'Yoo salaattan, mallatteessaa. Yeroon salaataa ammallee itti fufaa jira.',
    cokluOto: 'Salaata salaattan ilaaluufi mallatteessuuf appicha banaa. {oto}',
    coklu: 'Salaata salaattan ilaaluufi mallatteessuuf appicha banaa.',
    otoSor: "Yoo hin mallatteessin, waa'ee guyyaa kanaa galmee qadaa keessatti ni gaafatamtu.",
    otoEkle: 'Yoo hin mallatteessin, yeroo guyyaan salaataa xumuramu qadaatti dabalamu.',
  },
  gunSonu: {
    baslik: "Har'a hin guutamne · walitti fufiinsa",
    govde: 'Salaata salaattan osoo guyyaan hin xumuramin yoo mallatteessitan, walitti fufiinsi keessan itti fufa.',
  },
};
