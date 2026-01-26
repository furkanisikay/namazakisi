/**
 * Yükleme göstergesi komponenti
 * Basit ve profesyonel ActivityIndicator
 */

import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRenkler } from '../../core/theme';

interface YuklemeGostergesiProps {
  mesaj?: string;
  boyut?: 'small' | 'large';
}

export const YuklemeGostergesi: React.FC<YuklemeGostergesiProps> = ({
  mesaj = 'Yükleniyor...',
  boyut = 'large',
}) => {
  const renkler = useRenkler();

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: renkler.arkaplan,
        paddingBottom: 50,
      }}
    >
      <ActivityIndicator
        size={boyut}
        color={renkler.birincil}
      />
      {mesaj && (
        <Text
          style={{
            marginTop: 16,
            fontSize: 14,
            color: renkler.metinIkincil,
          }}
        >
          {mesaj}
        </Text>
      )}
    </View>
  );
};
