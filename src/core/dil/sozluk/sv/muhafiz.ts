import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı İsveççede: "du" (zamirsiz emir tercih), kısa, doğrudan; "snälla/vänligen"
 * ve "!" yok. Secde karşılığı ("fall ner", "buga") YAZILMAZ → "Förrätta bönen" (17:78 meali) /
 * "be nu". Başlıkta süre birimi SI "min": "Maghrib · 65 min" ilk 16 karaktere sığar.
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: '{ad} · {dk} min sedan start · det är bönetid ⏰',
    giris2: '{ad} · {dk} min sedan start · skjut inte upp bönen ⚠️',
    giris3: '{ad} · {dk} min sedan start · bönen väntar 🔥',
    giris4: '{ad} · {dk} min sedan start · FÖRRÄTTA BÖNEN 🚨',
    erken3: '{ad} · {dk} min kvar · bönen väntar 🔥',
    erken4: '{ad} · {dk} min kvar · FÖRRÄTTA BÖNEN 🚨',
    cikis1: '{ad} · {dk} min kvar ⏰',
    cikis2: '{ad} · {dk} min · tiden börjar ta slut ⚠️',
    cikis3: '{ad} · {dk} min · tiden rinner iväg 🔥',
    cikis4: '{ad} · {dk} min · TIDEN TAR SLUT 🚨',
  },
  girisHavuzu: {
    s1: ['Det är bönetid; be medan du har möjlighet.', 'Be medan tiden är på din sida; lämna det inte till senare.'],
    s2: ['Ju längre du skjuter upp den, desto tyngre blir den; lämna inte bönen till sista stund.', 'Tiden går – be nu.'],
    s3: [
      'Ju längre du dröjer, desto närmare är du att missa den; be nu.',
      'Säg inte ”jag ber senare”; du kan be nu.',
      'Res dig nu hellre än att säga ”om bara” om några minuter.',
    ],
    s4: ['Skjut inte upp bönen längre – förrätta bönen nu.', 'Lägg ifrån dig det du gör och förrätta bönen.'],
  },
  govde: {
    s1: 'Tiden börjar ta slut; be medan du har möjlighet.',
    s2: 'Lämna inte bönen till sista stund; nu är en bra tid att be.',
    s3: 'Tiden är nästan slut; du kan fortfarande be nu.',
    s4: 'Har du bett, tryck på ”Jag har bett”; annars förrätta bönen nu.',
  },
  serit: {
    giris4: 'SKJUT INTE UPP BÖNEN. Förrätta bönen nu. ({dk} min har gått)',
    giris2: 'Tiden går; lämna inte bönen till sista stund. ({dk} min har gått)',
    giris1: cogul({ one: 'Det har gått {n} minut sedan bönetiden började.', other: 'Det har gått {n} minuter sedan bönetiden började.' }),
    erken4: 'Skjut inte upp bönen; förrätta bönen nu. ({dk} min kvar)',
    cikis4: 'TIDEN TAR SLUT. Förrätta bönen nu. ({dk} min kvar)',
    cikis2: 'Tiden börjar ta slut; lämna inte bönen till sista stund. ({dk} min kvar)',
    cikis1: cogul({ one: '{n} minut kvar tills bönetiden slutar.', other: '{n} minuter kvar tills bönetiden slutar.' }),
  },
  geceCapasi: {
    baslik: '{ad} · be innan du sover ⏰',
    govde: 'Den tysta perioden börjar om {dk} min; be Isha innan du går och lägger dig.',
  },
  icerik: {
    firsat: 'Tiden börjar ta slut; be medan du har möjlighet.',
    sonaBirakma: 'Lämna inte bönen till sista stund; nu är en bra tid att be.',
    fisilti: 'Säg inte ”jag ber senare”; tiden är nästan slut, du kan be nu.',
    omur: 'Tiden går; du har fortfarande möjlighet att be den här bönen i tid.',
    keske: 'Res dig nu hellre än att säga ”om bara” om några minuter.',
    namazaDur: 'Har du bett, tryck på ”Jag har bett”; annars förrätta bönen nu.',
    sonDakika: 'De sista minuterna. Lägg ifrån dig det du gör och förrätta bönen.',
  },
};
