import type { Sozluk } from '../tr';

/**
 * Kalıplar ya Waislamu wanaozungumza Kiswahili (si tafsiri). Kitenzi "kukubali" na dua "Ewe Mola
 * Mlezi wetu! Tukubalie" ni vya tafsiri ya QuranEnc Rowwad (2:127); "Mwenyezi Mungu" ni jina la
 * tafsiri hiyo hiyo. Salamu za kandili na mwaka mpya wa Hijria husemwa katika desturi ya Uturuki tu
 * (`selam.ts > GELENEK_SELAMI_DILLERI`); maneno yaliyo hapa ni kwa ukamilifu wa aina. Hayajakaguliwa
 * na msomaji mzawa.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Iwe na baraka.',
  kabulDualari: ['Mwenyezi Mungu aikubali', 'Mola wetu, tukubalie', 'Mwenyezi Mungu aikubali', 'Mwenyezi Mungu atukubalie'],
  kabulDuasi: 'Mwenyezi Mungu aikubali',
  ekSabah: 'Asubuhi njema yenye baraka',
  ekYatsi: 'Usiku mwema wenye baraka',
  tamGunAna: 'Mwenyezi Mungu aikubali',
  tamGunAlt: 'Leo umeswali Swala zote tano.',
  kazaKabul: 'Qadha moja ya {vakit} imepunguzwa kwenye daftari lako. {dua}.',
  kandilGeceleri: {
    regaib: 'Usiku wa Raghaib wenye baraka',
    mirac: 'Israa na Miraji yenye baraka',
    berat: 'Usiku wa Baraa wenye baraka',
    mevlid: 'Maulidi yenye baraka',
  },
  selamlar: {
    sahur: 'Daku yenye baraka',
    bayram: 'Eid Mubarak',
    iftar: 'Futari yenye baraka',
    kadir: 'Laylatul Qadr yenye baraka',
    arefe: 'Siku ya Arafa yenye baraka',
    hicriYilbasi: 'Mwaka mpya wa Hijria wenye baraka',
    cuma: 'Ijumaa Mubarak',
    ramazan: 'Ramadhani Mubarak',
    sabah: 'Asubuhi njema yenye baraka',
  },
};
