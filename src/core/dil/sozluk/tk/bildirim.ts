import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ Okadym', kazayaEkle: 'Kaza goş', inceleyin: 'Serediň' },
  kanal: {
    genel: 'Umumy habarnamalar',
    muhafiz: 'Namaz goragçysy',
    muhafizAciklama: 'Namaz wagty ýatlatmalary',
    acil: 'Gyssagly namaz ýatlatmasy',
    acilAciklama: 'Namaz wagty çykmakçy - gyssagly ýatlatmalar',
    vakit: 'Namaz wagtlary',
    vakitAciklama: 'Namaz wagty girende iberilýän ýatlatmalar',
    muhafizSes: 'Namaz goragçysy · {ses}',
    acilSes: 'Gyssagly ýatlatma · {ses}',
    acilSesAciklama: 'Namaz wagty çykmakçy — gyssagly ýatlatmalar',
    titresimli: '{kanal} · Titreýän',
    alarm: 'Namaz duýduryşy',
    alarmSes: 'Namaz duýduryşy · {ses}',
    uygulamaSesi: 'Programmanyň sesi',
    seciliSes: 'Saýlan sesiňiz',
  },
  cuma: {
    baslik: 'Juma · {sure} galdy · namaz ýakyn',
    govdeIlk: 'Öýlä {sure} galdy. Taýýarlan, metjide ugra.',
    govde: 'Öýlä {sure} galdy. Metjide ugra.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · azana {dk} min · metjide taýýarlan',
    hazirlanGovde: '{ad} namazyna metjitde ýetişmek üçin taýýarlan, {sonra} min soň ýola çyk — azana {dk} min.',
    yolaCikBaslik: '{ad} · azana {dk} min · metjide ugra',
    yolaCikGovde: '{ad} namazyna metjitde ýetişmek üçin ýola çyk — azana {dk} min.',
  },
  takvim: {
    etkinlikTek: '“{ad}”',
    etkinlikCoklu: cogul({ one: 'Senenamaňyzda {n} çäre', other: 'Senenamaňyzda yzly-yzyna {n} çäre' }),
    etkinlikBir: 'Senenamaňyzdaky bir çäre',
    sonAnIkindi: 'ikindi üçin iň soňky laýyk wagt {saat} (ondan soň mekruh)',
    sonAnVakit: '{kucuk} wagty sagat {saat} bolanda gutarýar',
    onceBaslik: '{ad} · çäre sagat {saat} · ilki oka',
    onceGovde: '{etkinlik} {aralik} aralygynda dowam edýär; {sonAn}. Çäre başlamazdan öň {kucuk} namazyny oka.',
    kaplarBaslik: '{ad} · bir çäre namaz wagtyny tutýar',
    kaplarGovde:
      '{etkinlik} {aralik} aralygynda dowam edýär we {kucuk} wagtyny tutýar ({giris}–{son}). Gysga arakesme edip {kucuk} namazyny okamagy häzirden meýilleşdir.',
  },
  yatis: {
    yatsiBaslik: '{ad} · ýatmazdan öň oka 🌙',
    yatsiGovde: '{ad} wagty entek dowam edýär; uka gitmezden öň namaza dur.',
    ozet: 'Şu gün {kilinan}/5 · {liste} bellenmedi',
    tekOto: 'Okan bolsaňyz, belläň. {oto}',
    tekKaza: 'Okan bolsaňyz, belläň; okap bilmedik bolsaňyz, Kaza depderiňize goşuň.',
    tekSuruyor: 'Okan bolsaňyz, belläň. Namaz wagty entek dowam edýär.',
    cokluOto: 'Okan namazlaryňyzy bellemek üçin programmany açyp serediň. {oto}',
    coklu: 'Okan namazlaryňyzy bellemek üçin programmany açyp serediň.',
    otoSor: 'Bellemeseňiz, bu gün barada Kaza depderinde sizden soralar.',
    otoEkle: 'Bellemeseňiz, namaz güni gutaranda kaza goşular.',
  },
  gunSonu: {
    baslik: 'Şu gün doly däl · yzygiderlik',
    govde: 'Okan namazlaryňyzy gün gutarmazdan öň belleseňiz, yzygiderligiňiz dowam eder.',
  },
};
