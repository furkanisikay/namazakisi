import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajjud' },
  kucuk: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajjud' },
  aciklamalar: {
    kusluk:
      'Begint ongeveer 45 minuten na zonsopkomst en duurt tot 10 minuten voor Dhuhr. Ishraq is de vroegste tijd ervan; het meest verdienstelijk is het nadat het eerste kwart van de dag voorbij is.',
    evvabin: 'Wordt na Maghrib gebeden, tot de tijd van Isha.',
    teheccud: 'Wordt na Isha gebeden, na slapen en weer opstaan, tot de tijd van Fajr. De meest verdienstelijke tijd is het laatste derde van de nacht.',
  },
  bilgiBugun: '{aciklama}\n\nVandaag: {bas} – {son}',
  enFaziletli: ' · meest verdienstelijk na {saat}',
  sonUcteBir: ' · laatste derde {saat}',
  durumAktif: 'Tijd is begonnen · eindigt {saat}',
  durumNafile: 'Vrijwillig · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Duha-tijd',
    kuslukSuruyor: 'Het is Duha-tijd; u kunt bidden tot {son}.',
    kuslukGirdi: "De Duha-tijd is begonnen. Een goed moment voor twee rak'a; de tijd duurt tot {son}.",
    kuslukBitiyor: cogul({
      one: "Nog {n} minuut tot het einde van de Duha-tijd. Een goed moment voor twee rak'a; de tijd duurt tot {son}.",
      other: "Nog {n} minuten tot het einde van de Duha-tijd. Een goed moment voor twee rak'a; de tijd duurt tot {son}.",
    }),
    evvabinBaslik: 'Awwabin',
    evvabinSuruyor: 'Er is nog tijd voor Awwabin. Isha begint om {son}.',
    evvabinGirdi: 'Na Maghrib een goed moment voor Awwabin. Isha begint om {son}.',
    evvabinKalan: cogul({ one: 'Nog {n} minuut voor Awwabin. Isha begint om {son}.', other: 'Nog {n} minuten voor Awwabin. Isha begint om {son}.' }),
    teheccudBaslik: 'Tahajjud-tijd',
    uyandirSonUcte: 'Sta op; het laatste derde van de nacht is begonnen. Fajr begint om {son}.',
    uyandirKalan: cogul({ one: 'Sta op; nog {n} minuut tot Fajr. Fajr begint om {son}.', other: 'Sta op; nog {n} minuten tot Fajr. Fajr begint om {son}.' }),
    sonUcteBaslik: 'Het laatste derde van de nacht',
    sonUcteGovde: 'De meest gezegende uren voor Tahajjud. Fajr begint om {son}.',
    teheccudKalan: cogul({ one: 'Nog {n} minuut tot Fajr. Een goede tijd voor Tahajjud.', other: 'Nog {n} minuten tot Fajr. Een goede tijd voor Tahajjud.' }),
  },
  uyandirmaKanali: 'Wekker voor Tahajjud',
  uyandirmaKanaliAciklama: 'Wekt u voor het nachtgebed; gaat ook af in de stille modus',
};
