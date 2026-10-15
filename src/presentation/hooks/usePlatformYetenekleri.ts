/**
 * Ekranlarin platform yeteneklerine ULASTIGI TEK KAPI.
 *
 * Amaci `Platform.OS`'u BILESENLERDEN UZAK TUTMAK: hatirlatma bilesenleri
 * (`PencereKarti`, `AdimDetayModal`, `AdimNotlari`) "bir vakit" degil "bir
 * hatirlatma penceresi" cizer ve neyin duzenlenebilecegini yalnizca
 * `PencereTanimi`'ndan okur. Platform bilgisi tanima BURADAN girer; bilesenlere
 * `Platform.OS` sizarsa cuma/seri gibi ileride eklenecek yuzeyler yeniden
 * platform dallanmasi yazmak zorunda kalir.
 *
 * Motor ile ekran AYNI yetenek nesnesini kullanir (`core/muhafiz/ios/
 * platformYetenekleri`), dolayisiyla "ekranda gorunuyor ama calismiyor"
 * ayrismasi yapisal olarak imkansizdir.
 *
 * iOS'ta `gercekAlarm` AlarmKit durumundan gelir (issue #74; iOS 26 + izin) ve
 * uygulama one geldikce yeniden okunur (kullanici izni Ayarlar'dan degistirebilir).
 * Durum okunana kadar `false` — teslimci de ayni durumu `hazirla`da okur.
 */
import { useEffect, useMemo, useState } from 'react';
import { AppState, Platform } from 'react-native';

import {
    yetenekleriSec,
    type PlatformYetenekleri,
} from '../../core/muhafiz/ios/platformYetenekleri';
import { alarmKitDurumu } from '../../../modules/expo-muhafiz-alarmkit/src';

export function usePlatformYetenekleri(): PlatformYetenekleri {
    const ios = Platform.OS === 'ios';
    const [alarmKitVar, setAlarmKitVar] = useState(false);

    useEffect(() => {
        if (!ios) return;
        let iptal = false;
        const oku = () => {
            void alarmKitDurumu().then((durum) => {
                if (!iptal) setAlarmKitVar(durum === 'izinli');
            });
        };
        oku();
        let abonelik: { remove(): void } | undefined;
        try {
            abonelik = AppState.addEventListener('change', (durum) => {
                if (durum === 'active') oku();
            });
        } catch {
            // AppState'siz ortam (dar test mock'u): yalniz ilk okuma.
        }
        return () => {
            iptal = true;
            abonelik?.remove();
        };
    }, [ios]);

    return useMemo(() => yetenekleriSec(ios ? 'ios' : 'android', alarmKitVar), [ios, alarmKitVar]);
}
