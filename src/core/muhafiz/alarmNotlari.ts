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

export interface AlarmNotu {
    tip: 'uyari' | 'bilgi';
    metin: string;
    /**
     * Satırın eylem düğmesi: Android tam ekran izni ayarı, iOS uygulamanın Ayarlar
     * sayfası (AlarmKit izni reddedildiyse) ya da sistem alarm izni penceresi.
     */
    eylem?: 'tamEkranIzni' | 'ayarlar' | 'alarmIzni';
}

export interface AlarmNotuGirdisi {
    platform: MuhafizPlatformu;
    /** Android 14+ tam ekran izni; `null` bilinmiyor. */
    tamEkran: boolean | null;
    /** Tam (exact) alarm izni; `null` bilinmiyor. */
    tamAlarm: boolean | null;
    /** iOS AlarmKit durumu (iOS 26); `null`/verilmezse bilinmiyor → satır ÜRETİLMEZ. */
    alarmKit?: AlarmKitDurumu | null;
}

/** iPhone'da AlarmKit yokken (iOS < 26) alarm adımının gerçekte nasıl geldiği. */
export const IOS_ALARMSIZ_NOTU =
    "iPhone'da iOS 26 öncesinde zamana duyarlı bir bildirim ve yaklaşık 30 saniyelik bir sesle gelir; sessiz anahtarı açıkken duyulmaz. iOS 26'ya güncellediğinizde gerçek alarm olarak çalar.";

function iosNotlari(durum: AlarmKitDurumu | null | undefined): AlarmNotu[] {
    switch (durum) {
        case 'izinli':
            return [
                {
                    tip: 'bilgi',
                    // Üç sessiz sapma da SÖYLENİR: (1) ses AlarmKit'in varsayılan alarm
                    // sesidir, seçilen ses yok sayılır; (2) "Kıldım" kilit açtırır (Android
                    // M4 ikizi); (3) Odak filtresi PLANLAMA anında okunur — sonradan açılan
                    // Odak kurulu alarmı susturmaz, ancak bir sonraki planlama turu kaldırır.
                    metin:
                        "İlk hatırlatma iPhone'unuzun alarmı olarak, iPhone'un varsayılan alarm sesiyle çalar (bu adım için seçtiğiniz ses kullanılmaz); sessiz anahtarı ve Odak açıkken de duyulur. Alarm ekranında durdurabilir ya da 10 dakika erteleyebilirsiniz; vaktin çıkmasına az kaldıysa ikinci düğme \"Kıldım\" olur ve kilit açıkken işaretler. Uygulamanın Odak filtresiyle hatırlatmaları sessize aldıysanız alarm kurulmaz; ancak filtreyi alarm kurulduktan sonra açarsanız o alarm, plan yenilenene kadar yine çalar.",
                },
            ];
        case 'belirsiz':
            return [
                {
                    tip: 'bilgi',
                    metin: "Gerçek alarm için iPhone'unuzun bir kez izin vermesi gerekiyor. İzin verilene kadar bu adım uzun sesli bir bildirimle gelir.",
                    eylem: 'alarmIzni',
                },
            ];
        case 'reddedildi':
            return [
                {
                    tip: 'uyari',
                    metin:
                        "Alarm izni kapalı; bu adım zamana duyarlı bir bildirim ve yaklaşık 30 saniyelik bir sesle gelir, sessiz anahtarı açıkken duyulmaz. Ayarlar'dan \"Alarmlar\" iznini açabilirsiniz.",
                    eylem: 'ayarlar',
                },
            ];
        case 'desteklenmiyor':
            return [{ tip: 'bilgi', metin: IOS_ALARMSIZ_NOTU }];
        default:
            // Bilinmiyor (durum henüz okunmadı): yanlış bilgi vermektense satır yok.
            return [];
    }
}

export function alarmNotlariniOlustur(g: AlarmNotuGirdisi): AlarmNotu[] {
    if (g.platform === 'ios') return iosNotlari(g.alarmKit);
    const notlar: AlarmNotu[] = [];
    if (g.tamAlarm === false) {
        notlar.push({
            tip: 'uyari',
            metin:
                'Tam saatinde alarm kurma izni ("Alarmlar ve hatırlatıcılar") kapalı; bu adım şimdilik normal bildirimle gelir.',
        });
    }
    if (g.tamEkran === false) {
        notlar.push({
            tip: 'uyari',
            metin:
                'Kilit ekranında tam ekran açılması için izin gerekiyor. İzin verilmezse alarm ekranın üstünde bildirim olarak çalar.',
            eylem: 'tamEkranIzni',
        });
    }
    return notlar;
}
