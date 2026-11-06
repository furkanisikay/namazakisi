import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'तुमची मालिका सुरू आहे',
    enUzun: cogul({ one: 'सर्वात मोठी मालिका: {n} दिवस', other: 'सर्वात मोठी मालिका: {n} दिवस' }),
    gunBuyuk: cogul({ one: 'दिवस', other: 'दिवस' }),
    sonrakiHedef: 'पुढील ध्येय: दिवस {hedef} ({durum})',
    kalanGun: cogul({ one: '{n} दिवस बाकी', other: '{n} दिवस बाकी' }),
    tamamlandi: 'पूर्ण झाले',
    paylasErisim: 'तुमची प्रगती शेअर करा',
    paylasBuyuk: 'तुमची प्रगती शेअर करा',
  },

  hedefler: {
    ilk_adim: { ad: 'पहिला आठवडा', aciklama: 'खंड न पडता 7 दिवस नमाज अदा करा', cumle: 'पहिला आठवडा' },
    aliskanlik_ustasi: { ad: 'सवयीचा जाणकार', aciklama: '21 दिवस - सवय लागण्याचा काळ', cumle: 'सवयीचा जाणकार' },
    kararlilik: { ad: 'दृढता', aciklama: 'खंड न पडता 60 दिवस', cumle: 'दृढता' },
    efsane: { ad: 'आख्यायिका', aciklama: '90 दिवस - असामान्य चिकाटी', cumle: 'आख्यायिका' },
  },

  /** Klasik mertebe adları harf çevirisiyle (çevrilmez; Hintçe emsali, nuktasız). */
  seviyeler: ['मुब्तदी', 'तालिब', 'सालिक', 'मुरीद', 'आरिफ', 'हाफिज', 'कामिल'],

  rozetler: {
    ilk_adim: { ad: 'पहिले पाऊल', aciklama: 'तुम्ही तुमचा पहिला आठवडा पूर्ण केला', kosul: '7 दिवसांची मालिका' },
    aliskanlik_ustasi: {
      ad: 'सवयीचा जाणकार',
      aciklama: '21 दिवस - सवय लागण्याचा काळ पूर्ण झाला',
      kosul: '21 दिवसांची मालिका',
    },
    kararlilik: { ad: 'दृढ', aciklama: 'तुम्ही खंड न पडता 60 दिवस नमाज अदा केली', kosul: '60 दिवसांची मालिका' },
    efsane: { ad: 'आख्यायिका', aciklama: '90 दिवस - तुम्ही असामान्य चिकाटी दाखवली', kosul: '90 दिवसांची मालिका' },
    toparlanma_ustasi: {
      ad: 'सावरण्यात जाणकार',
      aciklama: 'तुम्ही सावरण्याचा मोड 3 वेळा पूर्ण केला',
      kosul: '3 वेळा सावरणे',
    },
    mukemmeliyetci: { ad: 'परिपूर्णतावादी', aciklama: 'तुम्ही 30 दिवस 5/5 नमाज अदा केल्या', kosul: '30 दिवस 5/5 नमाज' },
    yuz_namaz: { ad: '100 नमाज', aciklama: 'तुम्ही एकूण 100 नमाज अदा केल्या', kosul: '100 नमाज अदा करा' },
    bin_namaz: { ad: '1000 नमाज', aciklama: 'तुम्ही एकूण 1000 नमाज अदा केल्या', kosul: '1000 नमाज अदा करा' },
  },

  rozetSeviyeleri: { bronz: 'कांस्य', gumus: 'रौप्य', altin: 'सुवर्ण', elmas: 'हिरा' },

  gunBitis: {
    erken: 'लवकर झोपणाऱ्यांसाठी',
    varsayilan: 'डीफॉल्ट - बहुतेक ठिकाणी फज्रपूर्वी',
    gec: 'उशिरा झोपणाऱ्यांसाठी',
  },

  kutlama: {
    rozetEklendi: '🏅 तुमच्या बॅज संग्रहात जोडला',
    paylasin: 'शेअर करा',
    rozetBaslik: 'अल्लाह हे कायम ठेवो',
    rozetMesaj: 'तुम्हाला "{ad}" बॅज मिळाला.',
    hedefBaslik: cogul({ one: '{n} दिवस', other: '{n} दिवस' }),
    hedefMesaj: 'तुम्ही "{ad}" हे ध्येय पूर्ण केले. अल्लाह हे कायम ठेवो.',
    yeniRank: 'नवीन दर्जा: {rank}',
    seviyeBaslik: 'तुमचा नवीन स्तर',
    seviyeMesaj: 'आता तुम्ही "{rank}" म्हणून पुढे जात आहात. अल्लाह हे कायम ठेवो.',
    toparlanmaBaslik: 'तुमची मालिका परत आली',
    toparlanmaMesaj: cogul({
      one: 'तुमची {n} दिवसांची मालिका जिथे थांबली होती तिथून पुढे सुरू आहे. अल्लाह दृढता देवो.',
      other: 'तुमची {n} दिवसांची मालिका जिथे थांबली होती तिथून पुढे सुरू आहे. अल्लाह दृढता देवो.',
    }),
    enUzunBaslik: 'तुमची सर्वात मोठी मालिका',
    enUzunMesaj: cogul({
      one: '{n} दिवस: आतापर्यंतची तुमची सर्वात मोठी मालिका. अल्लाह हे कायम ठेवो.',
      other: '{n} दिवस: आतापर्यंतची तुमची सर्वात मोठी मालिका. अल्लाह हे कायम ठेवो.',
    }),
  },

  sekme: {
    hataOkunamadi: 'तुमच्या मागील नोंदी आत्ता वाचता आल्या नाहीत.',
    yenidenErisim: 'मालिकेचा डेटा पुन्हा लोड करा',
    yenidenDeneyin: 'पुन्हा प्रयत्न करा',
    yukleniyor: 'तुमच्या मालिकेचा डेटा लोड होत आहे...',
    gunlukSeri: 'दिवसांची मालिका',
    rekor: 'विक्रम',
    sozErisim: '{metin} स्रोत: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'पुढील ध्येय',
    tumu: 'तुम्ही सर्व बॅज पूर्ण केले',
    kalan: cogul({ one: '{ad} बॅज: {n} दिवस बाकी', other: '{ad} बॅज: {n} दिवस बाकी' }),
    tumuErisim: 'तुम्ही सर्व बॅज पूर्ण केले: तस्बीह पूर्ण झाली.',
    erisim: '{ad} बॅज: {hedef} पैकी {n} दिवस पूर्ण.',
  },

  gok: {
    gunHarfleri: ['सो', 'मं', 'बु', 'गु', 'शु', 'श', 'र'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ one: '{n} दिवस ध्येय गाठले', other: '{n} दिवस ध्येय गाठले' }),
    besVakit: cogul({ one: 'पाचही नमाज झालेला {n} दिवस', other: 'पाचही नमाज झालेले {n} दिवस' }),
    dondurulmus: cogul({ one: '{n} दिवस गोठवलेला', other: '{n} दिवस गोठवलेले' }),
    mevcutSeri: cogul({ one: 'सध्याची मालिका: {n} दिवस.', other: 'सध्याची मालिका: {n} दिवस.' }),
  },

  hedefAyar: {
    azalt: 'कमी करा',
    deger: 'मूल्य',
    artir: 'वाढवा',
    esik: cogul({ one: '{n} नमाज', other: '{n} नमाज' }),
    sifirlaBaslik: 'मालिका रीसेट करा',
    sifirlaMesaj: 'तुमचा मालिकेचा सर्व डेटा (मालिका, बॅज, गुण) रीसेट होईल. हे पूर्ववत करता येणार नाही. पुढे सुरू ठेवायचे का?',
    sifirla: 'रीसेट करा',
    iptal: 'रद्द करा',
    basarili: 'झाले',
    sifirlandi: 'तुमचा मालिकेचा डेटा रीसेट केला.',
    hedefAyarlari: 'ध्येयाच्या सेटिंग्ज',
    tamGunEsigi: 'पूर्ण दिवसाची मर्यादा',
    tamGunAciklama: 'एखादा दिवस मालिकेत मोजला जाण्यासाठी त्या दिवशी लागणाऱ्या किमान नमाजची संख्या ठरवते',
    sifirlama: 'रीसेट',
    verileriSifirla: 'मालिकेचा डेटा रीसेट करा',
    verileriSifirlaAlt: 'मालिका, बॅज आणि गुणांचा सर्व डेटा हटवते',
  },

  rozetKarti: {
    erisim: '{ad} बॅज, {durum}',
    kazanildi: 'मिळाला',
    kilitli: 'लॉक केलेला',
  },

  toparlanma: {
    kartBaslik: 'सावरण्याचा मोड',
    kartAltBaslik: 'तुम्ही तुमची मालिका परत मिळवू शकता',
    kartMesaj: 'तुमची {vurgu} मालिका जिथे थांबली होती तिथून तुम्ही पुढे सुरू ठेवू शकता.',
    oncekiGun: cogul({ one: '{n} दिवसांची', other: '{n} दिवसांची' }),
    ilerleme: '{tamam}/{hedef} दिवस पूर्ण',
    kalan: cogul({
      one: 'आणखी {n} दिवस पाचही नमाज पूर्ण करा आणि तुमची मालिका जिथे थांबली होती तिथून पुढे सुरू होईल.',
      other: 'आणखी {n} दिवस पाचही नमाज पूर्ण करा आणि तुमची मालिका जिथे थांबली होती तिथून पुढे सुरू होईल.',
    }),
    bugun: 'आजचा दिवस पूर्ण करा आणि तुमची मालिका जिथे थांबली होती तिथून पुढे सुरू होईल.',
    uyari: 'दिवस सलग असायला हवेत; मध्ये एखादा दिवस चुकल्यास सावरणे पुन्हा पहिल्यापासून सुरू होते.',
    kapatErisim: 'सावरण्याचा तपशील बंद करा',
    anladim: 'समजले',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'तुमची प्रगती शेअर करा',
    hazirDegilBaslik: 'चित्र तयार नाही',
    hazirDegilMesaj: 'चित्र अजून तयार नाही. काही सेकंदांनी पुन्हा प्रयत्न करा.',
    olusturulamadiBaslik: 'चित्र तयार करता आले नाही',
    olusturulamadiMesaj: 'चित्र तयार करताना काहीतरी चुकले. पुन्हा प्रयत्न करा.',
    kullanilamiyorBaslik: 'शेअर करणे उपलब्ध नाही',
    kullanilamiyorMesaj: 'या डिव्हाइसवर शेअर करणे उपलब्ध नाही.',
    kapat: 'बंद करा',
    hikaye: 'तुमच्या स्टोरीमध्ये जोडा',
    platformlar: 'Instagram, WhatsApp आणि इतरांवर शेअर करता येते.',
    tamam: 'ठीक आहे',
    seriEnUzun: cogul({ one: 'माझी सर्वात मोठी मालिका: {n} दिवस', other: 'माझी सर्वात मोठी मालिका: {n} दिवस' }),
    seriZincir: cogul({ one: 'दिवस साखळी न तुटता', other: 'दिवस साखळी न तुटता' }),
    seriSoz: '"दररोज एक छोटे पाऊल, माझ्या मनाला मोठी शांती. 🔥"',
    rozetYeni: 'मी नवीन बॅज मिळवला',
    rozetSozleri: [
      'आज मी स्वतःसाठी एक चांगले पाऊल उचलले. 🌟',
      'मी निश्चयाने पुढे जात आहे; हा बॅज माझा आहे. 💪',
      'मी सकाळची बरकत मिळवली. 🌅',
      'माझ्या मनाला चांगल्या वाटणाऱ्या या प्रवाहाचा मी भाग आहे. ✨',
      'छोटी पावले मोठी शांती देतात. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'मी नवीन बॅज मिळवला',
      hedef_tamamlandi: 'माझे ध्येय पूर्ण झाले',
      seviye_atlandi: 'नवीन स्तर',
      toparlanma_tamamlandi: 'पुन्हा मार्गावर',
      en_uzun_seri: 'नवीन विक्रम',
      varsayilan: 'यश',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['माझा पालनकर्ता हे कायम ठेवो. 🤲', 'छोटी पावले मोठी शांती देतात. 🍃', 'अल्लाह आपल्या सर्वांना दृढता देवो. 🌱'],
      hedef_tamamlandi: ['छोटी पावले मोठी शांती देतात. 🍃', 'अल्लाह हे कायम ठेवो. 🤲', 'दररोज आणखी एक पाऊल. 🌱'],
      seviye_atlandi: [
        'दररोज थोडे पुढे; अल्लाह सोपे करो. 🍃',
        'अल्लाह हे कायम ठेवो. 🤲',
        'प्रवास सुरू आहे. 🌱',
      ],
      toparlanma_tamamlandi: [
        'पडणे नव्हे, तर उठणे महत्त्वाचे आहे. 🔄',
        'अल्लाह दृढता देवो. 🤲',
        'प्रत्येक वाट संयमाने चालली जाते. 🌱',
      ],
      en_uzun_seri: [
        'दररोज एक छोटे पाऊल, माझ्या हृदयाला मोठी शांती. 🍃',
        'अल्लाह हे कायम ठेवो. 🤲',
        'माझा पालनकर्ता आपल्या सर्वांना दृढता देवो. 🌱',
      ],
    },
  },
};
