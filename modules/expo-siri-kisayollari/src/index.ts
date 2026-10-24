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
export type SiriDegisiklikTuru = 'kildim' | 'odak' | 'ekran' | 'saatUyandirma';

interface Abonelik {
    remove(): void;
}

interface SiriNativeModule {
    /** AsyncFunction (#295): yazım + widget tazelemesi JS thread'ini bekletmez. */
    vakitlerKaydet(json: string): Promise<void>;
    kilinanlarKaydet(json: string): Promise<void>;
    bekleyenleriAl(): Promise<string>;
    tamamlandi(id: string): Promise<void>;
    basarisiz(id: string): Promise<void>;
    odakDurumuAl(): Promise<string | null>;
    ekranIstegiAl(): Promise<string | null>;
    /** Günün ayeti yükü v1 (`docs/ajan/gunun-ayeti.md`) — eski ikilide yok (opsiyonel). */
    gununAyetiKaydet?(json: string): Promise<void>;
    /** #295 — eski ikilide yok (opsiyonel). */
    /** Arayüz dili (App Group) — eski ikilide yok (opsiyonel). */
    arayuzDiliniAyarla?(kod: string): void;
    canliEtkinlikDestekli?(): boolean;
    canliEtkinlikIzniAcik?(): Promise<boolean>;
    canliEtkinlikEsitle?(json: string | null, secenek?: string | null): Promise<string>;
    /** #285 Apple Watch — eski ikilide yok (opsiyonel). */
    saatDestekli?(): boolean;
    saatDurumGonder?(json: string): Promise<string>;
    /** Saatin uyandırma cevapları (`{kimlik: {islem}}` JSON) — eski ikilide yok. */
    saatUyandirmaDurumlari?(): Promise<string>;
    /** Saatte basılan teheccüd "Kıldım"ları (`[{tarih,tur}]` JSON), TÜKETİR. */
    saatNafileKildimleriniAl?(): Promise<string>;
    addListener(olay: 'onSiriDegisikligi', dinleyici: (veri: { tur?: string }) => void): Abonelik;
}

const ExpoSiriKisayollari = requireOptionalNativeModule<SiriNativeModule>('ExpoSiriKisayollari');

const modul = (): SiriNativeModule | null =>
    Platform.OS === 'ios' && ExpoSiriKisayollari ? ExpoSiriKisayollari : null;

/**
 * Arayüz dilini App Group'a yazar (iOS widget, saat köprüsü ve Siri metinleri okur).
 * Modül/fonksiyon yoksa (Android, eski ikili) sessizce atlanır. Asla fırlatmaz.
 */
export function arayuzDiliniAyarla(kod: string): void {
    const m = modul();
    if (!m || typeof m.arayuzDiliniAyarla !== 'function') return;
    try {
        m.arayuzDiliniAyarla(kod);
    } catch {
        // Eski ikili: uzantılar Türkçe kalır.
    }
}

/** Widget yükü arayüzü (Android `WidgetVeri` ile aynı). iOS'ta Siri'nin okuduğu çizelge. */
export interface SiriVeriYazici {
    vakitlerKaydet(json: string): Promise<void>;
    kilinanlarKaydet(json: string): Promise<void>;
    /**
     * Günün ayeti yükü v1 (Android `WidgetVeri.gununAyetiKaydet` ile aynı ad): App Group'a
     * yazar, yalnız ayet widget'ını tazeler. Eski ikilide yok → opsiyonel (`?.` ile çağırın).
     */
    gununAyetiKaydet?(json: string): Promise<void>;
}

