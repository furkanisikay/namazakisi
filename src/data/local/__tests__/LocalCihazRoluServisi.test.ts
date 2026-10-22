import AsyncStorage from '@react-native-async-storage/async-storage';
import { cihazRoluOku, cihazRoluYaz, hatirlatmaKurulabilirMi } from '../LocalCihazRoluServisi';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';

describe('LocalCihazRoluServisi', () => {
    beforeEach(async () => {
        await AsyncStorage.clear();
    });

    it('kayıt yokken hatırlatma kurulur', async () => {
        expect(await hatirlatmaKurulabilirMi()).toBe(true);
    });

    it('ikinci cihaz rolü yazılınca kurulmaz, ana rolde yeniden kurulur', async () => {
        await cihazRoluYaz({ rol: 'ikincil', soruldu: true });
        expect(await cihazRoluOku()).toEqual({ rol: 'ikincil', soruldu: true });
        expect(await hatirlatmaKurulabilirMi()).toBe(false);
        await cihazRoluYaz({ rol: 'ana', soruldu: true });
        expect(await hatirlatmaKurulabilirMi()).toBe(true);
    });

    it('ev ekranı modu açıkken ana cihaz da kurmaz', async () => {
        await cihazRoluYaz({ rol: 'ana' });
        await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.EV_EKRANI_AYARI, JSON.stringify({ acik: true }));
        expect(await hatirlatmaKurulabilirMi()).toBe(false);
    });

    it('bozuk kayıt güvenli tarafa (kur) düşer', async () => {
        await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.CIHAZ_ROLU, '{kesik');
        await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.EV_EKRANI_AYARI, 'null');
        expect(await hatirlatmaKurulabilirMi()).toBe(true);
    });
});
