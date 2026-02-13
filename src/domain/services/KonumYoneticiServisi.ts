/**
 * KonumYoneticiServisi
 * Ortak konum yönetimi - GPS ve manuel konum işlemleri
 * Hem NamazMuhafizi hem de SeriAyarlari için kullanılır
 */

import * as Location from 'expo-location';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { TurkiyeKonumServisi, Il, Ilce } from './TurkiyeKonumServisi';

// =====================
// TİP TANIMLARI
// =====================

export type KonumModu = 'gps' | 'manuel';

export interface KonumAdres {
    semt: string;
    ilce: string;
    il: string;
}

export interface KonumDurumu {
    modu: KonumModu;
    koordinatlar: { lat: number; lng: number } | null;
    ilId: number | null;
    ilceId: number | null;
    ilAdi: string;
    ilceAdi: string;
    gpsAdres: KonumAdres | null;
    gpsIzniVar: boolean;
    sonGuncelleme: string | null;
}

// =====================
// SERVİS SINIFI
// =====================

export class KonumYoneticiServisi {
    private static instance: KonumYoneticiServisi;
    private durum: KonumDurumu;

    private constructor() {
        this.durum = {
            modu: 'manuel',
            koordinatlar: null,
            ilId: 34, // İstanbul varsayılan
            ilceId: null,
            ilAdi: 'İstanbul',
            ilceAdi: '',
            gpsAdres: null,
            gpsIzniVar: false,
            sonGuncelleme: null,
        };
    }

    public static getInstance(): KonumYoneticiServisi {
        if (!KonumYoneticiServisi.instance) {
            KonumYoneticiServisi.instance = new KonumYoneticiServisi();
        }
        return KonumYoneticiServisi.instance;
    }

    // =====================
    // GPS İŞLEMLERİ
    // =====================

    /**
     * GPS izni kontrol et
     */
    public async gpsIzniKontrolEt(): Promise<boolean> {
        try {
            const { status } = await Location.getForegroundPermissionsAsync();
            this.durum.gpsIzniVar = status === 'granted';
            return this.durum.gpsIzniVar;
        } catch {
            this.durum.gpsIzniVar = false;
            return false;
        }
    }

    /**
     * GPS ile konum al ve reverse geocoding yap
     */
    public async gpsKonumuAl(): Promise<{ koordinatlar: { lat: number; lng: number }; adres: KonumAdres } | null> {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                this.durum.gpsIzniVar = false;
                return null;
            }
            this.durum.gpsIzniVar = true;

