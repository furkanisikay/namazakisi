/**
 * MUHAFIZ SESLI ANONSU — iOS kopru (JS tarafi).
 *
 * Native taraf metni cihazda `AVSpeechSynthesizer` ile CEVRIMDISI sentezleyip
 * `Library/Sounds` altina yazar; bildirim o dosyayi adiyla ister. Gerekcesi:
 * iOS'ta belirli bir saatte arka planda kod calistirilamaz, dolayisiyla tetik
 * aninda konusacak bir sey yoktur.
 *
 * KOPRU OPSIYONEL YUKLENIR — `expo-countdown-notification`'da yasanan iOS
 * acilis cokmesinin AYNASI, ters yonde: bu modulun `platforms` alani
 * `["ios"]` oldugu icin ANDROID build'inde native taraf YOKTUR.
 * `requireNativeModule` modul yuklenirken FIRLATIRDI ve bu dosyayi import eden
 * her sey Android'de acilista cokerdi. `requireOptionalNativeModule`
 * bulunamayinca `null` doner; asagidaki her fonksiyon platform kapisina EK
 * OLARAK null'a karsi da korunur.
 *
 * HICBIRI FIRLATMAZ: sentez bir planlamayi asla durdurmamali. Basarisizlikta
 * cagiran varsayilan bildirim sesine duser.
 */
import { requireOptionalNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

interface AnonsNativeModule {
    trSesTanimlayici(): Promise<string | null>;
    /** Yeni köprü — eski native'de yoktur. */
    anonsDiliniAyarla?(dil: string): void;
    varMi(dosyaAdi: string): Promise<boolean>;
    sentezle(metin: string, dosyaAdi: string): Promise<boolean>;
    kullanilmayanlariSil(korunacak: string[], onek: string): Promise<number>;
    konus(metin: string): Promise<boolean>;
    sustur(): Promise<void>;
    /** Kendi ses dosyası (yeni köprü — eski native'de yoktur). */
    sesIceAktar?(kaynakUri: string, gorunenAd: string): Promise<unknown>;
    iceAktarilanSesler?(): Promise<unknown>;
    iceAktarilanSesiSil?(dosyaAdi: string): Promise<boolean>;
    sesDosyasiUri?(dosyaAdi: string): Promise<string | null>;
}

const ExpoMuhafizAnons = requireOptionalNativeModule<AnonsNativeModule>('ExpoMuhafizAnons');

/** Kopru bu calisma ortaminda kullanilabilir mi? */
function kullanilabilirMi(): boolean {
    return Platform.OS === 'ios' && ExpoMuhafizAnons !== null;
}

/**
 * Cihaz-ici anons modulu bu build'de VAR mi? (senkron)
 *
 * YETENEK SORUSUDUR, platform sorusu degil: `trSesTanimlayici()` hem "Turkce ses
 * yok" hem "modul hic yok" durumunda `null` doner. Ikisini ayirt etmeden
 * "Turkce ses bulunamadi" uyarisi gostermek, modulun olmadigi bir build'de
 * (eski iOS surumu, Expo Go) YANLIS alarm olurdu.
 *
 * Onizleme de bunu kullanir: Android'de modul yoktur → Android TTS yolu;
 * iOS'ta vardir → `anonsuKonus`. Jest'te mock `false` doner → Android yolu
 * (varsayilan `Platform.OS` 'ios' olsa bile testler sessizce iOS'a kaymaz).
 */
export function anonsModuluVarMi(): boolean {
    return kullanilabilirMi();
}

/**
 * Anons dilini (BCP-47) kaydeder: iOS ses seçimi (klip sentezi, önizleme) bundan sonra bu
 * dildedir. Eski native'de fonksiyon yoksa atlanır (Türkçe kalır). Asla fırlatmaz.
 */
export function anonsDiliniAyarla(dil: string): void {
    if (!kullanilabilirMi() || typeof ExpoMuhafizAnons?.anonsDiliniAyarla !== 'function') return;
    try {
        ExpoMuhafizAnons.anonsDiliniAyarla(dil);
    } catch {
        // Eski native: anons varsayılan dilde kalır.
    }
}

/**
 * Cihazdaki anons dilinin (varsayılan Türkçe) sesinin tanimlayicisi; yoksa `null`.
 *
 * IKI YERDE KULLANILIR:
 *  1. Klip adinin hash girdisi — ses degisince (kullanici gelismis Turkce sesi
 *     indirdiginde) adlar da degismeli, yoksa `varMi` true doner ve kullanici
 *     yeni sesi INDIRDIGI HALDE sonsuza kadar eski robotik klipleri duyar.
 *  2. Ekrandaki bilgilendirme bandi (`null` => sesli anons calismaz).
 */
export async function trSesTanimlayici(): Promise<string | null> {
    if (!kullanilabilirMi()) return null;
    try {
        return (await ExpoMuhafizAnons!.trSesTanimlayici()) ?? null;
    } catch {
        return null;
    }
}

/** Klip zaten uretilmis mi? Bilinmiyorsa `false` (cagiran varsayilana duser). */
export async function klipVarMi(dosyaAdi: string): Promise<boolean> {
    if (!kullanilabilirMi() || !dosyaAdi) return false;
    try {
        return (await ExpoMuhafizAnons!.varMi(dosyaAdi)) === true;
    } catch {
        return false;
    }
}

/**
 * Metni sentezleyip klibi yaz. Basarisizlikta `false` — ASLA firlatmaz.
 *
 * Native taraf Turkce ses yoksa hic uretmez: `AVSpeechUtterance.voice` bos
 * birakilirsa iOS Turkce metni BASKA DILDEKI sesle okur. Android'deki
 * "LANG_MISSING_DATA -> sessizce vazgec" kuralinin aynasi.
 */
export async function klipSentezle(metin: string, dosyaAdi: string): Promise<boolean> {
    if (!kullanilabilirMi() || !metin || !dosyaAdi) return false;
    try {
        return (await ExpoMuhafizAnons!.sentezle(metin, dosyaAdi)) === true;
    } catch {
        return false;
    }
}

/**
 * Korunacaklar disindaki anons kliplerini sil; silinen sayisini doner.
 *
 * `onek` ZORUNLU: native taraf yalniz bu oneki tasiyan dosyalara dokunur.
 * Kullanicinin ya da baska bir bilesenin `Library/Sounds` altindaki dosyalari
 * korunur (kanal GC'sindeki "taban kanallara asla dokunma" kuralinin ikizi).
 */
export async function kullanilmayanKlipleriSil(
    korunacak: string[],
    onek: string
): Promise<number> {
    if (!kullanilabilirMi()) return 0;
    try {
        return (await ExpoMuhafizAnons!.kullanilmayanlariSil(korunacak, onek)) ?? 0;
    } catch {
        return 0;
    }
}

/**
 * ON PLAN onizlemesi: dosyaya yazmadan dogrudan konus ("Dinle" butonu).
 *
 * Uygulama on plandayken iOS konusabilir — onizleme icin klip uretmeye gerek
 * yok. Konusulamadiysa `false` doner (cagiran sessiz kalmaz, bildirim sesini
 * calabilir).
 */
export async function anonsuKonus(metin: string): Promise<boolean> {
    if (!kullanilabilirMi() || !metin) return false;
    try {
        return (await ExpoMuhafizAnons!.konus(metin)) === true;
    } catch {
        return false;
    }
}

/** Calan onizlemeyi durdur (idempotent). */
export async function anonsuSustur(): Promise<void> {
    if (!kullanilabilirMi()) return;
    try {
        await ExpoMuhafizAnons!.sustur();
    } catch {
        // Durdurma hatasi bir sonuctur; yutulur.
    }
}

// ============================================================
// KENDI SES DOSYANIZ (iPhone) — `Library/Sounds/kullanici_ses_<sha8>.caf`
// ============================================================
//
// Kullanicinin sectigi dosya (belge secicinin uygulama onbellegine kopyasi) native
// tarafta AVFoundation ile dogrusal PCM CAF'a cevrilir, 29,5 sn'ye KIRPILIR (iOS 30 sn'yi
// asan bildirim sesini calmaz; yerine sistemin sesini calar) ve bildirim sesinin
// arandigi `Library/Sounds`'a yazilir. Ayni icerik ayni adi alir (yeniden kullanilir).
// Kimlik `dosya:<dosyaAdi>` (`core/muhafiz/ios/paketSesleri.ts`).

/** Ice aktarma hatasi: `bicim` (ses degil/acilamadi), `boyut` (>20 MB), `erisim`, `yazilamadi`, `desteklenmiyor`. */
export type IosSesAktarmaHatasi = 'bicim' | 'boyut' | 'erisim' | 'yazilamadi' | 'desteklenmiyor';

export interface IceAktarilanSes {
    /** `Library/Sounds` altindaki dosya adi (`kullanici_ses_<sha8>.caf`). */
    dosya: string;
    /** Kullanicinin gordugu ad (asil dosyanin adi). */
    ad: string;
}

export type IosSesAktarmaSonucu =
    | (IceAktarilanSes & { /** 30 sn'den uzundu, ilk 29,5 sn alindi. */ kirpildi: boolean })
    | { hata: IosSesAktarmaHatasi };

const AKTARMA_HATALARI: readonly IosSesAktarmaHatasi[] = ['bicim', 'boyut', 'erisim', 'yazilamadi', 'desteklenmiyor'];

/** Bu build'de "kendi dosyanizdan" yolu var mi? (eski native ikilide yoktur) */
export function sesIceAktarmaDestekleniyor(): boolean {
    return kullanilabilirMi() && typeof ExpoMuhafizAnons?.sesIceAktar === 'function';
}

/** Dosyayi bildirim sesi yapar. ASLA firlatmaz. */
export async function sesIceAktar(kaynakUri: string, gorunenAd: string): Promise<IosSesAktarmaSonucu> {
    if (!sesIceAktarmaDestekleniyor()) return { hata: 'desteklenmiyor' };
    if (!kaynakUri) return { hata: 'erisim' };
    try {
        const sonuc = (await ExpoMuhafizAnons!.sesIceAktar!(kaynakUri, gorunenAd)) as
            | { dosya?: unknown; ad?: unknown; kirpildi?: unknown; hata?: unknown }
            | null;
        if (sonuc && typeof sonuc.dosya === 'string' && sonuc.dosya.length > 0) {
            return {
                dosya: sonuc.dosya,
                ad: typeof sonuc.ad === 'string' ? sonuc.ad : '',
                kirpildi: sonuc.kirpildi === true,
            };
        }
        const hata = AKTARMA_HATALARI.find((h) => h === sonuc?.hata) ?? 'yazilamadi';
        return { hata };
    } catch {
        return { hata: 'yazilamadi' };
    }
}

/** Diskte duran ice aktarilmis sesler (eklenme sirasiyla). Bilinmiyorsa bos liste. */
export async function iceAktarilanSesler(): Promise<IceAktarilanSes[]> {
    if (!kullanilabilirMi() || typeof ExpoMuhafizAnons?.iceAktarilanSesler !== 'function') return [];
    try {
        const liste = await ExpoMuhafizAnons.iceAktarilanSesler();
        if (!Array.isArray(liste)) return [];
        return liste.flatMap((o: unknown) => {
            const g = o as { dosya?: unknown; ad?: unknown } | null;
            return g && typeof g.dosya === 'string' && g.dosya.length > 0
                ? [{ dosya: g.dosya, ad: typeof g.ad === 'string' ? g.ad : '' }]
                : [];
        });
    } catch {
        return [];
    }
}

/** Ice aktarilmis sesi siler (yalniz `kullanici_ses_` adlari). Basarisizlikta `false`. */
export async function iceAktarilanSesiSil(dosyaAdi: string): Promise<boolean> {
    if (!kullanilabilirMi() || typeof ExpoMuhafizAnons?.iceAktarilanSesiSil !== 'function' || !dosyaAdi) return false;
    try {
        return (await ExpoMuhafizAnons.iceAktarilanSesiSil(dosyaAdi)) === true;
    } catch {
        return false;
    }
}

/** Onizleme icin dosyanin `file://` adresi; yoksa `null`. */
export async function sesDosyasiUri(dosyaAdi: string): Promise<string | null> {
    if (!kullanilabilirMi() || typeof ExpoMuhafizAnons?.sesDosyasiUri !== 'function' || !dosyaAdi) return null;
    try {
        const uri = await ExpoMuhafizAnons.sesDosyasiUri(dosyaAdi);
        return typeof uri === 'string' && uri.length > 0 ? uri : null;
    } catch {
        return null;
    }
}
