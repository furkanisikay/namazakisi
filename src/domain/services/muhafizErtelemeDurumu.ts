/**
 * MUHAFIZ ERTELEMESİ — etkin ertelemeleri okuma + "ertelendi" gözlemcisi (issue #289).
 *
 * Ertelemenin TEK doğru kaynağı bekleyen bildirim listesindeki kopyadır
 * (`muhafiz_<gün>_vakit_<vakit>_ertele`, `data.ertelemeHedefMs`). Android'de
 * kopyayı native kurar (`BildirimErteleIsleyici`), iOS'ta JS
 * (`MuhafizErtelemeServisi`); ikisi de JS'e haber verir:
 *   - Android: uygulama ön plandaysa native `MuhafizErtelendi` olayı (App.tsx
 *     dinler), değilse headless `KildimKuyrugu` görevi `neden: 'ertele'` ile;
 *   - iOS: `MuhafizErtelemeServisi` doğrudan `ertelemeDegistiBildir()`.
 *
 * Dinleyiciler: ön plan muhafızı (`NamazMuhafiziServisi` — banner/ses/anons
 * susar) ve saat (`WearSenkronServisi` — bileğe giden hazır plan süzülür).
 *
 * AYRI DOSYA OLMASI BİLİNÇLİ (`muhafizPlaniGozlemcisi` deseni): yalnız
 * expo-notifications'a dokunur; native TTS köprüsünü çekmez.
 */
import * as Notifications from 'expo-notifications';
import { etkinErtelemeler } from '../../core/muhafiz/erteleme';
import { alarmKitErtelemeleri } from '../../core/muhafiz/ios/alarmKit';
import { alarmKitKayitlari } from '../../../modules/expo-muhafiz-alarmkit/src';

/** Native `BildirimErteleIsleyici.OLAY_ADI` ile AYNI olmalı. */
export const MUHAFIZ_ERTELENDI_OLAYI = 'MuhafizErtelendi';

/** Headless `KildimKuyrugu` görevine native'in eklediği neden (`KildimGorevServisi.NEDEN_ERTELE`). */
export const ERTELEME_GOREV_NEDENI = 'ertele';

/**
 * iOS'ta "10 dk ertele" ALARM ekranından basıldıysa (AlarmKit, issue #74) ertelenen kopya
 * bildirim değil yeni bir ALARMDIR → bekleyen bildirimlerde görünmez; alarm kaydından
 * okunur. Modül yoksa (Android, iOS < 26, jest) boş. Asla fırlatmaz.
 */
export async function alarmErtelemeleriniOku(): Promise<Record<string, number>> {
    try {
        return alarmKitErtelemeleri(await alarmKitKayitlari());
    } catch {
        return {};
    }
}

/** Bekleyen bildirimlerden + iOS alarm ertelemelerinden etkin ertelemeler (`<gün>_<vakit>` → hedef ms). Asla fırlatmaz. */
export async function bekleyenErtelemeleriOku(): Promise<Record<string, number>> {
    let bildirimden: Record<string, number> = {};
    try {
        const bekleyenler = await Notifications.getAllScheduledNotificationsAsync();
        bildirimden = etkinErtelemeler(Array.isArray(bekleyenler) ? bekleyenler : []);
    } catch {
        bildirimden = {};
    }
    return { ...bildirimden, ...(await alarmErtelemeleriniOku()) };
}

type Dinleyici = () => void;

/** Adlı yuvalar: aynı adla yeniden kayıt ÇOĞALTMAZ, yerine geçer (`LocalNamazServisi` deseni). */
const dinleyiciler = new Map<string, Dinleyici>();

/** @returns aboneliği kaldıran fonksiyon (yalnız hâlâ aynı dinleyiciyse kaldırır). */
export function ertelemeDinleyicisiEkle(ad: string, fn: Dinleyici): () => void {
    dinleyiciler.set(ad, fn);
    return () => {
        if (dinleyiciler.get(ad) === fn) dinleyiciler.delete(ad);
    };
}

/** Bir erteleme kuruldu/değişti. Her dinleyici kendi try'ında; biri patlarsa diğerleri yine çalışır. */
export function ertelemeDegistiBildir(): void {
    for (const fn of [...dinleyiciler.values()]) {
        try {
            fn();
        } catch {
            // Dinleyici hatası erteleme akışını düşürmemeli.
        }
    }
}
