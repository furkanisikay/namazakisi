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

// notifee arka plan olay işleyicisi (Android sayaç için)
// Uygulama kapalıyken/arka plandayken "Kıldım" aksiyonunu yakalar.
// Headless JS ortamında olduğumuz için her bloğu ayrı try-catch ile koruyoruz:
// işlenmeyen bir hata tüm uygulamayı çökertebilir. Servisler ayrıca dinamik
// import ile yükleniyor → headless task hafif kalır, eager yük olmaz.
if (Platform.OS === 'android') {
    try { notifee.onBackgroundEvent(async ({ type, detail }) => {
        const bildirimId = detail.notification?.id; // "sayac_2026-02-15_ogle"
        if (!bildirimId) {
            return;
        }

        // Sayac asama gecisi: onceki asama bildirimlerini iptal et
        if (type === EventType.DELIVERED) {
            try {
                const { VakitSayacBildirimServisi } = await import('./src/domain/services/VakitSayacBildirimServisi');
                await VakitSayacBildirimServisi.getInstance().asamaGecisiniIsle(bildirimId);
            } catch (error) {
                console.error('[index.ts/notifee] Aşama geçişi işleme hatası:', error);
            }
        }

        // "Kildim": namaz isaretle + tam temizlik (arka plan/on plan ORTAK yol -> drift yok)
        if (type === EventType.ACTION_PRESS && detail.pressAction?.id === 'kildim') {
            try {
                const { BildirimServisi } = await import('./src/domain/services/BildirimServisi');
                await BildirimServisi.getInstance().sayacKildimIsle(bildirimId);
            } catch (error) {
                console.error('[index.ts/notifee] Kıldım işleme hatası:', error);
            }
        }
    }); } catch (_) {}
}

// Bildirim dinleyicisini global olarak baslat (dinamik import — eager yük azaltma)
// Bu, uygulama kapali veya arka plandayken gelen bildirim aksiyonlarini yakalamak icin kritiktir
import('./src/domain/services/BildirimServisi').then(({ BildirimServisi }) => {
    BildirimServisi.getInstance().baslatBildirimDinleyicisi().catch(err => {
        console.error('[index.ts] Bildirim dinleyicisi başlatılamadı:', err);
    });
}).catch(err => {
    console.error('[index.ts] Bildirim dinleyicisi başlatılamadı (import):', err);
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
