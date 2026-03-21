/**
 * Toparlanma Modu Karti
 * Seri bozuldugunda gosterilen kurtarma modu UI'i
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { useRenkler } from '../../core/theme';
import { BOYUTLAR, SERI_RENKLERI } from '../../core/constants/UygulamaSabitleri';
import { ToparlanmaDurumu } from '../../core/types/SeriTipleri';

interface ToparlanmaKartiProps {
  toparlanmaDurumu: ToparlanmaDurumu;
  oncekiSeri: number;
}

/**
 * Toparlanma Modu Karti Komponenti
 * Kullanicinin bozulan seriyi kurtarmasi icin motivasyon saglar
 */
export const ToparlanmaKarti: React.FC<ToparlanmaKartiProps> = ({
  toparlanmaDurumu,
  oncekiSeri,
}) => {
  const renkler = useRenkler();

  // Sadece ikon için hafif pulse
  const ikonPulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(ikonPulseAnim, { toValue: 1.12, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(ikonPulseAnim, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();
  }, []);

  // Progress daireleri
  const daireler = [];
  for (let i = 0; i < toparlanmaDurumu.hedefGunSayisi; i++) {
    const tamamlandi = i < toparlanmaDurumu.tamamlananGun;
    daireler.push(
      <View
        key={i}
        style={[
          styles.progressDaire,
          tamamlandi ? styles.progressDaireTamamlandi : styles.progressDaireBos,
        ]}
      >
        {tamamlandi && <Text style={styles.checkIcon}>✓</Text>}
      </View>
    );
  }

  const kalanGun = toparlanmaDurumu.hedefGunSayisi - toparlanmaDurumu.tamamlananGun;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: renkler.kartArkaplan,
          borderColor: SERI_RENKLERI.TOPARLANMA,
        },
      ]}
    >
      {/* Baslik */}
      <View style={styles.baslikContainer}>
        <Animated.Text style={[styles.uyariIkon, { transform: [{ scale: ikonPulseAnim }] }]}>⚠️</Animated.Text>
        <View style={styles.baslikMetinler}>
          <Text style={[styles.baslik, { color: SERI_RENKLERI.TOPARLANMA }]}>
            TOPARLANMA MODU
          </Text>
          <Text style={[styles.altBaslik, { color: renkler.metinIkincil }]}>
            Serin tehlikede!
          </Text>
        </View>
      </View>

      {/* Motivasyon mesaji */}
      <View style={styles.mesajContainer}>
        <Text style={[styles.mesaj, { color: renkler.metin }]}>
          <Text style={styles.vurgulu}>{oncekiSeri} günlük</Text> serini kurtarabilirsin!
        </Text>
      </View>

      {/* Progress gostergesi — sadece daireler */}
      <View style={styles.progressContainer}>
        <View style={styles.dairelerContainer}>
          {daireler}
        </View>
        <Text style={[styles.progressYazisi, { color: renkler.metinIkincil }]}>
          {toparlanmaDurumu.tamamlananGun}/{toparlanmaDurumu.hedefGunSayisi} gün tamamlandı
        </Text>
      </View>

      {/* Alt mesaj */}
      <View style={styles.altMesajContainer}>
        {kalanGun > 0 ? (
          <Text style={[styles.altMesaj, { color: SERI_RENKLERI.TOPARLANMA }]}>
            {kalanGun} gün daha tam kıl ve seriyi kurtar! 💪
          </Text>
        ) : (
          <Text style={[styles.altMesaj, { color: renkler.durum.basarili }]}>
            Bugün tam kılarak serini kurtar! 🎉
          </Text>
        )}
      </View>

      {/* Uyari notu */}
      <View style={[styles.uyariContainer, { backgroundColor: 'rgba(255,193,7,0.2)' }]}>
        <Text style={styles.uyariIkonKucuk}>⚡</Text>
        <Text style={[styles.uyariMetin, { color: renkler.metinIkincil }]}>
          Her gün tam kılmaya devam et — aradaki boşluk toparlanmayı sıfırlar.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BOYUTLAR.YUVARLATMA_BUYUK,
    padding: BOYUTLAR.PADDING_BUYUK,
    marginHorizontal: BOYUTLAR.MARGIN_ORTA,
    marginVertical: BOYUTLAR.MARGIN_KUCUK,
    borderWidth: 2,
    shadowColor: SERI_RENKLERI.TOPARLANMA,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  baslikContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: BOYUTLAR.MARGIN_ORTA,
  },
  uyariIkon: {
    fontSize: 32,
    marginRight: BOYUTLAR.MARGIN_ORTA,
  },
  baslikMetinler: {
    flex: 1,
  },
  baslik: {
    fontSize: BOYUTLAR.FONT_ORTA,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  altBaslik: {
    fontSize: BOYUTLAR.FONT_KUCUK,
    marginTop: 2,
  },
  mesajContainer: {
    alignItems: 'center',
    marginBottom: BOYUTLAR.MARGIN_BUYUK,
  },
  mesaj: {
    fontSize: BOYUTLAR.FONT_ORTA,
    textAlign: 'center',
  },
  vurgulu: {
    fontWeight: 'bold',
    color: SERI_RENKLERI.ATES,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: BOYUTLAR.MARGIN_ORTA,
  },
  dairelerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: BOYUTLAR.MARGIN_KUCUK,
  },
  progressDaire: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  progressDaireTamamlandi: {
    backgroundColor: SERI_RENKLERI.TOPARLANMA,
    borderColor: SERI_RENKLERI.TOPARLANMA,
  },
  progressDaireBos: {
    backgroundColor: 'transparent',
    borderColor: '#E0E0E0',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  progressYazisi: {
    fontSize: BOYUTLAR.FONT_NORMAL,
    marginTop: BOYUTLAR.MARGIN_KUCUK,
  },
  altMesajContainer: {
    alignItems: 'center',
    marginBottom: BOYUTLAR.MARGIN_ORTA,
  },
  altMesaj: {
    fontSize: BOYUTLAR.FONT_NORMAL,
    fontWeight: '600',
    textAlign: 'center',
  },
  uyariContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: BOYUTLAR.PADDING_ORTA,
    borderRadius: BOYUTLAR.YUVARLATMA_ORTA,
  },
  uyariIkonKucuk: {
    fontSize: 16,
    marginRight: 8,
  },
  uyariMetin: {
    flex: 1,
    fontSize: BOYUTLAR.FONT_KUCUK,
    lineHeight: 18,
  },
});
