/**
 * Namaz Akisi - React Native
 * Ana uygulama giris noktasi
 * Tema ve Feedback destekli
 */

import React, { useEffect } from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet, Text, AppState, AppStateStatus } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/presentation/store/store';
import { AppNavigator } from './src/navigation/AppNavigator';
import { misafirModunaGec } from './src/presentation/store/authSlice';
import { TemaProvider, useTema, useRenkler } from './src/core/theme';
import { FeedbackProvider } from './src/core/feedback';
import { ArkaplanMuhafizServisi } from './src/domain/services/ArkaplanMuhafizServisi';
import { BildirimServisi } from './src/domain/services/BildirimServisi';
import { VakitBildirimYoneticiServisi } from './src/domain/services/VakitBildirimYoneticiServisi';
import { NamazVaktiHesaplayiciServisi } from './src/domain/services/NamazVaktiHesaplayiciServisi';
import { muhafizAyarlariniYukle } from './src/presentation/store/muhafizSlice';
import { konumAyarlariniYukle } from './src/presentation/store/konumSlice';

/**
 * Yukleme ekrani
 */
const YuklemeEkrani: React.FC = () => {
  const renkler = useRenkler();

  return (
    <View style={[styles.yuklemeContainer, { backgroundColor: renkler.arkaplan }]}>
      <Text style={styles.yuklemeIkon}>🕌</Text>
      <ActivityIndicator size="large" color={renkler.birincil} />
      <Text style={[styles.yuklemeMetin, { color: renkler.metinIkincil }]}>
        Yukleniyor...
      </Text>
    </View>
  );
};

/**
 * Arka plan muhafiz bildirimlerini planla
 * Bu fonksiyon uygulama basladiginda ve on plana geldiginde cagrilir
 */
const arkaplanMuhafiziBildirimleriniPlanla = async () => {
  try {
    // Oncelikle konum ayarlarini yukle (koordinatlar muhafiz icin gerekli)
    await store.dispatch(konumAyarlariniYukle()).unwrap();

    // Muhafiz ayarlarini yukle
    const sonuc = await store.dispatch(muhafizAyarlariniYukle()).unwrap();
    const state = store.getState();
    const muhafizAyarlari = state.muhafiz;

    // Bildirim izinlerini iste
    await BildirimServisi.getInstance().izinIste();

    // Sıklıklar için varsayılan değerler
    const sikliklar = muhafizAyarlari.sikliklar || { seviye1: 15, seviye2: 10, seviye3: 5, seviye4: 1 };

    // Konum bilgisini al
    const konumState = state.konum;

    // Arka plan muhafizini yapilandir ve bildirimleri planla
    await ArkaplanMuhafizServisi.getInstance().yapilandirVePlanla({
      aktif: muhafizAyarlari.aktif,
      koordinatlar: konumState.koordinatlar,
      esikler: {
        seviye1: muhafizAyarlari.esikler.seviye1,
        seviye1Siklik: sikliklar.seviye1 || 15,
        seviye2: muhafizAyarlari.esikler.seviye2,
        seviye2Siklik: sikliklar.seviye2 || 10,
        seviye3: muhafizAyarlari.esikler.seviye3,
        seviye3Siklik: sikliklar.seviye3 || 5,
        seviye4: muhafizAyarlari.esikler.seviye4,
        seviye4Siklik: sikliklar.seviye4 || 1,
      },
    });

    // Namaz hesaplayiciyi yapilandir (Vakit bildirimleri icin gerekli)
    if (konumState.koordinatlar.lat !== 0 && konumState.koordinatlar.lng !== 0) {
      NamazVaktiHesaplayiciServisi.getInstance().yapilandir({
        latitude: konumState.koordinatlar.lat,
        longitude: konumState.koordinatlar.lng,
      });

      // Vakit bildirimlerini guncelle
      await VakitBildirimYoneticiServisi.getInstance().bildirimleriGuncelle();
    }

    console.log('[App] Arka plan muhafiz ve vakit bildirimleri planlandi');
  } catch (error) {
    console.error('[App] Arka plan muhafiz ayarlanamadi:', error);
  }
};

/**
 * Uygulama icerik - Theme destekli
 */
const AppIcerik: React.FC = () => {
  const { yukleniyor, koyuMu } = useTema();
  const renkler = useRenkler();

  useEffect(() => {
    // Sadece yerel/misafir modu kullanildigi icin direkt giris yapmis sayiyoruz
    // store.dispatch(misafirModunaGec()); // Initial state zaten misafir/local

    // Arkaplan muhafiz bildirimlerini planla
    arkaplanMuhafiziBildirimleriniPlanla();

    // Uygulama on plana geldiginde bildirimleri yeniden planla
    const appStateListener = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Uygulama on plana geldi, bildirimleri yenile
        arkaplanMuhafiziBildirimleriniPlanla();
      }
    });

    return () => {
      appStateListener.remove();
    };
  }, []);

  // Tema yuklenirken bekle
  if (yukleniyor) {
    return <YuklemeEkrani />;
  }

  return (
    <>
      <StatusBar
        backgroundColor={renkler.birincil}
        barStyle="light-content"
      />
      <AppNavigator />
    </>
  );
};

/**
 * Provider sarmalayici
 * Tema ve Feedback provider'larini icerir
 */
const ProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SafeAreaProvider>
      <TemaProvider>
        <FeedbackProvider>
          {children}
        </FeedbackProvider>
      </TemaProvider>
    </SafeAreaProvider>
  );
};

/**
 * Ana uygulama komponenti
 */
export default function App() {
  return (
    <View style={styles.container}>
      <Provider store={store}>
        <ProviderWrapper>
          <AppIcerik />
        </ProviderWrapper>
      </Provider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  yuklemeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yuklemeIkon: {
    fontSize: 72,
    marginBottom: 24,
  },
  yuklemeMetin: {
    marginTop: 16,
    fontSize: 16,
  },
});
