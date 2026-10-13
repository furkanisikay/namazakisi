/**
 * WearSenkronServisi (issue #269) — telefon tarafı senkron; saat "Kıldım" kuyruğu ortaktır (KildimKuyruguServisi).
 * Native modül `NativeModules.WearSenkron` mock'lanır; platform AÇIKÇA seçilir
 * (jest varsayılanı iOS — AGENTS.md).
 */
import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI, NamazAdi } from '../../../core/constants/UygulamaSabitleri';
import { bugunuAl, dunuAl, gunEkle } from '../../../core/utils/TarihYardimcisi';

jest.mock('@react-native-async-storage/async-storage', () => ({ getItem: jest.fn() }));
jest.mock('../../../core/utils/Logger', () => ({
    Logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));
const mockAralik = jest.fn();
const mockDinleyiciAyarla = jest.fn();
const mockMuhafizKilinan = jest.fn();
jest.mock('../../../data/local/LocalNamazServisi', () => ({
    localTarihAraligindakiNamazlariGetir: (...a: unknown[]) => mockAralik(...a),
    kayitDegistiDinleyicisiniAyarla: (...a: unknown[]) => mockDinleyiciAyarla(...a),
    kilinanVakitleriAl: (...a: unknown[]) => mockMuhafizKilinan(...a),
}));
const mockKuyrukIsle = jest.fn(() => Promise.resolve());
jest.mock('../KildimKuyruguServisi', () => ({
    KildimKuyruguServisi: { getInstance: () => ({ bekleyenleriIsle: () => mockKuyrukIsle() }) },
}));

import { WearSenkronServisi } from '../WearSenkronServisi';
import { muhafizPlaniDegistiBildir, muhafizPlaniDinleyicisiniAyarla } from '../muhafizPlaniGozlemcisi';
import { muhafizMatrisiniCoz } from '../../../core/muhafiz/motorAdaptoru';
import { canliSaatPayiDegisti } from '../canliSaatGozlemcisi';
import { ertelemeDegistiBildir } from '../muhafizErtelemeDurumu';

const modul = {
    durumGonder: jest.fn(() => Promise.resolve()),
};
const servis = WearSenkronServisi.getInstance();

const konumKur = (koordinatlar = { lat: 41.0082, lng: 28.9784 }, muhafiz: unknown = null, ozelGun: unknown = null) =>
    (AsyncStorage.getItem as jest.Mock).mockImplementation(async (k: string) => {
        if (k === DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI) {
            return JSON.stringify({ konumModu: 'manuel', seciliIlAdi: 'İstanbul', seciliIlceAdi: 'Fatih', koordinatlar });
        }
        if (k === DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI && muhafiz) return JSON.stringify(muhafiz);
        if (k === DEPOLAMA_ANAHTARLARI.OZEL_GUN_AYARLARI && ozelGun) return JSON.stringify(ozelGun);
        return null;
    });

const gonderilenYuk = (i = 0) => JSON.parse((modul.durumGonder.mock.calls[i] as unknown as [string])[0]);
const ESKI_AYAR = {
    esikler: { seviye1: 45, seviye2: 25, seviye3: 10, seviye4: 3 },
    sikliklar: { seviye1: 15, seviye2: 10, seviye3: 5, seviye4: 1 },
};

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
    mockMuhafizKilinan.mockResolvedValue([]);
    muhafizPlaniDinleyicisiniAyarla(null);
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

    it('muhafız ayarı yoksa plan BOŞ gider (vakitler yine gider), sürüm 2', async () => {
        konumKur();
        await servis.gonder();
        const yuk = gonderilenYuk();
        expect(yuk.surum).toBe(2);
        expect(yuk.muhafiz).toEqual([]);
        expect(yuk.gunler).toHaveLength(31);
    });

    it('muhafız diskte açıksa (ham AsyncStorage) telefonun planı saate gider; kapalıysa gitmez', async () => {
        konumKur(undefined, { aktif: true, ...ESKI_AYAR });
        await servis.gonder();
        const plan = gonderilenYuk().muhafiz as { id: string; ms: number }[];
        expect(plan.length).toBeGreaterThan(0);
        expect(plan[0].id).toMatch(/^muhafiz_\d{4}-\d{2}-\d{2}_vakit_[a-z]+_seviye_[1-4]_dk_\d+$/);

        servis.__testIcinSifirla();
        modul.durumGonder.mockClear();
        konumKur(undefined, { aktif: false, ...ESKI_AYAR });
        await servis.gonder();
        expect(gonderilenYuk().muhafiz).toEqual([]);
    });

    it('özel gün aralığında saatin planı da BOŞ (#272 — telefonla aynı kapı)', async () => {
        konumKur(undefined, { aktif: true, ...ESKI_AYAR }, {
            ozelGunModuAktif: true,
            aktifOzelGun: { baslangicTarihi: dunuAl(), bitisTarihi: gunEkle(bugunuAl(), 5) },
        });
        await servis.gonder();
        expect(gonderilenYuk().muhafiz).toEqual([]);
    });

    it('muhafız kılınmışlığı (kilinanVakitleriAl) da planı boşaltır — tek doğru kaynak', async () => {
        konumKur(undefined, { aktif: true, ...ESKI_AYAR });
        await servis.gonder();
        const once = (gonderilenYuk().muhafiz as { tarih: string; vakit: string }[]).filter(
            (k) => k.tarih === bugunuAl() && k.vakit === 'yatsi'
        );
        expect(once.length).toBeGreaterThan(0);

        servis.__testIcinSifirla();
        modul.durumGonder.mockClear();
        mockMuhafizKilinan.mockImplementation(async (t: string) => (t === bugunuAl() ? ['yatsi'] : []));
        await servis.gonder();
        const sonra = (gonderilenYuk().muhafiz as { tarih: string; vakit: string }[]).filter(
            (k) => k.tarih === bugunuAl() && k.vakit === 'yatsi'
        );
        expect(sonra).toEqual([]);
    });

    it('ERTELEME (#289): bekleyen ertelenen kopyanın aralığı saatin planından SÜZÜLÜR; "ertelendi" gözlemcisi saati tazeler', async () => {
        const Notifications = require('expo-notifications');
        konumKur(undefined, { aktif: true, ...ESKI_AYAR });
        servis.baslat();
        Notifications.getAllScheduledNotificationsAsync.mockResolvedValue([]);
        await servis.gonder();
        const yatsiKayitlari = (i: number) =>
            (gonderilenYuk(i).muhafiz as { tarih: string; vakit: string }[]).filter(
                (k) => k.tarih === bugunuAl() && k.vakit === 'yatsi'
            );
        expect(yatsiKayitlari(0).length).toBeGreaterThan(0);

        // Hedef çok ileride: bugünün yatsısının tüm kayıtları erteleme içinde kalır.
        Notifications.getAllScheduledNotificationsAsync.mockResolvedValue([
            {
                identifier: `muhafiz_${bugunuAl()}_vakit_yatsi_ertele`,
                content: { data: { ertelemeHedefMs: Date.now() + 3 * 24 * 60 * 60 * 1000 } },
            },
        ]);
        ertelemeDegistiBildir();
        await servis.gonder(); // zincirdeki turu bekle
        expect(modul.durumGonder).toHaveBeenCalledTimes(2);
        expect(yatsiKayitlari(1)).toEqual([]);
        Notifications.getAllScheduledNotificationsAsync.mockReset();
    });

    it('muhafız planı değişince (ArkaplanMuhafizServisi bildirimi) saat tazelenir ve O matrisi kullanır', async () => {
        konumKur();
        servis.baslat();
        muhafizPlaniDegistiBildir({ aktif: true, matris: muhafizMatrisiniCoz(ESKI_AYAR) });
        await servis.gonder(); // zincirdeki turu bekle
        expect(modul.durumGonder).toHaveBeenCalled();
        expect(gonderilenYuk().muhafiz.length).toBeGreaterThan(0);
    });

    it('Now Bar saat payı (issue #282) yüke "canli" olarak girer; yoksa/bozuksa alan HİÇ yoktur', async () => {
        const pay = {
            vakitler: { imsak: true, ogle: false, ikindi: true, aksam: true, yatsi: true },
            pencereler: [{ oge: 'iftar', baslik: 'İftar', ad: 'İftar', bas: 1, bitis: 2, oncelik: 2 }],
        };
        konumKur();
        await servis.gonder();
        expect('canli' in gonderilenYuk(0)).toBe(false);

        servis.__testIcinSifirla();
        const konumOku = (AsyncStorage.getItem as jest.Mock).getMockImplementation()!;
        (AsyncStorage.getItem as jest.Mock).mockImplementation(async (k: string) =>
            k === DEPOLAMA_ANAHTARLARI.CANLI_SAAT_VERISI ? JSON.stringify(pay) : konumOku(k)
        );
        await servis.gonder();
        expect(gonderilenYuk(1).canli).toEqual(pay);

        servis.__testIcinSifirla();
        (AsyncStorage.getItem as jest.Mock).mockImplementation(async (k: string) =>
            k === DEPOLAMA_ANAHTARLARI.CANLI_SAAT_VERISI ? '{"vakitler":1}' : konumOku(k)
        );
        await servis.gonder();
        expect('canli' in gonderilenYuk(2)).toBe(false);
    });

    it('canlı sayaç payı değişince (planlayıcı gözlemcisi) saat tazelenir', async () => {
        konumKur();
        servis.baslat();
        canliSaatPayiDegisti();
        await servis.gonder();
        expect(modul.durumGonder).toHaveBeenCalled();
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
