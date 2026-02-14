/**
 * Konum Takip Servisi
 * Onemli konum degisikliklerini takip eder ve gunceller
 * Pil dostu: Sadece belirli mesafe degisikliklerinde tetiklenir
 *
 * NOT: Bu servis domain katmaninda olmasina ragmen React Native API'lerine (AppState, Platform)
 * dogrudan bagli calisir. Bu, Clean Architecture'in Dependency Rule'unu teknik olarak ihlal eder,
 * ancak React Native projeleri icin pragmatik bir trade-off'tur. Alternatif olarak bu bagimliliklar
 * dependency injection ile soyutlanabilir, fakat bu projede mevcut pattern ile tutarlilik icin
 * dogrudan kullanim tercih edilmistir.
 */

import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Platform } from 'react-native';
import { ArkaplanMuhafizServisi, ArkaplanMuhafizAyarlari } from './ArkaplanMuhafizServisi';
import {
    DEPOLAMA_ANAHTARLARI,
    TAKIP_PROFILLERI,
    VARSAYILAN_TAKIP_HASSASIYETI,
    TakipHassasiyeti,
    TakipProfilKonfigurasyonu,
} from '../../core/constants/UygulamaSabitleri';

/** Arka plan konum gorevi adi */
export const KONUM_TAKIP_GOREVI = 'KONUM_TAKIP_GOREVI';

/** Depolama anahtari */
const KONUM_TAKIP_AYARLARI_ANAHTAR = '@namaz_akisi/konum_takip_ayarlari';
const KONUM_DEPOLAMA_ANAHTARI = '@namaz_akisi/konum_ayarlari';

/**
 * Aktif takip profilini AsyncStorage'dan okur
 * Arka plan gorevi ve servis tarafindan kullanilir
 */
