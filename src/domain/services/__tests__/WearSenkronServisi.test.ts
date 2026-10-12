/**
 * WearSenkronServisi (issue #269) — telefon tarafı senkron ve saat "Kıldım" kuyruğu.
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
const mockSaattenKildim = jest.fn();
jest.mock('../BildirimServisi', () => ({
    BildirimServisi: { getInstance: () => ({ saattenKildimIsle: (...a: unknown[]) => mockSaattenKildim(...a) }) },
}));

import { WearSenkronServisi } from '../WearSenkronServisi';

const modul = {
    durumGonder: jest.fn(() => Promise.resolve()),
    bekleyenleriAl: jest.fn(() => Promise.resolve('[]')),
    tamamlandi: jest.fn(() => Promise.resolve()),
    basarisiz: jest.fn(() => Promise.resolve()),
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
    mockSaattenKildim.mockResolvedValue(undefined);
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

    it('baslat kılınmışlık dinleyicisini kaydeder', () => {
        servis.baslat();
        expect(mockDinleyiciAyarla).toHaveBeenCalledWith(expect.any(Function));
    });
});

describe('bekleyenleriIsle', () => {
    it('her öğeyi bildirim "Kıldım" yolundan işler, tamamlandı işaretler, sonra saati tazeler', async () => {
        konumKur();
        modul.bekleyenleriAl.mockResolvedValue(
            JSON.stringify([{ id: 'a', tarih: bugunuAl(), vakit: 'ogle' }, { id: 'b', tarih: bugunuAl(), vakit: 'ikindi' }])
        );
        await servis.bekleyenleriIsle();
        expect(mockSaattenKildim).toHaveBeenNthCalledWith(1, 'ogle', bugunuAl());
        expect(mockSaattenKildim).toHaveBeenNthCalledWith(2, 'ikindi', bugunuAl());
        expect(modul.tamamlandi).toHaveBeenCalledWith('a');
        expect(modul.tamamlandi).toHaveBeenCalledWith('b');
        expect(modul.durumGonder).toHaveBeenCalled();
    });

    it('başarısız öğe kuyrukta kalır (basarisiz), diğerleri işlenmeye devam eder', async () => {
        modul.bekleyenleriAl.mockResolvedValue(
            JSON.stringify([{ id: 'a', tarih: bugunuAl(), vakit: 'ogle' }, { id: 'b', tarih: bugunuAl(), vakit: 'aksam' }])
        );
        mockSaattenKildim.mockRejectedValueOnce(new Error('disk'));
        await servis.bekleyenleriIsle();
        expect(modul.basarisiz).toHaveBeenCalledWith('a');
        expect(modul.tamamlandi).not.toHaveBeenCalledWith('a');
        expect(modul.tamamlandi).toHaveBeenCalledWith('b');
    });

    it('eşzamanlı çağrılar TEK turu paylaşır (headless + ön plan olayı)', async () => {
        modul.bekleyenleriAl.mockResolvedValue(JSON.stringify([{ id: 'a', tarih: bugunuAl(), vakit: 'ogle' }]));
        await Promise.all([servis.bekleyenleriIsle(), servis.bekleyenleriIsle()]);
        expect(modul.bekleyenleriAl).toHaveBeenCalledTimes(1);
        expect(mockSaattenKildim).toHaveBeenCalledTimes(1);
    });

    it('bozuk kuyruk JSON çökertmez', async () => {
        modul.bekleyenleriAl.mockResolvedValue('{bozuk');
        await expect(servis.bekleyenleriIsle()).resolves.toBeUndefined();
        expect(mockSaattenKildim).not.toHaveBeenCalled();
    });
});
