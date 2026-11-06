import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı: "vi" (küçük harf) + kısa çoğul emir; "!" yok (Boşnakça emsali). Secde karşılığı
 * YAZILMAZ → "ustanite na namaz". Başlıkta vakit adı ve süre önce gelir (bileklik ~16 karakter).
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: '{ad} · {dk} min od početka · vrijeme je za namaz ⏰',
    giris2: '{ad} · {dk} min od početka · ne odgađajte namaz ⚠️',
    giris3: '{ad} · {dk} min od početka · namaz vas čeka 🔥',
    giris4: '{ad} · {dk} min od početka · USTANITE NA NAMAZ 🚨',
    erken3: '{ad} · još {dk} min · namaz vas čeka 🔥',
    erken4: '{ad} · još {dk} min · USTANITE NA NAMAZ 🚨',
    cikis1: '{ad} · još {dk} min ⏰',
    cikis2: '{ad} · {dk} min · vrijeme je na izmaku ⚠️',
    cikis3: '{ad} · {dk} min · vrijeme izmiče 🔥',
    cikis4: '{ad} · {dk} min · VRIJEME ISTJEČE 🚨',
  },
  girisHavuzu: {
    s1: ['Vrijeme je za namaz; klanjajte dok imate priliku.', 'Klanjajte dok je vrijeme na vašoj strani; ne ostavljajte za kasnije.'],
    s2: ['Što više odgađate, to je teže; ne ostavljajte namaz za kraj.', 'Vrijeme odmiče — klanjajte sada.'],
    s3: [
      'Što dulje odgađate, to ste bliže propuštanju; klanjajte sada.',
      'Ne govorite „klanjat ću poslije“; sada možete klanjati.',
      'Ustanite sada, umjesto da za nekoliko minuta kažete „da sam barem“.',
    ],
    s4: ['Ne odgađajte više namaz — ustanite na namaz sada.', 'Ostavite ono što radite i ustanite na namaz.'],
  },
  govde: {
    s1: 'Vrijeme se počinje sužavati; klanjajte dok imate priliku.',
    s2: 'Ne ostavljajte namaz za kraj; sada je dobro vrijeme za namaz.',
    s3: 'Vrijeme je gotovo isteklo; još uvijek možete klanjati.',
    s4: 'Ako ste klanjali, dodirnite „Klanjano“; ako niste, ustanite na namaz sada.',
  },
  serit: {
    giris4: 'NE ODGAĐAJTE NAMAZ. Ustanite na namaz sada. (prošlo {dk} min)',
    giris2: 'Vrijeme odmiče; ne ostavljajte namaz za kraj. (prošlo {dk} min)',
    giris1: cogul({
      one: 'Od početka vremena namaza prošla je {n} minuta.',
      few: 'Od početka vremena namaza prošle su {n} minute.',
      other: 'Od početka vremena namaza prošlo je {n} minuta.',
    }),
    erken4: 'Ne odgađajte namaz; ustanite na namaz sada. (još {dk} min)',
    cikis4: 'VRIJEME ISTJEČE. Ustanite na namaz sada. (još {dk} min)',
    cikis2: 'Vrijeme je na izmaku; ne ostavljajte namaz za kraj. (još {dk} min)',
    cikis1: cogul({
      one: 'Do isteka vremena namaza preostala je {n} minuta.',
      few: 'Do isteka vremena namaza preostale su {n} minute.',
      other: 'Do isteka vremena namaza preostalo je {n} minuta.',
    }),
  },
  geceCapasi: {
    baslik: '{ad} · klanjajte prije spavanja ⏰',
    govde: 'Noćna tišina počinje za {dk} min; klanjajte jaciju prije nego što legnete.',
  },
  icerik: {
    firsat: 'Vrijeme se počinje sužavati; klanjajte dok imate priliku.',
    sonaBirakma: 'Ne ostavljajte namaz za kraj; sada je dobro vrijeme za namaz.',
    fisilti: 'Ne govorite „klanjat ću poslije“; vrijeme je gotovo isteklo, sada možete klanjati.',
    omur: 'Vrijeme prolazi; još imate priliku klanjati ovaj namaz na vrijeme.',
    keske: 'Ustanite sada, umjesto da za nekoliko minuta kažete „da sam barem“.',
    namazaDur: 'Ako ste klanjali, dodirnite „Klanjano“; ako niste, ustanite na namaz sada.',
    sonDakika: 'Posljednje minute. Ostavite ono što radite i ustanite na namaz.',
  },
};
