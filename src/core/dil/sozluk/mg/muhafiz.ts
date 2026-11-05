import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı: "ianao" kipinde kısa emir ("Mivavaha", "Mitsangàna hivavaka"), "!" yok, secde yok.
 * Başlıkta süre "{dk}min": "Maghrib · 655min" ilk 16 karaktere sığar; "lasa" (geçti) / "sisa" (kaldı) arkada.
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: "{ad} · {dk}min lasa · fotoanan'ny soalat ⏰",
    giris2: '{ad} · {dk}min lasa · aza ahemotra ny soalatrao ⚠️',
    giris3: '{ad} · {dk}min lasa · miandry anao ny soalat 🔥',
    giris4: '{ad} · {dk}min lasa · MITSANGÀNA HIVAVAKA 🚨',
    erken3: '{ad} · {dk}min sisa · miandry anao ny soalat 🔥',
    erken4: '{ad} · {dk}min sisa · MITSANGÀNA HIVAVAKA 🚨',
    cikis1: '{ad} · {dk}min sisa ⏰',
    cikis2: '{ad} · {dk}min · mihafohy ny fotoana ⚠️',
    cikis3: '{ad} · {dk}min · mandositra ny fotoana 🔥',
    cikis4: '{ad} · {dk}min · EFA HO TAPITRA NY FOTOANA 🚨',
  },
  girisHavuzu: {
    s1: ["Fotoanan'ny soalat izao; mivavaha raha mbola misy fahafahana.", 'Mivavaha raha mbola anananao ny fotoana; aza avela ho any aoriana.'],
    s2: ["Arakaraky ny anemoranao no mavesatra kokoa izy; aza avela ho amin'ny farany ny soalatrao.", 'Mandeha ny fotoana — mivavaha izao.'],
    s3: [
      'Arakaraky ny anemoranao no manakaiky ny tsy hahatratrarana azy; mivavaha izao.',
      'Aza miteny hoe « Hivavaka any aoriana aho »; afaka mivavaka izao ianao.',
      "Mitsangàna izao, alohan'ny hitenenanao hoe « enga anie » afaka minitra vitsy.",
    ],
    s4: ['Aza ahemotra intsony ny soalatrao — mitsangàna hivavaka izao.', 'Apetraho izay ataonao ary mitsangàna hivavaka.'],
  },
  govde: {
    s1: 'Efa manomboka mihafohy ny fotoana; mivavaha raha mbola misy fahafahana.',
    s2: "Aza avela ho amin'ny farany ny soalatrao; fotoana tsara hivavahana izao.",
    s3: 'Efa ho tapitra ny fotoana; mbola afaka mivavaka izao ianao.',
    s4: 'Raha efa nivavaka ianao, kitiho ny « Nivavaka aho »; raha tsy izany, mitsangàna hivavaka izao.',
  },
  serit: {
    giris4: 'AZA AHEMOTRA NY SOALATRAO. Mitsangàna hivavaka izao. ({dk} min lasa)',
    giris2: "Mandeha ny fotoana; aza avela ho amin'ny farany ny soalatrao. ({dk} min lasa)",
    giris1: cogul({
      one: "{n} minitra no lasa hatramin'ny nidiran'ny fotoanan'ny soalat.",
      other: "{n} minitra no lasa hatramin'ny nidiran'ny fotoanan'ny soalat.",
    }),
    erken4: 'Aza ahemotra ny soalatrao; mitsangàna hivavaka izao. ({dk} min sisa)',
    cikis4: 'EFA HO TAPITRA NY FOTOANA. Mitsangàna hivavaka izao. ({dk} min sisa)',
    cikis2: "Mihafohy ny fotoana; aza avela ho amin'ny farany ny soalatrao. ({dk} min sisa)",
    cikis1: cogul({
      one: "{n} minitra sisa mandra-pifaranan'ny fotoanan'ny soalat.",
      other: "{n} minitra sisa mandra-pifaranan'ny fotoanan'ny soalat.",
    }),
  },
  geceCapasi: {
    baslik: "{ad} · mivavaha alohan'ny hatoriana ⏰",
    govde: "Manomboka afaka {dk} min ny ora mangina; ataovy ny soalat Isha alohan'ny hatoriana.",
  },
  icerik: {
    firsat: 'Efa manomboka mihafohy ny fotoana; mivavaha raha mbola misy fahafahana.',
    sonaBirakma: "Aza avela ho amin'ny farany ny soalatrao; fotoana tsara hivavahana izao.",
    fisilti: 'Aza miteny hoe « Hivavaka any aoriana aho »; efa ho tapitra ny fotoana, afaka mivavaka izao ianao.',
    omur: 'Mandeha ny fotoana; mbola manana fahafahana hanao ity soalat ity ara-potoana ianao.',
    keske: "Mitsangàna izao, alohan'ny hitenenanao hoe « enga anie » afaka minitra vitsy.",
    namazaDur: 'Raha efa nivavaka ianao, kitiho ny « Nivavaka aho »; raha tsy izany, mitsangàna hivavaka izao.',
    sonDakika: 'Ireo minitra farany. Apetraho izay ataonao ary mitsangàna hivavaka.',
  },
};
