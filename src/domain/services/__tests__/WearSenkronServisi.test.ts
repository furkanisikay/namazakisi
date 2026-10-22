/**
 * WearSenkronServisi (issue #269) — telefon tarafı senkron; saat "Kıldım" kuyruğu ortaktır (KildimKuyruguServisi).
 * Native modül `NativeModules.WearSenkron` mock'lanır; platform AÇIKÇA seçilir
 * (jest varsayılanı iOS — AGENTS.md).
 */
import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI, NamazAdi } from '../../../core/constants/UygulamaSabitleri';
import { bugunuAl, dunuAl, gunEkle } from '../../../core/utils/TarihYardimcisi';

jest.mock('@react-native-async-storage/async-storage', () => ({ getItem: jest.fn(), setItem: jest.fn() }));
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
        // Kıble (saat W2): 1 ondalığa yuvarlanmış YAKLAŞIK konum (≈ 11 km).
        expect(yuk.konum).toEqual({ lat: 41, lng: 29 });
    });

    it('saat W3: anons yeri yüke gider (varsayılan otomatik); uyandırma YALNIZ saat seçiliyken', async () => {
        konumKur();
        await servis.gonder();
        expect(gonderilenYuk().anonsYeri).toBe('otomatik');
        expect('uyandirma' in gonderilenYuk()).toBe(false);

        servis.__testIcinSifirla();
        const taban = (AsyncStorage.getItem as jest.Mock).getMockImplementation()!;
        (AsyncStorage.getItem as jest.Mock).mockImplementation(async (k: string) =>
            k === DEPOLAMA_ANAHTARLARI.SAAT_AYARLARI
                ? JSON.stringify({ uyandirmaYeri: 'saat', anonsYeri: 'saat' })
                : taban(k)
        );
        await servis.gonder();
        expect(gonderilenYuk(1).anonsYeri).toBe('saat');
        // Muhafız/teheccüd kapalı → liste boş ama alan var (saat seçildi).
        expect(gonderilenYuk(1).uyandirma).toEqual([]);
    });

    it('saat W3: Camideyim durumu her gönderimde native tarafa tazelettirilir (yük aynı olsa da)', async () => {
        const tazele = jest.fn(() => Promise.resolve());
        (NativeModules as Record<string, unknown>).WearSenkron = { ...modul, camiDurumunuTazele: tazele };
        konumKur();
        await servis.gonder();
        await servis.gonder();
        expect(tazele).toHaveBeenCalledTimes(2);
        expect(modul.durumGonder).toHaveBeenCalledTimes(1);
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

    describe('Apple Watch (issue #285) — iOS\'ta AYNI yük WatchConnectivity köprüsüne gider', () => {
        const siriKoprusu = require('../../../../modules/expo-siri-kisayollari/src');
        const saat = { durumGonder: jest.fn((_json: string) => Promise.resolve()) };
        const saatYuku = (i = 0) => JSON.parse(saat.durumGonder.mock.calls[i][0]);

        beforeEach(() => {
            jest.replaceProperty(Platform, 'OS', 'ios');
            saat.durumGonder.mockReset();
            saat.durumGonder.mockResolvedValue(undefined);
            siriKoprusu.saatKoprusu.mockReturnValue(saat);
        });
        afterAll(() => {
            siriKoprusu.saatKoprusu.mockReturnValue(null);
        });

        it('Wear şemasıyla gönderir (31 gün + kılınmışlık + yaklaşık konum); Android modülüne dokunmaz', async () => {
            konumKur();
            await servis.gonder();
            expect(modul.durumGonder).not.toHaveBeenCalled();
            expect(saat.durumGonder).toHaveBeenCalledTimes(1);
            const yuk = saatYuku();
            expect(yuk.surum).toBe(2);
            expect(yuk.konumAdi).toBe('Fatih, İstanbul');
            expect(yuk.gunler).toHaveLength(31);
            expect(yuk.gunler[1].kilinan).toEqual(['imsak']);
            // Kıble Apple Watch'ta da var (#285 cilası): ~11 km'ye yuvarlanmış konum.
            expect(yuk.konum).toEqual({ lat: 41, lng: 29 });
            // Apple Watch konuşmaz → anons yeri gitmez.
            expect(yuk).not.toHaveProperty('anonsYeri');
        });

        it('muhafız AÇIKKEN hazır plan GİDER (saat telefonla aynı kimlikle kurar); Now Bar payı ve anons metni GİTMEZ', async () => {
            konumKur(undefined, { aktif: true, ...ESKI_AYAR });
            await servis.gonder();
            const yuk = saatYuku();
            expect(yuk.muhafiz.length).toBeGreaterThan(0);
            for (const k of yuk.muhafiz) {
                expect(k.id).toMatch(/^muhafiz_\d{4}-\d{2}-\d{2}_vakit_/);
                expect(k).not.toHaveProperty('anons');
            }
            expect(yuk).not.toHaveProperty('canli');
            // Plan kılınmışlığı muhafız diskiyle birleştirilir (telefonla aynı kural).
            expect(mockMuhafizKilinan).toHaveBeenCalled();
            // Dar bağlam sınırı (WatchConnectivity): Wear'ın 90 KB'ı değil.
            expect(saat.durumGonder.mock.calls[0][0].length).toBeLessThanOrEqual(60_000);
        });

        it('uyandırma listesi YALNIZ saat uygulaması bu build\'deyken ve "saatte" seçiliyken', async () => {
            konumKur();
            const taban = (AsyncStorage.getItem as jest.Mock).getMockImplementation()!;
            (AsyncStorage.getItem as jest.Mock).mockImplementation(async (k: string) =>
                k === DEPOLAMA_ANAHTARLARI.SAAT_AYARLARI ? JSON.stringify({ uyandirmaYeri: 'saat', anonsYeri: 'saat' }) : taban(k)
            );
            siriKoprusu.saatUygulamasiDestekli.mockReturnValue(false);
            await servis.gonder();
            // Saat uygulaması yok sayılır → "telefon" (yedek gecikmesi de uygulanmaz).
            expect(saatYuku()).not.toHaveProperty('uyandirma');

            servis.__testIcinSifirla();
            siriKoprusu.saatUygulamasiDestekli.mockReturnValue(true);
            await servis.gonder();
            expect(saatYuku(1).uyandirma).toEqual([]);
            siriKoprusu.saatUygulamasiDestekli.mockReturnValue(false);
        });

        it('içerik aynıysa ikinci kez göndermez; köprü hata verirse sonraki gönderim yeniden dener', async () => {
            konumKur();
            saat.durumGonder.mockRejectedValueOnce(new Error('hata'));
            await servis.gonder();
            await servis.gonder();
            await servis.gonder();
            expect(saat.durumGonder).toHaveBeenCalledTimes(2);
        });

        it('baslat: kılınmışlık değişince saat tazelenir; plan gözlemcisi Apple Watch\'ı da tazeler', async () => {
            konumKur();
            servis.baslat();
            expect(mockDinleyiciAyarla).toHaveBeenCalledTimes(1);
            muhafizPlaniDegistiBildir({ aktif: true, matris: muhafizMatrisiniCoz(ESKI_AYAR) });
            await servis.gonder();
            expect(saat.durumGonder).toHaveBeenCalledTimes(1);
            expect(saatYuku().muhafiz.length).toBeGreaterThan(0);
            const dinleyici = mockDinleyiciAyarla.mock.calls[0][0] as () => void;
            mockAralik.mockResolvedValue({
                basarili: true,
                veri: [{ tarih: bugunuAl(), namazlar: [{ namazAdi: NamazAdi.Ogle, tamamlandi: true }] }],
            });
            dinleyici();
            await servis.gonder();
            expect(saat.durumGonder).toHaveBeenCalledTimes(2);
            expect(saatYuku(1).gunler[1].kilinan).toEqual(['ogle']);
        });

        it('saat uygulaması bu build\'de yoksa (köprü null) no-op', async () => {
            siriKoprusu.saatKoprusu.mockReturnValue(null);
            konumKur();
            await servis.gonder();
            servis.baslat();
            expect(saat.durumGonder).not.toHaveBeenCalled();
            expect(mockDinleyiciAyarla).not.toHaveBeenCalled();
        });
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

    it('ERTELE YOK (sahip kararı 2026-10-19): bekleyen eski _ertele kopyası saatin planını SÜZMEZ', async () => {
        const Notifications = require('expo-notifications');
        konumKur(undefined, { aktif: true, ...ESKI_AYAR });
        servis.baslat();
        Notifications.getAllScheduledNotificationsAsync.mockResolvedValue([
            {
                identifier: `muhafiz_${bugunuAl()}_vakit_yatsi_ertele`,
                content: { data: { ertelemeHedefMs: Date.now() + 3 * 24 * 60 * 60 * 1000 } },
            },
        ]);
        await servis.gonder();
        const yatsi = (gonderilenYuk().muhafiz as { tarih: string; vakit: string }[]).filter(
            (k) => k.tarih === bugunuAl() && k.vakit === 'yatsi'
        );
        expect(yatsi.length).toBeGreaterThan(0);
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

describe('D-08: saat yoksa kurma, birleştir, aciliyet', () => {
    const saatModulu = (durum: unknown, ek: Record<string, unknown> = {}) => {
        const m = {
            durumGonder: jest.fn(() => Promise.resolve()),
            durumGonderSecenekli: jest.fn((_j: string, _a: boolean) => Promise.resolve()),
            esliSaatDurumu: jest.fn(() => Promise.resolve(durum)),
            ...ek,
        };
        (NativeModules as Record<string, unknown>).WearSenkron = m;
        return m;
    };
    const diskKur = (ek: Record<string, string> = {}) => {
        const taban = (AsyncStorage.getItem as jest.Mock).getMockImplementation()!;
        (AsyncStorage.getItem as jest.Mock).mockImplementation(async (k: string) => (k in ek ? ek[k] : taban(k)));
    };

    it('ÖLÇÜM: saati hiç görülmemiş telefonda 3 gönderim → 0 yük kurulumu, 0 Data Layer yazımı (önce: 3 kurulum + 1 yazım)', async () => {
        const m = saatModulu('esliDegil');
        konumKur();
        await servis.gonder();
        await servis.gonder({ acil: false });
        await servis.gonder();
        expect(mockAralik).not.toHaveBeenCalled();
        expect(m.durumGonderSecenekli).not.toHaveBeenCalled();
        expect(m.durumGonder).not.toHaveBeenCalled();
        // Bağlı saat sorgusu süreç içinde önbelleklenir.
        expect(m.esliSaatDurumu).toHaveBeenCalledTimes(1);
    });

    it('saat bir kez GÖRÜLDÜYSE menzil dışıyken de kurar (DataItem bağlanınca senkronlanır)', async () => {
        const m = saatModulu('esliDegil');
        konumKur();
        diskKur({ [DEPOLAMA_ANAHTARLARI.WEAR_SAAT_GORULDU]: '1' });
        await servis.gonder();
        expect(m.durumGonderSecenekli).toHaveBeenCalledTimes(1);
    });

    it('bağlı saat görülünce bayrak yazılır ve gönderilir', async () => {
        const m = saatModulu('esli');
        konumKur();
        await servis.gonder();
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(DEPOLAMA_ANAHTARLARI.WEAR_SAAT_GORULDU, '1');
        expect(m.durumGonderSecenekli).toHaveBeenCalledWith(expect.any(String), true);
    });

    it('Wear API yoksa ("yok") kurmaz; durum bilinmiyorsa (null) ihtiyatla kurar', async () => {
        const yok = saatModulu('yok');
        konumKur();
        await servis.gonder();
        expect(yok.durumGonderSecenekli).not.toHaveBeenCalled();

        servis.__testIcinSifirla();
        const bilinmiyor = saatModulu(null);
        await servis.gonder();
        expect(bilinmiyor.durumGonderSecenekli).toHaveBeenCalledTimes(1);
    });

    it('periyodik tur acil:false geçer; eski ikili (yöntem yok) durumGonder ile gönderir', async () => {
        const m = saatModulu('esli');
        konumKur();
        await servis.gonder({ acil: false });
        expect(m.durumGonderSecenekli).toHaveBeenCalledWith(expect.any(String), false);

        servis.__testIcinSifirla();
        const eski = saatModulu('esli', { durumGonderSecenekli: undefined });
        await servis.gonder({ acil: false });
        expect(eski.durumGonder).toHaveBeenCalledTimes(1);
    });

    it('BİRLEŞTİRME: tur sürerken gelen 3 istek TEK ek tura bağlanır (toplam 2 kurulum)', async () => {
        saatModulu('esli');
        konumKur();
        await Promise.all([servis.gonder(), servis.gonder(), servis.gonder(), servis.gonder()]);
        expect(mockAralik).toHaveBeenCalledTimes(2);
    });

    it('birleşen isteklerden biri acil ise ek tur acildir', async () => {
        const m = saatModulu('esli');
        konumKur();
        mockAralik
            .mockResolvedValueOnce({ basarili: true, veri: [{ tarih: bugunuAl(), namazlar: [] }] })
            .mockResolvedValueOnce({ basarili: true, veri: [{ tarih: bugunuAl(), namazlar: [{ namazAdi: NamazAdi.Ogle, tamamlandi: true }] }] });
        await Promise.all([servis.gonder({ acil: false }), servis.gonder({ acil: false }), servis.gonder({ acil: true })]);
        expect(m.durumGonderSecenekli.mock.calls.map((c) => c[1])).toEqual([false, true]);
    });

    it('diskteki özet aynıysa YENİ süreçte de yeniden yazılmaz (24 sa içinde)', async () => {
        const m = saatModulu('esli');
        konumKur();
        await servis.gonder();
        const ozetYazimi = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
            (c) => c[0] === DEPOLAMA_ANAHTARLARI.WEAR_SON_YUK_OZETI
        )!;
        servis.__testIcinSifirla(); // yeni süreç
        diskKur({ [DEPOLAMA_ANAHTARLARI.WEAR_SON_YUK_OZETI]: ozetYazimi[1] as string });
        await servis.gonder();
        expect(m.durumGonderSecenekli).toHaveBeenCalledTimes(1);

        servis.__testIcinSifirla();
        const eski = JSON.parse(ozetYazimi[1] as string);
        diskKur({ [DEPOLAMA_ANAHTARLARI.WEAR_SON_YUK_OZETI]: JSON.stringify({ ...eski, ms: eski.ms - 25 * 3600_000 }) });
        await servis.gonder();
        expect(m.durumGonderSecenekli).toHaveBeenCalledTimes(2);
    });
});

describe('bekleyenleriIsle', () => {
    it('ortak "Kıldım" kuyruğuna DEVREDER (saat, widget, kutu tek kuyruk — #275/#276)', async () => {
        await servis.bekleyenleriIsle();
        expect(mockKuyrukIsle).toHaveBeenCalledTimes(1);
    });
});
