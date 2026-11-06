import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ Mayɛ Nyamefrɛ', kazayaEkle: 'Fa ka Qada ho', inceleyin: 'Hwɛ mu' },
  kanal: {
    genel: 'Amaneɛbɔ',
    muhafiz: 'Nyamefrɛ Wɛmfoɔ',
    muhafizAciklama: 'Nyamefrɛ berɛ nkaeɛ',
    acil: 'Nyamefrɛ nkaeɛ a ɛhia ntɛm',
    acilAciklama: 'Nyamefrɛ berɛ rebɛba awieɛ - nkaeɛ a ɛhia ntɛm',
    vakit: 'Nyamefrɛ mmerɛ',
    vakitAciklama: 'Nkaeɛ a wɔde mena sɛ Nyamefrɛ berɛ du a',
    muhafizSes: 'Nyamefrɛ Wɛmfoɔ · {ses}',
    acilSes: 'Nkaeɛ a ɛhia ntɛm · {ses}',
    acilSesAciklama: 'Nyamefrɛ berɛ rebɛba awieɛ — nkaeɛ a ɛhia ntɛm',
    titresimli: '{kanal} · Ɛwosow',
    alarm: 'Nyamefrɛ alaam',
    alarmSes: 'Nyamefrɛ alaam · {ses}',
    uygulamaSesi: 'App nnyegyeeɛ',
    seciliSes: 'Nnyegyeeɛ a woapaw',
  },
  cuma: {
    baslik: 'Efiada · {sure} aka · Nyamefrɛ abɛn',
    govdeIlk: '{sure} na aka ansa na Dhuhr adu. Siesie wo ho na kɔ masjid.',
    govde: '{sure} na aka ansa na Dhuhr adu. Kɔ masjid.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · {dk} min ma Azaan · siesie wo ho kɔ masjid',
    hazirlanGovde: 'Siesie wo ho na kɔ masjid ma {ad}; fi hɔ sima {sonra} mu — Azaan wɔ sima {dk} mu.',
    yolaCikBaslik: '{ad} · {dk} min ma Azaan · kɔ masjid',
    yolaCikGovde: 'Kɔ masjid ma {ad} — Azaan wɔ sima {dk} mu.',
  },
  takvim: {
    etkinlikTek: '“{ad}”',
    etkinlikCoklu: cogul({ one: 'Dwumadie {n} wɔ wo kalenda mu', other: 'Dwumadie {n} a ɛtoatoa so wɔ wo kalenda mu' }),
    etkinlikBir: 'Dwumadie bi wɔ wo kalenda mu',
    sonAnIkindi: 'Asr berɛ a ɛfata a ɛtwa toɔ ne {saat} (ɛno akyi yɛ Makruh)',
    sonAnVakit: '{kucuk} berɛ ba awieɛ {saat}',
    onceBaslik: '{ad} · dwumadie {saat} · di kan yɛ Nyamefrɛ',
    onceGovde: '{etkinlik} kɔ {aralik}; {sonAn}. Yɛ {kucuk} ansa na dwumadie no ahyɛ ase.',
    kaplarBaslik: '{ad} · dwumadie bi kata Nyamefrɛ berɛ no so',
    kaplarGovde:
      '{etkinlik} kɔ {aralik} na ɛkata {kucuk} berɛ ({giris}–{son}) so. Yɛ nhyehyɛe seesei sɛ wobɛgyae kakra ayɛ {kucuk}.',
  },
  yatis: {
    yatsiBaslik: '{ad} · yɛ Nyamefrɛ ansa na woada 🌙',
    yatsiGovde: '{ad} berɛ da so wɔ hɔ; hyɛ Nyamefrɛ ase ansa na nna afa wo.',
    ozet: 'Ɛnnɛ {kilinan}/5 · wɔnkyerɛɛ {liste}',
    tekOto: 'Sɛ woayɛ a, kyerɛ. {oto}',
    tekKaza: 'Sɛ woayɛ a, kyerɛ; sɛ wontumi anyɛ a, fa ka wo Qada Nwoma ho.',
    tekSuruyor: 'Sɛ woayɛ a, kyerɛ. Nyamefrɛ berɛ no da so wɔ hɔ.',
    cokluOto: 'Bue app no na hwɛ na kyerɛ Nyamefrɛ a woayɛ. {oto}',
    coklu: 'Bue app no na hwɛ na kyerɛ Nyamefrɛ a woayɛ.',
    otoSor: 'Sɛ wonkyerɛ a, wɔbɛbisa wo da yi ho wɔ Qada Nwoma mu.',
    otoEkle: 'Sɛ wonkyerɛ a, wɔde bɛka Qada ho sɛ Nyamefrɛ da no ba awieɛ a.',
  },
  gunSonu: {
    baslik: 'Ɛnnɛ nnya nwieeɛ · toatoaso',
    govde: 'Sɛ wokyerɛ Nyamefrɛ a woayɛ ansa na da no aba awieɛ a, wo toatoaso bɛkɔ so.',
  },
};
