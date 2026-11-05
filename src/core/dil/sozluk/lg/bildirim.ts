import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ Nsaaze', kazayaEkle: 'Gattako ku Qadha', inceleyin: 'Kebera' },
  kanal: {
    genel: 'Obubaka obwa bulijjo',
    muhafiz: 'Omukuumi w’Esswala',
    muhafizAciklama: 'Ebijjukizo by’ebiseera by’esswala',
    acil: 'Ekijjukizo ky’esswala eky’amangu',
    acilAciklama: 'Ekiseera ky’esswala kinaatera okuggwaako - ebijjukizo eby’amangu',
    vakit: 'Ebiseera by’esswala',
    vakitAciklama: 'Ebijjukizo ebisindikibwa ng’ekiseera ky’esswala kituuse',
    muhafizSes: 'Omukuumi w’Esswala · {ses}',
    acilSes: 'Ekijjukizo eky’amangu · {ses}',
    acilSesAciklama: 'Ekiseera ky’esswala kinaatera okuggwaako — ebijjukizo eby’amangu',
    titresimli: '{kanal} · Okukankana',
    alarm: 'Alaamu y’esswala',
    alarmSes: 'Alaamu y’esswala · {ses}',
    uygulamaSesi: 'Eddoboozi lya app',
    seciliSes: 'Eddoboozi ly’olonze',
  },
  cuma: {
    baslik: 'Ejjuma · esigadde {sure} · esswala eri kumpi',
    govdeIlk: 'Esigadde {sure} Dhuhur etuuke. Weetegeke ogende ku muzikiti.',
    govde: 'Esigadde {sure} Dhuhur etuuke. Genda ku muzikiti.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · okwaziina mu dk {dk} · weetegekere omuzikiti',
    hazirlanGovde: 'Weetegeke otuuke ku {ad} ku muzikiti; fuluma mu ddakiika {sonra} — okwaziina mu ddakiika {dk}.',
    yolaCikBaslik: '{ad} · okwaziina mu dk {dk} · genda ku muzikiti',
    yolaCikGovde: 'Genda ku muzikiti otuuke ku {ad} — okwaziina mu ddakiika {dk}.',
  },
  takvim: {
    etkinlikTek: '“{ad}”',
    etkinlikCoklu: cogul({ one: 'Omukolo {n} mu kalenda yo', other: 'Emikolo {n} egiddiriŋŋana mu kalenda yo' }),
    etkinlikBir: 'Omukolo mu kalenda yo',
    sonAnIkindi: 'ekiseera ekisembayo ekisaanidde eky’Aswiri ye {saat} (oluvannyuma kikyayibwa)',
    sonAnVakit: 'ekiseera kya {kucuk} kiggwaako {saat}',
    onceBaslik: '{ad} · omukolo ku {saat} · sooka osaale',
    onceGovde: '{etkinlik} kiri {aralik}; {sonAn}. Saala {kucuk} ng’omukolo tegunnatandika.',
    kaplarBaslik: '{ad} · omukolo gubikka ekiseera ky’esswala',
    kaplarGovde:
      '{etkinlik} kiri {aralik} era kibikka ekiseera kya {kucuk} ({giris}–{son}). Tegeka kati okuwummulamu katono osaale {kucuk}.',
  },
  yatis: {
    yatsiBaslik: '{ad} · saala nga tonnebaka 🌙',
    yatsiGovde: 'Ekiseera kya {ad} kikyagenda; yimirira osaale nga tonnebaka.',
    ozet: 'Leero {kilinan}/5 · {liste} tebiteereddwako kabonero',
    tekOto: 'Bw’oba ogisaaze, giteekeko akabonero. {oto}',
    tekKaza: 'Bw’oba ogisaaze, giteekeko akabonero; bw’oba tosobodde, gigatte ku lukalala lwa Qadha.',
    tekSuruyor: 'Bw’oba ogisaaze, giteekeko akabonero. Ekiseera ky’esswala kikyagenda.',
    cokluOto: 'Ggulawo app okukebera n’okuteeka akabonero ku sswala z’osaaze. {oto}',
    coklu: 'Ggulawo app okukebera n’okuteeka akabonero ku sswala z’osaaze.',
    otoSor: 'Bw’otoziteekako kabonero, ojja kubuuzibwa ku lunaku luno mu lukalala lwa Qadha.',
    otoEkle: 'Bw’otoziteekako kabonero, zijja kugattibwa ku Qadha ng’olunaku lw’esswala luwedde.',
  },
  gunSonu: {
    baslik: 'Esswala za leero teziwedde · omuddiriŋŋanwa',
    govde: 'Bw’oteeka akabonero ku sswala z’osaaze nga olunaku terunnaggwa, omuddiriŋŋanwa gwo gugenda mu maaso.',
  },
};
