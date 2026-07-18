import { NativeModulesProxy, requireNativeModule } from 'expo-modules-core';
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
    themeType?: 'iftar' | 'vakit' | 'sahur';
}

const ExpoCountdownNotification = requireNativeModule('ExpoCountdownNotification');

/**
 * Starts a countdown notification that displays remaining time in the notification body.
 * Uses native Android Foreground Service + CountDownTimer for battery-efficient updates.
 *
 * @param config - Countdown configuration
 * @throws Error if platform is not Android
 */
export function startCountdown(config: CountdownConfig): void {
    if (Platform.OS !== 'android') {
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
        config.themeType ?? 'vakit'
    );
}

/**
 * Stops a specific countdown notification by its ID.
 *
 * @param id - The countdown identifier to stop
 */
export function stopCountdown(id: string): void {
    if (Platform.OS !== 'android') return;
    ExpoCountdownNotification.stopCountdown(id);
}

/**
 * Stops all active countdown notifications and the foreground service.
 */
export function stopAll(): void {
    if (Platform.OS !== 'android') return;
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
    if (Platform.OS !== 'android') return;
    // Bos metin native tarafta da elenir; gereksiz kopru gecisini burada kes.
    if (!id || !metin || metin.trim().length === 0) return;
    ExpoCountdownNotification.planlaAnons(id, tetikZamanMs, metin);
}

/**
 * Tek bir planli anonsu iptal eder. Kayitli olmayan id zararsizdir (no-op).
 */
export function iptalEtAnons(id: string): void {
    if (Platform.OS !== 'android') return;
    if (!id) return;
    ExpoCountdownNotification.iptalEtAnons(id);
}

/**
 * Planlanmis TUM anonslari iptal eder (yeniden planlama oncesi temizlik).
 */
export function iptalEtTumAnonslar(): void {
    if (Platform.OS !== 'android') return;
    ExpoCountdownNotification.iptalEtTumAnonslar();
}

/**
 * Cihazda Turkce TTS dil verisi kurulu mu?
 * Android disinda ve hata durumunda `false` doner (asla firlatmaz).
 */
export async function trDestekleniyorMu(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
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
    if (Platform.OS !== 'android') return null;
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
    if (Platform.OS !== 'android' || !uri) return '';
    try {
        const ad = await ExpoCountdownNotification.sesAdiAl(uri);
        return typeof ad === 'string' ? ad : '';
    } catch {
        return '';
    }
}

/**
 * `content://` sesini aninda calar (onizleme).
 * `expo-audio`'nun bu semayi calabildigi dogrulanmadigi icin native yol kullanilir.
 */
export function sesiOnizle(uri: string): void {
    if (Platform.OS !== 'android' || !uri) return;
    ExpoCountdownNotification.sesiOnizle(uri);
}

/** Calan ses onizlemesini durdurur (idempotent). */
export function onizlemeyiDurdur(): void {
    if (Platform.OS !== 'android') return;
    ExpoCountdownNotification.onizlemeyiDurdur();
}

/**
 * Ozel sesli muhafiz kanalini YOKSA olusturur.
 *
 * Kanal sesi olusturulduktan sonra DEGISTIRILEMEZ, silip yeniden olusturmak da
 * tombstone'a takilir → kanal id'si sesin hash'inden uretilir (bkz.
 * `core/muhafiz/sesKimligi.ts`) ve boyle bir degisiklik ihtiyaci hic dogmaz.
 */
export function muhafizKanaliniGarantile(
    kanalId: string,
    kanalAdi: string,
    aciklama: string,
    sesUri: string | null,
    acilMi: boolean
): void {
    if (Platform.OS !== 'android' || !kanalId) return;
    ExpoCountdownNotification.muhafizKanaliniGarantile(
        kanalId,
        kanalAdi,
        aciklama,
        sesUri ?? null,
        acilMi
    );
}

/**
 * Artik referans verilmeyen hash'li muhafiz kanallarini siler.
 * TABAN kanallara (`muhafiz`, `muhafiz_acil`) dokunmaz.
 */
export function muhafizKanallariniTemizle(korunacakIdler: string[]): void {
    if (Platform.OS !== 'android') return;
    ExpoCountdownNotification.muhafizKanallariniTemizle(korunacakIdler);
}
