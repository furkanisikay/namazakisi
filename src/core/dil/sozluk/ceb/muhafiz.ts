import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı: zamirsiz kısa emir ("Mag-ampo na"), zamir gerekirse saygılı çoğul "kamo/ninyo";
 * "po" yok (Sebuanoda yok), "palihug" ve "!" yok (sahip kararı). Secde karşılığı YAZILMAZ →
 * "mag-ampo na". Başlıkta süre birimi "m": "Maghrib · 655m na" ilk 16 karaktere sığar.
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: '{ad} · {dk}m na · oras na sa Salah ⏰',
    giris2: '{ad} · {dk}m na · ayaw langana ang Salah ⚠️',
    giris3: '{ad} · {dk}m na · naghulat ang Salah 🔥',
    giris4: '{ad} · {dk}m na · MAG-AMPO NA 🚨',
    erken3: '{ad} · {dk}m pa · naghulat ang Salah 🔥',
    erken4: '{ad} · {dk}m pa · MAG-AMPO NA 🚨',
    cikis1: '{ad} · {dk}m pa ⏰',
    cikis2: '{ad} · {dk}m · nagkadiyot na ang oras ⚠️',
    cikis3: '{ad} · {dk}m · hapit na mahurot ang oras 🔥',
    cikis4: '{ad} · {dk}m · HAPIT NA MATAPOS ANG ORAS 🚨',
  },
  girisHavuzu: {
    s1: ['Oras na sa Salah; mag-ampo samtang may higayon pa.', 'Mag-ampo samtang anaa pa ang oras; ayaw kini langana.'],
    s2: ['Kon dugay langanon, mas mobug-at; ayaw ibilin ang Salah sa katapusan.', 'Nagpadayon ang oras — mag-ampo na karon.'],
    s3: [
      'Kon dugay malangan, mas duol nga malabyan kini; mag-ampo na karon.',
      'Ayaw ingna nga "unya na lang ko mag-ampo"; makaampo kamo karon.',
      'Barog na karon kaysa moingon og "unta" human sa pipila ka minuto.',
    ],
    s4: ['Ayaw na langana ang Salah — mag-ampo na karon.', 'Biyai una ang inyong gibuhat ug barog alang sa Salah.'],
  },
  govde: {
    s1: 'Nagsugod na pagkadiyot ang oras; mag-ampo samtang may higayon pa.',
    s2: 'Ayaw ibilin ang Salah sa katapusan; maayong higayon karon sa pag-ampo.',
    s3: 'Hapit na mahurot ang oras; makaampo pa kamo karon.',
    s4: 'Kon nakaampo na kamo, i-tap ang "Nag-ampo ko"; kon wala pa, mag-ampo na karon.',
  },
  serit: {
    giris4: 'AYAW LANGANA ANG SALAH. Mag-ampo na karon. (milabay ang {dk} min)',
    giris2: 'Nagpadayon ang oras; ayaw ibilin ang Salah sa katapusan. (milabay ang {dk} min)',
    giris1: cogul({ one: '{n} ka minuto na sukad misulod ang oras sa Salah.', other: '{n} ka minuto na sukad misulod ang oras sa Salah.' }),
    erken4: 'Ayaw langana ang Salah; mag-ampo na karon. ({dk} min pa)',
    cikis4: 'HAPIT NA MATAPOS ANG ORAS. Mag-ampo na karon. ({dk} min pa)',
    cikis2: 'Nagkadiyot na ang oras; ayaw ibilin ang Salah sa katapusan. ({dk} min pa)',
    cikis1: cogul({ one: '{n} ka minuto na lang una matapos ang oras sa Salah.', other: '{n} ka minuto na lang una matapos ang oras sa Salah.' }),
  },
  geceCapasi: {
    baslik: '{ad} · mag-ampo una matulog ⏰',
    govde: 'Magsugod ang hilom nga oras sulod sa {dk} min; mag-ampo sa Isha una matulog.',
  },
  icerik: {
    firsat: 'Nagsugod na pagkadiyot ang oras; mag-ampo samtang may higayon pa.',
    sonaBirakma: 'Ayaw ibilin ang Salah sa katapusan; maayong higayon karon sa pag-ampo.',
    fisilti: 'Ayaw ingna nga "unya na lang ko mag-ampo"; hapit na mahurot ang oras, makaampo pa kamo karon.',
    omur: 'Nagpadayon ang panahon; may higayon pa kamo nga mag-ampo niini sa husto nga oras.',
    keske: 'Barog na karon kaysa moingon og "unta" human sa pipila ka minuto.',
    namazaDur: 'Kon nakaampo na kamo, i-tap ang "Nag-ampo ko"; kon wala pa, mag-ampo na karon.',
    sonDakika: 'Ang katapusang mga minuto. Biyai una ang inyong gibuhat ug barog alang sa Salah.',
  },
};
