import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Seri = સિલસિલો. Paylaşım sözleri kişinin kendi sesidir; Gucaratçada geçişsiz geçmiş zaman
 * konuşanın cinsiyetine göre çekildiği için yalnız geniş/şimdiki zaman, nesneye uyan geçişli
 * geçmiş ("મેં … મેળવ્યો") ya da isim cümlesi kullanılır. "!" yok; dua kalıpları:
 * અલ્લાહ કાયમ રાખે · અલ્લાહ સાબિત કદમ રાખે.
 */
export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'તમારો સિલસિલો ઝળહળે છે',
    enUzun: cogul({ one: 'સૌથી લાંબો સિલસિલો: {n} દિવસ', other: 'સૌથી લાંબો સિલસિલો: {n} દિવસ' }),
    gunBuyuk: cogul({ one: 'દિવસ', other: 'દિવસ' }),
    sonrakiHedef: 'આગામી લક્ષ્ય: દિવસ {hedef} ({durum})',
    kalanGun: cogul({ one: '{n} દિવસ બાકી', other: '{n} દિવસ બાકી' }),
    tamamlandi: 'પૂરું થયું',
    paylasErisim: 'તમારી પ્રગતિ શેર કરો',
    paylasBuyuk: 'તમારી પ્રગતિ શેર કરો',
  },

  hedefler: {
    ilk_adim: { ad: 'પહેલું અઠવાડિયું', aciklama: '7 દિવસ વિના ચૂક્યે નમાઝ પઢો', cumle: 'પહેલું અઠવાડિયું' },
    aliskanlik_ustasi: { ad: 'આદતના ઉસ્તાદ', aciklama: '21 દિવસ - આદત બનવાનો સમયગાળો', cumle: 'આદતના ઉસ્તાદ' },
    kararlilik: { ad: 'સાબિત કદમ', aciklama: '60 દિવસ વિના ચૂક્યે', cumle: 'સાબિત કદમ' },
    efsane: { ad: 'બેમિસાલ', aciklama: '90 દિવસ - અનોખી ઇસ્તિકામત', cumle: 'બેમિસાલ' },
  },

  /** Klasik mertebe adları, Gucarati yazımıyla (çeviri değil). */
  seviyeler: ['મુબ્તદી', 'તાલિબ', 'સાલિક', 'મુરીદ', 'આરિફ', 'હાફિઝ', 'કામિલ'],

  rozetler: {
    ilk_adim: { ad: 'પહેલું પગલું', aciklama: 'તમે પહેલું અઠવાડિયું પૂરું કર્યું.', kosul: '7 દિવસનો સિલસિલો' },
    aliskanlik_ustasi: {
      ad: 'આદતના ઉસ્તાદ',
      aciklama: '21 દિવસ - આદત બનવાનો સમયગાળો પૂરો થયો.',
      kosul: '21 દિવસનો સિલસિલો',
    },
    kararlilik: { ad: 'સાબિત કદમ', aciklama: 'તમે 60 દિવસ વિના ચૂક્યે નમાઝ પઢી.', kosul: '60 દિવસનો સિલસિલો' },
    efsane: { ad: 'બેમિસાલ', aciklama: '90 દિવસ - તમે અનોખી ઇસ્તિકામત બતાવી.', kosul: '90 દિવસનો સિલસિલો' },
    toparlanma_ustasi: {
      ad: 'રિકવરીના ઉસ્તાદ',
      aciklama: 'તમે 3 વાર રિકવરી મોડ પૂરો કર્યો.',
      kosul: '3 વાર રિકવરી',
    },
    mukemmeliyetci: { ad: 'પરિપૂર્ણતાના ચાહક', aciklama: 'તમે 30 દિવસ 5/5 નમાઝો પઢી.', kosul: '30 દિવસ 5/5 નમાઝો' },
    yuz_namaz: { ad: '100 નમાઝો', aciklama: 'તમે કુલ 100 નમાઝો પઢી.', kosul: '100 નમાઝો પઢો' },
    bin_namaz: { ad: '1000 નમાઝો', aciklama: 'તમે કુલ 1000 નમાઝો પઢી.', kosul: '1000 નમાઝો પઢો' },
  },

  rozetSeviyeleri: { bronz: 'કાંસ્ય', gumus: 'ચાંદી', altin: 'સોનું', elmas: 'હીરો' },

  gunBitis: {
    erken: 'વહેલા સૂનારા માટે',
    varsayilan: 'મૂળભૂત - મોટા ભાગની જગ્યાએ ફજર પહેલાં',
    gec: 'મોડા સૂનારા માટે',
  },

  kutlama: {
    rozetEklendi: '🏅 તમારા બેજ સંગ્રહમાં ઉમેરાયો',
    paylasin: 'શેર કરો',
    rozetBaslik: 'અલ્લાહ કાયમ રાખે',
    rozetMesaj: 'તમે "{ad}" બેજ મેળવ્યો.',
    hedefBaslik: cogul({ one: '{n} દિવસ', other: '{n} દિવસ' }),
    hedefMesaj: 'તમે "{ad}" લક્ષ્ય પૂરું કર્યું. અલ્લાહ કાયમ રાખે.',
    yeniRank: 'નવું સ્તર: {rank}',
    seviyeBaslik: 'તમારું નવું સ્તર',
    seviyeMesaj: 'હવે તમે "{rank}" તરીકે આગળ વધો છો. અલ્લાહ કાયમ રાખે.',
    toparlanmaBaslik: 'તમારો સિલસિલો પાછો આવ્યો',
    toparlanmaMesaj: cogul({
      one: 'તમારો {n} દિવસનો સિલસિલો જ્યાં અટક્યો હતો ત્યાંથી ચાલુ છે. અલ્લાહ સાબિત કદમ રાખે.',
      other: 'તમારો {n} દિવસનો સિલસિલો જ્યાં અટક્યો હતો ત્યાંથી ચાલુ છે. અલ્લાહ સાબિત કદમ રાખે.',
    }),
    enUzunBaslik: 'તમારો સૌથી લાંબો સિલસિલો',
    enUzunMesaj: cogul({
      one: '{n} દિવસ: અત્યાર સુધીનો તમારો સૌથી લાંબો સિલસિલો. અલ્લાહ કાયમ રાખે.',
      other: '{n} દિવસ: અત્યાર સુધીનો તમારો સૌથી લાંબો સિલસિલો. અલ્લાહ કાયમ રાખે.',
    }),
  },

  sekme: {
    hataOkunamadi: 'તમારી જૂની નોંધો અત્યારે વાંચી શકાઈ નહીં.',
    yenidenErisim: 'સિલસિલાનો ડેટા ફરી લોડ કરો',
    yenidenDeneyin: 'ફરી પ્રયાસ કરો',
    yukleniyor: 'તમારા સિલસિલાનો ડેટા લોડ થાય છે...',
    gunlukSeri: 'દિવસનો સિલસિલો',
    rekor: 'રેકોર્ડ',
    sozErisim: '{metin} સ્રોત: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'આગામી લક્ષ્ય',
    tumu: 'તમે બધા બેજ મેળવ્યા',
    kalan: cogul({ one: '{ad} બેજ: {n} દિવસ બાકી', other: '{ad} બેજ: {n} દિવસ બાકી' }),
    tumuErisim: 'તમે બધા બેજ મેળવ્યા: તસ્બીહ પૂરી થઈ.',
    erisim: '{ad} બેજ: {hedef}માંથી {n} દિવસ પૂરા.',
  },

  gok: {
    gunHarfleri: ['સો', 'મં', 'બુ', 'ગુ', 'શુ', 'શ', 'ર'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ one: '{n} દિવસ લક્ષ્ય પૂરું થયું', other: '{n} દિવસ લક્ષ્ય પૂરું થયું' }),
    besVakit: cogul({ one: 'પાંચેય નમાઝોવાળો {n} દિવસ', other: 'પાંચેય નમાઝોવાળા {n} દિવસ' }),
    dondurulmus: cogul({ one: '{n} દિવસ થોભાવેલો', other: '{n} દિવસ થોભાવેલા' }),
    mevcutSeri: cogul({ one: 'હાલનો સિલસિલો: {n} દિવસ.', other: 'હાલનો સિલસિલો: {n} દિવસ.' }),
  },

  hedefAyar: {
    azalt: 'ઘટાડો',
    deger: 'મૂલ્ય',
    artir: 'વધારો',
    esik: cogul({ one: '{n} નમાઝ', other: '{n} નમાઝો' }),
    sifirlaBaslik: 'સિલસિલો રીસેટ કરો',
    sifirlaMesaj: 'તમારો સિલસિલાનો બધો ડેટા (સિલસિલો, બેજ, પોઇન્ટ) રીસેટ થશે. આ પાછું લઈ શકાશે નહીં. શું તમે આગળ વધવા માગો છો?',
    sifirla: 'રીસેટ કરો',
    iptal: 'રદ કરો',
    basarili: 'થઈ ગયું',
    sifirlandi: 'તમારો સિલસિલાનો ડેટા રીસેટ થયો.',
    hedefAyarlari: 'લક્ષ્યનાં સેટિંગ',
    tamGunEsigi: 'પૂરા દિવસની મર્યાદા',
    tamGunAciklama: 'દિવસ તમારા સિલસિલામાં ગણાય તે માટે જરૂરી ઓછામાં ઓછી નમાઝોની સંખ્યા ગોઠવે છે',
    sifirlama: 'રીસેટ',
    verileriSifirla: 'સિલસિલાનો ડેટા રીસેટ કરો',
    verileriSifirlaAlt: 'સિલસિલો, બેજ અને પોઇન્ટનો બધો ડેટા ડિલીટ કરે છે',
  },

  rozetKarti: {
    erisim: '{ad} બેજ, {durum}',
    kazanildi: 'મેળવ્યો',
    kilitli: 'લૉક',
  },

  toparlanma: {
    kartBaslik: 'રિકવરી મોડ',
    kartAltBaslik: 'તમે તમારો સિલસિલો પાછો મેળવી શકો છો',
    kartMesaj: 'તમારો {vurgu} સિલસિલો જ્યાં અટક્યો હતો ત્યાંથી ચાલુ રાખી શકો છો.',
    oncekiGun: cogul({ one: '{n} દિવસનો', other: '{n} દિવસનો' }),
    ilerleme: '{hedef}માંથી {tamam} દિવસ પૂરા',
    kalan: cogul({
      one: 'હજુ {n} દિવસ પાંચેય નમાઝો પૂરી કરો, એટલે તમારો સિલસિલો જ્યાં અટક્યો હતો ત્યાંથી ચાલુ થશે.',
      other: 'હજુ {n} દિવસ પાંચેય નમાઝો પૂરી કરો, એટલે તમારો સિલસિલો જ્યાં અટક્યો હતો ત્યાંથી ચાલુ થશે.',
    }),
    bugun: 'આજનો દિવસ પૂરો કરો, એટલે તમારો સિલસિલો જ્યાં અટક્યો હતો ત્યાંથી ચાલુ થશે.',
    uyari: 'દિવસો સળંગ હોવા જોઈએ; વચ્ચે એક દિવસ ચૂકી જાય, તો રિકવરી ફરી શરૂ થાય છે.',
    kapatErisim: 'રિકવરીની વિગતો બંધ કરો',
    anladim: 'સમજાયું',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'તમારી પ્રગતિ શેર કરો',
    hazirDegilBaslik: 'છબી તૈયાર નથી',
    hazirDegilMesaj: 'છબી હજુ તૈયાર નથી. થોડી સેકંડ પછી ફરી પ્રયાસ કરો.',
    olusturulamadiBaslik: 'છબી બની શકી નહીં',
    olusturulamadiMesaj: 'છબી બનાવતી વખતે કંઈક ખોટું થયું. ફરી પ્રયાસ કરો.',
    kullanilamiyorBaslik: 'શેર કરવું ઉપલબ્ધ નથી',
    kullanilamiyorMesaj: 'આ ડિવાઇસ પર શેર કરવું ઉપલબ્ધ નથી.',
    kapat: 'બંધ કરો',
    hikaye: 'તમારી સ્ટોરીમાં ઉમેરો',
    platformlar: 'Instagram, WhatsApp અને બીજે શેર કરી શકાય છે.',
    tamam: 'ઓકે',
    seriEnUzun: cogul({ one: 'મારો સૌથી લાંબો સિલસિલો: {n} દિવસ', other: 'મારો સૌથી લાંબો સિલસિલો: {n} દિવસ' }),
    seriZincir: cogul({ one: 'દિવસથી સિલસિલો તૂટ્યો નથી', other: 'દિવસથી સિલસિલો તૂટ્યો નથી' }),
    seriSoz: '"દરરોજ એક નાનું પગલું, રૂહમાં મોટું સુકૂન. 🔥"',
    rozetYeni: 'મેં નવો બેજ મેળવ્યો',
    rozetSozleri: [
      'આજે મેં મારા માટે એક સારું પગલું ભર્યું. 🌟',
      'હું સંકલ્પ સાથે આગળ વધું છું; આ બેજ મારો છે. 💪',
      'મેં સવારની બરકત મેળવી. 🌅',
      'મારી રૂહને સુકૂન આપતી આ સફરનો હું પણ ભાગ છું. ✨',
      'નાનાં પગલાં મોટું સુકૂન લાવે છે. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'મેં નવો બેજ મેળવ્યો',
      hedef_tamamlandi: 'લક્ષ્ય પૂરું થયું',
      seviye_atlandi: 'નવું સ્તર',
      toparlanma_tamamlandi: 'ફરી રાહ પર',
      en_uzun_seri: 'નવો રેકોર્ડ',
      varsayilan: 'સિદ્ધિ',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['મારો રબ કાયમ રાખે. 🤲', 'નાનાં પગલાં મોટું સુકૂન લાવે છે. 🍃', 'અલ્લાહ આપણને સૌને સાબિત કદમ રાખે. 🌱'],
      hedef_tamamlandi: ['નાનાં પગલાં મોટું સુકૂન લાવે છે. 🍃', 'અલ્લાહ કાયમ રાખે. 🤲', 'દરરોજ એક પગલું આગળ. 🌱'],
      seviye_atlandi: [
        'દરરોજ થોડું આગળ; અલ્લાહ આસાન કરે. 🍃',
        'અલ્લાહ કાયમ રાખે. 🤲',
        'સફર ચાલુ છે. 🌱',
      ],
      toparlanma_tamamlandi: [
        'મહત્ત્વનું પડવું નહીં, ફરી ઊભા થવું છે. 🔄',
        'અલ્લાહ સાબિત કદમ રાખે. 🤲',
        'દરેક રસ્તો સબરથી કપાય છે. 🌱',
      ],
      en_uzun_seri: [
        'દરરોજ એક નાનું પગલું, દિલમાં મોટું સુકૂન. 🍃',
        'અલ્લાહ કાયમ રાખે. 🤲',
        'મારો રબ આપણને સૌને સાબિત કદમ રાખે. 🌱',
      ],
    },
  },
};
