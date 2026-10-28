import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** İbadete çağrı olanlar (cuma, camiye, takvim, yatsı) "ته" + emir; işaretleme/muhasebe "تاسو". */
export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ لمونځ مې وکړ', kazayaEkle: 'قضا ته اضافه', inceleyin: 'وګورئ' },
  kanal: {
    genel: 'عمومي خبرتیاوې',
    muhafiz: 'د لمانځه ساتونکی',
    muhafizAciklama: 'د لمانځه د وخت یادونې',
    acil: 'بیړنۍ د لمانځه یادونه',
    acilAciklama: 'د لمانځه وخت پای ته رسېږي - بیړنۍ یادونې',
    vakit: 'د لمانځه وختونه',
    vakitAciklama: 'هغه یادونې چې د لمانځه د وخت په پیل کې لېږل کېږي',
    muhafizSes: 'د لمانځه ساتونکی · {ses}',
    acilSes: 'بیړنۍ یادونه · {ses}',
    acilSesAciklama: 'د لمانځه وخت پای ته رسېږي — بیړنۍ یادونې',
    titresimli: '{kanal} · له لړزې سره',
    alarm: 'د لمانځه الارم',
    alarmSes: 'د لمانځه الارم · {ses}',
    uygulamaSesi: 'د اپ غږ',
    seciliSes: 'ستاسو ټاکلی غږ',
  },
  cuma: {
    baslik: 'جمعه · {sure} پاتې · لمونځ نږدې دی',
    govdeIlk: 'د ماسپښین تر وخته {sure} پاتې دي. چمتو شه او جومات ته روان شه.',
    govde: 'د ماسپښین تر وخته {sure} پاتې دي. جومات ته روان شه.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · اذان ته {dk} دقیقې · جومات ته چمتو شه',
    hazirlanGovde: 'په جومات کې د {ad} لمانځه ته د رسېدو لپاره چمتو شه، {sonra} دقیقې وروسته روان شه — اذان ته {dk} دقیقې.',
    yolaCikBaslik: '{ad} · اذان ته {dk} دقیقې · جومات ته روان شه',
    yolaCikGovde: 'په جومات کې د {ad} لمانځه ته د رسېدو لپاره روان شه — اذان ته {dk} دقیقې.',
  },
  takvim: {
    etkinlikTek: '«{ad}»',
    etkinlikCoklu: cogul({ one: 'ستا په کلیز کې {n} پېښه', other: 'ستا په کلیز کې {n} پرله پسې پېښې' }),
    etkinlikBir: 'ستا په کلیز کې یوه پېښه',
    sonAnIkindi: 'د مازدیګر لپاره وروستۍ مناسبه شېبه {saat} ده (وروسته یې مکروه دی)',
    sonAnVakit: 'د {kucuk} وخت په {saat} پای ته رسېږي',
    onceBaslik: '{ad} · پېښه په {saat} · لومړی لمونځ وکړه',
    onceGovde: '{etkinlik} د {aralik} ترمنځ دوام کوي؛ {sonAn}. له پېښې د پیل مخکې د {kucuk} لمونځ وکړه.',
    kaplarBaslik: '{ad} · پېښه د لمانځه وخت نیسي',
    kaplarGovde:
      '{etkinlik} د {aralik} ترمنځ دوام کوي او د {kucuk} وخت ({giris}–{son}) نیسي. له اوس څخه پلان جوړ کړه چې لنډه وقفه واخلې او د {kucuk} لمونځ وکړې.',
  },
  yatis: {
    yatsiBaslik: '{ad} · له خوب مخکې لمونځ وکړه 🌙',
    yatsiGovde: 'د {ad} وخت لا روان دی؛ له ویده کېدو مخکې لمانځه ته ودرېږه.',
    ozet: 'نن {kilinan}/5 · {liste} نښه شوي نه دي',
    tekOto: 'که مو لمونځ کړی وي، نښه یې کړئ. {oto}',
    tekKaza: 'که مو کړی وي، نښه یې کړئ؛ که مو نه دی کړی، د قضا خپل دفتر ته یې اضافه کړئ.',
    tekSuruyor: 'که مو کړی وي، نښه یې کړئ. د لمانځه وخت لا روان دی.',
    cokluOto: 'د هغو لمونځونو د نښه کولو لپاره چې کړي مو دي، اپ پرانیزئ او ویې ګورئ. {oto}',
    coklu: 'د هغو لمونځونو د نښه کولو لپاره چې کړي مو دي، اپ پرانیزئ او ویې ګورئ.',
    otoSor: 'که یې نښه نه کړئ، د قضا په دفتر کې به د دې ورځې په اړه له تاسو پوښتنه وشي.',
    otoEkle: 'که یې نښه نه کړئ، د لمانځه د ورځې په پای کې به قضا ته اضافه شي.',
  },
  gunSonu: {
    baslik: 'ورځ مو بشپړه نه کړه · لړۍ',
    govde: 'که د ورځې له پای مخکې هغه لمونځونه نښه کړئ چې کړي مو دي، لړۍ مو دوام کوي.',
  },
};
