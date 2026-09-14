/**
 * PLATFORM YETENEKLERI — "bu cihazda neyi gercekten yapabiliriz?"
 *
 * SAF modul: `react-native` IMPORT ETMEZ. Platform bir PARAMETREDIR, global
 * degil. Iki sebebi var:
 *   1. Jest'te platform mock'lamadan test edilebilir (bu repoda jest'in
 *      varsayilan `Platform.OS` degeri **'ios'**; global okuyan saf kod
 *      testlerde sessizce yanlis dala duserdi).
 *   2. Ekran ve motor AYNI yetenek nesnesini paylasir → "ekranda gorunuyor ama
 *      calismiyor" ayrismasi yapisal olarak imkansiz hale gelir.
 *
 * Yetenek "ozellik acik mi" DEMEK DEGILDIR; "platform buna izin veriyor mu"
 * demektir. Kullanici tercihi matriste yasar, burada degil.
 */

export type MuhafizPlatformu = 'android' | 'ios';

export interface PlatformYetenekleri {
    platform: MuhafizPlatformu;

    /**
     * Kullanici kendi bildirim sesini SECEBILIR mi?
     *
     * Android: sistem `RingtoneManager` secicisi (`content://`).
     * iOS: sistem secici YOKTUR. Ses uygulama paketindeki bir dosya adidir
     * (<=30 sn); kullanicinin kendi dosyasini almak native AVFoundation ile
     * CAF'a cevirmeyi gerektirir → Faz 1 kapsam disi.
     */
    sesSecici: boolean;

    /**
     * Anons metni SERBESTCE yazilabilir mi?
     *
     * Android: evet — metin calisma aninda TTS ile seslendirilir.
     * iOS: HAYIR. iOS'ta belirli bir saatte arka planda kod calistirilamaz,
     * dolayisiyla metin calisma aninda seslendirilemez; anons on-kayitli bir
     * ses klibidir ve klip seti sabittir (Faz 2).
     */
    serbestAnonsMetni: boolean;

    /**
     * Titresim ADIM BAZINDA secilebilir mi?
     *
     * Android: evet — desen kanal ozelligidir, kanal id'sine islenir.
     * iOS: HAYIR. Bildirim haptigi sistem ayarina baglidir, uygulama adim
     * basina kontrol edemez → ekranda anahtar gosterilmez (yoksa kullanici
     * hicbir seyi degistirmeyen bir anahtar cevirir).
     */
    titresimSecimi: boolean;

    /**
     * Cihazin SESSIZLIGINI (sessiz anahtari / Odak) delebilir miyiz?
     *
     * Android: acil kanal `setBypassDnd(true)` ile deler.
     * iOS: yalniz AlarmKit deler (Faz 3) — `false` iken acil adim da normal
     * bildirime duser ve ekran bunu KULLANICIYA SOYLER (sessiz sapma yok).
     */
    sessizligiDelebilir: boolean;
}

/** Android — bugunku davranisin tamami. Hicbir yetenek kisitli degil. */
export const ANDROID_YETENEKLERI: PlatformYetenekleri = {
    platform: 'android',
    sesSecici: true,
    serbestAnonsMetni: true,
    titresimSecimi: true,
    sessizligiDelebilir: true,
};

/**
 * iOS yetenekleri.
 *
 * @param alarmKitVar Faz 3'te AlarmKit kullanilabilir mi (izin + iOS 26+).
 *                    Faz 1/2'de daima `false`.
 */
export function iosYetenekleri(alarmKitVar: boolean = false): PlatformYetenekleri {
    return {
        platform: 'ios',
        sesSecici: false,
        serbestAnonsMetni: false,
        titresimSecimi: false,
        sessizligiDelebilir: alarmKitVar,
    };
}

/** Platform adindan varsayilan yetenekleri uret. */
export function yetenekleriSec(
    platform: MuhafizPlatformu,
    alarmKitVar: boolean = false
): PlatformYetenekleri {
    return platform === 'ios' ? iosYetenekleri(alarmKitVar) : ANDROID_YETENEKLERI;
}
