import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Nafile adları harf çevirisi (Duha · Еввабин · Техеджуд); Bulgarca kaynakta ad DOĞRULANMADI, "нафиле" HadeethEnc 65003. */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Духа', evvabin: 'Еввабин', teheccud: 'Техеджуд' },
  kucuk: { kusluk: 'Духа', evvabin: 'Еввабин', teheccud: 'Техеджуд' },
  aciklamalar: {
    kusluk:
      'Започва около 45 минути след изгрев и продължава до 10 минути преди Обяд. Ишрак е най-ранното му време; най-достойното е след като изтече първата четвърт от деня.',
    evvabin: 'Изпълнява се след Залез, до времето за Нощ.',
    teheccud: 'Изпълнява се след Нощ, като човек заспи и се събуди, до времето за Зора. Най-достойното му време е последната третина на нощта.',
  },
  bilgiBugun: '{aciklama}\n\nДнес: {bas} – {son}',
  enFaziletli: ' · най-достойно след {saat}',
  sonUcteBir: ' · последна третина {saat}',
  durumAktif: 'Времето настъпи · до {saat}',
  durumNafile: 'Нафиле · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Време за Духа',
    kuslukSuruyor: 'Времето за Духа тече; можете да го изпълните до {son}.',
    kuslukGirdi: 'Настъпи времето за Духа. Подходящ момент за два рекята; продължава до {son}.',
    kuslukBitiyor: cogul({
      one: 'От времето за Духа остава {n} минута. Подходящ момент за два рекята; продължава до {son}.',
      other: 'От времето за Духа остават {n} минути. Подходящ момент за два рекята; продължава до {son}.',
    }),
    evvabinBaslik: 'Еввабин',
    evvabinSuruyor: 'Все още има време за Еввабин. Нощ започва в {son}.',
    evvabinGirdi: 'След Залез е подходящ момент за Еввабин. Нощ започва в {son}.',
    evvabinKalan: cogul({ one: 'За Еввабин остава {n} минута. Нощ започва в {son}.', other: 'За Еввабин остават {n} минути. Нощ започва в {son}.' }),
    teheccudBaslik: 'Време за Техеджуд',
    uyandirSonUcte: 'Станете; започна последната третина на нощта. Зора започва в {son}.',
    uyandirKalan: cogul({ one: 'Станете; до Зора остава {n} минута. Зора започва в {son}.', other: 'Станете; до Зора остават {n} минути. Зора започва в {son}.' }),
    sonUcteBaslik: 'Последната третина на нощта',
    sonUcteGovde: 'Най-благословените часове за Техеджуд. Зора започва в {son}.',
    teheccudKalan: cogul({ one: 'До Зора остава {n} минута. Подходящо време за Техеджуд.', other: 'До Зора остават {n} минути. Подходящо време за Техеджуд.' }),
  },
  uyandirmaKanali: 'Събуждане за Техеджуд',
  uyandirmaKanaliAciklama: 'Събужда ви за нощния намаз; звъни и в тих режим',
};
