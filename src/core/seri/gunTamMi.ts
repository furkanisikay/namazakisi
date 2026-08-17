/**
 * Bir gunun "tam" sayilip sayilmadigini belirleyen SAF kural.
 *
 * Seri motoru (`SeriHesaplayiciServisi`) ve gok takimyildizi haritasi
 * (`aylikIzgara`/`zincir`) AYNI kurali kullanir; kural burada tek yerde
 * tutulur ve kopyalanmaz.
 */

/**
 * Bir gunde kilinan namaz sayisi esigi karsiliyor mu?
 *
 * @param kilinanSayisi - O gun kilinan namaz sayisi (0-5)
 * @param tamGunEsigi - Tam gun icin gereken minimum namaz sayisi
 * @returns Esik karsilaniyorsa true
 */
export function gunTamMi(kilinanSayisi: number, tamGunEsigi: number): boolean {
  return kilinanSayisi >= tamGunEsigi;
}
