/**
 * Namaz Akisi - React Native
 * Ana uygulama giris noktasi
 * Tema ve Feedback destekli
 */

import React, { useEffect } from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet, Text, AppState, AppStateStatus, Platform } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import { Provider } from 'react-redux';
import { store } from './src/presentation/store/store';
import { AppNavigator } from './src/navigation/AppNavigator';
import { misafirModunaGec } from './src/presentation/store/authSlice';
import { TemaProvider, useTema, useRenkler } from './src/core/theme';
import { FeedbackProvider } from './src/core/feedback';
import { ArkaplanMuhafizServisi } from './src/domain/services/ArkaplanMuhafizServisi';
import { BildirimServisi, vakitAdiToNamazAdi } from './src/domain/services/BildirimServisi';
import { VakitSayacBildirimServisi } from './src/domain/services/VakitSayacBildirimServisi';
import { IftarSayacBildirimServisi } from './src/domain/services/IftarSayacBildirimServisi';
import { SeriSayacBildirimServisi } from './src/domain/services/SeriSayacBildirimServisi';
import { VakitBildirimYoneticiServisi } from './src/domain/services/VakitBildirimYoneticiServisi';
import { NamazVaktiHesaplayiciServisi } from './src/domain/services/NamazVaktiHesaplayiciServisi';
import { muhafizAyarlariniYukle } from './src/presentation/store/muhafizSlice';
import { vakitSayacAyarlariniYukle } from './src/presentation/store/vakitSayacSlice';
import { iftarSayacAyarlariniYukle } from './src/presentation/store/iftarSayacSlice';
import { seriSayacAyarlariniYukle } from './src/presentation/store/seriSayacSlice';
import { konumAyarlariniYukle, konumAyarlariniGuncelle } from './src/presentation/store/konumSlice';
import { namazlariYukle, namazDurumunuDegistir } from './src/presentation/store/namazSlice';
import { KonumTakipServisi } from './src/domain/services/KonumTakipServisi';
import { GuncellemeBildirimi } from './src/presentation/components/guncelleme/GuncellemeBildirimi';
import { guncellemeKontrolEt } from './src/presentation/store/guncellemeSlice';

// Bildirim aksiyonu callback'ini ayarla (domain → presentation koprusu)
// Kullanici bildirimden "Kildim" yaptiginda Redux store'u gunceller
BildirimServisi.getInstance().setOnKildimCallback((tarih, _namazAdi) => {
  const state = store.getState();
  // Sadece kullanici su an ayni tarihi goruntuluyorsa UI'yi guncelle
  // Farkli bir tarih goruntuluyorsa gereksiz veri yukleme ve tarih atlama riski onlenir
  if (state.namaz.mevcutTarih === tarih) {
    store.dispatch(namazlariYukle({ tarih }));
  }
});

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
        console.log('[App] Konum state arka plan verisinden senkronize edildi');
      }
    }

    // Konum takibini yeniden baslat (OS tarafindan durdurulan gorevi canlandir)
    await servis.yenidenBaslat();
  } catch (error) {
    console.error('[App] Konum takip senkronizasyon hatasi:', error);
  }
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

    // Vakit sayaci bildirimlerini planla
    await store.dispatch(vakitSayacAyarlariniYukle());
    const sayacState = store.getState().vakitSayac;
    await VakitSayacBildirimServisi.getInstance().yapilandirVePlanla({
      aktif: sayacState.ayarlar.aktif,
      koordinatlar: konumState.koordinatlar,
      seviye2Esik: muhafizAyarlari.esikler.seviye2,
    });

    console.log('[App] Arka plan muhafiz, vakit bildirimleri ve sayaç planlandi');

    // İftar sayaci ayarlarini yukle ve bildirim planla
    await store.dispatch(iftarSayacAyarlariniYukle());
    const iftarState = store.getState().iftarSayac;
    await IftarSayacBildirimServisi.getInstance().yapilandirVePlanla({
      aktif: iftarState.ayarlar.aktif,
      koordinatlar: konumState.koordinatlar,
    });

    // Seri sayaci ayarlarini yukle ve bildirim planla (imsak geri sayim)
    await store.dispatch(seriSayacAyarlariniYukle());
    const seriSayacState = store.getState().seriSayac;
    await SeriSayacBildirimServisi.getInstance().yapilandirVePlanla({
      aktif: seriSayacState.ayarlar.aktif,
      koordinatlar: konumState.koordinatlar,
    });
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

    // Konum takibini senkronize et ve yeniden baslat
    konumTakibiniSenkronizeEt();

    // Guncelleme kontrolu (sessiz, arka planda)
    store.dispatch(guncellemeKontrolEt(false));

    // Uygulama on plana geldiginde bildirimleri yeniden planla ve konum takibini senkronize et
    const appStateListener = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Uygulama on plana geldi, bildirimleri yenile
        arkaplanMuhafiziBildirimleriniPlanla();
        // Konum takibini senkronize et ve yeniden baslat
        konumTakibiniSenkronizeEt();
        // Guncelleme kontrolu (onbellek gecerlilik surecine uyar)
        store.dispatch(guncellemeKontrolEt(false));
      }
    });

    // notifee foreground event handler (Android sayac icin)
    // Uygulama on plandayken "Kildim" aksiyonunu yakalar
    let notifeeUnsubscribe: (() => void) | undefined;
    if (Platform.OS === 'android') {
      notifeeUnsubscribe = notifee.onForegroundEvent(async ({ type, detail }) => {
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
            try {
              // ID'den tarih ve vakit cikar
              const parts = bildirimId.replace('sayac_', '').split('_');
              const tarih = parts[0]; // "2026-02-15"
              const vakit = parts[1]; // "ogle"
              const namazAdi = vakitAdiToNamazAdi[vakit];

              if (namazAdi && tarih) {
                // Redux dispatch ile namaz isaretle
                store.dispatch(namazDurumunuDegistir({ tarih, namazAdi, tamamlandi: true }));
                console.log(`[App/notifee] Namaz kıldım (foreground): ${namazAdi} (${tarih})`);

                // Sayac ve muhafiz bildirimlerini iptal et
                await VakitSayacBildirimServisi.getInstance().vakitSayaciniIptalEt(vakit as any);
                await ArkaplanMuhafizServisi.getInstance().vakitBildirimleriniIptalEt(vakit as any);
              }
            } catch (error) {
              console.error('[App/notifee] Kıldım işleme hatası:', error);
            }
          }
        }
      });
    }

    return () => {
      appStateListener.remove();
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
      <AppNavigator />
      <GuncellemeBildirimi />
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
