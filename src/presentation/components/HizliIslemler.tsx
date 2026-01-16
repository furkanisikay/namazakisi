/**
 * Hizli islemler komponenti
 * Tumunu tamamla / Tumunu sifirla butonlari
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RENKLER, BOYUTLAR } from '../../core/constants/UygulamaSabitleri';

interface HizliIslemlerProps {
  onTumunuTamamla: () => void;
  onTumunuSifirla: () => void;
  disabled?: boolean;
}

export const HizliIslemler: React.FC<HizliIslemlerProps> = ({
  onTumunuTamamla,
  onTumunuSifirla,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.buton, styles.tamamlaButonu, disabled && styles.butonDisabled]}
        onPress={onTumunuTamamla}
        activeOpacity={0.7}
        disabled={disabled}
      >
        <Text style={styles.butonText}>✓ Tumunu Tamamla</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.buton, styles.sifirlaButonu, disabled && styles.butonDisabled]}
        onPress={onTumunuSifirla}
        activeOpacity={0.7}
        disabled={disabled}
      >
        <Text style={[styles.butonText, styles.sifirlaText]}>↺ Sifirla</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: BOYUTLAR.PADDING_ORTA,
    backgroundColor: RENKLER.BEYAZ,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  buton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BOYUTLAR.YUVARLATMA_KUCUK,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  tamamlaButonu: {
    backgroundColor: RENKLER.BIRINCIL,
  },
  sifirlaButonu: {
    backgroundColor: RENKLER.GRI_ACIK,
    borderWidth: 1,
    borderColor: RENKLER.GRI,
  },
  butonDisabled: {
    opacity: 0.5,
  },
  butonText: {
    fontSize: BOYUTLAR.FONT_NORMAL,
    fontWeight: '600',
    color: RENKLER.BEYAZ,
  },
  sifirlaText: {
    color: RENKLER.GRI_KOYU,
  },
});

