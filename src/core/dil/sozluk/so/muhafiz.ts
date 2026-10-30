import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Codsiga cibaadada ee Soomaaliga: amar toos ah oo gaaban, "fadlan" ma jiro. "Oog salaadda" waa
 * QuranEnc `somali_yacob` 17:78; "tuko" waa falka tukasho (la soo saaray). Sujuud laguma amro
 * (mamnuucidda "secdeye kapan" ee Turkiga). Cinwaanka, cutubka daqiiqadu waa "daq":
 * "Maghrib · 655daq" wuxuu ku jiraa 16-ka xaraf ee ugu horreeya.
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: '{ad} · {dk}daq dhaafay · waa waqtigii salaadda ⏰',
    giris2: '{ad} · {dk}daq dhaafay · salaaddaada dib ha u dhigin ⚠️',
    giris3: '{ad} · {dk}daq dhaafay · salaaddaadu way ku sugaysaa 🔥',
    giris4: '{ad} · {dk}daq dhaafay · OOG SALAADDA 🚨',
    erken3: '{ad} · {dk}daq haray · salaaddaadu way ku sugaysaa 🔥',
    erken4: '{ad} · {dk}daq haray · OOG SALAADDA 🚨',
    cikis1: '{ad} · {dk}daq haray ⏰',
    cikis2: '{ad} · {dk}daq · waqtigu wuu yaraanayaa ⚠️',
    cikis3: '{ad} · {dk}daq · waqtigu wuu kaa baxayaa 🔥',
    cikis4: '{ad} · {dk}daq · WAQTIGU WUU DHAMMAANAYAA 🚨',
  },
  girisHavuzu: {
    s1: ['Waa waqtigii salaadda; tuko inta fursaddu jirto.', 'Tuko inta waqtigu kuu furan yahay; mar dambe ha u dhigin.'],
    s2: ['Inta aad dib u dhigto, way sii culaysaa; salaaddaada ha u dhigin dhammaadka.', 'Waqtigu wuu socdaa — hadda tuko.'],
    s3: [
      'Inta aad dib u dhigto, waxaad u dhowaanaysaa inay kaa dhaafto; hadda tuko.',
      'Ha oran "mar dambe ayaan tukan doonaa"; hadda waad tukan kartaa.',
      'Hadda kac intaadan dhowr daqiiqo kadib oran "haddii aan…".',
    ],
    s4: ['Salaaddaada dib dambe ha u dhigin — hadda oog salaadda.', 'Dhig waxa aad samaynayso oo oog salaadda.'],
  },
  govde: {
    s1: 'Waqtigu wuu bilaabay inuu yaraado; tuko inta fursaddu jirto.',
    s2: 'Salaaddaada ha u dhigin dhammaadka; hadda waa waqti wanaagsan oo aad tukato.',
    s3: 'Waqtigu wuu dhammaad ku dhow yahay; hadda weli waad tukan kartaa.',
    s4: 'Haddii aad tukatay, taabo "Waan tukaday"; haddii kale, hadda oog salaadda.',
  },
  serit: {
    giris4: 'SALAADDAADA DIB HA U DHIGIN. Hadda oog salaadda. ({dk} daqiiqo ayaa dhaafay)',
    giris2: 'Waqtigu wuu socdaa; salaaddaada ha u dhigin dhammaadka. ({dk} daqiiqo ayaa dhaafay)',
    giris1: cogul({ one: '{n} daqiiqo ayaa ka soo wareegtay markii waqtiga salaaddu galay.', other: '{n} daqiiqo ayaa ka soo wareegtay markii waqtiga salaaddu galay.' }),
    erken4: 'Salaaddaada dib ha u dhigin; hadda oog salaadda. ({dk} daqiiqo ayaa haray)',
    cikis4: 'WAQTIGU WUU DHAMMAANAYAA. Hadda oog salaadda. ({dk} daqiiqo ayaa haray)',
    cikis2: 'Waqtigu wuu yaraanayaa; salaaddaada ha u dhigin dhammaadka. ({dk} daqiiqo ayaa haray)',
    cikis1: cogul({ one: '{n} daqiiqo ayaa u hartay dhammaadka waqtiga salaadda.', other: '{n} daqiiqo ayaa u hartay dhammaadka waqtiga salaadda.' }),
  },
  geceCapasi: {
    baslik: '{ad} · tuko intaadan seexan ⏰',
    govde: 'Saacadaha aamusnaantu waxay bilaabanayaan {dk} daqiiqo kadib; tuko Cishe intaadan seexan.',
  },
  icerik: {
    firsat: 'Waqtigu wuu bilaabay inuu yaraado; tuko inta fursaddu jirto.',
    sonaBirakma: 'Salaaddaada ha u dhigin dhammaadka; hadda waa waqti wanaagsan oo aad tukato.',
    fisilti: 'Ha oran "mar dambe ayaan tukan doonaa"; waqtigu wuu dhammaad ku dhow yahay, hadda waad tukan kartaa.',
    omur: 'Waqtigu wuu dhaafayaa; weli fursad ayaad u haysataa inaad salaaddan waqtigeeda ku tukato.',
    keske: 'Hadda kac intaadan dhowr daqiiqo kadib oran "haddii aan…".',
    namazaDur: 'Haddii aad tukatay, taabo "Waan tukaday"; haddii kale, hadda oog salaadda.',
    sonDakika: 'Daqiiqadaha ugu dambeeya. Dhig waxa aad samaynayso oo oog salaadda.',
  },
};
