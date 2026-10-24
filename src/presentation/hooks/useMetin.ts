import { useSyncExternalStore } from 'react';
import { aktifDil, dilDegisiminiDinle, sozluk } from '../../core/dil/aktifDil';
import type { Sozluk } from '../../core/dil/sozluk/tr';
import type { DilKodu } from '../../core/dil/diller';

/**
 * Ekranın metin sözlüğü: `const m = useMetin(); <Text>{m.kurulum.baslik}</Text>`.
 * Etkin dile (`core/dil/aktifDil`, tek doğru kaynak) abonedir: dil değişince yeniden çizer.
 * Redux'a bağlı DEĞİL (paylaşılan bileşenler sağlayıcısız da çizilir; dil slice'ı yalnız
 * kalıcılık ve ayar ekranı içindir). Yer tutucu/çoğul için `bicim`/`sayili`.
 */
export function useMetin(): Sozluk {
  return sozluk(useSyncExternalStore(dilDegisiminiDinle, aktifDil));
}

/** Etkin dil kodu (aynı abonelik; Redux'a bağlı değil). */
export function useAktifDil(): DilKodu {
  return useSyncExternalStore(dilDegisiminiDinle, aktifDil);
}
