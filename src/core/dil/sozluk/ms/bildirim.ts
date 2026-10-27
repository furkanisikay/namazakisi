import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ Sudah solat', kazayaEkle: 'Tambah ke qada', inceleyin: 'Semak' },
  kanal: {
    genel: 'Pemberitahuan umum',
    muhafiz: 'Penjaga Solat',
    muhafizAciklama: 'Peringatan waktu solat',
    acil: 'Peringatan solat segera',
    acilAciklama: 'Waktu solat hampir tamat - peringatan segera',
    vakit: 'Waktu solat',
    vakitAciklama: 'Peringatan yang dihantar apabila masuk waktu solat',
    muhafizSes: 'Penjaga Solat · {ses}',
    acilSes: 'Peringatan segera · {ses}',
    acilSesAciklama: 'Waktu solat hampir tamat — peringatan segera',
    titresimli: '{kanal} · Bergetar',
    alarm: 'Penggera solat',
    alarmSes: 'Penggera solat · {ses}',
    uygulamaSesi: 'Bunyi aplikasi',
    seciliSes: 'Bunyi pilihan anda',
  },
  cuma: {
    baslik: 'Jumaat · {sure} lagi · solat semakin hampir',
    govdeIlk: '{sure} lagi masuk waktu Zohor. Bersiaplah dan pergi ke masjid.',
    govde: '{sure} lagi masuk waktu Zohor. Pergilah ke masjid.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · {dk}m lagi azan · bersiap ke masjid',
    hazirlanGovde: 'Bersiaplah untuk solat {ad} di masjid; bertolak dalam {sonra} min — azan dalam {dk} min.',
    yolaCikBaslik: '{ad} · {dk}m lagi azan · pergi ke masjid',
    yolaCikGovde: 'Pergilah ke masjid untuk solat {ad} — azan dalam {dk} min.',
  },
  takvim: {
    etkinlikTek: '“{ad}”',
    etkinlikCoklu: cogul({ other: '{n} acara berturut-turut dalam kalendar anda' }),
    etkinlikBir: 'Satu acara dalam kalendar anda',
    sonAnIkindi: 'masa terakhir yang sesuai untuk Asar ialah {saat} (selepas itu waktu makruh)',
    sonAnVakit: 'waktu {kucuk} tamat pada {saat}',
    onceBaslik: '{ad} · acara {saat} · solat dahulu',
    onceGovde: '{etkinlik} berlangsung {aralik}; {sonAn}. Tunaikan solat {kucuk} sebelum acara bermula.',
    kaplarBaslik: '{ad} · acara meliputi waktu solat',
    kaplarGovde:
      '{etkinlik} berlangsung {aralik} dan meliputi waktu {kucuk} ({giris}–{son}). Rancang dari sekarang untuk berhenti sebentar dan menunaikan solat {kucuk}.',
  },
  yatis: {
    yatsiBaslik: '{ad} · solat sebelum tidur 🌙',
    yatsiGovde: 'Waktu {ad} masih ada; dirikan solat sebelum anda tertidur.',
    ozet: 'Hari ini {kilinan}/5 · {liste} belum ditandakan',
    tekOto: 'Jika sudah ditunaikan, tandakannya. {oto}',
    tekKaza: 'Jika sudah ditunaikan, tandakannya; jika tidak sempat, tambahkan ke Catatan Qada anda.',
    tekSuruyor: 'Jika sudah ditunaikan, tandakannya. Waktunya masih ada.',
    cokluOto: 'Buka aplikasi untuk menyemak dan menandakan solat yang telah anda tunaikan. {oto}',
    coklu: 'Buka aplikasi untuk menyemak dan menandakan solat yang telah anda tunaikan.',
    otoSor: 'Jika tidak ditandakan, anda akan ditanya tentang hari ini dalam Catatan Qada.',
    otoEkle: 'Jika tidak ditandakan, solat itu akan ditambah ke qada apabila hari solat tamat.',
  },
  gunSonu: {
    baslik: 'Hari ini belum lengkap · rentetan',
    govde: 'Jika anda menandakan solat yang telah ditunaikan sebelum hari tamat, rentetan anda berterusan.',
  },
};
