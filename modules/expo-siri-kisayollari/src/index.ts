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
