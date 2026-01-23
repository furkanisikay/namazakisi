/**
 * Hakkinda Sayfasi
 * Uygulama bilgileri ve versiyonu
 */

import * as React from 'react';
import { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Easing,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { useRenkler } from '../../core/theme';
import { UYGULAMA } from '../../core/constants/UygulamaSabitleri';

/**
 * Bilgi satiri bileseni
 */
interface BilgiSatiriProps {
  etiket: string;
  deger: string;
  onPress?: () => void;
}

const BilgiSatiri: React.FC<BilgiSatiriProps> = ({ etiket, deger, onPress }) => {
  const renkler = useRenkler();

  const icerik = (
    <View style={[styles.bilgiSatiri, { borderBottomColor: renkler.sinir }]}>
      <Text style={[styles.bilgiEtiket, { color: renkler.metinIkincil }]}>
        {etiket}
      </Text>
      <Text
        style={[
          styles.bilgiDeger,
          { color: onPress ? renkler.birincil : renkler.metin },
        ]}
      >
        {deger}
      </Text>
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
      style={[styles.container, { backgroundColor: renkler.arkaplan }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        {/* Logo ve Baslik */}
        <View style={[styles.headerKart, { backgroundColor: renkler.kartArkaplan }]}>
          <View style={[styles.logoContainer, { backgroundColor: renkler.birincil }]}>
            <Text style={styles.logoIkon}>🕌</Text>
          </View>
          <Text style={[styles.uygulamaAdi, { color: renkler.metin }]}>
            {UYGULAMA.ADI}
          </Text>
          <Text style={[styles.aciklama, { color: renkler.metinIkincil }]}>
            {UYGULAMA.ACIKLAMA}
          </Text>
        </View>

        {/* Uygulama Bilgileri */}
        <View style={styles.bolum}>
          <Text style={[styles.bolumBaslik, { color: renkler.metinIkincil }]}>
            UYGULAMA BİLGİLERİ
          </Text>

          <View style={[styles.bilgiKart, { backgroundColor: renkler.kartArkaplan }]}>
            <BilgiSatiri etiket="Versiyon" deger={UYGULAMA.VERSIYON} />
            <BilgiSatiri
              etiket="Geliştirici"
              deger="Furkan IŞIKAY"
              onPress={() => handleWebSitesiAc('https://furkanisikay.com.tr')}
            />
            <BilgiSatiri
              etiket="Github"
              deger="namazakisi"
              onPress={() => handleWebSitesiAc('https://github.com/furkanisikay/namazakisi')}
            />
          </View>
        </View>

        {/* Telif Hakkı */}
        <View style={styles.telifContainer}>
          <Text style={[styles.telifMetin, { color: renkler.metinIkincil }]}>
            © {guncelYil} Furkan IŞIKAY
          </Text>
          <Text style={[styles.telifMetin, { color: renkler.metinIkincil }]}>
            Tüm hakları saklıdır.
          </Text>
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
  // Header kart stilleri
  headerKart: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  logoIkon: {
    fontSize: 40,
  },
  uygulamaAdi: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  versiyon: {
    fontSize: 14,
    marginBottom: 12,
  },
  aciklama: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Bolum stilleri
  bolum: {
    marginBottom: 24,
  },
  bolumBaslik: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
  },
  // Bilgi kart stilleri
  bilgiKart: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  bilgiSatiri: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  bilgiEtiket: {
    fontSize: 14,
  },
  bilgiDeger: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Telif stilleri
  telifContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  telifMetin: {
    fontSize: 12,
    marginBottom: 2,
  },
});
