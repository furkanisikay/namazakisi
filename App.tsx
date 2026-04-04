/**
 * Namaz Akisi - React Native
 * Ana uygulama giris noktasi
 * Tema ve Feedback destekli
 */

import React, { useEffect } from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet, Text, AppState, AppStateStatus, Platform, InteractionManager } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import notifee, { EventType } from '@notifee/react-native';
import { Provider } from 'react-redux';
import { store } from './src/presentation/store/store';
import { AppNavigator } from './src/navigation/AppNavigator';
import ErrorBoundary from './src/presentation/components/common/ErrorBoundary';
import { TemaProvider, useTema, useRenkler } from './src/core/theme';
import { FeedbackProvider } from './src/core/feedback';
import { ArkaplanMuhafizServisi } from './src/domain/services/ArkaplanMuhafizServisi';
import { BildirimServisi, vakitAdiToNamazAdi } from './src/domain/services/BildirimServisi';
import { VakitSayacBildirimServisi } from './src/domain/services/VakitSayacBildirimServisi';
import { IftarSayacBildirimServisi } from './src/domain/services/IftarSayacBildirimServisi';
import { SahurSayacBildirimServisi } from './src/domain/services/SahurSayacBildirimServisi';
import { VakitBildirimYoneticiServisi } from './src/domain/services/VakitBildirimYoneticiServisi';
import { NamazVaktiHesaplayiciServisi } from './src/domain/services/NamazVaktiHesaplayiciServisi';
import { muhafizAyarlariniYukle } from './src/presentation/store/muhafizSlice';
import { vakitSayacAyarlariniYukle } from './src/presentation/store/vakitSayacSlice';
import { iftarSayacAyarlariniYukle } from './src/presentation/store/iftarSayacSlice';
import { sahurSayacAyarlariniYukle } from './src/presentation/store/sahurSayacSlice';
import { konumAyarlariniYukle, konumAyarlariniGuncelle } from './src/presentation/store/konumSlice';
import { namazlariYukle, namazDurumunuDegistir } from './src/presentation/store/namazSlice';
import { KonumTakipServisi } from './src/domain/services/KonumTakipServisi';
import { guncellemeKontrolEt } from './src/presentation/store/guncellemeSlice';
import { PlayStoreModulu } from './src/domain/services/PlayStoreGuncellemeModulu';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI } from './src/core/constants/UygulamaSabitleri';
import { Logger } from './src/core/utils/Logger';

// Bildirim aksiyonu callback'ini ayarla (domain → presentation koprusu)
// Kullanici bildirimden "Kildim" yaptiginda Redux store'u gunceller
try {
  BildirimServisi.getInstance().setOnKildimCallback((tarih, _namazAdi) => {
    try {
      const state = store.getState();
      // Sadece kullanici su an ayni tarihi goruntuluyorsa UI'yi guncelle
      // Farkli bir tarih goruntuluyorsa gereksiz veri yukleme ve tarih atlama riski onlenir
      if (state.namaz.mevcutTarih === tarih) {
        store.dispatch(namazlariYukle({ tarih }));
      }
    } catch {
      // Callback icindeki hatayi sessizce yut
    }
  });
} catch {
  // BildirimServisi başlatılamazsa uygulama çalışmaya devam etsin
}

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
 * Konum takibini yeniden baslat ve Redux state'ini senkronize et
 * Uygulama basladiginda ve on plana geldiginde cagrilir
 */
const konumTakibiniSenkronizeEt = async () => {
  try {
    const konumState = store.getState().konum;

    // Sadece GPS modunda ve akilli takip aktifse
    if (konumState.konumModu !== 'oto' || !konumState.akilliTakipAktif) {
      return;
    }

    const servis = KonumTakipServisi.getInstance();

    // Arka plandan guncellenmis konum verisini Redux'a senkronize et
    const sonKonum = await servis.sonKonumBilgisiniGetir();
    if (sonKonum && sonKonum.sonGpsGuncellemesi) {
      // Sadece arka planda daha yeni bir guncelleme varsa Redux'i guncelle
      if (sonKonum.sonGpsGuncellemesi !== konumState.sonGpsGuncellemesi) {
        store.dispatch(konumAyarlariniGuncelle({
          koordinatlar: sonKonum.koordinatlar,
          gpsAdres: sonKonum.gpsAdres,
          sonGpsGuncellemesi: sonKonum.sonGpsGuncellemesi,
        }));
        Logger.info('App', 'Konum state arka plan verisinden senkronize edildi');
      }
    }

    // Konum takibini yeniden baslat (OS tarafindan durdurulan gorevi canlandir)
    await servis.yenidenBaslat();
  } catch (error) {
    Logger.error('App', 'Konum takip senkronizasyon hatasi', error);
  }
};

