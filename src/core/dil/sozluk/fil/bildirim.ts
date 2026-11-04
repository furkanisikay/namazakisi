import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Çağrı (cuma, masjid, takvim, yatsı) zamirsiz kısa emir; işaretleme/muhasebe saygılı "ninyo".
 * Başlıkta süre birimi CLDR dar biçimi "m" (bileklik 16 karakter).
 */
export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ Nagdasal ako', kazayaEkle: 'Idagdag sa qada', inceleyin: 'Suriin' },
  kanal: {
    genel: 'Mga pangkalahatang notification',
    muhafiz: 'Tagabantay ng Dasal',
    muhafizAciklama: 'Mga paalala sa oras ng dasal',
    acil: 'Agarang paalala sa dasal',
    acilAciklama: 'Malapit nang matapos ang oras ng dasal - agarang paalala',
    vakit: 'Mga oras ng dasal',
    vakitAciklama: 'Mga paalalang ipinapadala kapag pumasok ang oras ng dasal',
    muhafizSes: 'Tagabantay ng Dasal · {ses}',
    acilSes: 'Agarang paalala · {ses}',
    acilSesAciklama: 'Malapit nang matapos ang oras ng dasal — agarang paalala',
    titresimli: '{kanal} · May vibrate',
    alarm: 'Alarm sa dasal',
    alarmSes: 'Alarm sa dasal · {ses}',
    uygulamaSesi: 'Tunog ng app',
    seciliSes: 'Ang napili ninyong tunog',
  },
  cuma: {
    baslik: "Jumu'ah · {sure} pa · malapit na ang dasal",
    govdeIlk: '{sure} pa bago ang Dhuhr. Maghanda at pumunta sa masjid.',
    govde: '{sure} pa bago ang Dhuhr. Pumunta na sa masjid.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · {dk}m bago ang adhan · maghanda para sa masjid',
    hazirlanGovde: 'Maghanda para maabutan ang {ad} sa masjid; umalis pagkalipas ng {sonra} min — adhan sa loob ng {dk} min.',
    yolaCikBaslik: '{ad} · {dk}m bago ang adhan · pumunta sa masjid',
    yolaCikGovde: 'Pumunta na sa masjid para maabutan ang {ad} — adhan sa loob ng {dk} min.',
  },
  takvim: {
    etkinlikTek: '“{ad}”',
    etkinlikCoklu: cogul({ one: '{n} sunod-sunod na event sa inyong kalendaryo', other: '{n} sunod-sunod na event sa inyong kalendaryo' }),
    etkinlikBir: 'Isang event sa inyong kalendaryo',
    sonAnIkindi: 'ang huling angkop na oras para sa Asr ay {saat} (makruh pagkatapos)',
    sonAnVakit: 'matatapos ang oras ng {kucuk} sa {saat}',
    onceBaslik: '{ad} · event sa {saat} · magdasal muna',
    onceGovde: 'Tatagal ang {etkinlik} sa {aralik}; {sonAn}. Idasal ang {kucuk} bago magsimula ang event.',
    kaplarBaslik: '{ad} · sakop ng event ang oras ng dasal',
    kaplarGovde:
      'Tatagal ang {etkinlik} sa {aralik} at sakop nito ang oras ng {kucuk} ({giris}–{son}). Planuhin na ngayon ang maikling pahinga para idasal ang {kucuk}.',
  },
  yatis: {
    yatsiBaslik: '{ad} · magdasal bago matulog 🌙',
    yatsiGovde: 'Hindi pa tapos ang oras ng {ad}; magdasal bago makatulog.',
    ozet: 'Ngayon {kilinan}/5 · hindi namarkahan ang {liste}',
    tekOto: 'Kung nakapagdasal na kayo, markahan ito. {oto}',
    tekKaza: 'Kung nakapagdasal na kayo, markahan ito; kung hindi, idagdag ito sa inyong Talaan ng qada.',
    tekSuruyor: 'Kung nakapagdasal na kayo, markahan ito. Hindi pa tapos ang oras ng dasal.',
    cokluOto: 'Buksan ang app para suriin at markahan ang mga dasal na naidasal ninyo. {oto}',
    coklu: 'Buksan ang app para suriin at markahan ang mga dasal na naidasal ninyo.',
    otoSor: 'Kung hindi ninyo mamarkahan, itatanong sa inyo ang araw na ito sa Talaan ng qada.',
    otoEkle: 'Kung hindi ninyo mamarkahan, idaragdag ang mga ito sa qada pagkatapos ng araw ng dasal.',
  },
  gunSonu: {
    baslik: 'Hindi kumpleto ang araw · sunod-sunod',
    govde: 'Kung mamarkahan ninyo ang mga naidasal ninyo bago matapos ang araw, magpapatuloy ang inyong sunod-sunod na araw.',
  },
};
