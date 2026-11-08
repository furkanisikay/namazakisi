/**
 * iPhone duvar kâğıdı fotoğraf köprüsü — `duvarFotografiniYaz` / `duvarFotografiniSil`.
 *
 * Gerçek `index.ts` (global mock yalnız `/src` ile biten yolu eşler; burası `../index`'i doğrudan
 * yükler). Eski ikili, Android ve fırlatan native hiçbir zaman reddetmez.
 */
const mockNative: Record<string, jest.Mock | undefined> = {};
let mockModulVar = true;
jest.mock('expo-modules-core', () => ({
    requireOptionalNativeModule: () => (mockModulVar ? mockNative : null),
}));

const mockPlatformDurumu = { OS: 'ios' };
jest.mock('react-native', () => ({
    Platform: {
        get OS() {
            return mockPlatformDurumu.OS;
        },
    },
}));

const yukle = (): typeof import('../index') => {
    let kopru: typeof import('../index') | undefined;
    jest.isolateModules(() => {
        kopru = require('../index');
    });
    return kopru!;
};

const URI = 'file:///var/mobile/tmp/secilen.jpg';
const AD = 'duvar-foto-ab12cd34.jpg';

beforeEach(() => {
    mockModulVar = true;
    mockPlatformDurumu.OS = 'ios';
    mockNative.duvarFotografiniYaz = jest.fn(async () => true);
    mockNative.duvarFotografiniSil = jest.fn(async () => undefined);
});

describe('duvarFotografiniYaz', () => {
    it('native yazınca true; argümanlar aynen geçer', async () => {
        await expect(yukle().duvarFotografiniYaz(URI, AD)).resolves.toBe(true);
        expect(mockNative.duvarFotografiniYaz).toHaveBeenCalledWith(URI, AD);
    });

    it('native false (geçersiz ad, okunamayan kaynak) → false', async () => {
        mockNative.duvarFotografiniYaz = jest.fn(async () => false);
        await expect(yukle().duvarFotografiniYaz(URI, AD)).resolves.toBe(false);
    });

    it('eski ikili (fonksiyon yok), modül yok, Android ya da fırlatan native → false, reddetmez', async () => {
        mockNative.duvarFotografiniYaz = undefined;
        await expect(yukle().duvarFotografiniYaz(URI, AD)).resolves.toBe(false);

        mockNative.duvarFotografiniYaz = jest.fn(async () => true);
        mockModulVar = false;
        await expect(yukle().duvarFotografiniYaz(URI, AD)).resolves.toBe(false);

        mockModulVar = true;
        mockPlatformDurumu.OS = 'android';
        await expect(yukle().duvarFotografiniYaz(URI, AD)).resolves.toBe(false);
        expect(mockNative.duvarFotografiniYaz).not.toHaveBeenCalled();

        mockPlatformDurumu.OS = 'ios';
        mockNative.duvarFotografiniYaz = jest.fn(async () => {
            throw new Error('native');
        });
        await expect(yukle().duvarFotografiniYaz(URI, AD)).resolves.toBe(false);
    });
});

describe('duvarFotografiniSil', () => {
    it('native silmeyi çağırır', async () => {
        await expect(yukle().duvarFotografiniSil(AD)).resolves.toBeUndefined();
        expect(mockNative.duvarFotografiniSil).toHaveBeenCalledWith(AD);
    });

    it('eski ikili ya da fırlatan native → sessizce atlar', async () => {
        mockNative.duvarFotografiniSil = undefined;
        await expect(yukle().duvarFotografiniSil(AD)).resolves.toBeUndefined();
        mockNative.duvarFotografiniSil = jest.fn(async () => {
            throw new Error('native');
        });
        await expect(yukle().duvarFotografiniSil(AD)).resolves.toBeUndefined();
    });
});