/** "Kıldım" kuyruğu arayüzü (Android `KildimKuyrugu` ile aynı). */
export interface SiriKildimKuyrugu {
    bekleyenleriAl(): Promise<string>;
    tamamlandi(id: string): Promise<void>;
    basarisiz(id: string): Promise<void>;
    /** Cihaz ağından gelen "Kıldım" (kaynak sabit `cihaz`). Eski ikilide yok → opsiyonel. */
    cihazdanKildimEkle?(tarih: string, vakit: string): Promise<boolean>;
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
            if (tur === 'kildim' || tur === 'odak' || tur === 'ekran' || tur === 'saatUyandirma') dinleyici(tur);
        });
        return () => abonelik.remove();
    } catch {
        return () => undefined;
    }
}

// ---------------------------------------------------------------------------
// Canlı etkinlik (Live Activity — Dinamik Ada / kilit ekranı, issue #295)
// ---------------------------------------------------------------------------

/** Native'e giden istenen etkinlik (Swift `CanliEtkinlikKoprusu.Istek` ile aynı alanlar). */
export interface CanliEtkinlikIstegi {
    id: string;
    baslik: string;
    ad: string;
    baslangicMs: number;
    hedefMs: number;
    tema: string;
    kildimTarih: string | null;
    kildimVakit: string | null;
}

/**
 * Bu build canlı etkinlik taşıyor mu? Widget uzantısı (app.json bayrağı) kapalıysa ya da
 * iOS < 16.2 / eski ikili ise `false` → ekran ve servis hiçbir şey yapmaz.
 */
export function canliEtkinlikDestekli(): boolean {
    const m = modul();
    if (!m || typeof m.canliEtkinlikDestekli !== 'function') return false;
    try {
        return m.canliEtkinlikDestekli() === true;
    } catch {
        return false;
    }
}

/** Kullanıcı sistem ayarlarından canlı etkinlikleri kapatmış mı? Bilinmiyorsa `null`. */
export async function canliEtkinlikIzniAcik(): Promise<boolean | null> {
    const m = modul();
    if (!m || typeof m.canliEtkinlikIzniAcik !== 'function') return null;
    try {
        return await m.canliEtkinlikIzniAcik();
    } catch {
        return null;
    }
}

/** Eşitleme bağlamı (Swift `CanliEtkinlikKoprusu.Secenek`). */
export interface CanliEtkinlikSecenegi {
    /**
     * Uygulama ön planda mı? Arka planda `Activity.request` başarısız olur (push-to-start
     * ister) → native yeni etkinlik İSTEMEZ ve mevcut geçerli olanları BİTİRMEZ.
     */
    onPlanda: boolean;
    /** Penceresi şu an süren adayların kimlikleri; `null` = bilinmiyor (ör. konum yok). */
    korunacaklar: string[] | null;
}

/**
 * Mevcut canlı etkinlikleri istenene eşitler (`null` = hiçbiri). Sonuç kodu:
 * `baslatildi` | `guncellendi` | `ayni` | `bitirildi` | `korundu` | `yok` | `izinYok` |
 * `desteklenmiyor` | `hata`. ASLA fırlatmaz.
 */
export async function canliEtkinlikEsitle(
    istek: CanliEtkinlikIstegi | null,
    secenek?: CanliEtkinlikSecenegi
): Promise<string> {
    const m = modul();
    if (!m || typeof m.canliEtkinlikEsitle !== 'function') return 'desteklenmiyor';
    try {
        return await m.canliEtkinlikEsitle(
            istek ? JSON.stringify(istek) : null,
            secenek ? JSON.stringify(secenek) : null
        );
    } catch {
        return 'hata';
    }
}

// ---------------------------------------------------------------------------
// Apple Watch (WatchConnectivity, issue #285)
// ---------------------------------------------------------------------------

/**
 * Saat köprüsü — Android `WearSenkron` native modülüyle AYNI arayüz (`durumGonder`),
 * böylece `WearSenkronServisi` iki saati de aynı yükle besler.
 */
export interface SaatKoprusu {
    durumGonder(json: string): Promise<void>;
}

/**
 * Bu build Apple Watch uygulamasını taşıyor mu? Saat bayrağı (`withNamazSaat`) kapalıysa,
 * iPad'de ya da eski ikilide `false`.
 */
