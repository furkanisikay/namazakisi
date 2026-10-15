import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocalNafileServisi, nafileAyarlariniNormalize, nafileHatirlatmaAcikMi } from '../LocalNafileServisi';
import { VARSAYILAN_NAFILE_AYARLARI, type NafileHatirlatmaAyari } from '../../../core/nafile/nafileTipleri';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
}));
jest.mock('../../../core/utils/Logger', () => ({
    Logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

const getItem = AsyncStorage.getItem as jest.Mock;

describe('LocalNafileServisi', () => {
    beforeEach(() => jest.clearAllMocks());

    it('kayıt yoksa varsayılan: HEPSİ KAPALI', async () => {
        getItem.mockResolvedValue(null);
        const a = await LocalNafileServisi.getAyarlar();
        expect(a).toEqual(VARSAYILAN_NAFILE_AYARLARI);
        expect(nafileHatirlatmaAcikMi(a)).toBe(false);
    });

    it.each(['null', '42', '"metin"', '[1,2]', '{bozuk'])('bozuk kayıt (%s) ASLA reddetmez → varsayılan', async (ham) => {
        getItem.mockResolvedValue(ham);
        await expect(LocalNafileServisi.getAyarlar()).resolves.toEqual(VARSAYILAN_NAFILE_AYARLARI);
    });

    it('depolama hatası da reddetmez', async () => {
        getItem.mockRejectedValue(new Error('disk'));
        await expect(LocalNafileServisi.getAyarlar()).resolves.toEqual(VARSAYILAN_NAFILE_AYARLARI);
    });

    it('eksik alan varsayılandan tamamlanır, sınır dışı sayılar kenetlenir, enum dışı hedef düzelir', () => {
        const a = nafileAyarlariniNormalize({
            gostergeAktif: true,
            hatirlatmalar: { kusluk: { aktif: true, ofsetDk: 999 } },
            teheccud: { aktif: true, hedef: 'gecersiz', imsaktanOnceDk: 1, uyandirma: 'evet' },
        });
        expect(a.gostergeAktif).toBe(true);
        // Eski kayıt (#273 öncesi) tek adıma GÖÇER; ofset kenetlenir.
        expect(a.hatirlatmalar.kusluk.aktif).toBe(true);
        expect(a.hatirlatmalar.kusluk.yon).toBe('girisindenItibaren');
        expect(a.hatirlatmalar.kusluk.adimlar.map((x) => x.esikDk)).toEqual([120]);
        expect(a.hatirlatmalar.evvabin).toEqual(VARSAYILAN_NAFILE_AYARLARI.hatirlatmalar.evvabin);
        expect(a.teheccud.pencere).toBe('sonUcteBir');
        expect(a.teheccud.uyandirma).toBe(false);
        expect(nafileHatirlatmaAcikMi(a)).toBe(true);
    });

    it('varsayılan nesnesi paylaşılmaz (mutasyon sızmaz)', () => {
        const a = nafileAyarlariniNormalize(null);
        a.hatirlatmalar.kusluk.aktif = true;
        expect(VARSAYILAN_NAFILE_AYARLARI.hatirlatmalar.kusluk.aktif).toBe(false);
    });

    it('kaydederken normalize eder', async () => {
        (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
        const ok = await LocalNafileServisi.saveAyarlar({
            ...VARSAYILAN_NAFILE_AYARLARI,
            hatirlatmalar: {
                ...VARSAYILAN_NAFILE_AYARLARI.hatirlatmalar,
                evvabin: { aktif: true, ofsetDk: 0 } as unknown as NafileHatirlatmaAyari,
            },
        });
        expect(ok).toBe(true);
        const [anahtar, deger] = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
        expect(anahtar).toBe(DEPOLAMA_ANAHTARLARI.NAFILE_AYARLARI);
        const kaydedilen = JSON.parse(deger).hatirlatmalar.evvabin;
        expect(kaydedilen.adimlar.map((x: { esikDk: number }) => x.esikDk)).toEqual([5]);
        expect(kaydedilen).not.toHaveProperty('ofsetDk');
    });

    it('sesliOnayi rıza kaydı yalnız AÇIKÇA true ise taşınır (uydurulamaz)', () => {
        expect(nafileAyarlariniNormalize({ sesliOnayi: true }).sesliOnayi).toBe(true);
        expect(nafileAyarlariniNormalize({ sesliOnayi: 'evet' })).not.toHaveProperty('sesliOnayi');
        expect(nafileAyarlariniNormalize(null)).not.toHaveProperty('sesliOnayi');
    });

    describe('Kıldım hafızası (issue #273)', () => {
        const setItem = AsyncStorage.setItem as jest.Mock;
        it('işaretler, eski günleri budar, bozuk kaydı boş sayar', async () => {
            getItem.mockResolvedValue(JSON.stringify({ '2020-01-01': ['kusluk'], bozuk: ['x'], '2026-10-12': ['teheccud'] }));
            setItem.mockResolvedValue(undefined);
            await LocalNafileServisi.kilindiIsaretle('2026-10-13', 'kusluk', '2026-10-13');
            const [anahtar, deger] = setItem.mock.calls[0];
            expect(anahtar).toBe(DEPOLAMA_ANAHTARLARI.NAFILE_KILINAN);
            expect(JSON.parse(deger)).toEqual({ '2026-10-12': ['teheccud'], '2026-10-13': ['kusluk'] });
        });
        it('okuma asla reddetmez', async () => {
            getItem.mockResolvedValue('{bozuk');
            await expect(LocalNafileServisi.getKilinanlar()).resolves.toEqual({});
            getItem.mockRejectedValue(new Error('disk'));
            await expect(LocalNafileServisi.getKilinanlar()).resolves.toEqual({});
        });
    });
});
