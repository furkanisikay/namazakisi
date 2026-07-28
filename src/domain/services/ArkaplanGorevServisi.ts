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
import { CumaHatirlatmaServisi, CumaKoordinat } from './CumaHatirlatmaServisi';
import { muhafizMatrisiniCoz } from '../../core/muhafiz/motorAdaptoru';
import {
    DEPOLAMA_ANAHTARLARI,
    TAKIP_PROFILLERI,
    VARSAYILAN_TAKIP_HASSASIYETI,
    TakipHassasiyeti,
} from '../../core/constants/UygulamaSabitleri';
import {
    KONUM_GEOFENCE_GOREVI,
    bolgeyiKaydet,
    eskiTakipGoreviniTemizle,
    yeniKonumuUygula,
} from './KonumTakipServisi';
import { konumTazeMi } from '../../core/utils/geofenceKararYardimcisi';
import { Logger } from '../../core/utils/Logger';

// Görev adı sabiti
export const BILDIRIM_YENILEME_GOREVI = 'BILDIRIM_YENILEME_GOREVI';

// Minimum aralık (dakika) - Android için minimum 15 dakika
const MINIMUM_ARALIK_DAKIKA = 15;

/** Konum ayarlari depolama anahtari */
const KONUM_DEPOLAMA_ANAHTARI = '@namaz_akisi/konum_ayarlari';

/**
 * Arka planda (headless) koordinat okur.
 *
 * `NamazVaktiHesaplayiciServisi.getKonfig()` KULLANILAMAZ — o bellek içidir ve
 * App.tsx kurar; arka plan görevi süreç ölüyken tetiklendiğinde boştur.
 * Konum slice anahtarı birincil kaynaktır; ESKİ kayıtlarda koordinat yalnızca
 * muhafız blob'unda bulunabildiği için o da yedek olarak denenir.
 * Hiçbiri yoksa `null` döner — varsayılan bir şehre DÜŞMEK, kullanıcıya yanlış
 * saatte bildirim göndermek demek olurdu.
 */
const arkaplandaKoordinatOku = async (): Promise<CumaKoordinat | null> => {
    const gecerliMi = (k: unknown): k is CumaKoordinat =>
        !!k &&
        typeof (k as CumaKoordinat).lat === 'number' &&
        typeof (k as CumaKoordinat).lng === 'number';

    try {
        const konumJson = await AsyncStorage.getItem(KONUM_DEPOLAMA_ANAHTARI);
        if (konumJson) {
            const konum = JSON.parse(konumJson);
            if (gecerliMi(konum?.koordinatlar)) return konum.koordinatlar;
        }

        const muhafizJson = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI);
        if (muhafizJson) {
            const muhafiz = JSON.parse(muhafizJson);
            if (gecerliMi(muhafiz?.koordinatlar)) return muhafiz.koordinatlar;
        }
    } catch (e) {
        Logger.error('ArkaplanGorev', 'Koordinat okunamadı', e);
    }
    return null;
};

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
    } catch (e) {
        Logger.warn('ArkaplanGorev', 'Profil okuma hatasi:', e);
    }
    return TAKIP_PROFILLERI[VARSAYILAN_TAKIP_HASSASIYETI];
}

/**
 * Konum izinlerini kontrol eder, iptal edildiyse takibi devre disi birakir
 * @returns true ise izin iptal edilmis (takip baslatilmamali)
 */
async function izinIptalKontrolEt(takipAyarlari: { aktif: boolean }): Promise<boolean> {
    const { status: arkaPlanIzni } = await Location.getBackgroundPermissionsAsync();
    if (arkaPlanIzni !== 'granted') {
        Logger.info('ArkaplanGorev', 'Arka plan konum izni iptal edilmis, takip devre disi birakiliyor');
        await AsyncStorage.setItem(KONUM_TAKIP_AYARLARI_ANAHTAR, JSON.stringify({
            ...takipAyarlari,
            aktif: false,
        }));
        return true;
    }

    const { status: onPlanIzni } = await Location.getForegroundPermissionsAsync();
    if (onPlanIzni !== 'granted') {
        Logger.info('ArkaplanGorev', 'On plan konum izni iptal edilmis, takip devre disi birakiliyor');
        await AsyncStorage.setItem(KONUM_TAKIP_AYARLARI_ANAHTAR, JSON.stringify({
            ...takipAyarlari,
            aktif: false,
        }));
        return true;
    }

    return false;
}

