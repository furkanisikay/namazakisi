/**
 * Dairesel ilerleme gostergesi
 * SVG tabanli animasyonlu circular progress
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated, Easing } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useRenkler } from '../../core/theme';

// Animated Circle icin wrapper
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface DaireselProgressProps {
  /** Ilerleme yuzdesi (0-100) */
  yuzde: number;
  /** Daire boyutu */
  boyut?: number;
  /** Cizgi kalinligi */
  cizgiKalinligi?: number;
  /** Animasyon suresi (ms) */
  animasyonSuresi?: number;
  /** Ortadaki yuzde metni gosterilsin mi */
  yuzdeGoster?: boolean;
  /** Ek bilgi metni (ornegin "4/5") */
  ekBilgi?: string;
  /** Animasyon tamamlandiginda callback */
  animasyonBittiCallback?: () => void;
}

/**
 * Animasyonlu dairesel ilerleme gostergesi
 */
export const DaireselProgress: React.FC<DaireselProgressProps> = ({
  yuzde,
  boyut = 180,
  cizgiKalinligi = 12,
  animasyonSuresi = 1500,
  yuzdeGoster = true,
  ekBilgi,
  animasyonBittiCallback,
}) => {
  const renkler = useRenkler();
  const animatedDeger = useRef(new Animated.Value(0)).current;
  const gosterilenYuzde = useRef(new Animated.Value(0)).current;

  // Daire hesaplamalari
  const yaricap = (boyut - cizgiKalinligi) / 2;
  const cevre = 2 * Math.PI * yaricap;
  const merkez = boyut / 2;

  // StrokeDashoffset hesaplama
  const strokeDashoffset = animatedDeger.interpolate({
    inputRange: [0, 100],
    outputRange: [cevre, 0],
    extrapolate: 'clamp',
  });

  // Yuzde degistiginde animasyonu baslat
  useEffect(() => {
    // Onceki animasyonlari durdur
    animatedDeger.stopAnimation();
    gosterilenYuzde.stopAnimation();

    // Yeni animasyon
    Animated.parallel([
      Animated.timing(animatedDeger, {
        toValue: yuzde,
        duration: animasyonSuresi,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(gosterilenYuzde, {
        toValue: yuzde,
        duration: animasyonSuresi,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start(() => {
      animasyonBittiCallback?.();
    });
  }, [yuzde, animasyonSuresi]);

  // Yuzde metnini dinle
  const [gosterilenYuzdeDeger, setGosterilenYuzdeDeger] = React.useState(0);
  
  useEffect(() => {
    const listenerId = gosterilenYuzde.addListener(({ value }) => {
      setGosterilenYuzdeDeger(Math.round(value));
    });

    return () => {
      gosterilenYuzde.removeListener(listenerId);
    };
  }, []);

  // Renk hesaplama (yuzdeye gore)
  const getRenk = () => {
    if (yuzde === 100) return '#FFD700'; // Altin
    if (yuzde >= 80) return renkler.birincil;
    if (yuzde >= 60) return renkler.birincil;
    if (yuzde >= 40) return renkler.uyari;
    return renkler.uyari;
  };

  return (
    <View style={[styles.container, { width: boyut, height: boyut }]}>
      <Svg width={boyut} height={boyut}>
        <G rotation="-90" origin={`${merkez}, ${merkez}`}>
          {/* Arka plan dairesi */}
          <Circle
            cx={merkez}
            cy={merkez}
            r={yaricap}
            stroke={renkler.sinir}
            strokeWidth={cizgiKalinligi}
            fill="transparent"
            strokeOpacity={0.3}
          />
          {/* Ilerleme dairesi */}
          <AnimatedCircle
            cx={merkez}
            cy={merkez}
            r={yaricap}
            stroke={getRenk()}
            strokeWidth={cizgiKalinligi}
            fill="transparent"
            strokeDasharray={cevre}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>

      {/* Orta icerik */}
      <View style={styles.ortaIcerik}>
        {yuzdeGoster && (
          <Text style={[styles.yuzdeMetin, { color: getRenk() }]}>
            {gosterilenYuzdeDeger}%
          </Text>
        )}
        {ekBilgi && (
          <Text style={[styles.ekBilgiMetin, { color: renkler.metinIkincil }]}>
            {ekBilgi}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ortaIcerik: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  yuzdeMetin: {
    fontSize: 42,
    fontWeight: 'bold',
  },
  ekBilgiMetin: {
    fontSize: 16,
    marginTop: 4,
    fontWeight: '500',
  },
});

