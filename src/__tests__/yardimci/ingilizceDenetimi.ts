/**
 * Ekran testleri için İngilizce çizim denetimi: ekran `dil: 'en'` ile çizilince ağaçta
 * Türkçe harfli metin kalmamalı. Çıkarım cırcırının göremediği (Türkçe harfsiz: "Kaza",
 * "Ayarlar") metinleri de anahtar listesiyle yakalamak için `yasakliSozcukler` verilebilir.
 *
 * Kullanım: `ingilizceyeGec()` testten önce (etkin dil singleton'ı da İngilizce olur:
 * `bicim`/`sayili` store'u değil onu okur), çizimden sonra `turkceKalanlar(ekran.toJSON())`.
 */
import { aktifDiliKur, aktifDilSifirla } from '../../core/dil/aktifDil';

const TR = /[çğıöşüÇĞİÖŞÜ]/;

export function ingilizceyeGec(): () => void {
  aktifDiliKur('en');
  return aktifDilSifirla;
}

type Dugum = { type?: string; props?: Record<string, unknown>; children?: (Dugum | string)[] | null } | string | null;

/** Çizim ağacındaki metinler ve erişilebilirlik etiketleri. */
export function agacMetinleri(dugum: Dugum | Dugum[]): string[] {
  if (dugum == null) return [];
  if (Array.isArray(dugum)) return dugum.flatMap(agacMetinleri);
  if (typeof dugum === 'string') return [dugum];
  const props = dugum.props ?? {};
  const etiketler = ['accessibilityLabel', 'placeholder', 'accessibilityHint']
    .map((k) => props[k])
    .filter((v): v is string => typeof v === 'string');
  return [...etiketler, ...agacMetinleri((dugum.children ?? []) as Dugum[])];
}

export function turkceKalanlar(agac: Dugum | Dugum[], yasakliSozcukler: string[] = []): string[] {
  return agacMetinleri(agac).filter((m) => TR.test(m) || yasakliSozcukler.some((s) => m.includes(s)));
}
