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
     * Kullanici bildirim sesini SECEBILIR mi? Iki platformda da EVET.
     *
     * Android: sistem `RingtoneManager` secicisi (`content://`) + kendi dosyasi.
     * iOS: uygulamanin kendi listesi (`paket:<ad>`) + kendi dosyasi (`dosya:<ad>`,
     * AVFoundation ile <=29,5 sn CAF'a cevrilip `Library/Sounds`'a yazilir). Nasil
     * secildigi `sistemSesSecici`'dedir.
     */
    sesSecici: boolean;

    /**
     * Ses secimi ISLETIM SISTEMININ seciciyle mi yapilir?
     *
     * Android: evet — `RingtoneManager` secicisi ("Telefonun sesleri").
     * iOS: HAYIR — sistem secici yoktur; ekran uygulamanin ses listesini satirin
     * altinda cizer (modal degil: iOS iki kardes modali ayni anda sunamaz).
     */
    sistemSesSecici: boolean;

    /**
     * Anons metni SERBESTCE yazilabilir mi?
     *
     * Android: evet — metin calisma aninda TTS ile seslendirilir.
     * iOS: EVET (Faz 2). Belirli bir saatte arka planda kod calistirilamaz, ama
     * metin planlama sirasinda cihazda (`AVSpeechSynthesizer`, cevrimdisi) ses
     * dosyasina cevrilir ve bildirim o dosyayi calar. Metin 300 karakterle
     * sinirlidir (`ANONS_METIN_UST_SINIRI`): iOS 30 sn'yi asan bildirim sesini
     * kirpmaz, onun yerine SISTEMIN varsayilan sesini calar (Apple `UNNotificationSound`)
     * — anons hic duyulmaz.
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
     * iOS: HAYIR — bildirim (acil ton dahil) sessiz anahtarini delmez; ekran bunu
     * KULLANICIYA SOYLER (sessiz sapma yok). AlarmKit (iOS 26) YALNIZ gercek alarm
     * adimini deler → o ayri yetenektir (`gercekAlarm`); acil tonu alarma CEVIRMEZ.
     */
    sessizligiDelebilir: boolean;

    /**
     * Gercek alarm adimi (issue #74) SISTEM ALARMI olarak kurulabilir mi?
     *
     * Android: evet — `setAlarmClock` + alarm kanali (izin yoksa normal bildirime duser).
     * iOS: yalniz AlarmKit kullanilabilir VE izin verilmisken (iOS 26+). `false` iken
     * alarm adimi zamana duyarli bildirim + uzun sesle gelir ve ekran bunu soyler.
     */
    gercekAlarm: boolean;
}

/** Android — bugunku davranisin tamami. Hicbir yetenek kisitli degil. */
export const ANDROID_YETENEKLERI: PlatformYetenekleri = {
    platform: 'android',
    sesSecici: true,
    sistemSesSecici: true,
    serbestAnonsMetni: true,
    titresimSecimi: true,
    sessizligiDelebilir: true,
    gercekAlarm: true,
};

/**
 * iOS yetenekleri.
 *
 * @param alarmKitVar AlarmKit kullanilabilir mi (iOS 26+ VE izin verildi). Yalniz
 *                    `gercekAlarm`'i acar; `sessizligiDelebilir` iOS'ta daima `false`
 *                    (acil tonlu BILDIRIM sessiz anahtarini yine delmez).
 */
export function iosYetenekleri(alarmKitVar: boolean = false): PlatformYetenekleri {
    return {
        platform: 'ios',
        sesSecici: true,
        sistemSesSecici: false,
        serbestAnonsMetni: true,
        titresimSecimi: false,
        sessizligiDelebilir: false,
        gercekAlarm: alarmKitVar,
    };
}

/** Platform adindan varsayilan yetenekleri uret. */
export function yetenekleriSec(
    platform: MuhafizPlatformu,
    alarmKitVar: boolean = false
): PlatformYetenekleri {
    return platform === 'ios' ? iosYetenekleri(alarmKitVar) : ANDROID_YETENEKLERI;
}
