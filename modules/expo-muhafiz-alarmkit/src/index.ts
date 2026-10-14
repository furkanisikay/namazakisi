/**
 * MUHAFIZ GERÇEK ALARMI — iOS 26 AlarmKit köprüsü (JS tarafı, issue #74).
 *
 * Native taraf iki parçadır: bu pod (`ExpoMuhafizAlarmKit` — kayıt deposu, saf kurallar,
 * köprü) ve ana hedefteki `targets/muhafiz-alarmkit/` (AlarmKit çağrıları + alarm
 * düğmelerinin App Intents'i; `plugins/withMuhafizAlarmKit.js` bağlar).
 *
 * KÖPRÜ OPSİYONEL YÜKLENİR (`expo-muhafiz-anons` deseni): modül yalnız iOS'ta vardır;
 * `requireNativeModule` Android'de açılışta FIRLATIRDI. Jest'te `__mocks__` devreye
 * girer (varsayılan: modül yok → "desteklenmiyor"). HİÇBİRİ FIRLATMAZ: alarm kurulamazsa
 * çağıran aynı tetiği bugünkü yoldan (zamana duyarlı bildirim + uzun ses) teslim eder.
 */
import { requireOptionalNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';
import {
    alarmKitDurumunuCoz,
    alarmKitKayitlariniCoz,
    type AlarmKitDurumu,
    type AlarmKitKaydi,
    type AlarmKitYuku,
} from '../../../src/core/muhafiz/ios/alarmKit';

export type { AlarmKitDurumu, AlarmKitKaydi, AlarmKitYuku };

/** Uygulama açıkken alarm düğmesine basılınca gelen olayın türü. */
export type AlarmDegisiklikTuru = 'ertele' | 'kildim';

interface Abonelik {
    remove(): void;
}

interface AlarmKitNativeModule {
    durum(): Promise<string>;
    izinIste(): Promise<string>;
    planla(json: string): Promise<boolean>;
    iptalEt(kimlikler: string[], calaniDurdur: boolean): Promise<void>;
    kayitlar(): Promise<string>;
    addListener(olay: 'onAlarmDegisikligi', dinleyici: (veri: { tur?: string }) => void): Abonelik;
}

const ExpoMuhafizAlarmKit = requireOptionalNativeModule<AlarmKitNativeModule>('ExpoMuhafizAlarmKit');

const modul = (): AlarmKitNativeModule | null =>
    Platform.OS === 'ios' && ExpoMuhafizAlarmKit ? ExpoMuhafizAlarmKit : null;

/** Köprü bu build'de var mı? (senkron; AlarmKit'in kullanılabilirliği ayrıca `durum`dan) */
export function alarmKitModuluVarMi(): boolean {
    return modul() !== null;
}

/** AlarmKit durumu: iOS < 26 / modül yok → "desteklenmiyor". */
export async function alarmKitDurumu(): Promise<AlarmKitDurumu> {
    const m = modul();
    if (!m) return 'desteklenmiyor';
    try {
        return alarmKitDurumunuCoz(await m.durum());
    } catch {
        return 'desteklenmiyor';
    }
}

/** Sistem izin penceresini açar (yalnız "belirsiz"de görünür); sonuç durumu döner. */
export async function alarmKitIzniIste(): Promise<AlarmKitDurumu> {
    const m = modul();
    if (!m) return 'desteklenmiyor';
    try {
        return alarmKitDurumunuCoz(await m.izinIste());
    } catch {
        return 'desteklenmiyor';
    }
}

/** Alarmı kurar. `false` → çağıran normal bildirim yoluna düşer. */
export async function alarmKitPlanla(yuk: AlarmKitYuku): Promise<boolean> {
    const m = modul();
    if (!m) return false;
    try {
        return (await m.planla(JSON.stringify(yuk))) === true;
    } catch {
        return false;
    }
}

/**
 * Alarmları iptal eder. `calaniDurdur === false` (varsayılan — planlama turu) iken native
 * taraf o an ÇALAN alarmı ATLAR; yalnız "Kıldım" `true` geçer ve çalanı da susturur
 * (`alarmKitIptalSecimi` ile aynı kural, iptal anının güncel durumuyla).
 */
export async function alarmKitIptalEt(kimlikler: string[], calaniDurdur = false): Promise<void> {
    const m = modul();
    if (!m || kimlikler.length === 0) return;
    try {
        await m.iptalEt(kimlikler, calaniDurdur);
    } catch {
        // Kayıtlı olmayan alarm zararsız; iptal planlamayı asla durdurmaz.
    }
}

/** Sistemde HÂLÂ kurulu alarmlar (`{kimlik, tetikMs, caliyor?}`); modül yoksa/okunamazsa boş. */
export async function alarmKitKayitlari(): Promise<AlarmKitKaydi[]> {
    const m = modul();
    if (!m) return [];
    try {
        return alarmKitKayitlariniCoz(await m.kayitlar());
    } catch {
        return [];
    }
}

/** Uygulama açıkken alarm düğmesi ("10 dk ertele", "Kıldım") işlendi. */
export function alarmDegisikliginiDinle(fn: (tur: AlarmDegisiklikTuru) => void): () => void {
    const m = modul();
    if (!m) return () => undefined;
    try {
        const abonelik = m.addListener('onAlarmDegisikligi', (veri) => {
            if (veri?.tur === 'ertele' || veri?.tur === 'kildim') fn(veri.tur);
        });
        return () => abonelik.remove();
    } catch {
        return () => undefined;
    }
}
