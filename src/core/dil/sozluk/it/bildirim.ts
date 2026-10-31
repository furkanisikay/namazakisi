import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Çağrı metinleri Lei + kısa emir ("Si prepari", "Compia"); başlıkta vakit adı + süre ilk 16 karakterde. */
export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ Ho pregato', kazayaEkle: 'Aggiungere ai recuperi', inceleyin: 'Rivedere' },
  kanal: {
    genel: 'Notifiche generali',
    muhafiz: 'Custode della preghiera',
    muhafizAciklama: 'Promemoria degli orari di preghiera',
    acil: 'Promemoria urgente',
    acilAciklama: 'L’orario di preghiera sta per finire - promemoria urgenti',
    vakit: 'Orari di preghiera',
    vakitAciklama: 'Promemoria inviati quando inizia un orario di preghiera',
    muhafizSes: 'Custode della preghiera · {ses}',
    acilSes: 'Promemoria urgente · {ses}',
    acilSesAciklama: 'L’orario di preghiera sta per finire — promemoria urgenti',
    titresimli: '{kanal} · Con vibrazione',
    alarm: 'Sveglia di preghiera',
    alarmSes: 'Sveglia di preghiera · {ses}',
    uygulamaSesi: 'Suono dell’app',
    seciliSes: 'Suono scelto',
  },
  cuma: {
    baslik: 'Jumu’ah · mancano {sure} · la preghiera è vicina',
    govdeIlk: 'Mancano {sure} allo Zuhr. Si prepari e vada in moschea.',
    govde: 'Mancano {sure} allo Zuhr. Si avvii verso la moschea.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · {dk} min all’adhan · si prepari per la moschea',
    hazirlanGovde: 'Si prepari per arrivare in moschea per {ad}; parta tra {sonra} min — adhan tra {dk} min.',
    yolaCikBaslik: '{ad} · {dk} min all’adhan · si avvii verso la moschea',
    yolaCikGovde: 'Si avvii verso la moschea per arrivare in tempo per {ad} — adhan tra {dk} min.',
  },
  takvim: {
    etkinlikTek: '«{ad}»',
    etkinlikCoklu: cogul({ one: '{n} evento del suo calendario', many: '{n} di eventi consecutivi del suo calendario', other: '{n} eventi consecutivi del suo calendario' }),
    etkinlikBir: 'Un evento del suo calendario',
    sonAnIkindi: 'l’ultimo momento adatto per l’Asr è alle {saat} (dopo è makruh)',
    sonAnVakit: 'il tempo di {kucuk} finisce alle {saat}',
    onceBaslik: '{ad} · evento alle {saat} · preghi prima',
    onceGovde: '{etkinlik} si svolge {aralik}; {sonAn}. Compia {kucuk} prima che inizi l’evento.',
    kaplarBaslik: '{ad} · un evento copre l’orario',
    kaplarGovde:
      '{etkinlik} si svolge {aralik} e copre il tempo di {kucuk} ({giris}–{son}). Pianifichi già ora una breve pausa per compiere {kucuk}.',
  },
  yatis: {
    yatsiBaslik: '{ad} · preghi prima di dormire 🌙',
    yatsiGovde: 'Il tempo di {ad} è ancora in corso; si alzi per la preghiera prima di addormentarsi.',
    ozet: 'Oggi {kilinan}/5 · {liste} non segnati',
    tekOto: 'Se l’ha compiuta, la segni. {oto}',
    tekKaza: 'Se l’ha compiuta, la segni; se non ha potuto, la aggiunga al registro dei recuperi.',
    tekSuruyor: 'Se l’ha compiuta, la segni. L’orario è ancora in corso.',
    cokluOto: 'Apra l’app per rivedere e segnare le preghiere compiute. {oto}',
    coklu: 'Apra l’app per rivedere e segnare le preghiere compiute.',
    otoSor: 'Se non le segna, le verrà chiesto di questo giorno nel registro dei recuperi.',
    otoEkle: 'Se non le segna, verranno aggiunte ai recuperi alla fine del giorno di preghiera.',
  },
  gunSonu: {
    baslik: 'Giornata non completa · serie',
    govde: 'Se segna le preghiere compiute prima che finisca il giorno, la sua serie continua.',
  },
};
