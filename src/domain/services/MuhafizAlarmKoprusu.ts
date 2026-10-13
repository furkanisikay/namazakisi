/**
 * GERÇEK ALARM köprüsü (issue #74) — `NativeModules.MuhafizAlarm` sarmalayıcısı.
 *
 * Native taraf `android/app/.../alarm/` (setAlarmClock + tam ekran alarm etkinliği).
 * Yalnız Android: iOS'ta alarm kanalı zamana duyarlı bildirim + uzun ses olarak
 * `IosMuhafizTeslimcisi` ile teslim edilir (AlarmKit gelene kadar).
 *
 * Hiçbir yöntem FIRLATMAZ: köprü yoksa (eski ikili, iOS, jest) güvenli varsayılan
 * döner — planlama asla bu köprü yüzünden durmamalı. `null` = "bilinmiyor"dur:
 * ekran bilinmeyen izin için uyarı GÖSTERMEZ (yanlış alarm, hiç uyarmamaktan kötüdür).
 */
import { NativeModules, Platform } from 'react-native';
import { Logger } from '../../core/utils/Logger';
import type { AlarmYuku } from '../../core/muhafiz/alarmYuku';

interface MuhafizAlarmModulu {
    planla(kimlik: string, tetikMs: number, yuk: string): Promise<boolean>;
    iptalEt(kimlik: string): Promise<void>;
    onekliIptalEt(onek: string): Promise<number>;
    bekleyenSayisi(): Promise<number>;
    kanallariTemizle(korunacak: string[]): Promise<void>;
    tamEkranIzniVarMi(): Promise<boolean>;
    tamAlarmIzniVarMi(): Promise<boolean>;
    tamEkranAyariniAc(): Promise<boolean>;
}

const modul = (): MuhafizAlarmModulu | null => {
    if (Platform.OS !== 'android') return null;
    return (NativeModules.MuhafizAlarm as MuhafizAlarmModulu | undefined) ?? null;
};

/** Gerçek alarm native olarak kurulabilir mi (köprü var mı)? */
export function alarmKoprusuVarMi(): boolean {
    return modul() != null;
}

/** Alarmı kurar. Kurulamazsa `false` → çağıran aynı tetiği NORMAL bildirim olarak kurar. */
export async function alarmPlanla(yuk: AlarmYuku): Promise<boolean> {
    const m = modul();
    if (!m) return false;
    try {
        return (await m.planla(yuk.kimlik, yuk.tetikMs, JSON.stringify(yuk))) === true;
    } catch (e) {
        Logger.warn('MuhafizAlarm', `Alarm kurulamadi: ${yuk.kimlik}`, e);
        return false;
    }
}

export function alarmIptalEt(kimlik: string): void {
    const m = modul();
    if (!m) return;
    m.iptalEt(kimlik).catch((e) => Logger.debug('MuhafizAlarm', 'Alarm iptal edilemedi', e));
}

/**
 * Öneki taşıyan TÜM alarmları iptal eder (yeniden planlama öncesi, uygulama içi "Kıldım").
 * Yeniden planlamada BEKLENMELİ: geç kalan bir iptal aynı turda kurulan alarmları silerdi.
 */
export async function onekliAlarmlariIptalEt(onek: string): Promise<void> {
    const m = modul();
    if (!m || !onek) return;
    try {
        await m.onekliIptalEt(onek);
    } catch (e) {
        Logger.debug('MuhafizAlarm', 'Alarmlar iptal edilemedi', e);
    }
}

/** Bekleyen alarm sayısı (bildirim sınırı rehberinin tanı ölçümü). */
export async function bekleyenAlarmSayisi(): Promise<number> {
    const m = modul();
    if (!m) return 0;
    try {
        const sayi = await m.bekleyenSayisi();
        return typeof sayi === 'number' && Number.isFinite(sayi) ? sayi : 0;
    } catch {
        return 0;
    }
}

/** Listede olmayan hash'li alarm kanallarını toplar (taban kanal korunur). */
export async function alarmKanallariniTemizle(korunacak: string[]): Promise<void> {
    const m = modul();
    if (!m) return;
    try {
        await m.kanallariTemizle(korunacak);
    } catch (e) {
        Logger.debug('MuhafizAlarm', 'Alarm kanallari toplanamadi', e);
    }
}

/** Tam ekran izni (Android 14+). `null` = bilinmiyor (köprü yok/hata). */
export async function tamEkranIzniVarMi(): Promise<boolean | null> {
    const m = modul();
    if (!m) return null;
    try {
        const sonuc = await m.tamEkranIzniVarMi();
        return typeof sonuc === 'boolean' ? sonuc : null;
    } catch {
        return null;
    }
}

/** Tam (exact) alarm izni. `null` = bilinmiyor. */
export async function tamAlarmIzniVarMi(): Promise<boolean | null> {
    const m = modul();
    if (!m) return null;
    try {
        const sonuc = await m.tamAlarmIzniVarMi();
        return typeof sonuc === 'boolean' ? sonuc : null;
    } catch {
        return null;
    }
}

/** Tam ekran izni ayarını açar (yoksa bildirim ayarlarına düşer). */
export async function tamEkranAyariniAc(): Promise<boolean> {
    const m = modul();
    if (!m) return false;
    try {
        return (await m.tamEkranAyariniAc()) === true;
    } catch {
        return false;
    }
}
