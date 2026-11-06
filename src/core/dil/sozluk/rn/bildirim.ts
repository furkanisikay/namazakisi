import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ Nasenze', kazayaEkle: 'Mushire muri Qadha', inceleyin: 'Musuzume' },
  kanal: {
    genel: 'Amamenyesha rusangi',
    muhafiz: 'Umurinzi w’isengesho',
    muhafizAciklama: 'Inyibutsa z’ibihe vy’isengesho',
    acil: 'Inyibutsa yihutirwa y’isengesho',
    acilAciklama: 'Igihe c’isengesho kiri hafi kurangira - inyibutsa zihutirwa',
    vakit: 'Ibihe vy’isengesho',
    vakitAciklama: 'Inyibutsa zirungikwa iyo igihe c’isengesho kigeze',
    muhafizSes: 'Umurinzi w’isengesho · {ses}',
    acilSes: 'Inyibutsa yihutirwa · {ses}',
    acilSesAciklama: 'Igihe c’isengesho kiri hafi kurangira — inyibutsa zihutirwa',
    titresimli: '{kanal} · Gutigita',
    alarm: 'Inzogera y’isengesho',
    alarmSes: 'Inzogera y’isengesho · {ses}',
    uygulamaSesi: 'Ijwi rya porogarama',
    seciliSes: 'Ijwi mwahisemwo',
  },
  cuma: {
    baslik: 'Ijuma · hasigaye {sure} · isengesho riregereje',
    govdeIlk: 'Hasigaye {sure} ngo Adhuhuri ishike. Mwitegure mwerekeze ku musigiti.',
    govde: 'Hasigaye {sure} ngo Adhuhuri ishike. Mwerekeze ku musigiti.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · adhana haciye {dk} min · mwitegure kuja ku musigiti',
    hazirlanGovde: 'Mwitegure gushikira {ad} ku musigiti; muhaguruke haciye {sonra} min — adhana haciye {dk} min.',
    yolaCikBaslik: '{ad} · adhana haciye {dk} min · mwerekeze ku musigiti',
    yolaCikGovde: 'Mwerekeze ku musigiti kugira mushikire {ad} — adhana haciye {dk} min.',
  },
  takvim: {
    etkinlikTek: '”{ad}”',
    etkinlikCoklu: cogul({ one: 'Igikorwa {n} kiri muri kalendari yanyu', other: 'Ibikorwa {n} bikurikirana biri muri kalendari yanyu' }),
    etkinlikBir: 'Igikorwa kiri muri kalendari yanyu',
    sonAnIkindi: 'igihe ca nyuma kibereye Asr ni {saat} (inyuma yaho ni makruhu)',
    sonAnVakit: 'igihe ca {kucuk} kirangira ku isaha {saat}',
    onceBaslik: '{ad} · igikorwa ku isaha {saat} · musenge imbere',
    onceGovde: '{etkinlik}: {aralik}; {sonAn}. Musenge {kucuk} imbere y’uko igikorwa gitangura.',
    kaplarBaslik: '{ad} · igikorwa gifata igihe c’isengesho',
    kaplarGovde:
      '{etkinlik}: {aralik}, gifata igihe ca {kucuk} ({giris}–{son}). Mutegure ubu kuruhuka gato mugasenga {kucuk}.',
  },
  yatis: {
    yatsiBaslik: '{ad} · musenge imbere yo kuryama 🌙',
    yatsiGovde: 'Igihe ca {ad} kiracariho; muhagarare musenge imbere yo gusinzira.',
    ozet: 'Uyu musi {kilinan}/5 · ataremezwa: {liste}',
    tekOto: 'Nimba mwarisenze, muryemeze. {oto}',
    tekKaza: 'Nimba mwarisenze, muryemeze; nimba mutashoboye, muryongere mu gitabo ca Qadha.',
    tekSuruyor: 'Nimba mwarisenze, muryemeze. Igihe c’isengesho kiracariho.',
    cokluOto: 'Mwugurure porogarama musuzume, mwemeze amasengesho mwasenze. {oto}',
    coklu: 'Mwugurure porogarama musuzume, mwemeze amasengesho mwasenze.',
    otoSor: 'Nimutayemeza, muzobazwa kuri uyu musi mu gitabo ca Qadha.',
    otoEkle: 'Nimutayemeza, azokwongerwa muri Qadha umusi w’isengesho nurangira.',
  },
  gunSonu: {
    baslik: 'Uyu musi ntiwuzuye · uruhererekane',
    govde: 'Nimwemeza amasengesho mwasenze imbere y’uko umusi urangira, uruhererekane rwanyu ruzobandanya.',
  },
};
