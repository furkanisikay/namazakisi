/**
 * `{ad}` yer tutucularını doldurur. Bilinmeyen yer tutucu olduğu gibi kalır (ekranda
 * görünür → testte yakalanır; sessizce boş metin üretilmez).
 */
export function bicimle(metin: string, degerler: Readonly<Record<string, string | number>> = {}): string {
  return metin.replace(/\{(\w+)\}/g, (tam, ad: string) => (ad in degerler ? String(degerler[ad]) : tam));
}