/**
 * Arka plan muhafiz bildirimlerini planla
 * Bu fonksiyon uygulama basladiginda ve on plana geldiginde cagrilir
 * Mutex guard: Eşzamanlı çalışmayı önler. Timeout guard: Asili kalan async
 * operasyonlar (orn. izin dialogu) mutex'i sonsuza kilitlememesi icin 30s'de sifirlar.
 */
let planlamaDevamEdiyor = false;
const PLANLAMA_TIMEOUT_MS = 30_000;

const arkaplanMuhafiziBildirimleriniPlanla = async () => {
  if (planlamaDevamEdiyor) {
    return;
  }
  planlamaDevamEdiyor = true;

  const timeoutId = setTimeout(() => {
    if (planlamaDevamEdiyor) {
      Logger.warn('App', 'Bildirim planlama zaman asimina ugradi, mutex serbest birakiliyor');
      planlamaDevamEdiyor = false;
    }
  }, PLANLAMA_TIMEOUT_MS);

  try {
    // 1. Konum en basta yuklenmeli (muhafiz, vakit sayaci ve iftar sayaci konuma bagimli)
    await store.dispatch(konumAyarlariniYukle()).unwrap();
    const konumState = store.getState().konum;

    // Namaz hesaplayiciyi yapilandir (senkron, konum hazir olduktan sonra)
    if (konumState.koordinatlar.lat !== 0 && konumState.koordinatlar.lng !== 0) {
      NamazVaktiHesaplayiciServisi.getInstance().yapilandir({
        latitude: konumState.koordinatlar.lat,
        longitude: konumState.koordinatlar.lng,
      });
    }

    // 2. Servis ayarlarini ve bildirim iznini paralel yukle (birbirinden bagimsiz)
    // Bildirim izni yalnizca kurulum tamamlandiktan sonra istenir;
    // sihirbaz acikken OS dialog'u gostermemek icin bu kontrol gereklidir.
    const kurulumTamamlandi = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.ILK_KURULUM_TAMAMLANDI);
    await Promise.all([
      store.dispatch(muhafizAyarlariniYukle()).unwrap(),
      store.dispatch(vakitSayacAyarlariniYukle()),
      store.dispatch(iftarSayacAyarlariniYukle()),
      store.dispatch(sahurSayacAyarlariniYukle()),
      kurulumTamamlandi ? BildirimServisi.getInstance().izinIste() : Promise.resolve(),
    ]);

    const state = store.getState();
    const muhafizAyarlari = state.muhafiz;
    const sayacState = state.vakitSayac;
    const iftarState = state.iftarSayac;
    const sahurState = state.sahurSayac;

    // Sıklıklar için varsayılan değerler
    const sikliklar = muhafizAyarlari.sikliklar || { seviye1: 15, seviye2: 10, seviye3: 5, seviye4: 1 };

    // 3. Uc servisi paralel yapilandir (hepsi yuklenen konum verisini kullanir, birbirinden bagimsiz)
    await Promise.all([
      ArkaplanMuhafizServisi.getInstance().yapilandirVePlanla({
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
      }),
      konumState.koordinatlar.lat !== 0 && konumState.koordinatlar.lng !== 0
        ? VakitBildirimYoneticiServisi.getInstance().bildirimleriGuncelle()
        : Promise.resolve(),
      VakitSayacBildirimServisi.getInstance().yapilandirVePlanla({
        aktif: sayacState.ayarlar.aktif,
        koordinatlar: konumState.koordinatlar,
        baslangicEsikDk: muhafizAyarlari.esikler.seviye1,
      }),
      IftarSayacBildirimServisi.getInstance().yapilandirVePlanla({
        aktif: iftarState.ayarlar.aktif,
        koordinatlar: konumState.koordinatlar,
      }),
      SahurSayacBildirimServisi.getInstance().yapilandirVePlanla({
        aktif: sahurState.ayarlar.aktif,
        koordinatlar: konumState.koordinatlar,
      }),
    ]);

    Logger.info('App', 'Arka plan muhafiz, vakit bildirimleri ve sayac planlandi');
  } catch (error) {
    Logger.error('App', 'Arka plan muhafiz ayarlanamadi', error);
  } finally {
    clearTimeout(timeoutId);
    planlamaDevamEdiyor = false;
  }
};

/**
 * Uygulama icerik - Theme destekli
 */
