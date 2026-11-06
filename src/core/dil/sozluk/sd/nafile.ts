import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'چاشت', evvabin: 'اوابين', teheccud: 'تهجد' },
  kucuk: { kusluk: 'چاشت', evvabin: 'اوابين', teheccud: 'تهجد' },
  aciklamalar: {
    kusluk:
      'سج اڀرڻ کان لڳ ڀڳ 45 منٽ پوءِ شروع ٿئي ٿو ۽ ظهر کان 10 منٽ اڳ تائين رهي ٿو. اشراق ان جو پهريون وقت آهي؛ افضل وقت ڏينهن جي پهرين چوٿائي گذرڻ کان پوءِ آهي.',
    evvabin: 'مغرب کان پوءِ، عشاء جي وقت تائين پڙهي ويندي آهي.',
    teheccud: 'عشاء کان پوءِ سمهي اٿڻ بعد، فجر جي وقت تائين پڙهي ويندي آهي. ان جو افضل وقت رات جو آخري ٽيون حصو آهي.',
  },
  bilgiBugun: '{aciklama}\n\nاڄ: {bas} – {son}',
  enFaziletli: ' · {saat} کان پوءِ افضل',
  sonUcteBir: ' · آخري ٽيون حصو {saat}',
  durumAktif: 'وقت ٿي ويو · {saat} تي ختم',
  durumNafile: 'نفل · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'چاشت جو وقت',
    kuslukSuruyor: 'چاشت جو وقت جاري آهي؛ {son} تائين پڙهي سگهو ٿا.',
    kuslukGirdi: 'چاشت جو وقت ٿي ويو. ٻن رڪعتن لاءِ سٺو وقت آهي؛ {son} تائين رهندو.',
    kuslukBitiyor: cogul({
      one: 'چاشت جي وقت ۾ {n} منٽ باقي آهي. ٻن رڪعتن لاءِ سٺو وقت آهي؛ {son} تائين رهندو.',
      other: 'چاشت جي وقت ۾ {n} منٽ باقي آهن. ٻن رڪعتن لاءِ سٺو وقت آهي؛ {son} تائين رهندو.',
    }),
    evvabinBaslik: 'اوابين',
    evvabinSuruyor: 'اوابين لاءِ اڃا وقت آهي. عشاء جو وقت {son} تي ٿيندو.',
    evvabinGirdi: 'مغرب کان پوءِ اوابين لاءِ سٺو وقت آهي. عشاء جو وقت {son} تي ٿيندو.',
    evvabinKalan: cogul({ one: 'اوابين لاءِ {n} منٽ باقي آهي. عشاء جو وقت {son} تي ٿيندو.', other: 'اوابين لاءِ {n} منٽ باقي آهن. عشاء جو وقت {son} تي ٿيندو.' }),
    teheccudBaslik: 'تهجد جو وقت',
    uyandirSonUcte: 'اٿو؛ رات جو آخري ٽيون حصو شروع ٿي ويو. فجر جو وقت {son} تي ٿيندو.',
    uyandirKalan: cogul({ one: 'اٿو؛ فجر تائين {n} منٽ باقي آهي. فجر جو وقت {son} تي ٿيندو.', other: 'اٿو؛ فجر تائين {n} منٽ باقي آهن. فجر جو وقت {son} تي ٿيندو.' }),
    sonUcteBaslik: 'رات جو آخري ٽيون حصو',
    sonUcteGovde: 'تهجد لاءِ سڀ کان بابرڪت گهڙيون. فجر جو وقت {son} تي ٿيندو.',
    teheccudKalan: cogul({ one: 'فجر تائين {n} منٽ باقي آهي. تهجد لاءِ سٺو وقت آهي.', other: 'فجر تائين {n} منٽ باقي آهن. تهجد لاءِ سٺو وقت آهي.' }),
  },
  uyandirmaKanali: 'تهجد لاءِ جاڳائڻ',
  uyandirmaKanaliAciklama: 'رات جي نماز لاءِ جاڳائي ٿو؛ خاموش موڊ ۾ به وڄي ٿو',
};
