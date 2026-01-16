/**
 * TurkiyeKonumServisi
 * Turkiye il, ilce ve mahalle verilerini yonetir
 * API: Turkey Geo API (onurusluca/turkey-geo-api) benzeri yapilar desteklenir
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// =====================
// TIP TANIMLARI
// =====================

/**
 * Il (Province) tipi
 */
export interface Il {
    id: number;
    ad: string;
    plakaKodu: string;
    lat: number;
    lng: number;
}

/**
 * Ilce (District) tipi
 */
export interface Ilce {
    id: number;
    ilId: number;
    ad: string;
    lat: number;
    lng: number;
}

/**
 * Mahalle tipi (opsiyonel kullanim icin)
 */
export interface Mahalle {
    id: number;
    ilceId: number;
    ad: string;
    postaKodu?: string;
}

/**
 * API yanit tipleri
 */
interface TurkiyeAPIIlYanit {
    id: number;
    name: string;
    areaCode: number;
    coordinates: {
        latitude: number;
        longitude: number;
    };
}

interface TurkiyeAPIIlceYanit {
    id: number;
    name: string;
    province?: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}

// =====================
// SABITLER
// =====================

const API_BASE_URL = 'https://turkiyeapi.dev/api/v1';
const CACHE_SURESI = 24 * 60 * 60 * 1000; // 24 saat
const CACHE_ANAHTARI_ILLER = '@turkiye_iller';
const CACHE_ANAHTARI_ILCELER = '@turkiye_ilceler_';

