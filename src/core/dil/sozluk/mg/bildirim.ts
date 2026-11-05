import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ Nivavaka aho', kazayaEkle: 'Ampidiro ho fanefana', inceleyin: 'Jereo' },
  kanal: {
    genel: 'Fampandrenesana ankapobeny',
    muhafiz: 'Mpiambina ny soalat',
    muhafizAciklama: "Fampahatsiahivana ny fotoanan'ny soalat",
    acil: 'Fampahatsiahivana maika ny soalat',
    acilAciklama: "Efa ho tapitra ny fotoanan'ny soalat - fampahatsiahivana maika",
    vakit: "Fotoanan'ny soalat",
    vakitAciklama: "Fampahatsiahivana alefa rehefa tonga ny fotoanan'ny soalat",
    muhafizSes: 'Mpiambina ny soalat · {ses}',
    acilSes: 'Fampahatsiahivana maika · {ses}',
    acilSesAciklama: "Efa ho tapitra ny fotoanan'ny soalat — fampahatsiahivana maika",
    titresimli: '{kanal} · Mihetsiketsika',
    alarm: 'Fanairana soalat',
    alarmSes: 'Fanairana soalat · {ses}',
    uygulamaSesi: "Feon'ny fampiharana",
    seciliSes: 'Ny feo nofidinao',
  },
  cuma: {
    baslik: 'Zoma · {sure} sisa · manakaiky ny soalat',
    govdeIlk: "{sure} mankany amin'ny Zohr. Miomàna ary mankanesa any amin'ny moske.",
    govde: "{sure} mankany amin'ny Zohr. Mankanesa any amin'ny moske.",
  },
  camiye: {
    hazirlanBaslik: "{ad} · {dk}min mankany amin'ny Azan · miomàna ho any amin'ny moske",
    hazirlanGovde: "Miomàna mba hahatratra ny {ad} any amin'ny moske; miaingà afaka {sonra} min — Azan afaka {dk} min.",
    yolaCikBaslik: "{ad} · {dk}min mankany amin'ny Azan · mankanesa any amin'ny moske",
    yolaCikGovde: "Mankanesa any amin'ny moske mba hahatratra ny {ad} — Azan afaka {dk} min.",
  },
  takvim: {
    etkinlikTek: '« {ad} »',
    etkinlikCoklu: cogul({ one: "Hetsika {n} ao amin'ny tetiandroanao", other: "Hetsika {n} misesy ao amin'ny tetiandroanao" }),
    etkinlikBir: "Hetsika iray ao amin'ny tetiandroanao",
    sonAnIkindi: "ny fotoana farany mety ho an'ny Asr dia {saat} (tsy tokony hivavahana aorian'izay)",
    sonAnVakit: "mifarana amin'ny {saat} ny fotoanan'ny {kucuk}",
    onceBaslik: "{ad} · hetsika amin'ny {saat} · mivavaha aloha",
    onceGovde: "{etkinlik}: {aralik}; {sonAn}. Ataovy ny {kucuk} alohan'ny hanombohan'ny hetsika.",
    kaplarBaslik: "{ad} · misy hetsika manarona ny fotoanan'ny soalat",
    kaplarGovde:
      "{etkinlik}: {aralik}, ary manarona ny fotoanan'ny {kucuk} ({giris}–{son}). Kasao izao ny fiatoana fohy hanaovana ny {kucuk}.",
  },
  yatis: {
    yatsiBaslik: "{ad} · mivavaha alohan'ny hatoriana 🌙",
    yatsiGovde: "Mbola mitohy ny fotoanan'ny {ad}; mitsangàna hivavaka alohan'ny hatoriana.",
    ozet: 'Androany {kilinan}/5 · {liste} tsy voamarika',
    tekOto: 'Raha efa nataonao, mariho. {oto}',
    tekKaza: "Raha efa nataonao, mariho; raha tsy vitanao, ampidiro ao amin'ny Bokin'ny fanefana.",
    tekSuruyor: "Raha efa nataonao, mariho. Mbola mitohy ny fotoanan'ny soalat.",
    cokluOto: 'Sokafy ny fampiharana mba hijerena sy hanamarihana ny soalat vitanao. {oto}',
    coklu: 'Sokafy ny fampiharana mba hijerena sy hanamarihana ny soalat vitanao.',
    otoSor: "Raha tsy marihinao, hanontaniana momba ity andro ity ao amin'ny Bokin'ny fanefana ianao.",
    otoEkle: "Raha tsy marihinao, hampidirina ho fanefana izy ireo rehefa tapitra ny andron'ny soalat.",
  },
  gunSonu: {
    baslik: 'Tsy feno ny androany · tohy',
    govde: "Raha marihinao alohan'ny hifaranan'ny andro ny soalat vitanao, dia mitohy ny tohinao.",
  },
};
