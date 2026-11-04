/**
 * Yazı yönü (soldan sağa / sağdan sola) — SAF çekirdek. Kaynak `DILLER > yon`.
 * Yönü native'e yazan ve yeniden başlatmayı yöneten katman `domain/services/YonServisi`.
 */
import { DILLER } from './diller';

/** Dil sağdan sola mı yazılır? Bilinmeyen kod soldan sağa sayılır. */
export function sagdanSolaMi(kod: unknown): boolean {
  return DILLER.some((d) => d.kod === kod && d.yon === 'rtl');
}

/**
 * Metni Unicode yön yalıtımına alır (FSI U+2068 … PDI U+2069): kendi yönünü ilk güçlü harfinden
 * alır, çevresindeki satırın yönünü belirlemez. Sağdan sola arayüzde Latin harfli yer adıyla
 * başlayan satır ("İstanbul, کعبہ ۲,۴۰۵ km دور اے") soldan sağa kurulup cümleyi ters dizmesin.
 * Görünmez karakterlerdir; soldan sağa dilde çıktı aynı görünür.
 */
export function yonuYalit(metin: string): string {
  return `⁨${metin}⁩`;
}
