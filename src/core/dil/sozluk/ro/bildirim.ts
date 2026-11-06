import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ M-am rugat', kazayaEkle: 'Adăugați la recuperare', inceleyin: 'Verificați' },
  kanal: {
    genel: 'Notificări generale',
    muhafiz: 'Gardianul rugăciunii',
    muhafizAciklama: 'Mementouri pentru timpul rugăciunii',
    acil: 'Memento urgent de rugăciune',
    acilAciklama: 'Timpul rugăciunii e pe sfârșite - mementouri urgente',
    vakit: 'Orele de rugăciune',
    vakitAciklama: 'Mementouri trimise când începe timpul unei rugăciuni',
    muhafizSes: 'Gardianul rugăciunii · {ses}',
    acilSes: 'Memento urgent · {ses}',
    acilSesAciklama: 'Timpul rugăciunii e pe sfârșite — mementouri urgente',
    titresimli: '{kanal} · Cu vibrații',
    alarm: 'Alarmă de rugăciune',
    alarmSes: 'Alarmă de rugăciune · {ses}',
    uygulamaSesi: 'Sunetul aplicației',
    seciliSes: 'Sunetul ales',
  },
  cuma: {
    baslik: 'Jumu’ah · mai sunt {sure} · rugăciunea se apropie',
    govdeIlk: 'Mai sunt {sure} până la Dhuhr. Pregătiți-vă și mergeți la moschee.',
    govde: 'Mai sunt {sure} până la Dhuhr. Mergeți la moschee.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · adhan în {dk} min · pregătiți-vă pentru moschee',
    hazirlanGovde: 'Pregătiți-vă să prindeți {ad} la moschee; plecați în {sonra} min — adhanul este în {dk} min.',
    yolaCikBaslik: '{ad} · adhan în {dk} min · mergeți la moschee',
    yolaCikGovde: 'Mergeți la moschee ca să prindeți {ad} — adhanul este în {dk} min.',
  },
  takvim: {
    etkinlikTek: '„{ad}”',
    etkinlikCoklu: cogul({
      one: '{n} eveniment din calendar',
      few: '{n} evenimente consecutive din calendar',
      other: '{n} de evenimente consecutive din calendar',
    }),
    etkinlikBir: 'Un eveniment din calendar',
    sonAnIkindi: 'ultimul moment potrivit pentru Asr este {saat} (după aceea e makruh)',
    sonAnVakit: 'timpul de {kucuk} se încheie la {saat}',
    onceBaslik: '{ad} · eveniment la {saat} · rugați-vă mai întâi',
    onceGovde: '{etkinlik} are loc {aralik}; {sonAn}. Efectuați {kucuk} înainte să înceapă evenimentul.',
    kaplarBaslik: '{ad} · un eveniment acoperă timpul rugăciunii',
    kaplarGovde:
      '{etkinlik} are loc {aralik} și acoperă timpul de {kucuk} ({giris}–{son}). Planificați de acum o scurtă pauză ca să efectuați {kucuk}.',
  },
  yatis: {
    yatsiBaslik: '{ad} · rugați-vă înainte de culcare 🌙',
    yatsiGovde: 'Timpul de {ad} continuă; ridicați-vă la rugăciune înainte să adormiți.',
    ozet: 'Azi {kilinan}/5 · {liste} nemarcate',
    tekOto: 'Dacă ați efectuat-o, marcați-o. {oto}',
    tekKaza: 'Dacă ați efectuat-o, marcați-o; dacă nu ați putut, adăugați-o în Registrul de recuperare.',
    tekSuruyor: 'Dacă ați efectuat-o, marcați-o. Timpul rugăciunii continuă.',
    cokluOto: 'Deschideți aplicația ca să verificați și să marcați rugăciunile efectuate. {oto}',
    coklu: 'Deschideți aplicația ca să verificați și să marcați rugăciunile efectuate.',
    otoSor: 'Dacă nu le marcați, această zi vă va fi semnalată în Registrul de recuperare.',
    otoEkle: 'Dacă nu le marcați, vor fi adăugate la recuperare când se încheie ziua de rugăciune.',
  },
  gunSonu: {
    baslik: 'Ziua de azi nu e completă · serie',
    govde: 'Dacă marcați rugăciunile efectuate înainte de sfârșitul zilei, seria continuă.',
  },
};
