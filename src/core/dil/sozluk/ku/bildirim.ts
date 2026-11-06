import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ Min nimêj kir', kazayaEkle: 'Bixin qezayê', inceleyin: 'Binêrin' },
  kanal: {
    genel: 'Agahdariyên giştî',
    muhafiz: 'Parêzvanê Nimêjê',
    muhafizAciklama: 'Bîranînên dema nimêjê',
    acil: 'Bîranîna bilez a nimêjê',
    acilAciklama: 'Dema nimêjê li ber qedandinê ye - bîranînên bilez',
    vakit: 'Demên nimêjê',
    vakitAciklama: 'Bîranînên ku gava dema nimêjê dest pê dike têne şandin',
    muhafizSes: 'Parêzvanê Nimêjê · {ses}',
    acilSes: 'Bîranîna bilez · {ses}',
    acilSesAciklama: 'Dema nimêjê li ber qedandinê ye — bîranînên bilez',
    titresimli: '{kanal} · Bi lerzê',
    alarm: 'Alarma nimêjê',
    alarmSes: 'Alarma nimêjê · {ses}',
    uygulamaSesi: 'Dengê sepanê',
    seciliSes: 'Dengê ku we hilbijart',
  },
  cuma: {
    baslik: 'Înî · {sure} ma · nimêj nêz e',
    govdeIlk: 'Heta Nîvro {sure} ma. Xwe amade bike û here mizgeftê.',
    govde: 'Heta Nîvro {sure} ma. Here mizgeftê.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · {dk}d heta ezanê · ji bo mizgeftê amade bibe',
    hazirlanGovde: 'Ji bo ku tu {ad} li mizgeftê bigihînî amade bibe; piştî {sonra} deqîqe derkeve — ezan piştî {dk} deqîqe.',
    yolaCikBaslik: '{ad} · {dk}d heta ezanê · here mizgeftê',
    yolaCikGovde: 'Ji bo ku tu {ad} bigihînî here mizgeftê — ezan piştî {dk} deqîqe.',
  },
  takvim: {
    etkinlikTek: '“{ad}”',
    etkinlikCoklu: cogul({ one: '{n} bûyer di salnameya te de', other: '{n} bûyerên li pey hev di salnameya te de' }),
    etkinlikBir: 'Bûyereke di salnameya te de',
    sonAnIkindi: 'dema guncaw a dawî ji bo Esirê {saat} e (piştî wê mekrûh e)',
    sonAnVakit: 'dema {kucuk} di {saat} de diqede',
    onceBaslik: '{ad} · bûyer di {saat} de · pêşî nimêja xwe bike',
    onceGovde: '{etkinlik} {aralik} didome; {sonAn}. Berî ku bûyer dest pê bike nimêja {kucuk} bike.',
    kaplarBaslik: '{ad} · bûyerek dema nimêjê digire',
    kaplarGovde:
      '{etkinlik} {aralik} didome û dema {kucuk} ({giris}–{son}) digire. Niha plan bike ku navberek kurt bidî û nimêja {kucuk} bikî.',
  },
  yatis: {
    yatsiBaslik: '{ad} · berî razanê nimêja xwe bike 🌙',
    yatsiGovde: 'Dema {ad} hîn didome; berî ku xew te bibe rabe nimêjê.',
    ozet: 'Îro {kilinan}/5 · {liste} nehatine nîşankirin',
    tekOto: 'Heke we kiribe, nîşan bikin. {oto}',
    tekKaza: 'Heke we kiribe, nîşan bikin; heke we nekaribû, li Deftera qezayê zêde bikin.',
    tekSuruyor: 'Heke we kiribe, nîşan bikin. Dema nimêjê hîn didome.',
    cokluOto: 'Sepanê vekin da ku nimêjên ku we kirine binêrin û nîşan bikin. {oto}',
    coklu: 'Sepanê vekin da ku nimêjên ku we kirine binêrin û nîşan bikin.',
    otoSor: 'Heke hûn wan nîşan nekin, dê di Deftera qezayê de li ser vê rojê ji we bê pirsîn.',
    otoEkle: 'Heke hûn wan nîşan nekin, gava roja nimêjê biqede dê li qezayê bên zêdekirin.',
  },
  gunSonu: {
    baslik: 'Îro temam nebûye · zincîr',
    govde: 'Heke hûn berî dawiya rojê nimêjên ku we kirine nîşan bikin, zincîra we didome.',
  },
};
