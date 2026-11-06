import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı: mealin saygılı çoğul emri ("Puhimi ya jiŋli", QuranEnc 2:43), kısa ve
 * doğrudan; "!" yok, secde yok (kişi namaza durur: "zanimi ya jiŋli zuɣu", 2:238 "Yiɣisim ya zani
 * n-ti Naawuni" kökünden). Olumsuz emir "Di … ya" (2:42 "Di zaŋ ya"). Başlıkta süre birimi "min":
 * "Magarbi · 655min" ilk 16 karaktere sığar.
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: '{ad} · {dk}min gari · jiŋli saha ⏰',
    giris2: '{ad} · {dk}min gari · di yuui ya jiŋli ⚠️',
    giris3: '{ad} · {dk}min gari · yi jiŋli guhiri ya 🔥',
    giris4: '{ad} · {dk}min gari · PUHIMI YA JIŊLI 🚨',
    erken3: '{ad} · {dk}min kpalim · yi jiŋli guhiri ya 🔥',
    erken4: '{ad} · {dk}min kpalim · PUHIMI YA JIŊLI 🚨',
    cikis1: '{ad} · {dk}min kpalim ⏰',
    cikis2: '{ad} · {dk}min · saha bi lahi waɣi ⚠️',
    cikis3: '{ad} · {dk}min · saha chani 🔥',
    cikis4: '{ad} · {dk}min · SAHA NI NAAI 🚨',
  },
  girisHavuzu: {
    s1: ['Jiŋli saha paaya; puhimi ya jiŋli ka saha na beni.', 'Puhimi ya ka saha na be yi sani; di chɛ ya li ka di yuui.'],
    s2: ['Yi yi yuuri li, di ni lahi kpɛŋ; di chɛ ya yi jiŋli hali ni di bahigu.', 'Saha chani — puhimi ya pumpɔŋɔ.'],
    s3: [
      'Yi yi yuuri li, yi miri ni di gari ya; puhimi ya pumpɔŋɔ.',
      'Di yɛli ya: “N ni puhi nyaaŋa”; yi ni tooi puhi pumpɔŋɔ.',
      'Yiɣisimi ya pumpɔŋɔ, ka di nyɛ ni minti biɛla nyaaŋa yi yɛn yɛli: “Di yi daa niŋ…”',
    ],
    s4: ['Di lahi yuui ya yi jiŋli — zanimi ya jiŋli zuɣu pumpɔŋɔ.', 'Zalimi ya yi ni tumdi shɛli maa ka zani jiŋli zuɣu.'],
  },
  govde: {
    s1: 'Saha piligiya n-chani; puhimi ya jiŋli ka saha na beni.',
    s2: 'Di chɛ ya yi jiŋli hali ni di bahigu; pumpɔŋɔ nyɛla saha suŋ n-ti jiŋli.',
    s3: 'Saha miriya ni di naai; yi na ni tooi puhi pumpɔŋɔ.',
    s4: 'Yi yi puhi, dihimi ya “N puhi jiŋli”; yi yi na bi puhi, zanimi ya jiŋli zuɣu pumpɔŋɔ.',
  },
  serit: {
    giris4: 'DI YUUI YA YI JIŊLI. Zanimi ya jiŋli zuɣu pumpɔŋɔ. (minti {dk} gari)',
    giris2: 'Saha chani; di chɛ ya yi jiŋli hali ni di bahigu. (minti {dk} gari)',
    giris1: cogul({ one: 'Minti {n} gari tum jiŋli saha ni paai.', other: 'Minti {n} gari tum jiŋli saha ni paai.' }),
    erken4: 'Di yuui ya yi jiŋli; zanimi ya jiŋli zuɣu pumpɔŋɔ. (minti {dk} kpalim)',
    cikis4: 'SAHA NI NAAI. Zanimi ya jiŋli zuɣu pumpɔŋɔ. (minti {dk} kpalim)',
    cikis2: 'Saha bi lahi waɣi; di chɛ ya yi jiŋli hali ni di bahigu. (minti {dk} kpalim)',
    cikis1: cogul({ one: 'Minti {n} n-kpalim pɔi ka jiŋli saha naai.', other: 'Minti {n} n-kpalim pɔi ka jiŋli saha naai.' }),
  },
  geceCapasi: {
    baslik: '{ad} · puhimi ya pɔi ka gbihi ⏰',
    govde: 'Kukoli kani saha ni piligi minti {dk} puuni; puhimi ya Isha’i pɔi ka yi gbihi.',
  },
  icerik: {
    firsat: 'Saha piligiya n-chani; puhimi ya jiŋli ka saha na beni.',
    sonaBirakma: 'Di chɛ ya yi jiŋli hali ni di bahigu; pumpɔŋɔ nyɛla saha suŋ n-ti jiŋli.',
    fisilti: 'Di yɛli ya: “N ni puhi nyaaŋa”; saha miriya ni di naai, yi ni tooi puhi pumpɔŋɔ.',
    omur: 'Saha chani; yi na ni tooi puhi jiŋli ŋɔ di saha ni.',
    keske: 'Yiɣisimi ya pumpɔŋɔ, ka di nyɛ ni minti biɛla nyaaŋa yi yɛn yɛli: “Di yi daa niŋ…”',
    namazaDur: 'Yi yi puhi, dihimi ya “N puhi jiŋli”; yi yi na bi puhi, zanimi ya jiŋli zuɣu pumpɔŋɔ.',
    sonDakika: 'Minti din bahi. Zalimi ya yi ni tumdi shɛli maa ka zani jiŋli zuɣu.',
  },
};
