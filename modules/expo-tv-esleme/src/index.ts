import { requireOptionalNativeModule } from 'expo-modules-core';

/**
 * Android TV eşleştirmesi — telefon tarafı native köprü (YALNIZ ANDROID).
 *
 * Opsiyonel yüklenir: iOS'ta, köprüsüz eski build'de ve jest'te `null` → çağıran yedek yola
 * (iOS: expo-camera + fetch) ya da kodla aktarmaya düşer. Ayrıntı: `ExpoTvEslemeModule.kt`.
 */
interface TvEslemeNativeModulu {
    qrOku(): Promise<string | null>;
    gonder(adres: string, port: number, govde: string, zamanAsimiMs: number): Promise<string>;
}

const modul = requireOptionalNativeModule<TvEslemeNativeModulu>('ExpoTvEsleme');

export function tvEslemeModuluVarMi(): boolean {
    return modul != null;
}

/** QR okur; iptalde `null`. Tarayıcı yoksa `TARAYICI_YOK` koduyla reddeder. */
export function qrOku(): Promise<string | null> {
    if (!modul) return Promise.reject(Object.assign(new Error('Modül yok'), { code: 'TARAYICI_YOK' }));
    return modul.qrOku();
}

/** TV'ye `POST /esle`; yanıt GÖVDESİNİ döner. Bağlanamazsa reddeder. */
export function tvyeGonder(adres: string, port: number, govde: string, zamanAsimiMs: number): Promise<string> {
    if (!modul) return Promise.reject(new Error('Modül yok'));
    return modul.gonder(adres, port, govde, zamanAsimiMs);
}
