/**
 * Gerçek alarmın (issue #74) izinleri.
 *
 * Android: tam ekran (Android 14+) ve tam alarm izni.
 * iOS: AlarmKit durumu (iOS 26; `desteklenmiyor` | `belirsiz` | `izinli` | `reddedildi`).
 *
 * Yalnız `etkin` iken okunur ve ayar ekranından dönüşte (`AppState` 'active') yeniden
 * okunur — pil rehberi deseni. `null` = bilinmiyor: ekran o durumda HİÇBİR UYARI
 * göstermez.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking } from 'react-native';
import {
    tamAlarmIzniVarMi,
    tamEkranAyariniAc,
    tamEkranIzniVarMi,
} from '../../domain/services/MuhafizAlarmKoprusu';
import { kisaBildirimGoster } from '../components/common/KisaBildirim';
import type { MuhafizPlatformu } from '../../core/muhafiz/ios/platformYetenekleri';
import {
    alarmKitDurumu,
    alarmKitIzniIste,
    type AlarmKitDurumu,
} from '../../../modules/expo-muhafiz-alarmkit/src';

export interface AlarmIzinleri {
    /** Kilit ekranında tam ekran açılabilir mi? (Android) */
    tamEkran: boolean | null;
    /** Alarm tam saatinde kurulabilir mi? false → alarm normal bildirime düşer. (Android) */
    tamAlarm: boolean | null;
    /** iOS AlarmKit durumu; Android'de/bilinmiyorsa `null`. */
    alarmKit: AlarmKitDurumu | null;
    /** İzin ayarını açar (Android: tam ekran izni; iOS: uygulamanın Ayarlar sayfası). */
    ayariAc: () => Promise<void>;
    /**
     * iOS: sistem alarm izni penceresini açar. `yenidenPlanla` (varsayılan true): izin
     * verilirse muhafız mevcut ayarlarla hemen yeniden planlanır — matris değişmediği için
     * ekranın kendi planlaması koşmaz. Sonuç durum döner (Android'de `null`).
     */
    izinIste: (yenidenPlanla?: boolean) => Promise<AlarmKitDurumu | null>;
}

/** Muhafızı mevcut ayarlarla yeniden planlar (tembel: servis native köprü grafiği çeker). */
function muhafiziYenidenPlanla(): void {
    try {
        const { ArkaplanMuhafizServisi } =
            require('../../domain/services/ArkaplanMuhafizServisi') as typeof import('../../domain/services/ArkaplanMuhafizServisi');
        void ArkaplanMuhafizServisi.getInstance().yenidenPlanla().catch(() => undefined);
    } catch {
        // Planlama bir sonraki açılış/15 dk turunda yapılır.
    }
}

export function useAlarmIzinleri(etkin: boolean, platform: MuhafizPlatformu = 'android'): AlarmIzinleri {
    const [tamEkran, setTamEkran] = useState<boolean | null>(null);
    const [tamAlarm, setTamAlarm] = useState<boolean | null>(null);
    const [alarmKit, setAlarmKit] = useState<AlarmKitDurumu | null>(null);
    const donusBekleniyor = useRef(false);
    const ios = platform === 'ios';

    const oku = useCallback(async (): Promise<boolean | null> => {
        if (ios) {
            const durum = await alarmKitDurumu();
            setAlarmKit(durum);
            return durum === 'izinli';
        }
        const [ekran, alarm] = await Promise.all([tamEkranIzniVarMi(), tamAlarmIzniVarMi()]);
        setTamEkran(ekran);
        setTamAlarm(alarm);
        return ekran;
    }, [ios]);

    useEffect(() => {
        if (!etkin) return;
        let iptal = false;
        void (async () => {
            if (ios) {
                const durum = await alarmKitDurumu();
                if (!iptal) setAlarmKit(durum);
                return;
            }
            const [ekran, alarm] = await Promise.all([tamEkranIzniVarMi(), tamAlarmIzniVarMi()]);
            if (iptal) return;
            setTamEkran(ekran);
            setTamAlarm(alarm);
        })();
        return () => {
            iptal = true;
        };
    }, [etkin, ios]);

    useEffect(() => {
        const abonelik = AppState.addEventListener('change', async (durum) => {
            if (durum !== 'active' || !donusBekleniyor.current) return;
            donusBekleniyor.current = false;
            if ((await oku()) !== true) return;
            if (ios) {
                muhafiziYenidenPlanla();
                kisaBildirimGoster('Gerçek alarm artık iPhone alarmı olarak çalacak');
            } else {
                kisaBildirimGoster('Alarm artık kilit ekranında tam ekran açılacak');
            }
        });
        return () => abonelik.remove();
    }, [oku, ios]);

    const ayariAc = useCallback(async () => {
        donusBekleniyor.current = true;
        let acildi = false;
        if (ios) {
            try {
                await Linking.openSettings();
                acildi = true;
            } catch {
                acildi = false;
            }
        } else {
            acildi = await tamEkranAyariniAc();
        }
        if (!acildi) {
            donusBekleniyor.current = false;
            kisaBildirimGoster('Ayar ekranı açılamadı; telefonunuzun Ayarlar bölümünden açabilirsiniz.', true);
        }
    }, [ios]);

    const izinIste = useCallback(
        async (yenidenPlanla: boolean = true): Promise<AlarmKitDurumu | null> => {
            if (!ios) return null;
            const once = await alarmKitDurumu();
            const sonra = once === 'belirsiz' ? await alarmKitIzniIste() : once;
            setAlarmKit(sonra);
            if (yenidenPlanla && once !== 'izinli' && sonra === 'izinli') muhafiziYenidenPlanla();
            return sonra;
        },
        [ios]
    );

    return { tamEkran, tamAlarm, alarmKit, ayariAc, izinIste };
}
