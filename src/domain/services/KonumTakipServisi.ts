/**
 * Konum Takip Servisi
 * Onemli konum degisikliklerini takip eder ve gunceller
 * Pil dostu: Sadece belirli mesafe degisikliklerinde tetiklenir
 */

import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArkaplanMuhafizServisi, ArkaplanMuhafizAyarlari } from './ArkaplanMuhafizServisi';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';

/** Arka plan konum gorevi adi */
export const KONUM_TAKIP_GOREVI = 'KONUM_TAKIP_GOREVI';

/** Depolama anahtari */
const KONUM_TAKIP_AYARLARI_ANAHTAR = '@namaz_akisi/konum_takip_ayarlari';
const KONUM_DEPOLAMA_ANAHTARI = '@namaz_akisi/konum_ayarlari';

/** Minimum mesafe degisikligi (metre) - 5km */
const MINIMUM_MESAFE_METRE = 5000;

/** Minimum zaman araligi (saniye) - 15 dakika */
const MINIMUM_ZAMAN_SANIYE = 900;

/**
 * Konum takip ayarlari
 */
export interface KonumTakipAyarlari {
    /** Konum takibi aktif mi */
    aktif: boolean;
    /** Son konum koordinatlari */
    sonKoordinatlar: { lat: number; lng: number } | null;
    /** Son guncelleme zamani */
    sonGuncellemeTarihi: string | null;
}

/**
 * Iki koordinat arasi mesafeyi hesapla (Haversine formulu)
 * @param lat1 Birinci enlem
 * @param lng1 Birinci boylam
 * @param lat2 Ikinci enlem
 * @param lng2 Ikinci boylam
 * @returns Mesafe (metre)
 */
