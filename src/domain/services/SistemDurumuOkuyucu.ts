/**
 * Bildirim güvenilirliğini etkileyen SİSTEM durumu — salt okur (izin İSTEMEZ).
 *
 * Kurulum sağlığı kartı ve sihirbaz bu üç soruyu sorar: uygulama pil
 * optimizasyonundan muaf mı, cihaz Samsung mu, tam alarm izni açık mı?
 * Ayrı dosyadır: `BildirimServisi` native köprü grafiğini çeker ve onu tüketen
 * her testin köprüyü mock'lamasını zorunlu kılardı (`BildirimIzinOkuyucu` deseni).
 *
 * Okunamayan her durum "bilinmiyor" döner → ekran uyarı GÖSTERMEZ.
 *
 * notifee ve native köprü TEMBEL yüklenir (`require`): ikisi de modül seviyesinde
 * native modül arar ve jest'te yoktur → statik import, Ayarlar'ı render eden HER
 * ekran testini düşürürdü (`konumSlice` deseni; AGENTS.md requireNativeModule tuzağı).
 */
const notifeeYukle = () => require('@notifee/react-native') as typeof import('@notifee/react-native');
const kopruYukle = () =>
    require('../../../modules/expo-countdown-notification/src') as typeof import('../../../modules/expo-countdown-notification/src');
import { Platform } from 'react-native';
import type { AcilanPilEkrani } from '../../../modules/expo-countdown-notification/src';
import type { PilDurumu } from '../../core/ayarlar/kurulumSagligi';

export type TamAlarmDurumu = 'verildi' | 'reddedildi' | 'belirsiz';

export async function pilDurumunuOku(): Promise<PilDurumu> {
    try {
        const kopru = kopruYukle();
        return { muaf: await kopru.pilOptimizasyonuMuafMi(), samsung: kopru.samsungMu() };
    } catch {
        return { muaf: null, samsung: null };
    }
}

export async function tamAlarmDurumunuOku(): Promise<TamAlarmDurumu> {
    if (Platform.OS !== 'android') return 'belirsiz';
    try {
        const { default: notifee, AndroidNotificationSetting } = notifeeYukle();
        const alarm = (await notifee.getNotificationSettings())?.android?.alarm;
        if (alarm === AndroidNotificationSetting.DISABLED) return 'reddedildi';
        if (alarm === AndroidNotificationSetting.ENABLED || alarm === AndroidNotificationSetting.NOT_SUPPORTED) return 'verildi';
        return 'belirsiz';
    } catch {
        return 'belirsiz';
    }
}

/** Android 12+ "Alarmlar ve hatırlatıcılar" izin ekranı. */
export async function alarmIzniAyariniAc(): Promise<void> {
    try {
        await notifeeYukle().default.openAlarmPermissionSettings();
    } catch {
        // Ekran yoksa (eski sürüm) yapacak bir şey yok; izin zaten gerekmiyor.
    }
}

export async function pilAyarlariniAc(): Promise<AcilanPilEkrani | null> {
    try {
        return await kopruYukle().pilAyarlariniAc();
    } catch {
        return null;
    }
}
