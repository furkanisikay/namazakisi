import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ Mo ti kírun', kazayaEkle: 'Fi kún Ƙaḍā’', inceleyin: 'Ṣàyẹ̀wò' },
  kanal: {
    genel: 'Ìfitónilétí gbogbogbòò',
    muhafiz: 'Olùṣọ́ Ìrun',
    muhafizAciklama: 'Ìránnilétí àkókò ìrun',
    acil: 'Ìránnilétí ìrun kánjúkánjú',
    acilAciklama: 'Àkókò ìrun ti fẹ́rẹ̀ẹ́ parí - ìránnilétí kánjúkánjú',
    vakit: 'Àwọn àkókò ìrun',
    vakitAciklama: 'Ìránnilétí tí a ń fi ránṣẹ́ nígbà tí àkókò ìrun bá wọlé',
    muhafizSes: 'Olùṣọ́ Ìrun · {ses}',
    acilSes: 'Ìránnilétí kánjúkánjú · {ses}',
    acilSesAciklama: 'Àkókò ìrun ti fẹ́rẹ̀ẹ́ parí — ìránnilétí kánjúkánjú',
    titresimli: '{kanal} · Pẹ̀lú ìgbọ̀nrìrì',
    alarm: 'Aago ìdágìrì ìrun',
    alarmSes: 'Aago ìdágìrì ìrun · {ses}',
    uygulamaSesi: 'Ohùn ìṣàfilọ́lẹ̀',
    seciliSes: 'Ohùn tí ẹ yàn',
  },
  cuma: {
    baslik: 'Jum‘ah · {sure} ló kù · ìrun ti súnmọ́',
    govdeIlk: '{sure} ló kù sí Ṭḥuhr. Múra, kí o sì lọ sí mọ́sálásí.',
    govde: '{sure} ló kù sí Ṭḥuhr. Lọ sí mọ́sálásí.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · ìṣj {dk} sí ìpè ìrun · múra fún mọ́sálásí',
    hazirlanGovde: 'Múra kí o lè bá {ad} ní mọ́sálásí; jáde lẹ́yìn ìṣẹ́jú {sonra} — ìpè ìrun ní ìṣẹ́jú {dk}.',
    yolaCikBaslik: '{ad} · ìṣj {dk} sí ìpè ìrun · lọ sí mọ́sálásí',
    yolaCikGovde: 'Lọ sí mọ́sálásí kí o lè bá {ad} — ìpè ìrun ní ìṣẹ́jú {dk}.',
  },
  takvim: {
    etkinlikTek: '“{ad}”',
    etkinlikCoklu: cogul({ other: 'Ìṣẹ̀lẹ̀ {n} tí ó tẹ̀ léra nínú kàlẹ́ńdà rẹ' }),
    etkinlikBir: 'Ìṣẹ̀lẹ̀ kan nínú kàlẹ́ńdà rẹ',
    sonAnIkindi: 'àkókò tó yẹ tó kẹ́yìn fún ‘Asr ni {saat} (makrūh ni lẹ́yìn rẹ̀)',
    sonAnVakit: 'àkókò {kucuk} yóò parí ní {saat}',
    onceBaslik: '{ad} · ìṣẹ̀lẹ̀ ní {saat} · kọ́kọ́ kírun',
    onceGovde: '{etkinlik} yóò wà {aralik}; {sonAn}. Kí {kucuk} kí ìṣẹ̀lẹ̀ náà tó bẹ̀rẹ̀.',
    kaplarBaslik: '{ad} · ìṣẹ̀lẹ̀ kan bo àkókò ìrun',
    kaplarGovde:
      '{etkinlik} yóò wà {aralik}, ó sì bo àkókò {kucuk} ({giris}–{son}). Ṣètò báyìí láti sinmi díẹ̀ kí o sì kí {kucuk}.',
  },
  yatis: {
    yatsiBaslik: '{ad} · kírun kí o tó sùn 🌙',
    yatsiGovde: 'Àkókò {ad} ṣì wà; dúró kírun kí oorun tó gbé ọ lọ.',
    ozet: 'Òní {kilinan}/5 · a kò sàmì sí {liste}',
    tekOto: 'Tí ẹ bá ti kí i, ẹ sàmì sí i. {oto}',
    tekKaza: 'Tí ẹ bá ti kí i, ẹ sàmì sí i; tí ẹ kò bá lè kí i, ẹ fi kún àkọsílẹ̀ Ƙaḍā’ yín.',
    tekSuruyor: 'Tí ẹ bá ti kí i, ẹ sàmì sí i. Àkókò ìrun náà ṣì wà.',
    cokluOto: 'Ẹ ṣí ìṣàfilọ́lẹ̀ láti ṣàyẹ̀wò, kí ẹ sì sàmì sí àwọn ìrun tí ẹ ti kí. {oto}',
    coklu: 'Ẹ ṣí ìṣàfilọ́lẹ̀ láti ṣàyẹ̀wò, kí ẹ sì sàmì sí àwọn ìrun tí ẹ ti kí.',
    otoSor: 'Tí ẹ kò bá sàmì sí wọn, a ó bi yín léèrè nípa ọjọ́ yìí nínú àkọsílẹ̀ Ƙaḍā’.',
    otoEkle: 'Tí ẹ kò bá sàmì sí wọn, a ó fi wọ́n kún Ƙaḍā’ nígbà tí ọjọ́ ìrun bá parí.',
  },
  gunSonu: {
    baslik: 'Òní kò tíì pé · ìtẹ̀léra',
    govde: 'Tí ẹ bá sàmì sí àwọn ìrun tí ẹ ti kí kí ọjọ́ tó parí, ìtẹ̀léra yín yóò máa bá a lọ.',
  },
};
