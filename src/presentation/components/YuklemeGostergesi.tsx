/**
 * Yukleme gostergesi komponenti
 * Lottie animasyonu ile yukleme gosterir
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RENKLER, BOYUTLAR } from '../../core/constants/UygulamaSabitleri';
import { YukleniyorAnimasyonu } from './LottieAnimasyon';

interface YuklemeGostergesiProps {
  mesaj?: string;
  boyut?: number;
}

export const YuklemeGostergesi: React.FC<YuklemeGostergesiProps> = ({
  mesaj = 'Yükleniyor...',
  boyut = 80,
}) => {
  return (
    <View style={styles.container}>
      <YukleniyorAnimasyonu boyut={boyut} />
      <Text style={styles.mesaj}>{mesaj}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 80,
    backgroundColor: RENKLER.ARKAPLAN,
  },
  mesaj: {
    marginTop: BOYUTLAR.MARGIN_ORTA,
    fontSize: BOYUTLAR.FONT_NORMAL,
    color: RENKLER.GRI_KOYU,
  },
});