export function saatUygulamasiDestekli(): boolean {
    const m = modul();
    if (!m || typeof m.saatDestekli !== 'function' || typeof m.saatDurumGonder !== 'function') return false;
    try {
        return m.saatDestekli() === true;
    } catch {
        return false;
    }
}

/**
 * iOS'ta Apple Watch köprüsü; desteklenmiyorsa `null`. Native taraf son yükü saklar ve
 * oturum etkinleşince / saat uygulaması sonradan kurulunca kendiliğinden gönderir →
 * `bekliyor` ve `saatYok` HATA DEĞİLDİR. Yalnız `hata` reddedilir (yük yeniden denensin).
 */
export function saatKoprusu(): SaatKoprusu | null {
    const m = modul();
    if (!m || !saatUygulamasiDestekli() || typeof m.saatDurumGonder !== 'function') return null;
    const gonder = m.saatDurumGonder.bind(m);
    return {
        async durumGonder(json: string): Promise<void> {
            const sonuc = await gonder(json);
            if (sonuc === 'hata') throw new Error('Apple Watch durumu gonderilemedi');
        },
    };
}

/**
 * Saatte sessiz uyandırmaya verilen cevaplar (saat W3'ün iOS ikizi, #285 cilası).
 * Android `WearSenkron.saatUyandirmaDurumlari` ile AYNI biçim (kimlik → `{islem}` JSON);
 * köprü yoksa ya da okunamazsa `null` (asla fırlatmaz).
 */
export async function saatUyandirmaDurumlariniOku(): Promise<string | null> {
    const m = modul();
    if (!m || typeof m.saatUyandirmaDurumlari !== 'function') return null;
    try {
        return await m.saatUyandirmaDurumlari();
    } catch {
        return null;
    }
}

export interface SaatNafileKildimi {
    tarih: string;
    tur: string;
}

/**
 * Saatte basılan teheccüd "Kıldım"larını TÜKETİR. Farz kuyruğuna ASLA girmez (teheccüd
 * nafiledir) → `NafileHatirlatmaServisi` susturma hafızasına yazar. Asla fırlatmaz.
 */
export async function saatNafileKildimleriniAl(): Promise<SaatNafileKildimi[]> {
    const m = modul();
    if (!m || typeof m.saatNafileKildimleriniAl !== 'function') return [];
    try {
        const ham = JSON.parse(await m.saatNafileKildimleriniAl()) as unknown;
        if (!Array.isArray(ham)) return [];
        return ham.filter(
            (k): k is SaatNafileKildimi =>
                !!k && typeof k === 'object' && typeof (k as SaatNafileKildimi).tarih === 'string' &&
                typeof (k as SaatNafileKildimi).tur === 'string'
        );
    } catch {
        return [];
    }
}

// ---- Cihaz ağı dinleyicisi (iPad ↔ iPhone; YALNIZ ön planda) ----

export interface IosDinleyiciKoprusu {
    dinleyiciBaslat(kimlik: string, ad: string, port: number): Promise<number>;
    dinleyiciDurdur(): Promise<void>;
    dinleyiciYanitla(id: string, kod: number, govde: string): Promise<void>;
    yerelAdres(): Promise<string | null>;
    addListener(olay: 'onCihazIstegi', dinleyici: (veri: { id: string; yol: string; govde: string; ip?: string }) => void): { remove(): void };
}

/** iOS dinleyici köprüsü; eski ikilide `null`. */
export function iosDinleyici(): IosDinleyiciKoprusu | null {
    const m = modul() as unknown as Partial<IosDinleyiciKoprusu> | null;
    return m?.dinleyiciBaslat && m.dinleyiciYanitla && m.dinleyiciDurdur && m.yerelAdres && m.addListener
        ? (m as IosDinleyiciKoprusu)
        : null;
}
