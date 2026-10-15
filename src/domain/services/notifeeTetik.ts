/**
 * notifee zaman tetiği — DAİMA AlarmManager üzerinden.
 *
 * `TimestampTrigger`'a `alarmManager` verilmezse notifee tetiği **WorkManager**'a
 * bırakır: Doze'da ve Samsung'un "uyuyan uygulamalar" kısıtında "vakit girdi" ve
 * sayaç bildirimleri dakikalarca gecikebiliyordu. `SET_EXACT_AND_ALLOW_WHILE_IDLE`
 * hem Doze'u deler hem tam dakikaya düşer.
 *
 * Tam alarm izni kapalıysa (Android 12/12L'de kullanıcı kapatabilir) tam alarm
 * kurmak SecurityException'a düşer → `SET_AND_ALLOW_WHILE_IDLE`'a (yine Doze'u
 * deler, yalnız birkaç dakika esneyebilir) kendimiz düşeriz. expo-notifications
 * ve kendi native modüllerimiz de aynı `canScheduleExactAlarms ? exact : inexact`
 * desenindedir.
 *
 * `allowWhileIdle` alanı notifee'de deprecated → `type` kullanılır.
 */
import notifee, { AlarmType, AndroidNotificationSetting, TriggerType, type TimestampTrigger } from '@notifee/react-native';

/** İzin durumu okunamazsa (eski sürüm / test) tam alarmı DENEMEYİZ: güvenli taraf. */
async function tamAlarmIzniVarMi(): Promise<boolean> {
    try {
        const ayarlar = await notifee.getNotificationSettings();
        // Android 12 öncesinde ayar yoktur (NOT_SUPPORTED) ve tam alarm serbesttir.
        return ayarlar?.android?.alarm !== AndroidNotificationSetting.DISABLED && ayarlar?.android?.alarm !== undefined;
    } catch {
        return false;
    }
}

export async function zamanTetigiOlustur(timestamp: number): Promise<TimestampTrigger> {
    const tam = await tamAlarmIzniVarMi();
    return {
        type: TriggerType.TIMESTAMP,
        timestamp,
        alarmManager: {
            type: tam ? AlarmType.SET_EXACT_AND_ALLOW_WHILE_IDLE : AlarmType.SET_AND_ALLOW_WHILE_IDLE,
        },
    };
}
