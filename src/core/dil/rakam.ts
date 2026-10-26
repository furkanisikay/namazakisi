/**
 * Rakam sistemi — arayüzde rakamların Batı (0123) ya da Doğu Arap (٠١٢٣, U+0660–0669)
 * biçimiyle yazılması.
 *
 * Sahip kararı (2026-10-26): Arapçada Körfez/Ortadoğu Doğu Arap rakamlarını, Mağrip (DZ, MA,
 * TN, LY, MR, EH) Batı rakamlarını kullanır; kullanıcı Ayarlar > Dil'den değiştirebilir.
 * Urducada Batı rakamları (Pakistan uygulamaları gibi; seçici YOK). Diğer diller değişmez.
 *
 * Çözüm sırası (`takimCoz` deseni): açık seçim → ülke varsayılanı → dil varsayılanı.
 * Seçimi olmayan dilde (Arapça dışı) seçim ve ülke yok sayılır.
 *
 * Metin ve sözlük HER ZAMAN Batı rakamıyla yazılır; dönüşüm yalnız çizim katmanında
 * (`components/metin/MetinKapisi`) yapılır. Kullanıcının girdiği Doğu/Farsça rakamlar
 * `rakamlariNormallestir` ile Batıya çevrilerek okunur. SAF çekirdek.
 */
import type { DilKodu } from './diller';

export type RakamSistemi = 'arab' | 'latn';

/** Dil başına varsayılan; listede olmayan dil Batı rakamı kullanır. */
const DIL_VARSAYILANLARI: Partial<Record<DilKodu, RakamSistemi>> = { ar: 'arab' };

/** Rakam seçicisi gösterilen diller (seçim yalnız bunlarda geçerlidir). */
export const RAKAM_SECIMLI_DILLER: readonly DilKodu[] = ['ar'];

/**
 * Dil başına ülke (ISO 3166-1 alfa-2) → rakam sistemi. Mağrip ülkeleri günlük yazıda, resmî
 * belgede ve namaz vakti uygulamalarında Batı rakamı kullanır (Fas'ın Habous takvimi dahil).
 */
export const RAKAM_ULKE_VARSAYILANLARI: Partial<Record<DilKodu, Readonly<Record<string, RakamSistemi>>>> = {
  ar: { DZ: 'latn', MA: 'latn', TN: 'latn', LY: 'latn', MR: 'latn', EH: 'latn' },
};

export function rakamSistemiMi(x: unknown): x is RakamSistemi {
  return x === 'arab' || x === 'latn';
}

/** Dilde rakam seçimi sunulur mu (Ayarlar > Dil > "Rakamlar")? */
export function rakamSecilebilir(dil: DilKodu): boolean {
  return RAKAM_SECIMLI_DILLER.includes(dil);
}

/** Dilin (ülkeden bağımsız) varsayılan rakam sistemi. */
export function dilRakamVarsayilani(dil: DilKodu): RakamSistemi {
  return DIL_VARSAYILANLARI[dil] ?? 'latn';
}

/**
 * Etkin rakam sistemini çözer: geçerli açık seçim → ülke varsayılanı → dil varsayılanı.
 * Seçimi olmayan dilde yalnız dil varsayılanı döner.
 */
export function rakamSistemiCoz(dil: DilKodu, secim: unknown, ulke: string | null): RakamSistemi {
  if (!rakamSecilebilir(dil)) return dilRakamVarsayilani(dil);
  if (rakamSistemiMi(secim)) return secim;
  const ulkeninki = ulke ? RAKAM_ULKE_VARSAYILANLARI[dil]?.[ulke] : undefined;
  return ulkeninki ?? dilRakamVarsayilani(dil);
}

const BATI_RAKAMI = /[0-9]/g;
const DOGU_RAKAMI = /[\u0660-\u0669]/g;
const FARSCA_RAKAMI = /[\u06F0-\u06F9]/g;
const ARAP_SIFIR = 0x0660;

/** Metindeki Batı rakamlarını sistemin rakamlarına çevirir; `latn` metni olduğu gibi döndürür. */
export function rakamlariCevir(metin: string, sistem: RakamSistemi): string {
  if (sistem === 'latn') return metin;
  return metin.replace(BATI_RAKAMI, (r) => String.fromCharCode(ARAP_SIFIR + r.charCodeAt(0) - 48));
}

/**
 * Girişteki Doğu Arap (U+0660–0669) ve Farsça/Urduca (U+06F0–06F9) rakamları Batı rakamına
 * çevirir (Arapça ya da Urduca klavyeyle yazılan sayı). Diğer karakterlere dokunmaz.
 */
export function rakamlariNormallestir(metin: string): string {
  return metin
    .replace(DOGU_RAKAMI, (r) => String.fromCharCode(48 + r.charCodeAt(0) - ARAP_SIFIR))
    .replace(FARSCA_RAKAMI, (r) => String.fromCharCode(48 + r.charCodeAt(0) - 0x06f0));
}
