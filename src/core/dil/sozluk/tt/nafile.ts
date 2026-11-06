import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Нәфел намазлар (dumrt "Нәфел – өстәмә намазлар"): Духа (kuşluk), Әүвәбин, Тәһәҗҗүд (dumrt
 * "Тәһәҗҗүд намазы"). Bildirim ibadete çağrıdır ("син"); açıklamalar küçük "сез". Духа ve Әүвәбин
 * yazımı kurum kaynağında DOĞRULANMADI.
 */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Духа', evvabin: 'Әүвәбин', teheccud: 'Тәһәҗҗүд' },
  kucuk: { kusluk: 'духа', evvabin: 'әүвәбин', teheccud: 'тәһәҗҗүд' },
  aciklamalar: {
    kusluk:
      'Кояш чыкканнан якынча 45 минуттан соң башлана һәм өйлә вакытына 10 минут калганчы дәвам итә. Ишрак — духаның беренче вакыты; иң фазыйләтлесе көннең беренче дүрттән бере узгач.',
    evvabin: 'Ахшам намазыннан соң, ястү вакытына кадәр укыла.',
    teheccud: 'Ястүдән соң йоклап торгач, иртәнге вакытка кадәр укыла. Иң фазыйләтле вакыты — төннең соңгы өчтән бере.',
  },
  bilgiBugun: '{aciklama}\n\nБүген: {bas} – {son}',
  enFaziletli: ' · иң фазыйләтле вакыт башы {saat}',
  sonUcteBir: ' · соңгы өчтән бер {saat}',
  durumAktif: 'Вакыты керде · бетүе {saat}',
  durumNafile: 'Нәфел · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Духа вакыты',
    kuslukSuruyor: 'Духа вакыты дәвам итә; укый аласың, бетүе — {son}.',
    kuslukGirdi: 'Духа вакыты керде. Ике рәкәгать өчен яхшы мизгел; бетүе — {son}.',
    kuslukBitiyor: cogul({
      one: 'Духа вакыты беткәнгә {n} минут бар. Ике рәкәгать өчен яхшы мизгел; бетүе — {son}.',
      other: 'Духа вакыты беткәнгә {n} минут бар. Ике рәкәгать өчен яхшы мизгел; бетүе — {son}.',
    }),
    evvabinBaslik: 'Әүвәбин',
    evvabinSuruyor: 'Әүвәбин өчен вакыт дәвам итә. Ястү вакыты {son}.',
    evvabinGirdi: 'Ахшам намазыннан соң әүвәбин өчен яхшы мизгел. Ястү вакыты {son}.',
    evvabinKalan: cogul({ one: 'Әүвәбингә {n} минут бар. Ястү вакыты {son}.', other: 'Әүвәбингә {n} минут бар. Ястү вакыты {son}.' }),
    teheccudBaslik: 'Тәһәҗҗүд вакыты',
    uyandirSonUcte: 'Тор; төннең соңгы өчтән бере керде. Иртәнге вакыт {son}.',
    uyandirKalan: cogul({ one: 'Тор; иртәнгегә {n} минут калды. Иртәнге вакыт {son}.', other: 'Тор; иртәнгегә {n} минут калды. Иртәнге вакыт {son}.' }),
    sonUcteBaslik: 'Төннең соңгы өчтән бере',
    sonUcteGovde: 'Тәһәҗҗүд өчен иң бәрәкәтле сәгатьләр. Иртәнге вакыт {son}.',
    teheccudKalan: cogul({ one: 'Иртәнгегә {n} минут калды. Тәһәҗҗүд өчен яхшы вакыт.', other: 'Иртәнгегә {n} минут калды. Тәһәҗҗүд өчен яхшы вакыт.' }),
  },
  uyandirmaKanali: 'Тәһәҗҗүдкә уяту',
  uyandirmaKanaliAciklama: 'Төнге намазга уята; тавышсыз режимда да шалтырый',
};
