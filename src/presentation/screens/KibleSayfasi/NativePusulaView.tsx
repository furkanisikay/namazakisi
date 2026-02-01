import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { FontAwesome5 } from '@expo/vector-icons';
import { useKible } from '../../hooks/useKible';
import { useRenkler } from '../../../core/theme';

const { width } = Dimensions.get('window');
const PUSULA_BOYUT = width * 0.75;

export const NativePusulaView = () => {
  const { kibleAcisi, pusulaYonelimi, yukleniyor, hata, izinVerildi } = useKible();
  const renkler = useRenkler();

  const donusDegeri = useSharedValue(0);

  useEffect(() => {
    // 360 derece geçişlerinde yumuşaklık sağlamak için mantık
    // Mevcut değer ile yeni değer arasındaki en kısa yolu bul
    const yeniDeger = -pusulaYonelimi;
    const mevcutDeger = donusDegeri.value;

    // Farkı -180 ile 180 arasına normalize et
    let fark = yeniDeger - mevcutDeger;
    while (fark < -180) fark += 360;
    while (fark > 180) fark -= 360;

    donusDegeri.value = withSpring(mevcutDeger + fark, {
      damping: 50,
      stiffness: 100,
    });
  }, [pusulaYonelimi, donusDegeri]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${donusDegeri.value}deg` }],
    };
  });

  if (yukleniyor) {
    return (
      <View style={[styles.container, { backgroundColor: renkler.arkaplan }]}>
        <Text style={{ color: renkler.metin }}>Pusula başlatılıyor...</Text>
      </View>
    );
  }

  if (hata) {
    return (
      <View style={[styles.container, { backgroundColor: renkler.arkaplan }]}>
        <Text style={{ color: renkler.hata, textAlign: 'center', marginBottom: 10 }}>{hata}</Text>
        {!izinVerildi && (
          <Text style={{ color: renkler.metinIkincil, textAlign: 'center' }}>
            Ayarlardan konum izni vermeniz gerekmektedir.
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: renkler.arkaplan }]}>
      <View style={styles.header}>
        <Text style={[styles.baslik, { color: renkler.metin }]}>Kıble Yönü</Text>
        <Text style={[styles.altBaslik, { color: renkler.metinIkincil }]}>
          Kabe Açısı: {Math.round(kibleAcisi)}°
        </Text>
      </View>

      <View style={styles.pusulaWrapper}>
        {/* Referans Oku (Telefonun Yönü) */}
        <View style={styles.referansOkuContainer}>
             <FontAwesome5 name="caret-up" size={40} color={renkler.birincil} />
        </View>

        {/* Dönen Kadran */}
        <Animated.View style={[
            styles.kadran,
            animatedStyle,
            {
              borderColor: renkler.sinir,
              backgroundColor: renkler.kartArkaplan,
              shadowColor: renkler.metin
            }
        ]}>
            {/* Yön İşaretleri */}
            <Text style={[styles.yonMetni, styles.kuzey, { color: 'red' }]}>N</Text>
            <Text style={[styles.yonMetni, styles.guney, { color: renkler.metin }]}>S</Text>
            <Text style={[styles.yonMetni, styles.dogu, { color: renkler.metin }]}>E</Text>
            <Text style={[styles.yonMetni, styles.bati, { color: renkler.metin }]}>W</Text>

            {/* Ara Çizgiler (Görsel Zenginlik) */}
            <View style={[styles.crossHair, { backgroundColor: renkler.sinir }]} />
            <View style={[styles.crossHair, { backgroundColor: renkler.sinir, transform: [{ rotate: '90deg' }] }]} />

            {/* Kabe Göstergesi */}
            {/* Kabe, kadranın içinde "kibleAcisi" kadar dönmüş bir container içinde durur */}
            {/* Bu container kadranla birlikte döner, ancak kendi içinde açısı sabittir */}
            <View style={[
                styles.kabeContainer,
                { transform: [{ rotate: `${kibleAcisi}deg` }] }
            ]}>
                <View style={styles.kabeIkonuWrapper}>
                     <FontAwesome5 name="kaaba" size={24} color={renkler.birincil} />
                     <View style={[styles.okCizgisi, { backgroundColor: renkler.birincil }]} />
                </View>
            </View>
        </Animated.View>
      </View>

      <Text style={[styles.bilgi, { color: renkler.metinIkincil }]}>
        Telefonunuzu düz bir zemine koyun ve kalibrasyon için 8 çizer gibi hareket ettirin.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  baslik: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  altBaslik: {
    fontSize: 16,
  },
  pusulaWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  referansOkuContainer: {
    position: 'absolute',
    top: -25,
    zIndex: 10,
  },
  kadran: {
    width: PUSULA_BOYUT,
    height: PUSULA_BOYUT,
    borderRadius: PUSULA_BOYUT / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  yonMetni: {
    position: 'absolute',
    fontWeight: 'bold',
    fontSize: 18,
  },
  kuzey: { top: 15 },
  guney: { bottom: 15 },
  dogu: { right: 15 },
  bati: { left: 15 },
  crossHair: {
    position: 'absolute',
    width: 1,
    height: '100%',
    opacity: 0.3,
  },
  kabeContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start', // Üstten başla (0 derece)
  },
  kabeIkonuWrapper: {
    alignItems: 'center',
    marginTop: 40, // Kenardan mesafe
  },
  okCizgisi: {
    width: 2,
    height: 10,
    marginTop: 2,
  },
  bilgi: {
    textAlign: 'center',
    fontSize: 12,
    maxWidth: '80%',
  }
});
