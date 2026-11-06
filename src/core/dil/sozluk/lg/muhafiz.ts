import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı Lugandada: yalın tekil emir, kısa (Firefox lg emsali; kaynaklı çağrı
 * "Yimirizaawo esswala", QE 17:78). Secde karşılığı YAZILMAZ → "yimirira osaale". Başlıkta
 * süre "{dk}dk" bitişik: "Magaribi · 655dk" ilk 16 karaktere sığar.
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: '{ad} · {dk}dk ziyise · kiseera kya sswala ⏰',
    giris2: '{ad} · {dk}dk ziyise · tolwisa sswala yo ⚠️',
    giris3: '{ad} · {dk}dk ziyise · esswala yo ekulindiridde 🔥',
    giris4: '{ad} · {dk}dk ziyise · YIMIRIZAAWO ESSWALA 🚨',
    erken3: '{ad} · {dk}dk zisigadde · esswala yo ekulindiridde 🔥',
    erken4: '{ad} · {dk}dk zisigadde · YIMIRIZAAWO ESSWALA 🚨',
    cikis1: '{ad} · {dk}dk zisigadde ⏰',
    cikis2: '{ad} · {dk}dk · ekiseera kikendeera ⚠️',
    cikis3: '{ad} · {dk}dk · ekiseera kiggwaawo 🔥',
    cikis4: '{ad} · {dk}dk · EKISEERA KIGGWAAKO 🚨',
  },
  girisHavuzu: {
    s1: ['Kye kiseera ky’esswala; saala ng’okyalina omukisa.', 'Saala ng’ekiseera kikyali ku ludda lwo; togirindiriza.'],
    s2: ['Gy’okoma okulwisa, gy’ekoma okukuzitoowerera; tolindirira nkomerero.', 'Ekiseera kigenda — saala kati.'],
    s3: [
      'Gy’okoma okulwisa, gy’okoma okusemberera okugisubwa; saala kati.',
      'Togamba nti “Nja kusaala oluvannyuma”; osobola okusaala kati.',
      'Golokoka kati, oleme kugamba “singa” mu ddakiika ntono.',
    ],
    s4: ['Tolwisa sswala yo nate — yimirira osaale kati.', 'Teeka wansi ky’okola, oyimirire osaale.'],
  },
  govde: {
    s1: 'Ekiseera kitandise okukendeera; saala ng’okyalina omukisa.',
    s2: 'Tolindirira nkomerero; kati kiseera kirungi okusaala.',
    s3: 'Ekiseera kinaatera okuggwaako; okyayinza okusaala kati.',
    s4: 'Bw’oba osaaze, nyiga “Nsaaze”; bw’oba tonnasaala, yimirira osaale kati.',
  },
  serit: {
    giris4: 'TOLWISA SSWALA YO. Yimirira osaale kati. (eddakiika {dk} ziyise)',
    giris2: 'Ekiseera kigenda; tolindirira nkomerero. (eddakiika {dk} ziyise)',
    giris1: cogul({ one: 'Wayise eddakiika {n} bukya ekiseera ky’esswala kituuka.', other: 'Wayise eddakiika {n} bukya ekiseera ky’esswala kituuka.' }),
    erken4: 'Tolwisa sswala yo; yimirira osaale kati. (eddakiika {dk} zisigadde)',
    cikis4: 'EKISEERA KIGGWAAKO. Yimirira osaale kati. (eddakiika {dk} zisigadde)',
    cikis2: 'Ekiseera kikendeera; tolindirira nkomerero. (eddakiika {dk} zisigadde)',
    cikis1: cogul({ one: 'Esigadde eddakiika {n} ekiseera ky’esswala kiggwe.', other: 'Esigadde eddakiika {n} ekiseera ky’esswala kiggwe.' }),
  },
  geceCapasi: {
    baslik: '{ad} · saala nga tonnebaka ⏰',
    govde: 'Essaawa ez’akasirise zitandika mu ddakiika {dk}; saala Ishai nga tonnagenda kwebaka.',
  },
  icerik: {
    firsat: 'Ekiseera kitandise okukendeera; saala ng’okyalina omukisa.',
    sonaBirakma: 'Tolindirira nkomerero; kati kiseera kirungi okusaala.',
    fisilti: 'Togamba nti “Nja kusaala oluvannyuma”; ekiseera kinaatera okuggwaako, osobola okusaala kati.',
    omur: 'Ekiseera kiyita; okyalina omukisa okusaala esswala eno mu kiseera kyayo.',
    keske: 'Golokoka kati, oleme kugamba “singa” mu ddakiika ntono.',
    namazaDur: 'Bw’oba osaaze, nyiga “Nsaaze”; bw’oba tonnasaala, yimirira osaale kati.',
    sonDakika: 'Eddakiika ezisembayo. Teeka wansi ky’okola, oyimirire osaale.',
  },
};
