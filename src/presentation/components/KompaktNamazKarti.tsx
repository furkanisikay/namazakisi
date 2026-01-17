/**
 * Kompakt namaz karti
 * Tek ekranda 5 namazi gostermek icin kucuk kart
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Namaz } from '../../core/types';
import { useRenkler } from '../../core/theme';
import { useFeedback } from '../../core/feedback';

const { width: EKRAN_GENISLIGI } = Dimensions.get('window');
const KART_GENISLIGI = (EKRAN_GENISLIGI - 64) / 3; // 3 kart yan yana, 16px margin

// Namaz ikonlari
const NAMAZ_IKONLARI: { [key: string]: string } = {
  Sabah: '🌅',
  Ogle: '☀️',
  Ikindi: '🌤️',
  Aksam: '🌇',
  Yatsi: '🌙',
};

interface KompaktNamazKartiProps {
  namaz: Namaz;
  onToggle: (namazAdi: string, tamamlandi: boolean) => void;
  disabled?: boolean;
  /** Giris animasyonu gecikmesi */
  animasyonGecikmesi?: number;
}

/**
 * Kompakt namaz karti
 * Animasyonlu tiklanabilir kart
 */
export const KompaktNamazKarti: React.FC<KompaktNamazKartiProps> = ({
  namaz,
  onToggle,
  disabled = false,
  animasyonGecikmesi = 0,
}) => {
  const renkler = useRenkler();
  const { namazTamamlandiFeedback, butonTiklandiFeedback } = useFeedback();

  // Animasyon degerleri
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const tamamlandiAnim = useRef(new Animated.Value(namaz.tamamlandi ? 1 : 0)).current;

  // Giris animasyonu
  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: false,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }, animasyonGecikmesi);

    return () => clearTimeout(timeout);
  }, [animasyonGecikmesi]);

  // Tamamlandi durumu degistiginde animasyon
  useEffect(() => {
    Animated.timing(tamamlandiAnim, {
      toValue: namaz.tamamlandi ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [namaz.tamamlandi]);

  // Tiklama handler
  const handlePress = async () => {
    if (disabled) return;

    // Bounce animasyonu
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 100,
        useNativeDriver: false,
      }),
    ]).start();

    // Feedback
    if (!namaz.tamamlandi) {
      await namazTamamlandiFeedback();
    } else {
      await butonTiklandiFeedback();
    }

    onToggle(namaz.namazAdi, !namaz.tamamlandi);
  };

  // Dinamik renkler
  const arkaplanRengi = tamamlandiAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [renkler.kartArkaplan, renkler.birincilAcik],
  });

  const sinirRengi = tamamlandiAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [renkler.sinir, renkler.birincil],
  });

  const ikon = NAMAZ_IKONLARI[namaz.namazAdi] || '🕌';

  return (
    <Animated.View
      style={[
        styles.kartWrapper,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePress}
        disabled={disabled}
        style={styles.touchable}
      >
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: arkaplanRengi,
              borderColor: sinirRengi,
            },
            disabled && styles.containerDisabled,
          ]}
        >
          {/* Ust kisim - Ikon ve Durum */}
          <View style={styles.ustKisim}>
            <Text style={styles.ikon}>{ikon}</Text>
            <Animated.View
              style={[
                styles.durumDaire,
                {
                  backgroundColor: tamamlandiAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['transparent', renkler.birincil],
                  }),
                  borderColor: tamamlandiAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [renkler.sinir, renkler.birincil],
                  }),
                },
              ]}
            >
              {namaz.tamamlandi && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </Animated.View>
          </View>

          {/* Namaz adi */}
          <Text
            style={[
              styles.namazAdi,
              { color: namaz.tamamlandi ? renkler.birincil : renkler.metin }
            ]}
            numberOfLines={1}
          >
            {namaz.namazAdi}
          </Text>

          {/* Durum metni */}
          <Text
            style={[
              styles.durumMetni,
              { color: namaz.tamamlandi ? renkler.birincil : renkler.metinIkincil }
            ]}
          >
            {namaz.tamamlandi ? 'Kılındı' : 'Bekliyor'}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  kartWrapper: {
    width: KART_GENISLIGI,
    height: KART_GENISLIGI,
    margin: 6,
  },
  touchable: {
    flex: 1,
  },
  container: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  containerDisabled: {
    opacity: 0.5,
  },
  ustKisim: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  ikon: {
    fontSize: 32,
  },
  durumDaire: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  namazAdi: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  durumMetni: {
    fontSize: 11,
    fontWeight: '500',
  },
});