const AppIcerik: React.FC = () => {
  const { yukleniyor, koyuMu } = useTema();
  const renkler = useRenkler();

  useEffect(() => {
    // Logger'i baslat; initialize tamamlanmadan once cagirilan Logger.info/error
    // cagrilari this.enabled = false olacagindan storage'a yazilmaz.
    // Bu nedenle arkaplanMuhafiziBildirimleriniPlanla initialize tamamlandiktan sonra baslatilir.
    Logger.initialize()
      .then(() => {
        Logger.info('App', 'Uygulama basladi');
        // Sadece yerel/misafir modu kullanildigi icin direkt giris yapmis sayiyoruz

        // Arkaplan muhafiz bildirimlerini planla (Logger hazir olduktan sonra)
        arkaplanMuhafiziBildirimleriniPlanla();
        // Arka planda birikmis eski muhafiz bildirimlerini temizle
        BildirimServisi.getInstance().sunulanEskiMuhafizBildirimleriniTemizle();
      })
      .catch(err => Logger.error('App', 'Logger baslatilamadi', err));

    // Kritik olmayan islemleri UI animasyonlari tamamlandiktan sonra calistir
    const interactionHandle = InteractionManager.runAfterInteractions(() => {
      // Konum takibini senkronize et ve yeniden baslat
      konumTakibiniSenkronizeEt();

      // Guncelleme kontrolu (sessiz, arka planda)
      store.dispatch(guncellemeKontrolEt(false));
    });

    // Uygulama on plana geldiginde bildirimleri yeniden planla ve konum takibini senkronize et
    const appStateListener = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Uygulama on plana geldi, bildirimleri yenile
        arkaplanMuhafiziBildirimleriniPlanla();
        // Arka planda birikmis eski muhafiz bildirimlerini temizle
        // (her vakit icin yalnizca en son bildirimi bildirim merkezinde tut)
        BildirimServisi.getInstance().sunulanEskiMuhafizBildirimleriniTemizle();
        // Konum takibini senkronize et ve yeniden baslat
        konumTakibiniSenkronizeEt();
        // Guncelleme kontrolu (onbellek gecerlilik surecine uyar)
        store.dispatch(guncellemeKontrolEt(false));
        // Play Store: arka planda indirilen bekleyen guncelleme var mi kontrol et
        if (Platform.OS === 'android') {
          PlayStoreModulu.indirilenGuncellemeVarMiKontrolEt();
        }
      }
    });

    // notifee foreground event handler (Android sayac icin)
    // Uygulama on plandayken "Kildim" aksiyonunu yakalar
    let notifeeUnsubscribe: (() => void) | undefined;
    if (Platform.OS === 'android') {
      notifeeUnsubscribe = notifee.onForegroundEvent(async ({ type, detail }) => {
        try {
          // Sayac asama gecisleri: onceki asama bildirimlerini iptal et
          if (type === EventType.DELIVERED) {
            const bildirimId = detail.notification?.id;
            if (bildirimId) {
              if (bildirimId.endsWith('_vakitgirdi')) {
                const baseId = bildirimId.replace('_vakitgirdi', '');
                await notifee.cancelNotification(baseId);
              } else if (bildirimId.endsWith('_bitis')) {
                const baseId = bildirimId.replace('_bitis', '');
                await notifee.cancelNotification(baseId);
                await notifee.cancelNotification(baseId + '_vakitgirdi');
              }
            }
          }

          if (type === EventType.ACTION_PRESS && detail.pressAction?.id === 'kildim') {
            const bildirimId = detail.notification?.id;
            if (bildirimId && bildirimId.startsWith('sayac_')) {
              // ID'den tarih ve vakit cikar
              const parts = bildirimId.replace('sayac_', '').split('_');
              const tarih = parts[0]; // "2026-02-15"
              const vakit = parts[1]; // "ogle"
              const namazAdi = vakitAdiToNamazAdi[vakit];

              if (namazAdi && tarih) {
                // Redux dispatch ile namaz isaretle
                store.dispatch(namazDurumunuDegistir({ tarih, namazAdi, tamamlandi: true }));
                Logger.info('App/notifee', `Namaz kıldım (foreground): ${namazAdi} (${tarih})`);

                // Sayac ve muhafiz bildirimlerini iptal et
                await VakitSayacBildirimServisi.getInstance().vakitSayaciniIptalEt(vakit as any);
                await ArkaplanMuhafizServisi.getInstance().vakitBildirimleriniIptalEt(vakit as any);
              }
            }
          }
        } catch (error) {
          Logger.error('App/notifee', 'Foreground event isleme hatasi', error);
        }
      });
    }

    return () => {
      appStateListener.remove();
      interactionHandle.cancel();
      if (notifeeUnsubscribe) {
        notifeeUnsubscribe();
      }
    };
  }, []);

  // Tema yuklenirken bekle
  if (yukleniyor) {
    return <YuklemeEkrani />;
  }

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={renkler.birincil}
        barStyle="light-content"
      />
      <ErrorBoundary name="AppRoot">
        <AppNavigator />
      </ErrorBoundary>
    </View>
  );
};

/**
 * Provider sarmalayici
 * Tema ve Feedback provider'larini icerir
 */
const ProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <TemaProvider>
      <FeedbackProvider>
        {children}
      </FeedbackProvider>
    </TemaProvider>
  );
};

/**
 * Ana uygulama komponenti
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Provider store={store}>
          <ProviderWrapper>
            <AppIcerik />
          </ProviderWrapper>
        </Provider>
      </View>
    </SafeAreaProvider>
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
