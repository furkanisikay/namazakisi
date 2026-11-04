import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Hatırlatma bildirimleri. İbadete çağrı "तपाईं" + ‑नुहोस् emri (cuma, mescit, takvim, yatsı);
 * işaretleme/muhasebe aynı saygılı kip. Başlıkta vakit adı + süre önde. "Etkinlik" = कार्यक्रम.
 */
export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ नमाज पढें', kazayaEkle: 'कजामा थप्नुहोस्', inceleyin: 'हेर्नुहोस्' },
  kanal: {
    genel: 'सामान्य सूचना',
    muhafiz: 'नमाज रक्षक',
    muhafizAciklama: 'नमाजको समयका रिमाइन्डर',
    acil: 'जरुरी नमाज रिमाइन्डर',
    acilAciklama: 'नमाजको समय सकिन लागेको छ - जरुरी रिमाइन्डर',
    vakit: 'नमाजका समय',
    vakitAciklama: 'नमाजको समय सुरु हुँदा पठाइने रिमाइन्डर',
    muhafizSes: 'नमाज रक्षक · {ses}',
    acilSes: 'जरुरी रिमाइन्डर · {ses}',
    acilSesAciklama: 'नमाजको समय सकिन लागेको छ — जरुरी रिमाइन्डर',
    titresimli: '{kanal} · कम्पनसहित',
    alarm: 'नमाज अलार्म',
    alarmSes: 'नमाज अलार्म · {ses}',
    uygulamaSesi: 'एपको ध्वनि',
    seciliSes: 'तपाईंले छानेको ध्वनि',
  },
  cuma: {
    baslik: 'जुमा · {sure} बाँकी · नमाज नजिक छ',
    govdeIlk: 'जुहरको समयमा {sure} बाँकी छ। तयारी गर्नुहोस् र मस्जिदतर्फ निस्कनुहोस्।',
    govde: 'जुहरको समयमा {sure} बाँकी छ। मस्जिदतर्फ निस्कनुहोस्।',
  },
  camiye: {
    hazirlanBaslik: '{ad} · अजानमा {dk} मिनेट · मस्जिदको तयारी गर्नुहोस्',
    hazirlanGovde: '{ad}को नमाज मस्जिदमा भेट्न तयारी गर्नुहोस्, {sonra} मिनेटपछि निस्कनुहोस् — अजानमा {dk} मिनेट।',
    yolaCikBaslik: '{ad} · अजानमा {dk} मिनेट · मस्जिदतर्फ निस्कनुहोस्',
    yolaCikGovde: '{ad}को नमाज मस्जिदमा भेट्न निस्कनुहोस् — अजानमा {dk} मिनेट।',
  },
  takvim: {
    etkinlikTek: '“{ad}”',
    etkinlikCoklu: cogul({ one: 'तपाईंको क्यालेन्डरको {n} कार्यक्रम', other: 'तपाईंको क्यालेन्डरका {n} लगातार कार्यक्रम' }),
    etkinlikBir: 'तपाईंको क्यालेन्डरको एउटा कार्यक्रम',
    sonAnIkindi: 'अस्रको अन्तिम उपयुक्त समय {saat} हो (त्यसपछि मकरुह समय)',
    sonAnVakit: '{kucuk}को समय {saat} मा सकिन्छ',
    onceBaslik: '{ad} · कार्यक्रम {saat} मा · पहिले नमाज पढ्नुहोस्',
    onceGovde: '{etkinlik}को समय {aralik} हो; {sonAn}। कार्यक्रम सुरु हुनुअघि {kucuk}को नमाज पढ्नुहोस्।',
    kaplarBaslik: '{ad} · कार्यक्रम नमाजको समयमा पर्छ',
    kaplarGovde:
      '{etkinlik}को समय {aralik} हो र यो {kucuk}को समय ({giris}–{son}) मा पर्छ। अहिलेदेखि नै केही बेर विश्राम लिएर {kucuk}को नमाज पढ्ने योजना बनाउनुहोस्।',
  },
  yatis: {
    yatsiBaslik: '{ad} · सुत्नुअघि पढ्नुहोस् 🌙',
    yatsiGovde: '{ad}को समय अझै छ; निदाउनुअघि नमाजमा उभिनुहोस्।',
    ozet: 'आज {kilinan}/5 · {liste}मा चिन्ह छैन',
    tekOto: 'नमाज पढिसक्नुभएको छ भने चिन्ह लगाउनुहोस्। {oto}',
    tekKaza: 'नमाज पढिसक्नुभएको छ भने चिन्ह लगाउनुहोस्; पढ्न सक्नुभएन भने कजा रेकर्डमा थप्नुहोस्।',
    tekSuruyor: 'नमाज पढिसक्नुभएको छ भने चिन्ह लगाउनुहोस्। नमाजको समय अझै छ।',
    cokluOto: 'पढिएका नमाजमा चिन्ह लगाउन एप खोलेर हेर्नुहोस्। {oto}',
    coklu: 'पढिएका नमाजमा चिन्ह लगाउन एप खोलेर हेर्नुहोस्।',
    otoSor: 'चिन्ह नलगाए कजा रेकर्डमा यो दिनबारे तपाईंलाई सोधिने छ।',
    otoEkle: 'चिन्ह नलगाए नमाजको दिन सकिनेबित्तिकै यिनलाई कजामा थपिने छ।',
  },
  gunSonu: {
    baslik: 'आज पूरा भएन · निरन्तरता',
    govde: 'दिन सकिनुअघि पढिएका नमाजमा चिन्ह लगाउनुभयो भने तपाईंको निरन्तरता जारी रहन्छ।',
  },
};
