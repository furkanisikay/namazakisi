/**
 * Namaz Grid bileseni
 * 5 namazi grid formatinda gosterir
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Namaz } from '../../core/types';
import { KompaktNamazKarti } from './KompaktNamazKarti';

interface NamazGridProps {
  namazlar: Namaz[];
  onToggle: (namazAdi: string, tamamlandi: boolean) => void;
  disabled?: boolean;
}

/**
 * Namaz Grid
 * 5 namazi 3+2 formatinda veya tek satirda gosterir
 */
export const NamazGrid: React.FC<NamazGridProps> = ({
  namazlar,
  onToggle,
  disabled = false,
}) => {
  // Namazlari 3+2 olarak ayir
  const ustSatir = namazlar.slice(0, 3); // Sabah, Ogle, Ikindi
  const altSatir = namazlar.slice(3); // Aksam, Yatsi

  return (
    <View style={styles.container}>
      {/* Ust satir - 3 namaz */}
      <View style={styles.satir}>
        {ustSatir.map((namaz, index) => (
          <KompaktNamazKarti
            key={namaz.namazAdi}
            namaz={namaz}
            onToggle={onToggle}
            disabled={disabled}
            animasyonGecikmesi={index * 100}
          />
        ))}
      </View>

      {/* Alt satir - 2 namaz (ortali) */}
      <View style={[styles.satir, styles.altSatir]}>
        {altSatir.map((namaz, index) => (
          <KompaktNamazKarti
            key={namaz.namazAdi}
            namaz={namaz}
            onToggle={onToggle}
            disabled={disabled}
            animasyonGecikmesi={(index + 3) * 100}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 8,
  },
  satir: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 4,
  },
  altSatir: {
    justifyContent: 'center',
    paddingHorizontal: '8%',
  },
});

