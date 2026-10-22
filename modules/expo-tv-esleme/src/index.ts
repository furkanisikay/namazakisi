import { requireOptionalNativeModule } from 'expo-modules-core';

/**
 * Cihaz ağı / TV eşleştirmesi — telefon tarafı native köprü (YALNIZ ANDROID).
 *
 * Opsiyonel yüklenir: iOS'ta, köprüsüz eski build'de ve jest'te `null` → çağıran yedek yola
 * (iOS: expo-camera + fetch) ya da kodla aktarmaya düşer. Ayrıntı: `ExpoTvEslemeModule.kt`.
 */
export interface IstekYaniti {
    kod: number;
    govde: string;
}

export interface BulunanAlici {
    /** TXT `i` — alıcı kimliği. */
    i: string;
    adres: string;
    port: number;
}

interface TvEslemeNativeModulu {
    qrOku(): Promise<string | null>;
    gonder(adres: string, port: number, govde: string, zamanAsimiMs: number): Promise<string>;
    istek?(adres: string, port: number, yol: string, govde: string, zamanAsimiMs: number): Promise<IstekYaniti>;
    tvleriBul?(sureMs: number): Promise<BulunanAlici[]>;
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

/** v1: TV'ye `POST /esle`; yanıt GÖVDESİNİ döner. Bağlanamazsa reddeder. */
export function tvyeGonder(adres: string, port: number, govde: string, zamanAsimiMs: number): Promise<string> {
    if (!modul) return Promise.reject(new Error('Modül yok'));
    return modul.gonder(adres, port, govde, zamanAsimiMs);
}

/** v2: seçilen yola `POST`; durum kodu + gövde. Bağlanamazsa reddeder. */
export function yerelIstek(adres: string, port: number, yol: string, govde: string, zamanAsimiMs: number): Promise<IstekYaniti> {
    if (!modul?.istek) return Promise.reject(new Error('Modül yok'));
    return modul.istek(adres, port, yol, govde, zamanAsimiMs);
}

/** mDNS ile yerel ağdaki alıcıları süre sınırlı arar (yalnız Android). */
export function alicilariBul(sureMs: number): Promise<BulunanAlici[]> {
    if (!modul?.tvleriBul) return Promise.resolve([]);
    return modul.tvleriBul(sureMs);
}

// ---- Cihaz ağı dinleyicisi (tablet ↔ telefon; YALNIZ ön planda) ----

export interface CihazIstegi {
    id: string;
    yol: string;
    govde: string;
    /** Gönderenin IP'si (kimliği doğrulanmış istekte adres tazelenir). */
    ip?: string;
}

export interface DinleyiciKoprusu {
    dinleyiciBaslat(kimlik: string, ad: string, port: number): Promise<number>;
    dinleyiciDurdur(): Promise<void>;
    dinleyiciYanitla(id: string, kod: number, govde: string): Promise<void>;
    yerelAdres(): Promise<string | null>;
    addListener(olay: 'onCihazIstegi', dinleyici: (veri: CihazIstegi) => void): { remove(): void };
}

/** Android dinleyici köprüsü; eski ikilide/iOS'ta `null`. */
export function androidDinleyici(): DinleyiciKoprusu | null {
    const m = modul as unknown as Partial<DinleyiciKoprusu> | null;
    return m?.dinleyiciBaslat && m.dinleyiciYanitla && m.dinleyiciDurdur && m.yerelAdres && m.addListener
        ? (m as DinleyiciKoprusu)
        : null;
}
