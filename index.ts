import './global.css';
import { registerRootComponent } from 'expo';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import notifee, { EventType } from '@notifee/react-native';
import { Platform } from 'react-native';

// Reanimated strict mode uyarilarini kapat (3. parti kutuphaneler nedeniyle)
configureReanimatedLogger({
    level: ReanimatedLogLevel.warn,
    strict: false,
});

import App from './App';
import { BildirimServisi } from './src/domain/services/BildirimServisi';

// notifee arka plan olay işleyicisi (Android sayaç için)
// Uygulama kapalıyken/arka plandayken "Kıldım" aksiyonunu yakalar
if (Platform.OS === 'android') {
    try { notifee.onBackgroundEvent(async ({ type, detail }) => {
        const bildirimId = detail.notification?.id; // "sayac_2026-02-15_ogle"
        if (!bildirimId) {
            return;
        }

        // Sayac asama gecisi: onceki asama bildirimlerini iptal et
        if (type === EventType.DELIVERED) {
            const { VakitSayacBildirimServisi } = await import('./src/domain/services/VakitSayacBildirimServisi');
            await VakitSayacBildirimServisi.getInstance().asamaGecisiniIsle(bildirimId);
        }

        // "Kildim": namaz isaretle + tam temizlik (arka plan/on plan ORTAK yol -> drift yok)
        if (type === EventType.ACTION_PRESS && detail.pressAction?.id === 'kildim') {
            try {
                await BildirimServisi.getInstance().sayacKildimIsle(bildirimId);
            } catch (error) {
                console.error('[index.ts/notifee] Kıldım işleme hatası:', error);
            }
        }
    }); } catch (_) {}
}

// Bildirim dinleyicisini global olarak baslat
// Bu, uygulama kapali veya arka plandayken gelen bildirim aksiyonlarini yakalamak icin kritiktir
try {
    BildirimServisi.getInstance().baslatBildirimDinleyicisi().catch(err => {
        console.error('[index.ts] Bildirim dinleyicisi başlatılamadı:', err);
    });
} catch (err) {
    console.error('[index.ts] Bildirim dinleyicisi başlatılamadı (sync):', err);
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
