import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ Nasali', kazayaEkle: 'Kongera mu kwishyura', inceleyin: 'Gusuzuma' },
  kanal: {
    genel: 'Amamenyesha rusange',
    muhafiz: 'Umurinzi w’iswala',
    muhafizAciklama: 'Ibyibutsa by’ibihe by’iswala',
    acil: 'Icyibutsa cyihutirwa cy’iswala',
    acilAciklama: 'Igihe cy’iswala kigiye kurangira - ibyibutsa byihutirwa',
    vakit: 'Ibihe by’iswala',
    vakitAciklama: 'Ibyibutsa byoherezwa igihe cy’iswala gitangiye',
    muhafizSes: 'Umurinzi w’iswala · {ses}',
    acilSes: 'Icyibutsa cyihutirwa · {ses}',
    acilSesAciklama: 'Igihe cy’iswala kigiye kurangira — ibyibutsa byihutirwa',
    titresimli: '{kanal} · Kunyeganyega',
    alarm: 'Alarume y’iswala',
    alarmSes: 'Alarume y’iswala · {ses}',
    uygulamaSesi: 'Ijwi rya porogaramu',
    seciliSes: 'Ijwi mwahisemo',
  },
  cuma: {
    baslik: 'Ijuma · hasigaye {sure} · iswala iregereje',
    govdeIlk: 'Hasigaye {sure} kugeza Adhuhuri. Itegure ujye ku musigiti.',
    govde: 'Hasigaye {sure} kugeza Adhuhuri. Jya ku musigiti.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · {dk}min ngo Adhana · itegure kujya ku musigiti',
    hazirlanGovde: 'Itegure kugira ngo ugere ku musigiti kuri {ad}; haguruka mu minota {sonra} — Adhana mu minota {dk}.',
    yolaCikBaslik: '{ad} · {dk}min ngo Adhana · jya ku musigiti',
    yolaCikGovde: 'Jya ku musigiti kugira ngo ugere kuri {ad} — Adhana mu minota {dk}.',
  },
  takvim: {
    etkinlikTek: '«{ad}»',
    etkinlikCoklu: cogul({ one: 'Ibikorwa {n} bikurikirana muri kalendari yanyu', other: 'Ibikorwa {n} bikurikirana muri kalendari yanyu' }),
    etkinlikBir: 'Igikorwa kiri muri kalendari yanyu',
    sonAnIkindi: 'igihe cya nyuma gikwiye cya Asr ni saa {saat} (nyuma yaho ntibikwiye)',
    sonAnVakit: 'igihe cya {kucuk} kirangira saa {saat}',
    onceBaslik: '{ad} · igikorwa saa {saat} · mubanze musali',
    onceGovde: '{etkinlik}: {aralik}; {sonAn}. Musali {kucuk} mbere y’uko igikorwa gitangira.',
    kaplarBaslik: '{ad} · igikorwa gifata igihe cy’iswala',
    kaplarGovde:
      '{etkinlik}: {aralik}, gifata igihe cya {kucuk} ({giris}–{son}). Muteganye ubu gufata akaruhuko gato mugasali {kucuk}.',
  },
  yatis: {
    yatsiBaslik: '{ad} · sali mbere yo kuryama 🌙',
    yatsiGovde: 'Igihe cya {ad} kiracyakomeje; hagurukira iswala mbere yo gusinzira.',
    ozet: 'Uyu munsi {kilinan}/5 · {liste} ntizemejwe',
    tekOto: 'Niba mwarayisali, muyemeze. {oto}',
    tekKaza: 'Niba mwarayisali, muyemeze; niba mutarashoboye, muyongere mu gitabo cyo kwishyura.',
    tekSuruyor: 'Niba mwarayisali, muyemeze. Igihe cy’iswala kiracyakomeje.',
    cokluOto: 'Mufungure porogaramu musuzume kandi mwemeze iswala mwasali. {oto}',
    coklu: 'Mufungure porogaramu musuzume kandi mwemeze iswala mwasali.',
    otoSor: 'Nimutazemeza, muzabazwa kuri uyu munsi mu gitabo cyo kwishyura.',
    otoEkle: 'Nimutazemeza, zizongerwa mu byo kwishyura umunsi w’iswala urangiye.',
  },
  gunSonu: {
    baslik: 'Uyu munsi ntiwuzuye · uruhererekane',
    govde: 'Nimwemeza iswala mwasali mbere y’uko umunsi urangira, uruhererekane rwanyu rurakomeza.',
  },
};
