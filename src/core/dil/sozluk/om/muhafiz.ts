import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı: tekil emir, kısa, "please" yok. "Sujuuda bu'i" türü secde ifadesi
 * YAZILMAZ → "salaataaf dhaabadhu" (namaza dur). Başlıkta süre birimi "d" (daqiiqaa):
 * "Maghriba · 655d" ilk 16 karaktere sığar.
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: '{ad} · {dk}d darbe · yeroo salaataa ⏰',
    giris2: '{ad} · {dk}d darbe · salaata hin tursiin ⚠️',
    giris3: '{ad} · {dk}d darbe · salaanni si eeggata 🔥',
    giris4: '{ad} · {dk}d darbe · SALAATAAF DHAABADHU 🚨',
    erken3: '{ad} · {dk}d hafe · salaanni si eeggata 🔥',
    erken4: '{ad} · {dk}d hafe · SALAATAAF DHAABADHU 🚨',
    cikis1: '{ad} · {dk}d hafe ⏰',
    cikis2: '{ad} · {dk}d · yeroon gabaabbachaa jira ⚠️',
    cikis3: '{ad} · {dk}d · yeroon jalaa darbaa jira 🔥',
    cikis4: '{ad} · {dk}d · YEROON XUMURAMAA JIRA 🚨',
  },
  girisHavuzu: {
    s1: ['Yeroon salaataa gaheera; carraa qabdutti salaati.', 'Yeroon si wajjin osoo jiruu salaati; booda hin dhiisin.'],
    s2: ['Hammam tursiifte, hammas ulfaata; salaata kee dhumaaf hin dhiisin.', 'Yeroon darbaa jira — amma salaati.'],
    s3: [
      'Hammam tursiifte, hammas dhabuu itti dhiyaatta; amma salaati.',
      '"Booda nan salaata" hin jedhin; amma salaatuu dandeessa.',
      "Daqiiqaa muraasa booda \"osoo… ta'ee\" jechuu irra amma ka'i.",
    ],
    s4: ['Salaata kee kana caalaa hin tursiin — amma salaataaf dhaabadhu.', 'Waan hojjechaa jirtu dhiisiitii salaataaf dhaabadhu.'],
  },
  govde: {
    s1: 'Yeroon gabaabbachuu jalqabeera; carraa qabdutti salaati.',
    s2: 'Salaata kee dhumaaf hin dhiisin; amma salaatuuf yeroo gaarii dha.',
    s3: 'Yeroon dhumuuf jira; ammallee amma salaatuu dandeessa.',
    s4: 'Yoo salaatte, "Ani salaateera" tuqi; yoo hin salaatin, amma salaataaf dhaabadhu.',
  },
  serit: {
    giris4: 'SALAATA KEE HIN TURSIIN. Amma salaataaf dhaabadhu. (daqiiqaan {dk} darbeera)',
    giris2: 'Yeroon darbaa jira; salaata kee dhumaaf hin dhiisin. (daqiiqaan {dk} darbeera)',
    giris1: cogul({ one: 'Erga yeroon salaataa gahee daqiiqaan {n} darbeera.', other: 'Erga yeroon salaataa gahee daqiiqaan {n} darbeera.' }),
    erken4: 'Salaata kee hin tursiin; amma salaataaf dhaabadhu. (daqiiqaan {dk} hafeera)',
    cikis4: 'YEROON XUMURAMAA JIRA. Amma salaataaf dhaabadhu. (daqiiqaan {dk} hafeera)',
    cikis2: 'Yeroon gabaabbachaa jira; salaata kee dhumaaf hin dhiisin. (daqiiqaan {dk} hafeera)',
    cikis1: cogul({ one: 'Hanga yeroon salaataa xumuramutti daqiiqaan {n} hafeera.', other: 'Hanga yeroon salaataa xumuramutti daqiiqaan {n} hafeera.' }),
  },
  geceCapasi: {
    baslik: '{ad} · osoo hin rafin salaati ⏰',
    govde: "Sa'aatiin callisaa daqiiqaa {dk} booda jalqaba; osoo hin ciisin Ishaa'ii salaati.",
  },
  icerik: {
    firsat: 'Yeroon gabaabbachuu jalqabeera; carraa qabdutti salaati.',
    sonaBirakma: 'Salaata kee dhumaaf hin dhiisin; amma salaatuuf yeroo gaarii dha.',
    fisilti: '"Booda nan salaata" hin jedhin; yeroon dhumuuf jira, amma salaatuu dandeessa.',
    omur: 'Yeroon darbaa jira; salaata kana yeroo isaatti salaatuuf ammallee carraa qabda.',
    keske: "Daqiiqaa muraasa booda \"osoo… ta'ee\" jechuu irra amma ka'i.",
    namazaDur: 'Yoo salaatte, "Ani salaateera" tuqi; yoo hin salaatin, amma salaataaf dhaabadhu.',
    sonDakika: 'Daqiiqaalee dhumaa. Waan hojjechaa jirtu dhiisiitii salaataaf dhaabadhu.',
  },
};
