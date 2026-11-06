import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ Jag har bett', kazayaEkle: 'Lägg till som qada', inceleyin: 'Granska' },
  kanal: {
    genel: 'Allmänna aviseringar',
    muhafiz: 'Bönevakt',
    muhafizAciklama: 'Påminnelser om bönetider',
    acil: 'Brådskande bönepåminnelse',
    acilAciklama: 'Bönetiden håller på att ta slut - brådskande påminnelser',
    vakit: 'Bönetider',
    vakitAciklama: 'Påminnelser som skickas när en bönetid börjar',
    muhafizSes: 'Bönevakt · {ses}',
    acilSes: 'Brådskande påminnelse · {ses}',
    acilSesAciklama: 'Bönetiden håller på att ta slut — brådskande påminnelser',
    titresimli: '{kanal} · Vibration',
    alarm: 'Bönealarm',
    alarmSes: 'Bönealarm · {ses}',
    uygulamaSesi: 'Appens ljud',
    seciliSes: 'Ditt valda ljud',
  },
  cuma: {
    baslik: 'Fredagsbön · {sure} kvar · bönen närmar sig',
    govdeIlk: '{sure} till Dhuhr. Gör dig redo och bege dig till moskén.',
    govde: '{sure} till Dhuhr. Bege dig till moskén.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · {dk} min till böneutropet · gör dig redo för moskén',
    hazirlanGovde: 'Gör dig redo för att hinna till {ad} i moskén; gå om {sonra} min – böneutropet om {dk} min.',
    yolaCikBaslik: '{ad} · {dk} min till böneutropet · bege dig till moskén',
    yolaCikGovde: 'Bege dig till moskén för att hinna till {ad} – böneutropet om {dk} min.',
  },
  takvim: {
    etkinlikTek: '”{ad}”',
    etkinlikCoklu: cogul({ one: '{n} händelse i din kalender', other: '{n} händelser i rad i din kalender' }),
    etkinlikBir: 'En händelse i din kalender',
    sonAnIkindi: 'den sista lämpliga tiden för Asr är {saat} (makruh därefter)',
    sonAnVakit: 'tiden för {kucuk} slutar {saat}',
    onceBaslik: '{ad} · händelse {saat} · be först',
    onceGovde: '{etkinlik} pågår {aralik}; {sonAn}. Be {kucuk} innan händelsen börjar.',
    kaplarBaslik: '{ad} · en händelse täcker bönetiden',
    kaplarGovde:
      '{etkinlik} pågår {aralik} och täcker tiden för {kucuk} ({giris}–{son}). Planera redan nu en kort paus för att be {kucuk}.',
  },
  yatis: {
    yatsiBaslik: '{ad} · be innan du sover 🌙',
    yatsiGovde: 'Tiden för {ad} pågår fortfarande; förrätta bönen innan du somnar.',
    ozet: 'I dag {kilinan}/5 · {liste} inte markerade',
    tekOto: 'Har du bett den, markera den. {oto}',
    tekKaza: 'Har du bett den, markera den; kunde du inte, lägg till den i din Qada-logg.',
    tekSuruyor: 'Har du bett den, markera den. Bönetiden pågår fortfarande.',
    cokluOto: 'Öppna appen för att granska och markera bönerna du har bett. {oto}',
    coklu: 'Öppna appen för att granska och markera bönerna du har bett.',
    otoSor: 'Om du inte markerar dem tillfrågas du om den här dagen i Qada-loggen.',
    otoEkle: 'Om du inte markerar dem läggs de till som qada när bönedagen tar slut.',
  },
  gunSonu: {
    baslik: 'Dagen är inte fullständig · svit',
    govde: 'Om du markerar bönerna du har bett innan dagen tar slut fortsätter din svit.',
  },
};
