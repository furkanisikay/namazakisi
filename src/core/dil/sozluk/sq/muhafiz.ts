import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı Arnavutçada: "ju" + kısa çoğul emir. Secde karşılığı YAZILMAZ →
 * "ngrihuni për namaz" (namaza durun). Başlıkta vakit adı + süre ilk 16 karakterde
 * ("Akshami · 10 min").
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: '{ad} · {dk} min kaluan · ka hyrë koha ⏰',
    giris2: '{ad} · {dk} min kaluan · mos e vononi namazin ⚠️',
    giris3: '{ad} · {dk} min kaluan · namazi ju pret 🔥',
    giris4: '{ad} · {dk} min kaluan · NGRIHUNI PËR NAMAZ 🚨',
    erken3: '{ad} · {dk} min mbeten · namazi ju pret 🔥',
    erken4: '{ad} · {dk} min mbeten · NGRIHUNI PËR NAMAZ 🚨',
    cikis1: '{ad} · {dk} min mbeten ⏰',
    cikis2: '{ad} · {dk} min · koha po ngushtohet ⚠️',
    cikis3: '{ad} · {dk} min · koha po ikën 🔥',
    cikis4: '{ad} · {dk} min · KOHA PO DEL 🚨',
  },
  girisHavuzu: {
    s1: ['Ka hyrë koha e namazit; falni sa keni mundësi.', 'Falni sa koha është në anën tuaj, mos e lini për më vonë.'],
    s2: ['Sa më shumë e shtyni, aq më e rëndë bëhet; mos e lini namazin për në fund.', 'Koha po ecën — falni tani.'],
    s3: [
      'Sa më shumë e vononi namazin, aq më afër jeni ta humbni; falni tani.',
      'Mos thoni "do ta fal më vonë"; mund ta falni tani.',
      'Ngrihuni tani, në vend që pas pak minutash të thoni "ah, sikur".',
    ],
    s4: ['Mos e vononi më namazin — ngrihuni për namaz tani.', 'Lini atë që keni në dorë dhe ngrihuni për namaz.'],
  },
  govde: {
    s1: 'Koha ka filluar të ngushtohet; falni sa keni mundësi.',
    s2: 'Mos e lini namazin për në fund; tani është kohë e përshtatshme për ta falur.',
    s3: 'Koha po mbaron; mund ta falni ende tani.',
    s4: 'Nëse e keni falur, prekni "E fala"; nëse jo, ngrihuni për namaz tani.',
  },
  serit: {
    giris4: 'MOS E VONONI NAMAZIN! Ngrihuni për namaz tani! (kaluan {dk} min)',
    giris2: 'Koha po ecën; mos e lini namazin për në fund. (kaluan {dk} min)',
    giris1: cogul({ one: 'Ka {n} minutë që ka hyrë koha e namazit.', other: 'Ka {n} minuta që ka hyrë koha e namazit.' }),
    erken4: 'Mos e vononi namazin; ngrihuni për namaz tani! (mbeten {dk} min)',
    cikis4: 'KOHA PO DEL! Ngrihuni për namaz tani! (mbeten {dk} min)',
    cikis2: 'Koha po ngushtohet; mos e lini namazin për në fund. (mbeten {dk} min)',
    cikis1: cogul({ one: 'Edhe {n} minutë derisa të dalë koha e namazit.', other: 'Edhe {n} minuta derisa të dalë koha e namazit.' }),
  },
  geceCapasi: {
    baslik: '{ad} · falni para se të flini ⏰',
    govde: 'Edhe {dk} min deri në orët e qetësisë; falni jacinë para se të flini.',
  },
  icerik: {
    firsat: 'Koha ka filluar të ngushtohet; falni sa keni mundësi.',
    sonaBirakma: 'Mos e lini namazin për në fund; tani është kohë e përshtatshme për ta falur.',
    fisilti: 'Mos thoni "do ta fal më vonë"; koha po mbaron, mund ta falni tani.',
    omur: 'Koha po kalon; ende keni mundësi ta falni këtë namaz në kohë.',
    keske: 'Ngrihuni tani, në vend që pas pak minutash të thoni "ah, sikur".',
    namazaDur: 'Nëse e keni falur, prekni "E fala"; nëse jo, ngrihuni për namaz tani.',
    sonDakika: 'Minutat e fundit. Lini atë që keni në dorë dhe ngrihuni për namaz.',
  },
};
