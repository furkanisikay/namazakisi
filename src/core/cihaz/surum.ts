/**
 * İşletim sistemi sürümü — SAF (react-native import ETMEZ; `Platform.OS` ve
 * `Platform.Version` çağırandan enjekte edilir).
 *
 * Neden var: OS sürümüne bağlı her cümle ("iOS 26 gerekir", "Android 16+") düz
 * metin olarak yazılmıştı; `Platform.Version` UI'da hiç okunmuyordu. iOS'ta değer
 * DİZE ("26.0.1"), Android'de SAYI (API düzeyi, 36). Bu modül ikisini tek biçime
 * indirger ve "en az şu sürüm mü?" sorusunu ÜÇ değerli yanıtlar:
 *   - `true`  → koşul sağlanıyor (söylenecek bir şey yok),
 *   - `false` → sağlanmıyor (durum + çözüm söylenebilir),
 *   - `null`  → okunamadı ya da başka platform → SUS (yanlış uyarı, hiç uyarmamaktan kötü).
 */

export type CihazPlatformu = 'ios' | 'android';

export interface IsletimSistemiSurumu {
    platform: CihazPlatformu;
    /** iOS'ta ana sürüm (26), Android'de API düzeyi (36). */
    ana: number;
    /** iOS'ta alt sürüm (26.1 → 1); Android'de API alt düzeyi (QPR, yoksa 0). */
    alt: number;
    /** Kullanıcıya gösterilebilir biçim: iOS "26.0.1", Android "16" (API 36). */
    tam: string;
}

/**
 * Android API düzeyi → kullanıcının bildiği sürüm adı. Kullanıcı "API 34"ü değil
 * "Android 14"ü tanır. Tablo dışı (gelecek) düzeyler için API düzeyi `API N` olarak döner.
 */
const ANDROID_SURUM_ADLARI: Record<number, string> = {
    24: '7', 25: '7.1', 26: '8', 27: '8.1', 28: '9', 29: '10', 30: '11', 31: '12', 32: '12L',
    33: '13', 34: '14', 35: '15', 36: '16', 37: '17',
};

export function androidSurumAdi(api: number): string {
    return ANDROID_SURUM_ADLARI[api] ?? `API ${api}`;
}

/**
 * `Platform.OS` + `Platform.Version` → ortak biçim. Okunamazsa `null`.
 *
 * @param androidTamSurum Android 16+'da native `Build.VERSION.SDK_INT_FULL`
 *   (ana × 100000 + alt; QPR2 = 3600001). Verilirse `alt` ondan okunur.
 */
export function isletimSistemiSurumu(
    os: string,
    version: unknown,
    androidTamSurum?: number | null,
): IsletimSistemiSurumu | null {
    if (os === 'ios') {
        if (typeof version !== 'string' && typeof version !== 'number') return null;
        const metin = String(version).trim();
        const parca = /^(\d+)(?:\.(\d+))?/.exec(metin);
        if (!parca) return null;
        const ana = Number(parca[1]);
        if (!Number.isFinite(ana) || ana <= 0) return null;
        return { platform: 'ios', ana, alt: parca[2] ? Number(parca[2]) : 0, tam: metin };
    }
    if (os === 'android') {
        const api = typeof version === 'number' ? version : Number(version);
        if (!Number.isInteger(api) || api <= 0) return null;
        const tam = androidTamSurumCoz(androidTamSurum);
        const alt = tam && tam.ana === api ? tam.alt : 0;
        return { platform: 'android', ana: api, alt, tam: androidSurumAdi(api) };
    }
    return null;
}

/** `SDK_INT_FULL` (ana × 100000 + alt) → `{ ana, alt }`; geçersizse `null`. */
export function androidTamSurumCoz(deger: number | null | undefined): { ana: number; alt: number } | null {
    if (typeof deger !== 'number' || !Number.isInteger(deger) || deger < 100000) return null;
    return { ana: Math.floor(deger / 100000), alt: deger % 100000 };
}

/** iOS en az `ana` mı? Android'de ya da okunamazsa `null`. */
export function iosEnAz(surum: IsletimSistemiSurumu | null, ana: number): boolean | null {
    if (!surum || surum.platform !== 'ios') return null;
    return surum.ana >= ana;
}

/** Android API düzeyi en az `api` mı? iOS'ta ya da okunamazsa `null`. */
export function androidApiEnAz(surum: IsletimSistemiSurumu | null, api: number): boolean | null {
    if (!surum || surum.platform !== 'android') return null;
    return surum.ana >= api;
}

/**
 * Android 16 QPR2 (API 36.1) ve sonrası mı? (Kilit ekranı widget'ı.) API 37+ → `true`;
 * API 36'da alt düzey bilinmiyorsa `null` (sus), 35 ve altı → `false`.
 */
export function android16Qpr2EnAz(surum: IsletimSistemiSurumu | null): boolean | null {
    if (!surum || surum.platform !== 'android') return null;
    if (surum.ana > 36) return true;
    if (surum.ana < 36) return false;
    return surum.alt >= 1 ? true : null;
}
