import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı İtalyancada: Lei + kısa, doğrudan emir ("Compia", "Si alzi per la
 * preghiera"); secde karşılığı YAZILMAZ, kişi namaza durur. Başlıkta süre "{dk} min" (sayı ile
 * birim arasında boşluk): "Maghrib · 15 min" ilk 16 karaktere sığar.
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: '{ad} · da {dk} min · è l’ora della preghiera ⏰',
    giris2: '{ad} · da {dk} min · non rimandi la preghiera ⚠️',
    giris3: '{ad} · da {dk} min · la preghiera la attende 🔥',
    giris4: '{ad} · da {dk} min · SI ALZI PER LA PREGHIERA 🚨',
    erken3: '{ad} · {dk} min rimasti · la preghiera la attende 🔥',
    erken4: '{ad} · {dk} min rimasti · SI ALZI PER LA PREGHIERA 🚨',
    cikis1: '{ad} · {dk} min rimasti ⏰',
    cikis2: '{ad} · {dk} min · il tempo stringe ⚠️',
    cikis3: '{ad} · {dk} min · il tempo sfugge 🔥',
    cikis4: '{ad} · {dk} min · IL TEMPO STA FINENDO 🚨',
  },
  girisHavuzu: {
    s1: ['È l’ora della preghiera; preghi finché ne ha l’occasione.', 'Preghi finché il tempo è dalla sua parte; non la lasci per dopo.'],
    s2: ['Più la rimanda, più diventa pesante; non lasci la preghiera alla fine.', 'Il tempo avanza — preghi adesso.'],
    s3: [
      'Più ritarda, più si avvicina a perderla; preghi adesso.',
      'Non dica «pregherò dopo»; può pregare adesso.',
      'Si alzi adesso, invece di dire «se solo» tra qualche minuto.',
    ],
    s4: ['Non rimandi oltre la preghiera — si alzi subito per la preghiera.', 'Lasci quello che sta facendo e si alzi per la preghiera.'],
  },
  govde: {
    s1: 'Il tempo inizia a stringere; preghi finché ne ha l’occasione.',
    s2: 'Non lasci la preghiera alla fine; ora è un buon momento per pregare.',
    s3: 'Il tempo sta per finire; può ancora pregare adesso.',
    s4: 'Se ha pregato, tocchi «Ho pregato»; altrimenti si alzi subito per la preghiera.',
  },
  serit: {
    giris4: 'NON RIMANDI LA PREGHIERA. Si alzi subito per la preghiera. (passati {dk} min)',
    giris2: 'Il tempo avanza; non lasci la preghiera alla fine. (passati {dk} min)',
    giris1: cogul({ one: 'È passato {n} minuto dall’inizio dell’orario di preghiera.', many: 'Sono passati {n} di minuti dall’inizio dell’orario di preghiera.', other: 'Sono passati {n} minuti dall’inizio dell’orario di preghiera.' }),
    erken4: 'Non rimandi la preghiera; si alzi subito per la preghiera. (mancano {dk} min)',
    cikis4: 'IL TEMPO STA FINENDO. Si alzi subito per la preghiera. (mancano {dk} min)',
    cikis2: 'Il tempo stringe; non lasci la preghiera alla fine. (mancano {dk} min)',
    cikis1: cogul({ one: 'Manca {n} minuto alla fine dell’orario di preghiera.', many: 'Mancano {n} di minuti alla fine dell’orario di preghiera.', other: 'Mancano {n} minuti alla fine dell’orario di preghiera.' }),
  },
  geceCapasi: {
    baslik: '{ad} · preghi prima di dormire ⏰',
    govde: 'Le ore di silenzio iniziano tra {dk} min; compia l’Isha prima di coricarsi.',
  },
  icerik: {
    firsat: 'Il tempo inizia a stringere; preghi finché ne ha l’occasione.',
    sonaBirakma: 'Non lasci la preghiera alla fine; ora è un buon momento per pregare.',
    fisilti: 'Non dica «pregherò dopo»; il tempo sta per finire, può pregare adesso.',
    omur: 'Il tempo passa; ha ancora l’occasione di compiere questa preghiera in tempo.',
    keske: 'Si alzi adesso, invece di dire «se solo» tra qualche minuto.',
    namazaDur: 'Se ha pregato, tocchi «Ho pregato»; altrimenti si alzi subito per la preghiera.',
    sonDakika: 'Gli ultimi minuti. Lasci quello che sta facendo e si alzi per la preghiera.',
  },
};
