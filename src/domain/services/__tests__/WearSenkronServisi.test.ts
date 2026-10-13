/**
 * WearSenkronServisi (issue #269) — telefon tarafı senkron; saat "Kıldım" kuyruğu ortaktır (KildimKuyruguServisi).
 * Native modül `NativeModules.WearSenkron` mock'lanır; platform AÇIKÇA seçilir
 * (jest varsayılanı iOS — AGENTS.md).
 */
import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI, NamazAdi } from '../../../core/constants/UygulamaSabitleri';
import { bugunuAl, dunuAl } from '../../../core/utils/TarihYardimcisi';

jest.mock('@react-native-async-storage/async-storage', () => ({ getItem: jest.fn() }));
jest.mock('../../../core/utils/Logger', () => ({
    Logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));
const mockAralik = jest.fn();
const mockDinleyiciAyarla = jest.fn();
jest.mock('../../../data/local/LocalNamazServisi', () => ({
    localTarihAraligindakiNamazlariGetir: (...a: unknown[]) => mockAralik(...a),
    kayitDegistiDinleyicisiniAyarla: (...a: unknown[]) => mockDinleyiciAyarla(...a),
}));
const mockKuyrukIsle = jest.fn(() => Promise.resolve());
jest.mock('../KildimKuyruguServisi', () => ({
    KildimKuyruguServisi: { getInstance: () => ({ bekleyenleriIsle: () => mockKuyrukIsle() }) },
}));

import { WearSenkronServisi } from '../WearSenkronServisi';

const modul = {
    durumGonder: jest.fn(() => Promise.resolve()),
};
const servis = WearSenkronServisi.getInstance();

const konumKur = (koordinatlar = { lat: 41.0082, lng: 28.9784 }) =>
    (AsyncStorage.getItem as jest.Mock).mockImplementation(async (k: string) =>
        k === DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI
            ? JSON.stringify({ konumModu: 'manuel', seciliIlAdi: 'İstanbul', seciliIlceAdi: 'Fatih', koordinatlar })
            : null
    );

beforeEach(() => {
    jest.clearAllMocks();
    servis.__testIcinSifirla();
    jest.replaceProperty(Platform, 'OS', 'android');
    (NativeModules as Record<string, unknown>).WearSenkron = modul;
    mockAralik.mockResolvedValue({
        basarili: true,
        veri: [
            { tarih: dunuAl(), namazlar: [{ namazAdi: NamazAdi.Yatsi, tamamlandi: true }, { namazAdi: NamazAdi.Ogle, tamamlandi: false }] },
            { tarih: bugunuAl(), namazlar: [{ namazAdi: NamazAdi.Sabah, tamamlandi: true }] },
        ],
    });
});
afterEach(() => jest.restoreAllMocks());

describe('gonder', () => {
    it('yükü NamazAdi → VakitAdi çevirisiyle ve konum adıyla gönderir', async () => {
        konumKur();
        await servis.gonder();
        expect(modul.durumGonder).toHaveBeenCalledTimes(1);
        const yuk = JSON.parse((modul.durumGonder.mock.calls[0] as unknown as [string])[0]);
        expect(yuk.konumAdi).toBe('Fatih, İstanbul');
        expect(yuk.gunler[0].kilinan).toEqual(['yatsi']);
        expect(yuk.gunler[1].kilinan).toEqual(['imsak']);
    });

    it('içerik aynıysa ikinci kez yazmaz', async () => {
        konumKur();
        await servis.gonder();
        await servis.gonder();
        expect(modul.durumGonder).toHaveBeenCalledTimes(1);
    });

    it('konum yoksa / (0,0) ise göndermez', async () => {
        konumKur({ lat: 0, lng: 0 });
        await servis.gonder();
        expect(modul.durumGonder).not.toHaveBeenCalled();
    });

    it('iOS / modül yoksa no-op', async () => {
        jest.replaceProperty(Platform, 'OS', 'ios');
        konumKur();
        await servis.gonder();
        servis.baslat();
        expect(modul.durumGonder).not.toHaveBeenCalled();
        expect(mockDinleyiciAyarla).not.toHaveBeenCalled();
    });

    it('Wear API yoksa (WEAR_YOK) bir kez bilgi yazar, sonra HİÇ denemez (tanı logu dolmasın)', async () => {
        konumKur();
        const { Logger } = jest.requireMock('../../../core/utils/Logger');
        modul.durumGonder.mockRejectedValueOnce(Object.assign(new Error('yok'), { code: 'WEAR_YOK' }));
        await servis.gonder();
        await servis.gonder();
        await servis.gonder();
        expect(modul.durumGonder).toHaveBeenCalledTimes(1);
        expect(Logger.warn).not.toHaveBeenCalled();
        expect(Logger.info).toHaveBeenCalledTimes(1);
    });

    it('diğer hatalar uyarı yazar ve sonraki gönderim yeniden dener', async () => {
        konumKur();
        modul.durumGonder.mockRejectedValueOnce(new Error('gecici'));
        await servis.gonder();
        await servis.gonder();
        expect(modul.durumGonder).toHaveBeenCalledTimes(2);
    });

    it('gönderimler sıralıdır (eşzamanlı çağrılar üst üste binmez)', async () => {
        konumKur();
        let acik = 0;
        let enCok = 0;
        modul.durumGonder.mockImplementation(async () => {
            acik++;
            enCok = Math.max(enCok, acik);
            await Promise.resolve();
            acik--;
        });
        mockAralik
            .mockResolvedValueOnce({ basarili: true, veri: [{ tarih: bugunuAl(), namazlar: [] }] })
            .mockResolvedValueOnce({ basarili: true, veri: [{ tarih: bugunuAl(), namazlar: [{ namazAdi: NamazAdi.Ogle, tamamlandi: true }] }] });
        await Promise.all([servis.gonder(), servis.gonder()]);
        expect(enCok).toBe(1);
        modul.durumGonder.mockImplementation(() => Promise.resolve());
    });

    it('baslat kılınmışlık dinleyicisini kaydeder', () => {
        servis.baslat();
        expect(mockDinleyiciAyarla).toHaveBeenCalledWith(expect.any(Function));
    });
});

describe('bekleyenleriIsle', () => {
    it('ortak "Kıldım" kuyruğuna DEVREDER (saat, widget, kutu tek kuyruk — #275/#276)', async () => {
        await servis.bekleyenleriIsle();
        expect(mockKuyrukIsle).toHaveBeenCalledTimes(1);
    });
});
