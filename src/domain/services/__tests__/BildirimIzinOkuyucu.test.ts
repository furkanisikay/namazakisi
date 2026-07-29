import * as Notifications from 'expo-notifications';
import { izinDurumunuOku } from '../BildirimIzinOkuyucu';

const getPermissionsAsyncMock = Notifications.getPermissionsAsync as jest.Mock;

describe('BildirimIzinOkuyucu — izinDurumunuOku', () => {
  beforeEach(() => {
    getPermissionsAsyncMock.mockReset();
  });

  it("status 'granted' iken 'verildi' döner", async () => {
    getPermissionsAsyncMock.mockResolvedValueOnce({ status: 'granted' });
    expect(await izinDurumunuOku()).toBe('verildi');
  });

  it("status 'denied' iken 'reddedildi' döner", async () => {
    getPermissionsAsyncMock.mockResolvedValueOnce({ status: 'denied' });
    expect(await izinDurumunuOku()).toBe('reddedildi');
  });

  it("status 'undetermined' iken 'belirsiz' döner", async () => {
    getPermissionsAsyncMock.mockResolvedValueOnce({ status: 'undetermined' });
    expect(await izinDurumunuOku()).toBe('belirsiz');
  });

  it("getPermissionsAsync reddederse 'belirsiz' döner ve fırlatmaz", async () => {
    getPermissionsAsyncMock.mockRejectedValueOnce(new Error('boom'));
    await expect(izinDurumunuOku()).resolves.toBe('belirsiz');
  });
});