function mesafeHesapla(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Dunya yaricapi (metre)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Arka plan konum gorevini tanimla
 */
TaskManager.defineTask(KONUM_TAKIP_GOREVI, async ({ data, error }: TaskManager.TaskManagerTaskBody<{ locations: Location.LocationObject[] }>) => {
    if (error) {
        console.error('[KonumTakip] Gorev hatasi:', error);
        return;
    }

    if (!data || !data.locations || data.locations.length === 0) {
        console.log('[KonumTakip] Konum verisi yok');
        return;
    }

    const yeniKonum = data.locations[0];
    const yeniLat = yeniKonum.coords.latitude;
    const yeniLng = yeniKonum.coords.longitude;

    console.log(`[KonumTakip] Yeni konum alindi: ${yeniLat.toFixed(4)}, ${yeniLng.toFixed(4)}`);

    try {
        // Mevcut konum ayarlarini al
        const konumAyarlariJson = await AsyncStorage.getItem(KONUM_DEPOLAMA_ANAHTARI);
        if (!konumAyarlariJson) {
            console.log('[KonumTakip] Konum ayarlari bulunamadi');
            return;
        }

        const konumAyarlari = JSON.parse(konumAyarlariJson);

        // GPS modu degilse cik
        if (konumAyarlari.konumModu !== 'oto') {
            console.log('[KonumTakip] GPS modu aktif degil');
            return;
        }

        // Son konum ile karsilastir
        const sonLat = konumAyarlari.koordinatlar?.lat;
        const sonLng = konumAyarlari.koordinatlar?.lng;

        if (sonLat && sonLng) {
            const mesafe = mesafeHesapla(sonLat, sonLng, yeniLat, yeniLng);
            console.log(`[KonumTakip] Mesafe degisimi: ${(mesafe / 1000).toFixed(2)} km`);

            // Mesafe yeterli degilse konum guncelleme yapma ama son kontrol zamanini guncelle
            if (mesafe < MINIMUM_MESAFE_METRE) {
                console.log('[KonumTakip] Mesafe esigi asilmadi, konum guncelleme atlanıyor');
                // Son kontrol zamanini guncelle (takibin aktif oldugunu gostermek icin)
                const guncelAyarlarZaman = {
                    ...konumAyarlari,
                    sonGpsGuncellemesi: new Date().toISOString(),
                };
                await AsyncStorage.setItem(KONUM_DEPOLAMA_ANAHTARI, JSON.stringify(guncelAyarlarZaman));
                return;
            }
        }

        // Reverse geocoding ile adres al
        let gpsAdres = null;
        try {
            const adresler = await Location.reverseGeocodeAsync({
                latitude: yeniLat,
                longitude: yeniLng,
            });
            if (adresler && adresler.length > 0) {
                const adres = adresler[0];
                gpsAdres = {
                    semt: '',
                    ilce: adres.district || adres.subregion || '',
                    il: adres.city || adres.region || '',
                };
            }
        } catch (geoError) {
            console.warn('[KonumTakip] Reverse geocoding hatasi:', geoError);
        }

        // Konum ayarlarini guncelle
        const guncelAyarlar = {
            ...konumAyarlari,
            koordinatlar: { lat: yeniLat, lng: yeniLng },
            gpsAdres: gpsAdres,
            sonGpsGuncellemesi: new Date().toISOString(),
        };

        await AsyncStorage.setItem(KONUM_DEPOLAMA_ANAHTARI, JSON.stringify(guncelAyarlar));
        console.log('[KonumTakip] Konum guncellendi');

        // =====================================================
        // ONEMLI: Bildirimleri yeni konuma gore yeniden planla
        // =====================================================
        try {
            const muhafizAyarlariJson = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI);
            if (muhafizAyarlariJson) {
                const muhafizAyarlari = JSON.parse(muhafizAyarlariJson);

                if (muhafizAyarlari.aktif) {
                    const varsayilanSikliklar = { seviye1: 15, seviye2: 10, seviye3: 5, seviye4: 1 };
                    const sikliklar = muhafizAyarlari.sikliklar || varsayilanSikliklar;

                    const arkaplanAyarlari: ArkaplanMuhafizAyarlari = {
                        aktif: muhafizAyarlari.aktif,
                        koordinatlar: { lat: yeniLat, lng: yeniLng }, // Yeni koordinatlar!
                        esikler: {
                            seviye1: muhafizAyarlari.esikler?.seviye1 || 45,
                            seviye1Siklik: sikliklar.seviye1 || 15,
                            seviye2: muhafizAyarlari.esikler?.seviye2 || 25,
                            seviye2Siklik: sikliklar.seviye2 || 10,
                            seviye3: muhafizAyarlari.esikler?.seviye3 || 10,
                            seviye3Siklik: sikliklar.seviye3 || 5,
                            seviye4: muhafizAyarlari.esikler?.seviye4 || 3,
                            seviye4Siklik: sikliklar.seviye4 || 1,
                        },
                    };

                    await ArkaplanMuhafizServisi.getInstance().yapilandirVePlanla(arkaplanAyarlari);
                    console.log('[KonumTakip] Bildirimler yeni konuma gore yeniden planlandi');
                }
            }
        } catch (bildirimHatasi) {
            console.error('[KonumTakip] Bildirim guncelleme hatasi:', bildirimHatasi);
        }

    } catch (e) {
        console.error('[KonumTakip] Islem hatasi:', e);
    }
});

/**
 * Konum Takip Servisi
 */
export class KonumTakipServisi {
    private static instance: KonumTakipServisi;

    private constructor() { }

    /**
     * Singleton instance
     */
    public static getInstance(): KonumTakipServisi {
        if (!KonumTakipServisi.instance) {
            KonumTakipServisi.instance = new KonumTakipServisi();
        }
        return KonumTakipServisi.instance;
    }

