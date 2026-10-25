import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Dhuha', evvabin: 'Awwabin', teheccud: 'Tahajud' },
  kucuk: { kusluk: 'Dhuha', evvabin: 'Awwabin', teheccud: 'Tahajud' },
  aciklamalar: {
    kusluk:
      'Bermula kira-kira 45 minit selepas matahari terbit dan berterusan hingga 10 minit sebelum Zohor. Isyraq ialah waktunya yang terawal; yang paling afdal ialah selepas berlalu suku pertama siang.',
    evvabin: 'Ditunaikan selepas Maghrib, hingga masuk waktu Isyak.',
    teheccud: 'Ditunaikan selepas tidur dan bangun selepas Isyak, hingga masuk waktu Subuh. Waktu yang paling afdal ialah sepertiga malam terakhir.',
  },
  bilgiBugun: '{aciklama}\n\nHari ini: {bas} – {son}',
  enFaziletli: ' · paling afdal selepas {saat}',
  sonUcteBir: ' · sepertiga terakhir {saat}',
  durumAktif: 'Sudah masuk waktu · tamat {saat}',
  durumNafile: 'Sunat · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Waktu Dhuha',
    kuslukSuruyor: 'Waktu Dhuha masih ada; anda boleh solat hingga {son}.',
    kuslukGirdi: 'Telah masuk waktu Dhuha. Saat yang baik untuk dua rakaat; waktunya hingga {son}.',
    kuslukBitiyor: cogul({ other: '{n} minit lagi waktu Dhuha tamat. Saat yang baik untuk dua rakaat; waktunya hingga {son}.' }),
    evvabinBaslik: 'Awwabin',
    evvabinSuruyor: 'Masih ada masa untuk solat Awwabin. Isyak masuk pada {son}.',
    evvabinGirdi: 'Selepas Maghrib, saat yang baik untuk solat Awwabin. Isyak masuk pada {son}.',
    evvabinKalan: cogul({ other: '{n} minit lagi untuk solat Awwabin. Isyak masuk pada {son}.' }),
    teheccudBaslik: 'Waktu Tahajud',
    uyandirSonUcte: 'Bangunlah; sepertiga malam terakhir telah bermula. Subuh masuk pada {son}.',
    uyandirKalan: cogul({ other: 'Bangunlah; {n} minit lagi masuk waktu Subuh. Subuh masuk pada {son}.' }),
    sonUcteBaslik: 'Sepertiga malam terakhir',
    sonUcteGovde: 'Saat-saat paling berkat untuk Tahajud. Subuh masuk pada {son}.',
    teheccudKalan: cogul({ other: '{n} minit lagi masuk waktu Subuh. Waktu yang baik untuk Tahajud.' }),
  },
  uyandirmaKanali: 'Kejutan Tahajud',
  uyandirmaKanaliAciklama: 'Mengejutkan anda untuk solat malam; tetap berbunyi dalam mod senyap',
};
