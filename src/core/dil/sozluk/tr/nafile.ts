import { cogul } from '../../tipler';

/** Nafile vakitleri (issue #77/#273). Bildirim ibadete çağrıdır ("sen"); açıklamalar "siz". */
export const nafile = {
  adlar: { kusluk: 'Kuşluk', evvabin: 'Evvâbîn', teheccud: 'Teheccüd' },
  kucuk: { kusluk: 'kuşluk', evvabin: 'evvâbîn', teheccud: 'teheccüd' },
  aciklamalar: {
    kusluk:
      'Güneş doğduktan yaklaşık 45 dakika sonra başlar, öğle vaktine 10 dakika kalana kadar sürer. İşrak, kuşluğun ilk vaktidir; en faziletlisi gündüzün ilk dörtte biri geçtikten sonradır.',
    evvabin: 'Akşam namazından sonra, yatsı vaktine kadar kılınır.',
    teheccud: 'Yatsıdan sonra uyuyup kalktıktan sonra, imsaka kadar kılınır. En faziletli zamanı gecenin son üçte biridir.',
  },
  bilgiBugun: '{aciklama}\n\nBugün: {bas} – {son}',
  enFaziletli: ' · en faziletli {saat} sonrası',
  sonUcteBir: ' · son üçte bir {saat}',
  durumAktif: 'Vakti girdi · bitiş {saat}',
  durumNafile: 'Nafile · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Kuşluk vakti',
    kuslukSuruyor: 'Kuşluk vakti sürüyor; {son} saatine kadar kılabilirsin.',
    kuslukGirdi: 'Kuşluk vakti girdi. İki rekât için güzel bir an; vakit {son} saatine kadar sürer.',
    kuslukBitiyor: cogul({
      one: 'Kuşluk vaktinin bitmesine {n} dakika var. İki rekât için güzel bir an; vakit {son} saatine kadar sürer.',
      other: 'Kuşluk vaktinin bitmesine {n} dakika var. İki rekât için güzel bir an; vakit {son} saatine kadar sürer.',
    }),
    evvabinBaslik: 'Evvâbîn',
    evvabinSuruyor: 'Evvâbîn için vakit sürüyor. Yatsı vakti {son}.',
    evvabinGirdi: 'Akşam namazından sonra evvâbîn için güzel bir an. Yatsı vakti {son}.',
    evvabinKalan: cogul({ one: 'Evvâbîn için {n} dakika var. Yatsı vakti {son}.', other: 'Evvâbîn için {n} dakika var. Yatsı vakti {son}.' }),
    teheccudBaslik: 'Teheccüd vakti',
    uyandirSonUcte: 'Kalk; gecenin son üçte biri girdi. İmsak vakti {son}.',
    uyandirKalan: cogul({ one: 'Kalk; imsaka {n} dakika kaldı. İmsak vakti {son}.', other: 'Kalk; imsaka {n} dakika kaldı. İmsak vakti {son}.' }),
    sonUcteBaslik: 'Gecenin son üçte biri',
    sonUcteGovde: 'Teheccüd için en bereketli saatler. İmsak vakti {son}.',
    teheccudKalan: cogul({ one: 'İmsaka {n} dakika kaldı. Teheccüd için güzel bir vakit.', other: 'İmsaka {n} dakika kaldı. Teheccüd için güzel bir vakit.' }),
  },
  uyandirmaKanali: 'Teheccüd Uyandırması',
  uyandirmaKanaliAciklama: 'Gece namazı için uyandırır; sessiz modda da çalar',
} as const;
