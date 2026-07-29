/**
 * WCAG 2.x görece parlaklık (relative luminance) ve kontrast oranı hesabı.
 *
 * SAF: React/tema/native import yok — yalnız hex renk matematiği. AGENTS.md'de
 * kayıtlı kontrast tuzağının (PR #139/#166 — "en yakın görünen renk" bir token
 * seçmek kontrastı hesaplamadan geçmez) tekrarını önlemek için: yeni bir sabit
 * ton eklerken/değiştirirken göz kararı yerine bu fonksiyonla ÖLÇÜLMELİ.
 *
 * Formül: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance /
 * https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */

/** `#RRGGBB` (kısa `#RGB` de kabul edilir) hex rengi 0-255 RGB bileşenlerine çevirir. */
function hexRgbCoz(hex: string): [number, number, number] {
  let h = hex.trim().replace('#', '');
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return [r, g, b];
}

function sRgbKanaliDogrusallastir(kanal: number): number {
  const c = kanal / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** WCAG göreceli parlaklık (0 = siyah, 1 = beyaz). */
export function goreceliParlaklik(hex: string): number {
  const [r, g, b] = hexRgbCoz(hex);
  const [R, G, B] = [sRgbKanaliDogrusallastir(r), sRgbKanaliDogrusallastir(g), sRgbKanaliDogrusallastir(b)];
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * İki rengin WCAG kontrast oranı (1:1 - 21:1 arası). Sıra önemsizdir — daha
 * açık/koyu olan otomatik ayrıştırılır.
 */
export function kontrastOrani(hexA: string, hexB: string): number {
  const lA = goreceliParlaklik(hexA);
  const lB = goreceliParlaklik(hexB);
  const [acik, koyu] = lA > lB ? [lA, lB] : [lB, lA];
  return (acik + 0.05) / (koyu + 0.05);
}
