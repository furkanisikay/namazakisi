import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Nafile = نافله. Bildirim ibadete çağrıdır ("تو"); açıklamalar "شما". */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'ضحی', evvabin: 'اوابین', teheccud: 'تهجد' },
  kucuk: { kusluk: 'ضحی', evvabin: 'اوابین', teheccud: 'تهجد' },
  aciklamalar: {
    kusluk:
      'حدود 45 دقیقه پس از طلوع آفتاب آغاز می‌شود و تا 10 دقیقه پیش از وقت ظهر ادامه دارد. اشراق نخستین وقت آن است؛ بافضیلت‌ترین وقتش پس از گذشتن یک‌چهارم نخست روز است.',
    evvabin: 'پس از نماز مغرب، تا وقت عشا خوانده می‌شود.',
    teheccud: 'پس از عشا، با خوابیدن و برخاستن، تا وقت صبح خوانده می‌شود. بافضیلت‌ترین وقتش یک‌سوم پایانی شب است.',
  },
  bilgiBugun: '{aciklama}\n\nامروز: {bas} – {son}',
  enFaziletli: ' · بافضیلت‌ترین پس از {saat}',
  sonUcteBir: ' · یک‌سوم پایانی {saat}',
  durumAktif: 'وقتش رسید · پایان {saat}',
  durumNafile: 'نافله · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'وقت ضحی',
    kuslukSuruyor: 'وقت ضحی ادامه دارد؛ تا ساعت {son} می‌توانی بخوانی.',
    kuslukGirdi: 'وقت ضحی رسید. لحظهٔ خوبی برای دو رکعت؛ وقت تا ساعت {son} ادامه دارد.',
    kuslukBitiyor: cogul({
      one: '{n} دقیقه تا پایان وقت ضحی مانده. لحظهٔ خوبی برای دو رکعت؛ وقت تا ساعت {son} ادامه دارد.',
      other: '{n} دقیقه تا پایان وقت ضحی مانده. لحظهٔ خوبی برای دو رکعت؛ وقت تا ساعت {son} ادامه دارد.',
    }),
    evvabinBaslik: 'اوابین',
    evvabinSuruyor: 'هنوز برای اوابین وقت هست. وقت عشا {son}.',
    evvabinGirdi: 'پس از نماز مغرب، لحظهٔ خوبی برای اوابین. وقت عشا {son}.',
    evvabinKalan: cogul({ one: '{n} دقیقه برای اوابین مانده. وقت عشا {son}.', other: '{n} دقیقه برای اوابین مانده. وقت عشا {son}.' }),
    teheccudBaslik: 'وقت تهجد',
    uyandirSonUcte: 'برخیز؛ یک‌سوم پایانی شب آغاز شد. وقت صبح {son}.',
    uyandirKalan: cogul({ one: 'برخیز؛ {n} دقیقه تا صبح مانده. وقت صبح {son}.', other: 'برخیز؛ {n} دقیقه تا صبح مانده. وقت صبح {son}.' }),
    sonUcteBaslik: 'یک‌سوم پایانی شب',
    sonUcteGovde: 'پربرکت‌ترین ساعت‌ها برای تهجد. وقت صبح {son}.',
    teheccudKalan: cogul({ one: '{n} دقیقه تا صبح مانده. وقت خوبی برای تهجد.', other: '{n} دقیقه تا صبح مانده. وقت خوبی برای تهجد.' }),
  },
  uyandirmaKanali: 'بیدارباش تهجد',
  uyandirmaKanaliAciklama: 'برای نماز شب بیدار می‌کند؛ در حالت بی‌صدا هم به صدا درمی‌آید',
};
