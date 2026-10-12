import './global.css';
import { registerRootComponent } from 'expo';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import notifee, { EventType } from '@notifee/react-native';
import { Platform, AppRegistry } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';

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

// Wear OS saatinden "Kıldım" (issue #269) — headless görev.
// `registerHeadlessTask` MODÜL ÜST SEVİYESİNDE ve SENKRON çağrılmalı (promise
// içinde kaydedilirse native görev geldiğinde JS tarafı henüz hazır olmaz).
// Görev adı `WearKildimGorevServisi.kt` ile AYNI. Doğruluk bu göreve bağlı
// değildir: kuyruk ön plana gelişte ve 15 dk'lık arka plan görevinde de boşalır.
if (Platform.OS === 'android') {
    try {
        AppRegistry.registerHeadlessTask('WearKildim', () => async () => {
            try {
                const { WearSenkronServisi } = await import('./src/domain/services/WearSenkronServisi');
                await WearSenkronServisi.getInstance().bekleyenleriIsle();
            } catch {
                // Kuyruk native tarafta korunur; ön plan / 15 dk görevi yeniden dener.
            }
        });
    } catch {
        // Kayıt başarısızsa headless yol yok sayılır; diğer iki boşaltma yolu kalır.
    }
}

// Muhafız bildirimindeki "Kıldım" — uygulama KAPALI/arka plandayken (yalnız Android).
// Aksiyon `opensAppToForeground: false` olduğu için telefon açılmaz (saate köprülenen
// bildirimde saatten basılınca cepteki telefon öne çıkmasın); expo-notifications
// yanıtı bu göreve verir. `defineTask` modül üst seviyesinde SENKRON olmalı (Wear
// headless dersi). Aynı yanıt açılışta getLastNotificationResponseAsync'e de düşer;
// tekilleştirme diskte (`BildirimServisi.yanitiIsle`).
const MUHAFIZ_YANIT_GOREVI = 'MUHAFIZ_BILDIRIM_YANITI';
if (Platform.OS === 'android') {
    try {
        TaskManager.defineTask(MUHAFIZ_YANIT_GOREVI, async ({ data, error }) => {
            if (error || !data) return;
            try {
                const { BildirimServisi } = await import('./src/domain/services/BildirimServisi');
                await BildirimServisi.getInstance().arkaplanYanitiniIsle(data);
            } catch {
                // Açılıştaki getLastNotificationResponseAsync yolu yanıtı yine işler.
            }
        });
        Notifications.registerTaskAsync(MUHAFIZ_YANIT_GOREVI).catch(() => undefined);
    } catch {
        // Görev kurulamazsa yanıt açılışta işlenir (eski davranış).
    }
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
