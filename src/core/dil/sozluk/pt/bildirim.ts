import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Başlık önden okunur: vakit adı + süre ilk 16 karakterde. İbadete çağrı kısa kibar emir ("Vá para a mesquita"). */
export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ Rezei', kazayaEkle: 'Marcar para repor', inceleyin: 'Rever' },
  kanal: {
    genel: 'Notificações gerais',
    muhafiz: 'Guardião da Oração',
    muhafizAciklama: 'Lembretes das horas da oração',
    acil: 'Lembrete urgente da oração',
    acilAciklama: 'A hora da oração está a terminar - lembretes urgentes',
    vakit: 'Horas das orações',
    vakitAciklama: 'Lembretes enviados quando começa a hora de uma oração',
    muhafizSes: 'Guardião da Oração · {ses}',
    acilSes: 'Lembrete urgente · {ses}',
    acilSesAciklama: 'A hora da oração está a terminar — lembretes urgentes',
    titresimli: '{kanal} · Com vibração',
    alarm: 'Alarme da oração',
    alarmSes: 'Alarme da oração · {ses}',
    uygulamaSesi: 'Som da aplicação',
    seciliSes: 'O som escolhido',
  },
  cuma: {
    baslik: 'Jumu’ah · {sure} até à oração · está a aproximar-se',
    govdeIlk: 'Faltam {sure} para o Zuhr. Prepare-se e vá para a mesquita.',
    govde: 'Faltam {sure} para o Zuhr. Vá para a mesquita.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · {dk} min até ao Azán · prepare-se para a mesquita',
    hazirlanGovde: 'Prepare-se para chegar a tempo da oração de {ad} na mesquita; saia dentro de {sonra} min — Azán dentro de {dk} min.',
    yolaCikBaslik: '{ad} · {dk} min até ao Azán · vá para a mesquita',
    yolaCikGovde: 'Vá para a mesquita para chegar a tempo da oração de {ad} — Azán dentro de {dk} min.',
  },
  takvim: {
    etkinlikTek: '“{ad}”',
    etkinlikCoklu: cogul({ one: '{n} evento do seu calendário', many: '{n} de eventos seguidos do seu calendário', other: '{n} eventos seguidos do seu calendário' }),
    etkinlikBir: 'Um evento do seu calendário',
    sonAnIkindi: 'o último momento adequado para o Assr é às {saat} (depois disso é horário proibido)',
    sonAnVakit: 'a hora de {kucuk} termina às {saat}',
    onceBaslik: '{ad} · evento às {saat} · reze primeiro',
    onceGovde: '{etkinlik} decorre {aralik}; {sonAn}. Reze a oração de {kucuk} antes de o evento começar.',
    kaplarBaslik: '{ad} · um evento ocupa a hora da oração',
    kaplarGovde:
      '{etkinlik} decorre {aralik} e ocupa a hora de {kucuk} ({giris}–{son}). Planeie desde já uma pausa breve para rezar a oração de {kucuk}.',
  },
  yatis: {
    yatsiBaslik: '{ad} · reze antes de dormir 🌙',
    yatsiGovde: 'A hora de {ad} ainda continua; cumpra a oração antes de adormecer.',
    ozet: 'Hoje {kilinan}/5 · {liste} por marcar',
    tekOto: 'Se já rezou, marque-a. {oto}',
    tekKaza: 'Se já rezou, marque-a; se não conseguiu, adicione-a ao seu registo de reposições.',
    tekSuruyor: 'Se já rezou, marque-a. A hora da oração ainda continua.',
    cokluOto: 'Abra a aplicação para rever e marcar as orações que rezou. {oto}',
    coklu: 'Abra a aplicação para rever e marcar as orações que rezou.',
    otoSor: 'Se não as marcar, este dia ser-lhe-á perguntado no Registo de reposições.',
    otoEkle: 'Se não as marcar, serão adicionadas às reposições quando terminar o dia de oração.',
  },
  gunSonu: {
    baslik: 'O dia não está completo · sequência',
    govde: 'Se marcar as orações que rezou antes de o dia terminar, a sua sequência continua.',
  },
};
