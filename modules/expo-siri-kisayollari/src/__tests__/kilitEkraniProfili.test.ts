/**
 * iPhone kilit ekranı saat alanı ölçümü köprüsü — `kilitEkraniProfili`.
 *
 * Gerçek `index.ts` (global mock yalnız `/src` ile biten yolu eşler; burası `../index`'i doğrudan
 * yükler). Eski ikili, Android, bozuk cevap ve fırlatan native hiçbir zaman reddetmez.
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

const URI = 'file:///var/mobile/tmp/kilit-ekrani.png';

beforeEach(() => {
    mockModulVar = true;
    mockPlatformDurumu.OS = 'ios';
    mockNative.kilitEkraniProfili = jest.fn(async () => ({ profil: [0, 0.5, 1] }));
});

describe('kilitEkraniProfili', () => {
    it('native profili aynen döner; URI aynen geçer', async () => {
        await expect(yukle().kilitEkraniProfili(URI)).resolves.toEqual({ profil: [0, 0.5, 1] });
        expect(mockNative.kilitEkraniProfili).toHaveBeenCalledWith(URI);
    });

    it('native hatası (referans-yok, oran) aynen döner', async () => {
        mockNative.kilitEkraniProfili = jest.fn(async () => ({ hata: 'referans-yok' }));
        await expect(yukle().kilitEkraniProfili(URI)).resolves.toEqual({ hata: 'referans-yok' });
        mockNative.kilitEkraniProfili = jest.fn(async () => ({ hata: 'oran' }));
        await expect(yukle().kilitEkraniProfili(URI)).resolves.toEqual({ hata: 'oran' });
    });

    it('bozuk cevap (sayı olmayan profil, boş) → okunamadi', async () => {
        mockNative.kilitEkraniProfili = jest.fn(async () => ({ profil: [0, 'x'] }));
        await expect(yukle().kilitEkraniProfili(URI)).resolves.toEqual({ hata: 'okunamadi' });
        mockNative.kilitEkraniProfili = jest.fn(async () => null);
        await expect(yukle().kilitEkraniProfili(URI)).resolves.toEqual({ hata: 'okunamadi' });
    });

    it('eski ikili, modül yok, Android ya da fırlatan native → okunamadi, reddetmez', async () => {
        mockNative.kilitEkraniProfili = undefined;
        await expect(yukle().kilitEkraniProfili(URI)).resolves.toEqual({ hata: 'okunamadi' });

        mockNative.kilitEkraniProfili = jest.fn(async () => ({ profil: [0] }));
        mockModulVar = false;
        await expect(yukle().kilitEkraniProfili(URI)).resolves.toEqual({ hata: 'okunamadi' });

        mockModulVar = true;
        mockPlatformDurumu.OS = 'android';
        await expect(yukle().kilitEkraniProfili(URI)).resolves.toEqual({ hata: 'okunamadi' });
        expect(mockNative.kilitEkraniProfili).not.toHaveBeenCalled();

        mockPlatformDurumu.OS = 'ios';
        mockNative.kilitEkraniProfili = jest.fn(async () => {
            throw new Error('native');
        });
        await expect(yukle().kilitEkraniProfili(URI)).resolves.toEqual({ hata: 'okunamadi' });
    });
});
