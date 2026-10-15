/**
 * Apple Watch köprüsü (issue #285) — `saatKoprusu` / `saatUygulamasiDestekli`.
 *
 * Gerçek `index.ts` (global mock `expo-siri-kisayollari/src$` yalnız `/src` ile biten
 * yolları eşler; burası `../index`'i doğrudan yükler). Native modül
 * `requireOptionalNativeModule` üzerinden sahtelenir.
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

beforeEach(() => {
    mockModulVar = true;
    mockPlatformDurumu.OS = 'ios';
    mockNative.saatDestekli = jest.fn(() => true);
    mockNative.saatDurumGonder = jest.fn(async () => 'gonderildi');
});

describe('saatUygulamasiDestekli', () => {
    it('native "destekli" derse true', () => {
        expect(yukle().saatUygulamasiDestekli()).toBe(true);
    });

    it('bayrak kapalı build (plist anahtarı yok) / iPad → false', () => {
        mockNative.saatDestekli = jest.fn(() => false);
        expect(yukle().saatUygulamasiDestekli()).toBe(false);
    });

    it('eski ikili (fonksiyon yok), modül yok, Android ya da fırlatan native → false', () => {
        mockNative.saatDestekli = undefined;
        expect(yukle().saatUygulamasiDestekli()).toBe(false);

        mockNative.saatDestekli = jest.fn(() => {
            throw new Error('x');
        });
        expect(yukle().saatUygulamasiDestekli()).toBe(false);

        mockNative.saatDestekli = jest.fn(() => true);
        mockModulVar = false;
        expect(yukle().saatUygulamasiDestekli()).toBe(false);

        mockModulVar = true;
        mockPlatformDurumu.OS = 'android';
        expect(yukle().saatUygulamasiDestekli()).toBe(false);
    });
});

describe('saatKoprusu', () => {
    it('desteklenmiyorsa null', () => {
        mockNative.saatDestekli = jest.fn(() => false);
        expect(yukle().saatKoprusu()).toBeNull();
    });

    it('yükü olduğu gibi native\'e geçirir', async () => {
        const kopru = yukle().saatKoprusu();
        await kopru!.durumGonder('{"surum":2}');
        expect(mockNative.saatDurumGonder).toHaveBeenCalledWith('{"surum":2}');
    });

    it('"bekliyor" ve "saatYok" HATA DEĞİL (native son yükü saklayıp sonra gönderir); "hata" reddedilir', async () => {
        const kopru = yukle().saatKoprusu()!;
        mockNative.saatDurumGonder!.mockResolvedValueOnce('bekliyor');
        await expect(kopru.durumGonder('a')).resolves.toBeUndefined();
        mockNative.saatDurumGonder!.mockResolvedValueOnce('saatYok');
        await expect(kopru.durumGonder('b')).resolves.toBeUndefined();
        mockNative.saatDurumGonder!.mockResolvedValueOnce('hata');
        await expect(kopru.durumGonder('c')).rejects.toThrow();
    });
});
