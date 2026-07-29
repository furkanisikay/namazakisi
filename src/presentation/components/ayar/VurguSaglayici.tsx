import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { ScrollView } from 'react-native';

/**
 * Ayarlar arama sonucundan gelen "vurgu" (highlight) altyapısının paylaştığı durum.
 *
 * Kabuk kararı: sayfa KENDİ `ScrollView`'ünü tutar (bkz. `useVurguKurulumu.ts`);
 * bu sağlayıcı yalnız o ref'i ve hedef çapa kimliğini `AyarCapasi`'lara iletir.
 * 9 alt sayfanın `className`/`contentContainerStyle`/kardeş `<Modal>` yapılarını
 * taşımak en olası regresyon kaynağı olurdu — bkz. task-4-brief.md.
 *
 * `hedefCapaId` bilerek `CapaId` değil `string | undefined`: kaynağı navigasyon
 * route parametresidir (`AyarlarStackParamList`de `{ vurgula?: string }`) ve tip
 * güvenliği eşleşme anında `AyarCapasi`'nin `id: CapaId` karşılaştırmasıyla sağlanır.
 */
export interface VurguBaglamDegeri {
  /** Sayfanın kendi ScrollView'üne bağlanacak ref. */
  scrollRef: React.RefObject<ScrollView | null>;
  /** Arama sonucundan gelen, vurgulanacak çapa kimliği (yoksa undefined). */
  hedefCapaId: string | undefined;
  /** `useVurguKurulumu` her mount'ta çağırır; hedefi ayarlar ve tüketim durumunu sıfırlar. */
  hedefiAyarla: (id: string | undefined) => void;
  /** Vurgu zaten bir kez uygulandı mı (bir daha tetiklenmesin diye). */
  tuketildiMi: boolean;
  /** Eşleşen `AyarCapasi`, vurguyu uyguladıktan hemen sonra çağırır. */
  vurguyuTuket: () => void;
}

const VurguBaglami = createContext<VurguBaglamDegeri | undefined>(undefined);

/**
 * Vurgu altyapısının kök sağlayıcısı. Sayfa kökünde `ScrollView`'ü sarmalar:
 * ```tsx
 * <VurguSaglayici>
 *   <ScrollView ref={useVurguKurulumu()} ...>
 * ```
 */
export const VurguSaglayici: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const scrollRef = useRef<ScrollView>(null);
  const [hedefCapaId, setHedefCapaId] = useState<string | undefined>(undefined);
  const [tuketildiMi, setTuketildiMi] = useState(false);

  const hedefiAyarla = useCallback((id: string | undefined) => {
    setHedefCapaId(id);
    setTuketildiMi(false);
  }, []);

  const vurguyuTuket = useCallback(() => {
    setTuketildiMi(true);
  }, []);

  const deger = useMemo<VurguBaglamDegeri>(
    () => ({ scrollRef, hedefCapaId, hedefiAyarla, tuketildiMi, vurguyuTuket }),
    [hedefCapaId, hedefiAyarla, tuketildiMi, vurguyuTuket],
  );

  return <VurguBaglami.Provider value={deger}>{children}</VurguBaglami.Provider>;
};

/** `AyarCapasi` ve `useVurguKurulumu` içindir; sağlayıcı dışında çağrılırsa hata fırlatır. */
export function useVurguBaglami(): VurguBaglamDegeri {
  const baglam = useContext(VurguBaglami);
  if (!baglam) {
    throw new Error('useVurguBaglami yalnızca VurguSaglayici içinde kullanılabilir');
  }
  return baglam;
}
