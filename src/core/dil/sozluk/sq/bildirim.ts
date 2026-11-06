import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ E fala', kazayaEkle: 'Shtoni te kazatë', inceleyin: 'Shqyrtoni' },
  kanal: {
    genel: 'Njoftime të përgjithshme',
    muhafiz: 'Rojtari i namazit',
    muhafizAciklama: 'Kujtesa për kohët e namazit',
    acil: 'Kujtesë urgjente për namaz',
    acilAciklama: 'Koha e namazit po del - kujtesa urgjente',
    vakit: 'Kohët e namazit',
    vakitAciklama: 'Kujtesa që dërgohen kur hyn koha e namazit',
    muhafizSes: 'Rojtari i namazit · {ses}',
    acilSes: 'Kujtesë urgjente · {ses}',
    acilSesAciklama: 'Koha e namazit po del — kujtesa urgjente',
    titresimli: '{kanal} · Me dridhje',
    alarm: 'Alarmi i namazit',
    alarmSes: 'Alarmi i namazit · {ses}',
    uygulamaSesi: 'Tingulli i aplikacionit',
    seciliSes: 'Tingulli që zgjodhët',
  },
  cuma: {
    baslik: 'Xhumaja · edhe {sure} · namazi po afron',
    govdeIlk: 'Edhe {sure} deri te dreka. Përgatituni dhe nisuni për në xhami.',
    govde: 'Edhe {sure} deri te dreka. Nisuni për në xhami.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · {dk} min deri te ezani · përgatituni për xhami',
    hazirlanGovde: '{ad}: përgatituni ta arrini në xhami, nisuni pas {sonra} min — ezani pas {dk} min.',
    yolaCikBaslik: '{ad} · {dk} min deri te ezani · nisuni për në xhami',
    yolaCikGovde: '{ad}: nisuni për në xhami që ta arrini — ezani pas {dk} min.',
  },
  takvim: {
    etkinlikTek: '“{ad}”',
    etkinlikCoklu: cogul({ one: '{n} ngjarje në kalendarin tuaj', other: '{n} ngjarje radhazi në kalendarin tuaj' }),
    etkinlikBir: 'Një ngjarje në kalendarin tuaj',
    sonAnIkindi: 'koha e fundit e përshtatshme për ikindinë është {saat} (pas saj është mekruh)',
    sonAnVakit: '{kucuk} del në {saat}',
    onceBaslik: '{ad} · ngjarje në {saat} · falni më parë',
    onceGovde: '{etkinlik} zgjat {aralik}; {sonAn}. Falni namazin ({kucuk}) para se të fillojë ngjarja.',
    kaplarBaslik: '{ad} · një ngjarje mbulon kohën e namazit',
    kaplarGovde:
      '{etkinlik} zgjat {aralik} dhe mbulon kohën e namazit ({kucuk}, {giris}–{son}). Planifikoni që tani një pushim të shkurtër për të falur namazin ({kucuk}).',
  },
  yatis: {
    yatsiBaslik: '{ad} · falni para gjumit 🌙',
    yatsiGovde: '{ad}: koha ende vazhdon; ngrihuni për namaz para se t’ju zërë gjumi.',
    ozet: 'Sot {kilinan}/5 · pa shënim: {liste}',
    tekOto: 'Nëse e keni falur, shënojeni. {oto}',
    tekKaza: 'Nëse e keni falur, shënojeni; nëse nuk keni mundur, shtojeni në Regjistrin e kazave.',
    tekSuruyor: 'Nëse e keni falur, shënojeni. Koha ende vazhdon.',
    cokluOto: 'Hapni aplikacionin për të shqyrtuar dhe shënuar namazet që keni falur. {oto}',
    coklu: 'Hapni aplikacionin për të shqyrtuar dhe shënuar namazet që keni falur.',
    otoSor: 'Nëse nuk i shënoni, për këtë ditë do t’ju pyesim te Regjistri i kazave.',
    otoEkle: 'Nëse nuk i shënoni, do të shtohen te kazatë kur të mbarojë dita e namazit.',
  },
  gunSonu: {
    baslik: 'Dita nuk është plotësuar · seria',
    govde: 'Nëse i shënoni namazet e falura para se të mbarojë dita, seria juaj vazhdon.',
  },
};
