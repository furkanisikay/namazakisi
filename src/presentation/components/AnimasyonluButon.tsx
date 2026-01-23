/**
 * Animasyonlu buton bileseni
 * Press animasyonu ve glow efekti ile
 */

import React, { useRef } from 'react';
import { 
  Text, 
  StyleSheet, 
  Animated, 
  TouchableWithoutFeedback,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useRenkler } from '../../core/theme';
import { useFeedback } from '../../core/feedback';

interface AnimasyonluButonProps {
  /** Buton metni */
  metin: string;
  /** Tiklama callback */
  onPress: () => void;
  /** Buton tipi */
  tip?: 'birincil' | 'ikincil' | 'tehlike';
  /** Ikon (emoji veya metin) */
  ikon?: string;
  /** Devre disi */
  disabled?: boolean;
  /** Tam genislik */
  tamGenislik?: boolean;
  /** Ek stil */
  stil?: ViewStyle;
  /** Metin stili */
  metinStili?: TextStyle;
}

/**
 * Animasyonlu buton
 * Press scale ve glow efekti ile
 */
export const AnimasyonluButon: React.FC<AnimasyonluButonProps> = ({
  metin,
  onPress,
  tip = 'birincil',
  ikon,
  disabled = false,
  tamGenislik = false,
  stil,
  metinStili,
}) => {
  const renkler = useRenkler();
  const { butonTiklandiFeedback } = useFeedback();
  
  // Animasyon degerleri - useNativeDriver: false ile tutarli
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Press in
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 5,
      useNativeDriver: false,
    }).start();
  };

  // Press out
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 100,
      useNativeDriver: false,
    }).start();
  };

  // Press
  const handlePress = async () => {
    if (disabled) return;
    await butonTiklandiFeedback();
    onPress();
  };

  // Tip bazli renkler
  const getRenkler = () => {
    switch (tip) {
      case 'birincil':
        return {
          arkaplan: renkler.birincil,
          metin: '#FFFFFF',
        };
      case 'ikincil':
        return {
          arkaplan: renkler.kartArkaplan,
          metin: renkler.metin,
        };
      case 'tehlike':
        return {
          arkaplan: renkler.hata,
          metin: '#FFFFFF',
        };
      default:
        return {
          arkaplan: renkler.birincil,
          metin: '#FFFFFF',
        };
    }
  };

  const butonRenkleri = getRenkler();

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: butonRenkleri.arkaplan,
            borderColor: tip === 'ikincil' ? renkler.sinir : 'transparent',
            borderWidth: tip === 'ikincil' ? 1 : 0,
            transform: [{ scale: scaleAnim }],
          },
          tamGenislik && styles.tamGenislik,
          disabled && styles.disabled,
          stil,
        ]}
      >
        {ikon && <Text style={styles.ikon}>{ikon}</Text>}
        <Text
          style={[
            styles.metin,
            { color: butonRenkleri.metin },
            metinStili,
          ]}
        >
          {metin}
        </Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  tamGenislik: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  ikon: {
    fontSize: 18,
    marginRight: 8,
  },
  metin: {
    fontSize: 16,
    fontWeight: '600',
  },
});
