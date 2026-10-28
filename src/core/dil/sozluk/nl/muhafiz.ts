import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı Felemenkçede: zamirsiz kısa emir ("Bid nu", "Sta op voor het gebed"),
 * iyelikte "uw"; "alstublieft" yok. "Neerknielen/prosterneren" YAZILMAZ (Türkçedeki "secdeye
 * kapan" yasağının ikizi) → "sta op voor het gebed". Başlıkta süre birimi "min":
 * "Maghrib · 65 min" ilk 16 karaktere sığar.
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: '{ad} · {dk} min bezig · gebedstijd ⏰',
    giris2: '{ad} · {dk} min bezig · stel uw gebed niet uit ⚠️',
    giris3: '{ad} · {dk} min bezig · uw gebed wacht 🔥',
    giris4: '{ad} · {dk} min bezig · STA OP VOOR HET GEBED 🚨',
    erken3: '{ad} · nog {dk} min · uw gebed wacht 🔥',
    erken4: '{ad} · nog {dk} min · STA OP VOOR HET GEBED 🚨',
    cikis1: '{ad} · nog {dk} min ⏰',
    cikis2: '{ad} · {dk} min · de tijd wordt krap ⚠️',
    cikis3: '{ad} · {dk} min · de tijd glipt weg 🔥',
    cikis4: '{ad} · {dk} min · DE TIJD LOOPT AF 🚨',
  },
  girisHavuzu: {
    s1: ['De gebedstijd is begonnen; bid nu u de kans hebt.', 'Bid nu de tijd aan uw kant staat; schuif het niet op.'],
    s2: ['Hoe langer u het uitstelt, hoe zwaarder het wordt; laat uw gebed niet tot het laatst.', 'De tijd verstrijkt — bid nu.'],
    s3: [
      'Hoe langer u uitstelt, hoe dichter u bij het missen komt; bid meteen.',
      'Zeg niet "ik bid straks"; u kunt nu bidden.',
      'Sta nu op, in plaats van over een paar minuten "had ik maar" te zeggen.',
    ],
    s4: ['Stel uw gebed niet langer uit — sta nu op voor het gebed.', 'Leg neer waar u mee bezig bent en sta op voor het gebed.'],
  },
  govde: {
    s1: 'De tijd begint krap te worden; bid nu u de kans hebt.',
    s2: 'Laat uw gebed niet tot het laatst; dit is een goed moment om te bidden.',
    s3: 'De tijd is bijna om; u kunt nu nog bidden.',
    s4: 'Hebt u gebeden, tik dan op "Gebeden"; zo niet, sta nu op voor het gebed.',
  },
  serit: {
    giris4: 'STEL UW GEBED NIET UIT! Sta nu op voor het gebed! ({dk} min voorbij)',
    giris2: 'De tijd verstrijkt; laat uw gebed niet tot het laatst. ({dk} min voorbij)',
    giris1: cogul({ one: 'De gebedstijd is {n} minuut geleden begonnen.', other: 'De gebedstijd is {n} minuten geleden begonnen.' }),
    erken4: 'Stel uw gebed niet uit; sta nu op voor het gebed! (nog {dk} min)',
    cikis4: 'DE TIJD LOOPT AF! Sta nu op voor het gebed! (nog {dk} min)',
    cikis2: 'De tijd wordt krap; laat uw gebed niet tot het laatst. (nog {dk} min)',
    cikis1: cogul({ one: 'Nog {n} minuut tot de gebedstijd eindigt.', other: 'Nog {n} minuten tot de gebedstijd eindigt.' }),
  },
  geceCapasi: {
    baslik: '{ad} · bid voor u gaat slapen ⏰',
    govde: 'De nachtrust begint over {dk} min; bid Isha voordat u naar bed gaat.',
  },
  icerik: {
    firsat: 'De tijd begint krap te worden; bid nu u de kans hebt.',
    sonaBirakma: 'Laat uw gebed niet tot het laatst; dit is een goed moment om te bidden.',
    fisilti: 'Zeg niet "ik bid straks"; de tijd is bijna om, u kunt nu bidden.',
    omur: 'De tijd verstrijkt; u hebt nog de kans om dit gebed op tijd te verrichten.',
    keske: 'Sta nu op, in plaats van over een paar minuten "had ik maar" te zeggen.',
    namazaDur: 'Hebt u gebeden, tik dan op "Gebeden"; zo niet, sta nu op voor het gebed.',
    sonDakika: 'De laatste minuten. Leg neer waar u mee bezig bent en sta op voor het gebed.',
  },
};
