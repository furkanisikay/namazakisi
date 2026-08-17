import React, { useCallback, useRef } from 'react';
import { AccessibilityInfo, Animated, InteractionManager, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRenkler } from '../../../core/theme';
import type { CapaId } from '../../../core/ayarlar/capalar';
import { useVurguBaglami } from './VurguSaglayici';

interface AyarCapasiProps {
  /** Arama indeksindeki çapa kimliği; `vurgula` route parametresiyle eşleşince vurgulanır. */
  id: CapaId;
  children: React.ReactNode;
}

/**
 * `ScrollView.getInnerViewRef` genel RN tiplerinde YOKTUR (yalnız runtime'da,
 * bkz. `node_modules/react-native/Libraries/Components/ScrollView/ScrollView.js`)
 * — güvenli bir daraltma ile eriş, `any` kullanma.
 */
interface ScrollViewIcGorunumErisimi {
  getInnerViewRef?: () => View | null;
}

const NABIZ_ADIM_SURESI_MS = 300;
const SABIT_TINT_SURESI_MS = 2000;
const SABIT_TINT_SONUS_MS = 400;
const KAYDIRMA_UST_BOSLUK = 16;

/**
 * Arama sonucundan gelen bir ayar kontrolünü sarmalar.
 *
 * `id`, `VurguSaglayici`'daki hedef çapa ile eşleşirse sayfa odaklanınca
 * kontrolü kaydırıp kısa bir nabız (tint) animasyonuyla vurgular. Eşleşmezse,
 * zaten tüketildiyse ya da ölçüm/eşleşme başarısız olursa SESSİZCE hiçbir şey
 * yapmaz — çökme yok. Vurgu bir kez çalışır (`vurguyuTuket`).
 *
 * Ölçüm ANINDA yapılır (`onLayout` DEĞİL — ebeveyne göreli `y` verir ve
 * ScrollView içeriğine göre değildir, vurguyu rastgele bir noktaya kaydırır).
 */
export const AyarCapasi: React.FC<AyarCapasiProps> = ({ id, children }) => {
  const renkler = useRenkler();
  const { scrollRef, hedefCapaId, tuketildiMi, vurguyuTuket } = useVurguBaglami();
  const capaRef = useRef<View>(null);
  const tint = useRef(new Animated.Value(0)).current;

  const nabizBaslat = useCallback(() => {
    Animated.sequence([
      Animated.timing(tint, { toValue: 1, duration: NABIZ_ADIM_SURESI_MS, useNativeDriver: true }),
      Animated.timing(tint, { toValue: 0, duration: NABIZ_ADIM_SURESI_MS, useNativeDriver: true }),
      Animated.timing(tint, { toValue: 1, duration: NABIZ_ADIM_SURESI_MS, useNativeDriver: true }),
      Animated.timing(tint, { toValue: 0, duration: NABIZ_ADIM_SURESI_MS, useNativeDriver: true }),
    ]).start();
  }, [tint]);

  const sabitTintGosterVeSondur = useCallback(() => {
    tint.setValue(1);
    // Ham setTimeout DEĞİL — Animated.delay ile Animated API içinde kalır:
    // testte suite teardown'ından sonra ateşleyen bir "naked" zamanlayıcı
    // bırakmaz (Animated.sequence teardown'da güvenle yarım kalabilir).
    Animated.sequence([
      Animated.delay(SABIT_TINT_SURESI_MS),
      Animated.timing(tint, { toValue: 0, duration: SABIT_TINT_SONUS_MS, useNativeDriver: true }),
    ]).start();
  }, [tint]);

  useFocusEffect(
    useCallback(() => {
      // Eşleşmiyor ya da zaten tüketildiyse hiçbir şey yapma (bir kez çalışır).
      if (id !== hedefCapaId || tuketildiMi) {
        return;
      }

      // native-stack giriş animasyonu sürerken erken scrollTo hedefi ıskalar.
      const gorev = InteractionManager.runAfterInteractions(() => {
        const kaydiriciIcGorunum = (
          scrollRef.current as unknown as ScrollViewIcGorunumErisimi | null
        )?.getInnerViewRef?.();
        if (!capaRef.current || !kaydiriciIcGorunum) {
          return; // ölçüm hedefi yok — sessizce geç
        }

        // findNodeHandle KULLANILMAZ (Fabric'te deprecated) — ref doğrudan geçirilir.
        capaRef.current.measureLayout(
          kaydiriciIcGorunum,
          (_x: number, y: number) => {
            AccessibilityInfo.isReduceMotionEnabled().then((hareketAzalt) => {
              scrollRef.current?.scrollTo({
                y: Math.max(0, y - KAYDIRMA_UST_BOSLUK),
                animated: !hareketAzalt,
              });
              vurguyuTuket();

              if (hareketAzalt) {
                sabitTintGosterVeSondur();
              } else {
                nabizBaslat();
              }
            });
          },
          () => {
            // Ölçüm başarısız — sessizce geç, çökme yok.
          },
        );
      });

      return () => gorev.cancel();
    }, [id, hedefCapaId, tuketildiMi, scrollRef, vurguyuTuket, nabizBaslat, sabitTintGosterVeSondur]),
  );

  return (
    <View ref={capaRef} collapsable={false}>
      {children}
      {/* Tint, çocukların KARDEŞİ olan absolute-fill overlay'dir (repodaki
          backdrop-kardeş deseninin aynısı) — çocukları SARMALASAYDI opacity
          çocuklara da uygulanır, dinlenme halinde (tint=0) tüm kontrol
          görünmez olurdu. pointerEvents="none" dokunmayı yutmasın diye şart. */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { borderRadius: 16, backgroundColor: renkler.birincil + '20', opacity: tint },
        ]}
      />
    </View>
  );
};
