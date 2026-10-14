/**
 * SIRI / KISAYOLLAR / ODAK — iOS köprüsü (JS tarafı, issue #279).
 *
 * App Intents ana uygulama hedefinde (`targets/siri-kisayollari`); bu modül onların
 * okuduğu/yazdığı `UserDefaults` deposuna (`SiriDeposu`) JS'ten erişir.
 *
 * Fonksiyon adları Android modülleriyle AYNIDIR, böylece mevcut servisler iOS'ta
 * da aynı arayüzü kullanır:
 *   - `WidgetServisi`        → `vakitlerKaydet` / `kilinanlarKaydet` (Android `WidgetVeri`)
 *   - `KildimKuyruguServisi` → `bekleyenleriAl` / `tamamlandi` / `basarisiz` (Android `KildimKuyrugu`)
 *
 * KÖPRÜ OPSİYONEL YÜKLENİR (`expo-muhafiz-anons` deseni): modül yalnız iOS'ta vardır;
 * `requireNativeModule` Android'de açılışta FIRLATIRDI. Jest'te `__mocks__` devreye
 * girer (varsayılan: modül yok). HİÇBİRİ FIRLATMAZ.
 */
import { requireOptionalNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

/** Uygulama açıkken intent bir şey yazınca gelen olayın türü. */
export type SiriDegisiklikTuru = 'kildim' | 'odak' | 'ekran';

interface Abonelik {
    remove(): void;
}

interface SiriNativeModule {
    vakitlerKaydet(json: string): void;
    kilinanlarKaydet(json: string): void;
    bekleyenleriAl(): Promise<string>;
    tamamlandi(id: string): Promise<void>;
    basarisiz(id: string): Promise<void>;
    odakDurumuAl(): Promise<string | null>;
    ekranIstegiAl(): Promise<string | null>;
    /** #295 — eski ikilide yok (opsiyonel). */
    canliEtkinlikDestekli?(): boolean;
    canliEtkinlikIzniAcik?(): Promise<boolean>;
    canliEtkinlikEsitle?(json: string | null): Promise<string>;
    /** #285 Apple Watch — eski ikilide yok (opsiyonel). */
    saatDestekli?(): boolean;
    saatDurumGonder?(json: string): Promise<string>;
    addListener(olay: 'onSiriDegisikligi', dinleyici: (veri: { tur?: string }) => void): Abonelik;
}

const ExpoSiriKisayollari = requireOptionalNativeModule<SiriNativeModule>('ExpoSiriKisayollari');

const modul = (): SiriNativeModule | null =>
    Platform.OS === 'ios' && ExpoSiriKisayollari ? ExpoSiriKisayollari : null;

/** Widget yükü arayüzü (Android `WidgetVeri` ile aynı). iOS'ta Siri'nin okuduğu çizelge. */
export interface SiriVeriYazici {
    vakitlerKaydet(json: string): void;
    kilinanlarKaydet(json: string): void;
}

/** "Kıldım" kuyruğu arayüzü (Android `KildimKuyrugu` ile aynı). */
export interface SiriKildimKuyrugu {
    bekleyenleriAl(): Promise<string>;
    tamamlandi(id: string): Promise<void>;
    basarisiz(id: string): Promise<void>;
}

/** iOS'ta Siri çizelgesi yazıcısı; modül yoksa `null`. */
export function siriVeriYazici(): SiriVeriYazici | null {
    return modul();
}

/** iOS'ta Siri "Kıldım" kuyruğu; modül yoksa `null`. */
export function siriKildimKuyrugu(): SiriKildimKuyrugu | null {
    return modul();
}

/** Odak filtresinin son durumu (ham JSON); yoksa `null`. Çözümü: `core/muhafiz/ios/odakFiltresi`. */
export async function siriOdakDurumuAl(): Promise<string | null> {
    const m = modul();
    if (!m) return null;
    try {
        return (await m.odakDurumuAl()) ?? null;
    } catch {
        return null;
    }
}

/** Bekleyen ekran isteğini TÜKETİR (ör. `'kible'`); yoksa `null`. */
export async function siriEkranIstegiAl(): Promise<string | null> {
    const m = modul();
    if (!m) return null;
    try {
        return (await m.ekranIstegiAl()) ?? null;
    } catch {
        return null;
    }
}

/**
 * Uygulama açıkken intent'in yazdıklarını dinler. Aboneliği kaldıran fonksiyonu döner
 * (modül yoksa no-op).
 */
export function siriDegisikliginiDinle(dinleyici: (tur: SiriDegisiklikTuru) => void): () => void {
    const m = modul();
    if (!m) return () => undefined;
    try {
        const abonelik = m.addListener('onSiriDegisikligi', (veri) => {
            const tur = veri?.tur;
            if (tur === 'kildim' || tur === 'odak' || tur === 'ekran') dinleyici(tur);
        });
        return () => abonelik.remove();
    } catch {
        return () => undefined;
    }
}

// ---------------------------------------------------------------------------
// Canlı etkinlik (Live Activity — Dinamik Ada / kilit ekranı, issue #295)
// ---------------------------------------------------------------------------

/** Native'e giden istenen etkinlik (Swift `CanliEtkinlikKoprusu.Istek` ile aynı alanlar). */
export interface CanliEtkinlikIstegi {
    id: string;
    baslik: string;
    ad: string;
    baslangicMs: number;
    hedefMs: number;
    tema: string;
    kildimTarih: string | null;
    kildimVakit: string | null;
}

/**
 * Bu build canlı etkinlik taşıyor mu? Widget uzantısı (app.json bayrağı) kapalıysa ya da
 * iOS < 16.2 / eski ikili ise `false` → ekran ve servis hiçbir şey yapmaz.
 */
export function canliEtkinlikDestekli(): boolean {
    const m = modul();
    if (!m || typeof m.canliEtkinlikDestekli !== 'function') return false;
    try {
        return m.canliEtkinlikDestekli() === true;
    } catch {
        return false;
    }
}

/** Kullanıcı sistem ayarlarından canlı etkinlikleri kapatmış mı? Bilinmiyorsa `null`. */
export async function canliEtkinlikIzniAcik(): Promise<boolean | null> {
    const m = modul();
    if (!m || typeof m.canliEtkinlikIzniAcik !== 'function') return null;
    try {
        return await m.canliEtkinlikIzniAcik();
    } catch {
        return null;
    }
}

/**
 * Mevcut canlı etkinlikleri istenene eşitler (`null` = hiçbiri). Sonuç kodu:
 * `baslatildi` | `guncellendi` | `ayni` | `bitirildi` | `yok` | `izinYok` |
 * `desteklenmiyor` | `hata`. ASLA fırlatmaz.
 */
export async function canliEtkinlikEsitle(istek: CanliEtkinlikIstegi | null): Promise<string> {
    const m = modul();
    if (!m || typeof m.canliEtkinlikEsitle !== 'function') return 'desteklenmiyor';
    try {
        return await m.canliEtkinlikEsitle(istek ? JSON.stringify(istek) : null);
    } catch {
        return 'hata';
    }
}

// ---------------------------------------------------------------------------
// Apple Watch (WatchConnectivity, issue #285)
// ---------------------------------------------------------------------------

/**
 * Saat köprüsü — Android `WearSenkron` native modülüyle AYNI arayüz (`durumGonder`),
 * böylece `WearSenkronServisi` iki saati de aynı yükle besler.
 */
export interface SaatKoprusu {
    durumGonder(json: string): Promise<void>;
}

/**
 * Bu build Apple Watch uygulamasını taşıyor mu? Saat bayrağı (`withNamazSaat`) kapalıysa,
 * iPad'de ya da eski ikilide `false`.
 */
export function saatUygulamasiDestekli(): boolean {
    const m = modul();
    if (!m || typeof m.saatDestekli !== 'function' || typeof m.saatDurumGonder !== 'function') return false;
    try {
        return m.saatDestekli() === true;
    } catch {
        return false;
    }
}

/**
 * iOS'ta Apple Watch köprüsü; desteklenmiyorsa `null`. Native taraf son yükü saklar ve
 * oturum etkinleşince / saat uygulaması sonradan kurulunca kendiliğinden gönderir →
 * `bekliyor` ve `saatYok` HATA DEĞİLDİR. Yalnız `hata` reddedilir (yük yeniden denensin).
 */
export function saatKoprusu(): SaatKoprusu | null {
    const m = modul();
    if (!m || !saatUygulamasiDestekli() || typeof m.saatDurumGonder !== 'function') return null;
    const gonder = m.saatDurumGonder.bind(m);
    return {
        async durumGonder(json: string): Promise<void> {
            const sonuc = await gonder(json);
            if (sonuc === 'hata') throw new Error('Apple Watch durumu gonderilemedi');
        },
    };
}
