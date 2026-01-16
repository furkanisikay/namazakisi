/**
 * Lottie animasyon bileşeni
 * Basari, kutlama ve yukleme animasyonlari
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';

// Animasyon tipleri
export type AnimasyonTipi = 'basari' | 'kutlama' | 'yukleniyor';

// Animasyon dosyalari
const ANIMASYON_DOSYALARI = {
  basari: require('../../../assets/animations/basari.json'),
  kutlama: require('../../../assets/animations/kutlama.json'),
  yukleniyor: require('../../../assets/animations/yukleniyor.json'),
};

interface LottieAnimasyonProps {
  tip: AnimasyonTipi;
  boyut?: number;
  otomatikOynat?: boolean;
  dongu?: boolean;
  hiz?: number;
  stil?: ViewStyle;
  animasyonBittiCallback?: () => void;
}

/**
 * Lottie animasyon gosterim bilesen
 */
export const LottieAnimasyon: React.FC<LottieAnimasyonProps> = ({
  tip,
  boyut = 100,
  otomatikOynat = true,
  dongu = false,
  hiz = 1,
  stil,
  animasyonBittiCallback,
}) => {
  const animasyonRef = useRef<LottieView>(null);

  useEffect(() => {
    if (otomatikOynat && animasyonRef.current) {
      animasyonRef.current.play();
    }
  }, [otomatikOynat]);

  return (
    <View style={[styles.container, { width: boyut, height: boyut }, stil]}>
      <LottieView
        ref={animasyonRef}
        source={ANIMASYON_DOSYALARI[tip]}
        autoPlay={otomatikOynat}
        loop={dongu}
        speed={hiz}
        style={styles.animasyon}
        onAnimationFinish={animasyonBittiCallback}
      />
    </View>
  );
};

/**
 * Basari animasyonu - Tik isareti ile kutlama
 */
export const BasariAnimasyonu: React.FC<{
  boyut?: number;
  gorunsun?: boolean;
  animasyonBittiCallback?: () => void;
}> = ({ boyut = 120, gorunsun = true, animasyonBittiCallback }) => {
  if (!gorunsun) return null;

  return (
    <LottieAnimasyon
      tip="basari"
      boyut={boyut}
      otomatikOynat={true}
      dongu={false}
      animasyonBittiCallback={animasyonBittiCallback}
    />
  );
};

/**
 * Kutlama animasyonu - Confetti efekti
 */
export const KutlamaAnimasyonu: React.FC<{
  boyut?: number;
  gorunsun?: boolean;
  animasyonBittiCallback?: () => void;
}> = ({ boyut = 150, gorunsun = true, animasyonBittiCallback }) => {
  if (!gorunsun) return null;

  return (
    <View style={styles.kutlamaContainer}>
      <LottieAnimasyon
        tip="kutlama"
        boyut={boyut}
        otomatikOynat={true}
        dongu={false}
        animasyonBittiCallback={animasyonBittiCallback}
      />
    </View>
  );
};

/**
 * Yukleniyor animasyonu - Spinner
 */
export const YukleniyorAnimasyonu: React.FC<{
  boyut?: number;
}> = ({ boyut = 60 }) => {
  return (
    <LottieAnimasyon
      tip="yukleniyor"
      boyut={boyut}
      otomatikOynat={true}
      dongu={true}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  animasyon: {
    width: '100%',
    height: '100%',
  },
  kutlamaContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    pointerEvents: 'none',
  },
});


