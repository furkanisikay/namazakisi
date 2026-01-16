import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Platform } from 'react-native';
import { useRenkler } from '../../core/theme';

interface AnimasyonluSayacProps {
  hedefZaman: Date | string | null;
  seviye: number; // 0: Normal, 1: Uyari, 2: Orta, 3: Kritik, 4: Alarm
}

export const AnimasyonluSayac: React.FC<AnimasyonluSayacProps> = ({ hedefZaman, seviye }) => {
  const renkler = useRenkler();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [sureMetni, setSureMetni] = useState('--:--');

  // Geri sayım mantığı
  useEffect(() => {
    if (!hedefZaman) {
      setSureMetni('--:--');
      return;
    }

    const hedefMs = new Date(hedefZaman).getTime();

    const saniyeHesapla = () => {
      const simdiMs = Date.now();
      const toplamSaniye = Math.max(0, Math.floor((hedefMs - simdiMs) / 1000));

      const saat = Math.floor(toplamSaniye / 3600);
      const dakika = Math.floor((toplamSaniye % 3600) / 60);
      const saniye = toplamSaniye % 60;

      const parcalar = [];
      if (saat > 0) parcalar.push(saat.toString().padStart(2, '0'));
      parcalar.push(dakika.toString().padStart(2, '0'));
      parcalar.push(saniye.toString().padStart(2, '0'));

      setSureMetni(parcalar.join(':'));
    };

    saniyeHesapla();
    const interval = setInterval(saniyeHesapla, 1000);

    return () => clearInterval(interval);
  }, [hedefZaman]);

  // Seviye 3 ve 4'te nabız animasyonu
  useEffect(() => {
    if (seviye >= 3) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: seviye === 4 ? 400 : 800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: seviye === 4 ? 400 : 800,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [seviye]);

  const getRenk = () => {
    switch (seviye) {
      case 1: return '#FFC107'; // Sarı
      case 2: return '#FF9800'; // Turuncu
      case 3: return '#F44336'; // Kırmızı
      case 4: return '#D32F2F'; // Koyu Kırmızı
      default: return renkler.birincil || '#4CAF50'; // Varsayılan Yeşil
    }
  };

  return (
    <Animated.View style={[
      styles.container,
      {
        borderColor: getRenk(),
        transform: [{ scale: pulseAnim }]
      }
    ]}>
      <Text style={[styles.sure, { color: getRenk() }]}>{sureMetni}</Text>
      <Text style={[styles.etiket, { color: getRenk() }]}>KALDI</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
    backgroundColor: '#FFFFFF',
    // Gölge ekleyerek belirginleştirelim
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sure: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  etiket: {
    fontSize: 7,
    fontWeight: 'bold',
    marginTop: -2,
    letterSpacing: 0.5,
  },
});

