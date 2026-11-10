/**
 * Kritik olmayan bir işi JS iş parçacığı boşalınca çalıştırır.
 *
 * `InteractionManager` RN 0.87'de kaldırıldı: üretimde `undefined`, geliştirmede erişimi
 * fırlatır. Yerine RN'in önerdiği `requestIdleCallback` kullanılır. Jest (node) ortamında
 * `requestIdleCallback` yoktur → bir sonraki makro göreve (`setTimeout(0)`) düşülür.
 * Dönen `cancel()` henüz çalışmamış işi iptal eder (eski `runAfterInteractions` tutamağı gibi).
 */
export interface EtkilesimTutamagi {
  cancel: () => void;
}

type BostaGeriCagirim = (gorev: () => void) => number;
type BostaIptal = (kimlik: number) => void;

export function etkilesimSonrasi(gorev: () => void): EtkilesimTutamagi {
  const kuresel = globalThis as {
    requestIdleCallback?: BostaGeriCagirim;
    cancelIdleCallback?: BostaIptal;
  };
  if (typeof kuresel.requestIdleCallback === 'function') {
    const kimlik = kuresel.requestIdleCallback(() => gorev());
    return { cancel: () => kuresel.cancelIdleCallback?.(kimlik) };
  }
  const zamanlayici = setTimeout(gorev, 0);
  return { cancel: () => clearTimeout(zamanlayici) };
}
