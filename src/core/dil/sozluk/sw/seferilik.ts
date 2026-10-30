import type { Sozluk } from '../tr';

/** Fatwa za chanzo ziko kwa Kituruki; lebo inasema hivyo. Hakuna hukumu (ni kupitisha taarifa). */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'Hanafi', safii: 'Shafii' },
  kaynaklar: {
    vatan: 'Nyumbani, makazi na kukaa kwa muda kwa mujibu wa safari (kwa Kituruki)',
    cem: 'Je, Swala zinaweza kujumuishwa (jam’u)? (kwa Kituruki)',
    baslangic: 'Safari inaanza lini? (kwa Kituruki)',
    ziyaret: 'Je, anayewatembelea wazazi wake mjini kwao ni msafiri? (kwa Kituruki)',
  },
  bilgiNotu:
    'Hii ni taarifa, si hukumu. Kama unahesabiwa msafiri inategemea lengo na urefu wa safari yako na nia yako.',
  baslik: 'Inaonekana uko safarini',
  mesafeSatiri: 'Uko takriban km {km} kwa mstari ulionyooka kutoka mahali unapoishi. Diyanet inavyoeleza kwa madhehebu ya {mezhep}:',
  maddeler: {
    hanefi: [
      'Katika madhehebu ya Hanafi, umbali wa safari ni takriban km 90. Anayenuia kukaa chini ya siku 15 mahali anapokwenda anahesabiwa msafiri.',
      'Msafiri huswali Swala za faradhi za rakaa nne kwa rakaa mbili (qasri).',
      'Katika madhehebu ya Hanafi, kujumuisha Swala mbili (jam’u) ni wakati wa Hija tu, Arafa na Muzdalifa. Diyanet pia inaeleza kwamba katika udhuru mkubwa kama safari, mtu anaweza kufuata rai ya madhehebu mengine.',
    ],
    safii: [
      'Katika madhehebu ya Shafii pia, umbali wa safari ni takriban km 90. Ikiwa kukaa mahali anapokwenda ni chini ya siku 4, bila kuhesabu siku za kufika na kuondoka, hukumu za safari zinaendelea.',
      'Msafiri huswali Swala za faradhi za rakaa nne kwa rakaa mbili (qasri).',
      'Katika madhehebu ya Shafii, safari ni udhuru halali wa kujumuisha (jam’u) Adhuhuri na Alasiri, na Magharibi na Isha.',
    ],
  },
  ozetAcik: 'Imewashwa · {mezhep}',
  ozetKapali: 'Imezimwa',
  baglantiAcilamadi: 'Kiungo hakikuweza kufunguliwa. Angalia muunganisho wako wa intaneti.',
  ikametGuncellendi: 'Mahali unapoishi pamesasishwa',
  ikametKaydedilemedi: 'Mahali unapoishi hapakuweza kuhifadhiwa',
  kartiKapatin: 'Funga kadi ya safari',
  burasiEvimErisim: 'Huku ni nyumbani kwangu, pahifadhi kama mahali ninapoishi',
  burasiEvim: 'Huku ni nyumbani',
  diyanetteOkuyunErisim: 'Soma fatwa ya Diyanet kwenye kivinjari',
  diyanetteOkuyun: 'Soma kwenye Diyanet',
  sayfa: {
    kayitliKonum: 'Mahali palipohifadhiwa',
    henuzKaydedilmedi: 'Bado hapajahifadhiwa — mahali pako pa kwanza panahesabiwa kuwa mahali unapoishi',
    buradasiniz: 'Uko hapa sasa',
    uzaktasiniz: 'Sasa uko takriban km {km} mbali kwa mstari ulionyooka',
    konumBilinmiyor: 'Mahali ulipo bado hapajulikani; chagua mahali kwanza',
    giris:
      'Ukiwa takriban km {km} kutoka mahali unapoishi, kadi fupi ya taarifa inayofupisha fatwa za Diyanet inaonekana kwenye skrini kuu. Kadi inaonekana mara moja kwa kila safari na haitumi arifa.',
    bilgiKarti: 'Kadi ya taarifa',
    kartBaslik: 'Kadi ya taarifa ya safari',
    gosterilir: 'Inaonyeshwa kwenye skrini kuu',
    gosterilmez: 'Haionyeshwi',
    mezhepNotu: 'Kadi inafuata madhehebu yako; unaweza kuyachagua katika Mipangilio › Nyakati za Swala.',
    ikametYeri: 'Mahali unapoishi',
    ikametYapErisim: 'Hifadhi mahali ulipo sasa kama mahali unapoishi',
    ikametYap: 'Fanya mahali nilipo sasa kuwa makazi yangu',
    kaynaklar: 'Vyanzo (Baraza Kuu la Mambo ya Dini la Diyanet)',
    kaynakErisim: '{etiket}. Hufunguka kwenye kivinjari',
    /** Haionyeshwi nje ya Kituruki (huduma ya Uturuki tu). */
    fetvaHatti: 'Kwa maswali, unaweza kupiga simu ya fatwa ya Diyanet, 190.',
  },
};
