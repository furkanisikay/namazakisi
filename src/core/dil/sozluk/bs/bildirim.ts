import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ Klanjano', kazayaEkle: 'Dodajte u kada', inceleyin: 'Pregledajte' },
  kanal: {
    genel: 'Opća obavještenja',
    muhafiz: 'Čuvar namaza',
    muhafizAciklama: 'Podsjetnici za namaska vremena',
    acil: 'Hitni podsjetnik za namaz',
    acilAciklama: 'Vakat samo što nije istekao - hitni podsjetnici',
    vakit: 'Namaska vremena',
    vakitAciklama: 'Podsjetnici koji se šalju kada nastupi vakat',
    muhafizSes: 'Čuvar namaza · {ses}',
    acilSes: 'Hitni podsjetnik · {ses}',
    acilSesAciklama: 'Vakat samo što nije istekao — hitni podsjetnici',
    titresimli: '{kanal} · S vibracijom',
    alarm: 'Alarm za namaz',
    alarmSes: 'Alarm za namaz · {ses}',
    uygulamaSesi: 'Zvuk aplikacije',
    seciliSes: 'Zvuk koji ste odabrali',
  },
  cuma: {
    baslik: 'Džuma · još {sure} · namaz se bliži',
    govdeIlk: 'Do podne-namaza: još {sure}. Spremite se i krenite u džamiju.',
    govde: 'Do podne-namaza: još {sure}. Krenite u džamiju.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · {dk} min do ezana · spremite se za džamiju',
    hazirlanGovde: 'Spremite se da u džamiji stignete na namaz ({ad}); krenite za {sonra} min — ezan za {dk} min.',
    yolaCikBaslik: '{ad} · {dk} min do ezana · krenite u džamiju',
    yolaCikGovde: 'Krenite u džamiju da stignete na namaz ({ad}) — ezan za {dk} min.',
  },
  takvim: {
    etkinlikTek: '„{ad}”',
    etkinlikCoklu: cogul({
      one: '{n} događaj u Vašem kalendaru',
      few: '{n} uzastopna događaja u Vašem kalendaru',
      other: '{n} uzastopnih događaja u Vašem kalendaru',
    }),
    etkinlikBir: 'Jedan događaj u Vašem kalendaru',
    sonAnIkindi: 'posljednji prikladan trenutak za ikindiju je {saat} (nakon toga je mekruh)',
    sonAnVakit: '{kucuk}: vakat ističe u {saat}',
    onceBaslik: '{ad} · događaj u {saat} · prvo klanjajte',
    onceGovde: '{etkinlik} traje {aralik}; {sonAn}. Klanjajte {kucuk}-namaz prije početka događaja.',
    kaplarBaslik: '{ad} · događaj pokriva vakat',
    kaplarGovde:
      '{etkinlik} traje {aralik} i pokriva vakat ({kucuk}, {giris}–{son}). Već sada planirajte kratku pauzu da klanjate {kucuk}-namaz.',
  },
  yatis: {
    yatsiBaslik: '{ad} · klanjajte prije spavanja 🌙',
    yatsiGovde: '{ad}: vakat još traje; stanite na namaz prije nego što zaspite.',
    ozet: 'Danas {kilinan}/5 · nije označeno: {liste}',
    tekOto: 'Ako ste klanjali, označite. {oto}',
    tekKaza: 'Ako ste klanjali, označite; ako niste mogli, dodajte ga u evidenciju kada-namaza.',
    tekSuruyor: 'Ako ste klanjali, označite. Vakat još traje.',
    cokluOto: 'Otvorite aplikaciju i pregledajte namaze kako biste označili klanjane. {oto}',
    coklu: 'Otvorite aplikaciju i pregledajte namaze kako biste označili klanjane.',
    otoSor: 'Ako ne označite, za ovaj dan bit ćete upitani u evidenciji kada-namaza.',
    otoEkle: 'Ako ne označite, po završetku namaskog dana bit će dodano u kada-namaze.',
  },
  gunSonu: {
    baslik: 'Dan nije potpun · niz',
    govde: 'Ako klanjane namaze označite prije kraja dana, Vaš niz se nastavlja.',
  },
};
