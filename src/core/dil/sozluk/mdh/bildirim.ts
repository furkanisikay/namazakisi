import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ Midsambayang ako', kazayaEkle: 'Isulat sa qada', inceleyin: 'Ilay' },
  kanal: {
    genel: 'Manga notification',
    muhafiz: 'Bantay nu Sambayang',
    muhafizAciklama: 'Manga patadem nu waktu nu sambayang',
    acil: 'Patadem a madalian',
    acilAciklama: 'Malipus den su waktu nu sambayang - madalian a manga patadem',
    vakit: 'Manga waktu nu sambayang',
    vakitAciklama: 'Manga patadem a pedsugu amayka makawma su waktu nu sambayang',
    muhafizSes: 'Bantay nu Sambayang · {ses}',
    acilSes: 'Patadem a madalian · {ses}',
    acilSesAciklama: 'Malipus den su waktu nu sambayang — madalian a manga patadem',
    titresimli: '{kanal} · Vibrate',
    alarm: 'Alarm nu sambayang',
    alarmSes: 'Alarm nu sambayang · {ses}',
    uygulamaSesi: 'Suara nu app',
    seciliSes: 'Suara a napili nu',
  },
  cuma: {
    baslik: "Jum'at · {sure} pan · masiken den su sambayang",
    govdeIlk: '{sure} pan taman sa Dhuhur. Magkahanda kanu endu lumakaw sa masjid.',
    govde: '{sure} pan taman sa Dhuhur. Lumakaw kanu sa masjid.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · {dk}min sa bang · magkahanda sa masjid',
    hazirlanGovde: 'Magkahanda kanu para makasampay sa {ad} sa masjid; lumakaw sa {sonra} min — su bang sa {dk} min.',
    yolaCikBaslik: '{ad} · {dk}min sa bang · lumakaw sa masjid',
    yolaCikGovde: 'Lumakaw kanu sa masjid para makasampay sa {ad} — su bang sa {dk} min.',
  },
  takvim: {
    etkinlikTek: '“{ad}”',
    etkinlikCoklu: cogul({ one: '{n} a event sa kalendaryo nu', other: '{n} a magkasunud a event sa kalendaryo nu' }),
    etkinlikBir: 'Isa a event sa kalendaryo nu',
    sonAnIkindi: 'su ulyanan a mapya a waktu nu Asr na {saat} (makruh sa ulyan nin)',
    sonAnVakit: 'malipus su waktu nu {kucuk} sa {saat}',
    onceBaslik: '{ad} · event sa {saat} · edsambayang pan',
    onceGovde: '{etkinlik}: {aralik}; {sonAn}. Edsambayang kanu sa {kucuk} sa di pan magpamula su event.',
    kaplarBaslik: '{ad} · aden event sa waktu nu sambayang',
    kaplarGovde:
      '{etkinlik}: {aralik}, endu masakup nin su waktu nu {kucuk} ({giris}–{son}). Pasadan nu saguna i kapagtagak sa galebek para makasambayang sa {kucuk}.',
  },
  yatis: {
    yatsiBaslik: '{ad} · edsambayang sa di pan matulug 🌙',
    yatsiGovde: 'Waktu pan nu {ad}; tindeg kanu sa sambayang sa di pan matulug.',
    ozet: 'Saguna a gay {kilinan}/5 · {liste} a da natandaan',
    tekOto: 'Amayka nasambayang nu, tandaan nu. {oto}',
    tekKaza: 'Amayka nasambayang nu, tandaan nu; amayka da, isulat sa Listahan nu qada.',
    tekSuruyor: 'Amayka nasambayang nu, tandaan nu. Waktu pan nu sambayang.',
    cokluOto: 'Bukatan su app para ilayen endu tandaan su manga sambayang a nasambayang nu. {oto}',
    coklu: 'Bukatan su app para ilayen endu tandaan su manga sambayang a nasambayang nu.',
    otoSor: 'Amayka di nu tandaan, ipangeni sa lekanu su gay ini kanu Listahan nu qada.',
    otoEkle: 'Amayka di nu tandaan, isulat silan sa qada amayka malipus su gay nu sambayang.',
  },
  gunSonu: {
    baslik: 'Da pan nasampay saguna a gay · kasunud-sunud',
    govde: 'Amayka tandaan nu su manga sambayang a nasambayang nu sa di pan malipus su gay, ituluy su kasunud-sunud nu.',
  },
};
