jest.mock('../../../data/local/LocalNamazServisi', () => ({
    kayitDegistiDinleyicisiEkle: jest.fn(() => jest.fn()),
    localTarihAraligindakiNamazlariGetir: jest.fn(),
}));
const mockSaattenKildimIsle = jest.fn();
jest.mock('../BildirimServisi', () => ({
    BildirimServisi: { getInstance: () => ({ saattenKildimIsle: mockSaattenKildimIsle }) },
}));

import { CamideyimServisi } from '../CamideyimServisi';
import * as kopru from '../../../../modules/expo-cami-geofence/src';
import {
    kayitDegistiDinleyicisiEkle,
    localTarihAraligindakiNamazlariGetir,
} from '../../../data/local/LocalNamazServisi';
import { NamazAdi } from '../../../core/constants/UygulamaSabitleri';

const k = kopru as jest.Mocked<typeof kopru>;
const servis = CamideyimServisi.getInstance();
const ISTANBUL = { lat: 41.01, lng: 28.97 };

beforeEach(() => {
    jest.clearAllMocks();
    servis.__testSifirla();
    k.camiModuluVarMi.mockReturnValue(true);
    k.ayarlariAl.mockResolvedValue({ aktif: true });
    k.namazModuDurumu.mockResolvedValue({
        destek: 'kural',
        erisim: true,
        kuralVar: true,
        aktif: false,
        ayarlar: { etkin: true, cuma: true, vakit: false, vakitSureDk: 20, kildimKapat: true },
    });
    k.kildimBekleyenleriAl.mockResolvedValue([]);
    k.namazModuAktifTurlari.mockResolvedValue([]);
    mockSaattenKildimIsle.mockResolvedValue(undefined);
});

describe('CamideyimServisi.konumaBagliTazele', () => {
    it('köprü yoksa hiçbir şey göndermez', async () => {
        k.camiModuluVarMi.mockReturnValue(false);
        await servis.konumaBagliTazele(ISTANBUL);
        expect(k.pencereleriYaz).not.toHaveBeenCalled();
    });

    it('(0,0) "yapılandırılmadı" nöbetçisi: gönderim yok (Gine Körfezi vakitleri değil)', async () => {
        await servis.konumaBagliTazele({ lat: 0, lng: 0 });
        expect(k.pencereleriYaz).not.toHaveBeenCalled();
        expect(k.izlemeyiTazele).not.toHaveBeenCalled();
    });

    it('kapı pencereleri + mod planı + izleme merkezi gönderilir', async () => {
        await servis.konumaBagliTazele(ISTANBUL);
        const pencereler = k.pencereleriYaz.mock.calls[0][0] as { vakit: string }[];
        expect(pencereler.length).toBe(45);
        const plan = k.namazModuPlaniniYaz.mock.calls[0][0] as { tur: string }[];
        expect(plan.length).toBeGreaterThan(0);
        expect(plan.every((p) => p.tur.startsWith('cuma:'))).toBe(true);
        expect(k.izlemeyiTazele).toHaveBeenCalledWith(41.01, 28.97);
    });

    it('Camideyim kapalıyken izleme kurulmaz ama mod planı yine gider', async () => {
        k.ayarlariAl.mockResolvedValue({ aktif: false });
        await servis.konumaBagliTazele(ISTANBUL);
        expect(k.namazModuPlaniniYaz).toHaveBeenCalled();
        expect(k.izlemeyiTazele).not.toHaveBeenCalled();
    });

    it('köprü hatası fırlatmaz', async () => {
        k.pencereleriYaz.mockRejectedValueOnce(new Error('x'));
        await expect(servis.konumaBagliTazele(ISTANBUL)).resolves.toBeUndefined();
    });
});

describe('CamideyimServisi.bekleyenKildimleriIsle', () => {
    it('bildirimdeki "Kıldım" ile aynı gövde; başarılı öğe kuyruktan düşer', async () => {
        k.kildimBekleyenleriAl.mockResolvedValue([{ id: '2026-10-16_ogle', tarih: '2026-10-16', vakit: 'ogle' }]);
        await servis.bekleyenKildimleriIsle();
        expect(mockSaattenKildimIsle).toHaveBeenCalledWith('ogle', '2026-10-16');
        expect(k.kildimTamamlandi).toHaveBeenCalledWith('2026-10-16_ogle');
    });

    it('işlenemeyen öğe kuyrukta kalır (deneme sayacı)', async () => {
        k.kildimBekleyenleriAl.mockResolvedValue([{ id: 'a', tarih: '2026-10-16', vakit: 'ogle' }]);
        mockSaattenKildimIsle.mockRejectedValueOnce(new Error('disk'));
        await servis.bekleyenKildimleriIsle();
        expect(k.kildimBasarisiz).toHaveBeenCalledWith('a');
        expect(k.kildimTamamlandi).not.toHaveBeenCalled();
    });

    it('eşzamanlı çağrılar tek turu paylaşır', async () => {
        k.kildimBekleyenleriAl.mockResolvedValue([{ id: 'a', tarih: '2026-10-16', vakit: 'ogle' }]);
        await Promise.all([servis.bekleyenKildimleriIsle(), servis.bekleyenKildimleriIsle()]);
        expect(mockSaattenKildimIsle).toHaveBeenCalledTimes(1);
    });
});

describe('Namaz modu: "Kıldım" deyince kapanır', () => {
    it('baslat bir kez dinleyici kaydeder', () => {
        servis.baslat();
        servis.baslat();
        expect(kayitDegistiDinleyicisiEkle).toHaveBeenCalledTimes(1);
    });

    it('etkin turun namazı kılındıysa mod kapanır', async () => {
        k.namazModuAktifTurlari.mockResolvedValue(['cuma:2026-10-16']);
        (localTarihAraligindakiNamazlariGetir as jest.Mock).mockResolvedValue({
            basarili: true,
            veri: [{ tarih: '2026-10-16', namazlar: [{ namazAdi: NamazAdi.Ogle, tamamlandi: true }] }],
        });
        await servis.kildimSonrasiModuKapat();
        expect(k.namazModuKildim).toHaveBeenCalled();
    });

    it('başka bir namaz işaretlendiyse mod açık kalır', async () => {
        k.namazModuAktifTurlari.mockResolvedValue(['vakit:2026-10-16_ikindi']);
        (localTarihAraligindakiNamazlariGetir as jest.Mock).mockResolvedValue({
            basarili: true,
            veri: [{ tarih: '2026-10-16', namazlar: [{ namazAdi: NamazAdi.Ogle, tamamlandi: true }] }],
        });
        await servis.kildimSonrasiModuKapat();
        expect(k.namazModuKildim).not.toHaveBeenCalled();
    });
});
