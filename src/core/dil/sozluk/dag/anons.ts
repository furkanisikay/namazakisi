import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı: doğrudan, kısa, mealin saygılı çoğul emri ("Puhimi ya jiŋli", 2:43);
 * secde yok. Dagbanide sayı ismin ardından gelir ("minti {süre}"). Sıra Türkçe şablonlarla BİREBİR.
 */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'n-kpalim', girisindenItibaren: 'gari' },
  cip: { vakit: 'Jiŋli yuli', sure: 'Minti', yon: 'kpalim / gari', cuma: 'Alizumma', yatsi: 'Isha’i' },
  sablon: {
    muhafizCikis: [
      '{vakit} saha ni naai, minti {süre} n-kpalim.',
      'Di chɛ ya ka {vakit} gari ya, minti {süre} n-kpalim.',
      'Saha bi lahi waɣi, minti {süre} pɔi ka {vakit} naai.',
    ],
    muhafizGiris: [
      '{vakit} saha paaya, minti {süre} gari.',
      'Di chɛ ya ka {vakit} yuui, minti {süre} gari.',
      'Saha chani, zanimi ya {vakit} zuɣu, minti {süre} gari.',
    ],
    nafile: [
      '{vakit} saha, minti {süre} {yön}. Saha suŋ n-ti rakaa ayi.',
      '{vakit} saha beni. Saha suŋ ka yi puhi rakaa ayi.',
      'Minti {süre} {yön} n-ti {vakit}.',
    ],
    cuma: [
      'Minti {süre} n-kpalim pɔi ka Alizumma paai. Kpaŋsimi ya yi maŋa ka chaŋ jiŋli ni.',
      'Alizumma miriya, minti {süre} n-kpalim.',
      'Nyami ya hutuba maa, minti {süre} n-kpalim pɔi ka Alizumma paai.',
    ],
    camiyeGit: [
      'Minti {süre} n-kpalim pɔi ka {vakit} paai. Chaŋmi ya jiŋli ni.',
      'Saha paaya ni yi chaŋ jiŋli ni, minti {süre} pɔi ka {vakit} paai.',
      'Chaŋmi ya jiŋli ni n-ti {vakit}.',
    ],
    yatis: ['Puhimi ya Isha’i pɔi ka yi gbihi.', 'Isha’i saha na beni, zanimi ya jiŋli pɔi ka yi gbihi.', 'Di gbihi ya pɔi ka yi puhi Isha’i.'],
    takvim: [
      'Yɛli shɛli yi kalɛnda ni niŋdi {vakit} saha puuni.',
      '{vakit} saha mini yɛli shɛli laɣimya; di tam ya ni yi puhi tooni.',
      'Minti {süre} puuni {vakit} saha ni laɣim ni yi yɛli; di tam ya yi jiŋli.',
    ],
  },
  otomatik: {
    cuma: '{sure} n-kpalim pɔi ka Azafari paai n-ti Alizumma. Kpaŋsimi ya yi maŋa ka chaŋ jiŋli ni.',
    camiyeGiris: '{sure} n-kpalim pɔi ka {vakit} paai.',
    camiyeHazirlan: 'Kpaŋsimi ya yi maŋa ka chaŋ jiŋli ni.',
    camiyeYola: 'Chaŋmi ya jiŋli ni.',
    takvimGiris: 'Yɛli shɛli yi kalɛnda ni niŋdi {vakit} saha puuni.',
    takvimOnce: 'Di tam ya ni yi puhi pɔi ka yɛli maa piligi.',
    takvimKaplar: 'Di tam ya ni yi vuhi saha biɛla ka puhi.',
    yatsi: 'Puhimi ya Isha’i pɔi ka yi gbihi.',
    muhasebeTek: 'Bɛ bi dalim {vakit} zuŋɔ.',
    muhasebeCoklu: cogul({ one: 'Bɛ bi dalim jiŋa {n} zuŋɔ.', other: 'Bɛ bi dalim jiŋa {n} zuŋɔ.' }),
    geceCapasi: 'Kukoli kani saha ni piligi minti {süre} puuni. Puhimi ya {vakit} pɔi ka yi gbihi.',
    kuslukSuruyor: 'Duha saha beni.',
    kuslukGirdi: 'Duha saha paaya. Saha suŋ n-ti rakaa ayi.',
    kuslukBitiyor: cogul({ one: 'Minti {n} n-kpalim Duha saha ni.', other: 'Minti {n} n-kpalim Duha saha ni.' }),
    evvabinSuruyor: 'Saha na be n-ti Awwabin.',
    evvabinGirdi: 'Awwabin saha. Saha suŋ n-ti rakaa ayi.',
    evvabinKalan: cogul({ one: 'Minti {n} n-kpalim n-ti Awwabin.', other: 'Minti {n} n-kpalim n-ti Awwabin.' }),
    teheccudSonUcte: 'Tahajud saha. Yuŋ pirigili din bahi piligiya.',
    teheccudKalan: cogul({ one: 'Tahajud saha. Minti {n} n-kpalim pɔi ka Subaahi paai.', other: 'Tahajud saha. Minti {n} n-kpalim pɔi ka Subaahi paai.' }),
  },
};
