/**
 * Tek bir namaz icin kart komponenti
 */

import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  Animated,
} from 'react-native';
import { Namaz } from '../../core/types';
import { RENKLER, BOYUTLAR } from '../../core/constants/UygulamaSabitleri';

interface NamazKartiProps {
  namaz: Namaz;
  onToggle: (namazAdi: string, tamamlandi: boolean) => void;
  disabled?: boolean;
}

export const NamazKarti: React.FC<NamazKartiProps> = ({ 
  namaz, 
  onToggle,
  disabled = false,
}) => {
  const handlePress = () => {
    if (!disabled) {
      onToggle(namaz.namazAdi, !namaz.tamamlandi);
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        namaz.tamamlandi && styles.containerTamamlandi,
        disabled && styles.containerDisabled,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View style={styles.solBolum}>
        <View style={[
          styles.checkbox,
          namaz.tamamlandi && styles.checkboxTamamlandi,
        ]}>
          {namaz.tamamlandi && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </View>
        <Text style={[
          styles.namazAdi,
          namaz.tamamlandi && styles.namazAdiTamamlandi,
        ]}>
          {namaz.namazAdi}
        </Text>
      </View>
      <View style={[
        styles.durum,
        namaz.tamamlandi ? styles.durumTamamlandi : styles.durumBekliyor,
      ]}>
        <Text style={[
          styles.durumMetni,
          namaz.tamamlandi ? styles.durumMetniTamamlandi : styles.durumMetniBekliyor,
        ]}>
          {namaz.tamamlandi ? '✓ Kılındı' : '○ Bekliyor'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: RENKLER.BEYAZ,
    borderRadius: BOYUTLAR.YUVARLATMA_ORTA,
    padding: BOYUTLAR.PADDING_ORTA,
    marginBottom: BOYUTLAR.MARGIN_KUCUK,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: RENKLER.SIYAH,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  containerTamamlandi: {
    backgroundColor: RENKLER.BIRINCIL_ACIK,
    borderColor: RENKLER.BIRINCIL,
  },
  containerDisabled: {
    opacity: 0.6,
  },
  solBolum: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: RENKLER.GRI,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: BOYUTLAR.MARGIN_ORTA,
  },
  checkboxTamamlandi: {
    backgroundColor: RENKLER.BIRINCIL,
    borderColor: RENKLER.BIRINCIL,
  },
  checkmark: {
    color: RENKLER.BEYAZ,
    fontSize: 16,
    fontWeight: 'bold',
  },
  namazAdi: {
    fontSize: BOYUTLAR.FONT_ORTA,
    fontWeight: '600',
    color: RENKLER.GRI_KOYU,
  },
  namazAdiTamamlandi: {
    color: RENKLER.BIRINCIL_KOYU,
  },
  durum: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  durumTamamlandi: {
    backgroundColor: RENKLER.BIRINCIL_ACIK,
  },
  durumBekliyor: {
    backgroundColor: '#FFF3E0',
  },
  durumMetni: {
    fontSize: BOYUTLAR.FONT_KUCUK,
    fontWeight: 'bold',
  },
  durumMetniTamamlandi: {
    color: RENKLER.BIRINCIL_KOYU,
  },
  durumMetniBekliyor: {
    color: '#E65100',
  },
});

