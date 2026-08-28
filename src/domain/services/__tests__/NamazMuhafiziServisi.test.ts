import { NamazMuhafiziServisi } from '../NamazMuhafiziServisi';
import { NamazVaktiHesaplayiciServisi } from '../NamazVaktiHesaplayiciServisi';
import { SEYTANLA_MUCADELE_ICERIGI } from '../../../core/data/SeytanlaMucadeleIcerigi';
import { kilinanVakitleriAl } from '../../../data/local/LocalNamazServisi';
import { bugunuAl, dunuAl } from '../../../core/utils/TarihYardimcisi';
import type { MuhafizMatrisi, MuhafizVakti, UyariModu } from '../../../core/muhafiz/matrisTipleri';
import { MUHAFIZ_VAKITLERI, SEVIYE_KADEMELERI, VARSAYILAN_SES } from '../../../core/muhafiz/matrisTipleri';
import { muhafizBildirimIdOlustur } from '../../../core/muhafiz/anonsKimligi';
import { vakitUyariPlaniOlustur } from '../../../core/muhafiz/motorAdaptoru';
import { GIRIS_ICERIK_HAVUZU } from '../../../core/utils/muhafizMetinYardimcisi';

/** Bir seviye hucresinin test tanimi (kademe SEVIYE_KADEMELERI sirasindan gelir). */
interface SeviyeTanimi {
    esikDk: number;
    siklikDk: number;
    mod?: UyariModu;
}

/** Eski global varsayilan yapilandirmanin matris karsiligi. */
const VARSAYILAN_TANIM: SeviyeTanimi[] = [
    { esikDk: 45, siklikDk: 15 },
    { esikDk: 30, siklikDk: 10 },
    { esikDk: 15, siklikDk: 5 },
    { esikDk: 5, siklikDk: 1 },
];

/** Tum vakitlere ayni satiri veren matris (eski global-ayar testlerinin karsiligi). */
const tekDuzeMatris = (tanimlar: SeviyeTanimi[]): MuhafizMatrisi => {
    const matris = {} as MuhafizMatrisi;
    for (const vakit of MUHAFIZ_VAKITLERI) {
        matris[vakit] = {
            seviyeler: tanimlar.map((t, i) => ({
                kademe: SEVIYE_KADEMELERI[i],
                mod: t.mod ?? 'bildirim',
                esikDk: t.esikDk,
                siklik: { herDk: t.siklikDk } as const,
                bildirimSesi: VARSAYILAN_SES,
                anonsMetni: '',
            })),
        };
    }
    return matris;
};

/** Vakit bazli matris: belirtilen vakitler kendi satirini alir. */
const vakitBazliMatris = (
    varsayilan: SeviyeTanimi[],
    ozel: Partial<Record<MuhafizVakti, SeviyeTanimi[]>>
): MuhafizMatrisi => {
    const matris = tekDuzeMatris(varsayilan);
    for (const [vakit, tanimlar] of Object.entries(ozel)) {
        matris[vakit as MuhafizVakti] = tekDuzeMatris(tanimlar!)[vakit as MuhafizVakti];
    }
    return matris;
};

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

