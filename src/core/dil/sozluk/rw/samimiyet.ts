import type { Sozluk } from '../tr';

/**
 * Imvugo z’Abayisilamu bavuga Ikinyarwanda (si ubusemuzi). «Allah abyakire» ishingiye ku
 * nshinga «kwakira» (QuranEnc 2:127 «Twakirire»; HadeethEnc 3534); yakozwe mu kibonezamvugo,
 * umusomyi kavukire agomba kuyisuzuma. Indamukanyo za kandil na Hijri zivugwa gusa mu muco
 * wa Türkiye (`selam.ts > GELENEK_SELAMI_DILLERI`); hano ni izo kuzuza ubwoko gusa.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Bibe iby’umugisha.',
  kabulDualari: ['Allah abyakire', 'Byakirwe', 'Allah abyakire', 'Nyagasani abyakire'],
  kabulDuasi: 'Allah abyakire',
  ekSabah: 'Mugire igitondo cyiza',
  ekYatsi: 'Mugire ijoro ryiza',
  tamGunAna: 'Allah abyakire',
  tamGunAlt: 'Uyu munsi mwasali iswala zose uko ari eshanu.',
  kazaKabul: 'Iswala imwe yo kwishyura ya {vakit} yakuwe mu gitabo cyanyu. {dua}.',
  kandilGeceleri: {
    regaib: 'Ijoro rya Raghaib ryuje imigisha',
    mirac: 'Isra na Mi’raj byuje imigisha',
    berat: 'Ijoro rya Bara’a ryuje imigisha',
    mevlid: 'Mawlid yuje imigisha',
  },
  selamlar: {
    sahur: 'Daku yuje imigisha',
    bayram: 'Idi Mubarak',
    iftar: 'Gusiburuka kuzuye imigisha',
    kadir: 'Laylat-ul Qadri yuje imigisha',
    arefe: 'Umunsi wa Arafa wuje imigisha',
    hicriYilbasi: 'Umwaka mushya wa Hijri wuje imigisha',
    cuma: 'Ijuma Mubarak',
    ramazan: 'Ramadhani Mubarak',
    sabah: 'Mugire igitondo cyiza',
  },
};
