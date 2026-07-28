import { useMemo } from 'react';
import type { KonumAyarlari } from '../store/konumSlice';
import { konumMetniHesapla } from '../../core/ayarlar/konumMetni';

/**
 * Konum ayarlarından kullanıcıya gösterilecek konum metnini üretir (saf fonksiyon).
 * KonumAyarlari ve MuhafizAyarlari ekranları için tek kaynak.
 * Gerçek uygulaması `src/core/ayarlar/konumMetni.ts`'ye taşındı — mevcut
 * tüketicilerin kırılmaması için burada yeniden dışa aktarılır.
 */
export { konumMetniHesapla };

/**
 * konumMetniHesapla'nın memoize edilmiş hook sarmalayıcısı.
 */
export function useKonumMetni(konumAyarlari: KonumAyarlari): string {
  return useMemo(() => konumMetniHesapla(konumAyarlari), [konumAyarlari]);
}