// =====================
// OFFLINE IL VERISI (81 IL)
// Baslangic ve offline calisma icin
// =====================
export const TURKIYE_ILLERI_OFFLINE: Il[] = [
    { id: 1, ad: 'Adana', plakaKodu: '01', lat: 37.0000, lng: 35.3213 },
    { id: 2, ad: 'Adıyaman', plakaKodu: '02', lat: 37.7648, lng: 38.2786 },
    { id: 3, ad: 'Afyonkarahisar', plakaKodu: '03', lat: 38.7507, lng: 30.5567 },
    { id: 4, ad: 'Ağrı', plakaKodu: '04', lat: 39.7191, lng: 43.0503 },
    { id: 5, ad: 'Amasya', plakaKodu: '05', lat: 40.6499, lng: 35.8353 },
    { id: 6, ad: 'Ankara', plakaKodu: '06', lat: 39.9334, lng: 32.8597 },
    { id: 7, ad: 'Antalya', plakaKodu: '07', lat: 36.8969, lng: 30.7133 },
    { id: 8, ad: 'Artvin', plakaKodu: '08', lat: 41.1828, lng: 41.8183 },
    { id: 9, ad: 'Aydın', plakaKodu: '09', lat: 37.8444, lng: 27.8458 },
    { id: 10, ad: 'Balıkesir', plakaKodu: '10', lat: 39.6484, lng: 27.8826 },
    { id: 11, ad: 'Bilecik', plakaKodu: '11', lat: 40.0567, lng: 30.0665 },
    { id: 12, ad: 'Bingöl', plakaKodu: '12', lat: 38.8854, lng: 40.4981 },
    { id: 13, ad: 'Bitlis', plakaKodu: '13', lat: 38.4004, lng: 42.1095 },
    { id: 14, ad: 'Bolu', plakaKodu: '14', lat: 40.7356, lng: 31.6061 },
    { id: 15, ad: 'Burdur', plakaKodu: '15', lat: 37.4613, lng: 30.0665 },
    { id: 16, ad: 'Bursa', plakaKodu: '16', lat: 40.1885, lng: 29.0610 },
    { id: 17, ad: 'Çanakkale', plakaKodu: '17', lat: 40.1553, lng: 26.4142 },
    { id: 18, ad: 'Çankırı', plakaKodu: '18', lat: 40.6013, lng: 33.6134 },
    { id: 19, ad: 'Çorum', plakaKodu: '19', lat: 40.5506, lng: 34.9556 },
    { id: 20, ad: 'Denizli', plakaKodu: '20', lat: 37.7765, lng: 29.0864 },
    { id: 21, ad: 'Diyarbakır', plakaKodu: '21', lat: 37.9144, lng: 40.2110 },
    { id: 22, ad: 'Edirne', plakaKodu: '22', lat: 41.6818, lng: 26.5623 },
    { id: 23, ad: 'Elazığ', plakaKodu: '23', lat: 38.6810, lng: 39.2264 },
    { id: 24, ad: 'Erzincan', plakaKodu: '24', lat: 39.7500, lng: 39.5000 },
    { id: 25, ad: 'Erzurum', plakaKodu: '25', lat: 39.9000, lng: 41.2708 },
    { id: 26, ad: 'Eskişehir', plakaKodu: '26', lat: 39.7767, lng: 30.5206 },
    { id: 27, ad: 'Gaziantep', plakaKodu: '27', lat: 37.0662, lng: 37.3833 },
    { id: 28, ad: 'Giresun', plakaKodu: '28', lat: 40.9128, lng: 38.3895 },
    { id: 29, ad: 'Gümüşhane', plakaKodu: '29', lat: 40.4386, lng: 39.5086 },
    { id: 30, ad: 'Hakkari', plakaKodu: '30', lat: 37.5833, lng: 43.7333 },
    { id: 31, ad: 'Hatay', plakaKodu: '31', lat: 36.4018, lng: 36.3498 },
    { id: 32, ad: 'Isparta', plakaKodu: '32', lat: 37.7648, lng: 30.5566 },
    { id: 33, ad: 'Mersin', plakaKodu: '33', lat: 36.8121, lng: 34.6415 },
    { id: 34, ad: 'İstanbul', plakaKodu: '34', lat: 41.0082, lng: 28.9784 },
    { id: 35, ad: 'İzmir', plakaKodu: '35', lat: 38.4237, lng: 27.1428 },
    { id: 36, ad: 'Kars', plakaKodu: '36', lat: 40.6167, lng: 43.1000 },
    { id: 37, ad: 'Kastamonu', plakaKodu: '37', lat: 41.3887, lng: 33.7827 },
    { id: 38, ad: 'Kayseri', plakaKodu: '38', lat: 38.7312, lng: 35.4787 },
    { id: 39, ad: 'Kırklareli', plakaKodu: '39', lat: 41.7333, lng: 27.2167 },
    { id: 40, ad: 'Kırşehir', plakaKodu: '40', lat: 39.1425, lng: 34.1709 },
    { id: 41, ad: 'Kocaeli', plakaKodu: '41', lat: 40.8533, lng: 29.8815 },
    { id: 42, ad: 'Konya', plakaKodu: '42', lat: 37.8667, lng: 32.4833 },
    { id: 43, ad: 'Kütahya', plakaKodu: '43', lat: 39.4167, lng: 29.9833 },
    { id: 44, ad: 'Malatya', plakaKodu: '44', lat: 38.3552, lng: 38.3095 },
    { id: 45, ad: 'Manisa', plakaKodu: '45', lat: 38.6191, lng: 27.4289 },
    { id: 46, ad: 'Kahramanmaraş', plakaKodu: '46', lat: 37.5858, lng: 36.9371 },
    { id: 47, ad: 'Mardin', plakaKodu: '47', lat: 37.3212, lng: 40.7245 },
    { id: 48, ad: 'Muğla', plakaKodu: '48', lat: 37.2153, lng: 28.3636 },
    { id: 49, ad: 'Muş', plakaKodu: '49', lat: 38.9462, lng: 41.7539 },
    { id: 50, ad: 'Nevşehir', plakaKodu: '50', lat: 38.6939, lng: 34.6857 },
    { id: 51, ad: 'Niğde', plakaKodu: '51', lat: 37.9667, lng: 34.6833 },
    { id: 52, ad: 'Ordu', plakaKodu: '52', lat: 40.9839, lng: 37.8764 },
    { id: 53, ad: 'Rize', plakaKodu: '53', lat: 41.0201, lng: 40.5234 },
    { id: 54, ad: 'Sakarya', plakaKodu: '54', lat: 40.7569, lng: 30.3783 },
    { id: 55, ad: 'Samsun', plakaKodu: '55', lat: 41.2928, lng: 36.3313 },
    { id: 56, ad: 'Siirt', plakaKodu: '56', lat: 37.9333, lng: 41.9500 },
    { id: 57, ad: 'Sinop', plakaKodu: '57', lat: 42.0231, lng: 35.1531 },
    { id: 58, ad: 'Sivas', plakaKodu: '58', lat: 39.7477, lng: 37.0179 },
    { id: 59, ad: 'Tekirdağ', plakaKodu: '59', lat: 40.9833, lng: 27.5167 },
    { id: 60, ad: 'Tokat', plakaKodu: '60', lat: 40.3167, lng: 36.5500 },
    { id: 61, ad: 'Trabzon', plakaKodu: '61', lat: 41.0027, lng: 39.7167 },
    { id: 62, ad: 'Tunceli', plakaKodu: '62', lat: 39.1079, lng: 39.5401 },
    { id: 63, ad: 'Şanlıurfa', plakaKodu: '63', lat: 37.1591, lng: 38.7969 },
    { id: 64, ad: 'Uşak', plakaKodu: '64', lat: 38.6823, lng: 29.4082 },
    { id: 65, ad: 'Van', plakaKodu: '65', lat: 38.4891, lng: 43.4089 },
    { id: 66, ad: 'Yozgat', plakaKodu: '66', lat: 39.8181, lng: 34.8147 },
    { id: 67, ad: 'Zonguldak', plakaKodu: '67', lat: 41.4564, lng: 31.7987 },
    { id: 68, ad: 'Aksaray', plakaKodu: '68', lat: 38.3687, lng: 34.0370 },
    { id: 69, ad: 'Bayburt', plakaKodu: '69', lat: 40.2552, lng: 40.2249 },
    { id: 70, ad: 'Karaman', plakaKodu: '70', lat: 37.1759, lng: 33.2287 },
    { id: 71, ad: 'Kırıkkale', plakaKodu: '71', lat: 39.8468, lng: 33.5153 },
    { id: 72, ad: 'Batman', plakaKodu: '72', lat: 37.8812, lng: 41.1351 },
    { id: 73, ad: 'Şırnak', plakaKodu: '73', lat: 37.4187, lng: 42.4918 },
    { id: 74, ad: 'Bartın', plakaKodu: '74', lat: 41.6344, lng: 32.3375 },
    { id: 75, ad: 'Ardahan', plakaKodu: '75', lat: 41.1105, lng: 42.7022 },
    { id: 76, ad: 'Iğdır', plakaKodu: '76', lat: 39.9167, lng: 44.0333 },
    { id: 77, ad: 'Yalova', plakaKodu: '77', lat: 40.6500, lng: 29.2667 },
    { id: 78, ad: 'Karabük', plakaKodu: '78', lat: 41.2061, lng: 32.6204 },
    { id: 79, ad: 'Kilis', plakaKodu: '79', lat: 36.7184, lng: 37.1212 },
    { id: 80, ad: 'Osmaniye', plakaKodu: '80', lat: 37.0742, lng: 36.2478 },
    { id: 81, ad: 'Düzce', plakaKodu: '81', lat: 40.8438, lng: 31.1565 },
];

