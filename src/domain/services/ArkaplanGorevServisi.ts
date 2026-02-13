/**
 * Arka Plan Görev Servisi
 *
 * Telefon yeniden başladığında veya uygulama öldürüldüğünde bile
 * bildirimlerin yeniden planlanmasını ve konum takibinin
 * yeniden başlatılmasını sağlar.
 *
 * NOT: Bu servis development build gerektirir (Expo Go'da çalışmaz)
 */

import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArkaplanMuhafizServisi, ArkaplanMuhafizAyarlari } from './ArkaplanMuhafizServisi';
import {
    DEPOLAMA_ANAHTARLARI,
    TAKIP_PROFILLERI,
    VARSAYILAN_TAKIP_HASSASIYETI,
    TakipHassasiyeti,
} from '../../core/constants/UygulamaSabitleri';
import { KONUM_TAKIP_GOREVI } from './KonumTakipServisi';

// Görev adı sabiti
export const BILDIRIM_YENILEME_GOREVI = 'BILDIRIM_YENILEME_GOREVI';

// Minimum aralık (dakika) - Android için minimum 15 dakika
const MINIMUM_ARALIK_DAKIKA = 15;

/** Konum ayarlari depolama anahtari */
const KONUM_DEPOLAMA_ANAHTARI = '@namaz_akisi/konum_ayarlari';

/** Konum takip ayarlari depolama anahtari */
const KONUM_TAKIP_AYARLARI_ANAHTAR = '@namaz_akisi/konum_takip_ayarlari';

/**
 * Aktif takip profilini AsyncStorage'dan okur
 * ArkaplanGorevServisi icin - gorev canlandirirken profil bilgisi gerekir
 */
async function aktifProfilGetir(): Promise<{ mesafe: number; zaman: number; dogruluk: number; duraklatma: boolean }> {
    try {
        const konumJson = await AsyncStorage.getItem(KONUM_DEPOLAMA_ANAHTARI);
        if (konumJson) {
            const konum = JSON.parse(konumJson);
            const hassasiyet: TakipHassasiyeti = konum.takipHassasiyeti || VARSAYILAN_TAKIP_HASSASIYETI;
            return TAKIP_PROFILLERI[hassasiyet] || TAKIP_PROFILLERI[VARSAYILAN_TAKIP_HASSASIYETI];
        }
    } catch { }
    return TAKIP_PROFILLERI[VARSAYILAN_TAKIP_HASSASIYETI];
}

/**
 * Arka plandan konum takibini yeniden baslat
 * Bu fonksiyon arka plan gorevinden (background fetch) cagrilir
 * Uygulama kapaliyken veya telefon yeniden basladiginda konum takibini canlandirir
 *
 * Senaryo akisi:
 * 1. Kullanici daha once akilli takibi actiysa → aktif: true AsyncStorage'da kalir
 * 2. Telefon reboot / app kill / OS tarafindan olduruld → konum gorevi olur
 * 3. Background fetch 15dk'da bir tetiklenir (startOnBoot + stopOnTerminate:false)
 * 4. Bu fonksiyon konum gorevinin olup olmedigini kontrol eder
 * 5. Olmemisse → dokunmaz. Olmüsse → yeniden baslatir.
 * 6. Izin iptal edildiyse → graceful deactivation yapar
 */