            // Pil optimizasyonu: Once son bilinen konumu dene (GPS kullanmaz)
            let location = await Location.getLastKnownPositionAsync();
            if (!location) {
                // Son bilinen konum yoksa GPS ile al (daha fazla pil tuketir)
                location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Low,
                });
            }
            const koordinatlar = {
                lat: location.coords.latitude,
                lng: location.coords.longitude,
            };

            // Reverse geocoding
            let adres: KonumAdres = { semt: '', ilce: '', il: '' };
            try {
                const adresler = await Location.reverseGeocodeAsync({
                    latitude: koordinatlar.lat,
                    longitude: koordinatlar.lng,
                });
                if (adresler && adresler.length > 0) {
                    const a = adresler[0];
                    adres = {
                        semt: '',
                        ilce: a.district || a.subregion || '',
                        il: a.city || a.region || '',
                    };
                }
            } catch (e) {
                console.warn('Reverse geocoding hatası:', e);
            }

            // Durumu güncelle
            this.durum.modu = 'gps';
            this.durum.koordinatlar = koordinatlar;
            this.durum.gpsAdres = adres;
            this.durum.sonGuncelleme = new Date().toISOString();

            return { koordinatlar, adres };
        } catch (e) {
            console.error('GPS konumu alınamadı:', e);
            return null;
        }
    }

    // =====================
    // MANUEL KONUM İŞLEMLERİ
    // =====================

    /**
     * İl ve ilçe ile konum ayarla
     */
    public async manuelKonumAyarla(il: Il, ilce?: Ilce): Promise<void> {
        this.durum.modu = 'manuel';
        this.durum.ilId = il.id;
        this.durum.ilAdi = il.ad;
        this.durum.koordinatlar = { lat: il.lat, lng: il.lng };

        if (ilce) {
            this.durum.ilceId = ilce.id;
            this.durum.ilceAdi = ilce.ad;
            // İlçe koordinatları varsa kullan
            if (ilce.lat && ilce.lng) {
                this.durum.koordinatlar = { lat: ilce.lat, lng: ilce.lng };
            }
        } else {
            this.durum.ilceId = null;
            this.durum.ilceAdi = '';
        }

        this.durum.gpsAdres = null;
        this.durum.sonGuncelleme = new Date().toISOString();
    }

    /**
     * Direkt koordinat ile ayarla
     */
    public koordinatlarAyarla(lat: number, lng: number): void {
        this.durum.koordinatlar = { lat, lng };
        this.durum.sonGuncelleme = new Date().toISOString();
    }

    // =====================
    // NAMAZ VAKTİ HESAPLAMA
    // =====================

    /**
     * Sonraki günün sabah (imsak/fajr) vaktini hesapla
     */
    public sonrakiGunImsakVaktiGetir(): Date | null {
        if (!this.durum.koordinatlar) {
            return null;
        }

        const { lat, lng } = this.durum.koordinatlar;
        const coordinates = new Coordinates(lat, lng);
        const params = CalculationMethod.Turkey();

        // Yarının tarihi
        const yarin = new Date();
        yarin.setDate(yarin.getDate() + 1);

        const prayerTimes = new PrayerTimes(coordinates, yarin, params);
        return prayerTimes.fajr;
    }

    /**
     * Bugünün imsak vaktini al
     */
    public bugunImsakVaktiGetir(): Date | null {
        if (!this.durum.koordinatlar) {
            return null;
        }

        const { lat, lng } = this.durum.koordinatlar;
        const coordinates = new Coordinates(lat, lng);
        const params = CalculationMethod.Turkey();

        const prayerTimes = new PrayerTimes(coordinates, new Date(), params);
        return prayerTimes.fajr;
    }

    /**
     * Bugünün yatsı vaktini al
     */
    public bugunYatsiVaktiGetir(): Date | null {
        if (!this.durum.koordinatlar) {
            return null;
        }

        const { lat, lng } = this.durum.koordinatlar;
        const coordinates = new Coordinates(lat, lng);
        const params = CalculationMethod.Turkey();

        const prayerTimes = new PrayerTimes(coordinates, new Date(), params);
        return prayerTimes.isha;
    }

    // =====================
    // GETTER'LAR
    // =====================

    public getDurum(): KonumDurumu {
        return { ...this.durum };
    }

    public getKoordinatlar(): { lat: number; lng: number } | null {
        return this.durum.koordinatlar ? { ...this.durum.koordinatlar } : null;
    }

    public getKonumMetni(): string {
        if (this.durum.modu === 'gps' && this.durum.gpsAdres) {
            const { ilce, il } = this.durum.gpsAdres;
            if (ilce && il) return `${ilce}, ${il}`;
            if (il) return il;
            return 'GPS Konumu';
        }

        if (this.durum.ilceAdi && this.durum.ilAdi) {
            return `${this.durum.ilceAdi}, ${this.durum.ilAdi}`;
        }
        if (this.durum.ilAdi) {
            return this.durum.ilAdi;
        }
        return 'Konum seçilmedi';
    }

    // =====================
    // DURUM YÖNETİMİ
    // =====================

    /**
     * Durumu dışarıdan yükle (Redux'tan restore için)
     */
    public durumYukle(durum: Partial<KonumDurumu>): void {
        this.durum = { ...this.durum, ...durum };
    }

    /**
     * Servisi sıfırla (test için)
     */
    public sifirla(): void {
        this.durum = {
            modu: 'manuel',
            koordinatlar: null,
            ilId: 34,
            ilceId: null,
            ilAdi: 'İstanbul',
            ilceAdi: '',
            gpsAdres: null,
            gpsIzniVar: false,
            sonGuncelleme: null,
        };
    }
}
