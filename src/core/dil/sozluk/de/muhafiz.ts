import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı Almancada: "Sie" + kısa, doğrudan; "bitte" yok. "Niederwerfen" YAZILMAZ
 * (Türkçedeki "secdeye kapan" yasağının ikizi) → "Auf zum Gebet" / "zum Gebet aufstehen".
 * Başlıkta süre birimi SI "min": "Maghrib · 65 min" ilk 16 karaktere sığar.
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: '{ad} · {dk} min vorbei · Gebetszeit ⏰',
    giris2: '{ad} · {dk} min vorbei · Gebet nicht aufschieben ⚠️',
    giris3: '{ad} · {dk} min vorbei · Ihr Gebet wartet 🔥',
    giris4: '{ad} · {dk} min vorbei · AUF ZUM GEBET 🚨',
    erken3: '{ad} · {dk} min übrig · Ihr Gebet wartet 🔥',
    erken4: '{ad} · {dk} min übrig · AUF ZUM GEBET 🚨',
    cikis1: '{ad} · {dk} min übrig ⏰',
    cikis2: '{ad} · {dk} min · die Zeit wird knapp ⚠️',
    cikis3: '{ad} · {dk} min · die Zeit läuft davon 🔥',
    cikis4: '{ad} · {dk} min · ZEIT LÄUFT AB 🚨',
  },
  girisHavuzu: {
    s1: ['Die Gebetszeit hat begonnen; beten Sie, solange Sie Gelegenheit haben.', 'Beten Sie, solange die Zeit auf Ihrer Seite ist; schieben Sie es nicht auf.'],
    s2: ['Je länger Sie es aufschieben, desto schwerer wird es; lassen Sie das Gebet nicht bis zuletzt.', 'Die Zeit vergeht — jetzt ist die Zeit zu beten.'],
    s3: [
      'Je länger Sie das Gebet aufschieben, desto näher kommen Sie daran, es zu verpassen; beten Sie gleich.',
      'Sagen Sie nicht „Ich bete später“; Sie können jetzt beten.',
      'Stehen Sie jetzt auf, statt in ein paar Minuten „hätte ich doch“ zu sagen.',
    ],
    s4: ['Schieben Sie das Gebet nicht länger auf — auf zum Gebet.', 'Legen Sie beiseite, was Sie tun, und stehen Sie zum Gebet auf.'],
  },
  govde: {
    s1: 'Die Zeit wird allmählich knapp; beten Sie, solange Sie Gelegenheit haben.',
    s2: 'Lassen Sie das Gebet nicht bis zuletzt; jetzt ist eine gute Zeit zu beten.',
    s3: 'Die Zeit ist fast um; Sie können jetzt noch beten.',
    s4: 'Wenn Sie gebetet haben, tippen Sie auf „Gebetet“; wenn nicht, stehen Sie jetzt zum Gebet auf.',
  },
  serit: {
    giris4: 'GEBET NICHT AUFSCHIEBEN! Auf zum Gebet! (seit {dk} Min.)',
    giris2: 'Die Zeit vergeht; lassen Sie das Gebet nicht bis zuletzt. (seit {dk} Min.)',
    giris1: cogul({ one: 'Die Gebetszeit hat vor {n} Minute begonnen.', other: 'Die Gebetszeit hat vor {n} Minuten begonnen.' }),
    erken4: 'Schieben Sie das Gebet nicht auf, auf zum Gebet! (noch {dk} Min.)',
    cikis4: 'DIE ZEIT LÄUFT AB! Auf zum Gebet! (noch {dk} Min.)',
    cikis2: 'Die Zeit wird knapp; lassen Sie das Gebet nicht bis zuletzt. (noch {dk} Min.)',
    cikis1: cogul({ one: 'Noch {n} Minute bis zum Ende der Gebetszeit.', other: 'Noch {n} Minuten bis zum Ende der Gebetszeit.' }),
  },
  geceCapasi: {
    baslik: '{ad} · vor dem Schlafen beten ⏰',
    govde: 'Noch {dk} Min. bis zur Nachtruhe; beten Sie Isha, bevor Sie schlafen gehen.',
  },
  icerik: {
    firsat: 'Die Zeit wird allmählich knapp; beten Sie, solange Sie Gelegenheit haben.',
    sonaBirakma: 'Lassen Sie das Gebet nicht bis zuletzt; jetzt ist eine gute Zeit zu beten.',
    fisilti: 'Sagen Sie nicht „Ich bete später“; die Zeit ist fast um, Sie können jetzt beten.',
    omur: 'Die Zeit vergeht; Sie haben noch die Gelegenheit, dieses Gebet rechtzeitig zu verrichten.',
    keske: 'Stehen Sie jetzt auf, statt in ein paar Minuten „hätte ich doch“ zu sagen.',
    namazaDur: 'Wenn Sie gebetet haben, tippen Sie auf „Gebetet“; wenn nicht, stehen Sie jetzt zum Gebet auf.',
    sonDakika: 'Die letzten Minuten. Legen Sie beiseite, was Sie tun, und stehen Sie zum Gebet auf.',
  },
};
