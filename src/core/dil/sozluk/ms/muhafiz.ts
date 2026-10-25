import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Seruan ibadah dalam bahasa Melayu: arahan ringkas dan langsung, tetap "anda". Ungkapan
 * sujud TIDAK ditulis (kembar larangan "secdeye kapan") → "dirikan solat". Unit dalam tajuk
 * "m": "Maghrib · 655m" muat dalam 16 aksara pertama.
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: '{ad} · {dk}m berlalu · sudah masuk waktu ⏰',
    giris2: '{ad} · {dk}m berlalu · jangan lengahkan solat ⚠️',
    giris3: '{ad} · {dk}m berlalu · solat anda menanti 🔥',
    giris4: '{ad} · {dk}m berlalu · DIRIKAN SOLAT 🚨',
    erken3: '{ad} · {dk}m lagi · solat anda menanti 🔥',
    erken4: '{ad} · {dk}m lagi · DIRIKAN SOLAT 🚨',
    cikis1: '{ad} · {dk}m lagi ⏰',
    cikis2: '{ad} · {dk}m · waktu semakin suntuk ⚠️',
    cikis3: '{ad} · {dk}m · waktu hampir terlepas 🔥',
    cikis4: '{ad} · {dk}m · WAKTU HAMPIR TAMAT 🚨',
  },
  girisHavuzu: {
    s1: ['Telah masuk waktu solat; tunaikan selagi ada peluang.', 'Tunaikan selagi waktu masih memihak kepada anda; jangan tangguhkan.'],
    s2: ['Semakin ditangguh, semakin berat; jangan biarkan solat anda ke saat akhir.', 'Waktu terus berjalan — tunaikan solat sekarang.'],
    s3: [
      'Semakin anda lengahkan, semakin hampir anda terlepas; tunaikan sekarang.',
      'Jangan kata "nanti saya solat"; anda boleh solat sekarang.',
      'Bangunlah sekarang daripada berkata "kalaulah" beberapa minit lagi.',
    ],
    s4: ['Jangan lengahkan solat lagi — dirikan solat sekarang.', 'Tinggalkan apa yang sedang anda lakukan, dan dirikan solat.'],
  },
  govde: {
    s1: 'Waktu mula suntuk; tunaikan selagi ada peluang.',
    s2: 'Jangan biarkan solat anda ke saat akhir; sekarang masa yang sesuai untuk solat.',
    s3: 'Waktu hampir tamat; anda masih boleh solat sekarang.',
    s4: 'Jika sudah solat, ketik "Sudah solat"; jika belum, dirikan solat sekarang.',
  },
  serit: {
    giris4: 'JANGAN LENGAHKAN SOLAT. Dirikan solat sekarang. ({dk} min berlalu)',
    giris2: 'Waktu terus berjalan; jangan biarkan solat anda ke saat akhir. ({dk} min berlalu)',
    giris1: cogul({ other: '{n} minit telah berlalu sejak masuk waktu solat.' }),
    erken4: 'Jangan lengahkan solat; dirikan solat sekarang. ({dk} min lagi)',
    cikis4: 'WAKTU HAMPIR TAMAT. Dirikan solat sekarang. ({dk} min lagi)',
    cikis2: 'Waktu semakin suntuk; jangan biarkan solat anda ke saat akhir. ({dk} min lagi)',
    cikis1: cogul({ other: '{n} minit lagi waktu solat tamat.' }),
  },
  geceCapasi: {
    baslik: '{ad} · solat sebelum tidur ⏰',
    govde: 'Waktu senyap malam bermula dalam {dk} min; tunaikan solat Isyak sebelum tidur.',
  },
  icerik: {
    firsat: 'Waktu mula suntuk; tunaikan selagi ada peluang.',
    sonaBirakma: 'Jangan biarkan solat anda ke saat akhir; sekarang masa yang sesuai untuk solat.',
    fisilti: 'Jangan kata "nanti saya solat"; waktu hampir tamat, anda boleh solat sekarang.',
    omur: 'Waktu terus berlalu; anda masih berpeluang menunaikan solat ini dalam waktunya.',
    keske: 'Bangunlah sekarang daripada berkata "kalaulah" beberapa minit lagi.',
    namazaDur: 'Jika sudah solat, ketik "Sudah solat"; jika belum, dirikan solat sekarang.',
    sonDakika: 'Minit-minit terakhir. Tinggalkan apa yang sedang anda lakukan, dan dirikan solat.',
  },
};