/**
 * Konum takibinin "canlı" olduğunu gösteren nabzı günceller.
 *
 * NEDEN GEREKLİ: Takip artık olay tabanlıdır (geofence) — kullanıcı hareketsizken
 * HİÇ olay üretilmez. Eski periyodik yol, eşik aşılmasa bile her turda
 * `sonGpsGuncellemesi`'ni tazeliyordu ve Konum Ayarları ekranı bunu "5 dakika önce
 * güncellendi" diye gösteriyor. Nabız atmazsa ekran günlerce "3 gün önce
 * güncellendi" der → kullanıcı takibi bozuk sanır. Bu yazım, eski yolun eşik-altı
 * dalıyla birebir aynı anlamı taşır: "takip yaşıyor, son kontrol bu an".
 *
 * Koordinatlara DOKUNMAZ; yalnız zaman damgası yazar (konum sabitlemesi almaz,
 * dolayısıyla pil maliyeti yoktur).
 */
async function nabziGuncelle(): Promise<void> {
    try {
        const konumAyarlariJson = await AsyncStorage.getItem(KONUM_DEPOLAMA_ANAHTARI);
        if (!konumAyarlariJson) {
            return;
        }

        const konumAyarlari = JSON.parse(konumAyarlariJson);

        // Bilinmeyen alanlar korunmali (bu blob tiplenmis alanlardan fazlasini tasiyabilir)
        await AsyncStorage.setItem(KONUM_DEPOLAMA_ANAHTARI, JSON.stringify({
            ...konumAyarlari,
            sonGpsGuncellemesi: new Date().toISOString(),
        }));
    } catch (e) {
        Logger.warn('ArkaplanGorev', 'Nabiz guncellenemedi:', e);
    }
}

/**
 * İzlenen bölge onarılırken kullanılacak merkezi belirler.
 *
 * Taze sabitleme tercih edilir; alınamazsa diskteki son koordinata düşülür.
 * Kayıtlı koordinatla kurulan bölge kullanıcı uzaktaysa anında bir çıkış olayı
 * üretir — bu İSTENEN kurtarma davranışıdır: olay yolu taze konumu alıp merkezi
 * düzeltir ve vakitleri günceller.
 */
async function onarimMerkeziniBelirle(
    dogruluk: number,
): Promise<{ lat: number; lng: number; tazeMi: boolean } | null> {
    try {
        const konum = await Location.getCurrentPositionAsync({ accuracy: dogruluk });
        if (konum?.coords) {
            return {
                lat: konum.coords.latitude,
                lng: konum.coords.longitude,
                // Onbellekten gelen bayat bir sabitleme uzerine konum GUNCELLEMESI
                // yapilmamali (yalnizca bolge merkezi olarak kullanilabilir).
                tazeMi: konumTazeMi(konum.timestamp, Date.now()),
            };
        }
    } catch (e) {
        Logger.warn('ArkaplanGorev', 'Taze konum alinamadi, kayitli koordinata dusuluyor:', e);
    }

    try {
        const konumAyarlariJson = await AsyncStorage.getItem(KONUM_DEPOLAMA_ANAHTARI);
        if (konumAyarlariJson) {
            const konumAyarlari = JSON.parse(konumAyarlariJson);
            const lat = konumAyarlari.koordinatlar?.lat;
            const lng = konumAyarlari.koordinatlar?.lng;
            if (typeof lat === 'number' && typeof lng === 'number') {
                return { lat, lng, tazeMi: false };
            }
        }
    } catch (e) {
        Logger.warn('ArkaplanGorev', 'Kayitli koordinat okunamadi:', e);
    }

    return null;
}

