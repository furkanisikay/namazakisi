import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Başlık önden okunur: vakit adı + süre ilk 16 karakterde. Çağrılar "Sie" + kısa emir. */
export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ Gebetet', kazayaEkle: 'Als Nachholgebet', inceleyin: 'Ansehen' },
  kanal: {
    genel: 'Allgemeine Benachrichtigungen',
    muhafiz: 'Gebetswächter',
    muhafizAciklama: 'Erinnerungen an die Gebetszeiten',
    acil: 'Dringende Gebetserinnerung',
    acilAciklama: 'Gebetszeit endet bald - dringende Erinnerungen',
    vakit: 'Gebetszeiten',
    vakitAciklama: 'Erinnerungen, wenn eine Gebetszeit beginnt',
    muhafizSes: 'Gebetswächter · {ses}',
    acilSes: 'Dringende Gebetserinnerung · {ses}',
    acilSesAciklama: 'Gebetszeit endet bald — dringende Erinnerungen',
    titresimli: '{kanal} · Vibration',
    alarm: 'Gebetsalarm',
    alarmSes: 'Gebetsalarm · {ses}',
    uygulamaSesi: 'App-Ton',
    seciliSes: 'Ihr gewählter Ton',
  },
  cuma: {
    baslik: 'Freitagsgebet · noch {sure} · das Gebet naht',
    govdeIlk: 'Noch {sure} bis Dhuhr. Machen Sie sich bereit und brechen Sie zur Moschee auf.',
    govde: 'Noch {sure} bis Dhuhr. Machen Sie sich auf den Weg zur Moschee.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · {dk} Min. bis Adhan · bereit machen',
    hazirlanGovde: 'Machen Sie sich bereit, um {ad} in der Moschee zu erreichen; brechen Sie in {sonra} Min. auf — Adhan in {dk} Min.',
    yolaCikBaslik: '{ad} · {dk} Min. bis Adhan · zur Moschee',
    yolaCikGovde: 'Brechen Sie zur Moschee auf, um {ad} dort zu erreichen — Adhan in {dk} Min.',
  },
  takvim: {
    etkinlikTek: '„{ad}“',
    etkinlikCoklu: cogul({ one: '{n} Termin in Ihrem Kalender', other: '{n} aufeinanderfolgende Termine in Ihrem Kalender' }),
    etkinlikBir: 'Ein Termin in Ihrem Kalender',
    sonAnIkindi: 'der letzte geeignete Zeitpunkt für Asr ist {saat} (danach Makruh-Zeit)',
    sonAnVakit: 'die Zeit von {kucuk} endet um {saat}',
    onceBaslik: '{ad} · Termin um {saat} · vorher beten',
    onceGovde: '{etkinlik} findet {aralik} statt; {sonAn}. Beten Sie {kucuk}, bevor der Termin beginnt.',
    kaplarBaslik: '{ad} · ein Termin überdeckt die Gebetszeit',
    kaplarGovde:
      '{etkinlik} findet {aralik} statt und überdeckt die Zeit von {kucuk} ({giris}–{son}). Planen Sie schon jetzt eine kurze Pause ein, um {kucuk} zu beten.',
  },
  yatis: {
    yatsiBaslik: '{ad} · vor dem Schlafen beten 🌙',
    yatsiGovde: 'Die {ad}-Zeit läuft noch; beten Sie, bevor Sie einschlafen.',
    ozet: 'Heute {kilinan}/5 · {liste} nicht markiert',
    tekOto: 'Wenn Sie es gebetet haben, markieren Sie es. {oto}',
    tekKaza: 'Wenn Sie es gebetet haben, markieren Sie es; wenn nicht, tragen Sie es in Ihr Nachholbuch ein.',
    tekSuruyor: 'Wenn Sie es gebetet haben, markieren Sie es. Die Gebetszeit läuft noch.',
    cokluOto: 'Öffnen Sie die App, um Ihre verrichteten Gebete zu prüfen und zu markieren. {oto}',
    coklu: 'Öffnen Sie die App, um Ihre verrichteten Gebete zu prüfen und zu markieren.',
    otoSor: 'Wenn Sie nicht markieren, werden Sie im Nachholbuch nach diesem Tag gefragt.',
    otoEkle: 'Wenn Sie nicht markieren, wird es am Ende des Gebetstages als Nachholgebet eingetragen.',
  },
  gunSonu: {
    baslik: 'Tag nicht vollständig · Serie',
    govde: 'Wenn Sie Ihre verrichteten Gebete vor Tagesende markieren, bleibt Ihre Serie erhalten.',
  },
};
