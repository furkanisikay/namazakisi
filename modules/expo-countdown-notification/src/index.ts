import { NativeModulesProxy, requireNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

/**
 * Countdown notification configuration
 */
export interface CountdownConfig {
    /** Unique identifier for the countdown */
    id: string;
    /** Target time in milliseconds (epoch) */
    targetTimeMs: number;
    /** Notification title */
    title: string;
    /** Body template with {time} placeholder for countdown text */
    bodyTemplate: string;
    /** Android notification channel ID */
    channelId: string;
    /** Small icon resource name (optional, defaults to app icon) */
    smallIcon?: string;
}

const ExpoCountdownNotification = requireNativeModule('ExpoCountdownNotification');

/**
 * Starts a countdown notification that displays remaining time in the notification body.
 * Uses native Android Foreground Service + CountDownTimer for battery-efficient updates.
 *
 * @param config - Countdown configuration
 * @throws Error if platform is not Android
 */
export function startCountdown(config: CountdownConfig): void {
    if (Platform.OS !== 'android') {
        console.warn('[CountdownNotification] Only supported on Android');
        return;
    }

    ExpoCountdownNotification.startCountdown(
        config.id,
        config.targetTimeMs,
        config.title,
        config.bodyTemplate,
        config.channelId,
        config.smallIcon ?? ''
    );
}

/**
 * Stops a specific countdown notification by its ID.
 *
 * @param id - The countdown identifier to stop
 */
export function stopCountdown(id: string): void {
    if (Platform.OS !== 'android') return;
    ExpoCountdownNotification.stopCountdown(id);
}

/**
 * Stops all active countdown notifications and the foreground service.
 */
export function stopAll(): void {
    if (Platform.OS !== 'android') return;
    ExpoCountdownNotification.stopAll();
}
