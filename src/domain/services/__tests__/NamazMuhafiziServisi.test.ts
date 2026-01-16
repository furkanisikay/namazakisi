import { NamazMuhafiziServisi, MuhafizYapilandirmasi } from '../NamazMuhafiziServisi';
import { NamazVaktiHesaplayiciServisi } from '../NamazVaktiHesaplayiciServisi';

// Mock NamazVaktiHesaplayiciServisi
jest.mock('../NamazVaktiHesaplayiciServisi', () => {
    return {
        NamazVaktiHesaplayiciServisi: {
            getInstance: jest.fn()
        }
    };
});

describe('NamazMuhafiziServisi Unit Testleri', () => {
    let muhafiz: NamazMuhafiziServisi;
    let mockHesaplayici: any;
    let bildirimSpx: jest.Mock;

    beforeEach(() => {
        bildirimSpx = jest.fn();
        mockHesaplayici = {
            getSuankiVakitBilgisi: jest.fn()
        };
        (NamazVaktiHesaplayiciServisi.getInstance as jest.Mock).mockReturnValue(mockHesaplayici);
        
        // Singleton'ı zorla sıfırla ki mock hesaplayıcıyı alabilsin
        (NamazMuhafiziServisi as any).instance = undefined;
        muhafiz = NamazMuhafiziServisi.getInstance();
        muhafiz.sifirla(); 
        
        // Varsayılan yapılandırma
        muhafiz.yapilandir({
            seviye1BaslangicDk: 45,
            seviye1SiklikDk: 15,
            seviye2BaslangicDk: 30,
            seviye2SiklikDk: 10,
            seviye3BaslangicDk: 15,
            seviye3SiklikDk: 5,
            seviye4BaslangicDk: 5,
            seviye4SiklikDk: 1,
        });

        jest.useFakeTimers();
    });

    afterEach(() => {
        muhafiz.durdur();
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    test('Singleton örneği her zaman aynı olmalı', () => {
        const instance1 = NamazMuhafiziServisi.getInstance();
        const instance2 = NamazMuhafiziServisi.getInstance();
        expect(instance1).toBe(instance2);
    });

    test('Seviye 1 bildirimi (45 dk kala)', () => {
        mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
            vakit: 'ogle',
            kalanSureMs: 45 * 60 * 1000, // Tam 45 dk
        });

        muhafiz.baslat(bildirimSpx);

        expect(bildirimSpx).toHaveBeenCalledWith(
            expect.stringContaining('Namaz vaktinin bitmesine 45 dakika kaldı'),
            1
        );
    });

    test('Seviye 2 bildirimi (30 dk kala)', () => {
        mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
            vakit: 'ogle',
            kalanSureMs: 30 * 60 * 1000,
        });

        muhafiz.baslat(bildirimSpx);

        expect(bildirimSpx).toHaveBeenCalledWith(
            expect.stringContaining('Vakit daralıyor'),
            2
        );
    });

    test('Seviye 3 bildirimi (15 dk kala - Şeytanla Mücadele)', () => {
        mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
            vakit: 'ogle',
            kalanSureMs: 15 * 60 * 1000,
        });

        muhafiz.baslat(bildirimSpx);

        // Seviye 3'te mesajlar SEYTANLA_MUCADELE_ICERIGI'nden gelir
        expect(bildirimSpx).toHaveBeenCalledWith(
            expect.any(String),
            3
        );
    });

    test('Seviye 4 bildirimi (5 dk kala - Acil Durum)', () => {
        mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
            vakit: 'ogle',
            kalanSureMs: 5 * 60 * 1000,
        });

        muhafiz.baslat(bildirimSpx);

        expect(bildirimSpx).toHaveBeenCalledWith(
            expect.stringContaining('VAKİT ÇIKIYOR'),
            4
        );
    });

    test('Sıklık kontrolü - Seviye 1 (15 dk sıklık)', () => {
        // 40 dk kala bildirim GELMEMELİ (40 % 15 != 0)
        mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
            vakit: 'ogle',
            kalanSureMs: 40 * 60 * 1000,
        });

        muhafiz.baslat(bildirimSpx);
        expect(bildirimSpx).not.toHaveBeenCalled();

        // 30 dk kala bildirim GELMELİ (Level 2'ye girdiği için ve 30 % 10 === 0 olduğu için)
        mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
            vakit: 'ogle',
            kalanSureMs: 30 * 60 * 1000,
        });

        jest.advanceTimersByTime(60 * 1000); // 1 dk ilerlet
        expect(bildirimSpx).toHaveBeenCalledWith(expect.any(String), 2);
    });

    test('Namaz kılındı işareti bildirimleri durdurmalı', () => {
        mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
            vakit: 'ogle',
            kalanSureMs: 5 * 60 * 1000,
        });

        // Önce işaretle
        muhafiz.namazKilindiIsaretle('ogle');
        
        muhafiz.baslat(bildirimSpx);
        
        expect(bildirimSpx).not.toHaveBeenCalled();
    });

    test('Yapılandırma değişikliği etkili olmalı', () => {
        // Seviye 1 başlangıcını 60 dk'ya çekelim
        muhafiz.yapilandir({ seviye1BaslangicDk: 60 });

        mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
            vakit: 'ogle',
            kalanSureMs: 55 * 60 * 1000,
        });

        muhafiz.baslat(bildirimSpx);
        
        // Artık 55 dk kala bildirim gelmeli (Sıklık 15 dk olduğu için 60, 45, 30... 
        // Ama modulo kontrolü kalanDk üzerinden yapılıyor: 55 % 15 !== 0)
        // O yüzden sıklığı da 1 yapalım ki hemen görelim
        muhafiz.yapilandir({ seviye1SiklikDk: 1 });
        
        jest.advanceTimersByTime(60 * 1000);
        expect(bildirimSpx).toHaveBeenCalled();
    });
});