export async function arkaplandanKonumTakibiniYenidenBaslat(): Promise<void> {
    try {
        // 1. Konum takip ayarlarini kontrol et - kullanici daha once aktif etmis mi?
        const takipAyarlariJson = await AsyncStorage.getItem(KONUM_TAKIP_AYARLARI_ANAHTAR);
        if (!takipAyarlariJson) {
            return; // Kullanici hic aktif etmemis
        }

        const takipAyarlari = JSON.parse(takipAyarlariJson);
        if (!takipAyarlari.aktif) {
            return; // Kullanici kapattiysa dokunma
        }

        // 2. Konum modu GPS mi kontrol et
        const konumAyarlariJson = await AsyncStorage.getItem(KONUM_DEPOLAMA_ANAHTARI);
        if (konumAyarlariJson) {
            const konumAyarlari = JSON.parse(konumAyarlariJson);
            if (konumAyarlari.konumModu !== 'oto') {
                return; // Manuel modda konum takibine gerek yok
            }
        }

        // 3. Arka plan izni hala var mi kontrol et (kullanici ayarlardan iptal etmis olabilir)
        const { status: arkaPlanIzni } = await Location.getBackgroundPermissionsAsync();
        if (arkaPlanIzni !== 'granted') {
            console.log('[ArkaplanGorev] Arka plan konum izni iptal edilmis, takip devre disi birakiliyor');
            // Izin iptal edilmis - ayarlari guncelle ki tekrar tekrar denemesin
            await AsyncStorage.setItem(KONUM_TAKIP_AYARLARI_ANAHTAR, JSON.stringify({
                ...takipAyarlari,
                aktif: false,
            }));
            return;
        }

        // 4. Foreground izni hala var mi kontrol et
        const { status: onPlanIzni } = await Location.getForegroundPermissionsAsync();
        if (onPlanIzni !== 'granted') {
            console.log('[ArkaplanGorev] On plan konum izni iptal edilmis, takip devre disi birakiliyor');
            await AsyncStorage.setItem(KONUM_TAKIP_AYARLARI_ANAHTAR, JSON.stringify({
                ...takipAyarlari,
                aktif: false,
            }));
            return;
        }

        // 5. Gorev hala kayitli mi kontrol et
        const kayitliMi = await TaskManager.isTaskRegisteredAsync(KONUM_TAKIP_GOREVI);
        if (kayitliMi) {
            console.log('[ArkaplanGorev] Konum takip gorevi zaten kayitli ve calisiyor');
            return; // Gorev hala calisiyor, dokunma
        }

        // 6. KRITIK: Gorev kayitli degil ama aktif olmasi gerekiyor - yeniden baslat!
        // Bu durum genellikle su senaryolarda olusur:
        // - Telefon yeniden basladi
        // - OS uygulamayi pil icin oldurdu
        // - Kullanici uygulamayi swipe ile kapatti
        console.log('[ArkaplanGorev] Konum takip gorevi ölmüş, yeniden başlatılıyor...');
        const profil = await aktifProfilGetir();
        await Location.startLocationUpdatesAsync(KONUM_TAKIP_GOREVI, {
            accuracy: profil.dogruluk,
            timeInterval: profil.zaman * 1000,
            distanceInterval: profil.mesafe,
            deferredUpdatesInterval: profil.zaman * 1000,
            deferredUpdatesDistance: profil.mesafe,
            showsBackgroundLocationIndicator: false,
            foregroundService: {
                notificationTitle: 'Namaz Akışı',
                notificationBody: 'Sehir degisikligini takip ediyor',
                notificationColor: '#4A90D9',
            },
            pausesUpdatesAutomatically: profil.duraklatma,
            activityType: Location.ActivityType.Other,
        });

        console.log('[ArkaplanGorev] Konum takip gorevi yeniden baslatildi');
    } catch (error) {
        console.error('[ArkaplanGorev] Konum takip yeniden baslatma hatasi:', error);
    }
}

/**
 * Arka plan görevini tanımla
 * Bu kod modül seviyesinde çalışmalı (import edildiğinde)
 *
 * Her 15 dakikada bir tetiklenir ve su islemleri yapar:
 * 1. Konum takibini canlandirir (olmusse)
 * 2. Bildirimleri yeniden planlar
 */
