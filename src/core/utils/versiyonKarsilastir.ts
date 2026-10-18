/**
 * Semantik sürüm karşılaştırma (saf). `v` öneki ve eksik parçalar tolere edilir.
 *
 * @returns pozitif: v1 > v2, negatif: v1 < v2, sıfır: eşit
 */
export function versiyonKarsilastir(v1: string, v2: string): number {
  const parcala = (v: string): number[] =>
    v
      .replace(/^v/, '')
      .split('.')
      .map((p) => {
        const sayi = parseInt(p, 10);
        return isNaN(sayi) ? 0 : sayi;
      });

  const p1 = parcala(v1);
  const p2 = parcala(v2);
  const uzunluk = Math.max(p1.length, p2.length);

  for (let i = 0; i < uzunluk; i++) {
    const a = p1[i] || 0;
    const b = p2[i] || 0;
    if (a !== b) return a - b;
  }

  return 0;
}
