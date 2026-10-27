import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı Boşnakçada da saygılı "Vi" + kısa emir ("Klanjajte", "Stanite na namaz").
 * "Secdeye kapan" karşılığı YAZILMAZ; kişi namaza durur ("stanite na namaz"). Başlık önden
 * okunur: vakit adı + süre başta.
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: '{ad} · {dk} min od nastupa · vrijeme je za namaz ⏰',
    giris2: '{ad} · {dk} min od nastupa · ne odgađajte namaz ⚠️',
    giris3: '{ad} · {dk} min od nastupa · namaz Vas čeka 🔥',
    giris4: '{ad} · {dk} min od nastupa · STANITE NA NAMAZ 🚨',
    erken3: '{ad} · još {dk} min · namaz Vas čeka 🔥',
    erken4: '{ad} · još {dk} min · STANITE NA NAMAZ 🚨',
    cikis1: '{ad} · još {dk} min ⏰',
    cikis2: '{ad} · {dk} min · vrijeme se sužava ⚠️',
    cikis3: '{ad} · {dk} min · vrijeme izmiče 🔥',
    cikis4: '{ad} · {dk} min · VAKAT ISTIČE 🚨',
  },
  girisHavuzu: {
    s1: ['Nastupio je vakat; klanjajte dok imate priliku.', 'Klanjajte dok je vrijeme na Vašoj strani, ne ostavljajte za kasnije.'],
    s2: ['Što više odgađate, to je teže; ne ostavljajte namaz za kraj.', 'Vrijeme odmiče — klanjajte sada.'],
    s3: [
      'Što više odgađate, bliže ste propuštanju; klanjajte odmah.',
      'Ne govorite „klanjat ću kasnije”; sada možete klanjati.',
      'Ustanite sada, umjesto da za nekoliko minuta kažete „da sam barem”.',
    ],
    s4: ['Ne odgađajte više namaz — odmah stanite na namaz.', 'Ostavite to čime se bavite i stanite na namaz.'],
  },
  govde: {
    s1: 'Vrijeme se počinje sužavati; klanjajte dok imate priliku.',
    s2: 'Ne ostavljajte namaz za kraj; sada je pravo vrijeme da klanjate.',
    s3: 'Vakat samo što nije istekao; sada još možete klanjati.',
    s4: 'Ako ste klanjali, dodirnite „Klanjano”; ako niste, odmah stanite na namaz.',
  },
  serit: {
    giris4: 'NE ODGAĐAJTE NAMAZ. Odmah stanite na namaz. (prošlo {dk} min)',
    giris2: 'Vrijeme odmiče, ne ostavljajte namaz za kraj. (prošlo {dk} min)',
    giris1: cogul({
      one: 'Od nastupa vakta prošla je {n} minuta.',
      few: 'Od nastupa vakta prošle su {n} minute.',
      other: 'Od nastupa vakta prošlo je {n} minuta.',
    }),
    erken4: 'Ne odgađajte namaz, odmah stanite na namaz. (još {dk} min)',
    cikis4: 'VAKAT ISTIČE. Odmah stanite na namaz. (još {dk} min)',
    cikis2: 'Vrijeme se sužava, ne ostavljajte namaz za kraj. (još {dk} min)',
    cikis1: cogul({
      one: 'Do isteka vakta ostala je {n} minuta.',
      few: 'Do isteka vakta ostale su {n} minute.',
      other: 'Do isteka vakta ostalo je {n} minuta.',
    }),
  },
  geceCapasi: {
    baslik: '{ad} · klanjajte prije spavanja ⏰',
    govde: 'Do noćne tišine ostalo je {dk} min; klanjajte jaciju prije nego što legnete.',
  },
  icerik: {
    firsat: 'Vrijeme se počinje sužavati; klanjajte dok imate priliku.',
    sonaBirakma: 'Ne ostavljajte namaz za kraj; sada je pravo vrijeme da klanjate.',
    fisilti: 'Ne govorite „klanjat ću kasnije”; vakat samo što nije istekao, sada možete klanjati.',
    omur: 'Vrijeme prolazi; još imate priliku da ovaj namaz klanjate na vrijeme.',
    keske: 'Ustanite sada, umjesto da za nekoliko minuta kažete „da sam barem”.',
    namazaDur: 'Ako ste klanjali, dodirnite „Klanjano”; ako niste, odmah stanite na namaz.',
    sonDakika: 'Posljednje minute. Ostavite to čime se bavite i stanite na namaz.',
  },
};
