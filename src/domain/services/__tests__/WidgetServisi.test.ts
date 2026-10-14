/**
 * WidgetServisi (issue #275): widget + hızlı ayarlar kutusunun veri kaynağı.
 * Native `WidgetVeri` mock'lanır; platform AÇIKÇA seçilir (jest varsayılanı iOS).
 */
import { NativeModules, Platform } from 'react-native';
import { NamazAdi } from '../../../core/constants/UygulamaSabitleri';
import { bugunuAl, dunuAl } from '../../../core/utils/TarihYardimcisi';

jest.mock('../../../core/utils/Logger', () => ({
    Logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));
const mockAralik = jest.fn();
const mockDinleyiciEkle = jest.fn();
jest.mock('../../../data/local/LocalNamazServisi', () => ({
    localTarihAraligindakiNamazlariGetir: (...a: unknown[]) => mockAralik(...a),
    kayitDegistiDinleyicisiEkle: (...a: unknown[]) => mockDinleyiciEkle(...a),
}));

import { WIDGET_DINLEYICI_ADI, WidgetServisi } from '../WidgetServisi';

const modul = { vakitlerKaydet: jest.fn(), kilinanlarKaydet: jest.fn() };
const servis = WidgetServisi.getInstance();

beforeEach(() => {
    jest.clearAllMocks();
    servis.__testIcinSifirla();
    jest.replaceProperty(Platform, 'OS', 'android');
    (NativeModules as Record<string, unknown>).WidgetVeri = modul;
    mockAralik.mockResolvedValue({
        basarili: true,
        veri: [
            { tarih: dunuAl(), namazlar: [{ namazAdi: NamazAdi.Yatsi, tamamlandi: true }] },
            { tarih: bugunuAl(), namazlar: [{ namazAdi: NamazAdi.Sabah, tamamlandi: true }, { namazAdi: NamazAdi.Ogle, tamamlandi: false }] },
        ],
    });
});
afterEach(() => jest.restoreAllMocks());

describe('vakitleriyaz', () => {
    it('dün + 8 günlük çizelgeyi yazar', async () => {
        await servis.vakitleriyaz({ lat: 41.0082, lng: 28.9784 });
        const yuk = JSON.parse(modul.vakitlerKaydet.mock.calls[0][0]);
        expect(yuk.surum).toBe(2);
        expect(yuk.tarih).toBe(bugunuAl());
        expect(yuk.vakitler[0].tarih).toBe(dunuAl());
    });

    it('(0,0) konumunda yazmaz (Gine Körfezi vakitleri widget\'a gitmesin)', async () => {
        await servis.vakitleriyaz({ lat: 0, lng: 0 });
        expect(modul.vakitlerKaydet).not.toHaveBeenCalled();
    });

    it('iOS\'ta Siri modülü yoksa no-op (Android modülüne de dokunmaz)', async () => {
        jest.replaceProperty(Platform, 'OS', 'ios');
        await servis.vakitleriyaz({ lat: 41, lng: 29 });
        servis.baslat();
        expect(modul.vakitlerKaydet).not.toHaveBeenCalled();
        expect(mockDinleyiciEkle).not.toHaveBeenCalled();
    });

    it('iOS\'ta AYNI yük Siri/Kısayollar deposuna yazılır (issue #279)', async () => {
        jest.replaceProperty(Platform, 'OS', 'ios');
        // iOS köprüsü AsyncFunction'dır (#295): Promise döner, servis onu bekler.
        const siri = { vakitlerKaydet: jest.fn().mockResolvedValue(undefined), kilinanlarKaydet: jest.fn().mockResolvedValue(undefined) };
        const kopru = require('../../../../modules/expo-siri-kisayollari/src');
        kopru.siriVeriYazici.mockReturnValue(siri);
        try {
            await servis.vakitleriyaz({ lat: 41.0082, lng: 28.9784 });
            await servis.kilinanlariYaz();
            servis.baslat();
        } finally {
            kopru.siriVeriYazici.mockReturnValue(null);
        }
        expect(modul.vakitlerKaydet).not.toHaveBeenCalled();
        expect(JSON.parse(siri.vakitlerKaydet.mock.calls[0][0]).surum).toBe(2);
        expect(JSON.parse(siri.kilinanlarKaydet.mock.calls[0][0])[bugunuAl()]).toEqual(['sabah']);
        expect(mockDinleyiciEkle).toHaveBeenCalledWith(WIDGET_DINLEYICI_ADI, expect.any(Function));
    });

    it('iOS köprüsünün reddedilen Promise\'i yakalanır (servis fırlatmaz)', async () => {
        jest.replaceProperty(Platform, 'OS', 'ios');
        const siri = {
            vakitlerKaydet: jest.fn().mockRejectedValue(new Error('kopru')),
            kilinanlarKaydet: jest.fn().mockRejectedValue(new Error('kopru')),
        };
        const kopru = require('../../../../modules/expo-siri-kisayollari/src');
        kopru.siriVeriYazici.mockReturnValue(siri);
        try {
            await expect(servis.vakitleriyaz({ lat: 41.0082, lng: 28.9784 })).resolves.toBeUndefined();
            await expect(servis.kilinanlariYaz()).resolves.toBeUndefined();
        } finally {
            kopru.siriVeriYazici.mockReturnValue(null);
        }
    });
});

describe('kilinanlariYaz', () => {
    it('dün + bugünün kılınmışlığını widget kodlarıyla yazar', async () => {
        await servis.kilinanlariYaz();
        expect(mockAralik).toHaveBeenCalledWith(dunuAl(), bugunuAl());
        expect(JSON.parse(modul.kilinanlarKaydet.mock.calls[0][0])).toEqual({
            [dunuAl()]: ['yatsi'],
            [bugunuAl()]: ['sabah'],
        });
    });

    it('yazımlar SIRALIDIR: eşzamanlı çağrılarda son durum en son yazılır', async () => {
        mockAralik
            .mockResolvedValueOnce({ basarili: true, veri: [{ tarih: bugunuAl(), namazlar: [] }] })
            .mockResolvedValueOnce({
                basarili: true,
                veri: [{ tarih: bugunuAl(), namazlar: [{ namazAdi: NamazAdi.Ogle, tamamlandi: true }] }],
            });
        await Promise.all([servis.kilinanlariYaz(), servis.kilinanlariYaz()]);
        const son = modul.kilinanlarKaydet.mock.calls[modul.kilinanlarKaydet.mock.calls.length - 1][0];
        expect(JSON.parse(son)).toEqual({ [bugunuAl()]: ['ogle'] });
    });

    it('okuma başarısızsa yazmaz (widget boş kılınmışlıkla ezilmesin)', async () => {
        mockAralik.mockResolvedValueOnce({ basarili: false });
        await servis.kilinanlariYaz();
        expect(modul.kilinanlarKaydet).not.toHaveBeenCalled();
    });
});

describe('baslat', () => {
    it('kılınmışlık dinleyicisini ADLI yuvaya kaydeder ve tetiklenince yazar', async () => {
        servis.baslat();
        expect(mockDinleyiciEkle).toHaveBeenCalledWith(WIDGET_DINLEYICI_ADI, expect.any(Function));
        const dinleyici = mockDinleyiciEkle.mock.calls[0][1] as () => void;
        dinleyici();
        await servis.kilinanlariYaz();
        expect(modul.kilinanlarKaydet).toHaveBeenCalled();
    });
});