/**
 * Arka plandan konum takibini onar / nabzını at
 *
 * Bu fonksiyon arka plan gorevinden (background fetch) cagrilir ve HİBRİT
 * tasarımın güvenlik ağı ayağıdır. Birincil yol olay tabanlıdır (geofence,
 * `KonumTakipServisi`); burada onun iki bilinen boşluğu kapatılır:
 *
 *  (a) SESSİZ KURULUM HATASI — expo tarafında `startGeofencing()` konum
 *      sağlayıcı yoksa sessizce döner, `addGeofences` hatası yalnız loglanır.
 *      Bölge hiç kurulamamış olabilir; burada tespit edilip yeniden kurulur.
 *  (b) NABIZ — hareketsiz kullanıcıda hiç olay olmaz, ekrandaki "en son
 *      güncellendi" bilgisi bayatlar (bkz. `nabziGuncelle`).
 *
 * Senaryo akisi:
 * 1. Surum gecisi temizligi: eski foreground service'li gorev varsa durdurulur
 * 2. Kullanici daha once akilli takibi actiysa → aktif: true AsyncStorage'da kalir
 * 3. Izin iptal edildiyse → graceful deactivation
 * 4. Bolge kayitliysa → dokunma, yalniz nabzi at
 * 5. Bolge olmusse (reboot / app kill / sessiz hata) → yeniden kur
 */
