import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Język · Language',
  aciklama: 'Wybierz język aplikacji. Używają go też powiadomienia i odczytywanie na głos.',
  grup: 'Język aplikacji',
  dilAdlari: { tr: 'Turecki', en: 'Angielski', id: 'Indonezyjski', de: 'Niemiecki', fr: 'Francuski', bs: 'Bośniacki', ru: 'Rosyjski', ms: 'Malajski', ar: 'Arabski', ur: 'Urdu', es: 'Hiszpański', nl: 'Niderlandzki', sq: 'Albański', hi: 'Hindi', bn: 'Bengalski', fa: 'Perski', ps: 'Paszto', ckb: 'Sorani', ug: 'Ujgurski', az: 'Azerbejdżański', uz: 'Uzbecki', kk: 'Kazachski', ky: 'Kirgiski', tg: 'Tadżycki', sw: 'Suahili', ha: 'Hausa', am: 'Amharski', om: 'Oromo', so: 'Somalijski', ff: 'Fulani', yo: 'Joruba', zh: 'Chiński uproszczony', ta: 'Tamilski', ml: 'Malajalam', th: 'Tajski', ko: 'Koreański', vi: 'Wietnamski', pt: 'Portugalski', it: 'Włoski', sv: 'Szwedzki', uk: 'Ukraiński', ro: 'Rumuński', hr: 'Chorwacki', sr: 'Serbski', el: 'Grecki', ku: 'Kurdyjski (Kurmancî)', tk: 'Turkmeński', tt: 'Tatarski', sd: 'Sindhi', pl: 'Polski', ja: 'Japoński', gu: 'Gudżarati', bg: 'Bułgarski', mk: 'Macedoński', fil: 'Filipiński', te: 'Telugu', kn: 'Kannada', mr: 'Marathi', pa: 'Pendżabski (arabskie, Pakistan)', as: 'Asamski', ne: 'Nepalski', si: 'Syngaleski', km: 'Khmerski', he: 'Hebrajski', ka: 'Gruziński', lt: 'Litewski', mg: 'Malgaski', lg: 'Ganda', rw: 'Kinya-ruanda', rn: 'Rundi', ln: 'Lingala', dag: 'Dagbani', mos: 'Mossi', aa: 'Afar', mdh: 'Maguindanao', ak: 'Akan', ceb: 'Cebuański', nqo: 'N’ko' },
  cihazDili: 'Język urządzenia',
  cihazDiliKullaniliyor: 'Obecnie: {ad}',
  cihazDiliDesteklenmiyor: 'Język urządzenia nie jest jeszcze dostępny; używany jest turecki.',
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'Tłumaczenia w wersji beta są sprawdzane; niektóre teksty mogą być niedoskonałe.',
    vakit: 'Język nie zmienia sposobu obliczania czasów modlitw.',
    nass: 'W językach innych niż turecki pokazywane są tylko wersety Koranu; teksty hadisów pochodzą ze źródła tureckiego, dlatego nie są pokazywane.',
  },
  ozelAnons: {
    baslik: 'Własne teksty do odczytu',
    govde: cogul({
      one: '{n} własny tekst do odczytu jest nadal w poprzednim języku. Zastąpić go gotowym tekstem w nowym języku?',
      few: '{n} własne teksty do odczytu są nadal w poprzednim języku. Zastąpić je gotowymi tekstami w nowym języku?',
      many: '{n} własnych tekstów do odczytu jest nadal w poprzednim języku. Zastąpić je gotowymi tekstami w nowym języku?',
      other: '{n} własnego tekstu do odczytu jest nadal w poprzednim języku. Zastąpić je gotowymi tekstami w nowym języku?',
    }),
    degistir: 'Zastąp gotowym tekstem',
    koru: 'Zostaw bez zmian',
    degisti: cogul({ one: 'Zastąpiono {n} tekst.', few: 'Zastąpiono {n} teksty.', many: 'Zastąpiono {n} tekstów.', other: 'Zastąpiono {n} tekstu.' }),
  },
  vakitAdlari: {
    baslik: 'Nazwy modlitw',
    aciklama: 'Wybierz, jak nazywane są czasy modlitw.',
    otomatik: 'Według kraju',
    otomatikAciklama: 'Używane są nazwy przyjęte w kraju Twojej lokalizacji.',
    takimlar: { temel: 'Nazwy arabskie', diyanetDe: 'Diyanet (niemiecki)', turkce: 'Nazwy tureckie', magrip: 'Pisownia maghrebska', cezayir: 'Pisownia algierska', afgan: 'Nazwy afgańskie' },
  },
  yazi: {
    baslik: 'Alfabet',
    aciklama: 'Wybierz alfabet, którym zapisywany jest tekst.',
    otomatik: 'Według kraju',
    otomatikAciklama: 'Używany jest alfabet przyjęty w kraju Twojej lokalizacji.',
    latin: 'Alfabet łaciński',
    kiril: 'Cyrylica',
  },
  kaydedilemedi: 'Nie udało się zapisać języka. Spróbuj ponownie.',
  sihirbazBaglantisi: 'Język · Language',
  sihirbazBaglantisiAciklama: 'Zmień język aplikacji',
};
