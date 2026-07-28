/**
 * Konum Takip Servisi
 *
 * Şehir değişimini OLAY TABANLI izler: OS'u periyodik uyandırıp mesafe ölçmek
 * yerine, bulunduğunuz noktaya bir bölge (geofence) kaydeder ve yalnızca o
 * çemberden ÇIKINCA uyanır. Çıkışta taze konumu alır, vakitleri günceller ve
 * bölgeyi yeni konuma taşır.
 *
 * NEDEN GEOFENCE (eski `startLocationUpdatesAsync` yerine):
 * expo-location'da arka plan konum GÜNCELLEMELERİ Android'de zorunlu olarak bir
 * foreground service üzerinden akar (`LocationTaskService`,
 * `foregroundServiceType="location"`) → kullanıcı kalıcı bir bildirim görür.
 * Geofencing yolu ise `GeofencingClient` + `PendingIntent` + JobScheduler
 * kullanır (`GeofencingTaskConsumer`), foreground service'e HİÇ dokunmaz →
 * kalıcı bildirim yok, periyodik uyanma yok.
 *
 * HİBRİT: Geofencing'in bedeli, hatalarının sessiz olmasıdır — expo tarafında
 * `startGeofencing()` konum sağlayıcı yoksa sessizce döner ve `addGeofences`
 * hatası yalnız loglanır. Ayrıca kullanıcı hareketsizken hiç olay üretilmez, bu
 * da ekrandaki "en son ne zaman güncellendi" nabzını durdururdu. Bu iki boşluğu
 * `ArkaplanGorevServisi`'ndeki MEVCUT 15 dakikalık görev kapatır (bkz.
 * `arkaplandanKonumTakibiniYenidenBaslat`): ölü/hiç kurulamamış bölgeyi onarır
 * ve nabzı atar. Yani bu servis "her şeyi yakalamak" zorunda değildir.
 *
 * NOT: Bu servis domain katmaninda olmasina ragmen React Native / native API'lere
 * dogrudan bagli calisir. Bu, Clean Architecture'in Dependency Rule'unu teknik
 * olarak ihlal eder, ancak React Native projeleri icin pragmatik bir trade-off'tur.
 */

import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mesafeHesapla } from '../../core/utils/MesafeHesaplayici';
import { Logger } from '../../core/utils/Logger';
import { konumTazeMi, olayIslenebilirMi } from '../../core/utils/geofenceKararYardimcisi';
import { konumDegistiUygula } from './KonumDegisikligiServisi';
import {
    TAKIP_PROFILLERI,
    VARSAYILAN_TAKIP_HASSASIYETI,
    TakipHassasiyeti,
    TakipProfilKonfigurasyonu,
} from '../../core/constants/UygulamaSabitleri';

/**
 * ESKİ arka plan konum görevi adı.
 *
 * Artık HİÇ kaydedilmez; yalnızca GEÇİŞ TEMİZLİĞİ için durur. Sürüm yükselten
 * kullanıcıda bu görev diskte kayıtlı kalmıştır ve foreground service'iyle
 * birlikte çalışmaya devam eder → kalıcı bildirim asla kaybolmazdı. `baslat` ve
 * `durdur` bu görevi açıkça durdurur.
 */
export const KONUM_TAKIP_GOREVI = 'KONUM_TAKIP_GOREVI';

/** Arka plan bölge (geofence) görevi adı */
export const KONUM_GEOFENCE_GOREVI = 'KONUM_GEOFENCE_GOREVI';

/** İzlenen tek bölgenin kimliği (her zaman kullanıcının son bilinen konumu) */
export const AKTIF_BOLGE_KIMLIGI = 'aktif_konum_bolgesi';

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
        Logger.warn('KonumTakip', 'Profil okuma hatasi:', e);
    }
    return TAKIP_PROFILLERI[VARSAYILAN_TAKIP_HASSASIYETI];
}

