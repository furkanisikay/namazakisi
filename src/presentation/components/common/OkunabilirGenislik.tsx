/**
 * İçeriği geniş pencerede okunabilir bir sütuna (≈640 dp) sınırlayıp ortalar
 * (issue #283 — katlanabilir/tablet).
 *
 * Ayarlar yığınındaki her ekran bunun içinde çizilir (`AppNavigator` →
 * `screenLayout`). Telefonda ve 640 dp'ye kadar olan pencerelerde HİÇBİR şey
 * değişmez (aynı `flex:1` sarmalayıcı); daha genişte içerik ortalanır, iki
 * yandaki boşluk ekranın arka plan rengini alır. Gezinme çubuğu (header)
 * navigator tarafından çizildiği için tam genişlikte kalır.
 */
import * as React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { useRenkler } from '../../../core/theme';
import { icerikDaraltilmaliMi, OKUNABILIR_MAKS_GENISLIK_DP } from '../../../core/utils/ekranSinifi';

interface OkunabilirGenislikProps {
  children: React.ReactNode;
}

export const OkunabilirGenislik: React.FC<OkunabilirGenislikProps> = ({ children }) => {
  const { width } = useWindowDimensions();
  const renkler = useRenkler();

  const daralt = icerikDaraltilmaliMi(width);

  // Ağaç ŞEKLİ iki durumda da aynıdır (dış + iç View); yalnız stil değişir.
  // Dallanıp farklı ağaç döndürseydik katla/aç anında alt ekran yeniden
  // bağlanır, kullanıcının yazdığı metin ve kaydırma konumu kaybolurdu.
  return (
    <View
      testID={daralt ? 'okunabilir-genislik' : undefined}
      style={daralt ? [stiller.dis, { backgroundColor: renkler.arkaplan }] : stiller.tam}
    >
      <View testID={daralt ? 'okunabilir-sutun' : undefined} style={daralt ? stiller.sutun : stiller.tam}>
        {children}
      </View>
    </View>
  );
};

const stiller = StyleSheet.create({
  tam: { flex: 1 },
  dis: { flex: 1, alignItems: 'center' },
  sutun: { flex: 1, width: '100%', maxWidth: OKUNABILIR_MAKS_GENISLIK_DP },
});
