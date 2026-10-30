import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı: tekil "Ka …" emri (QuranEnc `hausa_gummi` 17:78 "Ka tsayar da salla"); övgü ve
 * suçlama yok, "secde" yok. Başlıkta süre birimi "m": "Magariba · 655m" ilk 16 karaktere sığar.
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: '{ad} · {dk}m da shiga · lokacin salla ne ⏰',
    giris2: '{ad} · {dk}m da shiga · kada ka jinkirta salla ⚠️',
    giris3: '{ad} · {dk}m da shiga · sallarka na jiranka 🔥',
    giris4: '{ad} · {dk}m da shiga · KA TSAYAR DA SALLA 🚨',
    erken3: '{ad} · {dk}m ya rage · sallarka na jiranka 🔥',
    erken4: '{ad} · {dk}m ya rage · KA TSAYAR DA SALLA 🚨',
    cikis1: '{ad} · {dk}m ya rage ⏰',
    cikis2: '{ad} · {dk}m · lokaci yana ƙurewa ⚠️',
    cikis3: '{ad} · {dk}m · lokaci yana kuɓucewa 🔥',
    cikis4: '{ad} · {dk}m · LOKACI YANA ƘAREWA 🚨',
  },
  girisHavuzu: {
    s1: ['Lokacin salla ne; ka yi salla tun kana da dama.', 'Ka yi salla tun lokaci yana tare da kai; kada ka bar ta sai anjima.'],
    s2: ['Yawan jinkirtawa yana ƙara mata nauyi; kada ka bar sallarka zuwa ƙarshe.', 'Lokaci yana tafiya — ka yi salla yanzu.'],
    s3: [
      'Yawan jinkirtawa yana kusantar da kai ga rasa ta; ka yi salla yanzu.',
      'Kada ka ce "zan yi daga baya"; kana iya yin salla yanzu.',
      'Ka tashi yanzu maimakon ka ce "da ma" bayan ʼyan mintuna.',
    ],
    s4: ['Kada ka ƙara jinkirta sallarka — ka tsayar da salla yanzu.', 'Ka ajiye abin da kake yi ka tsayar da salla.'],
  },
  govde: {
    s1: 'Lokaci ya fara ƙurewa; ka yi salla tun kana da dama.',
    s2: 'Kada ka bar sallarka zuwa ƙarshe; yanzu lokaci ne mai kyau na yin salla.',
    s3: 'Lokaci ya kusa ƙarewa; har yanzu kana iya yin salla.',
    s4: 'Idan ka yi salla, taɓa "Na yi salla"; idan ba ka yi ba, ka tsayar da salla yanzu.',
  },
  serit: {
    giris4: 'KADA KA JINKIRTA SALLARKA. Ka tsayar da salla yanzu. (minti {dk} sun wuce)',
    giris2: 'Lokaci yana tafiya; kada ka bar sallarka zuwa ƙarshe. (minti {dk} sun wuce)',
    giris1: cogul({ one: 'Minti {n} ya wuce tun lokacin salla ya yi.', other: 'Minti {n} sun wuce tun lokacin salla ya yi.' }),
    erken4: 'Kada ka jinkirta sallarka; ka tsayar da salla yanzu. (minti {dk} sun rage)',
    cikis4: 'LOKACI YANA ƘAREWA. Ka tsayar da salla yanzu. (minti {dk} sun rage)',
    cikis2: 'Lokaci yana ƙurewa; kada ka bar sallarka zuwa ƙarshe. (minti {dk} sun rage)',
    cikis1: cogul({ one: 'Minti {n} ya rage kafin lokacin salla ya ƙare.', other: 'Minti {n} sun rage kafin lokacin salla ya ƙare.' }),
  },
  geceCapasi: {
    baslik: '{ad} · ka yi salla kafin ka yi barci ⏰',
    govde: 'Lokacin shiru zai fara cikin minti {dk}; ka yi sallar Isha kafin ka kwanta.',
  },
  icerik: {
    firsat: 'Lokaci ya fara ƙurewa; ka yi salla tun kana da dama.',
    sonaBirakma: 'Kada ka bar sallarka zuwa ƙarshe; yanzu lokaci ne mai kyau na yin salla.',
    fisilti: 'Kada ka ce "zan yi daga baya"; lokaci ya kusa ƙarewa, kana iya yin salla yanzu.',
    omur: 'Lokaci yana wucewa; har yanzu kana da damar yin wannan salla a lokacinta.',
    keske: 'Ka tashi yanzu maimakon ka ce "da ma" bayan ʼyan mintuna.',
    namazaDur: 'Idan ka yi salla, taɓa "Na yi salla"; idan ba ka yi ba, ka tsayar da salla yanzu.',
    sonDakika: 'Mintunan ƙarshe. Ka ajiye abin da kake yi ka tsayar da salla.',
  },
};
