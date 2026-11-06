import type { Sozluk } from '../tr';

/**
 * Felemenkçe konuşan Müslümanların yerleşik kalıpları (çeviri değil): "Moge Allah het accepteren"
 * baskın kalıp; "Taqabbal Allah" Arapça kalıbın Felemenkçe metinlerde de kullanılan yazımı.
 * Harf çevirisi Felemenkçe yazımı izler (u → oe: "Djoemoe'a moebarak", "Eid moebarak").
 * Kandil selamı Hollanda/Belçika'da yalnız Türk diasporası geleneğidir (`selam.ts > KANDIL_ULKELERI`
 * NL/BE'yi içermez); tip bütünlüğü için yazıldı.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Moge het gezegend zijn.',
  kabulDualari: ['Moge Allah het accepteren', 'Taqabbal Allah', 'Moge Allah het accepteren', 'Moge onze Heer het accepteren'],
  kabulDuasi: 'Moge Allah het accepteren',
  ekSabah: 'Een gezegende ochtend',
  ekYatsi: 'Een gezegende nacht',
  tamGunAna: 'Moge Allah het accepteren',
  tamGunAlt: 'U hebt vandaag alle vijf gebeden verricht.',
  kazaKabul: 'Eén inhaalgebed ({vakit}) is van uw inhaallogboek afgeschreven. {dua}.',
  kandilGeceleri: {
    regaib: 'Een gezegende Regaib-nacht',
    mirac: "Een gezegende nacht van Isra en Mi'raj",
    berat: "Een gezegende nacht van Bara'a",
    mevlid: 'Een gezegende Mawlid',
  },
  selamlar: {
    sahur: 'Een gezegende suhoor',
    bayram: 'Eid moebarak',
    iftar: 'Een gezegende iftar',
    kadir: 'Een gezegende Laylat al-Qadr',
    arefe: 'Een gezegende vooravond van het feest',
    hicriYilbasi: 'Een gezegend islamitisch nieuwjaar',
    cuma: "Djoemoe'a moebarak",
    ramazan: 'Ramadan moebarak',
    sabah: 'Een gezegende ochtend',
  },
};
