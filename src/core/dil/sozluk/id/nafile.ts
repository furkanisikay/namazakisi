import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Dhuha', evvabin: 'Awwabin', teheccud: 'Tahajud' },
  kucuk: { kusluk: 'Dhuha', evvabin: 'Awwabin', teheccud: 'Tahajud' },
  aciklamalar: {
    kusluk:
      'Dimulai sekitar 45 menit setelah matahari terbit dan berlangsung hingga 10 menit sebelum Dzuhur. Isyraq adalah awal waktunya; yang paling utama setelah seperempat pertama siang berlalu.',
    evvabin: 'Ditunaikan setelah salat Maghrib, hingga masuk waktu Isya.',
    teheccud: 'Ditunaikan setelah tidur lalu bangun selepas Isya, hingga masuk waktu Subuh. Waktu paling utamanya adalah sepertiga malam terakhir.',
  },
  bilgiBugun: '{aciklama}\n\nHari ini: {bas} – {son}',
  enFaziletli: ' · paling utama setelah {saat}',
  sonUcteBir: ' · sepertiga terakhir {saat}',
  durumAktif: 'Sudah masuk waktu · berakhir {saat}',
  durumNafile: 'Salat sunah · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Waktu Dhuha',
    kuslukSuruyor: 'Waktu Dhuha sedang berlangsung; Anda bisa salat hingga pukul {son}.',
    kuslukGirdi: 'Waktu Dhuha sudah masuk. Saat yang baik untuk dua rakaat; waktunya hingga pukul {son}.',
    kuslukBitiyor: cogul({ other: '{n} menit lagi waktu Dhuha berakhir. Saat yang baik untuk dua rakaat; waktunya hingga pukul {son}.' }),
    evvabinBaslik: 'Awwabin',
    evvabinSuruyor: 'Waktu untuk Awwabin masih ada. Isya pukul {son}.',
    evvabinGirdi: 'Setelah salat Maghrib, saat yang baik untuk Awwabin. Isya pukul {son}.',
    evvabinKalan: cogul({ other: '{n} menit lagi untuk Awwabin. Isya pukul {son}.' }),
    teheccudBaslik: 'Waktu Tahajud',
    uyandirSonUcte: 'Bangunlah; sepertiga malam terakhir sudah masuk. Subuh pukul {son}.',
    uyandirKalan: cogul({ other: 'Bangunlah; {n} menit lagi menuju Subuh. Subuh pukul {son}.' }),
    sonUcteBaslik: 'Sepertiga malam terakhir',
    sonUcteGovde: 'Saat-saat paling berkah untuk Tahajud. Subuh pukul {son}.',
    teheccudKalan: cogul({ other: '{n} menit lagi menuju Subuh. Waktu yang baik untuk Tahajud.' }),
  },
  uyandirmaKanali: 'Bangun Tahajud',
  uyandirmaKanaliAciklama: 'Membangunkan Anda untuk salat malam; tetap berbunyi dalam mode senyap',
};
