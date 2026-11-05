// Lingalada `buyuk` elle yazılır (`toUpperCase` YASAK; ɛ ɔ → Ɛ Ɔ).
import type { Sozluk } from '../tr';

/**
 * Lingala (dalga 13, beta). Kaynak: QuranEnc `lingala_zakaria` 1.0.2 ve HadeethEnc ln (9 hadis).
 * İmla: arayüz metni ton işaretsiz yazılır (meal ve HadeethEnc gibi), açık ünlüler ɛ ɔ (U+025B,
 * U+0254) standart imlayla; ay ve gün adları CLDR `ln`'den birebir (tonlu). Hitap: 2. çoğul "bo‑"
 * emri ("Bopona engumba", "Bomeka lisusu"; türetildi), "!" yok; ibadete çağrı aynı kısa emir
 * ("Botelemisa losambo", QE 2:43). Vakit adları: Fajr (HadeethEnc ln kaynaklı), öteki dördü Arapça
 * kökenli sade Latin yazım (Dhuhr · Asr · Maghrib · Isha; DOĞRULANMADI, meal yalnız betimleyici:
 * ntongo, nzanga, sima ya nzanga, mpokwa, butu); güneş doğuşu "Kobima ya moi" (QE "moyi ebimi"
 * kökü, türetildi). Terimler: losambo (namaz), kosambela (kılmak), "Nasambeli" (Kıldım, HE 65003),
 * "Esambelami" (Kılındı, türetildi), Allah (ana oturum kararı; HE'nin "Nzambe"si değil), moskeye
 * (cami; HE "mosquée" alıntısının Lingala yazımı; "ndako esantu" Kâbe içindir), Qibla, Qada,
 * losambo ya suna (nafile, QE 17:79), Jumu'a, wudu, adhan, ntango ya makruh, Mokɛngɛli ya losambo
 * (Namaz Muhafızı), mokoba (seri), bokundoli (hatırlatma, QE), liyebisi/mayebisi (bildirim).
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Fajr', gunes: 'Kobima ya moi', ogle: 'Dhuhr', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isha' },
  buyuk: { imsak: 'FAJR', gunes: 'KOBIMA YA MOI', ogle: 'DHUHR', ikindi: 'ASR', aksam: 'MAGHRIB', yatsi: 'ISHA' },
  kucuk: { imsak: 'Fajr', gunes: 'kobima ya moi', ogle: 'Dhuhr', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isha' },
  imsakVakti: 'Fajr',
  cuma: "Jumu'a",
  cumaKucuk: "Jumu'a",
  gunesDogusu: 'Kobima ya moi',
  gunesDogusuKucuk: 'kobima ya moi',
  durum: { kilindi: 'Esambelami', vaktiGeldi: 'Ntango ekoki', girmedi: 'Ntango ekoki naino te', gecti: 'Esambelami te' },
  durumKucuk: { kilindi: 'esambelami', vaktiGeldi: 'ntango ekoki', girmedi: 'ntango ekoki naino te', gecti: 'esambelami te' },
  /** "Nasambeli" = kişinin kendi beyanı (1. tekil); durum "Esambelami". */
  eylem: { kildim: 'Nasambeli', kilindi: 'Esambelami' },
  kerahatVakti: 'Ntango ya makruh',
  isaretle: 'Botia elembo: esambelami',
  geriAlEtiketi: '{durum}, bofina mpɔ na kozongisa',
  geriAlindi: 'Elembo elongwami',
};
