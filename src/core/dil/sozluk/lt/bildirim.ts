import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Süre ({sure}) yalın hâlde gelir → "liko {sure}" kalıbı. Dakika ({dk}) kısaltmalı ("min."), hâl taşımaz. */
export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ Atlikau maldą', kazayaEkle: 'Į praleistas', inceleyin: 'Peržiūrėti' },
  kanal: {
    genel: 'Bendrieji pranešimai',
    muhafiz: 'Maldos sargas',
    muhafizAciklama: 'Maldos laiko priminimai',
    acil: 'Skubus maldos priminimas',
    acilAciklama: 'Maldos laikas tuoj baigsis - skubūs priminimai',
    vakit: 'Maldų laikai',
    vakitAciklama: 'Priminimai, siunčiami prasidėjus maldos laikui',
    muhafizSes: 'Maldos sargas · {ses}',
    acilSes: 'Skubus priminimas · {ses}',
    acilSesAciklama: 'Maldos laikas tuoj baigsis — skubūs priminimai',
    titresimli: '{kanal} · Su vibracija',
    alarm: 'Maldos žadintuvas',
    alarmSes: 'Maldos žadintuvas · {ses}',
    uygulamaSesi: 'Programos garsas',
    seciliSes: 'Jūsų pasirinktas garsas',
  },
  cuma: {
    baslik: 'Džumua · liko {sure} · malda artėja',
    govdeIlk: 'Iki Dhuhr liko {sure}. Pasiruoškite ir vykite į mečetę.',
    govde: 'Iki Dhuhr liko {sure}. Vykite į mečetę.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · iki azano {dk} min. · ruoškitės į mečetę',
    hazirlanGovde: 'Pasiruoškite, kad spėtumėte į {ad} maldą mečetėje; išvykite po {sonra} min. – iki azano {dk} min.',
    yolaCikBaslik: '{ad} · iki azano {dk} min. · vykite į mečetę',
    yolaCikGovde: 'Vykite į mečetę, kad spėtumėte į {ad} maldą – iki azano {dk} min.',
  },
  takvim: {
    etkinlikTek: '„{ad}“',
    etkinlikCoklu: cogul({ one: '{n} įvykis jūsų kalendoriuje', few: '{n} įvykiai iš eilės jūsų kalendoriuje', many: '{n} įvykio iš eilės jūsų kalendoriuje', other: '{n} įvykių iš eilės jūsų kalendoriuje' }),
    etkinlikBir: 'Įvykis jūsų kalendoriuje',
    sonAnIkindi: 'paskutinis tinkamas Asr laikas – {saat} (vėliau nepageidautinas laikas)',
    sonAnVakit: '{kucuk} laikas baigiasi {saat}',
    onceBaslik: '{ad} · įvykis {saat} · melskitės pirma',
    onceGovde: '{etkinlik} vyksta {aralik}; {sonAn}. Atlikite {kucuk} maldą prieš prasidedant įvykiui.',
    kaplarBaslik: '{ad} · įvykis užima maldos laiką',
    kaplarGovde:
      '{etkinlik} vyksta {aralik} ir užima {kucuk} laiką ({giris}–{son}). Jau dabar suplanuokite trumpą pertrauką ir atlikite {kucuk} maldą.',
  },
  yatis: {
    yatsiBaslik: '{ad} · melskitės prieš miegą 🌙',
    yatsiGovde: '{ad} laikas dar tęsiasi; stokite maldai prieš užmigdami.',
    ozet: 'Šiandien {kilinan}/5 · nepažymėta: {liste}',
    tekOto: 'Jei atlikote, pažymėkite. {oto}',
    tekKaza: 'Jei atlikote, pažymėkite; jei nepavyko, įtraukite į praleistų maldų žurnalą.',
    tekSuruyor: 'Jei atlikote, pažymėkite. Maldos laikas dar tęsiasi.',
    cokluOto: 'Atidarykite programą, peržiūrėkite ir pažymėkite atliktas maldas. {oto}',
    coklu: 'Atidarykite programą, peržiūrėkite ir pažymėkite atliktas maldas.',
    otoSor: 'Jei nepažymėsite, praleistų maldų žurnale jūsų bus paklausta apie šią dieną.',
    otoEkle: 'Jei nepažymėsite, pasibaigus maldos dienai jos bus įtrauktos į praleistas.',
  },
  gunSonu: {
    baslik: 'Diena neužbaigta · serija',
    govde: 'Jei atliktas maldas pažymėsite iki dienos pabaigos, jūsų serija tęsis.',
  },
};
