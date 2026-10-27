import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Başlık önden okunur: nama waktu + durasi di 16 karakter pertama ("mnt" = menit). */
export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ Sudah salat', kazayaEkle: 'Tambah ke qada', inceleyin: 'Tinjau' },
  kanal: {
    genel: 'Notifikasi umum',
    muhafiz: 'Penjaga Salat',
    muhafizAciklama: 'Pengingat waktu salat',
    acil: 'Pengingat salat mendesak',
    acilAciklama: 'Waktu salat hampir habis - pengingat mendesak',
    vakit: 'Notifikasi waktu salat',
    vakitAciklama: 'Pengingat yang dikirim saat waktu salat tiba',
    muhafizSes: 'Penjaga Salat · {ses}',
    acilSes: 'Pengingat mendesak · {ses}',
    acilSesAciklama: 'Waktu salat hampir habis — pengingat mendesak',
    titresimli: '{kanal} · Bergetar',
    alarm: 'Alarm salat',
    alarmSes: 'Alarm salat · {ses}',
    uygulamaSesi: 'Suara aplikasi',
    seciliSes: 'Suara pilihan Anda',
  },
  cuma: {
    baslik: 'Jumat · {sure} lagi · salat makin dekat',
    govdeIlk: '{sure} lagi menuju Dzuhur. Bersiaplah dan berangkat ke masjid.',
    govde: '{sure} lagi menuju Dzuhur. Berangkatlah ke masjid.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · {dk} mnt ke azan · bersiap ke masjid',
    hazirlanGovde: 'Bersiaplah agar sempat salat {ad} di masjid; berangkat {sonra} mnt lagi — azan {dk} mnt lagi.',
    yolaCikBaslik: '{ad} · {dk} mnt ke azan · berangkat ke masjid',
    yolaCikGovde: 'Berangkatlah ke masjid agar sempat salat {ad} — azan {dk} mnt lagi.',
  },
  takvim: {
    etkinlikTek: '“{ad}”',
    etkinlikCoklu: cogul({ other: '{n} acara berturut-turut di kalender Anda' }),
    etkinlikBir: 'Sebuah acara di kalender Anda',
    sonAnIkindi: 'batas waktu yang baik untuk Ashar adalah {saat} (setelahnya makruh)',
    sonAnVakit: 'waktu {kucuk} berakhir pukul {saat}',
    onceBaslik: '{ad} · acara pukul {saat} · salat dulu',
    onceGovde: '{etkinlik} berlangsung {aralik}; {sonAn}. Tunaikan salat {kucuk} sebelum acara dimulai.',
    kaplarBaslik: '{ad} · acara menutupi waktu salat',
    kaplarGovde:
      '{etkinlik} berlangsung {aralik} dan menutupi waktu {kucuk} ({giris}–{son}). Rencanakan dari sekarang jeda singkat untuk menunaikan salat {kucuk}.',
  },
  yatis: {
    yatsiBaslik: '{ad} · salat sebelum tidur 🌙',
    yatsiGovde: 'Waktu {ad} masih berlangsung; tunaikan salat sebelum Anda terlelap.',
    ozet: 'Hari ini {kilinan}/5 · {liste} belum ditandai',
    tekOto: 'Jika sudah salat, tandai. {oto}',
    tekKaza: 'Jika sudah salat, tandai; jika belum sempat, tambahkan ke Catatan Qada Anda.',
    tekSuruyor: 'Jika sudah salat, tandai. Waktunya masih berlangsung.',
    cokluOto: 'Buka aplikasi untuk meninjau dan menandai salat yang sudah Anda tunaikan. {oto}',
    coklu: 'Buka aplikasi untuk meninjau dan menandai salat yang sudah Anda tunaikan.',
    otoSor: 'Jika tidak ditandai, hari ini akan ditanyakan kepada Anda di Catatan Qada.',
    otoEkle: 'Jika tidak ditandai, salat tersebut akan ditambahkan ke qada saat hari salat berakhir.',
  },
  gunSonu: {
    baslik: 'Hari ini belum lengkap · runtunan',
    govde: 'Jika Anda menandai salat yang sudah ditunaikan sebelum hari berakhir, runtunan Anda berlanjut.',
  },
};
