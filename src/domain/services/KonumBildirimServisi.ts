/**
 * Otomatik konum değişikliğini kullanıcıya SESSİZ bir bildirimle haber verir.
 *
 * Neden bildirim (toast değil): otomatik algılama neredeyse her zaman arka
 * planda, uygulama kapalıyken olur; toast yalnız uygulama açıkken görünür.
 * Elle yenilemede ise bu servis ÇAĞRILMAZ, orada ekrandaki kısa mesaj yeter.
 *
 * Yalnız Android: iOS'ta arka plan konum takibi yok (AGENTS.md iOS bölümü),
 * yani bu yol iOS'ta hiç tetiklenmez; yine de kapı açıkça burada durur.
 */

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { BILDIRIM_SABITLERI } from '../../core/constants/UygulamaSabitleri';
import {
    KonumAdiGirdisi,
    konumDegisimBildirimMetni,
} from '../../core/konum/konumDegisimBildirimi';
import { Logger } from '../../core/utils/Logger';

const KANAL_ID = BILDIRIM_SABITLERI.KANALLAR.KONUM;

/**
 * Kanalı YOKSA oluşturur. Bu çağrı arka plan görevinden (headless) gelir ve
 * kullanıcı güncellemeden sonra uygulamayı hiç açmamış olabilir; kanal yoksa
 * Android 8+ bildirimi yedek kanala düşürür. Mevcut kanala dokunulmaz: önem
 * kanal oluşturulduktan sonra değiştirilemez, kullanıcının ayarı orada yaşar.
 */
async function kanaliGarantile(): Promise<void> {
    const mevcut = await Notifications.getNotificationChannelAsync(KANAL_ID);
    if (mevcut) return;
    await Notifications.setNotificationChannelAsync(KANAL_ID, {
        name: 'Konum Değişikliği',
        description: 'Konumunuz otomatik güncellenince bilgi verir',
        // LOW: ses ve titreşim yok, ekrana düşmez; bildirim gölgeliğinde durur.
        importance: Notifications.AndroidImportance.LOW,
    });
}

export async function konumDegisimBildirimiGonder(yeniAdres: KonumAdiGirdisi): Promise<void> {
    if (Platform.OS !== 'android') return;
    try {
        await kanaliGarantile();
        const { baslik, govde } = konumDegisimBildirimMetni(yeniAdres);
        await Notifications.scheduleNotificationAsync({
            content: {
                title: baslik,
                body: govde,
                data: { tip: 'konum_degisti' },
            },
            trigger: { channelId: KANAL_ID },
        });
        Logger.info('KonumBildirim', 'Konum degisikligi bildirimi gonderildi');
    } catch (hata) {
        // Bildirim bir bilgilendirmedir; patlaması konum güncellemesini bozmamalı.
        Logger.warn('KonumBildirim', 'Konum degisikligi bildirimi gonderilemedi', hata);
    }
}
