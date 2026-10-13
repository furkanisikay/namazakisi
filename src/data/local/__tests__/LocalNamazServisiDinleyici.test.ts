/**
 * Kılınmışlık-değişti gözlemcisi ÇOKLU dinleyicidir (issue #275): Wear senkronu ve
 * widget tazelemesi AYNI yazımdan haber almalı; biri patlarsa diğeri susmamalı.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NamazAdi } from '../../../core/constants/UygulamaSabitleri';
import {
    kayitDegistiDinleyicisiEkle,
    kayitDegistiDinleyicisiniAyarla,
    localNamazDurumunuGuncelle,
    localTumNamazlariGuncelle,
} from '../LocalNamazServisi';

jest.mock('../../../core/utils/Logger', () => ({
    Logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

describe('LocalNamazServisi — kayıt değişti dinleyicileri', () => {
    const wear = jest.fn();
    const widget = jest.fn();

    beforeEach(async () => {
        await AsyncStorage.clear();
        wear.mockReset();
        widget.mockReset();
        kayitDegistiDinleyicisiniAyarla(wear);
        kayitDegistiDinleyicisiEkle('widget', widget);
    });

    afterAll(() => {
        kayitDegistiDinleyicisiniAyarla(null);
        kayitDegistiDinleyicisiEkle('widget', null);
    });

    it('her yazım TÜM dinleyicilere haber verir', async () => {
        await localNamazDurumunuGuncelle('2026-06-06', NamazAdi.Ogle, true);
        await localTumNamazlariGuncelle('2026-06-06', true);
        expect(wear).toHaveBeenCalledTimes(2);
        expect(widget).toHaveBeenCalledTimes(2);
    });

    it('bir dinleyici patlarsa diğeri yine çağrılır ve yazım düşmez', async () => {
        wear.mockImplementation(() => {
            throw new Error('saat yok');
        });
        const sonuc = await localNamazDurumunuGuncelle('2026-06-06', NamazAdi.Aksam, true);
        expect(sonuc.basarili).toBe(true);
        expect(widget).toHaveBeenCalledTimes(1);
    });

    it('aynı adla yeniden kayıt dinleyiciyi ÇOĞALTMAZ, öncekinin yerine geçer', async () => {
        const yeniWidget = jest.fn();
        kayitDegistiDinleyicisiEkle('widget', yeniWidget);
        await localNamazDurumunuGuncelle('2026-06-06', NamazAdi.Sabah, true);
        expect(widget).not.toHaveBeenCalled();
        expect(yeniWidget).toHaveBeenCalledTimes(1);
    });

    it('eski tek-dinleyici arayüzü widget yuvasını EZMEZ', async () => {
        kayitDegistiDinleyicisiniAyarla(null);
        await localNamazDurumunuGuncelle('2026-06-06', NamazAdi.Yatsi, true);
        expect(wear).not.toHaveBeenCalled();
        expect(widget).toHaveBeenCalledTimes(1);
    });
});
