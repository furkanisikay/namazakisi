import { requireOptionalNativeModule } from 'expo-modules-core';

/**
 * Sistem koşulları köprüsü (güç/veri tasarrufu, ağ, şarj, arka plan kısıtı) —
 * Android + iOS.
 *
 * Köprü OPSİYONEL yüklenir: köprüsüz eski build'de ve jest'te modül `null` olur →
 * her fonksiyon "bilinmiyor" (`null`) döner, asla fırlatmaz. Ham veri burada
 * YORUMLANMAZ; doğrulama ve karar saf çekirdektedir
 * (`src/core/sistem/sistemDurumu.ts > sistemDurumunuCoz`).
 */

/** Native'in gönderdiği ham sözlük (alanlar okunamazsa hiç yazılmaz). */
export type HamSistemDurumu = Record<string, unknown>;

interface Abonelik {
    remove(): void;
}

interface SistemNativeModulu {
    durumAl?(): Promise<HamSistemDurumu>;
    yenidenBaslat?(): Promise<boolean>;
    addListener?(olay: string, dinleyici: (veri: HamSistemDurumu) => void): Abonelik;
}

const modul = requireOptionalNativeModule<SistemNativeModulu>('ExpoSistemDurumu');

/** Native modül bu build'de var mı? */
export function sistemModuluVarMi(): boolean {
    return modul != null;
}

/** Anlık ham durum; modül yoksa ya da okunamazsa `null`. */
export async function hamSistemDurumuAl(): Promise<HamSistemDurumu | null> {
    try {
        const d = await modul?.durumAl?.();
        return d && typeof d === 'object' ? d : null;
    } catch {
        return null;
    }
}

/**
 * Değişimleri dinler. İlk dinleyiciyle native izleme başlar (OnStartObserving), son
 * dinleyici kalkınca durur. Modül yoksa no-op abonelik.
 */
export function sistemDurumunuDinle(dinleyici: (veri: HamSistemDurumu) => void): Abonelik {
    const m = modul;
    if (!m?.addListener) return { remove: () => undefined };
    try {
        return m.addListener('onSistemDurumuDegisti', dinleyici);
    } catch {
        return { remove: () => undefined };
    }
}

/**
 * Uygulamayı (JS paketini) hemen yeniden yükler — yazı yönü değişince (`I18nManager` yönü
 * yalnız başlangıçta okunur). Yayın derlemesinde de çalışır. Modül ya da fonksiyon yoksa
 * (eski build, jest) ya da native reddederse `false`; ASLA fırlatmaz.
 */
export async function yenidenBaslat(): Promise<boolean> {
    try {
        if (!modul?.yenidenBaslat) return false;
        return (await modul.yenidenBaslat()) === true;
    } catch {
        return false;
    }
}
