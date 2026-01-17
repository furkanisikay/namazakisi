/**
 * Seri Atesi Karti
 * Duolingo tarzi buyuk, dikkat cekici seri gosterge karti
 * Ana sayfada kullanilir
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
import { BOYUTLAR, SERI_RENKLERI } from '../../core/constants/UygulamaSabitleri';
import { SERI_HEDEFLERI, SeriHedefi } from '../../core/types/SeriTipleri';

interface SeriAtesiKartiProps {
  mevcutSeri: number;
  enUzunSeri: number;
  sonrakiHedef: SeriHedefi | null;
  hedefeKalanGun: number;
  onPress?: () => void;
}

/**
 * Seri Atesi Karti Komponenti
 * Duolingo'nun streak fire karti benzeri tasarim
 */
export const SeriAtesiKarti: React.FC<SeriAtesiKartiProps> = ({
  mevcutSeri,
  enUzunSeri,
  sonrakiHedef,
  hedefeKalanGun,
  onPress,
}) => {
  const renkler = useRenkler();

  // Ates animasyonu
  const atesAnim = useRef(new Animated.Value(1)).current;
  const parlamaAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Ates titreme animasyonu
    const atesTitreme = Animated.loop(
      Animated.sequence([
        Animated.timing(atesAnim, {
          toValue: 1.1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(atesAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Parlama animasyonu
    const parlama = Animated.loop(
      Animated.sequence([
        Animated.timing(parlamaAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(parlamaAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    if (mevcutSeri > 0) {
      atesTitreme.start();
      parlama.start();
    }

    return () => {
      atesTitreme.stop();
      parlama.stop();
    };
  }, [mevcutSeri]);

  // Hedef rozetleri
  const hedefRozetleri = SERI_HEDEFLERI.slice(0, 3); // Ilk 3 hedef

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: mevcutSeri > 0 ? SERI_RENKLERI.ATES : renkler.kartArkaplan,
          borderColor: mevcutSeri > 0 ? SERI_RENKLERI.ATES : renkler.sinir,
        },
      ]}
    >
      {/* Parlama efekti */}
      {mevcutSeri > 0 && (
        <Animated.View
          style={[
            styles.parlamaEfekti,
            {
              opacity: parlamaAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.1, 0.3],
              }),
            },
          ]}
        />
      )}

      {/* Ust kisim - Baslik ve Ates */}
      <View style={styles.ustKisim}>
        <View style={styles.baslikContainer}>
          <Text style={[
            styles.baslik,
            { color: mevcutSeri > 0 ? '#FFFFFF' : renkler.metin }
          ]}>
            {mevcutSeri > 0 ? 'SERİ ATEŞİN YANIYOR!' : 'SERİYİ BAŞLAT!'}
          </Text>
          {mevcutSeri > 0 && (
            <Text style={styles.enUzunSeri}>
              En uzun seri: {enUzunSeri} gün
            </Text>
          )}
        </View>

        {/* Ates ikonu */}
        <Animated.View
          style={[
            styles.atesContainer,
            {
              transform: [{ scale: atesAnim }],
            },
          ]}
        >
          <Text style={styles.atesIkon}>
            {mevcutSeri > 0 ? '🔥' : '❄️'}
          </Text>
        </Animated.View>
      </View>

      {/* Orta kisim - Buyuk sayi */}
      <View style={styles.ortaKisim}>
        <View style={styles.sayiContainer}>
          <Text style={[
            styles.buyukSayi,
            { color: mevcutSeri > 0 ? '#FFFFFF' : renkler.metinIkincil }
          ]}>
            {mevcutSeri}
          </Text>
          <Text style={[
            styles.gunYazisi,
            { color: mevcutSeri > 0 ? 'rgba(255,255,255,0.8)' : renkler.metinIkincil }
          ]}>
            GÜN
          </Text>
        </View>
      </View>

      {/* Alt kisim - Hedef rozetleri */}
      <View style={styles.altKisim}>
        <View style={styles.hedeflerContainer}>
          {hedefRozetleri.map((hedef) => {
            const tamamlandi = mevcutSeri >= hedef.gun;
            const aktif = sonrakiHedef?.gun === hedef.gun;

            return (
              <View
                key={hedef.gun}
                style={[
                  styles.hedefBadge,
                  tamamlandi && styles.hedefBadgeTamamlandi,
                  aktif && styles.hedefBadgeAktif,
                ]}
              >
                <Text style={styles.hedefIkon}>
                  {tamamlandi ? '🔓' : hedef.ikon}
                </Text>
                <Text style={[
                  styles.hedefGun,
                  { color: mevcutSeri > 0 ? '#FFFFFF' : renkler.metin }
                ]}>
                  {hedef.gun}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Sonraki hedef bilgisi */}
        {sonrakiHedef && (
          <Text style={[
            styles.sonrakiHedef,
            { color: mevcutSeri > 0 ? 'rgba(255,255,255,0.9)' : renkler.metinIkincil }
          ]}>
            Sonraki hedef: {sonrakiHedef.ad} ({hedefeKalanGun} gun kaldi)
          </Text>
        )}

        {!sonrakiHedef && mevcutSeri >= 90 && (
          <Text style={styles.efsaneYazisi}>
            Efsanevi bir seri! Devam et! 👑
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BOYUTLAR.YUVARLATMA_BUYUK,
    padding: BOYUTLAR.PADDING_BUYUK,
    marginHorizontal: BOYUTLAR.MARGIN_ORTA,
    marginVertical: BOYUTLAR.MARGIN_KUCUK,
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: SERI_RENKLERI.ATES,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  parlamaEfekti: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    backgroundColor: '#FFD700',
    borderRadius: 200,
  },
  ustKisim: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: BOYUTLAR.MARGIN_ORTA,
  },
  baslikContainer: {
    flex: 1,
  },
  baslik: {
    fontSize: BOYUTLAR.FONT_ORTA,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  enUzunSeri: {
    fontSize: BOYUTLAR.FONT_KUCUK,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  atesContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  atesIkon: {
    fontSize: 40,
  },
  ortaKisim: {
    alignItems: 'center',
    marginVertical: BOYUTLAR.MARGIN_ORTA,
  },
  sayiContainer: {
    alignItems: 'center',
  },
  buyukSayi: {
    fontSize: 72,
    fontWeight: 'bold',
    lineHeight: 80,
  },
  gunYazisi: {
    fontSize: BOYUTLAR.FONT_BUYUK,
    fontWeight: '600',
    letterSpacing: 4,
    marginTop: -8,
  },
  altKisim: {
    alignItems: 'center',
  },
  hedeflerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: BOYUTLAR.MARGIN_ORTA,
  },
  hedefBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  hedefBadgeTamamlandi: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderColor: '#FFD700',
  },
  hedefBadgeAktif: {
    borderColor: '#FFFFFF',
    borderWidth: 3,
  },
  hedefIkon: {
    fontSize: 20,
  },
  hedefGun: {
    fontSize: BOYUTLAR.FONT_KUCUK,
    fontWeight: 'bold',
    marginTop: 2,
  },
  sonrakiHedef: {
    fontSize: BOYUTLAR.FONT_NORMAL,
    textAlign: 'center',
  },
  efsaneYazisi: {
    fontSize: BOYUTLAR.FONT_ORTA,
    color: '#FFD700',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});


