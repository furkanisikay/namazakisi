import type { Sozluk } from '../tr';

/**
 * Kiswahili: majina ya nyakati ni ya tafsiri ya QuranEnc (Rowwad, `swahili_rwwad`) na jedwali la
 * nyakati: Alfajiri · Macheo · Adhuhuri · Alasiri · Magharibi · Isha (24:58, 30:18, 20:130). Macheo =
 * jua kuchomoza; "Machweo", "jua kutua" ni KUZAMA kwa jua — usitumie. Majina ya Swala ni nomino za
 * pekee: herufi kubwa hata katikati ya sentensi ("Swala ya Alasiri"); `kucuk` hubadilisha "macheo" tu.
 * `buyuk` imeandikwa kwa mkono. Istilahi: Swala (tahajia moja; si "Sala"), kuswali (kitenzi; amri
 * "swali" peke yake = "soru", HAITUMIKI), Nimeswali / Imeswaliwa (zimetoholewa, hazijathibitishwa),
 * Qadha (Swala za Qadha), Nafila, Ijumaa, Kibla, msikiti, Adhana, wudu, wakati wa makruhu, mbinu ya
 * hesabu, Mlinzi wa Swala (Prayer Guardian), mfululizo (streak), kurejea (toparlanma), safari
 * (seferîlik), Daftari la Qadha, Mipangilio (Ayarlar), arifa, mahali.
 * Hitap: kiolesura kinamwambia mtumiaji kwa umoja (u-), vitufe ni amri fupi ("Chagua", "Hifadhi"),
 * sentensi za maelezo ni taarifa ya kawaida; "Tafadhali" na "!" hazitumiki. Wito wa ibada: amri fupi
 * ya umoja "Simamisha Swala" (17:78).
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Alfajiri', gunes: 'Macheo', ogle: 'Adhuhuri', ikindi: 'Alasiri', aksam: 'Magharibi', yatsi: 'Isha' },
  buyuk: { imsak: 'ALFAJIRI', gunes: 'MACHEO', ogle: 'ADHUHURI', ikindi: 'ALASIRI', aksam: 'MAGHARIBI', yatsi: 'ISHA' },
  kucuk: { imsak: 'Alfajiri', gunes: 'macheo', ogle: 'Adhuhuri', ikindi: 'Alasiri', aksam: 'Magharibi', yatsi: 'Isha' },
  imsakVakti: 'Alfajiri',
  cuma: 'Ijumaa',
  cumaKucuk: 'Ijumaa',
  gunesDogusu: 'Macheo',
  gunesDogusuKucuk: 'macheo',
  durum: { kilindi: 'Imeswaliwa', vaktiGeldi: 'Wakati umeingia', girmedi: 'Bado haujaingia', gecti: 'Haikuswaliwa' },
  durumKucuk: { kilindi: 'imeswaliwa', vaktiGeldi: 'wakati umeingia', girmedi: 'bado haujaingia', gecti: 'haikuswaliwa' },
  /** "Nimeswali" = tamko la mtumiaji mwenyewe (nafsi ya 1); hali "Imeswaliwa". */
  eylem: { kildim: 'Nimeswali', kilindi: 'Imeswaliwa' },
  kerahatVakti: 'Wakati wa makruhu',
  isaretle: 'Weka alama imeswaliwa',
  geriAlEtiketi: '{durum}, gusa ili kutendua',
  geriAlindi: 'Alama imeondolewa',
};
