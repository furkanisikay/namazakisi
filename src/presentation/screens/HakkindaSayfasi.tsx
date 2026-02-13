/**
 * Hakkinda Sayfasi
 * Uygulama bilgileri ve versiyonu
 * 
 * NativeWind + Expo Vector Icons ile guncellenmis versiyon
 */

import * as React from 'react';
import { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  Easing,
  Linking,
  TouchableOpacity,
} from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../core/theme';
import { UYGULAMA } from '../../core/constants/UygulamaSabitleri';

/**
 * Bilgi satiri bileseni
 */
interface BilgiSatiriProps {
  etiket: string;
  deger: string;
  ikonAdi?: string;
  onPress?: () => void;
}

const BilgiSatiri: React.FC<BilgiSatiriProps> = ({ etiket, deger, ikonAdi, onPress }) => {
  const renkler = useRenkler();

  const icerik = (
    <View
      className="flex-row justify-between items-center py-3.5 px-4 border-b"
      style={{ borderBottomColor: renkler.sinir }}
    >
      <Text className="text-sm" style={{ color: renkler.metinIkincil }}>
        {etiket}
      </Text>
      <View className="flex-row items-center gap-2">
        {ikonAdi && (
          <FontAwesome5
            name={ikonAdi}
            size={14}
            color={onPress ? renkler.birincil : renkler.metin}
          />
        )}
        <Text
          className="text-sm font-semibold"
          style={{ color: onPress ? renkler.birincil : renkler.metin }}
        >
          {deger}
        </Text>
        {onPress && (
          <FontAwesome5
            name="external-link-alt"
            size={10}
            color={renkler.birincil}
          />
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {icerik}
      </TouchableOpacity>
    );
  }

  return icerik;
};

/**
 * Hakkinda Sayfasi
 */
export const HakkindaSayfasi: React.FC = () => {
  const renkler = useRenkler();

  // Guncel yil
  const guncelYil = new Date().getFullYear();

  // Giris animasyonu
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Web sitesini ac
  const handleWebSitesiAc = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: renkler.arkaplan }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        {/* Logo ve Baslik */}
        <View
          className="rounded-2xl p-6 items-center mb-6 shadow-md"
          style={{ backgroundColor: renkler.kartArkaplan }}
        >
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-4 shadow-lg"
            style={{ backgroundColor: renkler.birincil }}
          >
            <FontAwesome5 name="mosque" size={36} color="#FFFFFF" solid />
          </View>
          <Text
            className="text-2xl font-bold mb-1"
            style={{ color: renkler.metin }}
          >
            {UYGULAMA.ADI}
          </Text>
          <Text
            className="text-sm text-center leading-5"
            style={{ color: renkler.metinIkincil }}
          >
            {UYGULAMA.ACIKLAMA}
          </Text>
        </View>

        {/* Uygulama Bilgileri */}
        <View className="mb-6">
          <Text
            className="text-xs font-bold tracking-wider mb-3"
            style={{ color: renkler.metinIkincil }}
          >
            UYGULAMA BILGILERI
          </Text>

          <View
            className="rounded-xl overflow-hidden"
            style={{ backgroundColor: renkler.kartArkaplan }}
          >
            <BilgiSatiri
              etiket="Versiyon"
              deger={UYGULAMA.VERSIYON}
              ikonAdi="code-branch"
            />
            <BilgiSatiri
              etiket="Gelistirici"
              deger="Furkan ISIKAY"
              ikonAdi="user"
              onPress={() => handleWebSitesiAc('https://furkanisikay.com.tr')}
            />
            <BilgiSatiri
              etiket="Github"
              deger="namazakisi"
              ikonAdi="github"
              onPress={() => handleWebSitesiAc('https://github.com/furkanisikay/namazakisi')}
            />
          </View>
        </View>

        {/* Telif Hakki */}
        <View className="items-center mt-4">
          <Text className="text-xs mb-0.5" style={{ color: renkler.metinIkincil }}>
            © {guncelYil} Furkan ISIKAY
          </Text>
          <Text className="text-xs" style={{ color: renkler.metinIkincil }}>
            Tüm hakları saklıdır.
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
};
