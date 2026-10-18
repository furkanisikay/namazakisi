/**
 * Google Drive yetkisi köprüsü (issue #288) — YALNIZ ANDROID.
 *
 * Google Identity Services Authorization API: istemci kimliği / yönlendirme YOK;
 * Google paket adı + imza SHA-1'ini Cloud projesindeki Android OAuth istemcileriyle
 * eşler. Köprü OPSİYONEL yüklenir (`requireOptionalNativeModule`): iOS'ta, köprüsüz
 * eski build'de ve jest'te modül `null` olur → hiçbir fonksiyon FIRLATMAZ.
 */
import { requireOptionalNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

import { GoogleYetkiSonucu, yetkiSonucunuCoz } from './yetkiSonucu';

export type { GoogleYetkiSonucu };
export { yetkiSonucunuCoz };

interface GoogleYetkiNativeModulu {
    playHizmetleriVarMi(): boolean;
    yetkiAl(kapsamlar: string[], etkilesimli: boolean): Promise<unknown>;
    belirteciTemizle(belirtec: string): Promise<boolean>;
    erisimiGeriAl(kapsamlar: string[]): Promise<boolean>;
}

const modul = requireOptionalNativeModule<GoogleYetkiNativeModulu>('ExpoGoogleYetki');

/**
 * Yalnız OLUMLU sonuç önbelleklenir: Play hizmetleri bulunduysa süreç ömrü boyunca
 * kalır. Olumsuz sonuç (ör. Play hizmetleri güncelleniyor/devre dışı, ya da geçici
 * köprü hatası) her sorguda yeniden denenir — kalıcı "yok" kararı kartı yanlışlıkla
 * süreç boyunca gizlerdi.
 */
let kullanilabilirOnbellek = false;

/** Köprü bu build'de var mı ve cihazda Google Play hizmetleri kullanılabilir mi? */
export function googleYetkisiKullanilabilirMi(): boolean {
    if (Platform.OS !== 'android' || !modul) return false;
    if (kullanilabilirOnbellek) return true;
    try {
        kullanilabilirOnbellek = modul.playHizmetleriVarMi() === true;
    } catch {
        return false;
    }
    return kullanilabilirOnbellek;
}

/** Erişim belirteci ister. Fırlatmaz; köprü yoksa `hata`. */
export async function googleYetkiAl(
    kapsamlar: string[],
    etkilesimli: boolean
): Promise<GoogleYetkiSonucu> {
    if (!modul) return { durum: 'hata', mesaj: 'kopru yok' };
    try {
        return yetkiSonucunuCoz(await modul.yetkiAl(kapsamlar, etkilesimli));
    } catch (e) {
        return { durum: 'hata', mesaj: e instanceof Error ? e.message : String(e) };
    }
}

/** Play hizmetlerinin önbelleğindeki bayat belirteci siler (401 sonrası). */
export async function googleBelirteciTemizle(belirtec: string): Promise<boolean> {
    if (!modul) return false;
    try {
        return (await modul.belirteciTemizle(belirtec)) === true;
    } catch {
        return false;
    }
}

/** Kapsam iznini Google tarafında geri alır; başaramazsa `false`. */
export async function googleErisimiGeriAl(kapsamlar: string[]): Promise<boolean> {
    if (!modul) return false;
    try {
        return (await modul.erisimiGeriAl(kapsamlar)) === true;
    } catch {
        return false;
    }
}
