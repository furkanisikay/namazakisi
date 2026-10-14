/**
 * iOS TESLIM PLANI — bir `UyariPlani` iPhone'da NASIL duyulur?
 *
 * SAF modul: `react-native` ve `expo-*` IMPORT ETMEZ. Karar tablosu tek yerde
 * durur ve platform mock'suz test edilir.
 *
 * ---------------------------------------------------------------------------
 * KESINTI SEVIYESI (`interruptionLevel`)
 *
 * iOS'ta bir bildirimin Odak (Focus) modunu delip delmeyecegi bu alanla
 * belirlenir:
 *   `active`        — normal; Odak acikken SESSIZCE birikir.
 *   `timeSensitive` — Odak'i DELER, ekrani yakar. App ID'ye capability eklenir;
 *                     Apple ONAYI GEREKMEZ (Critical Alerts'in aksine).
 *
 * Hicbiri SESSIZ ANAHTARINI delmez — onu yalnizca AlarmKit yapar (issue #74,
 * yalniz gercek alarm adiminin ilk tetigi; `IosMuhafizTeslimcisi`).
 *
 * NEDEN HER SEVIYE `timeSensitive` DEGIL: Apple bu seviyenin "gercekten zamana
 * duyarli" bildirimlerle sinirli kullanilmasini bekler ve asiri kullanim App
 * Review'da sorun cikarir. Nazik hatirlatma (seviye 1) zamana duyarli DEGILDIR
 * — kullanici onu kacirsa bir sonraki adim zaten gelecek. Seviye 2'den itibaren
 * vakit daralmaya baslar; orada Odak'i delmek mesru.
 *
 * ---------------------------------------------------------------------------
 * SES
 *
 * iOS'ta ses KANAL degil BILDIRIM ozelligidir ve uygulama paketindeki bir dosya
 * ADIdir (<=30 sn). Kullanicinin Android'de sectigi `content://` URI'si iOS'ta
 * ANLAMSIZDIR (baska platformun kimligi) → varsayilana duser. Bu, yedek dosyasi
 * Android'den iPhone'a tasindiginda sessiz bir bozulma yerine ongorulebilir bir
 * geri duste sonuclanir.
 */
import type { UyariPlani } from '../motorAdaptoru';
import type { PlatformYetenekleri } from './platformYetenekleri';

/** iOS bildiriminin kesinti seviyesi. */
export type KesintiSeviyesi = 'active' | 'timeSensitive';

/**
 * Paketlenmis varsayilan bildirim sesi.
 *
 * `.wav` — Apple'in resmi olarak destekledigi kaplar aiff/wav/caf'tir; `.mp3`
 * bildirim sesi olarak GARANTI DEGILDIR (Android tarafi `res/raw/bildirim.mp3`
 * kullanmaya devam eder, o dosyaya dokunulmaz).
 *
 * DOSYA ADI NEDEN `bildirim_ios`, `bildirim` DEGIL:
 * `app.json > expo-notifications.sounds` dizisi PLATFORM ORTAKTIR ve
 * `withNotificationsAndroid > setNotificationSounds` dizideki her dosyayi
 * basename'iyle `android/app/src/main/res/raw/` altina KOPYALAR. Android kaynak
 * adlari uzantisiz turetildigi icin `bildirim.mp3` ve `bildirim.wav` ikisi de
 * `R.raw.bildirim` olur → AAPT2 "Duplicate resources" ile Android derlemesini
 * DURDURUR (`android-build.yml` prebuild calistirir). Farkli govde adi bu
 * cakismayi yapisal olarak imkansiz kilar. Alt cizgi zorunlu: Android kaynak
 * adlarinda tire (`-`) GECERSIZDIR.
 */
export const IOS_BILDIRIM_SESI = 'bildirim_ios.wav';

