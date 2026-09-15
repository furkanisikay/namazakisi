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
    varMi(dosyaAdi: string): Promise<boolean>;
    sentezle(metin: string, dosyaAdi: string): Promise<boolean>;
    kullanilmayanlariSil(korunacak: string[], onek: string): Promise<number>;
    konus(metin: string): Promise<boolean>;
    sustur(): Promise<void>;
}

const ExpoMuhafizAnons = requireOptionalNativeModule<AnonsNativeModule>('ExpoMuhafizAnons');

/** Kopru bu calisma ortaminda kullanilabilir mi? */
function kullanilabilirMi(): boolean {
    return Platform.OS === 'ios' && ExpoMuhafizAnons !== null;
}

/**
 * Cihazdaki Turkce sesin tanimlayicisi; yoksa `null`.
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
