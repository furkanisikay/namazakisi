import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı: "usted" + kısa emir; secde fiili yok ("vaya a rezar"). Sıra Türkçe
 * şablonlarla BİREBİR eşleşir. Dakika her zaman "minutos" (kısaltma yok); tekil uyumu
 * `dakikaUyumu` yapar ("1 minuto").
 */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'restantes', girisindenItibaren: 'transcurridos' },
  cip: { vakit: 'Nombre del rezo', sure: 'Minutos', yon: 'restantes / transcurridos', cuma: 'Yumu’a', yatsi: 'Isha' },
  sablon: {
    muhafizCikis: [
      '{vakit} está terminando, quedan {süre} minutos.',
      'No se pierda {vakit}, quedan {süre} minutos.',
      'El tiempo se acorta, {vakit} termina en {süre} minutos.',
    ],
    muhafizGiris: [
      '{vakit} ha comenzado, han pasado {süre} minutos.',
      'No retrase {vakit}, ya han pasado {süre} minutos.',
      'El tiempo avanza, vaya a rezar {vakit}, ya son {süre} minutos.',
    ],
    nafile: [
      '{vakit}, {süre} minutos {yön}. Un buen momento para dos rakats.',
      '{vakit} sigue en curso. Una buena ocasión para rezar dos rakats.',
      'Para {vakit}, {süre} minutos {yön}.',
    ],
    cuma: [
      'Faltan {süre} minutos para Yumu’a. Prepárese y salga hacia la mezquita.',
      'Se acerca Yumu’a, quedan {süre} minutos.',
      'Llegue a tiempo al sermón, faltan {süre} minutos para Yumu’a.',
    ],
    camiyeGit: [
      'Faltan {süre} minutos para {vakit}. Salga hacia la mezquita.',
      'Es hora de ir a la mezquita, faltan {süre} minutos para {vakit}.',
      'Salga hacia la mezquita para {vakit}.',
    ],
    yatis: ['Rece Isha antes de acostarse.', 'La hora de Isha sigue en curso, vaya a rezar antes de dormir.', 'No se duerma sin haber rezado Isha.'],
    takvim: [
      'Un evento de su calendario coincide con {vakit}.',
      '{vakit} coincide con un evento; no olvide rezar antes.',
      'Dentro de {süre} minutos, {vakit} coincide con su evento; no olvide su rezo.',
    ],
  },
  otomatik: {
    cuma: 'Para Yumu’a, faltan {sure} para Dhuhr. Prepárese y salga hacia la mezquita.',
    camiyeGiris: 'Faltan {sure} para {vakit}.',
    camiyeHazirlan: 'Prepárese y salga hacia la mezquita.',
    camiyeYola: 'Salga hacia la mezquita.',
    takvimGiris: 'Un evento de su calendario coincide con {vakit}.',
    takvimOnce: 'No olvide rezar antes del evento.',
    takvimKaplar: 'No olvide hacer una pausa para rezar.',
    yatsi: 'Rece Isha antes de acostarse.',
    muhasebeTek: '{vakit} parece sin marcar hoy.',
    muhasebeCoklu: cogul({
      one: '{n} rezo parece sin marcar hoy.',
      other: '{n} rezos parecen sin marcar hoy.',
      many: '{n} de rezos parecen sin marcar hoy.',
    }),
    geceCapasi: 'Las horas de silencio empiezan en {süre} minutos. Rece {vakit} antes de acostarse.',
    kuslukSuruyor: 'La hora de Duha sigue en curso.',
    kuslukGirdi: 'Ha comenzado la hora de Duha. Un buen momento para dos rakats.',
    kuslukBitiyor: cogul({
      one: 'Queda {n} minuto para que termine Duha.',
      other: 'Quedan {n} minutos para que termine Duha.',
      many: 'Quedan {n} de minutos para que termine Duha.',
    }),
    evvabinSuruyor: 'Aún hay tiempo para Awwabin.',
    evvabinGirdi: 'Hora de Awwabin. Un buen momento para dos rakats.',
    evvabinKalan: cogul({
      one: 'Queda {n} minuto para Awwabin.',
      other: 'Quedan {n} minutos para Awwabin.',
      many: 'Quedan {n} de minutos para Awwabin.',
    }),
    teheccudSonUcte: 'Hora de Tahajjud. Ha comenzado el último tercio de la noche.',
    teheccudKalan: cogul({
      one: 'Hora de Tahajjud. Queda {n} minuto para Fajr.',
      other: 'Hora de Tahajjud. Quedan {n} minutos para Fajr.',
      many: 'Hora de Tahajjud. Quedan {n} de minutos para Fajr.',
    }),
  },
};
