// ÇEVİRİ: ta — İngilizce iskelet, çevrilince bu satır silinir
import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: "✅ I've prayed", kazayaEkle: 'Add to qada', inceleyin: 'Review' },
  kanal: {
    genel: 'General notifications',
    muhafiz: 'Prayer Guardian',
    muhafizAciklama: 'Prayer time reminders',
    acil: 'Urgent prayer reminder',
    acilAciklama: 'Prayer time is about to end - urgent reminders',
    vakit: 'Prayer times',
    vakitAciklama: 'Reminders sent when a prayer time begins',
    muhafizSes: 'Prayer Guardian · {ses}',
    acilSes: 'Urgent reminder · {ses}',
    acilSesAciklama: 'Prayer time is about to end — urgent reminders',
    titresimli: '{kanal} · Vibrating',
    alarm: 'Prayer alarm',
    alarmSes: 'Prayer alarm · {ses}',
    uygulamaSesi: 'App sound',
    seciliSes: 'Your chosen sound',
  },
  cuma: {
    baslik: "Jumu'ah · {sure} left · prayer is near",
    govdeIlk: '{sure} until Dhuhr. Get ready and head to the mosque.',
    govde: '{sure} until Dhuhr. Head to the mosque.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · {dk}m to adhan · get ready for the mosque',
    hazirlanGovde: 'Get ready to catch {ad} at the mosque; leave in {sonra} min — adhan in {dk} min.',
    yolaCikBaslik: '{ad} · {dk}m to adhan · head to the mosque',
    yolaCikGovde: 'Head to the mosque to catch {ad} — adhan in {dk} min.',
  },
  takvim: {
    etkinlikTek: '“{ad}”',
    etkinlikCoklu: cogul({ one: '{n} event in your calendar', other: '{n} back-to-back events in your calendar' }),
    etkinlikBir: 'An event in your calendar',
    sonAnIkindi: 'the last suitable time for Asr is {saat} (makruh after that)',
    sonAnVakit: '{kucuk} time ends at {saat}',
    onceBaslik: '{ad} · event at {saat} · pray first',
    onceGovde: '{etkinlik} runs {aralik}; {sonAn}. Pray {kucuk} before the event starts.',
    kaplarBaslik: '{ad} · an event covers the prayer time',
    kaplarGovde:
      '{etkinlik} runs {aralik} and covers {kucuk} time ({giris}–{son}). Plan now to take a short break and pray {kucuk}.',
  },
  yatis: {
    yatsiBaslik: '{ad} · pray before bed 🌙',
    yatsiGovde: '{ad} time is still on; stand for prayer before you fall asleep.',
    ozet: 'Today {kilinan}/5 · {liste} not marked',
    tekOto: 'If you prayed it, mark it. {oto}',
    tekKaza: "If you prayed it, mark it; if you couldn't, add it to your Qada log.",
    tekSuruyor: 'If you prayed it, mark it. The prayer time is still on.',
    cokluOto: 'Open the app to review and mark the prayers you prayed. {oto}',
    coklu: 'Open the app to review and mark the prayers you prayed.',
    otoSor: "If you don't mark them, you'll be asked about this day in the Qada log.",
    otoEkle: "If you don't mark them, they'll be added to qada when the prayer day ends.",
  },
  gunSonu: {
    baslik: "Today isn't complete · streak",
    govde: 'If you mark the prayers you prayed before the day ends, your streak continues.',
  },
};
