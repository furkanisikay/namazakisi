/**
 * Yazı yönü (soldan sağa / sağdan sola) — SAF çekirdek. Kaynak `DILLER > yon`.
 * Yönü native'e yazan ve yeniden başlatmayı yöneten katman `domain/services/YonServisi`.
 */
import { DILLER } from './diller';

/** Dil sağdan sola mı yazılır? Bilinmeyen kod soldan sağa sayılır. */
export function sagdanSolaMi(kod: unknown): boolean {
  return DILLER.some((d) => d.kod === kod && d.yon === 'rtl');
}
