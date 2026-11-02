import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı Kurmancîde "tu" + tekil emir, kısa ve doğrudan (Soranî emsali). Secde
 * karşılığı ("serî deyne erdê") YAZILMAZ → "rabe nimêjê" (namaza dur). "!" yok. Başlıkta süre
 * birimi CLDR kısa "d" (deqîqe): "Êvar · 655d" ilk 16 karaktere sığar.
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: '{ad} · {dk}d derbas bû · dema nimêjê ye ⏰',
    giris2: '{ad} · {dk}d derbas bû · nimêja xwe dereng nexe ⚠️',
    giris3: '{ad} · {dk}d derbas bû · nimêja te li benda te ye 🔥',
    giris4: '{ad} · {dk}d derbas bû · RABE NIMÊJÊ 🚨',
    erken3: '{ad} · {dk}d ma · nimêja te li benda te ye 🔥',
    erken4: '{ad} · {dk}d ma · RABE NIMÊJÊ 🚨',
    cikis1: '{ad} · {dk}d ma ⏰',
    cikis2: '{ad} · {dk}d · dem kurt dibe ⚠️',
    cikis3: '{ad} · {dk}d · dem diçe 🔥',
    cikis4: '{ad} · {dk}d · DEM DIQEDE 🚨',
  },
  girisHavuzu: {
    s1: ['Dema nimêjê ye; heta derfet heye nimêja xwe bike.', 'Heta dem bi te re ye nimêja xwe bike; ji bo paşê nehêle.'],
    s2: ['Çiqas dereng bixî, ewqas giran dibe; nimêja xwe nehêle dawiyê.', 'Dem diçe — niha nimêja xwe bike.'],
    s3: [
      'Çiqas dereng bixî, ewqas nêzîkî ji dest dayînê dibî; niha nimêja xwe bike.',
      'Nebêje “Ez ê paşê bikim”; tu dikarî niha bikî.',
      'Li şûna ku piştî çend deqîqeyan bibêjî “xwezî”, niha rabe.',
    ],
    s4: ['Êdî nimêja xwe dereng nexe — niha rabe nimêjê.', 'Tiştê ku tu dikî deyne û rabe nimêjê.'],
  },
  govde: {
    s1: 'Dem dest pê dike kurt bibe; heta derfet heye nimêja xwe bike.',
    s2: 'Nimêja xwe nehêle dawiyê; niha ji bo nimêjê demeke baş e.',
    s3: 'Dem hema hema qediya; tu hîn dikarî niha bikî.',
    s4: 'Heke te kiribe, “Min nimêj kir” bitikîne; heke na, niha rabe nimêjê.',
  },
  serit: {
    giris4: 'NIMÊJA XWE DERENG NEXE. Niha rabe nimêjê. ({dk} deqîqe derbas bû)',
    giris2: 'Dem diçe; nimêja xwe nehêle dawiyê. ({dk} deqîqe derbas bû)',
    giris1: cogul({ one: 'Ji destpêka dema nimêjê ve {n} deqîqe derbas bû.', other: 'Ji destpêka dema nimêjê ve {n} deqîqe derbas bûn.' }),
    erken4: 'Nimêja xwe dereng nexe; niha rabe nimêjê. ({dk} deqîqe ma)',
    cikis4: 'DEM DIQEDE. Niha rabe nimêjê. ({dk} deqîqe ma)',
    cikis2: 'Dem kurt dibe; nimêja xwe nehêle dawiyê. ({dk} deqîqe ma)',
    cikis1: cogul({ one: 'Heta ku dema nimêjê biqede {n} deqîqe ma.', other: 'Heta ku dema nimêjê biqede {n} deqîqe man.' }),
  },
  geceCapasi: {
    baslik: '{ad} · berî razanê nimêja xwe bike ⏰',
    govde: 'Piştî {dk} deqîqe demên bêdeng dest pê dikin; berî ku tu razêyî nimêja Eşayê bike.',
  },
  icerik: {
    firsat: 'Dem dest pê dike kurt bibe; heta derfet heye nimêja xwe bike.',
    sonaBirakma: 'Nimêja xwe nehêle dawiyê; niha ji bo nimêjê demeke baş e.',
    fisilti: 'Nebêje “Ez ê paşê bikim”; dem hema hema qediya, tu dikarî niha bikî.',
    omur: 'Dem derbas dibe; hîn derfeta te heye ku vê nimêjê di dema wê de bikî.',
    keske: 'Li şûna ku piştî çend deqîqeyan bibêjî “xwezî”, niha rabe.',
    namazaDur: 'Heke te kiribe, “Min nimêj kir” bitikîne; heke na, niha rabe nimêjê.',
    sonDakika: 'Deqîqeyên dawî. Tiştê ku tu dikî deyne û rabe nimêjê.',
  },
};
