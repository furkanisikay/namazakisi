import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocalNafileServisi, nafileAyarlariniNormalize, nafileHatirlatmaAcikMi } from '../LocalNafileServisi';
import { VARSAYILAN_NAFILE_AYARLARI } from '../../../core/nafile/nafileTipleri';
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
        expect(a.hatirlatmalar.kusluk).toEqual({ aktif: true, ofsetDk: 120 });
        expect(a.hatirlatmalar.evvabin).toEqual(VARSAYILAN_NAFILE_AYARLARI.hatirlatmalar.evvabin);
        expect(a.teheccud).toEqual({ aktif: true, hedef: 'sonUcteBir', imsaktanOnceDk: 15, uyandirma: false });
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
            hatirlatmalar: { ...VARSAYILAN_NAFILE_AYARLARI.hatirlatmalar, evvabin: { aktif: true, ofsetDk: 0 } },
        });
        expect(ok).toBe(true);
        const [anahtar, deger] = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
        expect(anahtar).toBe(DEPOLAMA_ANAHTARLARI.NAFILE_AYARLARI);
        expect(JSON.parse(deger).hatirlatmalar.evvabin).toEqual({ aktif: true, ofsetDk: 5 });
    });
});
