import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Bildirim başlıkları kısa (bileklik ~16 karakter); ibadete çağrı "vi" + kısa çoğul emir. */
export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ Klanjano', kazayaEkle: 'Dodaj u kada-namaze', inceleyin: 'Pregledajte' },
  kanal: {
    genel: 'Opće obavijesti',
    muhafiz: 'Čuvar namaza',
    muhafizAciklama: 'Podsjetnici za vrijeme namaza',
    acil: 'Hitan podsjetnik za namaz',
    acilAciklama: 'Vrijeme namaza uskoro istječe - hitni podsjetnici',
    vakit: 'Vremena namaza',
    vakitAciklama: 'Podsjetnici koji se šalju kad nastupi vrijeme namaza',
    muhafizSes: 'Čuvar namaza · {ses}',
    acilSes: 'Hitan podsjetnik · {ses}',
    acilSesAciklama: 'Vrijeme namaza uskoro istječe — hitni podsjetnici',
    titresimli: '{kanal} · s vibracijom',
    alarm: 'Alarm za namaz',
    alarmSes: 'Alarm za namaz · {ses}',
    uygulamaSesi: 'Zvuk aplikacije',
    seciliSes: 'Zvuk koji ste odabrali',
  },
  cuma: {
    baslik: 'Džuma · još {sure} · namaz je blizu',
    govdeIlk: 'Do podne-namaza još {sure}. Pripremite se i krenite u džamiju.',
    govde: 'Do podne-namaza još {sure}. Krenite u džamiju.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · ezan za {dk} min · pripremite se',
    hazirlanGovde: 'Pripremite se da stignete na namaz u džamiju ({ad}); krenite za {sonra} min — ezan je za {dk} min.',
    yolaCikBaslik: '{ad} · ezan za {dk} min · krenite u džamiju',
    yolaCikGovde: 'Krenite u džamiju da stignete na namaz ({ad}) — ezan je za {dk} min.',
  },
  takvim: {
    etkinlikTek: '„{ad}“',
    etkinlikCoklu: cogul({
      one: '{n} događaj u vašem kalendaru',
      few: '{n} uzastopna događaja u vašem kalendaru',
      other: '{n} uzastopnih događaja u vašem kalendaru',
    }),
    etkinlikBir: 'Jedan događaj u vašem kalendaru',
    sonAnIkindi: 'posljednje prikladno vrijeme za ikindiju je {saat} (nakon toga je mekruh)',
    sonAnVakit: 'vrijeme namaza ({kucuk}) istječe u {saat}',
    onceBaslik: '{ad} · događaj u {saat} · najprije klanjajte',
    onceGovde: '{etkinlik} traje {aralik}; {sonAn}. Klanjajte ({kucuk}) prije početka događaja.',
    kaplarBaslik: '{ad} · događaj pokriva vrijeme namaza',
    kaplarGovde:
      '{etkinlik} traje {aralik} i pokriva vrijeme namaza ({kucuk}, {giris}–{son}). Već sada isplanirajte kratku stanku za namaz: {kucuk}.',
  },
  yatis: {
    yatsiBaslik: '{ad} · klanjajte prije spavanja 🌙',
    yatsiGovde: 'Vrijeme namaza ({ad}) još traje; ustanite na namaz prije nego što zaspite.',
    ozet: 'Danas {kilinan}/5 · nije označeno: {liste}',
    tekOto: 'Ako ste klanjali, označite. {oto}',
    tekKaza: 'Ako ste klanjali, označite; ako niste uspjeli, dodajte namaz u evidenciju kada-namaza.',
    tekSuruyor: 'Ako ste klanjali, označite. Vrijeme namaza još traje.',
    cokluOto: 'Otvorite aplikaciju da pregledate i označite namaze koje ste klanjali. {oto}',
    coklu: 'Otvorite aplikaciju da pregledate i označite namaze koje ste klanjali.',
    otoSor: 'Ako ih ne označite, u evidenciji kada-namaza bit ćete upitani za ovaj dan.',
    otoEkle: 'Ako ih ne označite, bit će dodani u kada-namaze kad završi dan namaza.',
  },
  gunSonu: {
    baslik: 'Današnji dan nije potpun · niz',
    govde: 'Ako prije kraja dana označite namaze koje ste klanjali, vaš se niz nastavlja.',
  },
};
