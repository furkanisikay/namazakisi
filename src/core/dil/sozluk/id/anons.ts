import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı: doğrudan, kısa emir ("tunaikan", "berangkatlah"); gerekirse "Anda".
 * "Sujud" eylem olarak yazılmaz. Sıra Türkçe şablonlarla BİREBİR eşleşir.
 */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'lagi', girisindenItibaren: 'berlalu' },
  cip: { vakit: 'Nama waktu', sure: 'Menit', yon: 'lagi / berlalu', cuma: 'Jumat', yatsi: 'Isya' },
  sablon: {
    muhafizCikis: [
      'Waktu {vakit} hampir habis, tinggal {süre} menit.',
      'Jangan lewatkan salat {vakit}, tinggal {süre} menit.',
      'Waktu makin sempit, {süre} menit lagi waktu {vakit} berakhir.',
    ],
    muhafizGiris: [
      'Waktu {vakit} sudah masuk, {süre} menit telah berlalu.',
      'Jangan tunda salat {vakit}, sudah {süre} menit berlalu.',
      'Waktu terus berjalan, tunaikan salat {vakit}, sudah {süre} menit.',
    ],
    nafile: [
      'Waktu {vakit}, {süre} menit {yön}. Saat yang baik untuk dua rakaat.',
      'Waktu {vakit} sedang berlangsung. Kesempatan yang baik untuk salat dua rakaat.',
      '{süre} menit {yön} untuk {vakit}.',
    ],
    cuma: [
      '{süre} menit lagi salat Jumat. Bersiaplah dan berangkat ke masjid.',
      'Waktu Jumat makin dekat, tinggal {süre} menit.',
      'Kejar khotbah, {süre} menit lagi salat Jumat.',
    ],
    camiyeGit: [
      '{süre} menit lagi waktu {vakit}. Berangkatlah ke masjid.',
      'Saatnya ke masjid, {süre} menit lagi waktu {vakit}.',
      'Berangkatlah ke masjid untuk salat {vakit}.',
    ],
    yatis: ['Tunaikan Isya sebelum tidur.', 'Waktu Isya masih berlangsung, tunaikan salat sebelum tidur.', 'Jangan tidur sebelum menunaikan Isya.'],
    takvim: [
      'Ada acara di kalender Anda yang bertepatan dengan waktu {vakit}.',
      'Waktu {vakit} bertabrakan dengan sebuah acara; jangan lupa salat terlebih dahulu.',
      '{süre} menit lagi waktu {vakit} bertabrakan dengan acara Anda; jangan lupa salat.',
    ],
  },
  otomatik: {
    cuma: '{sure} lagi menuju Dzuhur untuk salat Jumat. Bersiaplah dan berangkat ke masjid.',
    camiyeGiris: '{sure} lagi menuju waktu {vakit}.',
    camiyeHazirlan: 'Bersiaplah dan berangkat ke masjid.',
    camiyeYola: 'Berangkatlah ke masjid.',
    takvimGiris: 'Ada acara di kalender Anda yang bertepatan dengan waktu {vakit}.',
    takvimOnce: 'Jangan lupa salat sebelum acara.',
    takvimKaplar: 'Jangan lupa jeda sejenak untuk salat.',
    yatsi: 'Tunaikan Isya sebelum tidur.',
    muhasebeTek: '{vakit} hari ini tampaknya belum ditandai.',
    muhasebeCoklu: cogul({ other: '{n} waktu salat hari ini tampaknya belum ditandai.' }),
    geceCapasi: '{süre} menit lagi jam tenang dimulai. Tunaikan salat {vakit} sebelum tidur.',
    kuslukSuruyor: 'Waktu Dhuha sedang berlangsung.',
    kuslukGirdi: 'Waktu Dhuha sudah masuk. Saat yang baik untuk dua rakaat.',
    kuslukBitiyor: cogul({ other: '{n} menit lagi waktu Dhuha berakhir.' }),
    evvabinSuruyor: 'Waktu untuk Awwabin masih ada.',
    evvabinGirdi: 'Waktu Awwabin. Saat yang baik untuk dua rakaat.',
    evvabinKalan: cogul({ other: '{n} menit lagi untuk Awwabin.' }),
    teheccudSonUcte: 'Waktu Tahajud. Sepertiga malam terakhir sudah masuk.',
    teheccudKalan: cogul({ other: 'Waktu Tahajud. {n} menit lagi menuju Subuh.' }),
  },
};
