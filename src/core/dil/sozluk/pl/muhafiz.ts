import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı: zamirsiz 2. tekil kısa emir ("Odprawiaj modlitwę", MZR 17:78), "!" yok.
 * "Secdeye kapan" karşılığı ("padnij na twarz") YAZILMAZ → "stań do modlitwy" (namaza durmak).
 * Başlıkta süre "{dk} min" ve sayı önce: "Maghrib · 655 min" bilekliğin ilk 16 karakterine yakın;
 * "minęło/zostało" sayıdan SONRA.
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: '{ad} · {dk} min od początku · czas modlitwy ⏰',
    giris2: '{ad} · {dk} min od początku · nie odkładaj modlitwy ⚠️',
    giris3: '{ad} · {dk} min od początku · modlitwa czeka 🔥',
    giris4: '{ad} · {dk} min od początku · STAŃ DO MODLITWY 🚨',
    erken3: '{ad} · {dk} min zostało · modlitwa czeka 🔥',
    erken4: '{ad} · {dk} min zostało · STAŃ DO MODLITWY 🚨',
    cikis1: '{ad} · {dk} min zostało ⏰',
    cikis2: '{ad} · {dk} min · czasu coraz mniej ⚠️',
    cikis3: '{ad} · {dk} min · czas ucieka 🔥',
    cikis4: '{ad} · {dk} min · CZAS SIĘ KOŃCZY 🚨',
  },
  girisHavuzu: {
    s1: ['Nadszedł czas modlitwy; odprawiaj ją, póki masz okazję.', 'Odprawiaj modlitwę, póki czas jest po Twojej stronie; nie zostawiaj jej na później.'],
    s2: ['Im dłużej odkładasz, tym trudniej; nie zostawiaj modlitwy na koniec.', 'Czas płynie — odprawiaj modlitwę teraz.'],
    s3: [
      'Im dłużej zwlekasz, tym bliżej do jej opuszczenia; odprawiaj modlitwę teraz.',
      'Nie mów „pomodlę się później”; możesz odprawić modlitwę teraz.',
      'Wstań teraz, zamiast za kilka minut mówić „gdybym tylko”.',
    ],
    s4: ['Nie odkładaj już modlitwy — stań do modlitwy teraz.', 'Odłóż to, co robisz, i stań do modlitwy.'],
  },
  govde: {
    s1: 'Czasu zaczyna brakować; odprawiaj modlitwę, póki masz okazję.',
    s2: 'Nie zostawiaj modlitwy na koniec; teraz jest dobry moment na modlitwę.',
    s3: 'Czas prawie minął; wciąż możesz teraz odprawić modlitwę.',
    s4: 'Jeśli modlitwa jest odprawiona, dotknij „Odprawiono”; jeśli nie, stań do modlitwy teraz.',
  },
  serit: {
    giris4: 'NIE ODKŁADAJ MODLITWY. Stań do modlitwy teraz. (minęło {dk} min)',
    giris2: 'Czas płynie; nie zostawiaj modlitwy na koniec. (minęło {dk} min)',
    giris1: cogul({
      one: 'Od początku czasu modlitwy minęła {n} minuta.',
      few: 'Od początku czasu modlitwy minęły {n} minuty.',
      many: 'Od początku czasu modlitwy minęło {n} minut.',
      other: 'Od początku czasu modlitwy minęło {n} minuty.',
    }),
    erken4: 'Nie odkładaj modlitwy; stań do modlitwy teraz. (zostało {dk} min)',
    cikis4: 'CZAS SIĘ KOŃCZY. Stań do modlitwy teraz. (zostało {dk} min)',
    cikis2: 'Czasu coraz mniej; nie zostawiaj modlitwy na koniec. (zostało {dk} min)',
    cikis1: cogul({
      one: 'Do końca czasu modlitwy została {n} minuta.',
      few: 'Do końca czasu modlitwy zostały {n} minuty.',
      many: 'Do końca czasu modlitwy zostało {n} minut.',
      other: 'Do końca czasu modlitwy zostało {n} minuty.',
    }),
  },
  geceCapasi: {
    baslik: '{ad} · odpraw przed snem ⏰',
    govde: 'Cisza nocna zaczyna się za {dk} min; odpraw Isza, zanim pójdziesz spać.',
  },
  icerik: {
    firsat: 'Czasu zaczyna brakować; odprawiaj modlitwę, póki masz okazję.',
    sonaBirakma: 'Nie zostawiaj modlitwy na koniec; teraz jest dobry moment na modlitwę.',
    fisilti: 'Nie mów „pomodlę się później”; czas prawie minął, możesz odprawić modlitwę teraz.',
    omur: 'Czas mija; wciąż możesz odprawić tę modlitwę w jej czasie.',
    keske: 'Wstań teraz, zamiast za kilka minut mówić „gdybym tylko”.',
    namazaDur: 'Jeśli modlitwa jest odprawiona, dotknij „Odprawiono”; jeśli nie, stań do modlitwy teraz.',
    sonDakika: 'Ostatnie minuty. Odłóż to, co robisz, i stań do modlitwy.',
  },
};
