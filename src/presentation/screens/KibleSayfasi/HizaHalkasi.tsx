import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { FontAwesome5 } from '@expo/vector-icons';

/**
 * Ekranın TEK imza anı: hizaya girişte halka bir kez yayılıp söner (650 ms) ve ✓ yaylanarak
 * oturur. Çıkışta hiçbir şey olmaz (sessizce soluklaşır); boşta sıfır hareket.
 * "Animasyonları azalt" açıksa yayılma yok, ✓ doğrudan son karesinde (bilgi hareketle
 * değil, ✓ ve metinle verilir).
 */
export const HizaHalkasi: React.FC<{
  hizali: boolean;
  renk: string;
  ustRenk: string;
  boyut: number;
  hareketAzalt: boolean;
}> = ({ hizali, renk, ustRenk, boyut, hareketAzalt }) => {
  const yayilma = useSharedValue(0);
  const onay = useSharedValue(hizali ? 1 : 0);
  const onceki = useRef(hizali);

  useEffect(() => {
    const girdi = hizali && !onceki.current;
    onceki.current = hizali;
    if (hareketAzalt) {
      onay.value = hizali ? 1 : 0;
      yayilma.value = 0;
      return;
    }
    onay.value = withTiming(hizali ? 1 : 0, { duration: hizali ? 320 : 180, easing: Easing.out(Easing.back(1.8)) });
    if (girdi) {
      yayilma.value = 0;
      yayilma.value = withTiming(1, { duration: 650, easing: Easing.out(Easing.cubic) });
    }
  }, [hizali, hareketAzalt, onay, yayilma]);

  const halkaStili = useAnimatedStyle(() => ({
    opacity: yayilma.value > 0 && yayilma.value < 1 ? 0.85 * (1 - yayilma.value) : 0,
    transform: [{ scale: 0.7 + 0.9 * yayilma.value }],
  }));
  const onayStili = useAnimatedStyle(() => ({
    opacity: onay.value,
    transform: [{ scale: 0.4 + 0.6 * onay.value }],
  }));

  return (
    <View pointerEvents="none" style={[styles.kap, { width: boyut, height: boyut }]}>
      <Animated.View
        style={[
          styles.halka,
          { width: boyut, height: boyut, borderRadius: boyut / 2, borderColor: renk },
          halkaStili,
        ]}
      />
      <Animated.View
        testID={hizali ? 'kible-hiza-onayi' : undefined}
        style={[styles.onay, { backgroundColor: renk, width: boyut * 0.34, height: boyut * 0.34, borderRadius: boyut * 0.17 }, onayStili]}
      >
        <FontAwesome5 name="check" size={boyut * 0.16} color={ustRenk} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  kap: { alignItems: 'center', justifyContent: 'center' },
  halka: { position: 'absolute', borderWidth: 3 },
  onay: { alignItems: 'center', justifyContent: 'center' },
});
