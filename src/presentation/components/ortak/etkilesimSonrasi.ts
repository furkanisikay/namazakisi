/**
 * Kritik olmayan bir işi JS iş parçacığı boşalınca çalıştırır.
 *
 * `InteractionManager` RN 0.87'de kaldırıldı: üretimde `undefined`, geliştirmede erişimi
 * fırlatır. Yerine RN'in önerdiği `requestIdleCallback` kullanılır. Jest (node) ortamında
 * `requestIdleCallback` yoktur → bir sonraki makro göreve (`setTimeout(0)`) düşülür.
 * Dönen `cancel()` henüz çalışmamış işi iptal eder (eski `runAfterInteractions` tutamağı gibi).
 * Yük altında JS hiç boşa çıkmayabilir → en geç `AZAMI_BEKLEME_MS` sonra yine çalışır.
 */
export interface EtkilesimTutamagi {
  cancel: () => void;
}

type BostaGeriCagirim = (gorev: () => void, secenek?: { timeout?: number }) => number;
type BostaIptal = (kimlik: number) => void;

const AZAMI_BEKLEME_MS = 2000;

export function etkilesimSonrasi(gorev: () => void): EtkilesimTutamagi {
  const kuresel = globalThis as {
    requestIdleCallback?: BostaGeriCagirim;
    cancelIdleCallback?: BostaIptal;
  };
  if (typeof kuresel.requestIdleCallback === 'function') {
    const kimlik = kuresel.requestIdleCallback(() => gorev(), { timeout: AZAMI_BEKLEME_MS });
    return { cancel: () => kuresel.cancelIdleCallback?.(kimlik) };
  }
  const zamanlayici = setTimeout(gorev, 0);
  return { cancel: () => clearTimeout(zamanlayici) };
}
