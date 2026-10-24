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

// Hesap ayarı (yöntem/ikindi/dakika) ve arayüz dili HER JS bağlamında vakit/metin üretiminden ÖNCE yüklenir:
// headless/arka plan bağlamında App.tsx hiç çalışmaz; beklenmezse vakitler Diyanet'le
// hesaplanır (yurt dışı kullanıcıda yanlış saat). ASLA reddetmez. Kılınmışlık dinleyicisi kuran
// servisler de (widget, camideyim, yatış, TV…) bu kapıdan sonra yüklenir: dinleyici vakit hesaplar.
const hesapAyariHazir = (): Promise<void> =>
    import('./src/domain/services/baglamHazir')
        .then(({ baglamHazir }) => baglamHazir())
        .catch(() => undefined);

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
        await hesapAyariHazir();

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

// Uygulama DIŞINDAN "Kıldım" (Wear OS saati #269, widget #275, hızlı ayarlar ve
// kısayol #276) — ortak kuyruğun headless görevi.
// `registerHeadlessTask` MODÜL ÜST SEVİYESİNDE ve SENKRON çağrılmalı (promise
// içinde kaydedilirse native görev geldiğinde JS tarafı henüz hazır olmaz).
// Görev adı `KildimGorevServisi.kt` ile AYNI. Doğruluk bu göreve bağlı
// değildir: kuyruk ön plana gelişte ve 15 dk'lık arka plan görevinde de boşalır.
if (Platform.OS === 'android') {
    try {
        AppRegistry.registerHeadlessTask('KildimKuyrugu', () => async () => {
            try {
                await hesapAyariHazir();
                const { KildimKuyruguServisi } = await import('./src/domain/services/KildimKuyruguServisi');
                await KildimKuyruguServisi.getInstance().bekleyenleriIsle();
            } catch {
                // Kuyruk native tarafta korunur; ön plan / 15 dk görevi yeniden dener.
            }
        });
    } catch {
        // Kayıt başarısızsa headless yol yok sayılır; diğer iki boşaltma yolu kalır.
    }
    // Widget kılınmışlık tazelemesi HER JS bağlamında (headless dahil) kurulsun:
    // bildirimdeki "Kıldım" uygulama kapalıyken işlenince widget da ≤1 sn'de
    // güncellenmeli; App.tsx o bağlamda hiç yüklenmez (issue #275).
    hesapAyariHazir()
        .then(() => import('./src/domain/services/WidgetServisi'))
        .then(({ WidgetServisi }) => WidgetServisi.getInstance().baslat())
        .catch(() => undefined);
}

// Camiden çıkış sorusundaki "Kıldım" (Camideyim #297) — headless görev. Ad
// `CamiKildimGorevServisi.kt` ile AYNI. Kuyruk native'de kalıcıdır; açılış ve
// 15 dk görevi de boşaltır (Wear deseni).
if (Platform.OS === 'android') {
    try {
        AppRegistry.registerHeadlessTask('CamiKildim', () => async () => {
            try {
                await hesapAyariHazir();
                const { CamideyimServisi } = await import('./src/domain/services/CamideyimServisi');
                await CamideyimServisi.getInstance().bekleyenKildimleriIsle();
            } catch {
                // Kuyruk native tarafta korunur.
            }
        });
    } catch {
        // Kayıt başarısızsa diğer boşaltma yolları kalır.
    }
    // Namaz modu "Kıldım deyince kapansın" dinleyicisi HER JS bağlamında (headless
    // dahil): uygulama kapalıyken bildirimden "Kıldım" işlenince mod da kapanmalı;
    // App.tsx o bağlamda hiç yüklenmez. `baslat` idempotenttir (App.tsx de çağırır).
    hesapAyariHazir()
        .then(() => import('./src/domain/services/CamideyimServisi'))
        .then(({ CamideyimServisi }) => CamideyimServisi.getInstance().baslat())
        .catch(() => undefined);
}

