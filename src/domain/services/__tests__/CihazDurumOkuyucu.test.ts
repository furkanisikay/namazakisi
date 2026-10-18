/**
 * Cihaz durumu okuyucu: her alan bağımsız, hata = null (sus), izin üç durumlu.
 */
import { Platform } from 'react-native';
import { alaniOku, cihazDurumunuOku, izinCoz } from '../CihazDurumOkuyucu';

jest.mock('expo-location', () => ({
    getForegroundPermissionsAsync: jest.fn(async () => ({ status: 'denied', canAskAgain: false })),
}));
jest.mock('expo-notifications', () => ({
    getPermissionsAsync: jest.fn(async () => ({ status: 'granted', granted: true })),
}));

describe('izinCoz', () => {
    it('üç durum', () => {
        expect(izinCoz({ status: 'granted' })).toBe('verildi');
        expect(izinCoz({ status: 'denied', canAskAgain: true })).toBe('sorulabilir');
        expect(izinCoz({ status: 'undetermined' })).toBe('sorulabilir');
        expect(izinCoz({ status: 'denied', canAskAgain: false })).toBe('reddedildi');
        expect(izinCoz(null)).toBeNull();
        expect(izinCoz({ status: 'tuhaf' })).toBeNull();
    });
});

describe('cihazDurumunuOku', () => {
    afterEach(() => jest.restoreAllMocks());

    it('istenen alanları okur, istenmeyenler null kalır', async () => {
        const d = await cihazDurumunuOku(['konumIzni', 'bildirimIzni']);
        expect(d.konumIzni).toBe('reddedildi');
        expect(d.bildirimIzni).toBe('verildi');
        expect(d.takvimIzni).toBeNull();
    });

    it("iPhone'da Android'e özgü alanlar null, Samsung/menteşe false", async () => {
        jest.replaceProperty(Platform, 'OS', 'ios');
        expect(await alaniOku('tamAlarm')).toBeNull();
        expect(await alaniOku('dndErisimi')).toBeNull();
        expect(await alaniOku('esliSaat')).toBeNull();
        expect(await alaniOku('samsung')).toBe(false);
        expect(await alaniOku('mentese')).toBe(false);
    });

    it('okuyucu patlarsa alan null (asla fırlatmaz)', async () => {
        jest.replaceProperty(Platform, 'OS', 'android');
        // expo-countdown-notification jest'te native modülsüz: köprü fonksiyonları ya null
        // döner ya patlar — her iki durumda sonuç bilinmiyor.
        await expect(alaniOku('alarmSesiAcik')).resolves.toBeNull();
        await expect(alaniOku('widgetEkli')).resolves.toBeNull();
    });

    it('Android köprüsüz: Samsung ve Türkçe ses BİLİNMİYOR (null) — "değil/yok" uydurulmaz', async () => {
        jest.replaceProperty(Platform, 'OS', 'android');
        await expect(alaniOku('samsung')).resolves.toBeNull();
        await expect(alaniOku('turkceTts')).resolves.toBeNull();
    });
});
