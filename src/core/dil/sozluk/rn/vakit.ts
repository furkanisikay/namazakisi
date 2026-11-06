import type { Sozluk } from '../tr';

/**
 * Kirundi: QuranEnc meali (`ikirundi_gehiti`) Arapça vakit adı vermez, günün bölümlerini yazar
 * (umutwenzi, umuhingamo, umugoroba, ijoro). Ana oturum kararıyla Kinyarwanda dizisi taşındı
 * (HadeethEnc rw): Fajri · Izuba rirashe · Adhuhuri · Asr · Maghrib · Isha (TÜRETİLDİ, yerli okuyucu
 * baksın). Vakit adları özel addır, cümle içinde de büyük harfle başlar; `kucuk` yalnız "izuba rirashe"yi
 * küçültür. `buyuk` elle yazıldı. Terimler: isengesho / amasengesho (namaz), gusenga (kılmak), Ijuma,
 * umusigiti, ubutumbero (kıble), Allah ("Imana" değil). "Nasenze" (kıldım) ve "Ryasenzwe" (namaz
 * kılındı, isengesho'ya uyar) gusenga kökünden TÜRETİLDİ.
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Fajri', gunes: 'Izuba rirashe', ogle: 'Adhuhuri', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isha' },
  buyuk: { imsak: 'FAJRI', gunes: 'IZUBA RIRASHE', ogle: 'ADHUHURI', ikindi: 'ASR', aksam: 'MAGHRIB', yatsi: 'ISHA' },
  kucuk: { imsak: 'Fajri', gunes: 'izuba rirashe', ogle: 'Adhuhuri', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isha' },
  imsakVakti: 'Fajri',
  cuma: 'Ijuma',
  cumaKucuk: 'Ijuma',
  gunesDogusu: 'Izuba rirashe',
  gunesDogusuKucuk: 'izuba rirashe',
  durum: { kilindi: 'Ryasenzwe', vaktiGeldi: 'Igihe cageze', girmedi: 'Igihe ntikiragera', gecti: 'Ntiryasenzwe' },
  durumKucuk: { kilindi: 'ryasenzwe', vaktiGeldi: 'igihe cageze', girmedi: 'igihe ntikiragera', gecti: 'ntiryasenzwe' },
  eylem: { kildim: 'Nasenze', kilindi: 'Ryasenzwe' },
  kerahatVakti: 'Igihe ca makruhu',
  isaretle: 'Mwemeze ko mwasenze',
  geriAlEtiketi: '{durum}, mukande kugira musubize inyuma',
  geriAlindi: 'Ikimenyetso caciwe',
};