    /**
     * Konum takibini baslat
     * @returns true ise basarili, false ise izin reddedildi veya hata olustu
     */
    public async baslat(): Promise<boolean> {
        try {
            // 1. Once foreground izni kontrol et ve iste
            const { status: mevcutOnPlanIzni } = await Location.getForegroundPermissionsAsync();
            console.log('[KonumTakip] Mevcut on plan izni:', mevcutOnPlanIzni);

            if (mevcutOnPlanIzni !== 'granted') {
                const { status: onPlanIzni } = await Location.requestForegroundPermissionsAsync();
                if (onPlanIzni !== 'granted') {
                    console.log('[KonumTakip] On plan izni reddedildi');
                    return false;
                }
            }

            // 2. Arka plan izni kontrol et
            const { status: mevcutArkaPlanIzni, canAskAgain } = await Location.getBackgroundPermissionsAsync();
            console.log('[KonumTakip] Mevcut arka plan izni:', mevcutArkaPlanIzni, 'Tekrar sorulabilir:', canAskAgain);

            if (mevcutArkaPlanIzni !== 'granted') {
                // Android 11+ icin requestBackgroundPermissionsAsync() sistem ayarlarini acar
                // Bu noktada kullanici ayarlar sayfasina yonlendirilir
                console.log('[KonumTakip] Arka plan izni isteniyor (Android 11+ icin ayarlar sayfasi acilacak)...');
                const { status: arkaPlanIzni } = await Location.requestBackgroundPermissionsAsync();
                console.log('[KonumTakip] Arka plan izni sonucu:', arkaPlanIzni);

                if (arkaPlanIzni !== 'granted') {
                    console.log('[KonumTakip] Arka plan izni reddedildi veya beklemede');
                    return false;
                }
            }

            // 3. Gorev zaten kayitli ise durdur ve yeniden baslat
            // OS arka plan gorevini durdurmus olabilir, bu yuzden her zaman yeniden baslatiyoruz
            const kayitliMi = await TaskManager.isTaskRegisteredAsync(KONUM_TAKIP_GOREVI);
            if (kayitliMi) {
                console.log('[KonumTakip] Gorev zaten kayitli, yeniden baslatiliyor');
                try {
                    await Location.stopLocationUpdatesAsync(KONUM_TAKIP_GOREVI);
                } catch (stopError) {
                    console.warn('[KonumTakip] Mevcut gorev durdurulamadi:', stopError);
                }
            }

            // 4. Konum takibini baslat
            await Location.startLocationUpdatesAsync(KONUM_TAKIP_GOREVI, {
                accuracy: Location.Accuracy.Balanced, // Pil dostu
                timeInterval: MINIMUM_ZAMAN_SANIYE * 1000, // Minimum 15 dakika
                distanceInterval: MINIMUM_MESAFE_METRE, // Minimum 5km
                deferredUpdatesInterval: MINIMUM_ZAMAN_SANIYE * 1000,
                deferredUpdatesDistance: MINIMUM_MESAFE_METRE,
                showsBackgroundLocationIndicator: false,
                foregroundService: {
                    notificationTitle: 'Namaz Akışı',
                    notificationBody: 'Konum takibi aktif',
                    notificationColor: '#4A90D9',
                },
                pausesUpdatesAutomatically: false,
                activityType: Location.ActivityType.Other,
            });

            // 5. Ayarlari kaydet
            await this.ayarlariKaydet({ aktif: true, sonKoordinatlar: null, sonGuncellemeTarihi: null });

            console.log('[KonumTakip] Konum takibi baslatildi');
            return true;
        } catch (e) {
            console.error('[KonumTakip] Baslama hatasi:', e);
            return false;
        }
    }

    /**
     * Konum takibini durdur
     */
    public async durdur(): Promise<void> {
        try {
            const kayitliMi = await TaskManager.isTaskRegisteredAsync(KONUM_TAKIP_GOREVI);
            if (kayitliMi) {
                await Location.stopLocationUpdatesAsync(KONUM_TAKIP_GOREVI);
                console.log('[KonumTakip] Konum takibi durduruldu');
            }

            // Ayarlari guncelle
            const mevcutAyarlar = await this.ayarlariGetir();
            await this.ayarlariKaydet({ ...mevcutAyarlar, aktif: false });
        } catch (e) {
            console.error('[KonumTakip] Durdurma hatasi:', e);
        }
    }

