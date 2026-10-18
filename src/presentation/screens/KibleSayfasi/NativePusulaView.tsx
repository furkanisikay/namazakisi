import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { FontAwesome5 } from '@expo/vector-icons';
import { kalibrasyonIpucu, useKible } from '../../hooks/useKible';
import { useRenkler } from '../../../core/theme';
import { DurumSatiri } from '../../components/ortak/DurumSatiri';

/** Kible hizalama hassasiyet esigi (derece cinsinden) */
const KIBLE_HIZALAMA_ESIGI = 10;

/**
 * Native compass view component for Qibla direction.
 * Renders an animated compass dial that rotates based on device heading
 * and shows the Kaaba direction indicator.
 * @returns {React.JSX.Element} Animated compass view with Qibla indicator.
 */
export const NativePusulaView: React.FC<{ onHaritaModu?: () => void }> = ({ onHaritaModu }) => {
  const { kibleAcisi, pusulaYonelimi, hedefAcisi, yukleniyor, hata, izinVerildi, izinTekrarSorulabilir, pusulaDogrulugu, pusulaVar, izinIste } =
    useKible();
  const renkler = useRenkler();
  const { width } = useWindowDimensions();
  const PUSULA_BOYUT = width * 0.75;

  const donusDegeri = useSharedValue(0);

  useEffect(() => {
    // 360 derece gecislerinde yumusaklik saglamak icin mantik
    // Mevcut deger ile yeni deger arasindaki en kisa yolu bul
    const yeniDeger = -pusulaYonelimi;
    const mevcutDeger = donusDegeri.value;

    // Farki -180 ile 180 arasina normalize et
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
        <Text style={[styles.bilgiMetni, { color: renkler.metin }]}>Pusula başlatılıyor...</Text>
      </View>
    );
  }

  if (hata) {
    return (
      <View style={[styles.container, { backgroundColor: renkler.arkaplan }]}>
        {izinVerildi || izinTekrarSorulabilir === null ? (
          <Text style={[styles.hataMetni, { color: renkler.metin }]}>{hata}</Text>
        ) : null}
        {!izinVerildi && izinTekrarSorulabilir !== null && (
          // İzin akışı şablonu: sorulabiliyorsa açıklama → sistem diyaloğu (modal kapanınca)
          // → durum yeniden okunur; kalıcı redde Ayarlar. Dönüşte `useKible` kendiliğinden okur.
          <DurumSatiri
            testID="kible-izin-satiri"
            style={{ marginTop: 16, alignSelf: 'stretch' }}
            durum={{
              tip: 'uyari',
              metin: 'Konum izni kapalı; yönü bulmak için konumunuz gerekiyor.',
              eylem: izinTekrarSorulabilir ? 'konumIzni' : 'uygulamaAyarlari',
            }}
            onSonra={() => void izinIste()}
          />
        )}
      </View>
    );
  }

  // Manyetometre yok: pusula hiç dönmez — bunu söyle ve kamera (harita) moduna yönlendir.
  if (pusulaVar === false) {
    return (
      <View style={[styles.container, { backgroundColor: renkler.arkaplan }]}>
        <FontAwesome5 name="compass" size={32} color={renkler.metinIkincil} />
        <Text style={[styles.hataMetni, { color: renkler.metin, marginTop: 12 }]}>Bu telefonda pusula algılayıcısı yok.</Text>
        <Text style={[styles.bilgiMetni, { color: renkler.metinIkincil }]}>
          Kıble açısı {Math.round(kibleAcisi)}°. Kamera modunda yönü haritada da görebilirsiniz.
        </Text>
        {onHaritaModu && (
          <TouchableOpacity
            onPress={onHaritaModu}
            accessibilityRole="button"
            accessibilityLabel="Kamera moduna geçin"
            style={[styles.dugme, { backgroundColor: renkler.birincil }]}
          >
            <FontAwesome5 name="map" size={14} color={renkler.birincilMetin} style={{ marginRight: 8 }} />
            <Text style={[styles.dugmeMetni, { color: renkler.birincilMetin }]}>Kamera moduna geçin</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const ipucu = kalibrasyonIpucu(pusulaDogrulugu);

  // Kible hizalama gostergesi
  const hizalandiMi = hedefAcisi < KIBLE_HIZALAMA_ESIGI || hedefAcisi > (360 - KIBLE_HIZALAMA_ESIGI);

  return (
    <View style={[styles.container, { backgroundColor: renkler.arkaplan }]}>
      <View style={styles.header}>
        <Text style={[styles.baslik, { color: renkler.metin }]}>Kıble Yönü</Text>
        <Text style={[styles.altBaslik, { color: renkler.metinIkincil }]}>
          Kabe Açısı: {Math.round(kibleAcisi)}°
        </Text>
        {hizalandiMi && (
          <Text style={[styles.hizaMetni, { color: renkler.birincil }]}>
            ✓ Kıble yönündesiniz
          </Text>
        )}
      </View>

      <View style={styles.pusulaWrapper}>
        {/* Referans Oku (Telefonun Yonu) */}
        <View style={styles.referansOkuContainer}>
          <FontAwesome5 name="caret-up" size={40} color={renkler.birincil} />
        </View>

        {/* Donen Kadran */}
        <Animated.View style={[
          {
            width: PUSULA_BOYUT,
            height: PUSULA_BOYUT,
            borderRadius: PUSULA_BOYUT / 2,
          },
          styles.kadran,
          animatedStyle,
          {
            borderColor: renkler.sinir,
            backgroundColor: renkler.kartArkaplan,
            shadowColor: renkler.metin
          }
        ]}>
          {/* Yon Isaretleri */}
          <Text style={[styles.yonMetni, styles.kuzey, { color: renkler.hata }]}>K</Text>
          <Text style={[styles.yonMetni, styles.guney, { color: renkler.metin }]}>G</Text>
          <Text style={[styles.yonMetni, styles.dogu, { color: renkler.metin }]}>D</Text>
          <Text style={[styles.yonMetni, styles.bati, { color: renkler.metin }]}>B</Text>

          {/* Ara Cizgiler (Gorsel Zenginlik) */}
          <View style={[styles.crossHair, { backgroundColor: renkler.sinir }]} />
          <View style={[styles.crossHair, { backgroundColor: renkler.sinir, transform: [{ rotate: '90deg' }] }]} />

          {/* Kabe Gostergesi */}
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

      {/* Kalibrasyon ipucu pusula doğruluğuna bağlı: düşükse belirgin, iyiyse yok. */}
      {ipucu === 'belirgin' && (
        <View
          testID="kible-kalibrasyon-belirgin"
          accessible
          accessibilityLabel="Pusula doğruluğu düşük. Telefonunuzu havada 8 çizer gibi birkaç kez hareket ettirin."
          style={[styles.uyariKutusu, { borderLeftColor: renkler.dikkat, backgroundColor: renkler.kartArkaplan }]}
        >
          <FontAwesome5 name="sync-alt" size={14} color={renkler.dikkat} style={{ marginRight: 10 }} />
          <Text style={{ flex: 1, fontSize: 14, color: renkler.metin }}>
            Pusula doğruluğu düşük. Telefonunuzu havada 8 çizer gibi birkaç kez hareket ettirin.
          </Text>
        </View>
      )}
      {ipucu === 'sonuk' && (
        <Text style={[styles.bilgi, { color: renkler.metinIkincil }]}>
          Yön kayıyorsa telefonunuzu havada 8 çizer gibi hareket ettirin.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dugme: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginTop: 16,
  },
  dugmeMetni: { fontSize: 15, fontWeight: '700' },
  uyariKutusu: {
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 3,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 24,
    marginTop: 12,
  },
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
  hizaMetni: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  bilgiMetni: {
    textAlign: 'center',
    fontSize: 14,
  },
  hataMetni: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 10,
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
    justifyContent: 'flex-start',
  },
  kabeIkonuWrapper: {
    alignItems: 'center',
    marginTop: 40,
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
