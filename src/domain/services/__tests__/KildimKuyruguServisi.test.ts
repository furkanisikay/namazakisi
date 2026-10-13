/**
 * Ortak "Kıldım" kuyruğu (issue #269 → #275/#276): saat, widget, hızlı ayarlar ve
 * kısayoldan gelen işaretlemeler bildirimdeki "Kıldım" ile AYNI gövdeden işlenir.
 * Native modül `NativeModules.KildimKuyrugu` mock'lanır; platform AÇIKÇA seçilir
 * (jest varsayılanı iOS — AGENTS.md).
 */
import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI, NamazAdi } from '../../../core/constants/UygulamaSabitleri';
import { bugunuAl } from '../../../core/utils/TarihYardimcisi';
import { widgetVerisiOlustur } from '../../../core/widget/widgetYuku';

jest.mock('@react-native-async-storage/async-storage', () => ({ getItem: jest.fn() }));
jest.mock('../../../core/utils/Logger', () => ({
    Logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));
const mockGunGetir = jest.fn();
jest.mock('../../../data/local/LocalNamazServisi', () => ({
    localNamazlariGetir: (...a: unknown[]) => mockGunGetir(...a),
}));
const mockKuyruktanKildim = jest.fn();
jest.mock('../BildirimServisi', () => ({
    BildirimServisi: { getInstance: () => ({ kuyruktanKildimIsle: (...a: unknown[]) => mockKuyruktanKildim(...a) }) },
}));
const mockKilinanlariYaz = jest.fn();
jest.mock('../WidgetServisi', () => ({
    WidgetServisi: { getInstance: () => ({ kilinanlariYaz: () => mockKilinanlariYaz() }) },
}));
const mockWearGonder = jest.fn();
jest.mock('../WearSenkronServisi', () => ({
    WearSenkronServisi: { getInstance: () => ({ gonder: () => mockWearGonder() }) },
}));

import { KildimKuyruguServisi } from '../KildimKuyruguServisi';

const modul = {
    bekleyenleriAl: jest.fn(() => Promise.resolve('[]')),
    tamamlandi: jest.fn(() => Promise.resolve()),
    basarisiz: jest.fn(() => Promise.resolve()),
};
const servis = KildimKuyruguServisi.getInstance();
const ISTANBUL = { lat: 41.0082, lng: 28.9784 };

const konumKur = (koordinatlar: { lat: number; lng: number } | null = ISTANBUL) =>
    (AsyncStorage.getItem as jest.Mock).mockImplementation(async (k: string) =>
        k === DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI && koordinatlar ? JSON.stringify({ koordinatlar }) : null
    );

beforeEach(() => {
    jest.clearAllMocks();
    servis.__testIcinSifirla();
    jest.replaceProperty(Platform, 'OS', 'android');
    (NativeModules as Record<string, unknown>).KildimKuyrugu = modul;
    modul.bekleyenleriAl.mockResolvedValue('[]');
    mockKuyruktanKildim.mockResolvedValue(undefined);
    mockKilinanlariYaz.mockResolvedValue(undefined);
    mockWearGonder.mockResolvedValue(undefined);
    mockGunGetir.mockResolvedValue({ basarili: true, veri: { tarih: bugunuAl(), namazlar: [] } });
});
afterEach(() => jest.restoreAllMocks());

describe('bekleyenleriIsle', () => {
    it('her kaynaktan öğeyi bildirim "Kıldım" gövdesinden işler, sonra widget ve saati tazeler', async () => {
        modul.bekleyenleriAl.mockResolvedValue(
            JSON.stringify([
                { id: 'a', tarih: bugunuAl(), vakit: 'ogle', kaynak: 'widget' },
                { id: 'b', tarih: bugunuAl(), vakit: 'ikindi', kaynak: 'qs' },
                { id: 'c', tarih: bugunuAl(), vakit: 'aksam' }, // eski saat öğesi: kaynaksız
            ])
        );
        await servis.bekleyenleriIsle();
        expect(mockKuyruktanKildim).toHaveBeenNthCalledWith(1, 'ogle', bugunuAl());
        expect(mockKuyruktanKildim).toHaveBeenNthCalledWith(2, 'ikindi', bugunuAl());
        expect(mockKuyruktanKildim).toHaveBeenNthCalledWith(3, 'aksam', bugunuAl());
        expect(modul.tamamlandi).toHaveBeenCalledTimes(3);
        // Headless bağlamda dinleyici kurulmamış olabilir → AÇIKÇA tazelenir.
        expect(mockKilinanlariYaz).toHaveBeenCalledTimes(1);
        expect(mockWearGonder).toHaveBeenCalledTimes(1);
    });

    it('başarısız öğe kuyrukta kalır (basarisiz), diğerleri işlenmeye devam eder', async () => {
        modul.bekleyenleriAl.mockResolvedValue(
            JSON.stringify([{ id: 'a', tarih: bugunuAl(), vakit: 'ogle' }, { id: 'b', tarih: bugunuAl(), vakit: 'aksam' }])
        );
        mockKuyruktanKildim.mockRejectedValueOnce(new Error('disk'));
        await servis.bekleyenleriIsle();
        expect(modul.basarisiz).toHaveBeenCalledWith('a');
        expect(modul.tamamlandi).not.toHaveBeenCalledWith('a');
        expect(modul.tamamlandi).toHaveBeenCalledWith('b');
    });

    it('eşzamanlı çağrılar TEK turu paylaşır (headless + ön plan olayı)', async () => {
        modul.bekleyenleriAl.mockResolvedValue(JSON.stringify([{ id: 'a', tarih: bugunuAl(), vakit: 'ogle' }]));
        await Promise.all([servis.bekleyenleriIsle(), servis.bekleyenleriIsle()]);
        expect(modul.bekleyenleriAl).toHaveBeenCalledTimes(1);
        expect(mockKuyruktanKildim).toHaveBeenCalledTimes(1);
    });

    it('boş kuyrukta hiçbir şey tazelenmez', async () => {
        await servis.bekleyenleriIsle();
        expect(mockKilinanlariYaz).not.toHaveBeenCalled();
    });

    it('bozuk kuyruk JSON çökertmez', async () => {
        modul.bekleyenleriAl.mockResolvedValue('{bozuk');
        await expect(servis.bekleyenleriIsle()).resolves.toBeUndefined();
        expect(mockKuyruktanKildim).not.toHaveBeenCalled();
    });

    it('iOS / modül yoksa no-op', async () => {
        jest.replaceProperty(Platform, 'OS', 'ios');
        await servis.bekleyenleriIsle();
        expect(modul.bekleyenleriAl).not.toHaveBeenCalled();
    });
});

describe('simdikiVaktiKildim (namazakisi://kildim)', () => {
    const vakitler = () => widgetVerisiOlustur(ISTANBUL, bugunuAl()).vakitler;
    const an = (vakit: string, tarih: string) => vakitler().find((v) => v.vakit === vakit && v.tarih === tarih)!.ms;

    it('içinde bulunulan vakti bildirim "Kıldım" gövdesinden işaretler', async () => {
        konumKur();
        const sonuc = await servis.simdikiVaktiKildim(an('ogle', bugunuAl()) + 60_000);
        expect(sonuc).toEqual({ tur: 'isaretlendi', vakitAdi: NamazAdi.Ogle });
        expect(mockKuyruktanKildim).toHaveBeenCalledWith('ogle', bugunuAl());
    });

    it("sabah vakti kayda 'imsak' olarak gider", async () => {
        konumKur();
        await servis.simdikiVaktiKildim(an('sabah', bugunuAl()) + 60_000);
        expect(mockKuyruktanKildim).toHaveBeenCalledWith('imsak', bugunuAl());
    });

    it('zaten kılınmışsa yeniden yazmaz (yalnız işaretler, geri almaz)', async () => {
        konumKur();
        mockGunGetir.mockResolvedValue({
            basarili: true,
            veri: { tarih: bugunuAl(), namazlar: [{ namazAdi: NamazAdi.Ikindi, tamamlandi: true }] },
        });
        const sonuc = await servis.simdikiVaktiKildim(an('ikindi', bugunuAl()) + 60_000);
        expect(sonuc).toEqual({ tur: 'zatenKilindi', vakitAdi: NamazAdi.Ikindi });
        expect(mockKuyruktanKildim).not.toHaveBeenCalled();
    });

    it('güneş→öğle arasında işaretlemez, sıradaki vakti söyler', async () => {
        konumKur();
        const sonuc = await servis.simdikiVaktiKildim(an('gunes', bugunuAl()) + 60_000);
        expect(sonuc).toEqual({ tur: 'vakitYok', siradakiAdi: NamazAdi.Ogle, girisMs: an('ogle', bugunuAl()) });
        expect(mockKuyruktanKildim).not.toHaveBeenCalled();
    });

    it('değerlendirme HİÇBİR ŞEY yazmaz; onaydan sonra aday işaretlenir', async () => {
        konumKur();
        const simdi = an('ogle', bugunuAl()) + 60_000;
        const d = await servis.simdikiVaktiDegerlendir(simdi);
        expect(d).toEqual({ tur: 'aday', vakitAdi: NamazAdi.Ogle, kayitVakti: 'ogle', tarih: bugunuAl() });
        expect(mockKuyruktanKildim).not.toHaveBeenCalled();
        if (d.tur !== 'aday') throw new Error('aday bekleniyordu');
        expect(await servis.adayiIsaretle(d, simdi)).toEqual({ tur: 'isaretlendi', vakitAdi: NamazAdi.Ogle });
        expect(mockKuyruktanKildim).toHaveBeenCalledWith('ogle', bugunuAl());
    });

    it('onay beklerken vakit değiştiyse işaretlemez', async () => {
        konumKur();
        const d = await servis.simdikiVaktiDegerlendir(an('ogle', bugunuAl()) + 60_000);
        if (d.tur !== 'aday') throw new Error('aday bekleniyordu');
        const sonuc = await servis.adayiIsaretle(d, an('ikindi', bugunuAl()) + 60_000);
        expect(sonuc).toEqual({ tur: 'vakitDegisti' });
        expect(mockKuyruktanKildim).not.toHaveBeenCalled();
    });

    it('konum yoksa / (0,0) ise hiçbir şey yazmaz', async () => {
        konumKur({ lat: 0, lng: 0 });
        expect(await servis.simdikiVaktiKildim()).toEqual({ tur: 'konumYok' });
        konumKur(null);
        expect(await servis.simdikiVaktiKildim()).toEqual({ tur: 'konumYok' });
        expect(mockKuyruktanKildim).not.toHaveBeenCalled();
    });
});
