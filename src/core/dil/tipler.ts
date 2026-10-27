/**
 * Dil altyapısının tipleri. Sözlük TÜRKÇEDEN türer: `tr` kaynaktır, diğer diller aynı
 * ağacı (her anahtar) karşılamak zorundadır — eksik çeviri `tsc` hatasıdır.
 */

/** CLDR çoğul kategorileri. Türkçe/İngilizce `one`+`other`, Arapça altısı. */
export type CogulKategori = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

/** Sayıya göre değişen metin. `other` zorunlu; dilin kullandığı diğer kategoriler nöbetçide denetlenir. */
export type CogulMetin = { readonly __cogul: true; readonly other: string } & Partial<Record<Exclude<CogulKategori, 'other'>, string>>;

/** Türkçe sözlüğün şekli, metin değerleri `string`'e genişletilmiş hâli (çeviri farklı metin taşır). */
export type Genislet<T> = {
  readonly [K in keyof T]: T[K] extends string ? string : T[K] extends CogulMetin ? CogulMetin : Genislet<T[K]>;
};

/** Çoğul metin kurucusu (sözlükte okunur kalsın diye). */
export function cogul(m: Omit<CogulMetin, '__cogul'>): CogulMetin {
  return { __cogul: true, ...m } as CogulMetin;
}
