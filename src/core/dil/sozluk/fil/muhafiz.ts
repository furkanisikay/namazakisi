import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı: zamirsiz kısa emir, zamir gerekirse saygılı "inyong/ninyo"; "po" ve "!" yok
 * (sahip kararı). Secde karşılığı ("magpatirapa") YAZILMAZ → "magdasal na". Başlıkta süre
 * birimi CLDR dar biçimi "m": "Maghrib · 655m" ilk 16 karaktere sığar.
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: '{ad} · {dk}m na · oras na ng dasal ⏰',
    giris2: '{ad} · {dk}m na · huwag ipagpaliban ⚠️',
    giris3: '{ad} · {dk}m na · naghihintay ang dasal 🔥',
    giris4: '{ad} · {dk}m na · MAGDASAL NA 🚨',
    erken3: '{ad} · {dk}m pa · naghihintay ang dasal 🔥',
    erken4: '{ad} · {dk}m pa · MAGDASAL NA 🚨',
    cikis1: '{ad} · {dk}m pa ⏰',
    cikis2: '{ad} · {dk}m · kumikitid na ang oras ⚠️',
    cikis3: '{ad} · {dk}m · nauubos na ang oras 🔥',
    cikis4: '{ad} · {dk}m · MATATAPOS NA ANG ORAS 🚨',
  },
  girisHavuzu: {
    s1: ['Oras na ng dasal; magdasal habang may pagkakataon.', 'Magdasal habang nasa panig ninyo ang oras; huwag itong ipagpaliban.'],
    s2: ['Habang ipinagpapaliban, lalong bumibigat; huwag iwan ang dasal sa huli.', 'Lumilipas ang oras — magdasal na ngayon.'],
    s3: [
      'Habang naaantala, lalong lumalapit ang pagkalampas nito; magdasal na ngayon.',
      'Huwag sabihing "mamaya na ako magdadasal"; makapagdadasal kayo ngayon.',
      'Tumayo na ngayon sa halip na sabihing "sana" pagkalipas ng ilang minuto.',
    ],
    s4: ['Huwag nang ipagpaliban ang dasal — magdasal na ngayon.', 'Iwan muna ang ginagawa at tumayo para magdasal.'],
  },
  govde: {
    s1: 'Nagsisimula nang kumitid ang oras; magdasal habang may pagkakataon.',
    s2: 'Huwag iwan ang dasal sa huli; magandang pagkakataon ngayon para magdasal.',
    s3: 'Halos ubos na ang oras; makapagdadasal pa kayo ngayon.',
    s4: 'Kung nakapagdasal na kayo, i-tap ang "Nagdasal ako"; kung hindi pa, magdasal na ngayon.',
  },
  serit: {
    giris4: 'HUWAG IPAGPALIBAN ANG DASAL. Magdasal na ngayon. (lumipas ang {dk} min)',
    giris2: 'Lumilipas ang oras; huwag iwan ang dasal sa huli. (lumipas ang {dk} min)',
    giris1: cogul({ one: '{n} minuto na mula nang pumasok ang oras ng dasal.', other: '{n} minuto na mula nang pumasok ang oras ng dasal.' }),
    erken4: 'Huwag ipagpaliban ang dasal; magdasal na ngayon. ({dk} min pa)',
    cikis4: 'MATATAPOS NA ANG ORAS. Magdasal na ngayon. ({dk} min pa)',
    cikis2: 'Kumikitid na ang oras; huwag iwan ang dasal sa huli. ({dk} min pa)',
    cikis1: cogul({ one: '{n} minuto pa bago matapos ang oras ng dasal.', other: '{n} minuto pa bago matapos ang oras ng dasal.' }),
  },
  geceCapasi: {
    baslik: '{ad} · magdasal bago matulog ⏰',
    govde: 'Magsisimula ang tahimik na oras sa loob ng {dk} min; idasal ang Isha bago matulog.',
  },
  icerik: {
    firsat: 'Nagsisimula nang kumitid ang oras; magdasal habang may pagkakataon.',
    sonaBirakma: 'Huwag iwan ang dasal sa huli; magandang pagkakataon ngayon para magdasal.',
    fisilti: 'Huwag sabihing "mamaya na ako magdadasal"; halos ubos na ang oras, makapagdadasal pa kayo ngayon.',
    omur: 'Lumilipas ang oras; may pagkakataon pa kayong idasal ito sa tamang oras.',
    keske: 'Tumayo na ngayon sa halip na sabihing "sana" pagkalipas ng ilang minuto.',
    namazaDur: 'Kung nakapagdasal na kayo, i-tap ang "Nagdasal ako"; kung hindi pa, magdasal na ngayon.',
    sonDakika: 'Ang mga huling minuto. Iwan muna ang ginagawa at tumayo para magdasal.',
  },
};
