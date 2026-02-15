import React, { useRef, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRenkler } from '../../../core/theme';
import { BlurView } from 'expo-blur';

interface PaylasimModalProps {
  gorunur: boolean;
  onKapat: () => void;
  children: React.ReactNode; // Paylaşılacak içerik buraya gelecek
}

export const PaylasimModal: React.FC<PaylasimModalProps> = ({
  gorunur,
  onKapat,
  children,
}) => {
  const renkler = useRenkler();
  const viewRef = useRef<View | null>(null);
  const [paylasiliyor, setPaylasiliyor] = useState(false);
  const [captureLayout, setCaptureLayout] = useState({ width: 0, height: 0 });

  const paylas = async () => {
    try {
      setPaylasiliyor(true);

      if (!viewRef.current) {
        Alert.alert('Hata', 'Görsel henüz hazır değil.');
        return;
      }

      if (captureLayout.width === 0 || captureLayout.height === 0) {
        console.warn("Görsel boyutları henüz hesaplanamadı.");
        // Fallback: boyut belirtmeden yakala (cihaz çözünürlüğü)
        const uri = await captureRef(viewRef, {
          format: 'png',
          quality: 1,
          result: 'tmpfile',
        });
        await shareImage(uri);
        return;
      }

      // 1. Görseli yakala (2x Çözünürlük)
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile', // Geçici dosya olarak kaydet
        width: captureLayout.width * 2, // 2x Genişlik
        height: captureLayout.height * 2, // 2x Yükseklik
      });

      await shareImage(uri);

    } catch (error) {
      console.error('Paylaşım hatası:', error);
      Alert.alert('Hata', 'Görsel oluşturulurken bir hata oluştu.');
    } finally {
      setPaylasiliyor(false);
    }
  };

  const shareImage = async (uri: string) => {
    // 2. Paylaşım diyaloğunu aç
    // UTI (Uniform Type Identifier) iOS için önemli olabilir, image/png varsayılan
    const isAvailable = await Sharing.isAvailableAsync();

    if (isAvailable) {
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Başarını Paylaş', // Android için
        UTI: 'public.png', // iOS için
      });
    } else {
      Alert.alert('Uyarı', 'Paylaşım özelliği bu cihazda kullanılamıyor.');
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={gorunur}
      onRequestClose={onKapat}
    >
      <View className="flex-1 justify-end">
        {/* Arka plan bulanıklığı ve kapatma alanı */}
        <TouchableOpacity
          className="absolute top-0 left-0 right-0 bottom-0 bg-black/60"
          activeOpacity={1}
          onPress={onKapat}
        >
          <BlurView intensity={20} className="flex-1" />
        </TouchableOpacity>

        {/* Modal İçeriği */}
        <View
          className="rounded-t-3xl p-6 w-full items-center"
          style={{ backgroundColor: renkler.kartArkaplan }}
        >
          {/* Sürükleme Çubuğu */}
          <View className="w-12 h-1.5 rounded-full bg-gray-300 mb-6 opacity-50" />

          <Text className="text-lg font-bold mb-6 text-center" style={{ color: renkler.metin }}>
            Başarını Paylaş
          </Text>

          {/* Yakalanacak Alan (Kullanıcıya önizleme olarak da sunulur) */}
          <View
            className="mb-8 shadow-xl"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            <View
              ref={viewRef}
              collapsable={false}
              style={{ backgroundColor: 'transparent' }}
              onLayout={(event) => {
                const { width, height } = event.nativeEvent.layout;
                setCaptureLayout({ width, height });
              }}
            >
              {children}
            </View>
          </View>

          {/* Butonlar */}
          <View className="w-full flex-row space-x-4 mb-4">
            <TouchableOpacity
              className="flex-1 py-4 rounded-xl flex-row items-center justify-center space-x-2"
              style={{ backgroundColor: renkler.kartArkaplan, borderWidth: 1, borderColor: renkler.sinir }}
              onPress={onKapat}
              disabled={paylasiliyor}
            >
              <Text className="font-semibold" style={{ color: renkler.metin }}>Kapat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 py-4 rounded-xl flex-row items-center justify-center space-x-2"
              style={{ backgroundColor: renkler.birincil }}
              onPress={paylas}
              disabled={paylasiliyor}
            >
              {paylasiliyor ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <FontAwesome5 name="share-alt" size={18} color="white" style={{ marginRight: 8 }} />
                  <Text className="font-bold text-white">Hikayene Ekle</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <Text className="text-xs text-center opacity-60" style={{ color: renkler.metinIkincil }}>
            Instagram, WhatsApp ve diğerlerinde paylaşılabilir.
          </Text>

        </View>
      </View>
    </Modal>
  );
};
