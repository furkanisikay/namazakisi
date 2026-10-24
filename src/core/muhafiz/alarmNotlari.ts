/**
 * Gerçek alarm anahtarının altındaki bilgi satırları (issue #74) — SAF.
 *
 * "Sessiz sapma bırakma" kuralı (Faz 0): alarm her cihazda kullanıcının kurduğu gibi
 * çalmaz — iPhone'da gerçek alarm yalnız iOS 26 + AlarmKit izniyle var, Android 14+'ta
 * tam ekran izni olmayabilir, Android 12'de tam alarm izni kapatılmış olabilir. Ekranda
 * SÖYLENMEZSE kullanıcı "alarm kurdum ama çalmadı" yaşar.
 *
 * `null` izin = bilinmiyor → o satır ÜRETİLMEZ (yanlış alarm, hiç uyarmamaktan kötüdür).
 */
import type { MuhafizPlatformu } from './ios/platformYetenekleri';
import type { AlarmKitDurumu } from './ios/alarmKit';
import { bicim, metin } from '../dil/aktifDil';

export interface AlarmNotu {
    tip: 'uyari' | 'bilgi';
    metin: string;
    /**
     * Satırın eylem düğmesi: Android tam ekran izni ayarı, iOS uygulamanın Ayarlar
     * sayfası (AlarmKit izni reddedildiyse) ya da sistem alarm izni penceresi.
     */
    eylem?: 'tamEkranIzni' | 'ayarlar' | 'alarmIzni' | 'tamAlarm';
}

export interface AlarmNotuGirdisi {
    platform: MuhafizPlatformu;
    /** Android 14+ tam ekran izni; `null` bilinmiyor. */
    tamEkran: boolean | null;
    /** Tam (exact) alarm izni; `null` bilinmiyor. */
    tamAlarm: boolean | null;
    /** iOS AlarmKit durumu (iOS 26); `null`/verilmezse bilinmiyor → satır ÜRETİLMEZ. */
    alarmKit?: AlarmKitDurumu | null;
    /**
     * iOS ana sürümü (`core/cihaz/surum`). AlarmKit `desteklenmiyor` üç durumu tek kovaya
     * atar: iOS < 26, modül yok ve geçici HATA. "iOS 26'ya güncelleyin" yalnız sürüm
     * GERÇEKTEN 26'nın altındaysa söylenir; iOS 26+ ya da bilinmeyen sürümde nötr satır.
     */
    iosSurum?: number | null;
}

/** AlarmKit'in geldiği iOS sürümü. */
export const ALARMKIT_IOS_SURUMU = 26;

/**
 * iPhone'da AlarmKit yokken (iOS < 26) alarm adımının gerçekte nasıl geldiği.
 * `iosSurum` kullanıcıya gösterilir ("Bu iPhone iOS 18").
 */
export function iosAlarmsizNotu(iosSurum: number): string {
    return bicim(metin().muhafizAyar.alarmNot.iosAlarmsiz, { gerekli: ALARMKIT_IOS_SURUMU, surum: iosSurum });
}

/** AlarmKit `desteklenmiyor` ama sürüm eski DEĞİL ya da bilinmiyor: sürüm iddiasız satır. */
export const iosAlarmNotrNotu = (): string => metin().muhafizAyar.alarmNot.iosNotr;

/**
 * AlarmKit `desteklenmiyor` iken sürüme göre karar: iOS < 26 → sürüm (not yazılır);
 * iOS 26+ (geçici hata / modülsüz build) ya da bilinmeyen sürüm → `null` (sus).
 */
export function iosAlarmKitYokNedeni(iosSurum: number | null | undefined): number | null {
    return typeof iosSurum === 'number' && iosSurum > 0 && iosSurum < ALARMKIT_IOS_SURUMU ? iosSurum : null;
}

function iosNotlari(durum: AlarmKitDurumu | null | undefined, iosSurum: number | null | undefined): AlarmNotu[] {
    const n = metin().muhafizAyar.alarmNot;
    switch (durum) {
        case 'izinli':
            // Üç sessiz sapma da SÖYLENİR, ama tek paragrafa yığılmadan: (1) ses AlarmKit'in
            // varsayılan alarm sesidir, seçilen ses yok sayılır; (2) "Kıldım" kilit açtırır
            // (Android M4 ikizi); (3) Odak filtresi PLANLAMA anında okunur — sonradan açılan
            // Odak kurulu alarmı hemen susturmaz.
            return [
                { tip: 'bilgi', metin: n.izinliSes },
                { tip: 'bilgi', metin: n.izinliKildim },
                { tip: 'bilgi', metin: n.izinliOdak },
            ];
        case 'belirsiz':
            return [
                {
                    tip: 'bilgi',
                    metin: n.belirsiz,
                    eylem: 'alarmIzni',
                },
            ];
        case 'reddedildi':
            return [
                {
                    tip: 'uyari',
                    metin: n.reddedildi,
                    eylem: 'ayarlar',
                },
            ];
        case 'desteklenmiyor': {
            // Sürüm cümlesi yalnız sürüm GERÇEKTEN eskiyse. iOS 26+'da (geçici hata, modülsüz
            // build) ya da sürüm bilinmiyorken nötr satır: sürüm iddiası yok, ama adımın
            // bildirimle geldiği her durumda doğru (sessiz sapma da yok).
            const surum = iosAlarmKitYokNedeni(iosSurum);
            return [{ tip: 'bilgi', metin: surum === null ? n.iosNotr : iosAlarmsizNotu(surum) }];
        }
        default:
            // Bilinmiyor (durum henüz okunmadı): yanlış bilgi vermektense satır yok.
            return [];
    }
}

export function alarmNotlariniOlustur(g: AlarmNotuGirdisi): AlarmNotu[] {
    if (g.platform === 'ios') return iosNotlari(g.alarmKit, g.iosSurum);
    const notlar: AlarmNotu[] = [];
    const n = metin().muhafizAyar.alarmNot;
    if (g.tamAlarm === false) {
        notlar.push({
            tip: 'uyari',
            metin: n.tamAlarm,
            eylem: 'tamAlarm',
        });
    }
    if (g.tamEkran === false) {
        notlar.push({
            tip: 'uyari',
            metin: n.tamEkran,
            eylem: 'tamEkranIzni',
        });
    }
    return notlar;
}
