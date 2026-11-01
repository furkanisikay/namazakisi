import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Nafile = "oração voluntária" (IslamHouse pt); adlar Arapça: Duha, Awwabin, Tahajjud. */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajjud' },
  kucuk: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajjud' },
  aciklamalar: {
    kusluk:
      'Começa cerca de 45 minutos depois do nascer do sol e dura até 10 minutos antes do Zuhr. O Ishraq é o seu primeiro momento; o mais meritório é depois de passar o primeiro quarto do dia.',
    evvabin: 'Reza-se depois do Magrib, até à hora do Ishá.',
    teheccud: 'Reza-se depois do Ishá, ao acordar do sono, até à hora do Fajr. O momento mais meritório é o último terço da noite.',
  },
  bilgiBugun: '{aciklama}\n\nHoje: {bas} – {son}',
  enFaziletli: ' · mais meritório depois das {saat}',
  sonUcteBir: ' · último terço {saat}',
  durumAktif: 'Já começou · termina às {saat}',
  durumNafile: 'Voluntária · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Hora do Duha',
    kuslukSuruyor: 'A hora do Duha continua; pode rezar até às {son}.',
    kuslukGirdi: 'Começou a hora do Duha. Um bom momento para dois rakats; dura até às {son}.',
    kuslukBitiyor: cogul({
      one: 'Falta {n} minuto para o fim do Duha. Um bom momento para dois rakats; dura até às {son}.',
      many: 'Faltam {n} de minutos para o fim do Duha. Um bom momento para dois rakats; dura até às {son}.',
      other: 'Faltam {n} minutos para o fim do Duha. Um bom momento para dois rakats; dura até às {son}.',
    }),
    evvabinBaslik: 'Awwabin',
    evvabinSuruyor: 'Ainda há tempo para o Awwabin. O Ishá começa às {son}.',
    evvabinGirdi: 'Depois do Magrib, um bom momento para o Awwabin. O Ishá começa às {son}.',
    evvabinKalan: cogul({ one: 'Falta {n} minuto para o Awwabin. O Ishá começa às {son}.', many: 'Faltam {n} de minutos para o Awwabin. O Ishá começa às {son}.', other: 'Faltam {n} minutos para o Awwabin. O Ishá começa às {son}.' }),
    teheccudBaslik: 'Hora do Tahajjud',
    uyandirSonUcte: 'Levante-se; começou o último terço da noite. O Fajr começa às {son}.',
    uyandirKalan: cogul({ one: 'Levante-se; falta {n} minuto para o Fajr. O Fajr começa às {son}.', many: 'Levante-se; faltam {n} de minutos para o Fajr. O Fajr começa às {son}.', other: 'Levante-se; faltam {n} minutos para o Fajr. O Fajr começa às {son}.' }),
    sonUcteBaslik: 'O último terço da noite',
    sonUcteGovde: 'As horas mais abençoadas para o Tahajjud. O Fajr começa às {son}.',
    teheccudKalan: cogul({ one: 'Falta {n} minuto para o Fajr. Uma boa hora para o Tahajjud.', many: 'Faltam {n} de minutos para o Fajr. Uma boa hora para o Tahajjud.', other: 'Faltam {n} minutos para o Fajr. Uma boa hora para o Tahajjud.' }),
  },
  uyandirmaKanali: 'Despertar para o Tahajjud',
  uyandirmaKanaliAciklama: 'Alarme para a oração da noite; toca mesmo em modo silencioso',
};
