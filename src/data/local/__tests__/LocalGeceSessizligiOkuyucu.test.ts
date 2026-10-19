/**
 * Arka plan servisleri gece sessizliğini muhafız kaydından okur; okuma ASLA fırlatmaz,
 * alanı olmayan (mevcut) kayıt kapalıdır.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';
import { geceSessizliginiOku } from '../LocalGeceSessizligiOkuyucu';

describe('geceSessizliginiOku', () => {
    beforeEach(async () => {
        await AsyncStorage.clear();
    });

    it('kayıt yoksa ya da alan yoksa kapalı (undefined)', async () => {
        expect(await geceSessizliginiOku()).toBeUndefined();
        await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI, JSON.stringify({ aktif: true }));
        expect(await geceSessizliginiOku()).toBeUndefined();
    });

    it('muhafız kaydındaki alanı doğrulayıp döndürür', async () => {
        await AsyncStorage.setItem(
            DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI,
            JSON.stringify({ aktif: true, geceSessizligi: { aktif: true, baslangicSaat: 22, baslangicDakika: 30 } })
        );
        expect(await geceSessizliginiOku()).toEqual({ aktif: true, baslangicSaat: 22, baslangicDakika: 30 });
    });

    it('bozuk JSON fırlatmaz → kapalı', async () => {
        await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI, '{bozuk');
        expect(await geceSessizliginiOku()).toBeUndefined();
    });
});
