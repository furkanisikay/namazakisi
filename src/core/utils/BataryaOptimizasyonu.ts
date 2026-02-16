/**
 * Batarya Optimizasyonu Yardımcı Fonksiyonları
 * 
 * Android'de batarya optimizasyonu uygulamaları arka planda öldürebilir.
 * Bu modül kullanıcıyı ayarlara yönlendirir.
 */

import { Platform, Linking, Alert } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import { Logger } from './Logger';

/**
 * Kullanıcıyı batarya optimizasyonu ayarlarına yönlendir
 */
export async function bataryaOptimizasyonuAyarlarinaGit(): Promise<void> {
    if (Platform.OS !== 'android') {
        Logger.info('BataryaOpt', 'iOS\'ta batarya optimizasyonu ayarı yok');
        return;
    }

    try {
        // Android ayarlarını aç
        await IntentLauncher.startActivityAsync(
            IntentLauncher.ActivityAction.IGNORE_BATTERY_OPTIMIZATION_SETTINGS
        );
    } catch (error) {
        Logger.error('BataryaOpt', 'Ayarlar açılamadı:', error);

        // Fallback: Genel uygulama ayarlarını aç
        try {
            await Linking.openSettings();
        } catch (e) {
            Logger.error('BataryaOpt', 'Fallback de başarısız:', e);
        }
    }
}

/**
 * Kullanıcıya batarya optimizasyonu hakkında bilgi ver ve ayarlara yönlendir
 */
export function bataryaOptimizasyonuUyarisiGoster(): void {
    if (Platform.OS !== 'android') return;

    Alert.alert(
        '🔋 Batarya Optimizasyonu',
        'Bildirimlerin her zaman çalışması için bu uygulamayı batarya optimizasyonundan hariç tutmanız gerekiyor.\n\n' +
        'Ayarlarda "Namaz Akışı" uygulamasını bulup "Kısıtlama" seçeneğini kapatın.',
        [
            {
                text: 'Daha Sonra',
                style: 'cancel',
            },
            {
                text: 'Ayarlara Git',
                onPress: () => bataryaOptimizasyonuAyarlarinaGit(),
            },
        ],
        { cancelable: true }
    );
}

/**
 * Kullanıcıya otomatik başlatma ayarları hakkında bilgi ver
 * (Xiaomi, Huawei, OPPO gibi markalar için)
 */
export function otomatikBaslatmaUyarisiGoster(): void {
    if (Platform.OS !== 'android') return;

    Alert.alert(
        '🚀 Otomatik Başlatma',
        'Telefon yeniden başladığında bildirimlerin çalışması için "Otomatik Başlatma" özelliğini etkinleştirmeniz gerekebilir.\n\n' +
        'Ayarlar → Uygulamalar → Namaz Akışı → Otomatik Başlatma',
        [
            {
                text: 'Anladım',
                style: 'cancel',
            },
            {
                text: 'Ayarlara Git',
                onPress: () => Linking.openSettings(),
            },
        ],
        { cancelable: true }
    );
}

/**
 * Tüm gerekli izin uyarılarını göster
 */
export function tumIzinUyarilariniGoster(): void {
    if (Platform.OS !== 'android') return;

    Alert.alert(
        '⚙️ Önemli Ayarlar',
        'Bildirimlerin telefon kapalıyken bile çalışması için:\n\n' +
        '1️⃣ Batarya optimizasyonunu kapatın\n' +
        '2️⃣ Otomatik başlatmayı etkinleştirin\n\n' +
        'Şimdi ayarlara yönlendirileceksiniz.',
        [
            {
                text: 'İptal',
                style: 'cancel',
            },
            {
                text: 'Ayarlara Git',
                onPress: () => bataryaOptimizasyonuAyarlarinaGit(),
            },
        ],
        { cancelable: true }
    );
}
