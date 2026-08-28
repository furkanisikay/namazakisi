/**
 * Uyari KANAL KUMESI — `UyariModu` enum'unun yerini alan saf yardimcilar (Faz 2).
 *
 * NEDEN KUME: eski enum ('sessiz'|'bildirim'|'sesli'|'ikisi') iki BAGIMSIZ kanali
 * tek eksene sikistiriyordu ve 'ikisi' bu sikistirmanin izidir. Ucuncu bir kanal
 * (titresim) eklemek durum sayisini ikiye katlar; kumede ise tek bir bayrak eklenir.
 *
 * TEK KAPI: "bu adim uyari uretir mi?" sorusunun cevabi HER YERDE
 * `adimKapaliMi`dir. Eskiden bu kural `mod !== 'sessiz'` olarak yedi ayri
 * dosyada tekrarlaniyordu; ikizler ayrisirsa motor ile ekran farkli sey soyler.
 */
import type { EskiUyariModu, UyariKanallari } from './matrisTipleri';

export type KanalAdi = 'bildirim' | 'sesli' | 'titresim';

/** Kumeyi TAM kapsayan ad listesi — yeni kanal eklenince buraya da eklenmeli. */
export const KANAL_ADLARI: readonly KanalAdi[] = ['bildirim', 'sesli', 'titresim'];

/** Adim kapali. */
export const KAPALI_KANALLAR: UyariKanallari = {};

/** Hatirlanan bir kume yoksa acilista dusulen guvenli kume. */
export const VARSAYILAN_ACIK_KANALLAR: UyariKanallari = { bildirim: true };

/** Eksik alan ile acikca `false` AYNIdir (kismi disk kayitlari icin sart). */
export const kanalAcikMi = (kanallar: UyariKanallari | undefined, ad: KanalAdi): boolean =>
  kanallar?.[ad] === true;

/**
 * Adim KAPALI mi? (hicbir kanali acik degil) — motorun ve ekranin tek kapisi.
 *
 * AD, ANLAMIYLA AYNI OLMAK ZORUNDA: ilk hali `hicKanalAcikMi` idi ve "hic kanal
 * acik mi?" diye okunup adim ACIKKEN true donuyormus gibi anlasiliyordu; oysa
 * KAPALIYKEN doner. On alti dosyada tek kapi olan bir yuklemde ters okuma, ilk
 * dikkatsiz `!` ile motoru tumden susturur ve testlerden kacar (kapali adim zaten
 * uyari uretmez). Olumlu ifade gereken yerde `!adimKapaliMi(...)` yazilir.
 *
 * `titresim` de sayilir: bugun hicbir yol onu yazmaz, ama Faz 6'da yalniz
 * titresimle kurulmus bir adim mesru bir hatirlatmadir ve "actim ama kapali
 * gorunuyor" sapmasi dogmamalidir.
 */
export const adimKapaliMi = (kanallar: UyariKanallari | undefined): boolean =>
  !KANAL_ADLARI.some((ad) => kanalAcikMi(kanallar, ad));

/** Kanali acar. Zaten aciksa AYNI referans doner (gereksiz disk yazimi yok). */
export const kanalAc = (kanallar: UyariKanallari, ad: KanalAdi): UyariKanallari =>
  kanalAcikMi(kanallar, ad) ? kanallar : { ...kanallar, [ad]: true };

/** Kanali kapatir. Zaten kapaliysa AYNI referans doner. */
export const kanalKapat = (kanallar: UyariKanallari, ad: KanalAdi): UyariKanallari =>
  kanalAcikMi(kanallar, ad) ? { ...kanallar, [ad]: false } : kanallar;

/** Iki kume ayni kanallari mi aciyor? (eksik alan == false) */
export const kanallarEsitMi = (
  a: UyariKanallari | undefined,
  b: UyariKanallari | undefined
): boolean => KANAL_ADLARI.every((ad) => kanalAcikMi(a, ad) === kanalAcikMi(b, ad));

/**
 * ESKI `mod` degerini kanal kumesine cevirir (goc + ekran cipleri).
 *
 * Bilinmeyen/eksik deger KAPALI dondurur: diskten gelen bozuk bir dize yuzunden
 * sessizce yanlis kanal acmaktansa hic acmamak yeglenir.
 */
export const modKanallaraCevir = (mod: EskiUyariModu | undefined): UyariKanallari => {
  switch (mod) {
    case 'bildirim':
      return { bildirim: true };
    case 'sesli':
      return { sesli: true };
    case 'ikisi':
      return { bildirim: true, sesli: true };
    default:
      return {};
  }
};