TaskManager.defineTask(BILDIRIM_YENILEME_GOREVI, async () => {
    console.log('[ArkaplanGorev] Görev tetiklendi');

    try {
        // =====================================================
        // ADIM 1: KONUM TAKIBINI CANLANDIR
        // Telefon reboot, app kill, OS kill senaryolarini ele al
        // =====================================================
        await arkaplandanKonumTakibiniYenidenBaslat();

        // =====================================================
        // ADIM 2: BILDIRIMLERI YENIDEN PLANLA
        // =====================================================

        // Muhafız ayarlarını AsyncStorage'dan al
        const ayarlarJson = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI);

        if (!ayarlarJson) {
            console.log('[ArkaplanGorev] Muhafiz ayarlari bulunamadi');
            return BackgroundFetch.BackgroundFetchResult.NoData;
        }

        const ayarlar = JSON.parse(ayarlarJson);

        // Muhafız aktif değilse işlem yapma
        if (!ayarlar.aktif) {
            console.log('[ArkaplanGorev] Muhafız devre dışı');
            return BackgroundFetch.BackgroundFetchResult.NoData;
        }

        // Konum ayarlarini al (ayri slice'tan)
        const konumAyarlariJson = await AsyncStorage.getItem(KONUM_DEPOLAMA_ANAHTARI);
        let koordinatlar = { lat: 41.0082, lng: 28.9784 }; // Varsayilan: Istanbul

        if (konumAyarlariJson) {
            const konumAyarlari = JSON.parse(konumAyarlariJson);
            if (konumAyarlari.koordinatlar) {
                koordinatlar = konumAyarlari.koordinatlar;
            }
        } else if (ayarlar.koordinatlar) {
            // Geriye uyumluluk: Eski veride koordinatlar muhafiz ayarlarinda olabilir
            koordinatlar = ayarlar.koordinatlar;
        }

        // Bildirimleri yeniden planla
        const varsayilanSikliklar = { seviye1: 15, seviye2: 10, seviye3: 5, seviye4: 1 };
        const sikliklar = ayarlar.sikliklar || varsayilanSikliklar;

        const muhafizAyarlari: ArkaplanMuhafizAyarlari = {
            aktif: ayarlar.aktif,
            koordinatlar: koordinatlar,
            esikler: {
                seviye1: ayarlar.esikler?.seviye1 || 45,
                seviye1Siklik: sikliklar.seviye1 || 15,
                seviye2: ayarlar.esikler?.seviye2 || 25,
                seviye2Siklik: sikliklar.seviye2 || 10,
                seviye3: ayarlar.esikler?.seviye3 || 10,
                seviye3Siklik: sikliklar.seviye3 || 5,
                seviye4: ayarlar.esikler?.seviye4 || 3,
                seviye4Siklik: sikliklar.seviye4 || 1,
            },
        };

        await ArkaplanMuhafizServisi.getInstance().yapilandirVePlanla(muhafizAyarlari);

        console.log('[ArkaplanGorev] Bildirimler yeniden planlandi (koordinat:', koordinatlar.lat.toFixed(2), ',', koordinatlar.lng.toFixed(2), ')');
        return BackgroundFetch.BackgroundFetchResult.NewData;

    } catch (error) {
        console.error('[ArkaplanGorev] Hata:', error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});

/**
 * Arka plan görev servisini yöneten sınıf
 */
export class ArkaplanGorevServisi {
    private static instance: ArkaplanGorevServisi;
    private kayitli = false;

    private constructor() { }

    public static getInstance(): ArkaplanGorevServisi {
        if (!ArkaplanGorevServisi.instance) {
            ArkaplanGorevServisi.instance = new ArkaplanGorevServisi();
        }
        return ArkaplanGorevServisi.instance;
    }

    /**
     * Arka plan görevini kaydet ve başlat
     */
    public async kaydetVeBaslat(): Promise<boolean> {
        try {
            // Görevin zaten kayıtlı olup olmadığını kontrol et
            const kayitliMi = await TaskManager.isTaskRegisteredAsync(BILDIRIM_YENILEME_GOREVI);

            if (kayitliMi) {
                console.log('[ArkaplanGorev] Görev zaten kayıtlı');
                this.kayitli = true;
                return true;
            }

            // Background fetch'i kaydet
            await BackgroundFetch.registerTaskAsync(BILDIRIM_YENILEME_GOREVI, {
                minimumInterval: MINIMUM_ARALIK_DAKIKA * 60, // saniye cinsinden
                stopOnTerminate: false, // Uygulama kapatılsa bile çalışsın
                startOnBoot: true, // Telefon açılışında başlasın
            });

            this.kayitli = true;
            console.log('[ArkaplanGorev] Görev başarıyla kaydedildi');
            return true;

        } catch (error) {
            console.error('[ArkaplanGorev] Kayıt hatası:', error);
            return false;
        }
    }

    /**
     * Arka plan görevini durdur
     */
    public async durdur(): Promise<void> {
        try {
            const kayitliMi = await TaskManager.isTaskRegisteredAsync(BILDIRIM_YENILEME_GOREVI);

            if (kayitliMi) {
                await BackgroundFetch.unregisterTaskAsync(BILDIRIM_YENILEME_GOREVI);
                console.log('[ArkaplanGorev] Görev durduruldu');
            }

            this.kayitli = false;
        } catch (error) {
            console.error('[ArkaplanGorev] Durdurma hatası:', error);
        }
    }

    /**
     * Görev durumunu kontrol et
     */
    public async durumKontrol(): Promise<{
        kayitli: boolean;
        status: BackgroundFetch.BackgroundFetchStatus | null;
    }> {
        const kayitli = await TaskManager.isTaskRegisteredAsync(BILDIRIM_YENILEME_GOREVI);
        const status = await BackgroundFetch.getStatusAsync();

        return { kayitli, status };
    }

    /**
     * Background fetch durumunu insan okunabilir stringe çevir
     */
    public static durumAciklamasi(status: BackgroundFetch.BackgroundFetchStatus): string {
        switch (status) {
            case BackgroundFetch.BackgroundFetchStatus.Restricted:
                return 'Kısıtlı - Sistem tarafından engelleniyor';
            case BackgroundFetch.BackgroundFetchStatus.Denied:
                return 'Reddedildi - Kullanıcı izin vermedi';
            case BackgroundFetch.BackgroundFetchStatus.Available:
                return 'Kullanılabilir';
            default:
                return 'Bilinmiyor';
        }
    }
}