// Yatış hatırlatması + gün sonu muhasebesi (issue #290): kılınmışlık değişince
// yeniden planlanır. HER JS bağlamında (headless dahil): bildirimden "Kıldım"
// uygulama kapalıyken işlenince muhasebe içeriği bayat kalmasın. İdempotent.
if (Platform.OS === 'android') {
    hesapAyariHazir()
        .then(() => import('./src/domain/services/YatisHatirlatmaServisi'))
        .then(({ YatisHatirlatmaServisi }) => YatisHatirlatmaServisi.getInstance().baslat())
        .catch(() => undefined);
    // Gün sonu seri hatırlatması: gün headless "Kıldım" ile tamamlanınca o günün tetiği kalksın.
    hesapAyariHazir()
        .then(() => import('./src/domain/services/GunSonuHatirlaticiServisi'))
        .then(({ gunSonuDinleyicisiniBaslat }) => gunSonuDinleyicisiniBaslat())
        .catch(() => undefined);
    // Takvim çakışması (issue #291): kılınan vaktin uyarısı headless'ta da iptal edilsin.
    hesapAyariHazir()
        .then(() => import('./src/domain/services/TakvimCakismaServisi'))
        .then(({ TakvimCakismaServisi }) => TakvimCakismaServisi.getInstance().baslat())
        .catch(() => undefined);
    // Kaza Defteri 2.0: bildirimden "Kıldım" headless işlenince otomatik kaza
    // tarama günlüğü de tazelensin (sayılar zaten kayıttan türer). İdempotent.
    hesapAyariHazir()
        .then(() => import('./src/domain/services/KazaDefteriServisi'))
        .then((KazaDefteriServisi) => KazaDefteriServisi.baslat())
        .catch(() => undefined);
    // Cihaz ağı: bildirimden "Kıldım" headless işlenince eşleşik TV'ler de tazelensin
    // (adlı yuva 'tv'; idempotent, App.tsx de çağırır).
    hesapAyariHazir()
        .then(() => import('./src/domain/services/TvSenkronServisi'))
        .then(({ TvSenkronServisi }) => TvSenkronServisi.getInstance().baslat())
        .catch(() => undefined);
    // Çift yönlü eşler (tablet ↔ telefon): headless "Kıldım" da eşe gönderilsin (yuva 'cihazEs').
    // Eş yalnız ön plandayken dinler; ulaşılamazsa bir sonraki açılışta tamamlanır.
    hesapAyariHazir()
        .then(() => import('./src/domain/services/CihazEsServisi'))
        .then(({ CihazEsServisi }) => CihazEsServisi.getInstance().baslat())
        .catch(() => undefined);
}

// Muhafız bildirimindeki "Kıldım" — uygulama KAPALI/arka plandayken (yalnız Android).
// Aksiyon `opensAppToForeground: false` olduğu için telefon açılmaz (saate köprülenen
// bildirimde saatten basılınca cepteki telefon öne çıkmasın). Issue #299'dan beri eylem
// NATIVE işlenir (`KopruEtiketliBildirimServisi` → Kıldım kuyruğu, kaynak `bildirim`) ve
// bu göreve HİÇ gelmez; görev yalnız native yol başarısız olursa devreye giren yedektir. `defineTask` modül üst seviyesinde SENKRON olmalı (Wear
// headless dersi). Aynı yanıt açılışta getLastNotificationResponseAsync'e de düşer;
// tekilleştirme diskte (`BildirimServisi.yanitiIsle`).
const MUHAFIZ_YANIT_GOREVI = 'MUHAFIZ_BILDIRIM_YANITI';
if (Platform.OS === 'android') {
    try {
        TaskManager.defineTask(MUHAFIZ_YANIT_GOREVI, async ({ data, error }) => {
            if (error || !data) return;
            try {
                await hesapAyariHazir();
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
