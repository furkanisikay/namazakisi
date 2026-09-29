import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { konumDegisimBildirimiGonder } from '../KonumBildirimServisi';

const palandoken = { ilce: 'Palandöken', il: 'Erzurum' };

describe('KonumBildirimServisi.konumDegisimBildirimiGonder', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // clearAllMocks implementasyonu silmez; her testte açıkça kur (AGENTS.md).
        (Notifications.getNotificationChannelAsync as jest.Mock).mockResolvedValue(null);
        (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('id');
    });

    it('Android: sessiz "konum" kanalına, yer adını taşıyan anlık bildirim gönderir', async () => {
        jest.replaceProperty(Platform, 'OS', 'android');

        await konumDegisimBildirimiGonder(palandoken);

        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
            content: {
                title: 'Konumunuz güncellendi: Palandöken, Erzurum',
                body: 'Namaz vakitleri yeni konumunuza göre ayarlandı.',
                data: { tip: 'konum_degisti' },
            },
            trigger: { channelId: 'konum' },
        });
    });

    it('kanal YOKSA düşük önemle (sessiz) oluşturulur — arka plan görevi uygulama hiç açılmadan koşabilir', async () => {
        jest.replaceProperty(Platform, 'OS', 'android');

        await konumDegisimBildirimiGonder(palandoken);

        expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
            'konum',
            expect.objectContaining({ importance: Notifications.AndroidImportance.LOW }),
        );
        // Kanal bildirimden ÖNCE hazır olmalı, yoksa Android 8+ yedek kanala düşürür.
        const kanalSirasi = (Notifications.setNotificationChannelAsync as jest.Mock).mock.invocationCallOrder[0];
        const bildirimSirasi = (Notifications.scheduleNotificationAsync as jest.Mock).mock.invocationCallOrder[0];
        expect(kanalSirasi).toBeLessThan(bildirimSirasi);
    });

    it('kanal VARSA dokunulmaz: önemi sonradan değişmez, kullanıcının ayarı orada yaşar', async () => {
        jest.replaceProperty(Platform, 'OS', 'android');
        (Notifications.getNotificationChannelAsync as jest.Mock).mockResolvedValue({ id: 'konum' });

        await konumDegisimBildirimiGonder(palandoken);

        expect(Notifications.setNotificationChannelAsync).not.toHaveBeenCalled();
        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    });

    it('iOS: hiçbir şey göndermez (arka plan konum takibi yok)', async () => {
        jest.replaceProperty(Platform, 'OS', 'ios');

        await konumDegisimBildirimiGonder(palandoken);

        expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('gönderim patlarsa FIRLATMAZ: konum güncellemesini bozmamalı', async () => {
        jest.replaceProperty(Platform, 'OS', 'android');
        (Notifications.scheduleNotificationAsync as jest.Mock).mockRejectedValue(new Error('izin yok'));

        await expect(konumDegisimBildirimiGonder(palandoken)).resolves.toBeUndefined();
    });
});
