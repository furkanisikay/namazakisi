import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** İbadete çağrılar "vous" + kısa emir; işaretleme/muhasebe kibar açıklama. Başlık önden okunur. */
export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ J’ai prié', kazayaEkle: 'À rattraper', inceleyin: 'Voir' },
  kanal: {
    genel: 'Notifications générales',
    muhafiz: 'Gardien de la prière',
    muhafizAciklama: 'Rappels des heures de prière',
    acil: 'Rappel de prière urgent',
    acilAciklama: 'L’heure de prière va se terminer - rappels urgents',
    vakit: 'Heures de prière',
    vakitAciklama: 'Rappels envoyés au début de chaque heure de prière',
    muhafizSes: 'Gardien de la prière · {ses}',
    acilSes: 'Rappel urgent · {ses}',
    acilSesAciklama: 'L’heure de prière va se terminer — rappels urgents',
    titresimli: '{kanal} · Vibreur',
    alarm: 'Alarme de prière',
    alarmSes: 'Alarme de prière · {ses}',
    uygulamaSesi: 'Son de l’application',
    seciliSes: 'Le son choisi',
  },
  cuma: {
    baslik: 'Joumoua · {sure} · la prière approche',
    govdeIlk: 'Dhuhr dans {sure}. Préparez-vous et partez à la mosquée.',
    govde: 'Dhuhr dans {sure}. Partez à la mosquée.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · {dk} min avant l’adhan · préparez-vous',
    hazirlanGovde: 'Préparez-vous pour prier {ad} à la mosquée ; partez dans {sonra} min — adhan dans {dk} min.',
    yolaCikBaslik: '{ad} · {dk} min avant l’adhan · partez',
    yolaCikGovde: 'Partez à la mosquée pour prier {ad} — adhan dans {dk} min.',
  },
  takvim: {
    etkinlikTek: '« {ad} »',
    etkinlikCoklu: cogul({
      one: '{n} événement de votre agenda',
      many: '{n} d’événements consécutifs de votre agenda',
      other: '{n} événements consécutifs de votre agenda',
    }),
    etkinlikBir: 'Un événement de votre agenda',
    sonAnIkindi: 'le dernier moment convenable pour Asr est {saat} (makrouh ensuite)',
    sonAnVakit: '{kucuk} se termine à {saat}',
    onceBaslik: '{ad} · événement à {saat} · priez avant',
    onceGovde: '{etkinlik} ({aralik}) ; {sonAn}. Priez {kucuk} avant le début de l’événement.',
    kaplarBaslik: '{ad} · un événement couvre l’heure de prière',
    kaplarGovde:
      '{etkinlik} ({aralik}) couvre {kucuk} ({giris}–{son}). Prévoyez dès maintenant une courte pause pour prier {kucuk}.',
  },
  yatis: {
    yatsiBaslik: '{ad} · priez avant de dormir 🌙',
    yatsiGovde: '{ad} est encore en cours ; allez prier avant de vous endormir.',
    ozet: 'Aujourd’hui {kilinan}/5 · {liste} non marquées',
    tekOto: 'Si vous l’avez priée, marquez-la. {oto}',
    tekKaza: 'Si vous l’avez priée, marquez-la ; sinon, ajoutez-la à votre carnet de rattrapage.',
    tekSuruyor: 'Si vous l’avez priée, marquez-la. L’heure de prière est encore en cours.',
    cokluOto: 'Ouvrez l’application pour vérifier et marquer les prières accomplies. {oto}',
    coklu: 'Ouvrez l’application pour vérifier et marquer les prières accomplies.',
    otoSor: 'Si vous ne les marquez pas, cette journée vous sera proposée dans le carnet de rattrapage.',
    otoEkle: 'Si vous ne les marquez pas, elles seront ajoutées aux prières à rattraper à la fin de la journée de prière.',
  },
  gunSonu: {
    baslik: 'Journée incomplète · série',
    govde: 'Si vous marquez les prières accomplies avant la fin de la journée, votre série continue.',
  },
};