async function aktifProfilGetir(): Promise<TakipProfilKonfigurasyonu> {
    try {
        const konumJson = await AsyncStorage.getItem(KONUM_DEPOLAMA_ANAHTARI);
        if (konumJson) {
            const konum = JSON.parse(konumJson);
            const hassasiyet: TakipHassasiyeti = konum.takipHassasiyeti || VARSAYILAN_TAKIP_HASSASIYETI;
            return TAKIP_PROFILLERI[hassasiyet] || TAKIP_PROFILLERI[VARSAYILAN_TAKIP_HASSASIYETI];
        }
    } catch (e) {
        console.warn('[KonumTakip] Profil okuma hatasi:', e);
    }
    return TAKIP_PROFILLERI[VARSAYILAN_TAKIP_HASSASIYETI];
}

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

        // Aktif profil ayarlarini al
        const profil = await aktifProfilGetir();

        // Son konum ile karsilastir
        const sonLat = konumAyarlari.koordinatlar?.lat;
        const sonLng = konumAyarlari.koordinatlar?.lng;

        if (sonLat && sonLng) {
            const mesafe = mesafeHesapla(sonLat, sonLng, yeniLat, yeniLng);
            console.log(`[KonumTakip] Mesafe degisimi: ${(mesafe / 1000).toFixed(2)} km (esik: ${(profil.mesafe / 1000).toFixed(0)} km)`);

            // Mesafe yeterli degilse konum guncelleme yapma ama son kontrol zamanini guncelle
            if (mesafe < profil.mesafe) {
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
    private baslatmaDenemeSayisi = 0;
    private readonly MAX_BASLATMA_DENEME = 3;
    private pendingAppStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;

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
            // 0. Android'de uygulama arka plandaysa foreground service baslatilamaz
            if (Platform.OS === 'android' && AppState.currentState !== 'active') {
                console.log('[KonumTakip] Uygulama arka planda, baslatma erteleniyor...');
                // On plana gelince tekrar dene
                this.onPlanaGelinceDene();
                return false;
            }

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

            // 4. Aktif profili oku ve konum takibini baslat
            const profil = await aktifProfilGetir();
            console.log(`[KonumTakip] Profil: mesafe=${profil.mesafe}m, zaman=${profil.zaman}s, dogruluk=${profil.dogruluk}`);

            await Location.startLocationUpdatesAsync(KONUM_TAKIP_GOREVI, {
                accuracy: profil.dogruluk,
                timeInterval: profil.zaman * 1000,
                distanceInterval: profil.mesafe,
                deferredUpdatesInterval: profil.zaman * 1000,
                deferredUpdatesDistance: profil.mesafe,
                showsBackgroundLocationIndicator: true,
                foregroundService: {
                    notificationTitle: 'Namaz Akışı',
                    notificationBody: 'Şehir değişikliğini takip ediyor',
                    notificationColor: '#4A90D9',
                },
                pausesUpdatesAutomatically: profil.duraklatma,
                activityType: Location.ActivityType.Other,
            });

            // 5. Ayarlari kaydet
            await this.ayarlariKaydet({ aktif: true, sonKoordinatlar: null, sonGuncellemeTarihi: null });

            // Basarili baslatma - deneme sayacini sifirla
            this.baslatmaDenemeSayisi = 0;

            console.log('[KonumTakip] Konum takibi baslatildi');
            return true;
        } catch (e: any) {
            // Android foreground service hatasi - uygulama arka plana gecmis olabilir
            if (Platform.OS === 'android' && e?.message?.includes('foreground service')) {
                console.warn('[KonumTakip] Foreground service baslatilamadi, on plana gelince tekrar denenecek');
                this.onPlanaGelinceDene();
                return false;
            }
            console.error('[KonumTakip] Baslama hatasi:', e);
            return false;
        }
    }

    /**
     * Uygulama on plana geldiginde konum takibini baslatmayi dener
     * Android'de foreground service kisitlamasi nedeniyle gereklidir
     */
    private onPlanaGelinceDene(): void {
        // Maksimum deneme sayisina ulasilmissa ek deneme yapma
        if (this.baslatmaDenemeSayisi >= this.MAX_BASLATMA_DENEME) {
            console.warn('[KonumTakip] Maksimum deneme sayisina ulasildi, on plana gelince deneme durduruldu');
            return;
        }

        // Mevcut bekleme varsa tekrar ekleme (memory leak onleme)
        if (this.pendingAppStateSubscription) {
            return;
        }

        this.baslatmaDenemeSayisi++;
        this.pendingAppStateSubscription = AppState.addEventListener('change', async (nextState) => {
            if (nextState === 'active') {
                this.pendingAppStateSubscription?.remove();
                this.pendingAppStateSubscription = null;
                console.log('[KonumTakip] Uygulama on plana geldi, konum takibi baslatiliyor...');
                const basarili = await this.baslat();
                // Basarili olduysa deneme sayacini sifirla
                if (basarili) {
                    this.baslatmaDenemeSayisi = 0;
                }
            }
        });
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

            // Bekleyen AppState subscription varsa temizle
            this.pendingAppStateSubscription?.remove();
            this.pendingAppStateSubscription = null;
            this.baslatmaDenemeSayisi = 0;

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
        } catch (e) {
            console.warn('[KonumTakip] aktifMi kontrol hatasi:', e);
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
        } catch (e) {
            console.warn('[KonumTakip] arkaPlanIzniVarMi kontrol hatasi:', e);
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
        } catch (e) {
            console.warn('[KonumTakip] Ayarlar okuma hatasi:', e);
        }
        return { aktif: false, sonKoordinatlar: null, sonGuncellemeTarihi: null };
    }

    /**
     * Konum takibini yeniden baslat
     * Uygulama on plana geldiginde cagrilmali
     * OS tarafindan durdurulan gorevi yeniden canlandirir
     *
     * Izin iptal senaryosu:
     * Kullanici sistem ayarlarindan izni iptal ettiyse, takibi graceful
     * olarak devre disi birakir ve ayarlari gunceller.
     */
    public async yenidenBaslat(): Promise<boolean> {
        try {
            // Android'de arka plandaysa erken cik
            if (Platform.OS === 'android' && AppState.currentState !== 'active') {
                console.log('[KonumTakip] Uygulama arka planda, yeniden baslatma erteleniyor...');
                this.onPlanaGelinceDene();
                return false;
            }

            const ayarlar = await this.ayarlariGetir();
            if (!ayarlar.aktif) {
                console.log('[KonumTakip] Takip aktif degil, yeniden baslatma atlanıyor');
                return false;
            }

            // Izin iptal kontrolu - kullanici sistem ayarlarindan izni kaldirmis olabilir
            const arkaPlanIzniVar = await this.arkaPlanIzniVarMi();
            if (!arkaPlanIzniVar) {
                console.log('[KonumTakip] Arka plan izni iptal edilmis, takip devre disi birakiliyor');
                // Izin iptal edilmis - ayarlari guncelle ve durdur
                await this.ayarlariKaydet({ ...ayarlar, aktif: false });
                return false;
            }

            // On plan izni de kontrol et
            try {
                const { status: onPlanIzni } = await Location.getForegroundPermissionsAsync();
                if (onPlanIzni !== 'granted') {
                    console.log('[KonumTakip] On plan izni iptal edilmis, takip devre disi birakiliyor');
                    await this.ayarlariKaydet({ ...ayarlar, aktif: false });
                    return false;
                }
            } catch (e) {
                console.warn('[KonumTakip] On plan izin kontrolu hatasi:', e);
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
        } catch (e) {
            console.warn('[KonumTakip] Son konum bilgisi okuma hatasi:', e);
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
        const profil = await aktifProfilGetir();

        return {
            takipAktif,
            arkaPlanIzniVar,
            minimumMesafe: profil.mesafe,
        };
    }
}