    /**
     * Takip durumunu kontrol et
     */
    public async aktifMi(): Promise<boolean> {
        try {
            return await TaskManager.isTaskRegisteredAsync(KONUM_TAKIP_GOREVI);
        } catch {
            return false;
        }
    }

    /**
     * Arka plan konum izni var mi kontrol et
     */
    public async arkaPlanIzniVarMi(): Promise<boolean> {
        try {
            const { status } = await Location.getBackgroundPermissionsAsync();
            return status === 'granted';
        } catch {
            return false;
        }
    }

    /**
     * Ayarlari kaydet
     */
    private async ayarlariKaydet(ayarlar: KonumTakipAyarlari): Promise<void> {
        await AsyncStorage.setItem(KONUM_TAKIP_AYARLARI_ANAHTAR, JSON.stringify(ayarlar));
    }

    /**
     * Ayarlari getir
     */
    public async ayarlariGetir(): Promise<KonumTakipAyarlari> {
        try {
            const json = await AsyncStorage.getItem(KONUM_TAKIP_AYARLARI_ANAHTAR);
            if (json) {
                return JSON.parse(json);
            }
        } catch { }
        return { aktif: false, sonKoordinatlar: null, sonGuncellemeTarihi: null };
    }

    /**
     * Konum takibini yeniden baslat
     * Uygulama on plana geldiginde cagrilmali
     * OS tarafindan durdurulan gorevi yeniden canlandirir
     */
    public async yenidenBaslat(): Promise<boolean> {
        try {
            const ayarlar = await this.ayarlariGetir();
            if (!ayarlar.aktif) {
                console.log('[KonumTakip] Takip aktif degil, yeniden baslatma atlanıyor');
                return false;
            }

            const arkaPlanIzniVar = await this.arkaPlanIzniVarMi();
            if (!arkaPlanIzniVar) {
                console.log('[KonumTakip] Arka plan izni yok, yeniden baslatma atlanıyor');
                return false;
            }

            console.log('[KonumTakip] Konum takibi yeniden baslatiliyor...');
            return await this.baslat();
        } catch (e) {
            console.error('[KonumTakip] Yeniden baslatma hatasi:', e);
            return false;
        }
    }

    /**
     * Arka plandan guncellenen konum verisini AsyncStorage'dan okur
     * Uygulama on plana geldiginde Redux state'ini guncellemek icin kullanilir
     * @returns Guncel konum ayarlari veya null
     */
    public async sonKonumBilgisiniGetir(): Promise<{
        koordinatlar: { lat: number; lng: number };
        gpsAdres: { semt: string; ilce: string; il: string } | null;
        sonGpsGuncellemesi: string | null;
    } | null> {
        try {
            const konumAyarlariJson = await AsyncStorage.getItem(KONUM_DEPOLAMA_ANAHTARI);
            if (!konumAyarlariJson) return null;

            const konumAyarlari = JSON.parse(konumAyarlariJson);
            if (konumAyarlari.konumModu !== 'oto') return null;

            return {
                koordinatlar: konumAyarlari.koordinatlar,
                gpsAdres: konumAyarlari.gpsAdres,
                sonGpsGuncellemesi: konumAyarlari.sonGpsGuncellemesi,
            };
        } catch {
            return null;
        }
    }

    /**
     * Durum bilgisini getir
     */
    public async durumBilgisiGetir(): Promise<{
        takipAktif: boolean;
        arkaPlanIzniVar: boolean;
        minimumMesafe: number;
    }> {
        const takipAktif = await this.aktifMi();
        const arkaPlanIzniVar = await this.arkaPlanIzniVarMi();

        return {
            takipAktif,
            arkaPlanIzniVar,
            minimumMesafe: MINIMUM_MESAFE_METRE,
        };
    }
}
