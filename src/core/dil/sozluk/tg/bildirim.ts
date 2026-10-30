import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Hatırlatma bildirimleri: ibadete çağrı (cuma, camiye, takvim, yatsı) "ту" + emir; işaretleme ve
 * muhasebe "Шумо". Başlık önden okunur: vakit adı + süre ilk 16 karakterde.
 */
export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ Хондам', kazayaEkle: 'Илова ба қазо', inceleyin: 'Баррасӣ' },
  kanal: {
    genel: 'Огоҳиномаҳои умумӣ',
    muhafiz: 'Нигаҳбони намоз',
    muhafizAciklama: 'Ёдовариҳои вақти намоз',
    acil: 'Ёдовари фаврии намоз',
    acilAciklama: 'Вақти намоз ба охир мерасад - ёдовариҳои фаврӣ',
    vakit: 'Вақтҳои намоз',
    vakitAciklama: 'Ёдовариҳое, ки ҳангоми расидани вақти намоз фиристода мешаванд',
    muhafizSes: 'Нигаҳбони намоз · {ses}',
    acilSes: 'Ёдовари фаврӣ · {ses}',
    acilSesAciklama: 'Вақти намоз ба охир мерасад — ёдовариҳои фаврӣ',
    titresimli: '{kanal} · Бо ларзиш',
    alarm: 'Ҳушдори намоз',
    alarmSes: 'Ҳушдори намоз · {ses}',
    uygulamaSesi: 'Садои барнома',
    seciliSes: 'Садои интихобкардаи Шумо',
  },
  cuma: {
    baslik: 'Ҷумъа · {sure} монд · намоз наздик аст',
    govdeIlk: 'То вақти пешин {sure} монд. Омода шав ва ба масҷид рав.',
    govde: 'То вақти пешин {sure} монд. Ба масҷид рав.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · то азон {dk} дақ · ба масҷид омода шав',
    hazirlanGovde: 'Барои ба намози {ad} дар масҷид расидан омода шав; пас аз {sonra} дақ роҳ рав — то азон {dk} дақ.',
    yolaCikBaslik: '{ad} · то азон {dk} дақ · ба масҷид рав',
    yolaCikGovde: 'Барои ба намози {ad} дар масҷид расидан ба роҳ бароӣ — то азон {dk} дақ.',
  },
  takvim: {
    etkinlikTek: '«{ad}»',
    etkinlikCoklu: cogul({ one: '{n} чорабинӣ дар тақвимат', other: '{n} чорабинии пай дар пай дар тақвимат' }),
    etkinlikBir: 'Як чорабинӣ дар тақвимат',
    sonAnIkindi: 'охирин лаҳзаи муносиб барои аср {saat} (баъд аз он макрӯҳ)',
    sonAnVakit: 'вақти {kucuk} соати {saat} ба охир мерасад',
    onceBaslik: '{ad} · чорабинӣ {saat} · аввал бихон',
    onceGovde: '{etkinlik} {aralik} идома дорад; {sonAn}. Пеш аз оғози чорабинӣ намози {kucuk}ро бихон.',
    kaplarBaslik: '{ad} · чорабинӣ вақти намозро фаро мегирад',
    kaplarGovde:
      '{etkinlik} {aralik} идома дорад ва вақти {kucuk}ро ({giris}–{son}) фаро мегирад. Аз ҳозир нақша кун, ки каме танаффус карда намози {kucuk}ро бихонӣ.',
  },
  yatis: {
    yatsiBaslik: '{ad} · пеш аз хоб бихон 🌙',
    yatsiGovde: 'Вақти {ad} ҳанӯз идома дорад; пеш аз он ки хобат барад, ба намоз биист.',
    ozet: 'Имрӯз {kilinan}/5 · {liste} қайд нашудааст',
    tekOto: 'Агар хонда бошед, қайд кунед. {oto}',
    tekKaza: 'Агар хонда бошед, қайд кунед; агар натавонистед, ба дафтари қазо илова кунед.',
    tekSuruyor: 'Агар хонда бошед, қайд кунед. Вақт ҳанӯз идома дорад.',
    cokluOto: 'Барои қайд кардани намозҳои хондаатон барномаро кушода баррасӣ кунед. {oto}',
    coklu: 'Барои қайд кардани намозҳои хондаатон барномаро кушода баррасӣ кунед.',
    otoSor: 'Агар қайд накунед, дар бораи ин рӯз дар Дафтари қазо аз Шумо пурсида мешавад.',
    otoEkle: 'Агар қайд накунед, баъди анҷоми рӯзи намоз ба қазо илова мешаванд.',
  },
  gunSonu: {
    baslik: 'Рӯз пурра нашуд · силсила',
    govde: 'Агар намозҳои хондаатонро пеш аз анҷоми рӯз қайд кунед, силсилаатон идома меёбад.',
  },
};
