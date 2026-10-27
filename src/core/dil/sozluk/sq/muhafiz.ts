// ÇEVİRİ: sq — İngilizce iskelet, çevrilince bu satır silinir
import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı İngilizcede: doğrudan, kısa emir, "please" yok. "Prostrate" YAZILMAZ
 * (Türkçedeki "secdeye kapan" yasağının ikizi) → "stand for prayer". Başlıkta süre birimi
 * "m": "Maghrib · 655m" ilk 16 karaktere sığar ("min" sığmazdı).
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: "{ad} · {dk}m in · it's prayer time ⏰",
    giris2: "{ad} · {dk}m in · don't delay your prayer ⚠️",
    giris3: '{ad} · {dk}m in · your prayer is waiting 🔥',
    giris4: '{ad} · {dk}m in · STAND FOR PRAYER 🚨',
    erken3: '{ad} · {dk}m left · your prayer is waiting 🔥',
    erken4: '{ad} · {dk}m left · STAND FOR PRAYER 🚨',
    cikis1: '{ad} · {dk}m left ⏰',
    cikis2: '{ad} · {dk}m · time is running short ⚠️',
    cikis3: '{ad} · {dk}m · time is slipping away 🔥',
    cikis4: '{ad} · {dk}m · TIME IS ENDING 🚨',
  },
  girisHavuzu: {
    s1: ["It's prayer time; pray while you have the chance.", "Pray while time is on your side; don't leave it for later."],
    s2: ["The longer you put it off, the heavier it gets; don't leave your prayer to the end.", 'Time is moving on — pray now.'],
    s3: [
      'The longer you delay, the closer you come to missing it; pray now.',
      'Don\'t say "I\'ll pray later"; you can pray now.',
      'Get up now rather than saying "if only" in a few minutes.',
    ],
    s4: ["Don't delay your prayer any longer — stand for prayer now.", 'Put down what you are doing and stand for prayer.'],
  },
  govde: {
    s1: 'Time is starting to run short; pray while you have the chance.',
    s2: "Don't leave your prayer to the end; now is a good time to pray.",
    s3: 'Time is almost up; you can still pray now.',
    s4: 'If you\'ve prayed, tap "I\'ve prayed"; if not, stand for prayer now.',
  },
  serit: {
    giris4: "DON'T DELAY YOUR PRAYER! Stand for prayer now! ({dk} min passed)",
    giris2: "Time is moving on; don't leave your prayer to the end. ({dk} min passed)",
    giris1: cogul({ one: "It's been {n} minute since prayer time began.", other: "It's been {n} minutes since prayer time began." }),
    erken4: "Don't delay your prayer; stand for prayer now! ({dk} min left)",
    cikis4: 'TIME IS ENDING! Stand for prayer now! ({dk} min left)',
    cikis2: "Time is running short; don't leave your prayer to the end. ({dk} min left)",
    cikis1: cogul({ one: '{n} minute left until the prayer time ends.', other: '{n} minutes left until the prayer time ends.' }),
  },
  geceCapasi: {
    baslik: '{ad} · pray before you sleep ⏰',
    govde: 'Quiet hours start in {dk} min; pray Isha before you go to bed.',
  },
  icerik: {
    firsat: 'Time is starting to run short; pray while you have the chance.',
    sonaBirakma: "Don't leave your prayer to the end; now is a good time to pray.",
    fisilti: 'Don\'t say "I\'ll pray later"; time is almost up, you can pray now.',
    omur: 'Time is passing; you still have the chance to pray this prayer on time.',
    keske: 'Get up now rather than saying "if only" in a few minutes.',
    namazaDur: 'If you\'ve prayed, tap "I\'ve prayed"; if not, stand for prayer now.',
    sonDakika: 'The last minutes. Put down what you are doing and stand for prayer.',
  },
};
