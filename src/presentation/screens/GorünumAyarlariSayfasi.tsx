/**
 * Gorunum Ayarlari Sayfasi
 * Tema modu ve renk paleti secimi
 * 
 * NativeWind + Expo Vector Icons ile guncellenmis versiyon
 */

import * as React from 'react';
import { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler, useTema, TemaModu } from '../../core/theme';
import { useFeedback } from '../../core/feedback';

// Tema modu ikon eslesmesi
const TEMA_MODU_IKONLARI: Record<TemaModu, string> = {
  sistem: 'mobile-alt',
  acik: 'sun',
  koyu: 'moon',
};

/**
 * Tema modu secici bileseni
 */
const TemaModuSecici: React.FC = () => {
  const renkler = useRenkler();
  const { mod, moduDegistir } = useTema();
  const { butonTiklandiFeedback } = useFeedback();

  const modlar: { id: TemaModu; etiket: string; aciklama: string }[] = [
    { id: 'sistem', etiket: 'Sistem', aciklama: 'Sistem ayarlarina gore' },
    { id: 'acik', etiket: 'Acik', aciklama: 'Her zaman acik tema' },
    { id: 'koyu', etiket: 'Koyu', aciklama: 'Her zaman koyu tema' },
  ];

  const handleModSecimi = async (yeniMod: TemaModu) => {
    await butonTiklandiFeedback();
    moduDegistir(yeniMod);
  };

  return (
    <View className="gap-3">
      {modlar.map((modItem) => {
        const seciliMi = mod === modItem.id;
        return (
          <TouchableOpacity
            key={modItem.id}
            className="flex-row items-center p-4 rounded-xl border-2"
            style={{
              backgroundColor: seciliMi ? renkler.birincil : renkler.kartArkaplan,
              borderColor: seciliMi ? renkler.birincil : renkler.sinir,
            }}
            onPress={() => handleModSecimi(modItem.id)}
            activeOpacity={0.7}
          >
            <View className="w-10 h-10 rounded-full items-center justify-center mr-3.5"
              style={{ backgroundColor: seciliMi ? 'rgba(255,255,255,0.2)' : `${renkler.birincil}15` }}
            >
              <FontAwesome5
                name={TEMA_MODU_IKONLARI[modItem.id]}
                size={18}
                color={seciliMi ? '#FFFFFF' : renkler.birincil}
                solid
              />
            </View>
            <Text
              className="text-base font-semibold flex-1"
              style={{ color: seciliMi ? '#FFFFFF' : renkler.metin }}
            >
              {modItem.etiket}
            </Text>
            <Text
              className="text-xs"
              style={{ color: seciliMi ? 'rgba(255,255,255,0.8)' : renkler.metinIkincil }}
            >
              {modItem.aciklama}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

/**
 * Renk paleti secici bileseni
 */
const RenkPaletiSecici: React.FC = () => {
  const renkler = useRenkler();
  const { palet, tumPaletler, paletiDegistir } = useTema();
  const { butonTiklandiFeedback } = useFeedback();

  const handlePaletSecimi = async (paletId: string) => {
    await butonTiklandiFeedback();
    paletiDegistir(paletId);
  };

  return (
    <View className="flex-row flex-wrap gap-3">
      {tumPaletler.map((paletItem) => {
        const seciliMi = palet.id === paletItem.id;
        return (
          <TouchableOpacity
            key={paletItem.id}
            className="items-center p-3 rounded-xl"
            style={{
              width: '30%',
              backgroundColor: renkler.kartArkaplan,
              borderColor: seciliMi ? paletItem.birincil : renkler.sinir,
              borderWidth: seciliMi ? 2 : 1,
            }}
            onPress={() => handlePaletSecimi(paletItem.id)}
            activeOpacity={0.7}
          >
            <View
              className="w-12 h-12 rounded-full items-center justify-center mb-2 shadow-sm"
              style={{ backgroundColor: paletItem.birincil }}
            >
              {seciliMi && (
                <FontAwesome5 name="check" size={18} color="#FFFFFF" />
              )}
            </View>
            <Text
              className="text-xs text-center"
              style={{ color: renkler.metin, fontWeight: seciliMi ? '700' : '500' }}
            >
              {paletItem.ad}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

/**
 * Gorunum Ayarlari Sayfasi
 */
export const GorünumAyarlariSayfasi: React.FC = () => {
  const renkler = useRenkler();

  // Giris animasyonu
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: renkler.arkaplan }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Tema Modu Bolumu */}
        <View className="mb-8">
          <Text
            className="text-xs font-bold tracking-wider mb-4"
            style={{ color: renkler.metinIkincil }}
          >
            TEMA MODU
          </Text>
          <TemaModuSecici />
        </View>

        {/* Renk Paleti Bolumu */}
        <View className="mb-8">
          <Text
            className="text-xs font-bold tracking-wider mb-4"
            style={{ color: renkler.metinIkincil }}
          >
            RENK PALETI
          </Text>
          <RenkPaletiSecici />
        </View>
      </Animated.View>
    </ScrollView>
  );
};
