/**
 * Cihaz ağı taşıması: yalnız özel IPv4 + geçerli port (D-06); Android ham soket köprüsü,
 * iOS fetch (yanıt kodu + gövde), zaman aşımında istek iptal edilir.
 */
import { Platform } from 'react-native';
import { rastgeleBaytlar, yereleGonder } from '../CihazAgiTasima';

jest.mock('expo-crypto', () => ({ getRandomBytes: (n: number) => new Uint8Array(n).fill(7) }));
const kopru = require('../../../../modules/expo-tv-esleme/src');

describe('CihazAgiTasima', () => {
    afterEach(() => jest.restoreAllMocks());

    it('rastgele baytlar expo-crypto CSPRNG\'sinden', () => {
        expect(Array.from(rastgeleBaytlar(4))).toEqual([7, 7, 7, 7]);
    });

    it('yerel olmayan adres ya da geçersiz port reddedilir (istek gönderilmez)', async () => {
        await expect(yereleGonder('8.8.8.8', 47000, '/esitle', '{}')).rejects.toThrow('Yerel ağ adresi değil');
        await expect(yereleGonder('192.168.1.5', 80, '/esitle', '{}')).rejects.toThrow('Yerel ağ adresi değil');
        await expect(yereleGonder('010.0.0.1', 47000, '/esitle', '{}')).rejects.toThrow('Yerel ağ adresi değil');
    });

    it('Android: native ham soket köprüsü kullanılır', async () => {
        jest.replaceProperty(Platform, 'OS', 'android');
        kopru.yerelIstek.mockResolvedValueOnce({ kod: 200, govde: 'x' });
        expect(await yereleGonder('192.168.1.5', 47000, '/esitle', '{"a":1}', 3000)).toEqual({ kod: 200, govde: 'x' });
        expect(kopru.yerelIstek).toHaveBeenCalledWith('192.168.1.5', 47000, '/esitle', '{"a":1}', 3000);
    });

    it('iOS: fetch ile POST; kod + gövde döner', async () => {
        jest.replaceProperty(Platform, 'OS', 'ios');
        const fetchSahte = jest.fn(async () => ({ status: 403, text: async () => '' }));
        (global as unknown as { fetch: unknown }).fetch = fetchSahte;
        expect(await yereleGonder('10.0.0.7', 47000, '/esle', '{}')).toEqual({ kod: 403, govde: '' });
        expect(fetchSahte).toHaveBeenCalledWith('http://10.0.0.7:47000/esle', expect.objectContaining({ method: 'POST', body: '{}' }));
    });
});