export async function arkaplandanKonumTakibiniYenidenBaslat(): Promise<void> {
    try {
        // 0. SURUM GECISI: eski (foreground service'li) gorev `MY_PACKAGE_REPLACED`
        // yayininda kendiliginden dirilir → kalici bildirim geri gelir. Kullanici
        // uygulamayi hic acmasa bile burada temizlenmeli, bu yuzden en basta ve
        // ayar kontrollerinden BAGIMSIZ calisir.
        await eskiTakipGoreviniTemizle();

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

        // 3. Izinleri kontrol et (kullanici ayarlardan iptal etmis olabilir)
        const izinIptalEdildi = await izinIptalKontrolEt(takipAyarlari);
        if (izinIptalEdildi) {
            return;
        }

        // 4. Bolge hala kayitli mi kontrol et
        const kayitliMi = await TaskManager.isTaskRegisteredAsync(KONUM_GEOFENCE_GOREVI);
        if (kayitliMi) {
            Logger.info('ArkaplanGorev', 'Bolge izleme zaten kayitli ve calisiyor');
            // Saglikli: yalniz nabzi at (konum sabitlemesi ALINMAZ, pil maliyeti yok)
            await nabziGuncelle();
            return;
        }

        // 5. KRITIK: Bolge kayitli degil ama aktif olmasi gerekiyor - yeniden kur!
        // Bu durum genellikle su senaryolarda olusur:
        // - Telefon yeniden basladi (GMS geofence'leri reboot'ta silinir)
        // - OS uygulamayi pil icin oldurdu
        // - Kurulum sessizce basarisiz oldu (konum servisi kapaliydi)
        Logger.info('ArkaplanGorev', 'Bolge izleme ölmüş, yeniden kuruluyor...');
        const profil = await aktifProfilGetir();
        const merkez = await onarimMerkeziniBelirle(profil.dogruluk);
        if (!merkez) {
            Logger.warn('ArkaplanGorev', 'Bolge merkezi belirlenemedi, onarim ertelendi');
            return;
        }

        await bolgeyiKaydet(merkez.lat, merkez.lng, profil.mesafe);

        Logger.info('ArkaplanGorev', 'Bolge izleme yeniden kuruldu');

        // KRITIK — SESSIZ KONUM KAYMASI: bolge TAZE konuma kuruldugunda cihaz
        // cemberin ICINDE olur, dolayisiyla hicbir cikis olayi DOGMAZ. Kullanici
        // baska bir sehirde yeniden baslatmissa (reboot) diskteki koordinat orada
        // bayat kalir ve tum bildirimler eski sehre gore planlanmis olarak surer.
        // Bu yuzden onarim mesafeyi ACIKCA karsilastirip ortak uygulama yolundan
        // gecmeli (o yol esik altinda ise yalnizca nabiz yazar).
        if (merkez.tazeMi) {
            await yeniKonumuUygula(merkez.lat, merkez.lng, profil.mesafe);
        }
    } catch (error) {
        Logger.error('ArkaplanGorev', 'Konum takip onarim hatasi:', error);
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
    Logger.info('ArkaplanGorev', 'Görev tetiklendi');

    try {
        // =====================================================
        // ADIM 1: KONUM TAKIBINI CANLANDIR
        // Telefon reboot, app kill, OS kill senaryolarini ele al
        // =====================================================
        await arkaplandanKonumTakibiniYenidenBaslat();

        // =====================================================
        // ADIM 1.5: CUMA HATIRLATMASINI TAZELE
        //
        // MUHAFIZ KONTROLLERINDEN ÖNCE: aşağıdaki bloklar muhafız ayarı yoksa
        // veya kapalıysa NoData ile ERKEN DÖNER. Cuma hatırlatması muhafızdan
        // bağımsız bir ayardır; buradan sonraya konsaydı muhafızı kapatan
        // kullanıcıda dört haftalık pencere hiç tazelenmez ve hatırlatma
        // sessizce biterdi. Hatası da muhafız planlamasını düşürmemeli.
        // =====================================================
        try {
            await CumaHatirlatmaServisi.getInstance().hatirlatmalariGuncelle(
                await arkaplandaKoordinatOku()
            );
        } catch (e) {
            Logger.error('ArkaplanGorev', 'Cuma hatırlatması tazelenemedi', e);
        }

        // =====================================================
        // ADIM 2: BILDIRIMLERI YENIDEN PLANLA
        // =====================================================

        // Muhafız ayarlarını AsyncStorage'dan al
        const ayarlarJson = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI);

        if (!ayarlarJson) {
            Logger.info('ArkaplanGorev', 'Muhafiz ayarlari bulunamadi');
            return BackgroundFetch.BackgroundFetchResult.NoData;
        }

        const ayarlar = JSON.parse(ayarlarJson);

        // Muhafız aktif değilse işlem yapma
        if (!ayarlar.aktif) {
            Logger.info('ArkaplanGorev', 'Muhafız devre dışı');
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

        // Faz 3: motor vakit x seviye matrisinden okur. Diskteki kayitta matris
        // varsa O kullanilir; yoksa/bozuksa eski global esik/sikliklardan turetilir.
        // (Aksi halde bu arkaplan gorevi, ekranda kurulan matrisi bayat global
        // esiklerle EZERDI.)
        const muhafizAyarlari: ArkaplanMuhafizAyarlari = {
            aktif: ayarlar.aktif,
            koordinatlar: koordinatlar,
            matris: muhafizMatrisiniCoz({
                matris: ayarlar.matris,
                esikler: {
                    seviye1: ayarlar.esikler?.seviye1 || 45,
                    seviye2: ayarlar.esikler?.seviye2 || 25,
                    seviye3: ayarlar.esikler?.seviye3 || 10,
                    seviye4: ayarlar.esikler?.seviye4 || 3,
                },
                sikliklar: {
                    seviye1: sikliklar.seviye1 || 15,
                    seviye2: sikliklar.seviye2 || 10,
                    seviye3: sikliklar.seviye3 || 5,
                    seviye4: sikliklar.seviye4 || 1,
                },
            }),
        };

        await ArkaplanMuhafizServisi.getInstance().yapilandirVePlanla(muhafizAyarlari);

        Logger.info('ArkaplanGorev', 'Bildirimler yeniden planlandi (sehir hassasiyetinde konum)');
        return BackgroundFetch.BackgroundFetchResult.NewData;

    } catch (error) {
        Logger.error('ArkaplanGorev', 'Hata:', error);
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
                Logger.info('ArkaplanGorev', 'Görev zaten kayıtlı');
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
            Logger.info('ArkaplanGorev', 'Görev başarıyla kaydedildi');
            return true;

        } catch (error) {
            Logger.error('ArkaplanGorev', 'Kayıt hatası:', error);
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
                Logger.info('ArkaplanGorev', 'Görev durduruldu');
            }

            this.kayitli = false;
        } catch (error) {
            Logger.error('ArkaplanGorev', 'Durdurma hatası:', error);
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
