import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** İbadete çağrılar "usted" + kısa emir ("Rece", "Salga hacia la mezquita"); işaretleme/muhasebe kibar açıklama. Başlık önden okunur. */
export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ Ya recé', kazayaEkle: 'Añadir a qada', inceleyin: 'Revisar' },
  kanal: {
    genel: 'Notificaciones generales',
    muhafiz: 'Guardián del rezo',
    muhafizAciklama: 'Recordatorios de las horas de rezo',
    acil: 'Recordatorio urgente de rezo',
    acilAciklama: 'La hora del rezo está por terminar - recordatorios urgentes',
    vakit: 'Horas de rezo',
    vakitAciklama: 'Recordatorios enviados al comenzar cada hora de rezo',
    muhafizSes: 'Guardián del rezo · {ses}',
    acilSes: 'Recordatorio urgente · {ses}',
    acilSesAciklama: 'La hora del rezo está por terminar — recordatorios urgentes',
    titresimli: '{kanal} · Con vibración',
    alarm: 'Alarma de rezo',
    alarmSes: 'Alarma de rezo · {ses}',
    uygulamaSesi: 'Sonido de la aplicación',
    seciliSes: 'El sonido elegido',
  },
  cuma: {
    baslik: 'Yumu’a · {sure} · se acerca el rezo',
    govdeIlk: 'Faltan {sure} para Dhuhr. Prepárese y salga hacia la mezquita.',
    govde: 'Faltan {sure} para Dhuhr. Salga hacia la mezquita.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · adhan en {dk} min · prepárese',
    hazirlanGovde: 'Prepárese para rezar {ad} en la mezquita; salga en {sonra} min — adhan en {dk} min.',
    yolaCikBaslik: '{ad} · adhan en {dk} min · salga ya',
    yolaCikGovde: 'Salga hacia la mezquita para rezar {ad} — adhan en {dk} min.',
  },
  takvim: {
    etkinlikTek: '«{ad}»',
    etkinlikCoklu: cogul({
      one: '{n} evento de su calendario',
      other: '{n} eventos seguidos de su calendario',
      many: '{n} de eventos seguidos de su calendario',
    }),
    etkinlikBir: 'Un evento de su calendario',
    sonAnIkindi: 'el último momento adecuado para Asr es {saat} (después es makruh)',
    sonAnVakit: '{kucuk} termina a las {saat}',
    onceBaslik: '{ad} · evento a las {saat} · rece antes',
    onceGovde: '{etkinlik} ({aralik}); {sonAn}. Rece {kucuk} antes de que empiece el evento.',
    kaplarBaslik: '{ad} · un evento cubre la hora',
    kaplarGovde:
      '{etkinlik} ({aralik}) cubre {kucuk} ({giris}–{son}). Planee desde ahora una breve pausa para rezar {kucuk}.',
  },
  yatis: {
    yatsiBaslik: '{ad} · rece antes de dormir 🌙',
    yatsiGovde: 'La hora de {ad} sigue en curso; vaya a rezar antes de dormirse.',
    ozet: 'Hoy {kilinan}/5 · {liste} sin marcar',
    tekOto: 'Si ya lo rezó, márquelo. {oto}',
    tekKaza: 'Si ya lo rezó, márquelo; si no, añádalo a su registro de qada.',
    tekSuruyor: 'Si ya lo rezó, márquelo. La hora sigue en curso.',
    cokluOto: 'Abra la aplicación para revisar y marcar los rezos que hizo. {oto}',
    coklu: 'Abra la aplicación para revisar y marcar los rezos que hizo.',
    otoSor: 'Si no los marca, se le preguntará por este día en el registro de qada.',
    otoEkle: 'Si no los marca, se añadirán a qada cuando termine el día de rezo.',
  },
  gunSonu: {
    baslik: 'Día sin completar · racha',
    govde: 'Si marca los rezos que hizo antes de que termine el día, su racha continúa.',
  },
};
