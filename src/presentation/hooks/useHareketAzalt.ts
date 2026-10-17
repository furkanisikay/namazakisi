import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * "Animasyonları azalt" açık mı? Açıksa sahneler son karelerine atlar
 * (motion-choreography: bilgi hiçbir zaman yalnız hareketle verilmez).
 * Okunamazsa `false` (hareket açık) — sahneler zaten kısa ve tek seferlik.
 */
export function useHareketAzalt(): boolean {
  const [azalt, setAzalt] = useState(false);
  useEffect(() => {
    let iptal = false;
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((d) => {
        if (!iptal) setAzalt(d === true);
      })
      .catch(() => undefined);
    const abonelik = AccessibilityInfo.addEventListener?.('reduceMotionChanged', (d: boolean) => setAzalt(d === true));
    return () => {
      iptal = true;
      abonelik?.remove?.();
    };
  }, []);
  return azalt;
}
