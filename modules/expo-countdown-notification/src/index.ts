import { requireOptionalNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

/**
 * Countdown notification configuration
 */
export interface CountdownConfig {
    /** Unique identifier for the countdown */
    id: string;
    /** Target time in milliseconds (epoch) */
    targetTimeMs: number;
    /** Notification title */
    title: string;
    /** Body template with {time} placeholder for countdown text */
    bodyTemplate: string;
    /** Android notification channel ID */
    channelId: string;
    /** Small icon resource name (optional, defaults to app icon) */
    smallIcon?: string;
    /** Theme type for the custom notification (optional, defaults to vakit) */
    themeType?: 'iftar' | 'vakit' | 'sahur' | 'seri';
    /**
     * Hedef aninda bildirim SISTEM tarafindan kaldirilsin mi? (`setTimeoutAfter`)
     *
     * Chronometer hedefte durmaz, sifiri gecince YUKARI sayar; JS'ten hedef anina
     * bir `stopCountdown` planlamanin yolu da yoktur (uygulama kapaliyken JS
     * kosmaz). Varsayilan `false` — mevcut sayaclarin (iftar/sahur/vakit)
     * davranisi birebir korunur.
     */
    autoDismissAtTarget?: boolean;
}

/**
 * Native kopru yuzeyi — `requireOptionalNativeModule` icin tip.
 *
 * Sadece bu dosyadan cagrilan fonksiyonlari listeler; genis tutmanin faydasi
 * yok, `any` ise tip guvenligini (ve lint butcesini) bozar.
 */
interface CountdownNativeModule {
    startCountdown(
        id: string,
        targetTimeMs: number,
        title: string,
        bodyTemplate: string,
        channelId: string,
        smallIcon: string,
        themeType: string,
        autoDismissAtTarget: boolean
    ): void;
    stopCountdown(id: string): void;
    stopAll(): void;
    planlaAnons(id: string, tetikZamanMs: number, metin: string): void;
    iptalEtAnons(id: string): void;
    iptalEtTumAnonslar(): void;
    trDestekleniyorMu(): Promise<boolean>;
    sesSecAsync(
        mevcutUri: string | null,
        baslik: string
    ): Promise<{ uri?: unknown; ad?: unknown } | null>;
    sesAdiAl(uri: string): Promise<unknown>;
    sesiOnizle(uri: string): Promise<void>;
    onizlemeyiDurdur(): Promise<void>;
    onizlemeCaliyorMu(): Promise<boolean>;
    muhafizKanaliniGarantile(
        kanalId: string,
        kanalAdi: string,
        aciklama: string,
        sesUri: string | null,
        acilMi: boolean,
        titresim: boolean
    ): Promise<void>;
    muhafizKanallariniTemizle(korunacakIdler: string[]): Promise<void>;
}

/**
 * KOPRU OPSIYONEL YUKLENIR — iOS ACILIS COKMESININ SEBEBI BUYDU.
 *
 * `requireNativeModule` MODUL YUKLENIRKEN (import aninda) calisir ve native
 * taraf bulunamazsa FIRLATIR. `expo-module.config.json` yalniz `android`
 * platformunu tanimlar → iOS'ta native modul YOKTUR → bu dosyayi import eden
 * herhangi bir modul (App.tsx zinciri `ArkaplanMuhafizServisi` uzerinden buraya
 * baglanir) iOS'ta uygulamayi ACILISTA COKERTIRDI. Asagidaki `Platform.OS`
 * kapilarinin hicbiri ise yaramaz, cunku cokme kapilar CALISMADAN once olur.
 *
 * `requireOptionalNativeModule` bulunamayinca `null` doner. Her fonksiyon artik
 * platform kapisina EK OLARAK null'a karsi da korunur (iki savunma birlikte:
 * kapi mantigi ileride degisse bile cokme geri gelmez).
 */
const ExpoCountdownNotification =
    requireOptionalNativeModule<CountdownNativeModule>('ExpoCountdownNotification');


/**
 * Geri sayan bir bildirim gosterir.
 *
 * MEKANIZMA (eski doc-yorumu "Foreground Service + CountDownTimer" diyordu, YANLIS
 * — modulde Service sinifi YOK): `NotificationManager.notify` ile ozel bir
 * `RemoteViews` gonderilir ve icindeki `Chronometer`
 * `setChronometerCountDown(true)` ile kurulur → sayaci SISTEM cizer, uygulama
 * saniye basi is yapmaz.
 *
 * BUNUN IKI SONUCU VAR:
 *  1. Pil gerekcesi yok — surec calismasa da sayac akmaya devam eder.
 *  2. Chronometer HEDEFTE DURMAZ: sifiri gecince yukari saymaya baslar. Hedefte
 *     kaybolmasi icin `autoDismissAtTarget: true` gecin — JS'ten hedef anina
 *     `stopCountdown` planlanamaz (uygulama kapaliyken JS kosmaz).
 *
 * @param config - Countdown configuration
 * @throws Error if platform is not Android
 */
export function startCountdown(config: CountdownConfig): void {
    if (Platform.OS !== 'android' || !ExpoCountdownNotification) {
        console.warn('[CountdownNotification] Only supported on Android');
        return;
    }

    ExpoCountdownNotification.startCountdown(
        config.id,
        config.targetTimeMs,
        config.title,
        config.bodyTemplate,
        config.channelId,
        config.smallIcon ?? '',
        config.themeType ?? 'vakit',
        config.autoDismissAtTarget ?? false
    );
}

/**
 * Stops a specific countdown notification by its ID.
 *
 * @param id - The countdown identifier to stop
 */
export function stopCountdown(id: string): void {
    if (Platform.OS !== 'android' || !ExpoCountdownNotification) return;
    ExpoCountdownNotification.stopCountdown(id);
}

/**
 * Stops all active countdown notifications and the foreground service.
 */
export function stopAll(): void {
    if (Platform.OS !== 'android' || !ExpoCountdownNotification) return;
    ExpoCountdownNotification.stopAll();
}

// ============================================================
// SESLI ANONS (muhafiz TTS)
// ============================================================
//
// Mimari: Foreground Service YOK. `planlaAnons` bir exact alarm kurar; alarm
// `AnonsReceiver`'i tetikler, receiver `goAsync()` penceresinde Turkce TTS ile
// konusur. Kisa anons (1-3 sn) bu pencereye sigar -> Android 14+ FGS type
// zorunlulugu ve Play Store red riski dogmaz.
//
// Bu fonksiyonlar HATA FIRLATABILIR (native cagri); cagiran taraf kendi
// Logger'i ile sarmali (bkz. ArkaplanMuhafizServisi).

/**
 * Belirtilen zamanda konusulacak sesli anons planlar.
 *
 * @param id Anons kimligi — iptal icin AYNI id kullanilir (bildirim ID'siyle eslesir)
 * @param tetikZamanMs Konusma zamani (epoch ms)
 * @param metin Seslendirilecek metin — yer tutuculari COZULMUS olmali ({vakit}/{süre})
 */
export function planlaAnons(id: string, tetikZamanMs: number, metin: string): void {
    if (Platform.OS !== 'android' || !ExpoCountdownNotification) return;
    // Bos metin native tarafta da elenir; gereksiz kopru gecisini burada kes.
    if (!id || !metin || metin.trim().length === 0) return;
    ExpoCountdownNotification.planlaAnons(id, tetikZamanMs, metin);
}

/**
 * Tek bir planli anonsu iptal eder. Kayitli olmayan id zararsizdir (no-op).
 */
export function iptalEtAnons(id: string): void {
    if (Platform.OS !== 'android' || !ExpoCountdownNotification) return;
    if (!id) return;
    ExpoCountdownNotification.iptalEtAnons(id);
}

/**
 * Planlanmis TUM anonslari iptal eder (yeniden planlama oncesi temizlik).
 */
export function iptalEtTumAnonslar(): void {
    if (Platform.OS !== 'android' || !ExpoCountdownNotification) return;
    ExpoCountdownNotification.iptalEtTumAnonslar();
}

/**
 * Cihazda Turkce TTS dil verisi kurulu mu?
 * Android disinda ve hata durumunda `false` doner (asla firlatmaz).
 */
export async function trDestekleniyorMu(): Promise<boolean> {
    if (Platform.OS !== 'android' || !ExpoCountdownNotification) return false;
    try {
        return (await ExpoCountdownNotification.trDestekleniyorMu()) === true;
    } catch {
        return false;
    }
}

// ============================================================
// BILDIRIM SESI SECIMI (sistem ses secici + kanal yonetimi)
// ============================================================
//
// IZIN YOK: `RingtoneManager.ACTION_RINGTONE_PICKER` hicbir izin istemez ve
// kullanicinin kendi ekledigi sesleri de listeler. Bu yuzden ne yeni manifest
// izni ne de "prominent disclosure" modali gerekir.

export interface SecilenSes {
    /** `content://...` — dogrudan bildirim kanalinin sesi olur */
    uri: string;
    /** Kullaniciya gosterilecek ad; cozulemezse bos string */
    ad: string;
}

/**
 * Sistem ses secicisini acar. Kullanici vazgecerse (veya Android disinda)
 * `null` doner. Asla firlatmaz — ekran akisi bir secici yuzunden dusmemeli.
 *
 * @param mevcutUri Halihazirda secili ses (secicide isaretlenir)
 * @param baslik Secici ekraninin basligi
 */
export async function sesSec(
    mevcutUri: string | null,
    baslik: string
): Promise<SecilenSes | null> {
    if (Platform.OS !== 'android' || !ExpoCountdownNotification) return null;
    try {
        const sonuc = await ExpoCountdownNotification.sesSecAsync(mevcutUri ?? null, baslik);
        if (!sonuc || typeof sonuc.uri !== 'string' || sonuc.uri.length === 0) return null;
        return { uri: sonuc.uri, ad: typeof sonuc.ad === 'string' ? sonuc.ad : '' };
    } catch {
        return null;
    }
}

/**
 * URI'nin gosterilecek adini cozer (ses silinmis/erisilemezse bos string).
 * Kayitli bir secimin adi diskte yoksa bunu kullanin.
 */
export async function sesAdiAl(uri: string): Promise<string> {
    if (Platform.OS !== 'android' || !ExpoCountdownNotification || !uri) return '';
    try {
        const ad = await ExpoCountdownNotification.sesAdiAl(uri);
        return typeof ad === 'string' ? ad : '';
    } catch {
        return '';
    }
}

// NATIVE TARAFTA HEPSI `AsyncFunction` — `Function` olsalardi JS THREAD'INDE
// SENKRON calisirlardi ve `RingtoneManager`/`MediaPlayer.prepare` (senkron I/O)
// ile `NotificationManager` binder cagrilari arayuzu dondururdu (ANR riski).
// Bu yuzden asagidakiler `Promise` doner; cagiran taraf `await`lemeli.

/**
 * `content://` sesini aninda calar (onizleme).
 * `expo-audio`'nun bu semayi calabildigi dogrulanmadigi icin native yol kullanilir.
 */
export async function sesiOnizle(uri: string): Promise<void> {
    if (Platform.OS !== 'android' || !ExpoCountdownNotification || !uri) return;
    await ExpoCountdownNotification.sesiOnizle(uri);
}

/** Calan ses onizlemesini durdurur (idempotent). */
export async function onizlemeyiDurdur(): Promise<void> {
    if (Platform.OS !== 'android' || !ExpoCountdownNotification) return;
    await ExpoCountdownNotification.onizlemeyiDurdur();
}

/**
 * Native ses onizlemesi HALA caliyor mu?
 *
 * Kullanicinin sectigi ses rastgele uzunlukta olabilir (3 dakikalik bir muzik
 * dahil); sesli anonsu sabit bir gecikmeyle ustune bindirmemek icin bitis
 * yoklanir. Asla firlatmaz — bilinmiyorsa `false` (bekleme uzamasin).
 */
export async function onizlemeCaliyorMu(): Promise<boolean> {
    if (Platform.OS !== 'android' || !ExpoCountdownNotification) return false;
    try {
        return (await ExpoCountdownNotification.onizlemeCaliyorMu()) === true;
    } catch {
        return false;
    }
}

/**
 * Hash'li muhafiz kanalini YOKSA olusturur.
 *
 * Kanal sesi de TITRESIMI de olusturulduktan sonra DEGISTIRILEMEZ, silip yeniden
 * olusturmak da tombstone'a takilir → kanal id'si (ses + titresim) hash'inden
 * uretilir (bkz. `core/muhafiz/sesKimligi.ts`) ve boyle bir degisiklik ihtiyaci
 * hic dogmaz.
 *
 * `sesUri` NULL ise kanal paketlenmis varsayilan sesle (res/raw/bildirim) kurulur —
 * taban kanallarla ayni ses. 'varsayilan' DIZESINI buraya gecirme: native taraf
 * `Uri.parse` ile olu bir ses kurar.
 */
export async function muhafizKanaliniGarantile(
    kanalId: string,
    kanalAdi: string,
    aciklama: string,
    sesUri: string | null,
    acilMi: boolean,
    titresim: boolean = false
): Promise<void> {
    if (Platform.OS !== 'android' || !ExpoCountdownNotification || !kanalId) return;
    await ExpoCountdownNotification.muhafizKanaliniGarantile(
        kanalId,
        kanalAdi,
        aciklama,
        sesUri ?? null,
        acilMi,
        titresim
    );
}

/**
 * Artik referans verilmeyen hash'li muhafiz kanallarini siler.
 * TABAN kanallara (`muhafiz`, `muhafiz_acil`) dokunmaz.
 */
export async function muhafizKanallariniTemizle(korunacakIdler: string[]): Promise<void> {
    if (Platform.OS !== 'android' || !ExpoCountdownNotification) return;
    await ExpoCountdownNotification.muhafizKanallariniTemizle(korunacakIdler);
}
