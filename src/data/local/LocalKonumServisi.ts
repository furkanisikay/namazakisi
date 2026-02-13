/**
 * AsyncStorage ile konum verilerini yoneten servis
 * SOLID: Single Responsibility - Sadece konum persistence islemleri
 * 
 * Bu servis konumSlice'dan bagimsiz olarak konum verilerini
 * AsyncStorage'da saklamak icin kullanilir.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiYanit } from '../../core/types';

// ==================== TIPLER ====================

/**
 * GPS adres bilgisi
 */
export interface GpsAdres {
    semt: string;
    ilce: string;
    il: string;
}

/**
 * Koordinat bilgisi
 */
export interface Koordinatlar {
    lat: number;
    lng: number;
}

/**
 * Konum modu tipi
 */
export type KonumModu = 'oto' | 'manuel';

/**
 * Konum ayarlari arayuzu
 * AsyncStorage'da saklanan veri yapisi
 */
export interface KonumAyarlari {
    /** Konum modu: oto (GPS) veya manuel (sehir secimi) */
    konumModu: KonumModu;
    /** @deprecated Eski sistem - seciliIlId ve seciliIlceId kullanin */
    seciliSehirId: string;
    /** Secili il ID'si (1-81) */
    seciliIlId: number | null;
    /** Secili ilce ID'si */
    seciliIlceId: number | null;
    /** Secili il adi (gosterim icin) */
    seciliIlAdi: string;
    /** Secili ilce adi (gosterim icin) */
    seciliIlceAdi: string;
    /** GPS konum icin adres bilgisi */
    gpsAdres: GpsAdres | null;
    /** Koordinat bilgisi */
    koordinatlar: Koordinatlar;
    /** Son GPS guncelleme zamani (ISO string) */
    sonGpsGuncellemesi: string | null;
    /** Akilli konum takibi aktif mi (arka plan) */
    akilliTakipAktif: boolean;
    /** Takip hassasiyet profili */
    takipHassasiyeti: TakipHassasiyeti;
}

// ==================== SABITLER ====================

import { DEPOLAMA_ANAHTARLARI, VARSAYILAN_TAKIP_HASSASIYETI } from '../../core/constants/UygulamaSabitleri';
import type { TakipHassasiyeti } from '../../core/constants/UygulamaSabitleri';

/** Depolama anahtari */
const KONUM_DEPOLAMA_ANAHTARI = DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI;

/**
 * Varsayilan konum ayarlari (Istanbul)
 */
export const VARSAYILAN_KONUM_AYARLARI: KonumAyarlari = {
    konumModu: 'manuel',
    seciliSehirId: '34',
    seciliIlId: 34,
    seciliIlceId: null,
    seciliIlAdi: 'Istanbul',
    seciliIlceAdi: '',
    gpsAdres: null,
    koordinatlar: {
        lat: 41.0082,
        lng: 28.9784,
    },
    sonGpsGuncellemesi: null,
    akilliTakipAktif: false,
    takipHassasiyeti: VARSAYILAN_TAKIP_HASSASIYETI,
};

// ==================== SERVIS FONKSIYONLARI ====================

/**
 * Konum ayarlarini AsyncStorage'dan getirir
 * @returns Konum ayarlari veya varsayilan degerler
 */
export const localKonumAyarlariniGetir = async (): Promise<ApiYanit<KonumAyarlari>> => {
    try {
        console.log('[LocalKonumServisi] AsyncStorage\'dan yukleniyor...');
        const veri = await AsyncStorage.getItem(KONUM_DEPOLAMA_ANAHTARI);

        if (!veri) {
            console.log('[LocalKonumServisi] Kayitli veri bulunamadi, varsayilan degerler donduruluyor');
            return {
                basarili: true,
                veri: null as unknown as KonumAyarlari, // null dondurup slice'in varsayilan kullanmasini sagliyoruz
            };
        }

        const parsed = JSON.parse(veri) as KonumAyarlari;
        console.log('[LocalKonumServisi] Yuklenen veri:', parsed.konumModu, parsed.seciliIlAdi);

        return {
            basarili: true,
            veri: parsed,
        };
    } catch (error) {
        console.error('[LocalKonumServisi] Konum ayarlari yuklenemedi:', error);
        return {
            basarili: false,
            hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
        };
    }
};

/**
 * Konum ayarlarini AsyncStorage'a kaydeder
 * @param ayarlar Kaydedilecek konum ayarlari
 */
export const localKonumAyarlariniKaydet = async (
    ayarlar: KonumAyarlari
): Promise<ApiYanit<void>> => {
    try {
        console.log('[LocalKonumServisi] Kaydediliyor:', ayarlar.konumModu, ayarlar.seciliIlAdi);
        await AsyncStorage.setItem(KONUM_DEPOLAMA_ANAHTARI, JSON.stringify(ayarlar));
        console.log('[LocalKonumServisi] Kayit basarili');

        return { basarili: true };
    } catch (error) {
        console.error('[LocalKonumServisi] Kayit hatasi:', error);
        return {
            basarili: false,
            hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
        };
    }
};

