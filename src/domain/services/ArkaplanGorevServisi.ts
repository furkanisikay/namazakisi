/**
 * Arka Plan Görev Servisi
 * 
 * Telefon yeniden başladığında veya uygulama öldürüldüğünde bile
 * bildirimlerin yeniden planlanmasını sağlar.
 * 
 * NOT: Bu servis development build gerektirir (Expo Go'da çalışmaz)
 */

import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArkaplanMuhafizServisi, ArkaplanMuhafizAyarlari } from './ArkaplanMuhafizServisi';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';

// Görev adı sabiti
export const BILDIRIM_YENILEME_GOREVI = 'BILDIRIM_YENILEME_GOREVI';

// Minimum aralık (dakika) - Android için minimum 15 dakika
const MINIMUM_ARALIK_DAKIKA = 15;

/** Konum ayarlari depolama anahtari */
const KONUM_DEPOLAMA_ANAHTARI = '@namaz_akisi/konum_ayarlari';

/**
 * Arka plan görevini tanımla
 * Bu kod modül seviyesinde çalışmalı (import edildiğinde)
 */
TaskManager.defineTask(BILDIRIM_YENILEME_GOREVI, async () => {
    console.log('[ArkaplanGorev] Görev tetiklendi');

    try {
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
