// Afarcada `buyuk` elle yazılır (`toUpperCase` YASAK).
import type { Sozluk } from '../tr';

/**
 * Qafar af: vakit adları QuranEnc `afar_hamza` 11:114, 24:58, 2:238 ve IslamHouse aa "salat
 * kitaabay" metninden: Subci · Ayro mawqa · Dohori · Qasri · Magrib · Qisha. Mealdeki vurgu
 * işaretleri (Qishâ, ayrô) arayüze taşınmaz; standart Qafar imlası (q = ʿayn, c = ḥ, x = ḍ).
 * Güneş doğuşu "ayro mawqa" QE 18:90 / 73:9 "ayrô mawqa" (güneşin doğduğu yer/an) — türetildi.
 * `imsakVakti` = "Subci" (fecir adı, "Imsak" değil). Vakit adı özel addır, cümle içinde de
 * büyük harfle başlar ("ayro mawqa" hariç). Cuma "Jumqatta" (QE 62:9 "jumqatta salaatah").
 * "Kıldım" = "Salat abe" (aba "yapmak" 1. tekil geçmiş; QE 50:39 "salat-ab"), durum "Abime"
 * (edilgen geçmiş) — ikisi de türetildi, yerli okuyucu baksın. Kerahat: IH "karaaha le".
 * Allah adı arayüzde "Allah" (ana oturum kararı; mealin "Yalla"sı kullanılmaz).
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Subci', gunes: 'Ayro mawqa', ogle: 'Dohori', ikindi: 'Qasri', aksam: 'Magrib', yatsi: 'Qisha' },
  buyuk: { imsak: 'SUBCI', gunes: 'AYRO MAWQA', ogle: 'DOHORI', ikindi: 'QASRI', aksam: 'MAGRIB', yatsi: 'QISHA' },
  kucuk: { imsak: 'Subci', gunes: 'ayro mawqa', ogle: 'Dohori', ikindi: 'Qasri', aksam: 'Magrib', yatsi: 'Qisha' },
  imsakVakti: 'Subci',
  cuma: 'Jumqatta',
  cumaKucuk: 'Jumqatta',
  gunesDogusu: 'Ayro mawqa',
  gunesDogusuKucuk: 'ayro mawqa',
  durum: { kilindi: 'Abime', vaktiGeldi: 'Wakti cule', girmedi: 'Wakti ma culin', gecti: 'Abime wee' },
  durumKucuk: { kilindi: 'abime', vaktiGeldi: 'wakti cule', girmedi: 'wakti ma culin', gecti: 'abime wee' },
  /** Düğme "Salat abe" (kişinin kendi beyanı, "anu salat abe"); durum "Abime". */
  eylem: { kildim: 'Salat abe', kilindi: 'Abime' },
  kerahatVakti: 'Karaaha le wakti',
  isaretle: 'Abime hayisa',
  geriAlEtiketi: '{durum}, gacisaanamah xagisa',
  geriAlindi: 'Calaamat kalime',
};
