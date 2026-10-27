/**
 * Ayarlar aramasının hap biçimli giriş alanı.
 *
 * Yalnız kontrollü bir metin girişi + doluyken görünen temizle butonu —
 * arama mantığı (indeksleme/eşleştirme) burada YAŞAMAZ, `AyarlarSayfasi`
 * `ayarAra`'yı çağırır ve sonucu `AramaSonuclari`'na geçer.
 *
 * (Task 5 — Ayarlar ekranı yeniden kurulumu, arama arayüzü)
 */
import * as React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useMetin } from '../../hooks/useMetin';

export interface AramaAlaniProps {
  deger: string;
  onDegistir: (deger: string) => void;
}

export const AramaAlani: React.FC<AramaAlaniProps> = ({ deger, onDegistir }) => {
  const renkler = useRenkler();
  const m = useMetin().ayarlar.ana;

  return (
    <View
      className="flex-row items-center rounded-2xl mx-4 px-3.5"
      style={{
        backgroundColor: renkler.kartArkaplan,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: renkler.sinir,
        minHeight: 44,
      }}
    >
      <FontAwesome5 name="search" size={15} color={renkler.metinIkincil} solid />
      <TextInput
        value={deger}
        onChangeText={onDegistir}
        placeholder={m.aramaYer}
        placeholderTextColor={renkler.metinIkincil}
        className="flex-1 ml-3 text-sm"
        style={{ color: renkler.metin, paddingVertical: 10 }}
        accessibilityLabel={m.aramaYer}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
      />
      {deger.length > 0 && (
        <TouchableOpacity
          onPress={() => onDegistir('')}
          className="w-11 h-11 items-center justify-center -mr-2"
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={m.aramayiTemizle}
        >
          <FontAwesome5 name="times-circle" size={16} color={renkler.metinIkincil} solid />
        </TouchableOpacity>
      )}
    </View>
  );
};
