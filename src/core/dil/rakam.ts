/**
 * Rakam sistemi — arayüzde rakamların Batı (0123) ya da dilin YEREL rakamıyla yazılması
 * (CLDR numbering system adları: `arab` Doğu Arap ٠١٢٣ U+0660–0669, `beng` Bengalce ০১২৩
 * U+09E6–09EF; ileride Farsça/Peştuca için `arabext` ۰۱۲۳ U+06F0–06F9 aynı tabloya girer).
 *
 * Sahip kararları:
 *  - 2026-10-26 Arapça: Körfez/Ortadoğu Doğu Arap, Mağrip (DZ, MA, TN, LY, MR, EH) Batı rakamı.
 *  - 2026-10-27 Bengalce: Bangladeş ve Hindistan dahil HER ülkede Bengalce rakam.
 *  - Urducada Batı rakamı (Pakistan uygulamaları gibi; seçici YOK). Diğer diller değişmez.
 * Yerel rakamı olan her dilde kullanıcı Ayarlar > Dil'den değiştirebilir ("Ülkeye göre" /
 * yerel / Batı).
 *
 * TEK EŞLEME `YEREL_RAKAMLAR`: dil → yerel rakam sistemi. Listede olan dil yerel rakamla
 * başlar, seçici gösterir ve metin kapısından geçer; seçim yalnız `latn` ya da o dilin kendi
 * sistemi olabilir (Bengalcede `arab` geçersizdir).
 *
 * Çözüm sırası (`takimCoz` deseni): açık seçim → ülke varsayılanı → dil varsayılanı.
 * Yerel rakamı olmayan dilde seçim ve ülke yok sayılır.
 *
 * Metin ve sözlük HER ZAMAN Batı rakamıyla yazılır; dönüşüm yalnız çizim katmanında
 * (`components/metin/MetinKapisi`) yapılır. Kullanıcının girdiği yerel rakamlar
 * `rakamlariNormallestir` ile Batıya çevrilerek okunur. SAF çekirdek.
 */
import type { DilKodu } from './diller';

/** Batı dışı (yerel) rakam sistemleri — CLDR adı ve sıfırın kod noktası. */
const SIFIRLAR = {
  arab: 0x0660,
  beng: 0x09e6,
} as const;

export type YerelRakamSistemi = keyof typeof SIFIRLAR;
export type RakamSistemi = YerelRakamSistemi | 'latn';

/**
 * Dil → yerel rakam sistemi (TEK yer). Listede olmayan dil her zaman Batı rakamı kullanır.
 * Farsça/Peştuca eklenirken: `SIFIRLAR`'a `arabext: 0x06f0`, buraya `fa`/`ps` ve native ikizler
 * (`cekirdek/Rakam.kt` ×2, `VakitKarari.swift > RakamSistemi`).
 */
const YEREL_RAKAMLAR: Partial<Record<DilKodu, YerelRakamSistemi>> = { ar: 'arab', bn: 'beng' };

/** Rakam seçicisi gösterilen diller (seçim yalnız bunlarda geçerlidir). */
export const RAKAM_SECIMLI_DILLER: readonly DilKodu[] = Object.keys(YEREL_RAKAMLAR) as DilKodu[];

/**
 * Dil başına ülke (ISO 3166-1 alfa-2) → rakam sistemi. Mağrip ülkeleri günlük yazıda, resmî
 * belgede ve namaz vakti uygulamalarında Batı rakamı kullanır (Fas'ın Habous takvimi dahil).
 * Bengalcede ülke istisnası YOK (sahip kararı: Hindistan dahil her yerde Bengalce rakam).
 */
export const RAKAM_ULKE_VARSAYILANLARI: Partial<Record<DilKodu, Readonly<Record<string, RakamSistemi>>>> = {
  ar: { DZ: 'latn', MA: 'latn', TN: 'latn', LY: 'latn', MR: 'latn', EH: 'latn' },
};

export function rakamSistemiMi(x: unknown): x is RakamSistemi {
  return x === 'latn' || (typeof x === 'string' && Object.prototype.hasOwnProperty.call(SIFIRLAR, x));
}

/** Dilin yerel rakam sistemi; yoksa `null` (o dil yalnız Batı rakamı yazar). */
export function dilYerelRakami(dil: DilKodu): YerelRakamSistemi | null {
  return YEREL_RAKAMLAR[dil] ?? null;
}

/** Dilde rakam seçimi sunulur mu (Ayarlar > Dil > "Rakamlar")? */
export function rakamSecilebilir(dil: DilKodu): boolean {
  return dilYerelRakami(dil) !== null;
}

/** `secim` bu dil için geçerli mi: Batı ya da dilin KENDİ yerel sistemi (Bengalcede `arab` değil). */
export function rakamSecimiGecerliMi(dil: DilKodu, secim: unknown): secim is RakamSistemi {
  return secim === 'latn' ? rakamSecilebilir(dil) : secim !== null && secim === dilYerelRakami(dil);
}

/** Dilin (ülkeden bağımsız) varsayılan rakam sistemi: yerel rakamı varsa o, yoksa Batı. */
export function dilRakamVarsayilani(dil: DilKodu): RakamSistemi {
  return dilYerelRakami(dil) ?? 'latn';
}

/**
 * Etkin rakam sistemini çözer: geçerli açık seçim → ülke varsayılanı → dil varsayılanı.
 * Yerel rakamı olmayan dilde yalnız dil varsayılanı (Batı) döner.
 */
export function rakamSistemiCoz(dil: DilKodu, secim: unknown, ulke: string | null): RakamSistemi {
  if (!rakamSecilebilir(dil)) return dilRakamVarsayilani(dil);
  if (rakamSecimiGecerliMi(dil, secim)) return secim;
  const ulkeninki = ulke ? RAKAM_ULKE_VARSAYILANLARI[dil]?.[ulke] : undefined;
  return ulkeninki ?? dilRakamVarsayilani(dil);
}

const BATI_RAKAMI = /[0-9]/g;
/** Girişte Batıya çevrilen yerel rakamlar: Doğu Arap, Farsça/Urduca (genişletilmiş), Bengalce. */
const NORMALLESEN_SIFIRLAR = [0x0660, 0x06f0, 0x09e6] as const;
const YEREL_RAKAM = /[٠-٩۰-۹০-৯]/g;

/** Metindeki Batı rakamlarını sistemin rakamlarına çevirir; `latn` metni olduğu gibi döndürür. */
export function rakamlariCevir(metin: string, sistem: RakamSistemi): string {
  if (sistem === 'latn') return metin;
  const sifir = SIFIRLAR[sistem];
  return metin.replace(BATI_RAKAMI, (r) => String.fromCharCode(sifir + r.charCodeAt(0) - 48));
}

/**
 * Girişteki Doğu Arap (U+0660–0669), Farsça/Urduca (U+06F0–06F9) ve Bengalce (U+09E6–09EF)
 * rakamları Batı rakamına çevirir (yerel klavyeyle yazılan sayı). Diğer karakterlere dokunmaz.
 */
export function rakamlariNormallestir(metin: string): string {
  return metin.replace(YEREL_RAKAM, (r) => {
    const kod = r.charCodeAt(0);
    const sifir = NORMALLESEN_SIFIRLAR.find((s) => kod >= s && kod <= s + 9) ?? 48;
    return String.fromCharCode(48 + kod - sifir);
  });
}
