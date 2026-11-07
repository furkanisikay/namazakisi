/**
 * iPhone'un SES KIMLIKLERI — paketlenmis sesler (`paket:<ad>`) ve kullanicinin iceri
 * aldigi dosyalar (`dosya:<dosyaAdi>`). SAF modul.
 *
 * iOS'ta bildirim sesi bildirimin ozelligidir ve bir DOSYA ADIdir: ya uygulama
 * paketinde (`app.json > expo-notifications.sounds`) ya da `Library/Sounds` altinda
 * (`UNNotificationSound` iki yere de bakar). Sistem ses secicisi YOKTUR → kullanici
 * uygulamanin kendi listesinden secer ya da kendi dosyasini ekler (native
 * `ExpoMuhafizAnons.sesIceAktar`: AVFoundation ile <=29,5 sn dogrusal PCM CAF).
 *
 * ANDROID KIMLIGI DEGISMEZ: Android'in `content://` kimligi ve kanal id'si
 * (`sesKimligi.sesKimliginiNormalize`) bu oneklere bakmaz; iPhone yedegi Android'e
 * tasininca bu kimlikler varsayilana duser (iOS'ta `content://`'in ikizi).
 *
 * Paketlenmis sesler projenin kendi sentezidir (`scripts/ios-paket-sesleri.sh`) —
 * lisans sorusu dogmaz.
 */

export const IOS_PAKET_ONEKI = 'paket:';
export const IOS_DOSYA_ONEKI = 'dosya:';

/**
 * Iceri alinan dosyalarin `Library/Sounds` adi: `kullanici_ses_<sha256-8>.caf`.
 * Onek anons klipleriyle (`muhafiz_anons_`) CAKISMAZ: iki copcu birbirinin dosyasina
 * dokunmaz. Native `ExpoMuhafizAnonsModule.kullaniciSesAdiGecerli` ile AYNI kural.
 */
export const IOS_KULLANICI_SES_ONEKI = 'kullanici_ses_';
const KULLANICI_SES_ADI = /^kullanici_ses_[0-9a-f]{8}\.caf$/;

/** Paketlenmis seslerin anahtarlari (sozluk: `hatirlatma.sesSecim.paket.<ad>`). */
export type PaketSesAdi = 'zil' | 'ikiton' | 'damla' | 'sabah';

export interface PaketSesi {
    ad: PaketSesAdi;
    /** Uygulama paketindeki dosya (app.json'da kayitli olmali — nobetci var). */
    dosya: string;
}

/** Listede gorunen sira = bu sira. Yeni ses: dosya + app.json + sozluk (78 dil). */
export const PAKET_SESLERI: readonly PaketSesi[] = [
    { ad: 'zil', dosya: 'zil_ios.wav' },
    { ad: 'ikiton', dosya: 'ikiton_ios.wav' },
    { ad: 'damla', dosya: 'damla_ios.wav' },
    { ad: 'sabah', dosya: 'sabah_ios.wav' },
];

const kimlikMi = (k: unknown): k is string => typeof k === 'string';

/** `paket:<ad>` kimligi. */
export function paketSesKimligi(ad: PaketSesAdi): string {
    return `${IOS_PAKET_ONEKI}${ad}`;
}

/** `dosya:<dosyaAdi>` kimligi. */
export function dosyaSesKimligi(dosyaAdi: string): string {
    return `${IOS_DOSYA_ONEKI}${dosyaAdi}`;
}

/** Bilinen paketlenmis ses; bilinmeyen/bozuk kimlikte `null`. */
export function paketSesiBul(kimlik: unknown): PaketSesi | null {
    if (!kimlikMi(kimlik) || !kimlik.startsWith(IOS_PAKET_ONEKI)) return null;
    const ad = kimlik.slice(IOS_PAKET_ONEKI.length);
    return PAKET_SESLERI.find((p) => p.ad === ad) ?? null;
}

/** Kullanici dosyasinin dogrulanmis `Library/Sounds` adi; gecersizse `null` (yol enjeksiyonu yok). */
export function kullaniciSesDosyasi(kimlik: unknown): string | null {
    if (!kimlikMi(kimlik) || !kimlik.startsWith(IOS_DOSYA_ONEKI)) return null;
    const ad = kimlik.slice(IOS_DOSYA_ONEKI.length);
    return KULLANICI_SES_ADI.test(ad) ? ad : null;
}

/** Bilinen paketlenmis ses mi? */
export function iosPaketSesiMi(kimlik: unknown): boolean {
    return paketSesiBul(kimlik) !== null;
}

/** Gecerli bir kullanici dosyasi kimligi mi? (Dosyanin DISKTE olup olmadigi ayri sorudur.) */
export function iosDosyaSesiMi(kimlik: unknown): boolean {
    return kullaniciSesDosyasi(kimlik) !== null;
}

/** iPhone'da secilmis (varsayilan olmayan) ses mi? */
export function iosSesiMi(kimlik: unknown): boolean {
    return iosPaketSesiMi(kimlik) || iosDosyaSesiMi(kimlik);
}

/**
 * Kimligin iPhone'daki DOSYA ADI (paketteki ya da `Library/Sounds` altindaki);
 * iPhone'da calinamayan kimlikte (varsayilan, Android `content://`, bozuk) `null`.
 */
export function iosSesDosyasi(kimlik: unknown): string | null {
    return paketSesiBul(kimlik)?.dosya ?? kullaniciSesDosyasi(kimlik);
}
