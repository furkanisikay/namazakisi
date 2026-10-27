import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Nafile = "rezos voluntarios (nafila)"; vakit adları Duha / Awwabin / Tahajjud (özel ad). */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajjud' },
  kucuk: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajjud' },
  aciklamalar: {
    kusluk:
      'Comienza unos 45 minutos después de la salida del sol y dura hasta 10 minutos antes de Dhuhr. Ishraq es su primer momento; el más meritorio llega pasado el primer cuarto del día.',
    evvabin: 'Se reza después de Maghrib, hasta la hora de Isha.',
    teheccud: 'Se reza después de Isha, al levantarse tras haber dormido, hasta la hora de Fajr. Su momento más meritorio es el último tercio de la noche.',
  },
  bilgiBugun: '{aciklama}\n\nHoy: {bas} – {son}',
  enFaziletli: ' · más meritorio después de las {saat}',
  sonUcteBir: ' · último tercio {saat}',
  durumAktif: 'Es la hora · termina {saat}',
  durumNafile: 'Nafila · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Hora de Duha',
    kuslukSuruyor: 'La hora de Duha sigue en curso; puede rezar hasta las {son}.',
    kuslukGirdi: 'Ha comenzado la hora de Duha. Un buen momento para dos rakats; dura hasta las {son}.',
    kuslukBitiyor: cogul({
      one: 'Queda {n} minuto para que termine Duha. Un buen momento para dos rakats; dura hasta las {son}.',
      other: 'Quedan {n} minutos para que termine Duha. Un buen momento para dos rakats; dura hasta las {son}.',
      many: 'Quedan {n} de minutos para que termine Duha. Un buen momento para dos rakats; dura hasta las {son}.',
    }),
    evvabinBaslik: 'Awwabin',
    evvabinSuruyor: 'Aún hay tiempo para Awwabin. Isha comienza a las {son}.',
    evvabinGirdi: 'Después de Maghrib, un buen momento para Awwabin. Isha comienza a las {son}.',
    evvabinKalan: cogul({
      one: 'Queda {n} minuto para Awwabin. Isha comienza a las {son}.',
      other: 'Quedan {n} minutos para Awwabin. Isha comienza a las {son}.',
      many: 'Quedan {n} de minutos para Awwabin. Isha comienza a las {son}.',
    }),
    teheccudBaslik: 'Hora de Tahajjud',
    uyandirSonUcte: 'Levántese; ha comenzado el último tercio de la noche. Fajr comienza a las {son}.',
    uyandirKalan: cogul({
      one: 'Levántese; queda {n} minuto para Fajr. Fajr comienza a las {son}.',
      other: 'Levántese; quedan {n} minutos para Fajr. Fajr comienza a las {son}.',
      many: 'Levántese; quedan {n} de minutos para Fajr. Fajr comienza a las {son}.',
    }),
    sonUcteBaslik: 'El último tercio de la noche',
    sonUcteGovde: 'Las horas más benditas para Tahajjud. Fajr comienza a las {son}.',
    teheccudKalan: cogul({
      one: 'Queda {n} minuto para Fajr. Un buen momento para Tahajjud.',
      other: 'Quedan {n} minutos para Fajr. Un buen momento para Tahajjud.',
      many: 'Quedan {n} de minutos para Fajr. Un buen momento para Tahajjud.',
    }),
  },
  uyandirmaKanali: 'Despertador de Tahajjud',
  uyandirmaKanaliAciklama: 'Le despierta para el rezo de la noche; suena incluso en modo silencio',
};
