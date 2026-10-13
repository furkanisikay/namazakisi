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
import { VurguSaglayici } from '../components/ayar/VurguSaglayici';
import { useVurguKurulumu } from '../components/ayar/useVurguKurulumu';
import { AyarCapasi } from '../components/ayar/AyarCapasi';
import { Anahtar } from '../components/common/Anahtar';
import { kisaBildirimGoster } from '../components/common/KisaBildirim';
import { useSadeGorunum } from '../hooks/useSadeGorunum';

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
    { id: 'sistem', etiket: 'Sistem', aciklama: 'Sistem ayarlarına göre' },
    { id: 'acik', etiket: 'Açık', aciklama: 'Her zaman açık tema' },
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
            accessibilityRole="button"
            accessibilityState={{ selected: seciliMi }}
            accessibilityLabel={`${modItem.etiket}: ${modItem.aciklama}`}
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
            accessibilityRole="button"
            accessibilityState={{ selected: seciliMi }}
            accessibilityLabel={`${paletItem.ad} paleti`}
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
 * Sade görünüm anahtarı (issue #295). Açıkken ana ekranın yerine tek ekran çizilir:
 * şu anki vakit, kalan süre ve büyük bir "Kıldım" düğmesi.
 */
const SadeGorunumSecici: React.FC = () => {
  const renkler = useRenkler();
  const sade = useSadeGorunum();

  const degistir = (acik: boolean) => {
    sade.ayarla(acik);
    if (acik) kisaBildirimGoster('Ana sayfa artık sade görünümde');
  };

  return (
    <View
      className="p-4 rounded-2xl border"
      style={{ backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }}
    >
      <View className="flex-row items-center">
        <View
          className="w-11 h-11 rounded-full items-center justify-center mr-3.5"
          style={{ backgroundColor: `${renkler.birincil}20` }}
        >
          <FontAwesome5 name="eye" size={18} color={renkler.birincil} solid />
        </View>
        <Text className="text-base font-semibold flex-1" style={{ color: renkler.metin }}>
          Sade görünüm
        </Text>
        <Anahtar
          value={sade.ayarAcik}
          disabled={!sade.yuklendi}
          onValueChange={degistir}
          trackColor={{ false: renkler.sinir, true: `${renkler.birincil}60` }}
          thumbColor={sade.ayarAcik ? renkler.birincil : '#f4f3f4'}
          accessibilityLabel="Sade görünüm"
        />
      </View>
      <Text className="text-sm leading-5 mt-3" style={{ color: renkler.metinIkincil }}>
        Ana ekranda yalnız şu anki vakit, kalan süre ve büyük bir “Kıldım” düğmesi görünür.
        Yazılar büyüktür; vakte dokunduğunuzda sesli okunur. Ekranın altındaki “Tüm
        uygulamayı açın” bağlantısıyla diğer bölümlere geçebilirsiniz.
      </Text>
    </View>
  );
};

/**
 * Gorunum Ayarlari Sayfasi
 */
export const GorunumAyarlariSayfasi: React.FC = () => {
  return (
    <VurguSaglayici>
      <GorünumAyarlariIcerik />
    </VurguSaglayici>
  );
};

/**
 * İçerik bileşeni `VurguSaglayici` altında yaşar — `useVurguKurulumu()`
 * yalnızca sağlayıcı içinde çağrılabilir (bkz. task-4 entegrasyon örneği).
 */
const GorünumAyarlariIcerik: React.FC = () => {
  const renkler = useRenkler();
  const scrollRef = useVurguKurulumu();

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
      ref={scrollRef}
      className="flex-1"
      style={{ backgroundColor: renkler.arkaplan }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Sade Görünüm Bölümü (issue #295) */}
        <View className="mb-8">
          <Text
            className="text-xs font-bold tracking-wider mb-4"
            style={{ color: renkler.metinIkincil }}
          >
            SADE GÖRÜNÜM
          </Text>
          <AyarCapasi id="sadeGorunum">
            <SadeGorunumSecici />
          </AyarCapasi>
        </View>

        {/* Tema Modu Bolumu */}
        <View className="mb-8">
          <Text
            className="text-xs font-bold tracking-wider mb-4"
            style={{ color: renkler.metinIkincil }}
          >
            TEMA MODU
          </Text>
          <AyarCapasi id="tema">
            <TemaModuSecici />
          </AyarCapasi>
        </View>

        {/* Renk Paleti Bolumu */}
        <View className="mb-8">
          <Text
            className="text-xs font-bold tracking-wider mb-4"
            style={{ color: renkler.metinIkincil }}
          >
            RENK PALETI
          </Text>
          <AyarCapasi id="palet">
            <RenkPaletiSecici />
          </AyarCapasi>
        </View>
      </Animated.View>
    </ScrollView>
  );
};
