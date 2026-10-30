import type { Sozluk } from '../tr';

/**
 * Pular (Fuuta Jallon, Gine) vakit adları — Pular seti (fulapula Fula-Fransızca sözlüğü + QuranEnc
 * `fulani_rwwad`): Subaka · Puɗal naange · Fanaa · Alansaraa · Futuroo · Geeƴe; cuma Juma.
 * Pulaar (Senegal) adlarına (tiisbaar, takkusaan) KAYMA. Cümle içinde küçük harf (`kucuk`:
 * "fanaa on"); `buyuk` elle büyük harf (Ɗ, Ƴ dahil). Çizelge satırı (`imsakVakti`) sabah/fecir
 * adıdır: Subaka ("aube, prière de l'aube"). Gırtlak durağı ’ (U+2019): saa’i, go’o, Aa’a.
 * Terimler: namaz juulde (çoğul juulɗe) · Kıldım "Mi juulii" · Kılındı "Juulaama" (edilgen -aama,
 * türetildi) · vakit girdi "Waqutu on heewii" (sözlük) · kaza qadaa (juulde qadaa, doğrulanmadı) ·
 * nafile sunna (sözlük: "acte religieux souhaité mais non obligatoire") · farz farilla · kıble qibla ·
 * kerahat waqutu makruuhu (doğrulanmadı) · ezan ewnaango · abdest salligii · cami juulirde ·
 * seri jokkondiral · Namaz Muhafızı Ndeenoowo Juulde (reenugol "garder") · hesap yöntemi laawol hiisagol ·
 * Allah kabul etsin "Yo Alla jaɓu" ("Yo Alla danndu en" kalıbı) · Ramazan Suumayee · bayram Juldeere ·
 * iftar huntaari · dakika hojom · saat saa’i · gün ñalawma · ay lewru · yıl hitaande.
 * Yönetim metni kibar çoğul (on/mon, emir -ee: "Suɓee"); ibadete çağrı tekil emir ("Ñiiɓu juulde
 * nde" 17:78, "Juulu"). Arayüz sözcükleri Mozilla Pulaar yerelleştirmesiyle uyumlu: Teelte, Tintine,
 * Nokkuure, Yiylo.
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Subaka', gunes: 'Puɗal naange', ogle: 'Fanaa', ikindi: 'Alansaraa', aksam: 'Futuroo', yatsi: 'Geeƴe' },
  buyuk: { imsak: 'SUBAKA', gunes: 'PUƊAL NAANGE', ogle: 'FANAA', ikindi: 'ALANSARAA', aksam: 'FUTUROO', yatsi: 'GEEƳE' },
  kucuk: { imsak: 'subaka', gunes: 'puɗal naange', ogle: 'fanaa', ikindi: 'alansaraa', aksam: 'futuroo', yatsi: 'geeƴe' },
  imsakVakti: 'Subaka',
  cuma: 'Juma',
  cumaKucuk: 'juma',
  gunesDogusu: 'Puɗal naange',
  gunesDogusuKucuk: 'puɗal naange',
  durum: { kilindi: 'Juulaama', vaktiGeldi: 'Waqutu on heewii', girmedi: 'Waqutu on heewaali', gecti: 'Juulaaka' },
  durumKucuk: { kilindi: 'juulaama', vaktiGeldi: 'waqutu on heewii', girmedi: 'waqutu on heewaali', gecti: 'juulaaka' },
  eylem: { kildim: 'Mi juulii', kilindi: 'Juulaama' },
  kerahatVakti: 'Waqutu makruuhu',
  isaretle: 'Maandinee ko juulaama',
  geriAlEtiketi: '{durum}, dobee ngam firtude',
  geriAlindi: 'Maande nde firtaama',
};