// Native sesli-anons koprusu (Faz 5 on plan anonsu). Gercek modul
// `requireNativeModule` cagirir -> jest ortaminda yoktur.
const mockPlanlaAnons = jest.fn();
jest.mock('../../../../modules/expo-countdown-notification/src', () => ({
    planlaAnons: (...args: unknown[]) => mockPlanlaAnons(...args),
    iptalEtAnons: jest.fn(),
    iptalEtTumAnonslar: jest.fn(),
    trDestekleniyorMu: jest.fn().mockResolvedValue(true),
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
        
        // Varsayılan yapılandırma (Faz 3: artık matris)
        muhafiz.yapilandir(tekDuzeMatris(VARSAYILAN_TANIM));

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
            1,
            expect.any(String)
        );
    });

    test("banner geri çağrısı ADIMIN KENDİ sesini taşır (ön plan varsayılan çana düşmesin)", () => {
        // Ekran bu değeri çalar. Taşınmazsa AYNI adım uygulama AÇIKKEN paketlenmiş
        // varsayılan çan, KAPALIYKEN (kanal sesi) kullanıcının seçtiği ses ile
        // duyulur — aynı hatırlatma iki farklı sesle çalardı.
        const OZEL_SES = 'content://media/internal/audio/media/42';
        const matris = tekDuzeMatris(VARSAYILAN_TANIM);
        for (const vakit of MUHAFIZ_VAKITLERI) {
            matris[vakit].seviyeler[3].bildirimSesi = OZEL_SES;
        }
        muhafiz.yapilandir(matris);
        mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
            vakit: 'ogle',
            kalanSureMs: 5 * 60 * 1000, // seviye 4
        });

        muhafiz.baslat(bildirimSpx);

        expect(bildirimSpx).toHaveBeenCalledWith(expect.any(String), 4, OZEL_SES);
    });

    test('Seviye 2 bildirimi (30 dk kala)', () => {
        mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
            vakit: 'ogle',
            kalanSureMs: 30 * 60 * 1000,
        });

        muhafiz.baslat(bildirimSpx);

        expect(bildirimSpx).toHaveBeenCalledWith(
            expect.stringContaining('Vakit daralıyor'),
            2,
            expect.any(String)
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

            expect(bildirimSpx).toHaveBeenCalledWith(ilkSeviye3Metin, 3, expect.any(String));
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
            4,
            expect.any(String)
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
        expect(bildirimSpx).toHaveBeenCalledWith(expect.any(String), 2, expect.any(String));
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

    test('namazKilindiTemizle: kılındı geri alınınca muhafız o vakit için yeniden uyarır (#101)', () => {
        // Önce kıl: 'ogle' susmalı (banner temizleme, seviye 0)
        muhafiz.namazKilindiIsaretle('ogle');
        mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
            vakit: 'ogle',
            kalanSureMs: 30 * 60 * 1000, // L2 (30 % 10 === 0)
        });
        muhafiz.baslat(bildirimSpx);
        expect(bildirimSpx).toHaveBeenCalledWith('', 0);

        bildirimSpx.mockClear();

        // Kılınmadı'ya geri al -> bellek-içi kayıt temizlenmeli -> uyarı geri gelmeli.
        // (Aksi halde işaret kaldırılsa bile muhafız o vakit için bir daha uyarmazdı.)
        muhafiz.namazKilindiTemizle('ogle');
        jest.advanceTimersByTime(60 * 1000);

        expect(bildirimSpx).toHaveBeenCalledTimes(1);
        const [, seviye] = bildirimSpx.mock.calls[0];
        expect(seviye).toBe(2);
    });

    test('Yapılandırma değişikliği etkili olmalı', () => {
        // Seviye 1 başlangıcını 60 dk'ya çekelim (sıklık 15 kalsın)
        muhafiz.yapilandir(tekDuzeMatris([{ esikDk: 60, siklikDk: 15 }, ...VARSAYILAN_TANIM.slice(1)]));

        mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
            vakit: 'ogle',
            kalanSureMs: 55 * 60 * 1000,
        });

        muhafiz.baslat(bildirimSpx);

        // 55 dk kala pencere içinde ama sıklık kapısı kapalı: (60-55) % 15 !== 0
        expect(bildirimSpx).not.toHaveBeenCalled();

        // Sıklığı 5 yapınca aynı dakika tetiklenmeli ((60-55) % 5 === 0).
        // NOT (Faz 0 plan bütçesi): burada 1 dk seçilemez — nazik adımın kazandığı
        // segment 30 dk (60→30) ve seviye başına en fazla 15 uyarı verildiği için
        // etkin sıklık 2 dk'ya seyrelir; test o zaman sıklığı değil bütçeyi ölçerdi.
        muhafiz.yapilandir(tekDuzeMatris([{ esikDk: 60, siklikDk: 5 }, ...VARSAYILAN_TANIM.slice(1)]));

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
            muhafiz.yapilandir(
                tekDuzeMatris(VARSAYILAN_TANIM.map((t) => ({ ...t, siklikDk: 1 })))
            );

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

    test('Vakit DOLDUĞUNDA (kalanSureMs negatif) muhafız SUSAR (negatif dk mesaja sızmaz)', () => {
        // Gerçek getSuankiVakitBilgisi vakit çıkışında kalanSureMs'i NEGATİF döndürür.
        // Eskiden bu "-2 dk kaldı" gibi bir banner üretiyordu; alt sınır (kalanDk >= 1)
        // `seviyeTetiklenirMi`ye taşındığından artık uyarı yok — arka plan planı da
        // bu dakikaları hiç içermiyordu.
        mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
            vakit: 'ogle',
            kalanSureMs: -2 * 60 * 1000, // vakit 2 dk önce çıktı
        });

        muhafiz.baslat(bildirimSpx);

        expect(bildirimSpx).not.toHaveBeenCalled();
    });

    test('Vakit TAM DOLDUĞUNDA (kalanSureMs===0) muhafız SUSAR', () => {
        mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
            vakit: 'ogle',
            kalanSureMs: 0,
        });

        muhafiz.baslat(bildirimSpx);

        expect(bildirimSpx).not.toHaveBeenCalled();
    });

    test('Vaktin SON dakikasında (59 sn > kalan > 0 değil, tam 1 dk) hâlâ uyarı gelir', () => {
        mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
            vakit: 'ogle',
            kalanSureMs: 60 * 1000, // kalanDk = 1
        });

        muhafiz.baslat(bildirimSpx);

        expect(bildirimSpx).toHaveBeenCalledTimes(1);
        expect(bildirimSpx.mock.calls[0][1]).toBe(4);
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

    // ── FAZ 3: matris motoru (sessiz seviye + vakit bazlı eşik) ───────────────
    describe('Faz 3 — matristen okuma', () => {
        test('mod=sessiz seviye banner üretmez; pencereyi bir üst seviye devralır', () => {
            // acil (5 dk) SESSIZ -> 3 dk kala seviye 4 DEĞİL, sert (15 dk) aktif olmalı.
            muhafiz.yapilandir(
                tekDuzeMatris([
                    { esikDk: 45, siklikDk: 15 },
                    { esikDk: 30, siklikDk: 10 },
                    { esikDk: 15, siklikDk: 1 },
                    { esikDk: 5, siklikDk: 1, mod: 'sessiz' },
                ])
            );

            mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
                vakit: 'ogle',
                kalanSureMs: 3 * 60 * 1000,
            });

            muhafiz.baslat(bildirimSpx);

            expect(bildirimSpx).toHaveBeenCalledTimes(1);
            const [, seviye] = bildirimSpx.mock.calls[0];
            expect(seviye).toBe(3);
        });

        test('TÜM seviyeleri sessiz olan vakit hiç banner üretmez', () => {
            muhafiz.yapilandir(
                tekDuzeMatris(VARSAYILAN_TANIM.map((t) => ({ ...t, siklikDk: 1, mod: 'sessiz' as UyariModu })))
            );

            mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
                vakit: 'ogle',
                kalanSureMs: 3 * 60 * 1000, // normalde seviye 4
            });

            muhafiz.baslat(bildirimSpx);

            expect(bildirimSpx).not.toHaveBeenCalled();
        });

        test('eşikler VAKİT BAZLI: öğle susarken ikindi aynı dakikada uyarır', () => {
            // Öğle: yalnız 10 dk ve altı (nazik). İkindi: 40 dk ve altı (nazik).
            // 20 dk kala -> öğle SESSİZ kalmalı, ikindi uyarmalı. Global eşik
            // regresyonunda ikisi de aynı davranır ve bu test düşer.
            muhafiz.yapilandir(
                vakitBazliMatris(VARSAYILAN_TANIM, {
                    ogle: [
                        { esikDk: 10, siklikDk: 1 },
                        { esikDk: 6, siklikDk: 1, mod: 'sessiz' },
                        { esikDk: 4, siklikDk: 1, mod: 'sessiz' },
                        { esikDk: 2, siklikDk: 1, mod: 'sessiz' },
                    ],
                    ikindi: [
                        // Sıklık 5: 40 dk'lık tek açık segmentte 1 dk'lık sıklık plan
                        // bütçesiyle 3 dk'ya seyrelirdi (Faz 0) — ölçülen şey vakit
                        // bazlı eşik olduğu için seyreltmeye girmeyen bir değer seçildi.
                        { esikDk: 40, siklikDk: 5 },
                        { esikDk: 6, siklikDk: 1, mod: 'sessiz' },
                        { esikDk: 4, siklikDk: 1, mod: 'sessiz' },
                        { esikDk: 2, siklikDk: 1, mod: 'sessiz' },
                    ],
                })
            );

            // Öğle vakti, 20 dk kala: öğlenin eşiği 10 -> pencere dışı, banner YOK
            mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
                vakit: 'ogle',
                kalanSureMs: 20 * 60 * 1000,
            });
            muhafiz.baslat(bildirimSpx);
            expect(bildirimSpx).not.toHaveBeenCalled();

            // Aynı kalan süre, ikindi vakti: ikindinin eşiği 40 -> uyarı GELMELİ
            mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
                vakit: 'ikindi',
                kalanSureMs: 20 * 60 * 1000,
            });
            jest.advanceTimersByTime(60 * 1000);

            expect(bildirimSpx).toHaveBeenCalledTimes(1);
            const [, seviye] = bildirimSpx.mock.calls[0];
            expect(seviye).toBe(1);
        });

        test("siklik='birkez' yalnız tam eşik dakikasında tetiklenir", () => {
            const matris = tekDuzeMatris([
                { esikDk: 20, siklikDk: 1 },
                { esikDk: 12, siklikDk: 1, mod: 'sessiz' },
                { esikDk: 8, siklikDk: 1, mod: 'sessiz' },
                { esikDk: 4, siklikDk: 1, mod: 'sessiz' },
            ]);
            for (const vakit of MUHAFIZ_VAKITLERI) matris[vakit].seviyeler[0].siklik = 'birkez';
            muhafiz.yapilandir(matris);

            // 19 dk kala: pencere içinde ama eşik anı değil -> tetiklenmez
            mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
                vakit: 'ogle',
                kalanSureMs: 19 * 60 * 1000,
            });
            muhafiz.baslat(bildirimSpx);
            expect(bildirimSpx).not.toHaveBeenCalled();

            // Tam 20 dk kala -> tetiklenir
            mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
                vakit: 'ogle',
                kalanSureMs: 20 * 60 * 1000,
            });
            jest.advanceTimersByTime(60 * 1000);
            expect(bildirimSpx).toHaveBeenCalledTimes(1);
        });

        test("'gunes' vakti muhafızda planlanmaz (matriste satırı yok) — banner üretmez", () => {
            mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
                vakit: 'gunes',
                kalanSureMs: 3 * 60 * 1000,
            });

            muhafiz.baslat(bildirimSpx);

            expect(bildirimSpx).not.toHaveBeenCalled();
        });
    });

    // NÖBETÇİ: "secdeye kapan" mantık hatasıydı — secde namazın İÇİNDEKİ bir rükün,
    // başlangıcı değil. Vakit daralınca kişi namaza durur, secdeye kapanmaz.
    // Mevcut testler stringContaining ile PARÇA kontrol ettiği için bu regresyonu
    // yakalayamaz; bu test onu yakalar.
    test('seviye 4 banner mesajı "namaza dur" der, "secde" demez', () => {
        mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
            vakit: 'ogle',
            kalanSureMs: 3 * 60 * 1000,
        });

        muhafiz.baslat(bildirimSpx);

        const [mesaj] = bildirimSpx.mock.calls[0];
        expect(mesaj).toContain('namaza dur');
        expect(mesaj).not.toMatch(/secde/i);
    });

    // ── Faz 5: ön plan sesli anonsu + ÇİFT KONUŞMA önleme ────────────────────
    //
    // Arka plan aynı dakikaya zaten bir TTS alarmı kurar. Ön plan bunu ÇOĞALTMAZ,
    // aynı id ile DEĞİŞTİRİR (native FLAG_UPDATE_CURRENT). Bu blok id paritesini
    // ve "sadece sesli modda konuş" kuralını korur.
    describe('ön plan sesli anonsu (Faz 5)', () => {
        /** Tek vakit için sesli mod + anons metni olan matris. */
        const sesliMatris = (mod: UyariModu, anonsMetni: string) => {
            const matris = tekDuzeMatris(VARSAYILAN_TANIM);
            matris.ogle.seviyeler[0] = { ...matris.ogle.seviyeler[0], mod, anonsMetni };
            return matris;
        };

        it('mod "bildirim" iken anons PLANLANMAZ (sessiz kalmalı)', () => {
            mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
                vakit: 'ogle',
                kalanSureMs: 45 * 60 * 1000,
            });

            muhafiz.baslat(bildirimSpx);

            expect(bildirimSpx).toHaveBeenCalled();
            expect(mockPlanlaAnons).not.toHaveBeenCalled();
        });

        it('mod "sesli" ama anons metni BOŞ ise planlanmaz', () => {
            muhafiz.yapilandir(sesliMatris('sesli', ''));
            mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
                vakit: 'ogle',
                kalanSureMs: 45 * 60 * 1000,
            });

            muhafiz.baslat(bildirimSpx);

            expect(mockPlanlaAnons).not.toHaveBeenCalled();
        });

        it('mod "ikisi" iken hem banner çıkar hem anons planlanır ({vakit}/{süre} çözülür)', () => {
            muhafiz.yapilandir(sesliMatris('ikisi', '{vakit} vakti çıkıyor, son {süre} dakika.'));
            mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
                vakit: 'ogle',
                kalanSureMs: 45 * 60 * 1000,
            });

            muhafiz.baslat(bildirimSpx);

            expect(bildirimSpx).toHaveBeenCalled();
            expect(mockPlanlaAnons).toHaveBeenCalledTimes(1);
            const [, , metin] = mockPlanlaAnons.mock.calls[0];
            expect(metin).toBe('Öğle vakti çıkıyor, son 45 dakika.');
        });

        it('ÇİFT KONUŞMA ÖNLEME: anons id\'si arka planın ürettiğiyle BİREBİR aynı', () => {
            muhafiz.yapilandir(sesliMatris('sesli', '{vakit} namazını kaçırma.'));
            mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
                vakit: 'ogle',
                kalanSureMs: 45 * 60 * 1000,
            });

            muhafiz.baslat(bildirimSpx);

            const [id] = mockPlanlaAnons.mock.calls[0];
            // ArkaplanMuhafizServisi ile AYNI üretici: seviye 1, bugünün tarihi, 45 dk
            expect(id).toBe(muhafizBildirimIdOlustur('ogle', 1, bugunuAl(), 45));
        });

        it('gece yarısı sonrası yatsı: anons id\'si DÜNÜN tarihini kullanır (arka planla parite)', () => {
            muhafiz.yapilandir(sesliMatris('sesli', '{vakit} vakti çıkıyor.'));
            // yatsi satırını da sesli yap
            const matris = tekDuzeMatris(VARSAYILAN_TANIM);
            matris.yatsi.seviyeler[0] = {
                ...matris.yatsi.seviyeler[0],
                mod: 'sesli',
                anonsMetni: '{vakit} vakti çıkıyor.',
            };
            muhafiz.yapilandir(matris);

            // Saat 02:30, vaktin çıkışına 45 dk → çıkış 03:15, AYNI takvim günü
            // → bu yatsı DÜNE aittir.
            jest.setSystemTime(new Date(2026, 6, 18, 2, 30, 0));
            mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
                vakit: 'yatsi',
                kalanSureMs: 45 * 60 * 1000,
            });

            muhafiz.baslat(bildirimSpx);

            const [id] = mockPlanlaAnons.mock.calls[0];
            expect(id).toBe(muhafizBildirimIdOlustur('yatsi', 1, dunuAl(), 45));
        });

        it('anons her tetiklemede TEK kez planlanır (banner ile 1:1)', () => {
            muhafiz.yapilandir(sesliMatris('sesli', '{vakit} — {süre} dk.'));
            mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
                vakit: 'ogle',
                kalanSureMs: 45 * 60 * 1000,
            });

            muhafiz.baslat(bildirimSpx);

            expect(mockPlanlaAnons).toHaveBeenCalledTimes(1);
            expect(bildirimSpx).toHaveBeenCalledTimes(1);
        });

        it('kılınmış vakitte anons planlanmaz (muhafız dinlenmede)', () => {
            muhafiz.yapilandir(sesliMatris('sesli', '{vakit} — {süre} dk.'));
            mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
                vakit: 'ogle',
                kalanSureMs: 45 * 60 * 1000,
            });
            muhafiz.namazKilindiIsaretle('ogle');

            muhafiz.baslat(bildirimSpx);

            expect(mockPlanlaAnons).not.toHaveBeenCalled();
        });

        it('REGRESYON: vakit çıkarken (kalan < 1 dk) ne banner ne de anons gelir', () => {
            // Kullanıcı raporu: 4. seviye "2 dk kala, her 2 dk" kurulu iken anons hem
            // 2 dk kala hem de 0 dk kala duyuluyordu. Arka plan planı (vakitUyariPlaniOlustur)
            // 0. dakikayı HİÇ planlamaz; ön plan da planlamamalı — yoksa uygulama açıkken
            // arka planda karşılığı olmayan FAZLADAN bir konuşma çıkar.
            const matris = tekDuzeMatris(VARSAYILAN_TANIM);
            matris.ogle.seviyeler[3] = {
                ...matris.ogle.seviyeler[3],
                mod: 'ikisi',
                esikDk: 2,
                siklik: { herDk: 2 },
                anonsMetni: '{vakit} vakti çıkıyor.',
            };
            muhafiz.yapilandir(matris);

            // Önce eşik anı: uyarı GELMELİ (nöbetçinin ayarı susturmadığının kanıtı)
            mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
                vakit: 'ogle',
                kalanSureMs: 2 * 60 * 1000,
            });
            muhafiz.baslat(bildirimSpx);
            expect(bildirimSpx).toHaveBeenCalled();
            expect(mockPlanlaAnons).toHaveBeenCalledTimes(1);

            // Vakit çıkmak üzere: 40 sn kaldı -> kalanDk = 0
            bildirimSpx.mockClear();
            mockPlanlaAnons.mockClear();
            muhafiz.durdur();
            mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
                vakit: 'ogle',
                kalanSureMs: 40 * 1000,
            });
            muhafiz.baslat(bildirimSpx);

            expect(mockPlanlaAnons).not.toHaveBeenCalled();
            expect(bildirimSpx).not.toHaveBeenCalled();
        });

        it('native çağrı patlarsa banner yine de gösterilir (anons UI\'ı düşürmez)', () => {
            mockPlanlaAnons.mockImplementationOnce(() => { throw new Error('native yok'); });
            muhafiz.yapilandir(sesliMatris('ikisi', '{vakit} — {süre} dk.'));
            mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
                vakit: 'ogle',
                kalanSureMs: 45 * 60 * 1000,
            });

            expect(() => muhafiz.baslat(bildirimSpx)).not.toThrow();
            expect(bildirimSpx).toHaveBeenCalled();
        });
    });
    // ── Faz 1: GİRİŞ yönü (olcuDk + B3 çift konuşma) ─────────────────────────
    //
    // Yatsı gibi 6-11 saat süren vakitlerde kullanıcı "vakit girer girmez
    // hatırlat, çıkana kadar sürdür" diyebilsin diye motor iki yönlüdür. Ön plan
    // ölçüyü `VakitBilgisi.giris`ten türetir; pencere uzunluğu geçilmezse motor
    // hiç tetiklenmez (sessizce yanlış dakikada konuşmaktansa hiç konuşmamak).
    describe('giriş yönü (Faz 1)', () => {
        /** ogle satırı giriş yönlü: eşik sırası ARTAN (nazik en küçük). */
        const girisMatrisi = (ozel: Partial<SeviyeTanimi>[] = []): MuhafizMatrisi => {
            const matris = tekDuzeMatris(VARSAYILAN_TANIM);
            const taban: SeviyeTanimi[] = [
                { esikDk: 5, siklikDk: 10 },
                { esikDk: 10, siklikDk: 30, mod: 'sessiz' },
                { esikDk: 15, siklikDk: 30, mod: 'sessiz' },
                { esikDk: 20, siklikDk: 30, mod: 'sessiz' },
            ];
            matris.ogle = {
                yon: 'girisindenItibaren',
                seviyeler: taban.map((t, i) => ({
                    kademe: SEVIYE_KADEMELERI[i],
                    mod: (ozel[i]?.mod ?? t.mod ?? 'bildirim'),
                    esikDk: ozel[i]?.esikDk ?? t.esikDk,
                    siklik: { herDk: ozel[i]?.siklikDk ?? t.siklikDk } as const,
                    bildirimSesi: VARSAYILAN_SES,
                    anonsMetni: '',
                })),
            };
            return matris;
        };

        /** Pencere 30 dk; girişin üzerinden `gecenDk` geçmiş. */
        const vakitBilgisiKur = (gecenDk: number) => {
            const simdi = Date.now();
            mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
                vakit: 'ogle',
                giris: new Date(simdi - gecenDk * 60 * 1000),
                saat: new Date(simdi + (30 - gecenDk) * 60 * 1000),
                kalanSureMs: (30 - gecenDk) * 60 * 1000,
            });
        };

        it('ölçü GİRİŞTEN sayılır: 5. dakikada uyarır, 6. dakikada susar', () => {
            muhafiz.yapilandir(girisMatrisi());

            vakitBilgisiKur(5);
            muhafiz.baslat(bildirimSpx);
            expect(bildirimSpx).toHaveBeenCalledTimes(1);
            expect(bildirimSpx.mock.calls[0][1]).toBe(1);

            bildirimSpx.mockClear();
            vakitBilgisiKur(6);
            jest.advanceTimersByTime(60 * 1000);
            expect(bildirimSpx).not.toHaveBeenCalled();
        });

        it('ARKA PLANLA PARİTE: tetiklenen dakikalar plan üreticisiyle birebir aynı', () => {
            // İki motor da aynı `pencereUzunluguDk` + yönü geçmezse banner ile
            // bildirim ayrı dakikalara düşer (AGENTS.md'de kayıtlı ders).
            const matris = girisMatrisi();
            const plan = vakitUyariPlaniOlustur(matris.ogle, 0, { pencereUzunluguDk: 30 });
            const beklenen = plan.map((u) => u.olcuDk);
            expect(beklenen).toEqual([5, 15, 25]);

            muhafiz.yapilandir(matris);
            const tetiklenen: number[] = [];
            for (let gecen = 1; gecen < 30; gecen++) {
                bildirimSpx.mockClear();
                muhafiz.durdur();
                vakitBilgisiKur(gecen);
                muhafiz.baslat(bildirimSpx);
                if (bildirimSpx.mock.calls.length > 0) tetiklenen.push(gecen);
            }
            expect(tetiklenen).toEqual(beklenen);
        });

        it('banner metni GİRİŞ dilindedir ve GEÇEN dakikayı gösterir', () => {
            muhafiz.yapilandir(girisMatrisi());
            vakitBilgisiKur(5);
            muhafiz.baslat(bildirimSpx);

            const [mesaj] = bildirimSpx.mock.calls[0];
            expect(mesaj).toContain('5');
            // Kalan (25) sızmamalı; "kaldı/çıkıyor" dili kullanılmamalı.
            expect(mesaj).not.toContain('25');
            expect(mesaj).not.toMatch(/kaldı|ÇIKIYOR/u);
        });

        it('seviye 3 GİRİŞ havuzundan gelir (mücadele havuzu "vakit çıkıyor" diliyle kuruludur)', () => {
            // sert (eşik 15) açık: 15. dakikada kapsayan en BÜYÜK eşik odur.
            muhafiz.yapilandir(
                girisMatrisi([{}, {}, { esikDk: 15, siklikDk: 5, mod: 'bildirim' }, {}])
            );
            const randomSpx = jest.spyOn(Math, 'random').mockReturnValue(0);
            try {
                vakitBilgisiKur(15);
                muhafiz.baslat(bildirimSpx);

                const [mesaj, seviye] = bildirimSpx.mock.calls[0];
                expect(seviye).toBe(3);
                expect(GIRIS_ICERIK_HAVUZU[3]).toContain(mesaj);
                // Çıkış havuzunun ilk seviye-3 metni SEÇİLMEMELİ (Math.random=0
                // ikisinde de ilk elemanı seçer → ayrım net görünür).
                const cikisIlk = SEYTANLA_MUCADELE_ICERIGI.find((i) => i.siddetSeviyesi === 3)!.metin;
                expect(mesaj).not.toBe(cikisIlk);
            } finally {
                randomSpx.mockRestore();
            }
        });

        it('B3 — ÇİFT KONUŞMA: giriş yönünde ön plan anons PLANLAMAZ', () => {
            // Tekilleştirmenin dayanağı çıkış yönünde "ön plan alarmdan ÖNCE
            // çalışır" idi: kalanDk = floor(kalanMs/60000) ⟹ şimdi ≤ alarm anı.
            // Giriş yönünde eşitsizlik TERS döner (olcuDk = floor((şimdi−giriş)/60000)
            // ⟹ şimdi ≥ alarm anı) → alarm ZATEN tetiklenmiştir ve ön planın
            // `planlaAnons(id, şimdi+1sn)` çağrısı onu yeniden kurup İKİNCİ kez
            // konuşturur. Ses arka plan alarmına bırakılır; banner çıkmaya devam eder.
            const matris = girisMatrisi();
            matris.ogle.seviyeler[0] = {
                ...matris.ogle.seviyeler[0],
                mod: 'ikisi',
                anonsMetni: '{vakit} vakti girdi, {süre} dakika geçti.',
            };
            muhafiz.yapilandir(matris);

            vakitBilgisiKur(5);
            muhafiz.baslat(bildirimSpx);

            expect(bildirimSpx).toHaveBeenCalledTimes(1);
            expect(mockPlanlaAnons).not.toHaveBeenCalled();
        });

        it('REGRESYON: çıkış yönünde ön plan anonsu ÇALIŞMAYA DEVAM eder', () => {
            // B3 kapısı yalnız giriş yönünü kapatmalı; çıkış yönünü de susturursa
            // uygulama açıkken sesli anons tümden kaybolur.
            const matris = tekDuzeMatris(VARSAYILAN_TANIM);
            matris.ogle.seviyeler[0] = {
                ...matris.ogle.seviyeler[0],
                mod: 'ikisi',
                anonsMetni: '{vakit} — {süre} dk.',
            };
            muhafiz.yapilandir(matris);

            mockHesaplayici.getSuankiVakitBilgisi.mockReturnValue({
                vakit: 'ogle',
                giris: new Date(Date.now() - 60 * 60 * 1000),
                saat: new Date(Date.now() + 45 * 60 * 1000),
                kalanSureMs: 45 * 60 * 1000,
            });
            muhafiz.baslat(bildirimSpx);

            expect(mockPlanlaAnons).toHaveBeenCalledTimes(1);
        });

        it('giriş yönünde vakit ÇIKARKEN (ölçü pencereyi doldurunca) susar', () => {
            muhafiz.yapilandir(girisMatrisi());
            vakitBilgisiKur(30); // pencere doldu
            muhafiz.baslat(bildirimSpx);
            expect(bildirimSpx).not.toHaveBeenCalled();
        });

        it('kılınmış vakitte giriş yönünde de yalnız banner temizleme gelir (#92)', () => {
            muhafiz.yapilandir(girisMatrisi());
            muhafiz.namazKilindiIsaretle('ogle');
            vakitBilgisiKur(5);
            muhafiz.baslat(bildirimSpx);
            expect(bildirimSpx).toHaveBeenCalledTimes(1);
            expect(bildirimSpx).toHaveBeenCalledWith('', 0);
        });
    });
});