/**
 * Verilen merkez ve yarıçapla izlenen bölgeyi (yeniden) kurar.
 *
 * `startGeofencingAsync` zaten kayıtlı bir görevde çağrılırsa expo `setOptions`
 * üzerinden durdurup yeniden kurar; ayrıca `stopGeofencingAsync` gerekmez.
 *
 * DİKKAT: Yalnızca cihazın İÇİNDE olduğu bilinen bir merkezle çağırın (taze
 * konum sabitlemesi). Dışında olduğumuz bir merkezle kurmak, expo'nun sabit
 * kodladığı `INITIAL_TRIGGER_EXIT` yüzünden anında yeni bir çıkış olayı üretir.
 * Bu bilinçli olarak ONARIM yolunda kullanılır (bkz. ArkaplanGorevServisi),
 * olay yolunda ise `konumTazeMi` ile engellenir.
 */
export async function bolgeyiKaydet(lat: number, lng: number, yaricap: number): Promise<void> {
    await Location.startGeofencingAsync(KONUM_GEOFENCE_GOREVI, [
        {
            identifier: AKTIF_BOLGE_KIMLIGI,
            latitude: lat,
            longitude: lng,
            radius: yaricap,
            // Yalnız çıkış ilgilendiriyor: girişte yapacak iş yok.
            notifyOnEnter: false,
            notifyOnExit: true,
        },
    ]);
}

/**
 * Eski (foreground service'li) konum güncelleme görevini varsa durdurur.
 *
 * Sürüm geçişinde kritik: durdurulmazsa kullanıcı hem geofence'ten hem de eski
 * görevden hizmet alır ve kalıcı bildirim ekranda kalır. Üstelik `MY_PACKAGE_REPLACED`
 * yayınında expo-task-manager kayıtlı görevleri geri yükler → güncelleme sonrası
 * eski görev KENDİLİĞİNDEN dirilir. Bu yüzden temizlik yalnız `baslat`/`durdur`
 * ile değil, arka plan görevinden de (uygulama hiç açılmasa bile) çağrılır.
 */
