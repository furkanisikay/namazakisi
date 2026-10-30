import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Səsli oxuma: ibadətə çağırış "sən" + əmr; qısaltma yoxdur ("dəqiqə"). Sıra türkcə şablonlarla EYNİDİR. */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'qaldı', girisindenItibaren: 'keçdi' },
  cip: { vakit: 'Vaxtın adı', sure: 'Dəqiqə', yon: 'qaldı / keçdi', cuma: 'Cümə', yatsi: 'İşa' },
  sablon: {
    muhafizCikis: [
      '{vakit} vaxtı çıxır, son {süre} dəqiqə.',
      '{vakit} namazını qaçırma, {süre} dəqiqə qaldı.',
      'Vaxt daralır, {vakit} namazına {süre} dəqiqə.',
    ],
    muhafizGiris: [
      '{vakit} vaxtı daxil oldu, {süre} dəqiqə keçdi.',
      '{vakit} namazını gecikdirmə, {süre} dəqiqə keçdi.',
      'Vaxt irəliləyir, {vakit} namazına dur, {süre} dəqiqə oldu.',
    ],
    nafile: [
      '{vakit} vaxtı, {süre} dəqiqə {yön}. İki rükət üçün gözəl məqamdır.',
      '{vakit} vaxtı davam edir. İki rükət qılmaq üçün gözəl fürsətdir.',
      '{vakit} üçün {süre} dəqiqə {yön}.',
    ],
    cuma: [
      'Cümə namazına {süre} dəqiqə qaldı. Hazırlaş, məscidə yola düş.',
      'Cümə vaxtı yaxınlaşır, {süre} dəqiqə qaldı.',
      'Xütbəyə çat, cüməyə {süre} dəqiqə qaldı.',
    ],
    camiyeGit: [
      '{vakit} vaxtına {süre} dəqiqə qaldı. Məscidə yola düş.',
      'Məscidə getmək vaxtıdır, {vakit} vaxtına {süre} dəqiqə var.',
      '{vakit} namazı üçün məscidə yola düş.',
    ],
    yatis: ['Yatmazdan əvvəl işa namazını qıl.', 'İşa vaxtı davam edir, yatmazdan əvvəl namaza dur.', 'İşa namazını qılmadan yatma.'],
    takvim: [
      'Təqviminizdəki bir tədbir {vakit} vaxtına düşür.',
      '{vakit} vaxtı bir tədbirlə üst-üstə düşür; əvvəlcə namazı qılmağı unutmayın.',
      '{süre} dəqiqə sonra {vakit} vaxtı tədbirinizlə üst-üstə düşür; namazı unutmayın.',
    ],
  },
  otomatik: {
    cuma: 'Cümə üçün zöhr vaxtına {sure} qaldı. Hazırlaş, məscidə yola düş.',
    camiyeGiris: '{vakit} vaxtına {sure} qaldı.',
    camiyeHazirlan: 'Hazırlaş, məscidə yola düş.',
    camiyeYola: 'Məscidə yola düş.',
    takvimGiris: 'Təqviminizdəki bir tədbir {vakit} vaxtına düşür.',
    takvimOnce: 'Tədbirdən əvvəl namazı qılmağı unutmayın.',
    takvimKaplar: 'Fasilə verib namazı qılmağı unutmayın.',
    yatsi: 'Yatmazdan əvvəl işa namazını qıl.',
    muhasebeTek: 'Bu gün {vakit} vaxtı qeyd olunmamış görünür.',
    muhasebeCoklu: cogul({ one: 'Bu gün {n} vaxt qeyd olunmamış görünür.', other: 'Bu gün {n} vaxt qeyd olunmamış görünür.' }),
    geceCapasi: 'Gecə sakitliyinə {süre} dəqiqə qalıb. Yatmazdan əvvəl {vakit} namazını qıl.',
    kuslukSuruyor: 'Duha vaxtı davam edir.',
    kuslukGirdi: 'Duha vaxtı daxil oldu. İki rükət üçün gözəl məqamdır.',
    kuslukBitiyor: cogul({ one: 'Duha vaxtının bitməsinə {n} dəqiqə qalıb.', other: 'Duha vaxtının bitməsinə {n} dəqiqə qalıb.' }),
    evvabinSuruyor: 'Əvvabin üçün vaxt davam edir.',
    evvabinGirdi: 'Əvvabin vaxtıdır. İki rükət üçün gözəl məqamdır.',
    evvabinKalan: cogul({ one: 'Əvvabin üçün {n} dəqiqə qalıb.', other: 'Əvvabin üçün {n} dəqiqə qalıb.' }),
    teheccudSonUcte: 'Təhəccüd vaxtıdır. Gecənin son üçdə biri daxil oldu.',
    teheccudKalan: cogul({ one: 'Təhəccüd vaxtıdır. Sübhə {n} dəqiqə qalıb.', other: 'Təhəccüd vaxtıdır. Sübhə {n} dəqiqə qalıb.' }),
  },
};
