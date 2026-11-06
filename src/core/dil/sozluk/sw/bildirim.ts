import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ Nimeswali', kazayaEkle: 'Ongeza kwenye Qadha', inceleyin: 'Kagua' },
  kanal: {
    genel: 'Arifa za jumla',
    muhafiz: 'Mlinzi wa Swala',
    muhafizAciklama: 'Vikumbusho vya nyakati za Swala',
    acil: 'Kikumbusho cha haraka cha Swala',
    acilAciklama: 'Wakati wa Swala unakaribia kuisha - vikumbusho vya haraka',
    vakit: 'Nyakati za Swala',
    vakitAciklama: 'Vikumbusho vinavyotumwa wakati wa Swala unapoingia',
    muhafizSes: 'Mlinzi wa Swala · {ses}',
    acilSes: 'Kikumbusho cha haraka · {ses}',
    acilSesAciklama: 'Wakati wa Swala unakaribia kuisha — vikumbusho vya haraka',
    titresimli: '{kanal} · Mtetemo',
    alarm: 'Kengele ya Swala',
    alarmSes: 'Kengele ya Swala · {ses}',
    uygulamaSesi: 'Sauti ya programu',
    seciliSes: 'Sauti uliyochagua',
  },
  cuma: {
    baslik: 'Ijumaa · zimebaki {sure} · Swala iko karibu',
    govdeIlk: '{sure} hadi Adhuhuri. Jitayarishe uende msikitini.',
    govde: '{sure} hadi Adhuhuri. Elekea msikitini.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · {dk}dk hadi Adhana · jitayarishe kwenda msikitini',
    hazirlanGovde: 'Jitayarishe kuiwahi {ad} msikitini; ondoka baada ya dakika {sonra} — Adhana baada ya dakika {dk}.',
    yolaCikBaslik: '{ad} · {dk}dk hadi Adhana · elekea msikitini',
    yolaCikGovde: 'Elekea msikitini ili kuiwahi {ad} — Adhana baada ya dakika {dk}.',
  },
  takvim: {
    etkinlikTek: '“{ad}”',
    etkinlikCoklu: cogul({ one: 'Tukio {n} katika kalenda yako', other: 'Matukio {n} yanayofuatana katika kalenda yako' }),
    etkinlikBir: 'Tukio katika kalenda yako',
    sonAnIkindi: 'wakati wa mwisho unaofaa kwa Alasiri ni {saat} (makruhu baada ya hapo)',
    sonAnVakit: 'wakati wa {kucuk} unaisha saa {saat}',
    onceBaslik: '{ad} · tukio saa {saat} · uswali kwanza',
    onceGovde: '{etkinlik} ni {aralik}; {sonAn}. Simamisha Swala ya {kucuk} kabla tukio halijaanza.',
    kaplarBaslik: '{ad} · tukio linafunika wakati wa Swala',
    kaplarGovde:
      '{etkinlik} ni {aralik} na linafunika wakati wa {kucuk} ({giris}–{son}). Panga sasa kupumzika kidogo na kuswali {kucuk}.',
  },
  yatis: {
    yatsiBaslik: '{ad} · uswali kabla ya kulala 🌙',
    yatsiGovde: 'Wakati wa {ad} bado unaendelea; simamisha Swala kabla ya kulala.',
    ozet: 'Leo {kilinan}/5 · {liste} hazijawekwa alama',
    tekOto: 'Kama umeiswali, iwekee alama. {oto}',
    tekKaza: 'Kama umeiswali, iwekee alama; kama hukuweza, iongeze kwenye Daftari lako la Qadha.',
    tekSuruyor: 'Kama umeiswali, iwekee alama. Wakati wa Swala bado unaendelea.',
    cokluOto: 'Fungua programu ukague na uweke alama Swala ulizoswali. {oto}',
    coklu: 'Fungua programu ukague na uweke alama Swala ulizoswali.',
    otoSor: 'Usipoziwekea alama, utaulizwa kuhusu siku hii katika Daftari la Qadha.',
    otoEkle: 'Usipoziwekea alama, zitaongezwa kwenye Qadha siku ya Swala ikiisha.',
  },
  gunSonu: {
    baslik: 'Leo haijakamilika · mfululizo',
    govde: 'Ukiweka alama Swala ulizoswali kabla siku haijaisha, mfululizo wako unaendelea.',
  },
};
