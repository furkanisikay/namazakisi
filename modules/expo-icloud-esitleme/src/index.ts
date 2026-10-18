/**
 * CIHAZLAR ARASI ESITLEME (issue #288) — iCloud kopru (JS tarafi).
 *
 * Modul yalniz iOS'ta vardir (`platforms: ["ios"]`); `requireOptionalNativeModule`
 * bulunamayinca `null` doner → Android'de ve jest'te hicbir fonksiyon patlamaz.
 * HICBIRI FIRLATMAZ: hata `null`/`false` olarak doner, saglayici koda cevirir.
 */
import { requireOptionalNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

interface IcloudNativeModule {
    hesapVarMi(): Promise<boolean>;
    oku(anahtar: string): Promise<string | null>;
    yaz(anahtar: string, deger: string): Promise<boolean>;
    sil(anahtar: string): Promise<boolean>;
}

const ExpoIcloudEsitleme = requireOptionalNativeModule<IcloudNativeModule>('ExpoIcloudEsitleme');

/** Kopru bu calisma ortaminda var mi? */
export function icloudModuluVarMi(): boolean {
    return Platform.OS === 'ios' && ExpoIcloudEsitleme !== null;
}

/**
 * iCloud hesabi acik mi? Modul yoksa `false` (bu ortamda iCloud yok). Kopru HATASI
 * `null` (bilinmiyor): "giris yapilmamis" demek, girisli kullaniciya yanlis engel
 * gosterirdi. Cagiran `=== true` / `=== false` ile ayirir.
 */
export async function icloudHesapVarMi(): Promise<boolean | null> {
    if (!icloudModuluVarMi() || !ExpoIcloudEsitleme) return false;
    try {
        const var_ = await ExpoIcloudEsitleme.hesapVarMi();
        return typeof var_ === 'boolean' ? var_ : null;
    } catch {
        return null;
    }
}

/** @throws Kopru yoksa (saglayici bunu `yapilandirilmamis`a cevirir). */
export async function icloudOku(anahtar: string): Promise<string | null> {
    if (!ExpoIcloudEsitleme) throw new Error('iCloud koprusu yok');
    return ExpoIcloudEsitleme.oku(anahtar);
}

/** @throws Kopru yoksa. */
export async function icloudYaz(anahtar: string, deger: string): Promise<boolean> {
    if (!ExpoIcloudEsitleme) throw new Error('iCloud koprusu yok');
    return ExpoIcloudEsitleme.yaz(anahtar, deger);
}

/** @throws Kopru yoksa. */
export async function icloudSil(anahtar: string): Promise<boolean> {
    if (!ExpoIcloudEsitleme) throw new Error('iCloud koprusu yok');
    return ExpoIcloudEsitleme.sil(anahtar);
}
