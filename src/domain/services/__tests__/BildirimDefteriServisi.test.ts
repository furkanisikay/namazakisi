/**
 * Bildirim defterinin diskten okunan girdileri + cihaz ölçümü (issue #298).
 * Okuma ASLA fırlatmaz; ölçüm Android'de üç listeyi birleştirir.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@notifee/react-native', () => ({
    __esModule: true,
    default: { getTriggerNotificationIds: jest.fn().mockResolvedValue(['a', 'b', 'c']) },
}));
jest.mock('../../../../modules/expo-countdown-notification/src', () => ({
    bekleyenAnonsSayisi: jest.fn().mockResolvedValue(4),
}));
jest.mock('../../../core/utils/Logger', () => ({
    Logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

import { bekleyenleriOlc, defterDisGirdisiniOku } from '../BildirimDefteriServisi';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';
import { bugunuAl } from '../../../core/utils/TarihYardimcisi';

describe('defterDisGirdisiniOku', () => {
    beforeEach(async () => {
        await AsyncStorage.clear();
    });

    it('diskteki ayarları ve bugünün kılınanlarını okur', async () => {
        await AsyncStorage.setItem(
            DEPOLAMA_ANAHTARLARI.VAKIT_BILDIRIM_AYARLARI,
            JSON.stringify({ imsak: true, ogle: false, ikindi: true, aksam: false, yatsi: true })
        );
        await AsyncStorage.setItem(`${DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI}_kilinan_${bugunuAl()}`, JSON.stringify(['ogle']));
        const g = await defterDisGirdisiniOku();
        expect(g.vakitBildirimi).toMatchObject({ imsak: true, ogle: false, yatsi: true });
        expect(g.kilinan?.[bugunuAl()]).toEqual(['ogle']);
        expect(g.cuma).toBeTruthy();
        expect(typeof g.ozelGundeMi).toBe('function');
    });

    it('bozuk kayıtta fırlatmaz', async () => {
        await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.CUMA_HATIRLATMA_AYARLARI, '{bozuk');
        await expect(defterDisGirdisiniOku()).resolves.toBeTruthy();
    });
});

describe('bekleyenleriOlc', () => {
    beforeEach(() => {
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([{}, {}]);
    });

    it('iOS: yalnız bekleyen bildirimler', async () => {
        jest.replaceProperty(Platform, 'OS', 'ios');
        await expect(bekleyenleriOlc()).resolves.toEqual({ bildirim: 2, notifee: 0, anons: 0, toplam: 2 });
    });

    it('Android: expo + notifee + native anons listesi birleşir', async () => {
        jest.replaceProperty(Platform, 'OS', 'android');
        await expect(bekleyenleriOlc()).resolves.toEqual({ bildirim: 2, notifee: 3, anons: 4, toplam: 9 });
    });

    it('ölçülemezse null', async () => {
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockRejectedValue(new Error('yok'));
        await expect(bekleyenleriOlc()).resolves.toBeNull();
    });
});
