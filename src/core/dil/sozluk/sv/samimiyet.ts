import type { Sozluk } from '../tr';

/**
 * İsveççe konuşan Müslümanların kalıpları (çeviri değil): Stockholms moské "Vi ber Allah att
 * acceptera från alla" (Arapça "نسأل الله أن يتقبل منا") → kısa dua kalıbı "Må Allah acceptera det"
 * (baskın, iki yuva; kısaltma türetildi); "Taqabbal Allah" Arapça kalıbın İsveççe metinlerde de
 * kullanılan yazımı; "Eid/Ramadan/Jumu'ah mubarak" Arapça selamın Latin yazımı (İngilizce emsali;
 * İsveççe kaynakta DOĞRULANMADI).
 * Kandil selamı İsveç'te yalnız Türk diasporası geleneğidir (`selam.ts > KANDIL_ULKELERI` SE'yi
 * içermez); tip bütünlüğü için yazıldı.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Må det vara välsignat.',
  kabulDualari: ['Må Allah acceptera det', 'Taqabbal Allah', 'Må Allah acceptera det', 'Må vår Herre acceptera det'],
  kabulDuasi: 'Må Allah acceptera det',
  ekSabah: 'En välsignad morgon',
  ekYatsi: 'En välsignad natt',
  tamGunAna: 'Må Allah acceptera det',
  tamGunAlt: 'Du har förrättat alla fem bönerna i dag.',
  kazaKabul: 'En qada-bön ({vakit}) har strukits från din qada-logg. {dua}.',
  kandilGeceleri: {
    regaib: 'En välsignad Raghaib-natt',
    mirac: "En välsignad natt för Isra och Mi'raj",
    berat: "En välsignad Bara'ah-natt",
    mevlid: 'En välsignad Mawlid',
  },
  selamlar: {
    sahur: 'En välsignad suhur',
    bayram: 'Eid mubarak',
    iftar: 'En välsignad iftar',
    kadir: 'En välsignad Laylat al-Qadr',
    arefe: 'En välsignad eid-afton',
    hicriYilbasi: 'Ett välsignat islamiskt nyår',
    cuma: "Jumu'ah mubarak",
    ramazan: 'Ramadan mubarak',
    sabah: 'En välsignad morgon',
  },
};
