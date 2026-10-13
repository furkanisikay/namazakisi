/**
 * Gerçek alarm anahtarının altındaki bilgi satırları (issue #74) — SAF.
 *
 * "Sessiz sapma bırakma" kuralı (Faz 0): alarm her cihazda kullanıcının kurduğu gibi
 * çalmaz — iPhone'da gerçek alarm yok (AlarmKit bekleniyor), Android 14+'ta tam ekran
 * izni olmayabilir, Android 12'de tam alarm izni kapatılmış olabilir. Ekranda
 * SÖYLENMEZSE kullanıcı "alarm kurdum ama çalmadı" yaşar.
 *
 * `null` izin = bilinmiyor → o satır ÜRETİLMEZ (yanlış alarm, hiç uyarmamaktan kötüdür).
 */
import type { MuhafizPlatformu } from './ios/platformYetenekleri';

export interface AlarmNotu {
    tip: 'uyari' | 'bilgi';
    metin: string;
    /** Satırda eylem düğmesi gösterilsin mi (tam ekran izni ayarı). */
    eylem?: 'tamEkranIzni';
}

export interface AlarmNotuGirdisi {
    platform: MuhafizPlatformu;
    /** Android 14+ tam ekran izni; `null` bilinmiyor. */
    tamEkran: boolean | null;
    /** Tam (exact) alarm izni; `null` bilinmiyor. */
    tamAlarm: boolean | null;
}

export function alarmNotlariniOlustur(g: AlarmNotuGirdisi): AlarmNotu[] {
    if (g.platform === 'ios') {
        return [
            {
                tip: 'bilgi',
                metin:
                    "iPhone'da şimdilik zamana duyarlı bir bildirim ve yaklaşık 30 saniyelik bir sesle gelir; sessiz anahtarı açıkken duyulmaz. Gerçek alarm iOS 26 AlarmKit desteğiyle gelecek.",
            },
        ];
    }
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