// =====================
// SERVIS SINIFI
// =====================

/**
 * Turkiye konum verilerini yoneten servis
 * Singleton pattern kullanir
 */
class TurkiyeKonumServisiClass {
    private static instance: TurkiyeKonumServisiClass;
    private illerCache: Il[] | null = null;
    private ilcelerCache: Map<number, Ilce[]> = new Map();

    private constructor() {}

    /**
     * Singleton instance'i dondurur
     */
    public static getInstance(): TurkiyeKonumServisiClass {
        if (!TurkiyeKonumServisiClass.instance) {
            TurkiyeKonumServisiClass.instance = new TurkiyeKonumServisiClass();
        }
        return TurkiyeKonumServisiClass.instance;
    }

    // =====================
    // IL ISLEMLERI
    // =====================

    /**
     * Tum illeri getirir
     * Oncelikle cache kontrol eder, yoksa API'den ceker
     * API basarisiz olursa offline veriyi kullanir
     */
    async illeriGetir(): Promise<Il[]> {
        // Memory cache kontrol
        if (this.illerCache) {
            return this.illerCache;
        }

        // AsyncStorage cache kontrol
        try {
            const cachedData = await AsyncStorage.getItem(CACHE_ANAHTARI_ILLER);
            if (cachedData) {
                const parsed = JSON.parse(cachedData);
                if (Date.now() - parsed.timestamp < CACHE_SURESI) {
                    this.illerCache = parsed.data;
                    return parsed.data;
                }
            }
        } catch (e) {
            console.warn('Cache okuma hatasi:', e);
        }

        // API'den cekmeyi dene
        try {
            const response = await fetch(`${API_BASE_URL}/provinces`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
            });

            if (response.ok) {
                const json = await response.json();
                const iller: Il[] = (json.data || json).map((il: TurkiyeAPIIlYanit) => ({
                    id: il.id,
                    ad: il.name,
                    plakaKodu: String(il.areaCode).padStart(2, '0'),
                    lat: il.coordinates?.latitude || 0,
                    lng: il.coordinates?.longitude || 0,
                }));

                // Cache'e kaydet
                this.illerCache = iller;
                await AsyncStorage.setItem(CACHE_ANAHTARI_ILLER, JSON.stringify({
                    timestamp: Date.now(),
                    data: iller,
                }));

                return iller;
            }
        } catch (e) {
            console.warn('API hatasi, offline veri kullaniliyor:', e);
        }

