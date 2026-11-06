import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** İbadete çağrı (cuma, mescit, takvim, yatsı) "син" + emir; işaretleme/muhasebe küçük "сез". Başlıkta süre "мин". */
export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ Укыдым', kazayaEkle: 'Казага өстәү', inceleyin: 'Карап чыгу' },
  kanal: {
    genel: 'Гомуми хәбәрнамәләр',
    muhafiz: 'Намаз сакчысы',
    muhafizAciklama: 'Намаз вакыты турында искәртүләр',
    acil: 'Ашыгыч намаз искәртүе',
    acilAciklama: 'Намаз вакыты чыгып бара — ашыгыч искәртүләр',
    vakit: 'Намаз вакытлары',
    vakitAciklama: 'Намаз вакыты кергәндә җибәрелә торган искәртүләр',
    muhafizSes: 'Намаз сакчысы · {ses}',
    acilSes: 'Ашыгыч искәртү · {ses}',
    acilSesAciklama: 'Намаз вакыты чыгып бара — ашыгыч искәртүләр',
    titresimli: '{kanal} · Тибрәнү белән',
    alarm: 'Намаз уяткычы',
    alarmSes: 'Намаз уяткычы · {ses}',
    uygulamaSesi: 'Кушымта тавышы',
    seciliSes: 'Сез сайлаган тавыш',
  },
  cuma: {
    baslik: 'Җомга · {sure} калды · намаз якын',
    govdeIlk: 'Өйлә вакытына {sure} калды. Хәзерлән, мәчеткә юлга чык.',
    govde: 'Өйлә вакытына {sure} калды. Мәчеткә юлга чык.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · азанга {dk} мин · мәчеткә хәзерлән',
    hazirlanGovde: '{ad} намазына мәчеттә өлгерү өчен хәзерлән, {sonra} минуттан соң юлга чык — азанга {dk} мин.',
    yolaCikBaslik: '{ad} · азанга {dk} мин · мәчеткә юлга чык',
    yolaCikGovde: '{ad} намазына мәчеттә өлгерү өчен юлга чык — азанга {dk} мин.',
  },
  takvim: {
    etkinlikTek: '«{ad}»',
    etkinlikCoklu: cogul({ one: 'Календарыңдагы рәттән {n} чара', other: 'Календарыңдагы рәттән {n} чара' }),
    etkinlikBir: 'Календарыңдагы бер чара',
    sonAnIkindi: 'икенде өчен соңгы уңай мизгел {saat} (аннан соң мәкруһ)',
    sonAnVakit: '{kucuk} вакыты {saat} чыга',
    onceBaslik: '{ad} · чара {saat} · башта укы',
    onceGovde: '{etkinlik} {aralik} арасында була; {sonAn}. Чара башланганчы {kucuk} намазын укы.',
    kaplarBaslik: '{ad} · чара намаз вакытын каплый',
    kaplarGovde:
      '{etkinlik} {aralik} арасында була һәм {kucuk} вакытын ({giris}–{son}) каплый. Кыска тәнәфес ясап, {kucuk} намазын укуны хәзердән үк планлаштыр.',
  },
  yatis: {
    yatsiBaslik: '{ad} · йокы алдыннан укы 🌙',
    yatsiGovde: '{ad} вакыты әле дәвам итә; йокларга ятканчы намазга бас.',
    ozet: 'Бүген {kilinan}/5 · {liste} билгеләнмәгән',
    tekOto: 'Укыган булсагыз, билгеләгез. {oto}',
    tekKaza: 'Укыган булсагыз, билгеләгез; укый алмаган булсагыз, каза дәфтәрегезгә өстәгез.',
    tekSuruyor: 'Укыган булсагыз, билгеләгез. Вакыт әле дәвам итә.',
    cokluOto: 'Укыган намазларыгызны билгеләү өчен кушымтаны ачып карап чыгыгыз. {oto}',
    coklu: 'Укыган намазларыгызны билгеләү өчен кушымтаны ачып карап чыгыгыз.',
    otoSor: 'Билгеләмәсәгез, бу көн турында Каза дәфтәрендә сораначак.',
    otoEkle: 'Билгеләмәсәгез, намаз көне беткәч казага өстәләчәк.',
  },
  gunSonu: {
    baslik: 'Көн тулы түгел · серия',
    govde: 'Укыган намазларыгызны көн беткәнче билгеләсәгез, сериягез дәвам итәчәк.',
  },
};
