import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Hatırlatma bildirimleri. İbadete çağrı "आप" + saygı emri (cuma, mescit, takvim, yatsı);
 * işaretleme/muhasebe aynı saygılı kip. Başlıkta vakit adı + süre önde. "Etkinlik" = इवेंट.
 */
export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ नमाज़ पढ़ ली', kazayaEkle: 'क़ज़ा में जोड़ें', inceleyin: 'देखें' },
  kanal: {
    genel: 'आम सूचनाएं',
    muhafiz: 'नमाज़ मुहाफ़िज़',
    muhafizAciklama: 'नमाज़ के वक़्त के रिमाइंडर',
    acil: 'ज़रूरी नमाज़ रिमाइंडर',
    acilAciklama: 'नमाज़ का वक़्त ख़त्म होने वाला है - ज़रूरी रिमाइंडर',
    vakit: 'नमाज़ के वक़्त',
    vakitAciklama: 'नमाज़ का वक़्त शुरू होने पर भेजे जाने वाले रिमाइंडर',
    muhafizSes: 'नमाज़ मुहाफ़िज़ · {ses}',
    acilSes: 'ज़रूरी रिमाइंडर · {ses}',
    acilSesAciklama: 'नमाज़ का वक़्त ख़त्म होने वाला है — ज़रूरी रिमाइंडर',
    titresimli: '{kanal} · वाइब्रेशन के साथ',
    alarm: 'नमाज़ अलार्म',
    alarmSes: 'नमाज़ अलार्म · {ses}',
    uygulamaSesi: 'ऐप की आवाज़',
    seciliSes: 'आपकी चुनी हुई आवाज़',
  },
  cuma: {
    baslik: 'जुमा · {sure} बाक़ी · नमाज़ क़रीब है',
    govdeIlk: 'ज़ुहर के वक़्त में {sure} बाक़ी हैं। तैयारी करें और मस्जिद के लिए निकलें।',
    govde: 'ज़ुहर के वक़्त में {sure} बाक़ी हैं। मस्जिद के लिए निकलें।',
  },
  camiye: {
    hazirlanBaslik: '{ad} · अज़ान में {dk} मिनट · मस्जिद की तैयारी करें',
    hazirlanGovde: '{ad} की नमाज़ मस्जिद में पाने के लिए तैयारी करें, {sonra} मिनट बाद निकलें — अज़ान में {dk} मिनट।',
    yolaCikBaslik: '{ad} · अज़ान में {dk} मिनट · मस्जिद के लिए निकलें',
    yolaCikGovde: '{ad} की नमाज़ मस्जिद में पाने के लिए निकलें — अज़ान में {dk} मिनट।',
  },
  takvim: {
    etkinlikTek: '“{ad}”',
    etkinlikCoklu: cogul({ one: 'आपके कैलेंडर का {n} इवेंट', other: 'आपके कैलेंडर के {n} लगातार इवेंट' }),
    etkinlikBir: 'आपके कैलेंडर का एक इवेंट',
    sonAnIkindi: 'अस्र का आख़िरी मुनासिब वक़्त {saat} है (उसके बाद मकरूह वक़्त)',
    sonAnVakit: '{kucuk} का वक़्त {saat} पर ख़त्म होता है',
    onceBaslik: '{ad} · इवेंट {saat} · पहले नमाज़ पढ़ें',
    onceGovde: '{etkinlik} का समय {aralik} है; {sonAn}। इवेंट शुरू होने से पहले {kucuk} की नमाज़ पढ़ लें।',
    kaplarBaslik: '{ad} · इवेंट नमाज़ के वक़्त में पड़ रहा है',
    kaplarGovde:
      '{etkinlik} का समय {aralik} है और यह {kucuk} के वक़्त ({giris}–{son}) में पड़ रहा है। अभी से थोड़ा वक़्फ़ा लेकर {kucuk} की नमाज़ पढ़ने की योजना बनाएं।',
  },
  yatis: {
    yatsiBaslik: '{ad} · सोने से पहले पढ़ें 🌙',
    yatsiGovde: '{ad} का वक़्त अभी जारी है; सोने से पहले नमाज़ के लिए खड़े हो जाएं।',
    ozet: 'आज {kilinan}/5 · {liste} पर निशान नहीं',
    tekOto: 'अगर आपने नमाज़ पढ़ ली है तो निशान लगाएं। {oto}',
    tekKaza: 'अगर आपने नमाज़ पढ़ ली है तो निशान लगाएं; नहीं पढ़ी गई तो उसे क़ज़ा रिकॉर्ड में जोड़ें।',
    tekSuruyor: 'अगर आपने नमाज़ पढ़ ली है तो निशान लगाएं। वक़्त अभी जारी है।',
    cokluOto: 'पढ़ी गई नमाज़ों पर निशान लगाने के लिए ऐप खोलकर देखें। {oto}',
    coklu: 'पढ़ी गई नमाज़ों पर निशान लगाने के लिए ऐप खोलकर देखें।',
    otoSor: 'निशान न लगाने पर क़ज़ा रिकॉर्ड में इस दिन के बारे में आपसे पूछा जाएगा।',
    otoEkle: 'निशान न लगाने पर नमाज़ का दिन ख़त्म होते ही इन्हें क़ज़ा में जोड़ दिया जाएगा।',
  },
  gunSonu: {
    baslik: 'आज का दिन पूरा नहीं हुआ · सिलसिला',
    govde: 'दिन ख़त्म होने से पहले पढ़ी गई नमाज़ों पर निशान लगाएं तो आपका सिलसिला जारी रहेगा।',
  },
};
