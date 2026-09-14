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
 * Hicbiri SESSIZ ANAHTARINI delmez — onu yalnizca AlarmKit yapar (Faz 3).
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

/** Bu seviyeden itibaren Odak delinir. */
export const TIME_SENSITIVE_ESIK_SEVIYESI = 2;

/** Teslim edilecek tek bir iOS uyarisi. */
export interface IosTeslim {
    /** Faz 1'de daima 'bildirim'; Faz 3'te acil adim 'alarm' olur. */
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
    // Faz 2'de on-kayitli anons klipleri buraya baglanir.
    return IOS_BILDIRIM_SESI;
}

/** Seviyeye gore kesinti seviyesi (tek kural, tek yer). */
export function kesintiSeviyesiSec(seviye: number): KesintiSeviyesi {
    return seviye >= TIME_SENSITIVE_ESIK_SEVIYESI ? 'timeSensitive' : 'active';
}

/**
 * Bir `UyariPlani`yi iOS teslimine cevir.
 *
 * `acilKanal` bayragi Faz 1'de teslim TURUNU degistirmez (AlarmKit Faz 3'te
 * gelir) ama `yetenekler.sessizligiDelebilir` false oldugu surece bunun
 * kullaniciya SOYLENMESI gerekir — ekran bu bilgiyi ayni yetenek nesnesinden
 * okur, dolayisiyla ikisi ayrisamaz.
 */
export function iosTesliminiCoz(
    uyari: UyariPlani,
    yetenekler: PlatformYetenekleri
): IosTeslim {
    const alarmOlmali = uyari.acilKanal === true && yetenekler.sessizligiDelebilir;

    return {
        tur: alarmOlmali ? 'alarm' : 'bildirim',
        kesintiSeviyesi: kesintiSeviyesiSec(uyari.seviye),
        ses: iosSesiCoz(uyari.bildirimSesi),
    };
}