/**
 * GERCEK ALARM adiminin iOS sesi (issue #74) — `bildirim_ios.wav`'in 9 kez, araliklarla
 * tekrari (~28 sn; iOS 30 sn'yi asan bildirim sesini kirpmaz, HIC calmaz). AlarmKit
 * yoksa (iOS < 26, izin reddedildi, Odak filtresi sessiz) alarm, zamana duyarli bildirim
 * + bu uzun sesle teslim edilir; sessiz anahtarini DELMEZ (ekran bunu soyler). Govde adi Android `res/raw`'daki
 * hicbir kaynakla cakismaz (bkz. `IOS_BILDIRIM_SESI` notu).
 */
export const IOS_ALARM_SESI = 'alarm_ios.wav';

/** Bu seviyeden itibaren Odak delinir. */
export const TIME_SENSITIVE_ESIK_SEVIYESI = 2;

/** Teslim edilecek tek bir iOS uyarisi. */
export interface IosTeslim {
    /** 'alarm' = AlarmKit sistem alarmi (yalniz gercek alarm tetigi, iOS 26 + izin). */
    tur: 'bildirim' | 'alarm';
    kesintiSeviyesi: KesintiSeviyesi;
    /** Uygulama paketindeki ses dosyasinin adi. */
    ses: string;
}

/**
 * Kullanicinin sectigi ses kimligi iOS'ta kullanilabilir mi?
 *
 * Android'in `content://` URI'si ve `'varsayilan'` disindaki her sey iOS'ta
 * cozulemez → paketlenmis varsayilana duseriz.
 */
export function iosSesiCoz(bildirimSesi: string | undefined): string {
    if (!bildirimSesi) return IOS_BILDIRIM_SESI;
    if (bildirimSesi.startsWith('content://')) return IOS_BILDIRIM_SESI;
    // Sesli adimin anons klibi BURADA secilmez: klip adi cozulmus metne ve cihazdaki
    // Turkce sese baglidir, dosyanin var olup olmadigi da diske sorulmalidir →
    // `IosMuhafizTeslimcisi.anonsSesiniCoz` bu sonucun USTUNE yazar.
    return IOS_BILDIRIM_SESI;
}

/** Seviyeye gore kesinti seviyesi (tek kural, tek yer). */
export function kesintiSeviyesiSec(seviye: number): KesintiSeviyesi {
    return seviye >= TIME_SENSITIVE_ESIK_SEVIYESI ? 'timeSensitive' : 'active';
}

/**
 * Bir `UyariPlani`yi iOS teslimine cevir.
 *
 * `tur: 'alarm'` YALNIZ gercek alarm tetiginde (`uyari.alarm` — adimin ILK tetigi,
 * kullanicinin acikca sectigi alarm kanali) VE AlarmKit kullanilabilirken
 * (`yetenekler.gercekAlarm`). Acil ton (`acilKanal`) alarma CEVRILMEZ: acil adim son
 * dakikalarda her dakika tekrarlanir; her biri tam ekran alarm olsaydi kullanici
 * dakikada bir alarm susturmak zorunda kalirdi (Android'de de acil kanal bildirimdir,
 * alarm degil).
 */
export function iosTesliminiCoz(
    uyari: UyariPlani,
    yetenekler: PlatformYetenekleri
): IosTeslim {
    // GERCEK ALARM KANALI (issue #74): AlarmKit varsa sistem alarmi; yoksa zamana duyarli
    // bildirim + UZUN ses. Seviye 1 (nazik) bile olsa Odak'i deler — kullanici bu adim
    // icin acikca "alarm" istedi; nazik tonun zamana duyarli olmama gerekcesi burada gecmez.
    if (uyari.alarm === true) {
        return {
            tur: yetenekler.gercekAlarm ? 'alarm' : 'bildirim',
            kesintiSeviyesi: 'timeSensitive',
            ses: IOS_ALARM_SESI,
        };
    }

    return {
        tur: 'bildirim',
        kesintiSeviyesi: kesintiSeviyesiSec(uyari.seviye),
        ses: iosSesiCoz(uyari.bildirimSesi),
    };
}
