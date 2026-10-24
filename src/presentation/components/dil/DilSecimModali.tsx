/**
 * Kurulum sihirbazından açılan dil seçimi (Ayarlar'daki sayfayla aynı `DilSecici`).
 * Başlık iki dillidir; dil seçilince modal açık kalır ve yeni dilde çizilir, kullanıcı
 * "Kapatın" ile döner. Sesli okuma sorusunun modalı bu ağacın içindedir (iOS kardeş modal kuralı).
 */
import * as React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useMetin } from '../../hooks/useMetin';
import { useDonanimGeriTusu } from '../../hooks/useDonanimGeriTusu';
import { DilSecici } from './DilSecici';

export interface DilSecimModaliProps {
  gorunur: boolean;
  onKapat: () => void;
  secimVar: boolean | null;
  cihazYerelAyari: string | null;
  onDegisti?: (secim: string) => void;
}

export const DilSecimModali: React.FC<DilSecimModaliProps> = ({ gorunur, onKapat, secimVar, cihazYerelAyari, onDegisti }) => {
  const renkler = useRenkler();
  const metin = useMetin();
  const m = metin.dilAyar;
  useDonanimGeriTusu(gorunur, onKapat);

  return (
    <Modal visible={gorunur} animationType="fade" transparent statusBarTranslucent onRequestClose={onKapat}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <TouchableWithoutFeedback onPress={onKapat}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
        </TouchableWithoutFeedback>
        <View
          style={{
            width: '88%',
            maxWidth: 420,
            maxHeight: '80%',
            backgroundColor: renkler.kartArkaplan,
            borderRadius: 24,
            padding: 24,
            borderWidth: 1,
            borderColor: renkler.sinir,
          }}
        >
          <View className="flex-row items-center mb-4">
            <View className="w-11 h-11 rounded-2xl items-center justify-center mr-3" style={{ backgroundColor: renkler.birincil + '20' }}>
              <FontAwesome5 name="language" size={18} color={renkler.birincil} />
            </View>
            <Text className="flex-1 text-base font-bold" style={{ color: renkler.metin }} accessibilityRole="header">
              {m.baslik}
            </Text>
          </View>
          <ScrollView style={{ flexGrow: 0 }}>
            <DilSecici secimVar={secimVar} cihazYerelAyari={cihazYerelAyari} onDegisti={onDegisti} testID="kurulum-dil-secici" />
          </ScrollView>
          <TouchableOpacity
            className="items-center justify-center py-3.5 rounded-2xl mt-5"
            style={{ backgroundColor: renkler.birincil, minHeight: 44 }}
            onPress={onKapat}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={metin.ortak.kapatin}
            testID="kurulum-dil-kapat"
          >
            <View className="flex-row items-center">
              <FontAwesome5 name="check" size={13} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
                {metin.ortak.kapatin}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
