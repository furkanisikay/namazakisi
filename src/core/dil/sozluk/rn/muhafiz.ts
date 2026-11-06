import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı Kirundide mealin 2. çoğul emriyle (2:43 "mutsimbataze amasengesho"): kısa, doğrudan,
 * "!" yok. "Secdeye kapan" karşılığı YAZILMAZ → "muhagarare musenge" (namaza durun). Başlıkta süre
 * "{dk} min"; "haciye" (geçti) / "hasigaye" (kaldı).
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: '{ad} · haciye {dk} min · igihe c’isengesho ⏰',
    giris2: '{ad} · haciye {dk} min · ntimutebaganye isengesho ⚠️',
    giris3: '{ad} · haciye {dk} min · isengesho ribarindiriye 🔥',
    giris4: '{ad} · haciye {dk} min · MUHAGARARE MUSENGE 🚨',
    erken3: '{ad} · hasigaye {dk} min · isengesho ribarindiriye 🔥',
    erken4: '{ad} · hasigaye {dk} min · MUHAGARARE MUSENGE 🚨',
    cikis1: '{ad} · hasigaye {dk} min ⏰',
    cikis2: '{ad} · {dk} min · igihe kiriko kiragabanuka ⚠️',
    cikis3: '{ad} · {dk} min · igihe kiriko kiracika 🔥',
    cikis4: '{ad} · {dk} min · IGIHE KIRARANGIRA 🚨',
  },
  girisHavuzu: {
    s1: ['Igihe c’isengesho cageze; musenge mukiri mu mwanya.', 'Musenge igihe kikiri kibakundira; ntimubisigaze inyuma.'],
    s2: ['Uko mubitebaganya, ni ko birushiriza kuremera; ntimusigaze isengesho ryanyu ku mpera.', 'Igihe kiriko kiragenda — musenge ubu.'],
    s3: [
      'Uko mutebaganya, ni ko murushiriza kwegera kuricikanwa; musenge ubu.',
      'Ntimuvuge ngo ”Nzosenga hanyuma”; murashobora gusenga ubu.',
      'Muvyuke ubu aho kuvuga ngo ”Iyo mba narasenze” haciye iminota mike.',
    ],
    s4: ['Ntimwongere gutebaganya isengesho — muhagarare musenge ubu.', 'Mushire hasi ivyo muriko murakora, muhagarare musenge.'],
  },
  govde: {
    s1: 'Igihe gitanguye kugabanuka; musenge mukiri mu mwanya.',
    s2: 'Ntimusigaze isengesho ryanyu ku mpera; ubu ni igihe ciza co gusenga.',
    s3: 'Igihe kiri hafi kurangira; murashobora gusenga ubu.',
    s4: 'Nimwasenze, mukande ”Nasenze”; nimba atari ko, muhagarare musenge ubu.',
  },
  serit: {
    giris4: 'NTIMUTEBAGANYE ISENGESHO. Muhagarare musenge ubu. (haciye {dk} min)',
    giris2: 'Igihe kiriko kiragenda; ntimusigaze isengesho ryanyu ku mpera. (haciye {dk} min)',
    giris1: cogul({ one: 'Haciye umunota {n} igihe c’isengesho gitanguye.', other: 'Haciye iminota {n} igihe c’isengesho gitanguye.' }),
    erken4: 'Ntimutebaganye isengesho; muhagarare musenge ubu. (hasigaye {dk} min)',
    cikis4: 'IGIHE KIRARANGIRA. Muhagarare musenge ubu. (hasigaye {dk} min)',
    cikis2: 'Igihe kiriko kiragabanuka; ntimusigaze isengesho ryanyu ku mpera. (hasigaye {dk} min)',
    cikis1: cogul({ one: 'Hasigaye umunota {n} ngo igihe c’isengesho kirangire.', other: 'Hasigaye iminota {n} ngo igihe c’isengesho kirangire.' }),
  },
  geceCapasi: {
    baslik: '{ad} · musenge imbere yo kuryama ⏰',
    govde: 'Amasaha y’ituze atangura haciye {dk} min; musenge Isha imbere yo kuryama.',
  },
  icerik: {
    firsat: 'Igihe gitanguye kugabanuka; musenge mukiri mu mwanya.',
    sonaBirakma: 'Ntimusigaze isengesho ryanyu ku mpera; ubu ni igihe ciza co gusenga.',
    fisilti: 'Ntimuvuge ngo ”Nzosenga hanyuma”; igihe kiri hafi kurangira, murashobora gusenga ubu.',
    omur: 'Igihe kiriko kirarengana; muracafise umwanya wo gusenga iri sengesho mu gihe caryo.',
    keske: 'Muvyuke ubu aho kuvuga ngo ”Iyo mba narasenze” haciye iminota mike.',
    namazaDur: 'Nimwasenze, mukande ”Nasenze”; nimba atari ko, muhagarare musenge ubu.',
    sonDakika: 'Iminota ya nyuma. Mushire hasi ivyo muriko murakora, muhagarare musenge.',
  },
};
