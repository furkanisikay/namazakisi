import { useEffect } from 'react';
import type { RefObject } from 'react';
import type { ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useVurguBaglami } from './VurguSaglayici';

/**
 * Sayfa kökünde çağrılır; `useRoute().params.vurgula`'yı okuyup `VurguSaglayici`ya
 * yazar ve sayfanın kendi `ScrollView`'üne bağlanacak ref'i döndürür.
 *
 * Savunmalı okuma ZORUNLU: automock'lu testlerde ve parametresiz açılışta
 * `route.params` tanımsız olabilir. `useRoute()`'un kendisi de (çıplak bir
 * automock'ta) `undefined` dönebilir — `?.` ile ucuza kapatılır, TypeError yok.
 *
 * Kullanım (sayfa kökü):
 * ```tsx
 * <VurguSaglayici>
 *   <ScrollView ref={useVurguKurulumu()} ...mevcut proplar>
 *     <AyarCapasi id="ornekCapa">...</AyarCapasi>
 *   </ScrollView>
 * </VurguSaglayici>
 * ```
 */
export function useVurguKurulumu(): RefObject<ScrollView | null> {
  const { scrollRef, hedefiAyarla } = useVurguBaglami();
  const route = useRoute();
  const vurgula = (route?.params as { vurgula?: string } | undefined)?.vurgula;

  useEffect(() => {
    hedefiAyarla(vurgula);
  }, [vurgula, hedefiAyarla]);

  return scrollRef;
}
