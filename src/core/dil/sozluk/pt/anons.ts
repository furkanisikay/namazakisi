import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Sesli okuma (TTS): kişisiz 3. tekil kibar emir, kısa; secde yok, kısaltma yok ("minutos").
 * Ad önünde artikel yok ("a hora de {vakit}"). Sıra Türkçe şablonlarla BİREBİR eşleşir.
 */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'restantes', girisindenItibaren: 'passados' },
  cip: { vakit: 'Nome da oração', sure: 'Minutos', yon: 'restantes / passados', cuma: 'Jumu’ah', yatsi: 'Ishá' },
  sablon: {
    muhafizCikis: [
      'A hora de {vakit} está a terminar, faltam {süre} minutos.',
      'Não perca a oração de {vakit}, faltam {süre} minutos.',
      'O tempo está a acabar, faltam {süre} minutos para o fim de {vakit}.',
    ],
    muhafizGiris: [
      'Começou a hora de {vakit}, passaram {süre} minutos.',
      'Não adie a oração de {vakit}, passaram {süre} minutos.',
      'O tempo avança, cumpra a oração de {vakit}, já passaram {süre} minutos.',
    ],
    nafile: [
      'Hora de {vakit}, {süre} minutos {yön}. Um bom momento para dois rakats.',
      'A hora de {vakit} continua. Uma boa oportunidade para rezar dois rakats.',
      '{süre} minutos {yön} para {vakit}.',
    ],
    cuma: [
      'Faltam {süre} minutos para o Jumu’ah. Prepare-se e vá para a mesquita.',
      'O Jumu’ah está a aproximar-se, faltam {süre} minutos.',
      'Chegue a tempo do sermão, faltam {süre} minutos para o Jumu’ah.',
    ],
    camiyeGit: [
      'Faltam {süre} minutos para {vakit}. Vá para a mesquita.',
      'É hora de ir para a mesquita, faltam {süre} minutos para {vakit}.',
      'Vá para a mesquita para a oração de {vakit}.',
    ],
    yatis: ['Reze o Ishá antes de se deitar.', 'A hora do Ishá continua, cumpra a oração antes de dormir.', 'Não durma sem rezar o Ishá.'],
    takvim: [
      'Um evento do seu calendário coincide com a hora de {vakit}.',
      'A hora de {vakit} coincide com um evento; não se esqueça de rezar primeiro.',
      'Dentro de {süre} minutos, a hora de {vakit} coincide com o seu evento; não se esqueça da oração.',
    ],
  },
  otomatik: {
    cuma: 'Faltam {sure} para o Zuhr do Jumu’ah. Prepare-se e vá para a mesquita.',
    camiyeGiris: 'Faltam {sure} para {vakit}.',
    camiyeHazirlan: 'Prepare-se e vá para a mesquita.',
    camiyeYola: 'Vá para a mesquita.',
    takvimGiris: 'Um evento do seu calendário coincide com a hora de {vakit}.',
    takvimOnce: 'Não se esqueça de rezar antes do evento.',
    takvimKaplar: 'Não se esqueça de fazer uma pausa para rezar.',
    yatsi: 'Reze o Ishá antes de se deitar.',
    muhasebeTek: 'Hoje, {vakit} parece não estar marcado.',
    muhasebeCoklu: cogul({ one: 'Hoje, {n} oração parece não estar marcada.', many: 'Hoje, {n} de orações parecem não estar marcadas.', other: 'Hoje, {n} orações parecem não estar marcadas.' }),
    geceCapasi: 'O período de silêncio começa dentro de {süre} minutos. Reze a oração de {vakit} antes de se deitar.',
    kuslukSuruyor: 'A hora do Duha continua.',
    kuslukGirdi: 'Começou a hora do Duha. Um bom momento para dois rakats.',
    kuslukBitiyor: cogul({ one: 'Falta {n} minuto para o fim do Duha.', many: 'Faltam {n} de minutos para o fim do Duha.', other: 'Faltam {n} minutos para o fim do Duha.' }),
    evvabinSuruyor: 'Ainda há tempo para o Awwabin.',
    evvabinGirdi: 'Hora do Awwabin. Um bom momento para dois rakats.',
    evvabinKalan: cogul({ one: 'Falta {n} minuto para o Awwabin.', many: 'Faltam {n} de minutos para o Awwabin.', other: 'Faltam {n} minutos para o Awwabin.' }),
    teheccudSonUcte: 'Hora do Tahajjud. Começou o último terço da noite.',
    teheccudKalan: cogul({ one: 'Hora do Tahajjud. Falta {n} minuto para o Fajr.', many: 'Hora do Tahajjud. Faltam {n} de minutos para o Fajr.', other: 'Hora do Tahajjud. Faltam {n} minutos para o Fajr.' }),
  },
};
