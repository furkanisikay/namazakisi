import { NamazMuhafiziServisi, MuhafizYapilandirmasi } from '../NamazMuhafiziServisi';
import { NamazVaktiHesaplayiciServisi } from '../NamazVaktiHesaplayiciServisi';
import { SEYTANLA_MUCADELE_ICERIGI } from '../../../core/data/SeytanlaMucadeleIcerigi';
import { kilinanVakitleriAl } from '../../../data/local/LocalNamazServisi';
import { bugunuAl, dunuAl } from '../../../core/utils/TarihYardimcisi';

// Mock NamazVaktiHesaplayiciServisi
jest.mock('../NamazVaktiHesaplayiciServisi', () => {
    return {
        NamazVaktiHesaplayiciServisi: {
            getInstance: jest.fn()
        }
    };
});

// Diskteki kalici kilinmislik kaydini mock'la (acilista hydrate kaynagi)
jest.mock('../../../data/local/LocalNamazServisi', () => ({
    kilinanVakitleriAl: jest.fn().mockResolvedValue([]),
}));

const mockKilinanVakitleriAl = kilinanVakitleriAl as jest.Mock;

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
        // Varsayilan: diskte kilinmis vakit yok (mevcut testlerin davranisi degismesin)
        mockKilinanVakitleriAl.mockResolvedValue([]);
        
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

    // ── Seviye eşiği GEÇİŞ SINIRLARI (<= zinciri) ─────────────────────────────
    // Üretim kontrolEt() <= ile zincirleme if/else kullanıyor:
    //   kalanDk <= 5  -> L4,  <= 15 -> L3,  <= 30 -> L2,  <= 45 -> L1, aksi L0.
    // Modulo kapısının seviye seçimini maskelememesi için TÜM sıklıkları 1 yaparız;
    // böylece her seviye her dakika tetiklenir ve sadece <= sınırını test ederiz.
    // < vs <= karışması (örn. L4 için `< 5`) bu testlerle ANINDA yakalanır.
    describe.each([
        [46, 0], // 46 > 45 -> hiçbir seviye, bildirim YOK
        [45, 1], // tam üst sınır L1
        [44, 1], // L1 iç
        [31, 1], // L1 alt komşu (30'a girmeden)
        [30, 2], // tam üst sınır L2
        [16, 2], // L2 alt komşu (15'e girmeden)
        [15, 3], // tam üst sınır L3
        [6, 3],  // L3 alt komşu (5'e girmeden)
        [5, 4],  // tam üst sınır L4
        [4, 4],  // L4 iç
    ])('Seviye sınır geçişi: %i dk kala', (kalanDk, beklenenSeviye) => {
        test(`seviye ${beklenenSeviye} seçilmeli`, () => {
            // Tüm sıklıkları 1 yap -> modulo kapısı seviye seçimini etkilemesin
            muhafiz.yapilandir({
                seviye1SiklikDk: 1,
                seviye2SiklikDk: 1,
                seviye3SiklikDk: 1,
                seviye4SiklikDk: 1,
            });

            mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
                vakit: 'ogle',
                kalanSureMs: kalanDk * 60 * 1000,
            });

            muhafiz.baslat(bildirimSpx);

            if (beklenenSeviye === 0) {
                // 46 dk: hiçbir eşiğe girmediği için bildirim hiç gönderilmemeli
                expect(bildirimSpx).not.toHaveBeenCalled();
            } else {
                expect(bildirimSpx).toHaveBeenCalledTimes(1);
                const [, seviye] = bildirimSpx.mock.calls[0];
                expect(seviye).toBe(beklenenSeviye);
            }
        });
    });

    test('Vakit DOLDUĞUNDA (kalanSureMs negatif) hâlâ Seviye 4 tetiklenir ve mesajda negatif dk gösterilir', () => {
        // Gerçek getSuankiVakitBilgisi vakit çıkışında kalanSureMs'i NEGATİF döndürür.
        // Math.floor(-120000/60000) = -2 -> -2 <= 5 -> L4 dalı, modulo bypass (aktifSeviye===4).
        // Bu, mevcut fiziksel sınır davranışını sabitler: vakit dolmuşken muhafız susmaz,
        // negatif dakika mesaja sızar. Üretim bu sınırı clamp'lemeye başlarsa test düşer (amaç bu).
        mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
            vakit: 'ogle',
            kalanSureMs: -2 * 60 * 1000, // vakit 2 dk önce çıktı
        });

        muhafiz.baslat(bildirimSpx);

        expect(bildirimSpx).toHaveBeenCalledTimes(1);
        const [mesaj, seviye] = bildirimSpx.mock.calls[0];
        expect(seviye).toBe(4);
        expect(mesaj).toContain('VAKİT ÇIKIYOR');
        expect(mesaj).toContain('-2 dk kaldı');
    });

    test('Vakit TAM DOLDUĞUNDA (kalanSureMs===0) Seviye 4 tetiklenir', () => {
        // Sınır: 0 dk -> 0 <= 5 -> L4, mesaj "(0 dk kaldı)".
        mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
            vakit: 'ogle',
            kalanSureMs: 0,
        });

        muhafiz.baslat(bildirimSpx);

        expect(bildirimSpx).toHaveBeenCalledTimes(1);
        const [mesaj, seviye] = bildirimSpx.mock.calls[0];
        expect(seviye).toBe(4);
        expect(mesaj).toContain('0 dk kaldı');
    });

    test('Sıklık modulo kapısı: Seviye 1 boyunca (45->31 dk) yalnızca 45 ve 30\'da tetiklenir, aradaki dakikalar ATLANIR', () => {
        // Seviye1 sıklık 15: 45 % 15 === 0 -> tetiklenir; 44,43...31 -> atlanır;
        // 30'a girince Seviye 2 (sıklık 10) ve 30 % 10 === 0 -> tetiklenir.
        // Bu, "tam dk denk gelmezse atla" davranışını SABİTLER; refactor'da sessizce bozulamaz.
        // Varsayılan config (beforeEach) zaten s1=15, s2=10 -> ekstra yapılandırma gerekmez.
        const dakikalar = [45, 44, 43, 42, 41, 40, 39, 38, 37, 36, 35, 34, 33, 32, 31, 30];
        let idx = 0;
        mockHesaplayici.getSuankiVakitBilgisi.mockImplementation(() => ({
            vakit: 'ogle',
            kalanSureMs: dakikalar[Math.min(idx, dakikalar.length - 1)] * 60 * 1000,
        }));

        // baslat() ilk kontrolEt'i hemen çağırır (idx=0 -> 45 dk)
        muhafiz.baslat(bildirimSpx);
        // Kalan dakikalar için her 60 sn'de bir tick
        for (idx = 1; idx < dakikalar.length; idx++) {
            jest.advanceTimersByTime(60 * 1000);
        }

        // 45 (L1, 45%15=0) ve 30 (L2, 30%10=0) -> tam 2 bildirim; aradaki 14 dakika atlanmalı
        expect(bildirimSpx).toHaveBeenCalledTimes(2);
        const seviyeler = bildirimSpx.mock.calls.map((c) => c[1]);
        expect(seviyeler).toEqual([1, 2]);
    });

    test('Vakit DEĞİŞİMİNDE durum sıfırlanır: öğle kılındı işaretliyken ikindi vakti yeniden uyarır', () => {
        // kilinanVakitler vakit-bazlı anahtar (tarih_vakit) tutar.
        // 'ogle' kılındı işaretlenince 'ogle' susar; ama vakit 'ikindi'ye geçince
        // farklı anahtar -> muhafız ikindi için tekrar uyarmalı. Aksi halde gün boyu
        // tek bir kılınmış namaz tüm sonraki vakitleri sessizleştirirdi (kritik regresyon).
        muhafiz.namazKilindiIsaretle('ogle');

        // Önce öğle vakti: kılındı -> banner temizleme (seviye 0)
        mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
            vakit: 'ogle',
            kalanSureMs: 10 * 60 * 1000, // L3 aralığı ama kılındığı için susmalı
        });
        muhafiz.baslat(bildirimSpx);
        expect(bildirimSpx).toHaveBeenCalledWith('', 0);

        bildirimSpx.mockClear();

        // Vakit ikindiye geçti: ikindi kılınmadı -> uyarı gelmeli (seviye 0 DEĞİL)
        mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
            vakit: 'ikindi',
            kalanSureMs: 30 * 60 * 1000, // L2, 30 % 10 === 0 -> tetiklenir
        });
        jest.advanceTimersByTime(60 * 1000);

        expect(bildirimSpx).toHaveBeenCalledTimes(1);
        const [, seviye] = bildirimSpx.mock.calls[0];
        expect(seviye).toBe(2);
    });

    test('Gün değişiminde kılındı işareti sıfırlanır: ertesi gün aynı vakit yeniden uyarır', () => {
        // namazKilindiIsaretle anahtarı new Date().toDateString() ile üretir.
        // Dün işaretlenen 'ogle', BUGÜN aynı vakit için geçersiz olmalı (yeni gün = yeni anahtar).
        // Sistem saatini sabit öğlen değerlerine DONDURUYORUZ ki CI gün-sınırında flaky olmasın.

        // 1. gün: 15 Haziran 2026, öğlen (yerel kurucu)
        jest.setSystemTime(new Date(2026, 5, 15, 12, 0, 0));
        muhafiz.namazKilindiIsaretle('ogle');

        // Aynı gün öğle vakti: işaretli -> banner temizle (seviye 0), uyarı yok
        mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
            vakit: 'ogle',
            kalanSureMs: 30 * 60 * 1000,
        });
        muhafiz.baslat(bildirimSpx);
        expect(bildirimSpx).toHaveBeenCalledWith('', 0);

        bildirimSpx.mockClear();

        // 2. gün: 16 Haziran 2026, öğlen -> dünkü 'ogle' işareti artık geçersiz
        jest.setSystemTime(new Date(2026, 5, 16, 12, 0, 0));
        // Aynı 'ogle' vakti, kılınmamış yeni gün -> uyarı gelmeli (seviye 0 DEĞİL)
        jest.advanceTimersByTime(60 * 1000);

        expect(bildirimSpx).toHaveBeenCalledTimes(1);
        const [, seviye] = bildirimSpx.mock.calls[0];
        expect(seviye).toBe(2); // 30 dk -> L2 (30 % 10 === 0)
    });

    // ── AÇILIŞTA DİSKTEN KILINMIŞLIK YÜKLEME (#92) ────────────────────────────
    // Bug: uygulama yeniden açıldığında foreground muhafızın bellek-içi kilinanVakitler
    // map'i BOŞ olur; namaz zaten kılınmış olsa bile vakte kısa süre kala (seviye >= 3)
    // çan sesi (SesServisi.bildirimSesiCal) çalardı. Düzeltme: acilistaKilinanlariYukle()
    // diskteki kalıcı kaydı (kilinanVakitleriAl) map'e hydrate eder.
    describe('acilistaKilinanlariYukle (#92 — açılışta kılınmış namaza ses yok)', () => {
        test('Diskte kılınmış öğle varken, açılışta vakte 10 dk kala (L3) UYARI/SES GELMEMELİ — yalnız banner temizleme', async () => {
            // Disk: bugün öğle kılınmış
            mockKilinanVakitleriAl.mockImplementation(async (tarih: string) =>
                tarih === bugunuAl() ? ['ogle'] : []
            );

            // L3 aralığı (10 dk) — düzeltme olmadan seviye 3 -> ses çalardı
            mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
                vakit: 'ogle',
                kalanSureMs: 10 * 60 * 1000,
            });

            // Açılış akışı: önce diskten hydrate, sonra baslat (AnaSayfa ile aynı sıra)
            await muhafiz.acilistaKilinanlariYukle();
            muhafiz.baslat(bildirimSpx);

            // Kılınmış -> yalnız seviye 0 (banner temizleme); seviye >= 1 ASLA gelmemeli
            expect(bildirimSpx).toHaveBeenCalledTimes(1);
            expect(bildirimSpx).toHaveBeenCalledWith('', 0);
            const seviyeler = bildirimSpx.mock.calls.map((c) => c[1]);
            expect(seviyeler).not.toContain(3);
            expect(seviyeler).not.toContain(4);
        });

        test('Diskte kılınmamış vakit için açılışta uyarı normal şekilde gelir (regresyon koruması)', async () => {
            // Disk: hiçbir vakit kılınmamış
            mockKilinanVakitleriAl.mockResolvedValue([]);

            mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
                vakit: 'ogle',
                kalanSureMs: 15 * 60 * 1000, // L3
            });

            await muhafiz.acilistaKilinanlariYukle();
            muhafiz.baslat(bildirimSpx);

            expect(bildirimSpx).toHaveBeenCalledTimes(1);
            const [, seviye] = bildirimSpx.mock.calls[0];
            expect(seviye).toBe(3);
        });

        test('Gece yarısı geçişi: imsak öncesi dün yatsı kılınmışsa, açılışta yatsı için ses GELMEMELİ', async () => {
            // Disk: dünün yatsısı kılınmış (gece yarısı sonrası hâlâ aktif vakit)
            mockKilinanVakitleriAl.mockImplementation(async (tarih: string) =>
                tarih === dunuAl() ? ['yatsi'] : []
            );

            // L4 (3 dk): aktifSeviye===4 modülo'yu bypass eder -> kılınmamış olsa kesin çalardı.
            // Kılınmış olduğu için yalnız banner temizleme (seviye 0) gelmeli, ses YOK.
            mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
                vakit: 'yatsi',
                kalanSureMs: 3 * 60 * 1000,
            });

            await muhafiz.acilistaKilinanlariYukle();
            muhafiz.baslat(bildirimSpx);

            expect(bildirimSpx).toHaveBeenCalledTimes(1);
            expect(bildirimSpx).toHaveBeenCalledWith('', 0);
        });
    });
});

