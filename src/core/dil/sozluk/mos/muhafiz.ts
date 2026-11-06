import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Mooré ibadete çağrı kaydı: mealin çoğul emri (‑y), kısa ve doğrudan; "!" yok. Secde karşılığı
 * YAZILMAZ → "Yik-y n pʋʋs" (kalkın, namaz kılın). Başlıkta süre "{dk}min": "Magrib · 655min"
 * ilk 16 karaktere sığar.
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: '{ad} · {dk}min loogame · pʋʋsg wakatã ta ⏰',
    giris2: '{ad} · {dk}min loogame · ra yaool-y y pʋʋsgã ye ⚠️',
    giris3: '{ad} · {dk}min loogame · y pʋʋsgã gũuda-y 🔥',
    giris4: '{ad} · {dk}min loogame · YIK-Y N PƲƲS 🚨',
    erken3: '{ad} · {dk}min n kell · y pʋʋsgã gũuda-y 🔥',
    erken4: '{ad} · {dk}min n kell · YIK-Y N PƲƲS 🚨',
    cikis1: '{ad} · {dk}min n kell ⏰',
    cikis2: '{ad} · {dk}min · wakatã kʋɩɩda ⚠️',
    cikis3: '{ad} · {dk}min · wakatã zoeta 🔥',
    cikis4: '{ad} · {dk}min · WAKATÃ SAADA 🚨',
  },
  girisHavuzu: {
    s1: ['Pʋʋsg wakatã ta; pʋʋs-y y sẽn nan tar sorã.', 'Pʋʋs-y wakatã sẽn nan be ne yãmbã; ra bas-y n tʋg poorẽ ye.'],
    s2: ['Y sã n yaool wʋsg, a yẽgda; ra bas-y y pʋʋsgã n tãag baasgẽ ye.', 'Wakatã kẽnda — pʋʋs-y masã.'],
    s3: [
      'Y sã n yaool wʋsg, y pẽneda a põsgo; pʋʋs-y masã.',
      'Ra yeel-y "m na n pʋʋs poorẽ" ye; y tõe n pʋʋs masã.',
      'Yik-y masã, sẽn ka y yeel "sã n da yaa" minit bilf poorẽ.',
    ],
    s4: ['Ra le yaool-y y pʋʋsgã ye — yik-y n pʋʋs masã.', 'Bas-y y sẽn maandã la y yik n pʋʋs.'],
  },
  govde: {
    s1: 'Wakatã sɩngda n kʋɩɩ; pʋʋs-y y sẽn nan tar sorã.',
    s2: 'Ra bas-y y pʋʋsgã n tãag baasgẽ ye; masã yaa wakat sõng n pʋʋse.',
    s3: 'Wakatã pẽnega baasgo; y nan tõe n pʋʋs masã.',
    s4: 'Y sã n pʋʋsa, dig-y "M pʋʋsa"; y sã n ka pʋʋs ye, yik-y n pʋʋs masã.',
  },
  serit: {
    giris4: 'RA YAOOL-Y Y PƲƲSGÃ YE. Yik-y n pʋʋs masã. ({dk} min loogame)',
    giris2: 'Wakatã kẽnda; ra bas-y y pʋʋsgã n tãag baasgẽ ye. ({dk} min loogame)',
    giris1: cogul({ one: '{n} minit loogame pʋʋsg wakatã sẽn ta.', other: '{n} minit loogame pʋʋsg wakatã sẽn ta.' }),
    erken4: 'Ra yaool-y y pʋʋsgã ye; yik-y n pʋʋs masã. ({dk} min n kell)',
    cikis4: 'WAKATÃ SAADA. Yik-y n pʋʋs masã. ({dk} min n kell)',
    cikis2: 'Wakatã kʋɩɩda; ra bas-y y pʋʋsgã n tãag baasgẽ ye. ({dk} min n kell)',
    cikis1: cogul({ one: '{n} minit n kell tɩ pʋʋsg wakatã sa.', other: '{n} minit n kell tɩ pʋʋsg wakatã sa.' }),
  },
  geceCapasi: {
    baslik: '{ad} · pʋʋs-y y gõeem taoore ⏰',
    govde: 'Wakat ning kibar sẽn pa wat ye na n sɩng {dk} min poorẽ; pʋʋs-y Sãanfo y sẽn na n gãand taoore.',
  },
  icerik: {
    firsat: 'Wakatã sɩngda n kʋɩɩ; pʋʋs-y y sẽn nan tar sorã.',
    sonaBirakma: 'Ra bas-y y pʋʋsgã n tãag baasgẽ ye; masã yaa wakat sõng n pʋʋse.',
    fisilti: 'Ra yeel-y "m na n pʋʋs poorẽ" ye; wakatã pẽnega baasgo, y tõe n pʋʋs masã.',
    omur: 'Wakatã loogda; y nan tara sor n pʋʋs pʋʋsg-kãng a wakatẽ.',
    keske: 'Yik-y masã, sẽn ka y yeel "sã n da yaa" minit bilf poorẽ.',
    namazaDur: 'Y sã n pʋʋsa, dig-y "M pʋʋsa"; y sã n ka pʋʋs ye, yik-y n pʋʋs masã.',
    sonDakika: 'Minit nins sẽn kõnsã. Bas-y y sẽn maandã la y yik n pʋʋs.',
  },
};