export async function eskiTakipGoreviniTemizle(): Promise<void> {
    try {
        const kayitliMi = await TaskManager.isTaskRegisteredAsync(KONUM_TAKIP_GOREVI);
        if (kayitliMi) {
            await Location.stopLocationUpdatesAsync(KONUM_TAKIP_GOREVI);
            Logger.info('KonumTakip', 'Eski konum guncelleme gorevi durduruldu (gecis temizligi)');
        }
    } catch (e) {
        Logger.warn('KonumTakip', 'Eski gorev temizlenemedi:', e);
    }
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
 * Arka plan bölge görevini tanımla
 *
 * Yalnızca ÇIKIŞ olaylarında iş yapar. Olay yükü tetikleyen konumu TAŞIMAZ
 * (expo yalnız kayıtlı bölgeyi geri verir) → taze sabitleme burada alınır.
 */
TaskManager.defineTask(KONUM_GEOFENCE_GOREVI, async ({ data, error }: TaskManager.TaskManagerTaskBody<{
    eventType: Location.LocationGeofencingEventType;
    region: Location.LocationRegion;
}>) => {
    if (error) {
        Logger.error('KonumTakip', 'Bolge gorevi hatasi:', error);
        return;
    }

    if (!data || data.eventType !== Location.LocationGeofencingEventType.Exit) {
        // Giriş olayı beklenmiyor (notifyOnEnter:false) — gelirse yok say.
        return;
    }

    try {
        // Mevcut konum ayarlarini al
        const konumAyarlariJson = await AsyncStorage.getItem(KONUM_DEPOLAMA_ANAHTARI);
        if (!konumAyarlariJson) {
            Logger.info('KonumTakip', 'Konum ayarlari bulunamadi');
            return;
        }

        const konumAyarlari = JSON.parse(konumAyarlariJson);

        // GPS modu degilse cik
        if (konumAyarlari.konumModu !== 'oto') {
            Logger.info('KonumTakip', 'GPS modu aktif degil');
            return;
        }

        const simdi = Date.now();

        // Patlama (burst) koruması: art arda gelen olaylar pahalı işi tekrarlamasın.
        if (!olayIslenebilirMi(konumAyarlari.sonGeofenceOlayi, simdi)) {
            Logger.info('KonumTakip', 'Bolge olayi bekleme penceresinde, atlanıyor');
            return;
        }

        const profil = await aktifProfilGetir();

        // Taze sabitleme al (olay yükü konum taşımaz).
        let yeniKonum: Location.LocationObject | null = null;
        try {
            yeniKonum = await Location.getCurrentPositionAsync({ accuracy: profil.dogruluk });
        } catch (konumHatasi) {
            Logger.warn('KonumTakip', 'Taze konum alinamadi:', konumHatasi);
        }

        // KRİTİK: Taze konum yoksa bölgeyi YENİDEN KURMA. Bayat/eski bir merkeze
        // kurmak, expo'nun sabit `INITIAL_TRIGGER_EXIT`'i yüzünden anında yeni bir
        // çıkış olayı doğurur ve sıkı döngüye girilir. Mevcut bölge kayıtlı kalır;
        // onarımı 15 dakikalık arka plan görevi üstlenir.
        if (!yeniKonum || !konumTazeMi(yeniKonum.timestamp, simdi)) {
            Logger.warn('KonumTakip', 'Taze konum yok, bolge yeniden kurulmuyor (dongu korumasi)');
            await AsyncStorage.setItem(KONUM_DEPOLAMA_ANAHTARI, JSON.stringify({
                ...konumAyarlari,
                sonGeofenceOlayi: new Date(simdi).toISOString(),
            }));
            return;
        }

        const yeniLat = yeniKonum.coords.latitude;
        const yeniLng = yeniKonum.coords.longitude;

        if (__DEV__) {
            Logger.info('KonumTakip', `Bolge cikisi, yeni konum: ${yeniLat.toFixed(1)}, ${yeniLng.toFixed(1)}`);
        }

        // Bölgeyi TAZE konuma taşı. Merkez = bulunduğumuz nokta olduğu için
        // çemberin içindeyiz → anında çıkış tetiklenemez.
        try {
            await bolgeyiKaydet(yeniLat, yeniLng, profil.mesafe);
        } catch (kayitHatasi) {
            Logger.error('KonumTakip', 'Bolge yeniden kurulamadi:', kayitHatasi);
        }

        await yeniKonumuUygula(yeniLat, yeniLng, profil.mesafe, {
            sonGeofenceOlayi: new Date(simdi).toISOString(),
        });

    } catch (e) {
        Logger.error('KonumTakip', 'Islem hatasi:', e);
    }
});

/**
 * Taze bir konum sabitlemesini diske işler ve gerekiyorsa tüm tüketicilere yayar.
 *
 * İKİ ÇAĞIRAN VAR ve ikisi de bu fonksiyondan geçmek ZORUNDA:
 *  1. Bölge çıkış olayı (`KONUM_GEOFENCE_GOREVI`)
 *  2. Arka plan ONARIM yolu (`ArkaplanGorevServisi`)
 *
 * (2) neden şart: onarım bölgeyi TAZE konuma kurar → cihaz çemberin İÇİNDE olur
 * → hiçbir çıkış olayı **doğmaz**. Kullanıcı başka bir şehirde yeniden başlattıysa
 * (reboot) diskteki koordinat orada bayat kalır ve tüm bildirimler eski şehre göre
 * planlanmış olarak sürer — kullanıcı uygulamayı açana kadar. Bu yüzden onarım da
 * mesafeyi AÇIKÇA karşılaştırıp buradan geçmeli.
 *
 * @param esikMesafe Güncellemenin tetikleneceği asgari mesafe (profil yarıçapı)
 * @param ekAlanlar Her iki yazma dalına da eklenecek alanlar (ör. `sonGeofenceOlayi`)
 * @returns Konum güncellenip yayıldıysa true; eşik altında kalındıysa false
 */
export async function yeniKonumuUygula(
    yeniLat: number,
    yeniLng: number,
    esikMesafe: number,
    ekAlanlar: Record<string, unknown> = {},
): Promise<boolean> {
    const konumAyarlariJson = await AsyncStorage.getItem(KONUM_DEPOLAMA_ANAHTARI);
    if (!konumAyarlariJson) {
        Logger.info('KonumTakip', 'Konum ayarlari bulunamadi');
        return false;
    }

    const konumAyarlari = JSON.parse(konumAyarlariJson);

    // GPS modu degilse kullanicinin manuel secimini EZME
    if (konumAyarlari.konumModu !== 'oto') {
        Logger.info('KonumTakip', 'GPS modu aktif degil');
        return false;
    }

    const simdi = new Date().toISOString();

    // Son kaydedilen koordinatla karşılaştır: eşik altındaysa yalnız nabız yaz.
    const sonLat = konumAyarlari.koordinatlar?.lat;
    const sonLng = konumAyarlari.koordinatlar?.lng;

    if (sonLat && sonLng) {
        const mesafe = mesafeHesapla(sonLat, sonLng, yeniLat, yeniLng);
        Logger.info('KonumTakip', `Mesafe degisimi: ${(mesafe / 1000).toFixed(2)} km (esik: ${(esikMesafe / 1000).toFixed(0)} km)`);

        if (mesafe < esikMesafe) {
            Logger.info('KonumTakip', 'Mesafe esigi asilmadi, konum guncelleme atlanıyor');
            await AsyncStorage.setItem(KONUM_DEPOLAMA_ANAHTARI, JSON.stringify({
                ...konumAyarlari,
                sonGpsGuncellemesi: simdi,
                ...ekAlanlar,
            }));
            return false;
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
        Logger.warn('KonumTakip', 'Reverse geocoding hatasi:', geoError);
    }

    // Konum ayarlarini guncelle (bilinmeyen alanlar korunur)
    await AsyncStorage.setItem(KONUM_DEPOLAMA_ANAHTARI, JSON.stringify({
        ...konumAyarlari,
        koordinatlar: { lat: yeniLat, lng: yeniLng },
        gpsAdres: gpsAdres,
        sonGpsGuncellemesi: simdi,
        ...ekAlanlar,
    }));
    Logger.info('KonumTakip', 'Konum guncellendi');

    // =====================================================
    // ONEMLI: Konuma bagli TUM tuketicileri yeni konuma gore tazele
    // (muhafiz bildirimleri + TTS alarmlari + vakit bildirimleri + vakit/iftar/sahur
    // sayaclari + widget + hesaplayici). Hangi tuketicilerin var oldugu
    // `KonumDegisikligiServisi`'nin sorumlulugudur — burada TEK cagri durur ki
    // liste iki yerde yasayip ayrismasin.
    // =====================================================
    await konumDegistiUygula({ lat: yeniLat, lng: yeniLng });

    return true;
}

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
     *
     * Geofencing foreground service kullanmadığı için uygulamanın ön planda
     * olması GEREKMEZ (eski `startLocationUpdatesAsync` yolunda gerekiyordu);
     * bu yüzden AppState kapısı ve "ön plana gelince tekrar dene" mekanizması
     * kaldırılmıştır. İzin İSTEME adımları sistem arayüzü açtığı için yine de
     * kullanıcı tetikli akışlardan çağrılmalıdır; arka plandan onarım
     * `ArkaplanGorevServisi` üzerinden yapılır (izin ister değil, kontrol eder).
     *
     * @returns true ise basarili, false ise izin reddedildi veya hata olustu
     */
    public async baslat(): Promise<boolean> {
        try {
            // 1. Once foreground izni kontrol et ve iste
            const { status: mevcutOnPlanIzni } = await Location.getForegroundPermissionsAsync();
            Logger.info('KonumTakip', 'Mevcut on plan izni:', mevcutOnPlanIzni);

            if (mevcutOnPlanIzni !== 'granted') {
                const { status: onPlanIzni } = await Location.requestForegroundPermissionsAsync();
                if (onPlanIzni !== 'granted') {
                    Logger.info('KonumTakip', 'On plan izni reddedildi');
                    return false;
                }
            }

            // 2. Arka plan izni kontrol et
            const { status: mevcutArkaPlanIzni, canAskAgain } = await Location.getBackgroundPermissionsAsync();
            Logger.info('KonumTakip', 'Mevcut arka plan izni:', { izin: mevcutArkaPlanIzni, tekrarSorulabilir: canAskAgain });

            if (mevcutArkaPlanIzni !== 'granted') {
                // Android 11+ icin requestBackgroundPermissionsAsync() sistem ayarlarini acar
                Logger.info('KonumTakip', 'Arka plan izni isteniyor (Android 11+ icin ayarlar sayfasi acilacak)...');
                const { status: arkaPlanIzni } = await Location.requestBackgroundPermissionsAsync();
                Logger.info('KonumTakip', 'Arka plan izni sonucu:', arkaPlanIzni);

                if (arkaPlanIzni !== 'granted') {
                    Logger.info('KonumTakip', 'Arka plan izni reddedildi veya beklemede');
                    return false;
                }
            }

            // 3. Surum gecisi: eski foreground service'li gorev varsa durdur.
            await eskiTakipGoreviniTemizle();

            // 4. Aktif profili oku
            const profil = await aktifProfilGetir();
            Logger.info('KonumTakip', `Profil: yaricap=${profil.mesafe}m, dogruluk=${profil.dogruluk}`);

            // 5. Bolge merkezi icin taze konum al; alinamazsa kayitli koordinata dus.
            const merkez = await this.bolgeMerkeziniBelirle(profil);
            if (!merkez) {
                Logger.error('KonumTakip', 'Bolge merkezi belirlenemedi, takip baslatilamadi');
                return false;
            }

            await bolgeyiKaydet(merkez.lat, merkez.lng, profil.mesafe);

            // 6. Ayarlari kaydet
            await this.ayarlariKaydet({ aktif: true, sonKoordinatlar: null, sonGuncellemeTarihi: null });

            Logger.info('KonumTakip', 'Konum takibi (bolge izleme) baslatildi');
            return true;
        } catch (e) {
            Logger.error('KonumTakip', 'Baslama hatasi:', e);
            return false;
        }
    }

    /**
     * İzlenecek bölgenin merkezini belirler.
     *
     * Öncelik taze sabitlemededir; alınamazsa diskteki son koordinat kullanılır.
     * Kayıtlı koordinatla kurulan bölge, cihaz uzaktaysa anında bir çıkış olayı
     * üretir — bu İSTENEN davranıştır (olay yolu taze konumla merkezi düzeltir).
     */
    private async bolgeMerkeziniBelirle(
        profil: TakipProfilKonfigurasyonu,
    ): Promise<{ lat: number; lng: number } | null> {
        try {
            const konum = await Location.getCurrentPositionAsync({ accuracy: profil.dogruluk });
            if (konum?.coords) {
                return { lat: konum.coords.latitude, lng: konum.coords.longitude };
            }
        } catch (e) {
            Logger.warn('KonumTakip', 'Taze konum alinamadi, kayitli koordinata dusuluyor:', e);
        }

        try {
            const konumAyarlariJson = await AsyncStorage.getItem(KONUM_DEPOLAMA_ANAHTARI);
            if (konumAyarlariJson) {
                const konumAyarlari = JSON.parse(konumAyarlariJson);
                const lat = konumAyarlari.koordinatlar?.lat;
                const lng = konumAyarlari.koordinatlar?.lng;
                if (typeof lat === 'number' && typeof lng === 'number') {
                    return { lat, lng };
                }
            }
        } catch (e) {
            Logger.warn('KonumTakip', 'Kayitli koordinat okunamadi:', e);
        }

        return null;
    }

    /**
     * Konum takibini durdur
     */
    public async durdur(): Promise<void> {
        try {
            const kayitliMi = await TaskManager.isTaskRegisteredAsync(KONUM_GEOFENCE_GOREVI);
            if (kayitliMi) {
                await Location.stopGeofencingAsync(KONUM_GEOFENCE_GOREVI);
                Logger.info('KonumTakip', 'Bolge izleme durduruldu');
            }

            // Surum gecisi: eski gorev de kalmis olabilir.
            await eskiTakipGoreviniTemizle();

            // Ayarlari guncelle
            const mevcutAyarlar = await this.ayarlariGetir();
            await this.ayarlariKaydet({ ...mevcutAyarlar, aktif: false });
        } catch (e) {
            Logger.error('KonumTakip', 'Durdurma hatasi:', e);
        }
    }

    /**
     * Takip durumunu kontrol et
     *
     * `hasStartedGeofencingAsync` yerine `isTaskRegisteredAsync` kullanılır:
     * expo'nun geofencing sorgusu arka plan izni yoksa İSTİSNA FIRLATIR, görev
     * kaydı sorgusu ise sessizce cevap verir.
     */
    public async aktifMi(): Promise<boolean> {
        try {
            return await TaskManager.isTaskRegisteredAsync(KONUM_GEOFENCE_GOREVI);
        } catch (e) {
            Logger.warn('KonumTakip', 'aktifMi kontrol hatasi:', e);
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
            Logger.warn('KonumTakip', 'arkaPlanIzniVarMi kontrol hatasi:', e);
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
            Logger.warn('KonumTakip', 'Ayarlar okuma hatasi:', e);
        }
        return { aktif: false, sonKoordinatlar: null, sonGuncellemeTarihi: null };
    }

    /**
     * Konum takibini yeniden baslat
     * Uygulama on plana geldiginde cagrilmali
     *
     * Izin iptal senaryosu:
     * Kullanici sistem ayarlarindan izni iptal ettiyse, takibi graceful
     * olarak devre disi birakir ve ayarlari gunceller.
     */
    public async yenidenBaslat(): Promise<boolean> {
        try {
            const ayarlar = await this.ayarlariGetir();
            if (!ayarlar.aktif) {
                Logger.info('KonumTakip', 'Takip aktif degil, yeniden baslatma atlanıyor');
                return false;
            }

            // Izin iptal kontrolu - kullanici sistem ayarlarindan izni kaldirmis olabilir
            const arkaPlanIzniVar = await this.arkaPlanIzniVarMi();
            if (!arkaPlanIzniVar) {
                Logger.info('KonumTakip', 'Arka plan izni iptal edilmis, takip devre disi birakiliyor');
                await this.ayarlariKaydet({ ...ayarlar, aktif: false });
                return false;
            }

            // On plan izni de kontrol et
            try {
                const { status: onPlanIzni } = await Location.getForegroundPermissionsAsync();
                if (onPlanIzni !== 'granted') {
                    Logger.info('KonumTakip', 'On plan izni iptal edilmis, takip devre disi birakiliyor');
                    await this.ayarlariKaydet({ ...ayarlar, aktif: false });
                    return false;
                }
            } catch (e) {
                Logger.warn('KonumTakip', 'On plan izin kontrolu hatasi:', e);
            }

            Logger.info('KonumTakip', 'Konum takibi yeniden baslatiliyor...');
            return await this.baslat();
        } catch (e) {
            Logger.error('KonumTakip', 'Yeniden baslatma hatasi:', e);
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
            Logger.warn('KonumTakip', 'Son konum bilgisi okuma hatasi:', e);
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
