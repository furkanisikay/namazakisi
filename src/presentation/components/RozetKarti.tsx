/**
 * Rozet Karti
 * Tek bir rozeti gosterir - kazanilmis veya kilitli durumda
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { useRenkler } from '../../core/theme';
import { BOYUTLAR, ROZET_RENKLERI } from '../../core/constants/UygulamaSabitleri';
import { RozetDetay, RozetSeviyesi } from '../../core/types/SeriTipleri';

interface RozetKartiProps {
  rozet: RozetDetay;
  onPress?: () => void;
  kompakt?: boolean;
}

/**
 * Rozet seviyesine gore renk dondurur
 */
const seviyeRengiAl = (seviye: RozetSeviyesi): string => {
  switch (seviye) {
    case 'bronz':
      return ROZET_RENKLERI.BRONZ;
    case 'gumus':
      return ROZET_RENKLERI.GUMUS;
    case 'altin':
      return ROZET_RENKLERI.ALTIN;
    case 'elmas':
      return ROZET_RENKLERI.ELMAS;
    default:
      return ROZET_RENKLERI.BRONZ;
  }
};

/**
 * Rozet Karti Komponenti
 */
export const RozetKarti: React.FC<RozetKartiProps> = ({
  rozet,
  onPress,
  kompakt = false,
}) => {
  const renkler = useRenkler();
  
  // Parlama animasyonu (kazanilmis rozetler icin)
  const parlamaAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (rozet.kazanildiMi) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(parlamaAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(parlamaAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [rozet.kazanildiMi]);

  const seviyeRengi = seviyeRengiAl(rozet.seviye);

  if (kompakt) {
    // Kompakt mod - sadece ikon ve isim
    return (
      <TouchableOpacity
        style={[
          styles.kompaktContainer,
          {
            backgroundColor: rozet.kazanildiMi
              ? `${seviyeRengi}20`
              : renkler.kartArkaplan,
            borderColor: rozet.kazanildiMi ? seviyeRengi : renkler.sinir,
            opacity: rozet.kazanildiMi ? 1 : 0.5,
          },
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={[
          styles.kompaktIkon,
          { opacity: rozet.kazanildiMi ? 1 : 0.4 }
        ]}>
          {rozet.kazanildiMi ? rozet.ikon : '🔒'}
        </Text>
        <Text
          style={[
            styles.kompaktAd,
            { color: rozet.kazanildiMi ? seviyeRengi : renkler.metinIkincil },
          ]}
          numberOfLines={1}
        >
          {rozet.ad}
        </Text>
      </TouchableOpacity>
    );
  }

  // Normal mod - detayli kart
  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: rozet.kazanildiMi
            ? `${seviyeRengi}15`
            : renkler.kartArkaplan,
          borderColor: rozet.kazanildiMi ? seviyeRengi : renkler.sinir,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Parlama efekti */}
      {rozet.kazanildiMi && (
        <Animated.View
          style={[
            styles.parlamaEfekti,
            {
              backgroundColor: seviyeRengi,
              opacity: parlamaAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.1, 0.2],
              }),
            },
          ]}
        />
      )}

      {/* Ikon container */}
      <View
        style={[
          styles.ikonContainer,
          {
            backgroundColor: rozet.kazanildiMi
              ? `${seviyeRengi}30`
              : renkler.sinir,
            borderColor: rozet.kazanildiMi ? seviyeRengi : 'transparent',
          },
        ]}
      >
        <Text style={[
          styles.ikon,
          { opacity: rozet.kazanildiMi ? 1 : 0.3 }
        ]}>
          {rozet.kazanildiMi ? rozet.ikon : '🔒'}
        </Text>
      </View>

      {/* Bilgiler */}
      <View style={styles.bilgiContainer}>
        <View style={styles.baslikRow}>
          <Text
            style={[
              styles.ad,
              { color: rozet.kazanildiMi ? renkler.metin : renkler.metinIkincil },
            ]}
          >
            {rozet.ad}
          </Text>
          <View
            style={[
              styles.seviyeBadge,
              { backgroundColor: `${seviyeRengi}30` },
            ]}
          >
            <Text style={[styles.seviyeMetin, { color: seviyeRengi }]}>
              {rozet.seviye.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.aciklama,
            { color: rozet.kazanildiMi ? renkler.metinIkincil : renkler.sinir },
          ]}
          numberOfLines={2}
        >
          {rozet.kazanildiMi ? rozet.aciklama : rozet.kosulAciklamasi}
        </Text>

        {rozet.kazanildiMi && rozet.kazanilmaTarihi && (
          <Text style={[styles.tarih, { color: seviyeRengi }]}>
            {new Date(rozet.kazanilmaTarihi).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        )}
      </View>

      {/* Kilit ikonu - kazanilmamis rozetler icin */}
      {!rozet.kazanildiMi && (
        <View style={styles.kilitContainer}>
          <Text style={styles.kilitIkon}>🔐</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

/**
 * Mini Rozet - cok kucuk gosterim
 */
export const MiniRozet: React.FC<{
  rozet: RozetDetay;
  boyut?: number;
}> = ({ rozet, boyut = 36 }) => {
  const seviyeRengi = seviyeRengiAl(rozet.seviye);

  return (
    <View
      style={[
        styles.miniContainer,
        {
          width: boyut,
          height: boyut,
          borderRadius: boyut / 2,
          backgroundColor: rozet.kazanildiMi ? `${seviyeRengi}30` : '#E0E0E0',
          borderColor: rozet.kazanildiMi ? seviyeRengi : 'transparent',
          borderWidth: rozet.kazanildiMi ? 2 : 0,
        },
      ]}
    >
      <Text style={[styles.miniIkon, { fontSize: boyut * 0.5 }]}>
        {rozet.kazanildiMi ? rozet.ikon : '?'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: BOYUTLAR.PADDING_ORTA,
    borderRadius: BOYUTLAR.YUVARLATMA_BUYUK,
    borderWidth: 2,
    marginBottom: BOYUTLAR.MARGIN_ORTA,
    overflow: 'hidden',
  },
  parlamaEfekti: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  ikonContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginRight: BOYUTLAR.MARGIN_ORTA,
  },
  ikon: {
    fontSize: 28,
  },
  bilgiContainer: {
    flex: 1,
  },
  baslikRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  ad: {
    fontSize: BOYUTLAR.FONT_ORTA,
    fontWeight: 'bold',
    flex: 1,
  },
  seviyeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  seviyeMetin: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  aciklama: {
    fontSize: BOYUTLAR.FONT_KUCUK,
    lineHeight: 18,
  },
  tarih: {
    fontSize: BOYUTLAR.FONT_KUCUK,
    fontWeight: '600',
    marginTop: 4,
  },
  kilitContainer: {
    marginLeft: BOYUTLAR.MARGIN_KUCUK,
  },
  kilitIkon: {
    fontSize: 20,
    opacity: 0.5,
  },
  // Kompakt stil
  kompaktContainer: {
    alignItems: 'center',
    padding: BOYUTLAR.PADDING_ORTA,
    borderRadius: BOYUTLAR.YUVARLATMA_ORTA,
    borderWidth: 1,
    width: 80,
    marginRight: BOYUTLAR.MARGIN_KUCUK,
  },
  kompaktIkon: {
    fontSize: 32,
    marginBottom: 4,
  },
  kompaktAd: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Mini stil
  miniContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniIkon: {
    textAlign: 'center',
  },
});


