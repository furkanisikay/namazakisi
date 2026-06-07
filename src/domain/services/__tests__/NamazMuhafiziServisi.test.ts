import { NamazMuhafiziServisi, MuhafizYapilandirmasi } from '../NamazMuhafiziServisi';
import { NamazVaktiHesaplayiciServisi } from '../NamazVaktiHesaplayiciServisi';
import { SEYTANLA_MUCADELE_ICERIGI } from '../../../core/data/SeytanlaMucadeleIcerigi';

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

        // Seviye 3 mesajı gerçekten siddetSeviyesi===3 havuzundan seçilmeli;
        // fallback ('Şeytana uyma...') veya başka seviye içeriği gelirse test düşmeli.
        const seviye3Metinler = SEYTANLA_MUCADELE_ICERIGI
            .filter((i) => i.siddetSeviyesi === 3)
            .map((i) => i.metin);
        // Havuzun gerçekten dolu olduğundan emin ol (yoksa "toContain" boş kümede totoloji olur)
        expect(seviye3Metinler.length).toBeGreaterThan(0);

        muhafiz.baslat(bildirimSpx);

        const [mesaj, seviye] = bildirimSpx.mock.calls[0];
        expect(seviye).toBe(3);
        // Mesaj seviye-3 havuzundan gelmeli; fallback metni havuzda olmadığı için
        // (üretimde getRandomIcerik filtresi bozulursa) bu assertion kırılır.
        expect(seviye3Metinler).toContain(mesaj);
    });

    test('Seviye 3 mesajı deterministik olarak içerik havuzunun ilk elemanını seçer', () => {
        mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
            vakit: 'ogle',
            kalanSureMs: 15 * 60 * 1000,
        });

        // Math.random=0 -> Math.floor(0 * uzunluk) = 0 -> havuzun ilk elemanı
        const randomSpx = jest.spyOn(Math, 'random').mockReturnValue(0);
        try {
            const ilkSeviye3Metin = SEYTANLA_MUCADELE_ICERIGI.find(
                (i) => i.siddetSeviyesi === 3
            )!.metin;

            muhafiz.baslat(bildirimSpx);

            expect(bildirimSpx).toHaveBeenCalledWith(ilkSeviye3Metin, 3);
        } finally {
            randomSpx.mockRestore();
        }
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

    test('Namaz kılındı işareti banner\'ı temizlemeli', () => {
        mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
            vakit: 'ogle',
            kalanSureMs: 5 * 60 * 1000,
        });

        // Önce işaretle
        muhafiz.namazKilindiIsaretle('ogle');

        muhafiz.baslat(bildirimSpx);

        // Banner temizleme için seviye 0 ile çağrılmalı
        expect(bildirimSpx).toHaveBeenCalledWith('', 0);
    });

    test('Temizleme bildirimi sadece bir kez gönderilmeli (gereksiz tekrar çağrıları önlenmeli)', () => {
        mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
            vakit: 'ogle',
            kalanSureMs: 5 * 60 * 1000,
        });

        // Önce işaretle
        muhafiz.namazKilindiIsaretle('ogle');

        muhafiz.baslat(bildirimSpx);

        // Banner temizleme için seviye 0 ile bir kez çağrılmalı
        expect(bildirimSpx).toHaveBeenCalledTimes(1);
        expect(bildirimSpx).toHaveBeenCalledWith('', 0);

        // Zaman ilerlet ve tekrar kontrol et
        bildirimSpx.mockClear();
        jest.advanceTimersByTime(60 * 1000);

        // İkinci kez çağrılmamalı (gereksiz UI güncellemesini önlemek için)
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

