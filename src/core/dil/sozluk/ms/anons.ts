import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Seruan ibadah: langsung, ringkas, tetap "anda"; tiada ungkapan sujud. Susunan SAMA dengan templat Turki. */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'lagi', girisindenItibaren: 'telah berlalu' },
  cip: { vakit: 'Nama waktu', sure: 'Minit', yon: 'lagi / telah berlalu', cuma: 'Jumaat', yatsi: 'Isyak' },
  sablon: {
    muhafizCikis: [
      'Waktu {vakit} hampir tamat, tinggal {süre} minit.',
      'Jangan terlepas solat {vakit}, tinggal {süre} minit.',
      'Waktu semakin suntuk, {süre} minit lagi waktu {vakit} tamat.',
    ],
    muhafizGiris: [
      'Telah masuk waktu {vakit}, sudah {süre} minit berlalu.',
      'Jangan lengahkan solat {vakit}, sudah {süre} minit berlalu.',
      'Waktu terus berjalan, dirikan solat {vakit}, sudah {süre} minit.',
    ],
    nafile: [
      'Waktu {vakit}, {süre} minit {yön}. Saat yang baik untuk dua rakaat.',
      'Waktu {vakit} masih ada. Peluang yang baik untuk solat dua rakaat.',
      '{süre} minit {yön} untuk {vakit}.',
    ],
    cuma: [
      '{süre} minit lagi solat Jumaat. Bersiaplah dan pergi ke masjid.',
      'Waktu Jumaat semakin hampir, tinggal {süre} minit.',
      'Sempatkan khutbah, {süre} minit lagi solat Jumaat.',
    ],
    camiyeGit: [
      '{süre} minit lagi masuk waktu {vakit}. Pergilah ke masjid.',
      'Masa untuk ke masjid, {süre} minit lagi masuk waktu {vakit}.',
      'Pergilah ke masjid untuk solat {vakit}.',
    ],
    yatis: [
      'Tunaikan solat Isyak sebelum tidur.',
      'Waktu Isyak masih ada, dirikan solat sebelum anda tidur.',
      'Jangan tidur sebelum menunaikan solat Isyak.',
    ],
    takvim: [
      'Satu acara dalam kalendar anda jatuh pada waktu {vakit}.',
      'Waktu {vakit} bertembung dengan satu acara; jangan lupa solat dahulu.',
      'Dalam {süre} minit lagi, waktu {vakit} bertembung dengan acara anda; jangan lupa solat.',
    ],
  },
  otomatik: {
    cuma: '{sure} lagi masuk waktu Zohor untuk solat Jumaat. Bersiaplah dan pergi ke masjid.',
    camiyeGiris: '{sure} lagi masuk waktu {vakit}.',
    camiyeHazirlan: 'Bersiaplah dan pergi ke masjid.',
    camiyeYola: 'Pergilah ke masjid.',
    takvimGiris: 'Satu acara dalam kalendar anda jatuh pada waktu {vakit}.',
    takvimOnce: 'Jangan lupa solat sebelum acara itu.',
    takvimKaplar: 'Jangan lupa berhenti sebentar untuk solat.',
    yatsi: 'Tunaikan solat Isyak sebelum tidur.',
    muhasebeTek: 'Solat {vakit} hari ini nampaknya belum ditandakan.',
    muhasebeCoklu: cogul({ other: '{n} waktu solat hari ini nampaknya belum ditandakan.' }),
    geceCapasi: 'Waktu senyap malam bermula dalam {süre} minit. Tunaikan solat {vakit} sebelum tidur.',
    kuslukSuruyor: 'Waktu Dhuha masih ada.',
    kuslukGirdi: 'Telah masuk waktu Dhuha. Saat yang baik untuk dua rakaat.',
    kuslukBitiyor: cogul({ other: '{n} minit lagi waktu Dhuha tamat.' }),
    evvabinSuruyor: 'Masih ada masa untuk solat Awwabin.',
    evvabinGirdi: 'Waktu Awwabin. Saat yang baik untuk dua rakaat.',
    evvabinKalan: cogul({ other: '{n} minit lagi untuk solat Awwabin.' }),
    teheccudSonUcte: 'Waktu Tahajud. Sepertiga malam terakhir telah bermula.',
    teheccudKalan: cogul({ other: 'Waktu Tahajud. {n} minit lagi masuk waktu Subuh.' }),
  },
};
