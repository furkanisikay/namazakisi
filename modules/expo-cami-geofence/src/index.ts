import { requireOptionalNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

/**
 * Camideyim (#297) + Namaz modu (#277) native köprüsü — YALNIZ ANDROID.
 *
 * Köprü OPSİYONEL yüklenir (`expo-countdown-notification` dersi): iOS'ta ve
 * köprüsüz build'de modül `null` olur; her fonksiyon güvenli varsayılan döner,
 * asla fırlatmaz. Kararı native verir (uygulama süreci ölüyken de); burası ayar
 * okur/yazar ve plan gönderir.
 *
 * Karmaşık veriler JSON dizesiyle taşınır; şekiller aşağıdaki tiplerdedir ve
 * native tarafta `CamiDepo` / `NamazModu` normalize eder.
 */

export type CamiIzinDurumu = 'tamam' | 'konumYok' | 'arkaPlanYok';

export interface CamideHali {
    yerId: string;
    ad: string;
    vakit: string | null;
    tarih: string | null;
    cuma: boolean;
    girisMs: number;
    bitisMs: number;
    modAcildi: boolean;
}

export interface NamazModuNativeAyarlari {
    etkin: boolean;
    cuma: boolean;
    vakit: boolean;
    vakitSureDk: number;
    kildimKapat: boolean;
}

export interface NamazModuDurumu {
    /** 'kural' (Android 10+) | 'filtre' (Android 7–9) */
    destek: 'kural' | 'filtre';
    erisim: boolean;
    kuralVar: boolean;
    aktif: boolean;
    ayarlar: NamazModuNativeAyarlari;
}

export interface CamiNativeDurumu {
    veriVar: boolean;
    kayitSayisi: number;
    veriZamani: number;
    izin: CamiIzinDurumu;
    izlenenSayisi: number;
    camide: CamideHali | null;
    sessizBitisMs: number;
    namazModu: NamazModuDurumu;
}

export interface YakinCami {
    id: string;
    ad: string;
    lat: number;
    lng: number;
    yaricapM: number;
    poligonVar: boolean;
    mesafeM: number;
}

export interface CamiGunlukOlayi {
    zamanMs: number;
    tur: string;
    [ek: string]: unknown;
}

export interface CamiKildimOgesi {
    id: string;
    tarih: string;
    vakit: string;
    deneme?: number;
}

interface Abonelik {
    remove(): void;
}

interface CamiNativeModulu {
    durumAl(): Promise<string>;
    sessizBitisMs(): Promise<number>;
    ayarlariAl(): Promise<string>;
    ayarlariYaz(json: string, lat: number | null, lng: number | null): Promise<string>;
    pencereleriYaz(json: string): Promise<void>;
    izlemeyiTazele(lat: number, lng: number): Promise<string>;
    suresiGecenleriTemizle?(): Promise<void>;
    yakinCamiler(lat: number, lng: number, k: number): Promise<string>;
    gunlukAl(): Promise<string>;
    gunluguTemizle(): Promise<void>;
    camidenCik(): Promise<void>;
    kildimBekleyenleriAl(): Promise<string>;
    kildimTamamlandi(id: string): Promise<void>;
    kildimBasarisiz(id: string): Promise<void>;
    namazModuDurumu(): Promise<string>;
    namazModuAyarlariniYaz(json: string): Promise<string>;
    namazModuPlaniniYaz(json: string): Promise<void>;
    namazModuKildim(): Promise<void>;
    namazModuAktifTurlari(): Promise<string>;
    erisimAyariniAc(): Promise<boolean>;
    modAyarlariniAc(): Promise<boolean>;
    addListener?(olay: string, dinleyici: (veri: { tur?: string }) => void): Abonelik;
}

const modul = requireOptionalNativeModule<CamiNativeModulu>('ExpoCamiGeofence');

const kullanilabilir = (): CamiNativeModulu | null => (Platform.OS === 'android' && modul ? modul : null);

/** Bu cihazda Camideyim / Namaz modu var mı? (Android + köprülü build) */
export function camiModuluVarMi(): boolean {
    return kullanilabilir() != null;
}

function jsonCoz<T>(ham: unknown, yedek: T): T {
    if (typeof ham !== 'string') return yedek;
    try {
        const v = JSON.parse(ham) as unknown;
        return v == null ? yedek : (v as T);
    } catch {
        return yedek;
    }
}

async function guvenli<T>(is: (m: CamiNativeModulu) => Promise<T>, yedek: T): Promise<T> {
    const m = kullanilabilir();
    if (!m) return yedek;
    try {
        return await is(m);
    } catch {
        return yedek;
    }
}

export const durumAl = (): Promise<CamiNativeDurumu | null> =>
    guvenli(async (m) => jsonCoz<CamiNativeDurumu | null>(await m.durumAl(), null), null);

/** Camideyken muhafız sessizliğinin bittiği an (ms); camide değilse 0. */
export const sessizBitisMs = (): Promise<number> =>
    guvenli(async (m) => {
        const v = await m.sessizBitisMs();
        return typeof v === 'number' && Number.isFinite(v) ? v : 0;
    }, 0);

export const ayarlariAl = (): Promise<Record<string, unknown> | null> =>
    guvenli(async (m) => jsonCoz<Record<string, unknown> | null>(await m.ayarlariAl(), null), null);

/** @returns 'kuruldu' | 'kapali' | 'izinYok' | 'hata' | 'merkezYok' | 'yok' */
export const ayarlariYaz = (ayarlar: object, merkez: { lat: number; lng: number } | null): Promise<string> =>
    guvenli((m) => m.ayarlariYaz(JSON.stringify(ayarlar), merkez?.lat ?? null, merkez?.lng ?? null), 'yok');

export const pencereleriYaz = (pencereler: readonly object[]): Promise<void> =>
    guvenli((m) => m.pencereleriYaz(JSON.stringify(pencereler)), undefined);

/**
 * Merkez native'de BAYAT sayılır: canlı taze merkezi ezmez, değişiklik yoksa kayda dokunmaz.
 * @returns 'kuruldu' | 'degismedi' | 'kapali' | 'izinYok' | 'hata' | 'yok'
 */
export const izlemeyiTazele = (lat: number, lng: number): Promise<string> =>
    guvenli((m) => m.izlemeyiTazele(lat, lng), 'yok');

/**
 * Süresi geçmiş camide hâlini ve Namaz modu kaynaklarını düşürür (Rahatsız Etmeyin
 * üst süreden uzun açık kalmasın — üst süre alarmı OEM kısıtıyla silinmiş olabilir).
 */
export const suresiGecenleriTemizle = (): Promise<void> =>
    guvenli(async (m) => {
        await m.suresiGecenleriTemizle?.();
    }, undefined);

export const yakinCamiler = (lat: number, lng: number, k: number): Promise<YakinCami[]> =>
    guvenli(async (m) => jsonCoz<YakinCami[]>(await m.yakinCamiler(lat, lng, k), []), []);

export const gunlukAl = (): Promise<CamiGunlukOlayi[]> =>
    guvenli(async (m) => jsonCoz<CamiGunlukOlayi[]>(await m.gunlukAl(), []), []);

export const gunluguTemizle = (): Promise<void> => guvenli((m) => m.gunluguTemizle(), undefined);

export const camidenCik = (): Promise<void> => guvenli((m) => m.camidenCik(), undefined);

export const kildimBekleyenleriAl = (): Promise<CamiKildimOgesi[]> =>
    guvenli(async (m) => jsonCoz<CamiKildimOgesi[]>(await m.kildimBekleyenleriAl(), []), []);

export const kildimTamamlandi = (id: string): Promise<void> => guvenli((m) => m.kildimTamamlandi(id), undefined);

export const kildimBasarisiz = (id: string): Promise<void> => guvenli((m) => m.kildimBasarisiz(id), undefined);

export const namazModuDurumu = (): Promise<NamazModuDurumu | null> =>
    guvenli(async (m) => jsonCoz<NamazModuDurumu | null>(await m.namazModuDurumu(), null), null);

/** @returns 'tamam' | 'erisimYok' | 'hata' | 'yok' */
export const namazModuAyarlariniYaz = (ayarlar: NamazModuNativeAyarlari): Promise<string> =>
    guvenli((m) => m.namazModuAyarlariniYaz(JSON.stringify(ayarlar)), 'yok');

export const namazModuPlaniniYaz = (plan: readonly object[]): Promise<void> =>
    guvenli((m) => m.namazModuPlaniniYaz(JSON.stringify(plan)), undefined);

export const namazModuKildim = (): Promise<void> => guvenli((m) => m.namazModuKildim(), undefined);

export const namazModuAktifTurlari = (): Promise<string[]> =>
    guvenli(async (m) => jsonCoz<string[]>(await m.namazModuAktifTurlari(), []), []);

export const erisimAyariniAc = (): Promise<boolean> => guvenli((m) => m.erisimAyariniAc(), false);

export const modAyarlariniAc = (): Promise<boolean> => guvenli((m) => m.modAyarlariniAc(), false);

/** Native olay (camide / cikis / kildim / namazModu). Modül yoksa no-op abonelik. */
export function camiOlayiniDinle(dinleyici: (tur: string) => void): Abonelik {
    const m = kullanilabilir();
    if (!m?.addListener) return { remove: () => undefined };
    try {
        return m.addListener('onCamiOlayi', (veri) => {
            if (typeof veri?.tur === 'string') dinleyici(veri.tur);
        });
    } catch {
        return { remove: () => undefined };
    }
}
