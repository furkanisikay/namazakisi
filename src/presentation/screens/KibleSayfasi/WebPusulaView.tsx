import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRenkler } from '../../../core/theme';

/** Google Qibla Finder URL. */
const KIBLE_BULUCU_URL = 'https://qiblafinder.withgoogle.com/intl/tr/';

/**
 * WebView içinde gezinmeye izin verilen güvenilir host'ların listesi.
 * about:blank bazı sayfalar tarafından dahili olarak kullanılır, ona da izin verilir.
 */
const GUVENILIR_HOST_SONEKLERI = [
  'qiblafinder.withgoogle.com',
  '.google.com',
  '.gstatic.com',
  '.googleapis.com',
  '.googleusercontent.com',
] as const;

/**
 * Verilen URL'nin WebView içinde gezinmeye izin verilen güvenilir bir host'a
 * ait olup olmadığını kontrol eder.
 *
 * Kurallar:
 * - Yalnızca `https:` şemasına izin verilir (about:blank hariç).
 * - `about:blank` her zaman kabul edilir.
 * - Host; tam eşleşme veya `.domain` soneki kontrolüyle doğrulanır.
 * - URL parse edilemezse güvensiz kabul edilir → false döner.
 *
 * @param url Kontrol edilecek URL dizisi.
 * @returns Gezinmeye izin veriliyorsa `true`, aksi hâlde `false`.
 */
export function guvenilirKibleHostuMu(url: string): boolean {
  // about:blank dahili kullanım — güvenli kabul et
  if (url === 'about:blank') {
    return true;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    // Geçersiz URL → reddet
    return false;
  }

  // Yalnızca HTTPS'e izin ver
  if (parsedUrl.protocol !== 'https:') {
    return false;
  }

  const host = parsedUrl.hostname.toLowerCase();

  return GUVENILIR_HOST_SONEKLERI.some((sonek) => {
    if (sonek.startsWith('.')) {
      // ".google.com" → host tam olarak "google.com" veya "sub.google.com" olabilir
      return host === sonek.slice(1) || host.endsWith(sonek);
    }
    // "qiblafinder.withgoogle.com" → tam eşleşme
    return host === sonek;
  });
}

/**
 * WebView-based Qibla finder component.
 * Renders Google's AR Qibla Finder in a WebView with error handling
 * and retry functionality.
 * @returns {React.JSX.Element} WebView with Google Qibla Finder.
 */
export const WebPusulaView = () => {
  const renkler = useRenkler();
  const [hataOlustu, setHataOlustu] = useState(false);
  const [yenidenYukleKey, setYenidenYukleKey] = useState(0);

  if (hataOlustu) {
    return (
      <View style={[styles.container, styles.hataDurumu, { backgroundColor: renkler.arkaplan }]}>
        <FontAwesome5 name="exclamation-triangle" size={48} color={renkler.metinIkincil} />
        <Text style={[styles.hataBaslik, { color: renkler.metin }]}>
          Sayfa yüklenemedi
        </Text>
        <Text style={[styles.hataAciklama, { color: renkler.metinIkincil }]}>
          İnternet bağlantınızı kontrol edin veya tekrar deneyin.
        </Text>
        <TouchableOpacity
          style={[styles.tekrarDeneButon, { backgroundColor: renkler.birincil }]}
          onPress={() => {
            setHataOlustu(false);
            setYenidenYukleKey(prev => prev + 1);
          }}
          accessibilityLabel="Tekrar dene"
          accessibilityRole="button"
        >
          <Text style={styles.tekrarDeneMetin}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: renkler.arkaplan }]}>
      <WebView
        key={yenidenYukleKey}
        source={{ uri: KIBLE_BULUCU_URL }}
        style={styles.webview}
        geolocationEnabled={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        onError={() => setHataOlustu(true)}
        onHttpError={() => setHataOlustu(true)}
        renderLoading={() => (
          <View style={[styles.loadingContainer, { backgroundColor: renkler.arkaplan }]}>
            <ActivityIndicator size="large" color={renkler.birincil} />
          </View>
        )}
        onShouldStartLoadWithRequest={(istek) => {
          if (guvenilirKibleHostuMu(istek.url)) {
            return true;
          }
          // İzin verilmeyen URL'yi sistem tarayıcısında aç; kullanıcı deneyimi korunsun.
          Linking.openURL(istek.url).catch(() => {
            // Bağlantı açılamazsa sessizce yoksay; WebView'de gezinmeyi yine de engelle.
          });
          return false;
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  hataDurumu: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  hataBaslik: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  hataAciklama: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  tekrarDeneButon: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  tekrarDeneMetin: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
