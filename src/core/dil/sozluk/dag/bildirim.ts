import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ N puhi jiŋli', kazayaEkle: 'Pahimi ya labi puhibu ni', inceleyin: 'Lihimi ya' },
  kanal: {
    genel: 'Lahabaya zaa',
    muhafiz: 'Jiŋli Gulana',
    muhafizAciklama: 'Jiŋli saha teebu',
    acil: 'Jiŋli teebu din yɔɣi',
    acilAciklama: 'Jiŋli saha ni naai pumpɔŋɔ - teebu din yɔɣi',
    vakit: 'Jiŋli saha',
    vakitAciklama: 'Teebu shɛŋa bɛ ni tumdi jiŋli saha yi paai',
    muhafizSes: 'Jiŋli Gulana · {ses}',
    acilSes: 'Teebu din yɔɣi · {ses}',
    acilSesAciklama: 'Jiŋli saha ni naai pumpɔŋɔ — teebu din yɔɣi',
    titresimli: '{kanal} · Nyɛɣisibu',
    alarm: 'Jiŋli alaam',
    alarmSes: 'Jiŋli alaam · {ses}',
    uygulamaSesi: 'App kukoli',
    seciliSes: 'Kukoli shɛli yi ni piri',
  },
  cuma: {
    baslik: 'Alizumma · {sure} n-kpalim · jiŋli miriya',
    govdeIlk: '{sure} n-kpalim pɔi ka Azafari paai. Kpaŋsimi ya yi maŋa ka chaŋ jiŋli ni.',
    govde: '{sure} n-kpalim pɔi ka Azafari paai. Chaŋmi ya jiŋli ni.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · jiŋli molibu {dk}min · kpaŋsimi ya',
    hazirlanGovde: 'Kpaŋsimi ya ka yi nya {ad} jiŋli ni; yimi ya minti {sonra} puuni — jiŋli molibu minti {dk} puuni.',
    yolaCikBaslik: '{ad} · jiŋli molibu {dk}min · chaŋmi ya jiŋli ni',
    yolaCikGovde: 'Chaŋmi ya jiŋli ni ka yi nya {ad} — jiŋli molibu minti {dk} puuni.',
  },
  takvim: {
    etkinlikTek: '“{ad}”',
    etkinlikCoklu: cogul({ one: 'Yɛla {n} din doli taba yi kalɛnda ni', other: 'Yɛla {n} din doli taba yi kalɛnda ni' }),
    etkinlikBir: 'Yɛli shɛli yi kalɛnda ni',
    sonAnIkindi: 'Lahisari saha din bahi nyɛla {saat} (di nyaaŋa nyɛla makruhi)',
    sonAnVakit: '{kucuk} saha ni naai {saat}',
    onceBaslik: '{ad} · yɛli {saat} · puhimi ya tooni',
    onceGovde: '{etkinlik} ni niŋ {aralik}; {sonAn}. Puhimi ya {kucuk} pɔi ka yɛli maa piligi.',
    kaplarBaslik: '{ad} · yɛli shɛli kuli jiŋli saha',
    kaplarGovde:
      '{etkinlik} ni niŋ {aralik} ka kuli {kucuk} saha ({giris}–{son}). Niŋmi ya yɛltɔɣa pumpɔŋɔ ni yi vuhi saha biɛla ka puhi {kucuk}.',
  },
  yatis: {
    yatsiBaslik: '{ad} · puhimi ya pɔi ka gbihi 🌙',
    yatsiGovde: '{ad} saha na beni; zanimi ya jiŋli pɔi ka yi gbihi.',
    ozet: 'Zuŋɔ {kilinan}/5 · {liste} bi dalim',
    tekOto: 'Yi yi puhi li, dalimmi ya li. {oto}',
    tekKaza: 'Yi yi puhi li, dalimmi ya li; yi yi bi tooi, pahimi ya li Labi puhibu gbaŋ ni.',
    tekSuruyor: 'Yi yi puhi li, dalimmi ya li. Jiŋli saha na beni.',
    cokluOto: 'Yoomi ya app maa ka lihi ka dalim jiŋa shɛŋa yi ni puhi. {oto}',
    coklu: 'Yoomi ya app maa ka lihi ka dalim jiŋa shɛŋa yi ni puhi.',
    otoSor: 'Yi yi bi dalim ba, bɛ ni bohi ya dabsili ŋɔ yɛla Labi puhibu gbaŋ ni.',
    otoEkle: 'Yi yi bi dalim ba, bɛ ni pahi ba labi puhibu ni jiŋli dabsili maa yi naai.',
  },
  gunSonu: {
    baslik: 'Zuŋɔ na bi naai · dolibu',
    govde: 'Yi yi dalim jiŋa shɛŋa yi ni puhi pɔi ka dabsili maa naai, yi dolibu ni chaŋ tooni.',
  },
};
