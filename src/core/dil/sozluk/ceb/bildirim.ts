import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ Nag-ampo ko', kazayaEkle: 'Idugang sa qada', inceleyin: 'Susiha' },
  kanal: {
    genel: 'Kinatibuk-ang pahibalo',
    muhafiz: 'Bantay sa Salah',
    muhafizAciklama: 'Mga pahinumdom sa oras sa Salah',
    acil: 'Dinalian nga pahinumdom sa Salah',
    acilAciklama: 'Hapit na matapos ang oras sa Salah - dinalian nga mga pahinumdom',
    vakit: 'Mga oras sa Salah',
    vakitAciklama: 'Mga pahinumdom nga ipadala inig sulod sa oras sa Salah',
    muhafizSes: 'Bantay sa Salah · {ses}',
    acilSes: 'Dinalian nga pahinumdom · {ses}',
    acilSesAciklama: 'Hapit na matapos ang oras sa Salah — dinalian nga mga pahinumdom',
    titresimli: '{kanal} · Nagkurog',
    alarm: 'Alarm sa Salah',
    alarmSes: 'Alarm sa Salah · {ses}',
    uygulamaSesi: 'Tingog sa app',
    seciliSes: 'Ang tingog nga inyong gipili',
  },
  cuma: {
    baslik: "Jum'ah · {sure} pa · hapit na ang Salah",
    govdeIlk: '{sure} hangtod sa Dhuhr. Pangandam ug adto sa masjid.',
    govde: '{sure} hangtod sa Dhuhr. Adto na sa masjid.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · {dk}m sa adhan · pangandam sa masjid',
    hazirlanGovde: 'Pangandam aron maabtan ang {ad} sa masjid; lakaw sulod sa {sonra} min — adhan sulod sa {dk} min.',
    yolaCikBaslik: '{ad} · {dk}m sa adhan · adto na sa masjid',
    yolaCikGovde: 'Adto na sa masjid aron maabtan ang {ad} — adhan sulod sa {dk} min.',
  },
  takvim: {
    etkinlikTek: '“{ad}”',
    etkinlikCoklu: cogul({ one: '{n} ka sunod-sunod nga kalihokan sa inyong kalendaryo', other: '{n} ka sunod-sunod nga kalihokan sa inyong kalendaryo' }),
    etkinlikBir: 'Usa ka kalihokan sa inyong kalendaryo',
    sonAnIkindi: 'ang katapusang angay nga oras sa Asr mao ang {saat} (makruh human niana)',
    sonAnVakit: 'matapos ang oras sa {kucuk} sa {saat}',
    onceBaslik: '{ad} · kalihokan sa {saat} · mag-ampo una',
    onceGovde: 'Ang {etkinlik} molungtad sa {aralik}; {sonAn}. Mag-ampo sa {kucuk} una magsugod ang kalihokan.',
    kaplarBaslik: '{ad} · may kalihokan sa oras sa Salah',
    kaplarGovde:
      'Ang {etkinlik} molungtad sa {aralik} ug malukop niini ang oras sa {kucuk} ({giris}–{son}). Planoha karon ang mubong pahulay aron mag-ampo sa {kucuk}.',
  },
  yatis: {
    yatsiBaslik: '{ad} · mag-ampo una matulog 🌙',
    yatsiGovde: 'Nagpadayon pa ang oras sa {ad}; barog alang sa Salah una makatulog.',
    ozet: 'Karon {kilinan}/5 · wala mamarkahi: {liste}',
    tekOto: 'Kon nakaampo na kamo, markahi kini. {oto}',
    tekKaza: 'Kon nakaampo na kamo, markahi kini; kon wala, idugang kini sa inyong Listahan sa qada.',
    tekSuruyor: 'Kon nakaampo na kamo, markahi kini. Nagpadayon pa ang oras sa Salah.',
    cokluOto: 'Ablihi ang app aron susihon ug markahan ang mga Salah nga inyong nahimo. {oto}',
    coklu: 'Ablihi ang app aron susihon ug markahan ang mga Salah nga inyong nahimo.',
    otoSor: 'Kon dili ninyo markahan, pangutan-on kamo bahin niining adlawa sa Listahan sa qada.',
    otoEkle: 'Kon dili ninyo markahan, idugang kini sa qada inig katapos sa adlaw sa Salah.',
  },
  gunSonu: {
    baslik: 'Dili pa kompleto karong adlawa · sunod-sunod',
    govde: 'Kon markahan ninyo ang mga Salah nga inyong nahimo una matapos ang adlaw, magpadayon ang inyong sunod-sunod.',
  },
};
