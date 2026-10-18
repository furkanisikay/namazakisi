/**
 * Durum eylemleri: konum izni AÇIKLAMASIZ istenmez; bildirim izni Android ≤ 12'de
 * (çalışma zamanı izni yok) sistem bildirim ayarlarını açar.
 */
import { Linking, Platform } from 'react-native';

const mockKonumIste = jest.fn(async () => ({ status: 'granted' }));
jest.mock('expo-location', () => ({ requestForegroundPermissionsAsync: () => mockKonumIste() }));
const mockBildirimIste = jest.fn(async () => ({ status: 'granted' }));
jest.mock('expo-notifications', () => ({ requestPermissionsAsync: () => mockBildirimIste() }));

import { ANDROID_BILDIRIM_IZNI_API, durumEylemiUygula, konumIzniIste } from '../DurumEylemleri';

describe('durumEylemiUygula', () => {
    let ayarlar: jest.SpyInstance;
    let niyet: jest.SpyInstance;
    beforeEach(() => {
        mockKonumIste.mockClear();
        mockBildirimIste.mockClear();
        ayarlar = jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined as never);
        niyet = jest.spyOn(Linking, 'sendIntent').mockResolvedValue(undefined as never);
        // Linking önayarda zaten jest.fn: spyOn çağrı kaydını sıfırlamaz.
        ayarlar.mockClear();
        niyet.mockClear();
    });
    afterEach(() => jest.restoreAllMocks());

    it('NÖBETÇİ: konumIzni eylemi sistem diyaloğunu ASLA doğrudan açmaz (önce açıklama gerekir)', async () => {
        jest.replaceProperty(Platform, 'OS', 'android');
        await durumEylemiUygula('konumIzni');
        expect(mockKonumIste).not.toHaveBeenCalled();
        expect(ayarlar).toHaveBeenCalled();
    });

    it('konumIzniIste yalnız açıklama akışının kendisinden çağrılır ve diyaloğu açar', async () => {
        await konumIzniIste();
        expect(mockKonumIste).toHaveBeenCalledTimes(1);
    });

    it("bildirimIzni: Android ≤ 12'de uygulamanın bildirim ayarlarını açar (diyalog yok)", async () => {
        jest.replaceProperty(Platform, 'OS', 'android');
        jest.spyOn(Platform, 'Version', 'get').mockReturnValue(ANDROID_BILDIRIM_IZNI_API - 1);
        await expect(durumEylemiUygula('bildirimIzni')).resolves.toBe(true);
        expect(mockBildirimIste).not.toHaveBeenCalled();
        expect(niyet).toHaveBeenCalledWith('android.settings.APP_NOTIFICATION_SETTINGS', expect.arrayContaining([
            { key: 'android.provider.extra.APP_PACKAGE', value: 'com.furkanisikay.namazakisi' },
        ]));
    });

    it('bildirimIzni: ayar ekranı açılamazsa uygulama ayarlarına düşer', async () => {
        jest.replaceProperty(Platform, 'OS', 'android');
        jest.spyOn(Platform, 'Version', 'get').mockReturnValue(31);
        niyet.mockRejectedValue(new Error('yok'));
        await expect(durumEylemiUygula('bildirimIzni')).resolves.toBe(true);
        expect(ayarlar).toHaveBeenCalled();
    });

    it("bildirimIzni: Android 13+ ve iPhone'da izin diyaloğu", async () => {
        jest.replaceProperty(Platform, 'OS', 'android');
        jest.spyOn(Platform, 'Version', 'get').mockReturnValue(ANDROID_BILDIRIM_IZNI_API);
        await durumEylemiUygula('bildirimIzni');
        expect(mockBildirimIste).toHaveBeenCalledTimes(1);
        expect(niyet).not.toHaveBeenCalled();
    });
});
