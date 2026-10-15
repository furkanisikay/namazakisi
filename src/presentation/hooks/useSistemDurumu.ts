/**
 * Pil muafiyeti + tam alarm izni — ekrana gelince ve UYGULAMAYA DÖNÜŞTE okunur.
 *
 * Kullanıcı ayar ekranına gidip geri döndüğünde Ayarlar sayfası odakta kalır
 * (`useFocusEffect` tetiklenmez); bu yüzden `AppState` 'active' geçişi de dinlenir.
 * Okunamayan durum "bilinmiyor"dur → kurulum sağlığı uyarı göstermez.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import type { PilDurumu } from '../../core/ayarlar/kurulumSagligi';
import {
    pilDurumunuOku,
    tamAlarmDurumunuOku,
    type TamAlarmDurumu,
} from '../../domain/services/SistemDurumuOkuyucu';

export interface SistemDurumu {
    pil?: PilDurumu;
    tamAlarm?: TamAlarmDurumu;
    yenile: () => Promise<{ pil: PilDurumu; tamAlarm: TamAlarmDurumu }>;
}

export function useSistemDurumu(): SistemDurumu {
    const [pil, setPil] = useState<PilDurumu>();
    const [tamAlarm, setTamAlarm] = useState<TamAlarmDurumu>();
    const bagli = useRef(true);

    const yenile = useCallback(async () => {
        const [p, t] = await Promise.all([pilDurumunuOku(), tamAlarmDurumunuOku()]);
        if (bagli.current) {
            setPil(p);
            setTamAlarm(t);
        }
        return { pil: p, tamAlarm: t };
    }, []);

    useEffect(() => {
        bagli.current = true;
        void yenile();
        const abonelik = AppState.addEventListener('change', (durum) => {
            if (durum === 'active') void yenile();
        });
        return () => {
            bagli.current = false;
            abonelik.remove();
        };
    }, [yenile]);

    return { pil, tamAlarm, yenile };
}
