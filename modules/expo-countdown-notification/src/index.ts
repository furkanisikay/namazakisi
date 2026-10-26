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
    /**
     * Android 16 Live Update (issue #282) — durum cubugu cipi ve One UI 8 Now Bar.
     *
     * Verilirse native taraf, API 36+ ve kullanici "Canli guncellemeler"e izin
     * veriyorsa STANDART sablonlu ikiz bildirimi (kisa metin + chronometer +
     * ProgressStyle + "Kildim") gonderir. Aksi halde (API < 36, izin kapali, seri
     * temasi) mevcut ozel RemoteViews yolu BIREBIR calisir. Hangi sayacin
     * verecegine `src/core/sayac/canliGuncelleme.ts` karar verir.
     */
    canli?: CanliGuncellemeSecenekleri;
}

/** Ilerleme cubugunun bir bolumu (dakika). */
export interface CanliIlerlemeBolumu {
    uzunlukDk: number;
    vurgulu: boolean;
}

export interface CanliGuncellemeSecenekleri {
    /** Ilerleme cubugunun basladigi an (epoch ms). Bolum yoksa kullanilmaz. */
    baslangicMs: number;
    /** Ilerleme bolumleri (toplam = baslangic → hedef, dk). Bossa cubuk cizilmez. */
    bolumler: CanliIlerlemeBolumu[];
    /** Yalniz vakit sayacinda: "Kildim" eylemi (ortak Kildim kuyruguna gider). */
    kildim?: { tarih: string; vakit: string };
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
    /** Expo `Function` en fazla 8 arguman alir → ek veri tek JSON'da (bkz. Kotlin). */
    startCountdownCanli?(
        id: string,
        targetTimeMs: number,
        title: string,
        bodyTemplate: string,
        channelId: string,
        smallIcon: string,
        themeType: string,
        ekJson: string
    ): void;
    stopCountdown(id: string): void;
    stopAll(): void;
    planlaAnons(id: string, tetikZamanMs: number, metin: string): void;
    /** Yeni köprü — eski native'de yoktur, opsiyonel tiplenir. */
    anonsDiliniAyarla?(dil: string): void;
    arayuzDiliniAyarla?(kod: string): void;
    vakitAdlariniAyarla?(json: string | null): void;
    rakamSisteminiAyarla?(kod: string | null): void;
    iptalEtAnons(id: string): void;
    iptalEtTumAnonslar(): void;
    /** Yeni köprü (issue #273) — eski native'de yoktur, opsiyonel tiplenir. */
    iptalEtOnekliAnonslar?(onek: string): number;
    bekleyenAnonsSayisi?(): Promise<number | null>;
    trDestekleniyorMu(): Promise<boolean | null>;
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
    /** "Kendi dosyanızdan" + vakit bildirimi sesi — eski native ikili TAŞIMAZ (opsiyonel). */
    sesDosyasiDestekleniyor?(): boolean;
    sesDosyasiSecAsync?(): Promise<{ uri?: unknown; ad?: unknown; hata?: unknown } | null>;
    vakitKanaliniGarantile?(kanalId: string, kanalAdi: string, aciklama: string, sesUri: string): Promise<void>;
    vakitKanallariniTemizle?(korunacakIdler: string[]): Promise<void>;
    /** Now Bar planı (issue #282 ikinci aşama) — eski native ikili TAŞIMAZ (opsiyonel). */
    canliDurumu?(): Promise<string>;
    canliPlaniKur?(json: string): Promise<void>;
    canliAyarlariniAc?(): Promise<string | null>;
    /** Now Bar tanısı (JSON) — eski native ikili TAŞIMAZ (opsiyonel). */
    canliTani?(): Promise<string | null>;
    pilOptimizasyonuMuafMi(): Promise<boolean | null>;
    pilAyarlariniAc(): Promise<string | null>;
    samsungMu(): boolean | null;
    /** Sade tasarım (Dalga 1) — eski native ikili TAŞIMAZ (opsiyonel). */
    androidTamSurum?(): number | null;
    alarmSesDuzeyi?(): Promise<number>;
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

