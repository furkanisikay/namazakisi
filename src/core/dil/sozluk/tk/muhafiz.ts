import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Namaz goragçysy: ybadata çagyryş "sen" + buýruk (az/uz/kk/ky emsali). "Sejde et" ÝAZYLMAÝAR → "namaza dur".
 * Gijikdirmek ≠ terk etmek: gijä galana höküm ýok. Sözbaşy öňden okalýar: wagt ady + wagt ilkinji 16 harpda
 * ("Agşam · 15 min").
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: '{ad} · {dk} min geçdi · wagt girdi ⏰',
    giris2: '{ad} · {dk} min geçdi · namazyňy gijikdirme ⚠️',
    giris3: '{ad} · {dk} min geçdi · namaz saňa garaşýar 🔥',
    giris4: '{ad} · {dk} min geçdi · NAMAZA DUR 🚨',
    erken3: '{ad} · {dk} min galdy · namaz saňa garaşýar 🔥',
    erken4: '{ad} · {dk} min galdy · NAMAZA DUR 🚨',
    cikis1: '{ad} · {dk} min galdy ⏰',
    cikis2: '{ad} · {dk} min · wagt daralýar ⚠️',
    cikis3: '{ad} · {dk} min · wagt gaçýar 🔥',
    cikis4: '{ad} · {dk} min · WAGT ÇYKÝAR 🚨',
  },
  girisHavuzu: {
    s1: ['Namaz wagty girdi; pursat barka oka.', 'Wagt seniň peýdaňa işleýärkä oka, soňa galmasyn.'],
    s2: ['Yza süýşürdigiňçe agyrlaşýar; namazy soňa goýma.', 'Wagt geçýär — namazyňy häzir oka.'],
    s3: [
      'Namazy gijikdirdigiňçe gaçyrmaga ýakynlaşýarsyň; häziriň özünde oka.',
      '"Soň okaryn" diýme; häzir okap bilersiň.',
      'Birnäçe minutdan "kaşgä" diýmegiň ýerine häzir tur.',
    ],
    s4: ['Namazy mundan artyk gijikdirme — häziriň özünde namaza dur.', 'Elindäkini goý-da, namaza dur.'],
  },
  govde: {
    s1: 'Wagt daralyp başlady; pursat barka oka.',
    s2: 'Namazyňy soňa goýma; häzir okamak üçin gowy wagt.',
    s3: 'Wagt gutarmakçy; entek häzir okap bilersiň.',
    s4: 'Okan bolsaň, "Okadym" düwmesine bas; okamadyk bolsaň, häziriň özünde namaza dur.',
  },
  serit: {
    giris4: 'NAMAZYŇY GIJIKDIRME. Häziriň özünde namaza dur. ({dk} min geçdi)',
    giris2: 'Wagt geçýär; namazyňy soňa goýma. ({dk} min geçdi)',
    giris1: cogul({ one: 'Namaz wagty girenden bäri {n} minut geçdi.', other: 'Namaz wagty girenden bäri {n} minut geçdi.' }),
    erken4: 'Namazyňy gijikdirme; häziriň özünde namaza dur. ({dk} min galdy)',
    cikis4: 'WAGT ÇYKÝAR. Häziriň özünde namaza dur. ({dk} min galdy)',
    cikis2: 'Wagt daralýar; namazyňy soňa goýma. ({dk} min galdy)',
    cikis1: cogul({ one: 'Namaz wagtynyň çykmagyna {n} minut galdy.', other: 'Namaz wagtynyň çykmagyna {n} minut galdy.' }),
  },
  geceCapasi: {
    baslik: '{ad} · ýatmazdan öň oka ⏰',
    govde: '{dk} minutdan sessiz sagatlar başlaýar; ýatmazdan öň ýassy namazyny oka.',
  },
  icerik: {
    firsat: 'Wagt daralyp başlady; pursat barka oka.',
    sonaBirakma: 'Namazyňy soňa goýma; häzir okamak üçin gowy wagt.',
    fisilti: '"Soň okaryn" diýme; wagt gutarmakçy, häzir okap bilersiň.',
    omur: 'Wagt geçýär; bu namazy wagtynda okamaga entek mümkinçiligiň bar.',
    keske: 'Birnäçe minutdan "kaşgä" diýmegiň ýerine häzir tur.',
    namazaDur: 'Okan bolsaň, "Okadym" düwmesine bas; okamadyk bolsaň, häziriň özünde namaza dur.',
    sonDakika: 'Soňky minutlar. Elindäkini goý-da, namaza dur.',
  },
};
