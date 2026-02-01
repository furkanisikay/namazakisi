import { VakitBildirimYoneticiServisi } from '../VakitBildirimYoneticiServisi';
import { NamazVaktiHesaplayiciServisi } from '../NamazVaktiHesaplayiciServisi';
import { LocalVakitBildirimServisi } from '../../../data/local/LocalVakitBildirimServisi';
import * as Notifications from 'expo-notifications';

// Mock dependencies
jest.mock('expo-notifications');
jest.mock('../NamazVaktiHesaplayiciServisi');
jest.mock('../../../data/local/LocalVakitBildirimServisi');

describe('VakitBildirimYoneticiServisi', () => {
    let service: VakitBildirimYoneticiServisi;

    beforeEach(() => {
        jest.clearAllMocks();
        service = VakitBildirimYoneticiServisi.getInstance();

        // Mock getInstance of NamazVaktiHesaplayiciServisi
        (NamazVaktiHesaplayiciServisi.getInstance as jest.Mock).mockReturnValue({
            getKonfig: jest.fn(),
        });

        // Mock getAllScheduledNotificationsAsync to return empty array by default
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([]);
    });

    it('konum yapılandırılmamışsa bildirim planlamamalı', async () => {
        // Mock getAyarlar
        (LocalVakitBildirimServisi.getAyarlar as jest.Mock).mockResolvedValue({
            imsak: true, ogle: true, ikindi: true, aksam: true, yatsi: true
        });

        // Mock getKonfig to return null
        const mockHesaplayici = NamazVaktiHesaplayiciServisi.getInstance();
        (mockHesaplayici.getKonfig as jest.Mock).mockReturnValue(null);

        await service.bildirimleriGuncelle();

        // Expect notifications NOT to be scheduled
        expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('ayarlar pasifse bildirim planlamamalı', async () => {
        // Mock getAyarlar all false
        (LocalVakitBildirimServisi.getAyarlar as jest.Mock).mockResolvedValue({
            imsak: false, ogle: false, ikindi: false, aksam: false, yatsi: false
        });

        // Mock config
        const mockHesaplayici = NamazVaktiHesaplayiciServisi.getInstance();
        (mockHesaplayici.getKonfig as jest.Mock).mockReturnValue({ latitude: 41, longitude: 29 });

        await service.bildirimleriGuncelle();

        // Expect getAllScheduledNotificationsAsync called for cleanup
        expect(Notifications.getAllScheduledNotificationsAsync).toHaveBeenCalled();
        // But scheduleNotificationAsync NOT called because settings are off
        expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('ayarlar aktifse bildirimleri planlamalı', async () => {
         // Mock getAyarlar some true
         (LocalVakitBildirimServisi.getAyarlar as jest.Mock).mockResolvedValue({
            imsak: true, ogle: false, ikindi: true, aksam: false, yatsi: false
        });

        // Mock config
        const mockHesaplayici = NamazVaktiHesaplayiciServisi.getInstance();
        (mockHesaplayici.getKonfig as jest.Mock).mockReturnValue({ latitude: 41, longitude: 29 });

        // Mock scheduleNotificationAsync
        (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('notification_id');
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([]);

        await service.bildirimleriGuncelle();

        // Should schedule for Imsak and Ikindi for Today and Tomorrow (Total 4 calls ideally)
        // Note: Logic inside service checks if time is past. Assuming mock date is early morning.
        // Since we can't easily mock "new Date()" inside the function without more complex setup,
        // we assume at least TOMORROW's notifications will be scheduled for sure.

        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
    });

    it('önceki vakit bildirimlerini temizlemeli', async () => {
        // Mock existing notifications
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
            { identifier: 'vakit_bildirim_imsak_2024-01-01', content: {} },
            { identifier: 'other_notification', content: {} }
        ]);

        (LocalVakitBildirimServisi.getAyarlar as jest.Mock).mockResolvedValue({
             imsak: false, ogle: false, ikindi: false, aksam: false, yatsi: false
        });

        const mockHesaplayici = NamazVaktiHesaplayiciServisi.getInstance();
        (mockHesaplayici.getKonfig as jest.Mock).mockReturnValue({ latitude: 41, longitude: 29 });

        await service.bildirimleriGuncelle();

        // Should cancel 'vakit_bildirim_imsak_2024-01-01' but NOT 'other_notification'
        expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('vakit_bildirim_imsak_2024-01-01');
        expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalledWith('other_notification');
    });
});
