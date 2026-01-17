/**
 * Motivasyon banner bileseni
 * Animasyonlu motivasyon mesaji gosterir
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useRenkler } from '../../core/theme';

interface MotivasyonBannerProps {
  /** Tamamlanan namaz sayisi */
  tamamlanan: number;
  /** Toplam namaz sayisi */
  toplam: number;
}

// Motivasyon mesajlari
const MOTIVASYON_MESAJLARI = {
  0: { mesaj: 'Haydi başlayalım! İlk namaz seni bekliyor 🤲', ikon: '🌟' },
  1: { mesaj: 'Güzel başlangıç! Devam et 💪', ikon: '🔥' },
  2: { mesaj: 'İyi gidiyorsun! Yarı yola geldin 🎯', ikon: '⚡' },
  3: { mesaj: 'Harika! Az kaldı 🚀', ikon: '✨' },
  4: { mesaj: 'Muhteşem! Son bir namaz kaldı 🏆', ikon: '🎖️' },
  5: { mesaj: 'MÜKEMMEL! Tüm namazlar tamam! 🎉', ikon: '👑' },
};

/**
 * Animasyonlu motivasyon banner
 */
export const MotivasyonBanner: React.FC<MotivasyonBannerProps> = ({
  tamamlanan,
  toplam,
}) => {
  const renkler = useRenkler();

  // Animasyon degerleri - hepsi useNativeDriver: false ile tutarli
  const slideAnim = useRef(new Animated.Value(30)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const ikonRotateAnim = useRef(new Animated.Value(0)).current;

  const [mevcutMesaj, setMevcutMesaj] = useState(MOTIVASYON_MESAJLARI[0]);
  const oncekiTamamlanan = useRef(tamamlanan);

  // Mesaj guncelleme ve animasyon
  useEffect(() => {
    const yeniMesaj = MOTIVASYON_MESAJLARI[tamamlanan as keyof typeof MOTIVASYON_MESAJLARI]
      || MOTIVASYON_MESAJLARI[0];

    // Eger tamamlanan sayisi arttiysa ozel animasyon
    if (tamamlanan > oncekiTamamlanan.current) {
      // Cikis animasyonu
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(slideAnim, {
          toValue: -20,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start(() => {
        // Mesaji guncelle
        setMevcutMesaj(yeniMesaj);
        slideAnim.setValue(30);

        // Giris animasyonu
        Animated.parallel([
          Animated.spring(slideAnim, {
            toValue: 0,
            friction: 6,
            tension: 80,
            useNativeDriver: false,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            useNativeDriver: false,
          }),
        ]).start();

        // Ikon donme animasyonu
        Animated.sequence([
          Animated.timing(ikonRotateAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: false,
          }),
          Animated.timing(ikonRotateAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ]).start();
      });
    } else {
      // Normal giris animasyonu
      setMevcutMesaj(yeniMesaj);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 6,
          tension: 80,
          useNativeDriver: false,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: false,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          useNativeDriver: false,
        }),
      ]).start();
    }

    oncekiTamamlanan.current = tamamlanan;
  }, [tamamlanan]);

  // Ikon rotasyonu
  const ikonRotasyon = ikonRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Arka plan rengi (tamamlanma durumuna gore)
  const getArkaplanRengi = () => {
    if (tamamlanan === toplam) return `${renkler.birincil}30`;
    if (tamamlanan >= toplam * 0.8) return `${renkler.birincil}20`;
    if (tamamlanan >= toplam * 0.4) return `${renkler.bilgi}20`;
    return `${renkler.uyari}20`;
  };

  // Metin rengi
  const getMetinRengi = () => {
    if (tamamlanan === toplam) return renkler.birincil;
    if (tamamlanan >= toplam * 0.8) return renkler.birincil;
    if (tamamlanan >= toplam * 0.4) return renkler.bilgi;
    return renkler.uyari;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: getArkaplanRengi(),
          opacity: opacityAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <Animated.Text
        style={[
          styles.ikon,
          { transform: [{ rotate: ikonRotasyon }] },
        ]}
      >
        {mevcutMesaj.ikon}
      </Animated.Text>
      <Text style={[styles.mesaj, { color: getMetinRengi() }]}>
        {mevcutMesaj.mesaj}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
  },
  ikon: {
    fontSize: 24,
    marginRight: 10,
  },
  mesaj: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
});
