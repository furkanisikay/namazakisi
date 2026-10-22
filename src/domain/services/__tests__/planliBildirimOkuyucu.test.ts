import * as Notifications from 'expo-notifications';
import {
    bildirimleriTopluIptalEt,
    tazePlanliBildirimOkuyucu,
    turIciPlanliBildirimOkuyucu,
} from '../planliBildirimOkuyucu';

jest.mock('../../../core/utils/Logger', () => ({
    Logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

const getAll = Notifications.getAllScheduledNotificationsAsync as jest.Mock;
const cancel = Notifications.cancelScheduledNotificationAsync as jest.Mock;

beforeEach(() => {
    jest.clearAllMocks();
    getAll.mockResolvedValue([{ identifier: 'a' }]);
    cancel.mockResolvedValue(undefined);
});

describe('planliBildirimOkuyucu (denetim D-15)', () => {
    it('taze okuyucu her çağrıda okur', async () => {
        await tazePlanliBildirimOkuyucu.oku();
        await tazePlanliBildirimOkuyucu.oku();
        expect(getAll).toHaveBeenCalledTimes(2);
    });

    it('tur içi okuyucu tek kez okur, eşzamanlı çağrılar aynı listeyi paylaşır', async () => {
        const o = turIciPlanliBildirimOkuyucu();
        const [x, y] = await Promise.all([o.oku(), o.oku()]);
        await o.oku();
        expect(getAll).toHaveBeenCalledTimes(1);
        expect(x).toBe(y);
    });

    it('her tur YENİ okuyucu ister (önceki turun listesi taşınmaz)', async () => {
        await turIciPlanliBildirimOkuyucu().oku();
        await turIciPlanliBildirimOkuyucu().oku();
        expect(getAll).toHaveBeenCalledTimes(2);
    });

    it('okuma hatası önbelleğe girmez', async () => {
        getAll.mockRejectedValueOnce(new Error('kopru'));
        const o = turIciPlanliBildirimOkuyucu();
        await expect(o.oku()).rejects.toThrow('kopru');
        await expect(o.oku()).resolves.toEqual([{ identifier: 'a' }]);
        expect(getAll).toHaveBeenCalledTimes(2);
    });

    it('toplu iptal: sırayla başlatır, bir hata ötekileri durdurmaz', async () => {
        cancel.mockImplementation(async (id: string) => {
            if (id === 'b') throw new Error('yok');
        });
        await expect(bildirimleriTopluIptalEt(['a', 'b', 'c'], 'Test')).resolves.toBeUndefined();
        expect(cancel.mock.calls.map((c) => c[0])).toEqual(['a', 'b', 'c']);
    });

    it('toplu iptal: senkron fırlatan / Promise döndürmeyen köprü de tolere edilir', async () => {
        cancel.mockImplementationOnce(() => {
            throw new Error('senkron');
        });
        cancel.mockImplementationOnce(() => undefined);
        await expect(bildirimleriTopluIptalEt(['a', 'b'], 'Test')).resolves.toBeUndefined();
    });
});
