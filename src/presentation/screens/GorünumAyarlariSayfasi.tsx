/**
 * Gorunum Ayarlari Sayfasi
 * Tema modu ve renk paleti secimi
 */

import * as React from 'react';
import { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { useRenkler, useTema, TemaModu } from '../../core/theme';
import { useFeedback } from '../../core/feedback';

/**
 * Tema modu secici bileseni
 */
const TemaModuSecici: React.FC = () => {
  const renkler = useRenkler();
  const { mod, moduDegistir } = useTema();
  const { butonTiklandiFeedback } = useFeedback();

  const modlar: { id: TemaModu; etiket: string; ikon: string; aciklama: string }[] = [
    { id: 'sistem', etiket: 'Sistem', ikon: '📱', aciklama: 'Sistem ayarlarına göre' },
    { id: 'acik', etiket: 'Açık', ikon: '☀️', aciklama: 'Her zaman açık tema' },
    { id: 'koyu', etiket: 'Koyu', ikon: '🌙', aciklama: 'Her zaman koyu tema' },
  ];

  const handleModSecimi = async (yeniMod: TemaModu) => {
    await butonTiklandiFeedback();
    moduDegistir(yeniMod);
  };

  return (
    <View style={styles.seciciContainer}>
      {modlar.map((modItem) => {
        const seciliMi = mod === modItem.id;
        return (
          <TouchableOpacity
            key={modItem.id}
            style={[
              styles.modKarti,
              {
                backgroundColor: seciliMi ? renkler.birincil : renkler.kartArkaplan,
                borderColor: seciliMi ? renkler.birincil : renkler.sinir,
              },
            ]}
            onPress={() => handleModSecimi(modItem.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.modIkon}>{modItem.ikon}</Text>
            <Text
              style={[
                styles.modEtiket,
                { color: seciliMi ? '#FFFFFF' : renkler.metin },
              ]}
            >
              {modItem.etiket}
            </Text>
            <Text
              style={[
                styles.modAciklama,
                { color: seciliMi ? 'rgba(255,255,255,0.8)' : renkler.metinIkincil },
              ]}
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
    <View style={styles.paletGrid}>
      {tumPaletler.map((paletItem) => {
        const seciliMi = palet.id === paletItem.id;
        return (
          <TouchableOpacity
            key={paletItem.id}
            style={[
              styles.paletKarti,
              {
                backgroundColor: renkler.kartArkaplan,
                borderColor: seciliMi ? paletItem.birincil : renkler.sinir,
                borderWidth: seciliMi ? 2 : 1,
              },
            ]}
            onPress={() => handlePaletSecimi(paletItem.id)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.paletRenk,
                { backgroundColor: paletItem.birincil },
              ]}
            >
              {seciliMi && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text
              style={[
                styles.paletAd,
                { color: renkler.metin, fontWeight: seciliMi ? '700' : '500' },
              ]}
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
      style={[styles.container, { backgroundColor: renkler.arkaplan }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Tema Modu Bolumu */}
        <View style={styles.bolum}>
          <Text style={[styles.bolumBaslik, { color: renkler.metinIkincil }]}>
            TEMA MODU
          </Text>
          <TemaModuSecici />
        </View>

        {/* Renk Paleti Bolumu */}
        <View style={styles.bolum}>
          <Text style={[styles.bolumBaslik, { color: renkler.metinIkincil }]}>
            RENK PALETİ
          </Text>
          <RenkPaletiSecici />
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  bolum: {
    marginBottom: 32,
  },
  bolumBaslik: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 16,
  },
  // Tema modu stilleri
  seciciContainer: {
    gap: 12,
  },
  modKarti: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  modIkon: {
    fontSize: 28,
    marginRight: 14,
  },
  modEtiket: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  modAciklama: {
    fontSize: 12,
  },
  // Renk paleti stilleri
  paletGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  paletKarti: {
    width: '30%',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  paletRenk: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  paletAd: {
    fontSize: 12,
    textAlign: 'center',
  },
});