    // Eski native ikili (bu surumden once derlenmis APK) `startCountdownCanli`yi
    // tasimaz → eski yola dus, sayac kaybolmasin.
    if (config.canli && typeof ExpoCountdownNotification.startCountdownCanli === 'function') {
        ExpoCountdownNotification.startCountdownCanli(
            config.id,
            config.targetTimeMs,
            config.title,
            config.bodyTemplate,
            config.channelId,
            config.smallIcon ?? '',
            config.themeType ?? 'vakit',
            JSON.stringify({
                baslangicMs: config.canli.baslangicMs,
                bolumler: config.canli.bolumler,
                kildim: config.canli.kildim,
                hedefteKaybol: config.autoDismissAtTarget ?? false,
            })
        );
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
 * Kimliği [onek] ile başlayan planlı anonsları iptal eder (issue #273).
 *
 * Muhafız (`muhafiz_`) ve nafile (`nafile_`) anonsları AYNI native kayıtta
 * yaşar; birinin yeniden planlaması ötekinin anonslarını silmemeli. Nafile
 * "Kıldım"ı da bununla o günün o nafilesinin kalan anonslarını susturur.
 *
 * @returns iptal YAPILABİLDİYSE true (Android dışında yapılacak iş olmadığı
 *   için de true). Native fonksiyon yoksa (eski köprü) false — çağıran kendi
 *   yedek yoluna düşer.
 */
export function iptalEtOnekliAnonslar(onek: string): boolean {
    if (Platform.OS !== 'android') return true;
    if (!onek || !ExpoCountdownNotification?.iptalEtOnekliAnonslar) return false;
    ExpoCountdownNotification.iptalEtOnekliAnonslar(onek);
    return true;
}

/**
 * Bekleyen (gelecekteki) sesli anons alarmi sayisi — bildirim siniri
 * rehberinin cihaz olcumu (issue #298). `null` = bilinmiyor (Android disi,
 * eski build, hata). Asla firlatmaz.
 */
export async function bekleyenAnonsSayisi(): Promise<number | null> {
    if (Platform.OS !== 'android' || !ExpoCountdownNotification?.bekleyenAnonsSayisi) return null;
    try {
        const sayi = await ExpoCountdownNotification.bekleyenAnonsSayisi();
        return typeof sayi === 'number' && Number.isFinite(sayi) ? sayi : null;
    } catch {
        return null;
    }
}

// ============================================================
// NOW BAR / CANLI SAYAC PLANI (issue #282 ikinci asama)
// ============================================================

/**
 * Android 16 one cikarma durumu:
 * - `desteklenmiyor`: Android disi, API < 36 ya da bu surumden eski native ikili
 *   (plan fonksiyonlari yok) → sayaclar ESKI yolunda kalir.
 * - `kapali`: kullanici sistemde "Canli guncellemeler"i kapatti.
 * - `acik`: planlayici Now Bar'i yonetir.
 * Asla firlatmaz.
 */
export type CanliDurum = 'desteklenmiyor' | 'kapali' | 'acik';

export async function canliDurumu(): Promise<CanliDurum> {
    if (
        Platform.OS !== 'android' ||
        !ExpoCountdownNotification?.canliDurumu ||
        !ExpoCountdownNotification.canliPlaniKur
    ) {
        return 'desteklenmiyor';
    }
    try {
        const sonuc = await ExpoCountdownNotification.canliDurumu();
        return sonuc === 'acik' || sonuc === 'kapali' ? sonuc : 'desteklenmiyor';
    } catch {
        return 'desteklenmiyor';
    }
}

/**
 * Now Bar / Live Update tanisinin HAM JSON'u (alanlar Kotlin
 * `cekirdek/CanliTaniKurallari.taniJsonu` ile kilitli; cozumu
 * `src/core/sayac/canliTani.ts > canliTaniCoz`). Android disi, eski native ikili
 * ya da hata → `null`. Asla firlatmaz.
 */
export async function canliTaniHam(): Promise<string | null> {
    if (Platform.OS !== 'android' || !ExpoCountdownNotification?.canliTani) return null;
    try {
        const sonuc = await ExpoCountdownNotification.canliTani();
        return typeof sonuc === 'string' ? sonuc : null;
    } catch {
        return null;
    }
}

/**
 * Planlayicinin olay listesini native'e verir (saklar, su anki hali uygular, tek
 * alarm zincirini kurar). Native taraf yoksa `false`. Asla firlatmaz.
 */
export async function canliPlaniKur(json: string): Promise<boolean> {
    if (Platform.OS !== 'android' || !ExpoCountdownNotification?.canliPlaniKur) return false;
    try {
        await ExpoCountdownNotification.canliPlaniKur(json);
        return true;
    } catch {
        return false;
    }
}

export type AcilanCanliEkrani = 'canli' | 'bildirim' | 'uygulama';

/**
 * Sistemdeki "Canli guncellemeler" ayarini acar (yoksa uygulamanin bildirim
 * ayarlari, o da yoksa uygulama bilgisi). Izin ISTEMEZ. Asla firlatmaz.
 */
export async function canliAyarlariniAc(): Promise<AcilanCanliEkrani | null> {
    if (Platform.OS !== 'android' || !ExpoCountdownNotification?.canliAyarlariniAc) return null;
    try {
        const sonuc = await ExpoCountdownNotification.canliAyarlariniAc();
        return sonuc === 'canli' || sonuc === 'bildirim' || sonuc === 'uygulama' ? sonuc : null;
    } catch {
        return null;
    }
}

// ============================================================
// PIL KISITI (Doze + Samsung "uyuyan uygulamalar")
// ============================================================

/**
 * Uygulama pil optimizasyonundan muaf mi? `null` = bilinmiyor (Android disi,
 * eski build, hata) → ekran uyari GOSTERMEMELI (yanlis alarm, hic uyarmamaktan
 * kotudur). Asla firlatmaz.
 */
export async function pilOptimizasyonuMuafMi(): Promise<boolean | null> {
    if (Platform.OS !== 'android' || !ExpoCountdownNotification?.pilOptimizasyonuMuafMi) return null;
    try {
        const sonuc = await ExpoCountdownNotification.pilOptimizasyonuMuafMi();
        return typeof sonuc === 'boolean' ? sonuc : null;
    } catch {
        return null;
    }
}

export type AcilanPilEkrani = 'uygulama' | 'pil';

/**
 * Uygulama bilgisi ekranini acar (Pil → Kisitlanmamis); olmazsa pil
 * optimizasyonu listesini. Izin ISTEMEZ. Acilan ekrani dondurur; hicbiri
 * acilamazsa `null`. Asla firlatmaz. Samsung'un "Asla uyumayan" listesi BILINCLI
 * hedef degil: okunamayan ayri bir durumdur (PilAyarlari.kt).
 */
export async function pilAyarlariniAc(): Promise<AcilanPilEkrani | null> {
    if (Platform.OS !== 'android' || !ExpoCountdownNotification?.pilAyarlariniAc) return null;
    try {
        const sonuc = await ExpoCountdownNotification.pilAyarlariniAc();
        return sonuc === 'pil' || sonuc === 'uygulama' ? sonuc : null;
    } catch {
        return null;
    }
}

/**
 * Cihaz Samsung mu? Android disinda `false` (KESIN: iPhone Samsung degildir).
 * Android'de modul yok / eski build / hata → `null` (BILINMIYOR): "Samsung degil" demek
 * Samsung kullanicisina ozel rehberi (Rutinler, uyku listesi) yanlislikla gizlerdi.
 */
export function samsungMu(): boolean | null {
    if (Platform.OS !== 'android') return false;
    if (!ExpoCountdownNotification?.samsungMu) return null;
    try {
        const deger = ExpoCountdownNotification.samsungMu();
        return typeof deger === 'boolean' ? deger : null;
    } catch {
        return null;
    }
}

/**
 * Android tam sürümü (`SDK_INT_FULL`, API 36+; QPR2 = 3600001). Bilinmiyorsa `null`.
 * Ayrıştırma saf çekirdekte: `core/cihaz/surum.ts > androidTamSurumCoz`.
 */
export function androidTamSurum(): number | null {
    if (Platform.OS !== 'android' || !ExpoCountdownNotification?.androidTamSurum) return null;
    try {
        const deger = ExpoCountdownNotification.androidTamSurum();
        return typeof deger === 'number' ? deger : null;
    } catch {
        return null;
    }
}

/**
 * Alarm ses düzeyi 0'dan büyük mü (STREAM_ALARM)? Android dışında, eski ikilide ve
 * okunamazsa `null` (bilinmiyor → ekran susar).
 */
export async function alarmSesiAcikMi(): Promise<boolean | null> {
    if (Platform.OS !== 'android' || !ExpoCountdownNotification?.alarmSesDuzeyi) return null;
    try {
        const duzey = await ExpoCountdownNotification.alarmSesDuzeyi();
        return typeof duzey === 'number' && duzey >= 0 ? duzey > 0 : null;
    } catch {
        return null;
    }
}

/**
 * Arayüz dili ("tr", "en"): Android widget, bildirim ve alarm metinleri bunu okur. Native
 * eski ise sessizce atlanır (Türkçe kalır). Asla fırlatmaz.
 */
export function arayuzDiliniAyarla(kod: string): void {
    if (Platform.OS !== 'android' || !ExpoCountdownNotification?.arayuzDiliniAyarla) return;
    try {
        ExpoCountdownNotification.arayuzDiliniAyarla(kod);
    } catch {
        // Eski native: widget/bildirim Türkçe kalır.
    }
}

/**
 * Kullanıcının seçtiği vakit adı takımı (JSON: `{"adlar":{imsak…yatsi},"buyuk":{…},"kucuk":{…},
 * "cuma","imsakVakti","gunesDogusu"}`) ya da `null` (dil tablosuna dön). Android widget,
 * bildirim, kısayol ve asistan vakit adını önce buradan okur. Native eski ise sessizce
 * atlanır. Asla fırlatmaz.
 */
export function vakitAdlariniAyarla(json: string | null): void {
    if (Platform.OS !== 'android' || !ExpoCountdownNotification?.vakitAdlariniAyarla) return;
    try {
        ExpoCountdownNotification.vakitAdlariniAyarla(json);
    } catch {
        // Eski native: dil tablosundaki adlar kalır.
    }
}

/**
 * Arayüzün rakam sistemi: `'arab'` (Doğu Arap rakamı, ٠١٢٣) ya da `null` (anahtar silinir, Batı
 * rakamı). JS etkin dil/ülke/seçimden çözülmüş değeri yazar (`core/dil/rakam`). Native okuyan
 * taraf henüz yok. Native eski ise sessizce atlanır. Asla fırlatmaz.
 */
export function rakamSisteminiAyarla(kod: string | null): void {
    if (Platform.OS !== 'android' || !ExpoCountdownNotification?.rakamSisteminiAyarla) return;
    try {
        ExpoCountdownNotification.rakamSisteminiAyarla(kod);
    } catch {
        // Eski native: Batı rakamı kalır.
    }
}

/**
 * Planli anonslarin konusma dili (BCP-47, ör. "en-US"). Native eski ise (fonksiyon yok)
 * sessizce atlanir: anons Turkce konusur. Asla firlatmaz.
 */
export function anonsDiliniAyarla(dil: string): void {
    if (Platform.OS !== 'android' || !ExpoCountdownNotification?.anonsDiliniAyarla) return;
    try {
        ExpoCountdownNotification.anonsDiliniAyarla(dil);
    } catch {
        // Eski native ya da bağlam yok: anons varsayılan dilde kalır.
    }
}

/**
 * Cihazda anons dilinin (kayitli tercih; varsayilan Turkce) TTS verisi kurulu mu?
 * UC DURUMLU, asla firlatmaz:
 *   `true`  → kurulu, `false` → motor dili GERCEKTEN desteklemiyor (uyari gosterilir),
 *   `null`  → bilinmiyor: Android disi, modul yok, native zaman asimi / motor acilamadi /
 *             hata. "Yok" demek, yavas acilan TTS motorunda yanlis uyari yakardi.
 */
export async function trDestekleniyorMu(): Promise<boolean | null> {
    if (Platform.OS !== 'android' || !ExpoCountdownNotification) return null;
    try {
        const deger = await ExpoCountdownNotification.trDestekleniyorMu();
        return typeof deger === 'boolean' ? deger : null;
    } catch {
        return null;
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

// ============================================================
// "KENDİ DOSYANIZDAN SEÇİN" + VAKİT BİLDİRİMİ SESİ
// ============================================================

/** İçe aktarma hatası: `bicim` (ses değil/çözülemedi), `boyut` (>20 MB), `sure` (>8 dk),
 * `erisim`, `yazilamadi`, `desteklenmiyor`. */
export type SesDosyasiHatasi = 'bicim' | 'boyut' | 'sure' | 'erisim' | 'yazilamadi' | 'desteklenmiyor';

export type SesDosyasiSonucu = SecilenSes | { hata: SesDosyasiHatasi };

/** Bu cihazda "kendi dosyanızdan" yolu var mı? (Android 10+ ve yeni native ikili) */
export function sesDosyasiDestekleniyor(): boolean {
    if (Platform.OS !== 'android' || !ExpoCountdownNotification?.sesDosyasiDestekleniyor) return false;
    try {
        return ExpoCountdownNotification.sesDosyasiDestekleniyor() === true;
    } catch {
        return false;
    }
}

const HATALAR: readonly SesDosyasiHatasi[] = ['bicim', 'boyut', 'sure', 'erisim', 'yazilamadi', 'desteklenmiyor'];

/**
 * Belge seçicisini açar, seçilen dosyayı doğrulayıp kalıcı bildirim sesi yapar
 * (MediaStore › Bildirimler/NamazAkisi). Vazgeçilirse `null`. Asla fırlatmaz.
 */
export async function sesDosyasiSec(): Promise<SesDosyasiSonucu | null> {
    if (!sesDosyasiDestekleniyor() || !ExpoCountdownNotification?.sesDosyasiSecAsync) return null;
    try {
        const sonuc = await ExpoCountdownNotification.sesDosyasiSecAsync();
        if (!sonuc) return null;
        if (typeof sonuc.uri === 'string' && sonuc.uri.length > 0) {
            return { uri: sonuc.uri, ad: typeof sonuc.ad === 'string' ? sonuc.ad : '' };
        }
        const hata = HATALAR.find((h) => h === sonuc.hata) ?? 'yazilamadi';
        return { hata };
    } catch {
        return { hata: 'yazilamadi' };
    }
}

/** Vakit bildirimi kanalını YOKSA kurar (`vakit_bildirim_<hash8>`). */
export async function vakitKanaliniGarantile(
    kanalId: string,
    kanalAdi: string,
    aciklama: string,
    sesUri: string
): Promise<boolean> {
    if (Platform.OS !== 'android' || !ExpoCountdownNotification?.vakitKanaliniGarantile) return false;
    await ExpoCountdownNotification.vakitKanaliniGarantile(kanalId, kanalAdi, aciklama, sesUri);
    return true;
}

/** Kullanılmayan `vakit_bildirim_*` kanallarını siler. */
export async function vakitKanallariniTemizle(korunacakIdler: string[]): Promise<void> {
    if (Platform.OS !== 'android' || !ExpoCountdownNotification?.vakitKanallariniTemizle) return;
    await ExpoCountdownNotification.vakitKanallariniTemizle(korunacakIdler);
}
