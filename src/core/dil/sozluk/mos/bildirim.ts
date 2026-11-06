import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ M pʋʋsa', kazayaEkle: 'Paas-y rolbẽ', inceleyin: 'Ges-y' },
  kanal: {
    genel: 'Kibar zãng',
    muhafiz: 'Pʋʋsg Gũuda',
    muhafizAciklama: 'Pʋʋsg wakat tẽegre',
    acil: 'Pʋʋsg tẽeg-yãgre',
    acilAciklama: 'Pʋʋsg wakatã na n sa masã - tẽeg-yãgre',
    vakit: 'Pʋʋsg wakato',
    vakitAciklama: 'Tẽegr sẽn wat pʋʋsg wakatã sã n ta',
    muhafizSes: 'Pʋʋsg Gũuda · {ses}',
    acilSes: 'Tẽeg-yãgre · {ses}',
    acilSesAciklama: 'Pʋʋsg wakatã na n sa masã — tẽeg-yãgre',
    titresimli: '{kanal} · Yẽgsgo',
    alarm: 'Pʋʋsg alaarme',
    alarmSes: 'Pʋʋsg alaarme · {ses}',
    uygulamaSesi: 'Aplikaasõ koɛɛgo',
    seciliSes: 'Koɛɛg ning y sẽn tũusa',
  },
  cuma: {
    baslik: 'Arzũma · {sure} n kell · pʋʋsgã pẽnegame',
    govdeIlk: '{sure} n kell n tãag Zafar. Segl-y n kẽng miisrẽ.',
    govde: '{sure} n kell n tãag Zafar. Kẽng-y miisrẽ.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · adaanã {dk}min · segl-y miisrã yĩnga',
    hazirlanGovde: 'Segl-y n paam {ad} miisrẽ; yi-y {sonra} min poorẽ — adaanã {dk} min poorẽ.',
    yolaCikBaslik: '{ad} · adaanã {dk}min · kẽng-y miisrẽ',
    yolaCikGovde: 'Kẽng-y miisrẽ n paam {ad} — adaanã {dk} min poorẽ.',
  },
  takvim: {
    etkinlikTek: '“{ad}”',
    etkinlikCoklu: cogul({ one: 'Y kalẽndiyẽ wã yɛla {n}', other: 'Y kalẽndiyẽ wã yɛla {n} sẽn pʋg taaba' }),
    etkinlikBir: 'Y kalẽndiyẽ wã yell a ye',
    sonAnIkindi: 'Laansar wakat sẽn sõmb sẽn kõnsã yaa {saat} (rẽ poorẽ yaa gɩdg wakato)',
    sonAnVakit: '{kucuk} wakatã saada {saat}',
    onceBaslik: '{ad} · yell {saat} · pʋʋs-y pĩnda',
    onceGovde: '{etkinlik} kẽnda {aralik}; {sonAn}. Pʋʋs-y {kucuk} yellã sẽn na n sɩng taoore.',
    kaplarBaslik: '{ad} · yell a ye pikda pʋʋsg wakatã',
    kaplarGovde:
      '{etkinlik} kẽnda {aralik} n pik {kucuk} wakatã ({giris}–{son}). Segl-y masã n vʋʋs bilf n pʋʋs {kucuk}.',
  },
  yatis: {
    yatsiBaslik: '{ad} · pʋʋs-y y gõeem taoore 🌙',
    yatsiGovde: '{ad} wakatã nan be; yik-y n pʋʋs y sẽn na n gõe taoore.',
    ozet: 'Rũndã {kilinan}/5 · b pa gʋls {liste} ye',
    tekOto: 'Y sã n pʋʋs-a, gʋls-y-a. {oto}',
    tekKaza: 'Y sã n pʋʋs-a, gʋls-y-a; y sã n pa tõog ye, paas-y-a y Rolb sebrẽ.',
    tekSuruyor: 'Y sã n pʋʋs-a, gʋls-y-a. Pʋʋsg wakatã nan be.',
    cokluOto: 'Pak-y aplikaasõ wã n ges la y gʋls pʋʋs-rãmb nins y sẽn pʋʋsa. {oto}',
    coklu: 'Pak-y aplikaasõ wã n ges la y gʋls pʋʋs-rãmb nins y sẽn pʋʋsa.',
    otoSor: 'Y sã n pa gʋls-b ye, b na n sok-y raar-kãngã yell Rolb sebrẽ wã pʋgẽ.',
    otoEkle: 'Y sã n pa gʋls-b ye, b na n paas-b rolbẽ pʋʋsg raarã sã n sa.',
  },
  gunSonu: {
    baslik: 'Rũndã nan ka pid ye · kellgo',
    govde: 'Y sã n gʋls pʋʋs-rãmb nins y sẽn pʋʋsa raarã sẽn na n sa taoore, y kellgã na n kell taoore.',
  },
};
