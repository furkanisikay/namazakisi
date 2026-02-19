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
import { BildirimServisi, vakitAdiToNamazAdi } from './src/domain/services/BildirimServisi';

// notifee arka plan olay işleyicisi (Android sayaç için)
// Uygulama kapalıyken/arka plandayken "Kıldım" aksiyonunu yakalar
if (Platform.OS === 'android') {
    notifee.onBackgroundEvent(async ({ type, detail }) => {
        // Sayac asama gecisleri: onceki asama bildirimlerini iptal et
        if (type === EventType.DELIVERED) {
            const bildirimId = detail.notification?.id;
            if (bildirimId) {
                if (bildirimId.endsWith('_vakitgirdi')) {
                    const baseId = bildirimId.replace('_vakitgirdi', '');
                    await notifee.cancelNotification(baseId);
                } else if (bildirimId.endsWith('_bitis')) {
                    const baseId = bildirimId.replace('_bitis', '');
                    await notifee.cancelNotification(baseId);
                    await notifee.cancelNotification(baseId + '_vakitgirdi');
                }
            }
        }

        if (type === EventType.ACTION_PRESS && detail.pressAction?.id === 'kildim') {
            const bildirimId = detail.notification?.id; // "sayac_2026-02-15_ogle"
            if (bildirimId && bildirimId.startsWith('sayac_')) {
                try {
                    // ID'den tarih ve vakit çıkar
                    const parts = bildirimId.replace('sayac_', '').split('_');
                    const tarih = parts[0]; // "2026-02-15"
                    const vakit = parts[1]; // "ogle"

                    // Kıldım işlemini yap (background'da Redux yok, direkt AsyncStorage)
                    const LocalNamazServisi = await import('./src/data/local/LocalNamazServisi');
                    const namazAdi = vakitAdiToNamazAdi[vakit];

                    if (namazAdi && tarih) {
                        await LocalNamazServisi.localNamazDurumunuGuncelle(tarih, namazAdi, true);
                        console.log(`[index.ts/notifee] Namaz kıldım: ${namazAdi} (${tarih})`);
                    }

                    // Bildirimi iptal et
                    await notifee.cancelNotification(bildirimId);

                    // Temizleme trigger'ini da iptal et
                    try { await notifee.cancelTriggerNotification(bildirimId + '_bitis'); } catch (_) {}

                    // Muhafız bildirimlerini de iptal et
                    const { ArkaplanMuhafizServisi } = await import('./src/domain/services/ArkaplanMuhafizServisi');
                    if (vakit) {
                        await ArkaplanMuhafizServisi.getInstance().vakitBildirimleriniIptalEt(vakit as any);
                    }
                } catch (error) {
                    console.error('[index.ts/notifee] Kıldım işleme hatası:', error);
                }
            }
        }
    });
}

// Bildirim dinleyicisini global olarak baslat
// Bu, uygulama kapali veya arka plandayken gelen bildirim aksiyonlarini yakalamak icin kritiktir
BildirimServisi.getInstance().baslatBildirimDinleyicisi().catch(err => {
    console.error('[index.ts] Bildirim dinleyicisi başlatılamadı:', err);
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