        // Offline veriyi kullan
        this.illerCache = TURKIYE_ILLERI_OFFLINE;
        return TURKIYE_ILLERI_OFFLINE;
    }

    /**
     * Tek bir ili ID'ye gore getirir
     */
    async ilGetirById(ilId: number): Promise<Il | null> {
        const iller = await this.illeriGetir();
        return iller.find(il => il.id === ilId) || null;
    }

    /**
     * Plaka koduna gore il getirir
     */
    async ilGetirByPlaka(plakaKodu: string): Promise<Il | null> {
        const iller = await this.illeriGetir();
        return iller.find(il => il.plakaKodu === plakaKodu) || null;
    }

    // =====================
    // ILCE ISLEMLERI
    // =====================

    /**
     * Belirli bir ilin ilcelerini getirir
     */
    async ilceleriGetir(ilId: number): Promise<Ilce[]> {
        // Memory cache kontrol
        if (this.ilcelerCache.has(ilId)) {
            return this.ilcelerCache.get(ilId)!;
        }

        // AsyncStorage cache kontrol
        const cacheKey = `${CACHE_ANAHTARI_ILCELER}${ilId}`;
        try {
            const cachedData = await AsyncStorage.getItem(cacheKey);
            if (cachedData) {
                const parsed = JSON.parse(cachedData);
                if (Date.now() - parsed.timestamp < CACHE_SURESI) {
                    this.ilcelerCache.set(ilId, parsed.data);
                    return parsed.data;
                }
            }
        } catch (e) {
            console.warn('Ilce cache okuma hatasi:', e);
        }

        // API'den cekmeyi dene
        try {
            const response = await fetch(`${API_BASE_URL}/provinces/${ilId}`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
            });

            if (response.ok) {
                const json = await response.json();
                const ilData = json.data || json;
                
                // Ilce verisi districts alaninda olmali
                const ilceler: Ilce[] = (ilData.districts || []).map((ilce: TurkiyeAPIIlceYanit, index: number) => ({
                    id: ilce.id || index + 1,
                    ilId: ilId,
                    ad: ilce.name,
                    lat: ilce.coordinates?.latitude || ilData.coordinates?.latitude || 0,
                    lng: ilce.coordinates?.longitude || ilData.coordinates?.longitude || 0,
                }));

                // Cache'e kaydet
                this.ilcelerCache.set(ilId, ilceler);
                await AsyncStorage.setItem(cacheKey, JSON.stringify({
                    timestamp: Date.now(),
                    data: ilceler,
                }));

                return ilceler;
            }
        } catch (e) {
            console.warn('Ilce API hatasi:', e);
        }

        // Bos dizi dondur (API calismiyorsa)
        return [];
    }

    // =====================
    // KOORDINAT ISLEMLERI
    // =====================

    /**
     * Koordinatlara gore en yakin ili bulur
     */
    async enYakinIliBul(lat: number, lng: number): Promise<Il | null> {
        const iller = await this.illeriGetir();
        
        let enYakinIl: Il | null = null;
        let enKisaMesafe = Infinity;

        for (const il of iller) {
            const mesafe = this.hesaplaMesafe(lat, lng, il.lat, il.lng);
            if (mesafe < enKisaMesafe) {
                enKisaMesafe = mesafe;
                enYakinIl = il;
            }
        }

        return enYakinIl;
    }

    /**
     * Iki nokta arasindaki mesafeyi hesaplar (km)
     * Haversine formulu kullanir
     */
    private hesaplaMesafe(lat1: number, lng1: number, lat2: number, lng2: number): number {
        const R = 6371; // Dunya yaricapi (km)
        const dLat = this.toRad(lat2 - lat1);
        const dLng = this.toRad(lng2 - lng1);
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private toRad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    // =====================
    // CACHE ISLEMLERI
    // =====================

    /**
     * Tum cache'i temizler
     */
    async cacheTemizle(): Promise<void> {
        this.illerCache = null;
        this.ilcelerCache.clear();
        
        try {
            const keys = await AsyncStorage.getAllKeys();
            const turkiyeKeys = keys.filter(k => 
                k.startsWith(CACHE_ANAHTARI_ILLER) || 
                k.startsWith(CACHE_ANAHTARI_ILCELER)
            );
            await AsyncStorage.multiRemove(turkiyeKeys);
        } catch (e) {
            console.warn('Cache temizleme hatasi:', e);
        }
    }
}

// Singleton export
export const TurkiyeKonumServisi = TurkiyeKonumServisiClass.getInstance();
