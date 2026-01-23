import { Coordinates, CalculationMethod, PrayerTimes, Madhab, SunnahTimes } from 'adhan';
import * as Location from 'expo-location';
import { TURKIYE_ILLERI_OFFLINE } from './TurkiyeKonumServisi';

export interface VakitBilgisi {
    vakit: 'imsak' | 'gunes' | 'ogle' | 'ikindi' | 'aksam' | 'yatsi';
    saat: Date;
    kalanSureMs: number;
    sonrakiVakitAdi: string;
    sonrakiVakitGiris: string;
}

export interface NamazVaktiHesaplayiciKonfig {
    latitude: number;
    longitude: number;
    method?: keyof typeof CalculationMethod; // default: Turkey
    madhab?: keyof typeof Madhab; // default: Hanafi
}

export class NamazVaktiHesaplayiciServisi {
    private static instance: NamazVaktiHesaplayiciServisi;
    private config: NamazVaktiHesaplayiciKonfig | null = null;
    private yapilandirildi: boolean = false;

    private constructor() { }

    public static getInstance(): NamazVaktiHesaplayiciServisi {
        if (!NamazVaktiHesaplayiciServisi.instance) {
            NamazVaktiHesaplayiciServisi.instance = new NamazVaktiHesaplayiciServisi();
        }
        return NamazVaktiHesaplayiciServisi.instance;
    }

    public yapilandir(config: NamazVaktiHesaplayiciKonfig) {
        this.config = config;
        this.yapilandirildi = true;
    }

    /**
     * Cihazın anlık konumunu kullanarak yapılandırır
     */
    public async guncelleKonumOto(): Promise<{ lat: number, lng: number } | null> {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                throw new Error('Konum izni reddedildi');
            }

            const location = await Location.getCurrentPositionAsync({});
            this.yapilandir({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                method: this.config?.method || 'Turkey',
                madhab: this.config?.madhab || 'Hanafi'
            });

            return { lat: location.coords.latitude, lng: location.coords.longitude };
        } catch (e) {
            console.error("GPS Alınamadı:", e);
            return null;
        }
    }

    /**
     * Plaka kodu veya koordinatlar ile konumu ayarlar
     * @param plakaKoduVeyaKoordinat - Plaka kodu (ornegin '34') veya { lat, lng } objesi
     */
    public guncelleKonumManuel(plakaKoduVeyaKoordinat: string | { lat: number; lng: number }): boolean {
        if (typeof plakaKoduVeyaKoordinat === 'object') {
            // Direkt koordinat verildi
            this.yapilandir({
                latitude: plakaKoduVeyaKoordinat.lat,
                longitude: plakaKoduVeyaKoordinat.lng,
                method: this.config?.method || 'Turkey',
                madhab: this.config?.madhab || 'Hanafi'
            });
            return true;
        }

        // Plaka kodu ile il bul
        const il = TURKIYE_ILLERI_OFFLINE.find(s => s.plakaKodu === plakaKoduVeyaKoordinat);
        if (il) {
            this.yapilandir({
                latitude: il.lat,
                longitude: il.lng,
                method: this.config?.method || 'Turkey',
                madhab: this.config?.madhab || 'Hanafi'
            });
            return true;
        }
        return false;
    }

    public getSuankiVakitBilgisi(): VakitBilgisi | null {
        if (!this.config) {
            console.warn("NamazVaktiHesaplayici yapılandırılmadı!");
            return null;
        }

        const { latitude, longitude } = this.config;
        const coordinates = new Coordinates(latitude, longitude);

        // Varsayılan olarak Türkiye Diyanet İşleri (Turkey) kullanılır
        // Ancak adhan kütüphanesinde 'Turkey' ön tanımlı metodlar arasındadır
        const params = CalculationMethod.Turkey();

        // İkindi vakti asr-ı evvel (çoğunluk) mu asr-ı sani (Hanefi) mi? 
        // Türkiye'de genelde tek standart vardır ama adhan esneklik sunar
        // params.madhab = Madhab.Hanafi; 

        const date = new Date();
        const prayerTimes = new PrayerTimes(coordinates, date, params);

        // Şimdiki vakti bul
        const current = prayerTimes.currentPrayer();
        let next = prayerTimes.nextPrayer();
        let nextTime = prayerTimes.timeForPrayer(next);

        // Eğer bugün için sonraki vakit kalmadıysa (Yatsı sonrası), yarının İmsak vaktine bak
        if (!nextTime || next === 'none') {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowPrayerTimes = new PrayerTimes(coordinates, tomorrow, params);
            next = 'fajr';
            nextTime = tomorrowPrayerTimes.fajr;
        }

        if (!nextTime) {
            return null;
        }

        // Adhan kütüphanesi 'fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha' döner.
        // Türkçeleştirme:
        const vakitMapping: Record<string, VakitBilgisi['vakit']> = {
            fajr: 'imsak',
            sunrise: 'gunes',
            dhuhr: 'ogle',
            asr: 'ikindi',
            maghrib: 'aksam',
            isha: 'yatsi',
            none: 'yatsi' // Fallback
        };

        // Şu anki vakit (içinde bulunduğumuz vakit) 'current', hedef vakit (çıkmak üzere olan) 'next' değil,
        // namazın kılınması gereken vakit 'current' tır.
        // Ancak biz "Vakit Çıkıyor" uyarısı için "Bir sonraki vaktin girmesine ne kadar kaldı?" sorusuna bakmalıyız.
        // Yani: Current=Ogle ise, Next=Ikindi dir. Kalan sure Ikindi'nin girmesinedir.

        const now = new Date();
        const kalanMs = nextTime.getTime() - now.getTime();

        // Şu an hangi vakitteyiz?
        // Adhan currentPrayer fonksiyonu "previous" prayerı döner. Yani saat 14:00 ise ve öğle 13:00 ise current 'dhuhr' dur.
        const icindeBulunulanVakitRaw = prayerTimes.currentPrayer();

        return {
            vakit: vakitMapping[icindeBulunulanVakitRaw] || 'yatsi',
            saat: nextTime, // Vaktin ÇIKACAĞI saat (bir sonraki vaktin girdiği saat)
            kalanSureMs: kalanMs,
            // Ek alanlar - UI için
            sonrakiVakitAdi: vakitMapping[next] || 'imsak',
            sonrakiVakitGiris: nextTime.toISOString()
        };
    }
}
