import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı Akan dilinde: yalın tekil kısa emir ("Yɛ Nyamefrɛ"), "Yɛsrɛ wo" yok, "!" yok.
 * Secde karşılığı YAZILMAZ → "hyɛ Nyamefrɛ ase" (namaza dur; QE 2:149 "ahyɛ Nyamefrɛ ase").
 * Başlıkta süre birimi CLDR kısa "min".
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: '{ad} · {dk} min atwam · Nyamefrɛ berɛ adu ⏰',
    giris2: '{ad} · {dk} min atwam · nntwentwɛn wo nan ase ⚠️',
    giris3: '{ad} · {dk} min atwam · wo Nyamefrɛ retwɛn wo 🔥',
    giris4: '{ad} · {dk} min atwam · HYƐ NYAMEFRƐ ASE 🚨',
    erken3: '{ad} · {dk} min aka · wo Nyamefrɛ retwɛn wo 🔥',
    erken4: '{ad} · {dk} min aka · HYƐ NYAMEFRƐ ASE 🚨',
    cikis1: '{ad} · {dk} min aka ⏰',
    cikis2: '{ad} · {dk} min · berɛ resa ⚠️',
    cikis3: '{ad} · {dk} min · berɛ retwam 🔥',
    cikis4: '{ad} · {dk} min · BERƐ REBA AWIEƐ 🚨',
  },
  girisHavuzu: {
    s1: ['Nyamefrɛ berɛ adu; yɛ Nyamefrɛ berɛ a wowɔ kwan yi.', 'Yɛ Nyamefrɛ berɛ a berɛ da so wɔ hɔ; mma ɛnka akyire.'],
    s2: ['Dodoɔ a wotwentwɛn wo nan ase no, dodoɔ no ara na ɛyɛ duru; mma wo Nyamefrɛ nka awieɛ.', 'Berɛ rekɔ; yɛ Nyamefrɛ seesei.'],
    s3: [
      'Dodoɔ a wotwentwɛn wo nan ase no, dodoɔ no ara na ɛbɛn sɛ ɛbɛfiri wo nsa; yɛ Nyamefrɛ seesei.',
      'Nka sɛ "Mɛyɛ akyire yi"; wobɛtumi ayɛ seesei.',
      'Sɔre seesei sene sɛ wobɛka sɛ "Anka" sima kakra akyi.',
    ],
    s4: ['Nntwentwɛn wo Nyamefrɛ nan ase bio; hyɛ Nyamefrɛ ase seesei.', 'Gyae deɛ woreyɛ no na hyɛ Nyamefrɛ ase.'],
  },
  govde: {
    s1: 'Berɛ ahyɛ ase resa; yɛ Nyamefrɛ berɛ a wowɔ kwan yi.',
    s2: 'Mma wo Nyamefrɛ nka awieɛ; seesei yɛ berɛ pa sɛ wobɛyɛ Nyamefrɛ.',
    s3: 'Berɛ no aka kakra; wobɛtumi ayɛ Nyamefrɛ seesei ara.',
    s4: 'Sɛ woayɛ a, mia "Mayɛ Nyamefrɛ" so; sɛ ɛnte saa a, hyɛ Nyamefrɛ ase seesei.',
  },
  serit: {
    giris4: 'NNTWENTWƐN WO NYAMEFRƐ NAN ASE. Hyɛ Nyamefrɛ ase seesei. (sima {dk} atwam)',
    giris2: 'Berɛ rekɔ; mma wo Nyamefrɛ nka awieɛ. (sima {dk} atwam)',
    giris1: cogul({ one: 'Sima {n} atwam firi berɛ a Nyamefrɛ berɛ duruiɛ.', other: 'Sima {n} atwam firi berɛ a Nyamefrɛ berɛ duruiɛ.' }),
    erken4: 'Nntwentwɛn wo Nyamefrɛ nan ase; hyɛ Nyamefrɛ ase seesei. (sima {dk} aka)',
    cikis4: 'BERƐ REBA AWIEƐ. Hyɛ Nyamefrɛ ase seesei. (sima {dk} aka)',
    cikis2: 'Berɛ resa; mma wo Nyamefrɛ nka awieɛ. (sima {dk} aka)',
    cikis1: cogul({ one: 'Sima {n} na aka ansa na Nyamefrɛ berɛ aba awieɛ.', other: 'Sima {n} na aka ansa na Nyamefrɛ berɛ aba awieɛ.' }),
  },
  geceCapasi: {
    baslik: '{ad} · yɛ Nyamefrɛ ansa na woada ⏰',
    govde: 'Komm berɛ bɛhyɛ ase sima {dk} mu; yɛ Isha ansa na woada.',
  },
  icerik: {
    firsat: 'Berɛ ahyɛ ase resa; yɛ Nyamefrɛ berɛ a wowɔ kwan yi.',
    sonaBirakma: 'Mma wo Nyamefrɛ nka awieɛ; seesei yɛ berɛ pa sɛ wobɛyɛ Nyamefrɛ.',
    fisilti: 'Nka sɛ "Mɛyɛ akyire yi"; berɛ no aka kakra, wobɛtumi ayɛ seesei.',
    omur: 'Berɛ retwam; wowɔ kwan da so sɛ wobɛyɛ Nyamefrɛ yi wɔ ne berɛ mu.',
    keske: 'Sɔre seesei sene sɛ wobɛka sɛ "Anka" sima kakra akyi.',
    namazaDur: 'Sɛ woayɛ a, mia "Mayɛ Nyamefrɛ" so; sɛ ɛnte saa a, hyɛ Nyamefrɛ ase seesei.',
    sonDakika: 'Sima a ɛtwa toɔ. Gyae deɛ woreyɛ no na hyɛ Nyamefrɛ ase.',
  },
};