/**
 * Sadece koordinatlari gunceller
 * Mevcut ayarlari koruyarak sadece koordinat bilgisini degistirir
 * @param koordinatlar Yeni koordinat bilgisi
 */
export const localKoordinatlariGuncelle = async (
    koordinatlar: Koordinatlar
): Promise<ApiYanit<void>> => {
    try {
        const mevcutYanit = await localKonumAyarlariniGetir();
        const mevcutAyarlar = mevcutYanit.veri || VARSAYILAN_KONUM_AYARLARI;

        const guncelAyarlar: KonumAyarlari = {
            ...mevcutAyarlar,
            koordinatlar,
        };

        return await localKonumAyarlariniKaydet(guncelAyarlar);
    } catch (error) {
        return {
            basarili: false,
            hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
        };
    }
};

/**
 * GPS adres bilgisini gunceller
 * Mevcut ayarlari koruyarak sadece GPS adres bilgisini degistirir
 * @param gpsAdres Yeni GPS adres bilgisi (null olabilir)
 */
export const localGpsAdresiniGuncelle = async (
    gpsAdres: GpsAdres | null
): Promise<ApiYanit<void>> => {
    try {
        const mevcutYanit = await localKonumAyarlariniGetir();
        const mevcutAyarlar = mevcutYanit.veri || VARSAYILAN_KONUM_AYARLARI;

        const guncelAyarlar: KonumAyarlari = {
            ...mevcutAyarlar,
            gpsAdres,
            sonGpsGuncellemesi: gpsAdres ? new Date().toISOString() : mevcutAyarlar.sonGpsGuncellemesi,
        };

        return await localKonumAyarlariniKaydet(guncelAyarlar);
    } catch (error) {
        return {
            basarili: false,
            hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
        };
    }
};

/**
 * Konum modunu gunceller (oto/manuel)
 * @param konumModu Yeni konum modu
 */
export const localKonumModunuGuncelle = async (
    konumModu: KonumModu
): Promise<ApiYanit<void>> => {
    try {
        const mevcutYanit = await localKonumAyarlariniGetir();
        const mevcutAyarlar = mevcutYanit.veri || VARSAYILAN_KONUM_AYARLARI;

        const guncelAyarlar: KonumAyarlari = {
            ...mevcutAyarlar,
            konumModu,
        };

        return await localKonumAyarlariniKaydet(guncelAyarlar);
    } catch (error) {
        return {
            basarili: false,
            hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
        };
    }
};

/**
 * Il ve ilce secimini gunceller (manuel mod icin)
 * @param ilId Il ID'si
 * @param ilAdi Il adi
 * @param ilceId Ilce ID'si (opsiyonel)
 * @param ilceAdi Ilce adi (opsiyonel)
 * @param koordinatlar Il/ilce koordinatlari
 */
export const localIlIlceSeciminiGuncelle = async (
    ilId: number,
    ilAdi: string,
    ilceId: number | null,
    ilceAdi: string,
    koordinatlar: Koordinatlar
): Promise<ApiYanit<void>> => {
    try {
        const mevcutYanit = await localKonumAyarlariniGetir();
        const mevcutAyarlar = mevcutYanit.veri || VARSAYILAN_KONUM_AYARLARI;

        const guncelAyarlar: KonumAyarlari = {
            ...mevcutAyarlar,
            konumModu: 'manuel',
            seciliIlId: ilId,
            seciliSehirId: String(ilId),
            seciliIlAdi: ilAdi,
            seciliIlceId: ilceId,
            seciliIlceAdi: ilceAdi,
            koordinatlar,
        };

        return await localKonumAyarlariniKaydet(guncelAyarlar);
    } catch (error) {
        return {
            basarili: false,
            hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
        };
    }
};

/**
 * Konum verilerini tamamen temizler
 * Fabrika ayarlarina donmek icin kullanilir
 */
export const localKonumVerileriniTemizle = async (): Promise<ApiYanit<void>> => {
    try {
        await AsyncStorage.removeItem(KONUM_DEPOLAMA_ANAHTARI);
        console.log('[LocalKonumServisi] Konum verileri temizlendi');
        return { basarili: true };
    } catch (error) {
        console.error('[LocalKonumServisi] Temizleme hatasi:', error);
        return {
            basarili: false,
            hata: error instanceof Error ? error.message : 'Bilinmeyen hata',
        };
    }
};

/**
 * Konum verilerinin var olup olmadigini kontrol eder
 * @returns true: kayitli veri var, false: kayitli veri yok
 */
export const localKonumVerisiVarMi = async (): Promise<boolean> => {
    try {
        const veri = await AsyncStorage.getItem(KONUM_DEPOLAMA_ANAHTARI);
        return veri !== null;
    } catch {
        return false;
    }
};
