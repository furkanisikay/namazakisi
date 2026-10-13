/**
 * Gerçek alarmın (issue #74) Android izinleri: tam ekran (Android 14+) ve tam alarm.
 *
 * Yalnız `etkin` iken okunur (alarm anahtarı açık bir adım detayı) ve ayar ekranından
 * dönüşte (`AppState` 'active') yeniden okunur — pil rehberi deseni. `null` =
 * bilinmiyor (iOS, köprü yok): ekran o durumda HİÇBİR UYARI göstermez.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import {
    tamAlarmIzniVarMi,
    tamEkranAyariniAc,
    tamEkranIzniVarMi,
} from '../../domain/services/MuhafizAlarmKoprusu';
import { kisaBildirimGoster } from '../components/common/KisaBildirim';

export interface AlarmIzinleri {
    /** Kilit ekranında tam ekran açılabilir mi? */
    tamEkran: boolean | null;
    /** Alarm tam saatinde kurulabilir mi? false → alarm normal bildirime düşer. */
    tamAlarm: boolean | null;
    /** Tam ekran izni ayarını açar; dönüşte durum yeniden okunur. */
    ayariAc: () => Promise<void>;
}

export function useAlarmIzinleri(etkin: boolean): AlarmIzinleri {
    const [tamEkran, setTamEkran] = useState<boolean | null>(null);
    const [tamAlarm, setTamAlarm] = useState<boolean | null>(null);
    const donusBekleniyor = useRef(false);

    const oku = useCallback(async () => {
        const [ekran, alarm] = await Promise.all([tamEkranIzniVarMi(), tamAlarmIzniVarMi()]);
        setTamEkran(ekran);
        setTamAlarm(alarm);
        return ekran;
    }, []);

    useEffect(() => {
        if (!etkin) return;
        let iptal = false;
        void (async () => {
            const [ekran, alarm] = await Promise.all([tamEkranIzniVarMi(), tamAlarmIzniVarMi()]);
            if (iptal) return;
            setTamEkran(ekran);
            setTamAlarm(alarm);
        })();
        return () => {
            iptal = true;
        };
    }, [etkin]);

    useEffect(() => {
        const abonelik = AppState.addEventListener('change', async (durum) => {
            if (durum !== 'active' || !donusBekleniyor.current) return;
            donusBekleniyor.current = false;
            if ((await oku()) === true) kisaBildirimGoster('Alarm artık kilit ekranında tam ekran açılacak');
        });
        return () => abonelik.remove();
    }, [oku]);

    const ayariAc = useCallback(async () => {
        donusBekleniyor.current = true;
        if (!(await tamEkranAyariniAc())) {
            donusBekleniyor.current = false;
            kisaBildirimGoster('Ayar ekranı açılamadı; telefonunuzun Ayarlar > Uygulamalar bölümünden açabilirsiniz.', true);
        }
    }, []);

    return { tamEkran, tamAlarm, ayariAc };
}
