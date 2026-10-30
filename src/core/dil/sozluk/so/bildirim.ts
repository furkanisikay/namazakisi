import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ Waan tukaday', kazayaEkle: 'Ku dar qadaa', inceleyin: 'Eeg' },
  kanal: {
    genel: 'Ogeysiisyada guud',
    muhafiz: 'Ilaaliyaha Salaadda',
    muhafizAciklama: 'Xusuusinta waqtiyada salaadda',
    acil: 'Xusuusin degdeg ah oo salaadeed',
    acilAciklama: 'Waqtiga salaaddu wuu dhammaanayaa - xusuusin degdeg ah',
    vakit: 'Waqtiyada salaadda',
    vakitAciklama: 'Xusuusinta la diro marka waqti salaadeed galo',
    muhafizSes: 'Ilaaliyaha Salaadda · {ses}',
    acilSes: 'Xusuusin degdeg ah · {ses}',
    acilSesAciklama: 'Waqtiga salaaddu wuu dhammaanayaa — xusuusin degdeg ah',
    titresimli: '{kanal} · Gariir',
    alarm: 'Alaarmiga salaadda',
    alarmSes: 'Alaarmiga salaadda · {ses}',
    uygulamaSesi: 'Codka barnaamijka',
    seciliSes: 'Codka aad dooratay',
  },
  cuma: {
    baslik: 'Jimce · {sure} haray · salaaddu way dhow dahay',
    govdeIlk: '{sure} ayaa u hartay Duhur. Diyaar garow oo u dhaqaaq masjidka.',
    govde: '{sure} ayaa u hartay Duhur. U dhaqaaq masjidka.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · {dk}daq aadaanka · u diyaar garow masjidka',
    hazirlanGovde: 'Diyaar garow si aad {ad} ugu gaarto masjidka; ka bax {sonra} daqiiqo kadib — aadaanku waa {dk} daqiiqo kadib.',
    yolaCikBaslik: '{ad} · {dk}daq aadaanka · u dhaqaaq masjidka',
    yolaCikGovde: 'U dhaqaaq masjidka si aad {ad} u gaarto — aadaanku waa {dk} daqiiqo kadib.',
  },
  takvim: {
    etkinlikTek: '“{ad}”',
    etkinlikCoklu: cogul({ one: '{n} dhacdo oo jadwalkaaga ku jirta', other: '{n} dhacdo oo isku xiga oo jadwalkaaga ku jira' }),
    etkinlikBir: 'Dhacdo jadwalkaaga ku jirta',
    sonAnIkindi: 'waqtiga ugu dambeeya ee ku habboon Casar waa {saat} (intaas kadib waa makruuh)',
    sonAnVakit: 'waqtiga {kucuk} wuxuu dhammaanayaa {saat}',
    onceBaslik: '{ad} · dhacdo {saat} · marka hore tuko',
    onceGovde: '{etkinlik} waxay socotaa {aralik}; {sonAn}. Tuko {kucuk} ka hor inta aysan dhacdadu bilaabmin.',
    kaplarBaslik: '{ad} · dhacdo ayaa qabsatay waqtiga salaadda',
    kaplarGovde:
      '{etkinlik} waxay socotaa {aralik} waxayna qabsataa waqtiga {kucuk} ({giris}–{son}). Hadda qorshee inaad nasasho gaaban qaadato oo tukato {kucuk}.',
  },
  yatis: {
    yatsiBaslik: '{ad} · tuko intaadan seexan 🌙',
    yatsiGovde: 'Waqtiga {ad} weli wuu socdaa; oog salaadda intaadan hurdin.',
    ozet: 'Maanta {kilinan}/5 · {liste} lama calaamadeyn',
    tekOto: 'Haddii aad tukatay, calaamadee. {oto}',
    tekKaza: 'Haddii aad tukatay, calaamadee; haddii aadan awoodin, ku dar Buugga qadaa.',
    tekSuruyor: 'Haddii aad tukatay, calaamadee. Waqtiga salaaddu weli wuu socdaa.',
    cokluOto: 'Fur barnaamijka si aad u eegto oo u calaamadeyso salaadaha aad tukatay. {oto}',
    coklu: 'Fur barnaamijka si aad u eegto oo u calaamadeyso salaadaha aad tukatay.',
    otoSor: 'Haddii aadan calaamadeyn, maalintan waxaa lagu weydiin doonaa Buugga qadaa.',
    otoEkle: 'Haddii aadan calaamadeyn, waxaa lagu dari doonaa qadaa marka maalinta salaaddu dhammaato.',
  },
  gunSonu: {
    baslik: 'Maanta ma dhammaystirna · taxane',
    govde: 'Haddii aad calaamadeyso salaadaha aad tukatay ka hor inta aysan maalintu dhammaan, taxanahaagu wuu sii socdaa.',
  },
};
