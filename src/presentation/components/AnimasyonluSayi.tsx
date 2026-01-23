/**
 * Animasyonlu sayi gostergesi
 * Counting up/down animasyonu ile sayi gosterir
 */

import React, { useEffect, useRef, useState } from 'react';
import { Text, StyleSheet, Animated, Easing, TextStyle } from 'react-native';
import { useRenkler } from '../../core/theme';

interface AnimasyonluSayiProps {
  /** Gosterilecek sayi */
  deger: number;
  /** Animasyon suresi (ms) */
  sure?: number;
  /** Ondalik basamak sayisi */
  ondalikBasamak?: number;
  /** Onek (ornegin "%") */
  onek?: string;
  /** Sonek (ornegin " TL") */
  sonek?: string;
  /** Yazi stili */
  stil?: TextStyle;
  /** Renk */
  renk?: string;
  /** Boyut */
  fontSize?: number;
  /** Animasyon tamamlandiginda callback */
  animasyonBittiCallback?: () => void;
}

/**
 * Animasyonlu sayi gostergesi
 * Deger degistiginde counting animasyonu gosterir
 */
export const AnimasyonluSayi: React.FC<AnimasyonluSayiProps> = ({
  deger,
  sure = 1000,
  ondalikBasamak = 0,
  onek = '',
  sonek = '',
  stil,
  renk,
  fontSize = 24,
  animasyonBittiCallback,
}) => {
  const renkler = useRenkler();
  const animatedDeger = useRef(new Animated.Value(0)).current;
  const [gosterilenDeger, setGosterilenDeger] = useState(0);
  const oncekiDeger = useRef(0);

  // Scale animasyonu icin
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Onceki animasyonu durdur
    animatedDeger.stopAnimation();

    // Baslangic degerini ayarla
    animatedDeger.setValue(oncekiDeger.current);

    // Counting animasyonu
    Animated.timing(animatedDeger, {
      toValue: deger,
      duration: sure,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() => {
      oncekiDeger.current = deger;
      animasyonBittiCallback?.();
    });

    // Scale bounce efekti
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: false,
      }),
    ]).start();
  }, [deger, sure]);

  // Degeri dinle
  useEffect(() => {
    const listenerId = animatedDeger.addListener(({ value }) => {
      setGosterilenDeger(value);
    });

    return () => {
      animatedDeger.removeListener(listenerId);
    };
  }, []);

  // Formatli deger
  const formatlaDeger = () => {
    const formatli = ondalikBasamak > 0
      ? gosterilenDeger.toFixed(ondalikBasamak)
      : Math.round(gosterilenDeger).toString();
    return `${onek}${formatli}${sonek}`;
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Text
        style={[
          styles.metin,
          { color: renk || renkler.birincil, fontSize },
          stil,
        ]}
      >
        {formatlaDeger()}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  metin: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
