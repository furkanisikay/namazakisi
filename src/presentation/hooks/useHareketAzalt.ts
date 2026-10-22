import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { dekoratifHareketAzaltilsinMi } from '../../core/sistem/sistemDurumu';
import { useSistemKosullari } from './useSistemKosullari';

/**
 * "Animasyonları azalt" açık mı? Açıksa sahneler son karelerine atlar
 * (motion-choreography: bilgi hiçbir zaman yalnız hareketle verilmez).
 * Okunamazsa `false` (hareket açık) — sahneler zaten kısa ve tek seferlik.
 *
 * Güç tasarrufu (Android Pil Tasarrufu / iOS Düşük Güç Modu) açıkken de `true`:
 * dekoratif döngüler durur (`dongu.ts`), bilgi taşıyan canlı içerik etkilenmez.
 */
export function useHareketAzalt(): boolean {
  const [azalt, setAzalt] = useState(false);
  // Değer değişmediyse setState çağrılmaz: her ekran açılışında gereksiz çizim (ve
  // testlerde act gürültüsü) olmasın.
  const son = useRef(false);
  useEffect(() => {
    let iptal = false;
    const yaz = (d: boolean) => {
      if (iptal || d === son.current) return;
      son.current = d;
      setAzalt(d);
    };
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((d) => yaz(d === true))
      .catch(() => undefined);
    const abonelik = AccessibilityInfo.addEventListener?.('reduceMotionChanged', (d: boolean) => yaz(d === true));
    return () => {
      iptal = true;
      abonelik?.remove?.();
    };
  }, []);
  const sistem = useSistemKosullari();
  return azalt || dekoratifHareketAzaltilsinMi(sistem);
}
