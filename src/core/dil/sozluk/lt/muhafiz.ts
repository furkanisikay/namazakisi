import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı: saygılı ‑kite emri, kısa ve doğrudan ("Stokite maldai", "Melskitės"); "!" yok.
 * Secde karşılığı YAZILMAZ: kişi "maldai stoja" (namaza durur). Olumsuz emir ilgi hâli ister
 * ("neatidėliokite maldos"). Başlıkta süre "min." (CLDR lt kısa birimi); vakit adı + süre önde.
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: '{ad} · praėjo {dk} min. · maldos laikas ⏰',
    giris2: '{ad} · praėjo {dk} min. · neatidėliokite maldos ⚠️',
    giris3: '{ad} · praėjo {dk} min. · malda jūsų laukia 🔥',
    giris4: '{ad} · praėjo {dk} min. · STOKITE MALDAI 🚨',
    erken3: '{ad} · liko {dk} min. · malda jūsų laukia 🔥',
    erken4: '{ad} · liko {dk} min. · STOKITE MALDAI 🚨',
    cikis1: '{ad} · liko {dk} min. ⏰',
    cikis2: '{ad} · {dk} min. · laikas senka ⚠️',
    cikis3: '{ad} · {dk} min. · laikas bėga 🔥',
    cikis4: '{ad} · {dk} min. · LAIKAS BAIGIASI 🚨',
  },
  girisHavuzu: {
    s1: ['Prasidėjo maldos laikas; melskitės, kol yra galimybė.', 'Melskitės, kol laikas jūsų pusėje; neatidėkite vėlesniam laikui.'],
    s2: ['Kuo ilgiau atidėliojate, tuo sunkiau; nepalikite maldos paskutinei minutei.', 'Laikas eina – atlikite maldą dabar.'],
    s3: [
      'Kuo ilgiau delsiate, tuo labiau rizikuojate ją praleisti; melskitės dabar.',
      'Nesakykite „pasimelsiu vėliau“; galite melstis dabar.',
      'Kelkitės dabar, kad po kelių minučių nereikėtų gailėtis.',
    ],
    s4: ['Daugiau neatidėliokite maldos – stokite maldai dabar.', 'Padėkite tai, ką darote, ir stokite maldai.'],
  },
  govde: {
    s1: 'Laikas pradeda sekti; melskitės, kol yra galimybė.',
    s2: 'Nepalikite maldos paskutinei minutei; dabar tinkamas metas melstis.',
    s3: 'Laikas tuoj baigsis; dar galite melstis dabar.',
    s4: 'Jei atlikote maldą, palieskite „Atlikau maldą“; jei ne, stokite maldai dabar.',
  },
  serit: {
    giris4: 'NEATIDĖLIOKITE MALDOS. Stokite maldai dabar. (praėjo {dk} min.)',
    giris2: 'Laikas eina; nepalikite maldos paskutinei minutei. (praėjo {dk} min.)',
    giris1: cogul({ one: 'Nuo maldos laiko pradžios praėjo {n} minutė.', few: 'Nuo maldos laiko pradžios praėjo {n} minutės.', many: 'Nuo maldos laiko pradžios praėjo {n} minutės.', other: 'Nuo maldos laiko pradžios praėjo {n} minučių.' }),
    erken4: 'Neatidėliokite maldos, stokite maldai dabar. (liko {dk} min.)',
    cikis4: 'LAIKAS BAIGIASI. Stokite maldai dabar. (liko {dk} min.)',
    cikis2: 'Laikas senka; nepalikite maldos paskutinei minutei. (liko {dk} min.)',
    cikis1: cogul({ one: 'Iki maldos laiko pabaigos liko {n} minutė.', few: 'Iki maldos laiko pabaigos liko {n} minutės.', many: 'Iki maldos laiko pabaigos liko {n} minutės.', other: 'Iki maldos laiko pabaigos liko {n} minučių.' }),
  },
  geceCapasi: {
    baslik: '{ad} · melskitės prieš miegą ⏰',
    govde: 'Iki nakties ramybės liko {dk} min.; prieš eidami miegoti atlikite Isha maldą.',
  },
  icerik: {
    firsat: 'Laikas pradeda sekti; melskitės, kol yra galimybė.',
    sonaBirakma: 'Nepalikite maldos paskutinei minutei; dabar tinkamas metas melstis.',
    fisilti: 'Nesakykite „pasimelsiu vėliau“; laikas tuoj baigsis, galite melstis dabar.',
    omur: 'Laikas eina; dar turite galimybę atlikti šią maldą laiku.',
    keske: 'Kelkitės dabar, kad po kelių minučių nereikėtų gailėtis.',
    namazaDur: 'Jei atlikote maldą, palieskite „Atlikau maldą“; jei ne, stokite maldai dabar.',
    sonDakika: 'Paskutinės minutės. Padėkite tai, ką darote, ir stokite maldai.',
  },
};
