import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı: Lei + kısa, doğrudan emir ("Compia", "Si alzi per la preghiera");
 * secde karşılığı yok. Sıra Türkçe şablonlarla BİREBİR eşleşir. "{süre} minuti" dakika sayısına
 * göre `dakikaUyumu` ile çekilir ("1 minuto").
 */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'rimasti', girisindenItibaren: 'passati' },
  cip: { vakit: 'Nome della preghiera', sure: 'Minuti', yon: 'rimasti / passati', cuma: 'Jumu’ah', yatsi: 'Isha' },
  sablon: {
    muhafizCikis: [
      'Il tempo di {vakit} sta finendo, mancano {süre} minuti.',
      'Non perda {vakit}, mancano {süre} minuti.',
      'Il tempo stringe, {süre} minuti alla fine di {vakit}.',
    ],
    muhafizGiris: [
      'È iniziato il tempo di {vakit}, sono passati {süre} minuti.',
      'Non rimandi {vakit}, sono passati {süre} minuti.',
      'Il tempo avanza, si alzi per {vakit}, sono già {süre} minuti.',
    ],
    nafile: [
      'Tempo di {vakit}, {süre} minuti {yön}. Un buon momento per due unità di preghiera.',
      'Il tempo di {vakit} è in corso. Una buona occasione per due unità di preghiera.',
      '{süre} minuti {yön} per {vakit}.',
    ],
    cuma: [
      'Mancano {süre} minuti alla preghiera del venerdì. Si prepari e vada in moschea.',
      'La preghiera del venerdì si avvicina, mancano {süre} minuti.',
      'Arrivi in tempo per il sermone, mancano {süre} minuti alla preghiera del venerdì.',
    ],
    camiyeGit: [
      'Mancano {süre} minuti a {vakit}. Si avvii verso la moschea.',
      'È ora di andare in moschea, {süre} minuti a {vakit}.',
      'Si avvii verso la moschea per {vakit}.',
    ],
    yatis: ['Compia l’Isha prima di coricarsi.', 'Il tempo dell’Isha è ancora in corso, si alzi per la preghiera prima di dormire.', 'Non dorma prima di aver compiuto l’Isha.'],
    takvim: [
      'Un evento del suo calendario cade durante il tempo di {vakit}.',
      'Il tempo di {vakit} coincide con un evento; non dimentichi di pregare prima.',
      'Tra {süre} minuti il tempo di {vakit} coincide con il suo evento; non dimentichi la preghiera.',
    ],
  },
  otomatik: {
    cuma: 'Mancano {sure} allo Zuhr per la preghiera del venerdì. Si prepari e vada in moschea.',
    camiyeGiris: 'Mancano {sure} a {vakit}.',
    camiyeHazirlan: 'Si prepari e vada in moschea.',
    camiyeYola: 'Si avvii verso la moschea.',
    takvimGiris: 'Un evento del suo calendario cade durante il tempo di {vakit}.',
    takvimOnce: 'Non dimentichi di pregare prima dell’evento.',
    takvimKaplar: 'Non dimentichi di fare una pausa e pregare.',
    yatsi: 'Compia l’Isha prima di coricarsi.',
    muhasebeTek: 'Oggi {vakit} risulta non segnato.',
    muhasebeCoklu: cogul({ one: 'Oggi {n} preghiera risulta non segnata.', many: 'Oggi {n} di preghiere risultano non segnate.', other: 'Oggi {n} preghiere risultano non segnate.' }),
    geceCapasi: 'Le ore di silenzio iniziano tra {süre} minuti. Compia {vakit} prima di coricarsi.',
    kuslukSuruyor: 'Il tempo del Duha è in corso.',
    kuslukGirdi: 'È iniziato il tempo del Duha. Un buon momento per due unità di preghiera.',
    kuslukBitiyor: cogul({ one: 'Manca {n} minuto alla fine del Duha.', many: 'Mancano {n} di minuti alla fine del Duha.', other: 'Mancano {n} minuti alla fine del Duha.' }),
    evvabinSuruyor: 'C’è ancora tempo per l’Awwabin.',
    evvabinGirdi: 'Tempo dell’Awwabin. Un buon momento per due unità di preghiera.',
    evvabinKalan: cogul({ one: 'Manca {n} minuto per l’Awwabin.', many: 'Mancano {n} di minuti per l’Awwabin.', other: 'Mancano {n} minuti per l’Awwabin.' }),
    teheccudSonUcte: 'Tempo del Tahajjud. È iniziato l’ultimo terzo della notte.',
    teheccudKalan: cogul({ one: 'Tempo del Tahajjud. Manca {n} minuto al Fajr.', many: 'Tempo del Tahajjud. Mancano {n} di minuti al Fajr.', other: 'Tempo del Tahajjud. Mancano {n} minuti al Fajr.' }),
  },
};
