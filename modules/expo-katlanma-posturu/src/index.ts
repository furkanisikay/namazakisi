import { requireOptionalNativeModule } from 'expo-modules-core';

/**
 * Katlanabilir cihaz postürü köprüsü (issue #283 — masaüstü postürü) — YALNIZ ANDROID.
 *
 * Köprü OPSİYONEL yüklenir: iOS'ta, köprüsüz eski build'de ve jest'te modül
 * `null` olur → her fonksiyon "düz" (katlanma yok) döner, asla fırlatmaz.
 *
 * Ham veri burada YORUMLANMAZ; doğrulama ve düzen kararı saf çekirdektedir
 * (`src/core/utils/katlanmaPosturu.ts > posturuCoz`).
 */

/** Native'in gönderdiği ham şekil (`ExpoKatlanmaPosturuModule.cevir`). */
export interface HamPostur {
    durum?: unknown;
    yon?: unknown;
    ayirici?: unknown;
    /** dp, React kök görünümüne göre. */
    sinir?: unknown;
}

interface Abonelik {
    remove(): void;
}

interface KatlanmaNativeModulu {
    sonDurum?(): HamPostur | null;
    menteseVarMi?(): boolean | null;
    addListener?(olay: string, dinleyici: (veri: HamPostur) => void): Abonelik;
}

const modul = requireOptionalNativeModule<KatlanmaNativeModulu>('ExpoKatlanmaPosturu');

/** Native modül bu build'de var mı? */
export function katlanmaModuluVarMi(): boolean {
    return modul != null;
}

/** Bilinen son postür (izleme başlamadıysa ya da modül yoksa `null`). */
export function sonPostur(): HamPostur | null {
    try {
        return modul?.sonDurum?.() ?? null;
    } catch {
        return null;
    }
}

/**
 * Cihazda menteşe algılayıcısı var mı (katlanabilir telefon)? iOS'ta, köprüsüz build'de,
 * Android 11 altında ve hata durumunda `null` (bilinmiyor).
 */
export function menteseVarMi(): boolean | null {
    try {
        const deger = modul?.menteseVarMi?.();
        return typeof deger === 'boolean' ? deger : null;
    } catch {
        return null;
    }
}

/**
 * Postür değişimlerini dinler. Dinleyici eklendiği an native izleme başlar
 * (OnStartObserving), son dinleyici kalkınca durur. Modül yoksa no-op abonelik.
 */
export function posturDinle(dinleyici: (veri: HamPostur) => void): Abonelik {
    const m = modul;
    if (!m?.addListener) return { remove: () => undefined };
    try {
        return m.addListener('onPosturDegisti', dinleyici);
    } catch {
        return { remove: () => undefined };
    }
}
