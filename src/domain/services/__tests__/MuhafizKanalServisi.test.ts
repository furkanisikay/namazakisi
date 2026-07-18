/**
 * Muhafiz bildirim kanali hazirligi — TEMBEL olusturma + cop toplama + URI dogrulama.
 *
 * Native kopru mock'lanir: burada olculen sey NE cagrildigi ve HANGI argumanlarla
 * cagrildigidir (gercek NotificationChannel davranisi emulatorde dogrulanir).
 */
import { Platform } from 'react-native';
import { MuhafizKanalServisi } from '../MuhafizKanalServisi';
import {
    MUHAFIZ_VAKITLERI,
    SEVIYE_KADEMELERI,
    VARSAYILAN_SES,
} from '../../../core/muhafiz/matrisTipleri';
import type { MuhafizMatrisi, SeviyeAyari } from '../../../core/muhafiz/matrisTipleri';
import { muhafizKanalIdOlustur } from '../../../core/muhafiz/sesKimligi';

const mockGarantile = jest.fn();
const mockTemizle = jest.fn();
const mockSesAdiAl = jest.fn();
jest.mock('../../../../modules/expo-countdown-notification/src', () => ({
    muhafizKanaliniGarantile: (...args: unknown[]) => mockGarantile(...args),
    muhafizKanallariniTemizle: (...args: unknown[]) => mockTemizle(...args),
    sesAdiAl: (...args: unknown[]) => mockSesAdiAl(...args),
}));

const OZEL_SES = 'content://media/internal/audio/media/42';

const sv = (o: Partial<SeviyeAyari> = {}): SeviyeAyari => ({
    kademe: 'nazik',
    mod: 'bildirim',
    esikDk: 30,
    siklik: 'birkez',
    bildirimSesi: VARSAYILAN_SES,
    anonsMetni: '',
    ...o,
});

const matrisOlustur = (seviyeler: SeviyeAyari[]): MuhafizMatrisi =>
    Object.fromEntries(
        MUHAFIZ_VAKITLERI.map((v) => [v, { seviyeler: seviyeler.map((s) => ({ ...s })) }])
    ) as MuhafizMatrisi;

const dortSeviye = (o: Partial<SeviyeAyari> = {}) =>
    SEVIYE_KADEMELERI.map((kademe) => sv({ kademe, ...o }));

describe('MuhafizKanalServisi.hazirla', () => {
    const oncekiPlatform = Platform.OS;

    beforeEach(() => {
        jest.clearAllMocks();
        (Platform as { OS: string }).OS = 'android';
        // Varsayilan: her URI cozulur (ad doner) → hicbir ses dusurulmez.
        mockSesAdiAl.mockResolvedValue('Bir ses');
        // GC onbellegi suiteler arasi sizmasin (kume ayni ise atlanir).
        MuhafizKanalServisi.onbellegiSifirla();
    });

    afterAll(() => {
        (Platform as { OS: string }).OS = oncekiPlatform;
    });

    it('TABAN kanallari yeniden olusturmaya CALISMAZ (kullanici tercihleri korunur)', async () => {
        // Yalniz varsayilan ses → `muhafiz` + `muhafiz_acil`, ikisi de taban.
        await MuhafizKanalServisi.hazirla(matrisOlustur(dortSeviye()));

        expect(mockGarantile).not.toHaveBeenCalled();
        // GC yine calisir; taban kanallar korunacak listede yer alir.
        expect(mockTemizle).toHaveBeenCalledWith(
            expect.arrayContaining(['muhafiz', 'muhafiz_acil'])
        );
    });

    it('ÖZEL sesli kanali sesin URI si ve ADIyla olusturur', async () => {
        const seviyeler = dortSeviye();
        seviyeler[0].bildirimSesi = OZEL_SES;
        seviyeler[0].sesAdi = 'Hızır';

        await MuhafizKanalServisi.hazirla(matrisOlustur(seviyeler));

        expect(mockGarantile).toHaveBeenCalledWith(
            muhafizKanalIdOlustur(OZEL_SES, false),
            expect.stringContaining('Hızır'),
            expect.any(String),
            OZEL_SES,
            false
        );
    });

    it('ses ADI yoksa kanal adı TABAN kanaldan AYIRT EDİLEBİLİR olmalı', async () => {
        // Ad çözülemediğinde "Uygulama sesi" yazılırsa özel sesli kanal, taban
        // kanalla BİREBİR aynı isimde görünür ve kullanıcı ikisini ayıramaz.
        const seviyeler = dortSeviye();
        seviyeler[0].bildirimSesi = OZEL_SES;
        seviyeler[0].sesAdi = undefined;

        await MuhafizKanalServisi.hazirla(matrisOlustur(seviyeler));

        const [, kanalAdi] = mockGarantile.mock.calls[0];
        expect(kanalAdi).toContain('Seçtiğiniz ses');
        expect(kanalAdi).not.toContain('Uygulama sesi');
    });

    it('KANAL ENFLASYONU YOK: 20 hücre tek özel ses = tek çağrı', async () => {
        await MuhafizKanalServisi.hazirla(matrisOlustur(dortSeviye({ bildirimSesi: OZEL_SES })));

        // 5 vakit x 4 seviye ayni sesi kullaniyor; yalniz aciliyet ekseni ayirir.
        const olusturulanIdler = new Set(mockGarantile.mock.calls.map((c) => c[0]));
        expect(olusturulanIdler).toEqual(
            new Set([muhafizKanalIdOlustur(OZEL_SES, false), muhafizKanalIdOlustur(OZEL_SES, true)])
        );
    });

    it('GC: yalnız MATRİSTE REFERANS VERİLEN kanallar korunur', async () => {
        const seviyeler = dortSeviye();
        seviyeler[0].bildirimSesi = OZEL_SES;

        await MuhafizKanalServisi.hazirla(matrisOlustur(seviyeler));

        const korunacak: string[] = mockTemizle.mock.calls[0][0];
        expect(korunacak).toContain(muhafizKanalIdOlustur(OZEL_SES, false));
        // Kullanilmayan baska bir sesin kanali listede OLMAMALI → silinir.
        expect(korunacak).not.toContain(
            muhafizKanalIdOlustur('content://media/external/audio/media/999', false)
        );
    });

    it('GC: kanal kümesi DEĞİŞMEDİYSE native çağrı tekrarlanmaz', async () => {
        const matris = matrisOlustur(dortSeviye({ bildirimSesi: OZEL_SES }));

        await MuhafizKanalServisi.hazirla(matris);
        await MuhafizKanalServisi.hazirla(matris);

        // Bu yol açılışta + ~15 dk'da bir arka plan görevinde + her konum
        // güncellemesinde çalışıyor; native taraf TÜM kanalları enumerate ediyor.
        expect(mockTemizle).toHaveBeenCalledTimes(1);
    });

    it('muhafız KAPALIYKEN (matris yok) öksüz kanallar yine toplanır', async () => {
        await MuhafizKanalServisi.hazirla();

        expect(mockGarantile).not.toHaveBeenCalled();
        expect(mockTemizle).toHaveBeenCalledWith([]);
    });

    it('ÇÖZÜLEMEYEN özel ses varsayılana düşer — kanal ÖLÜ URI ile kurulmaz', async () => {
        // `content://` cihaza özgüdür; yedek başka cihaza taşınınca çözülmez.
        // Kanal sesi sonradan DEĞİŞTİRİLEMEZ → ölü URI ile kurulan kanal sessiz kalır.
        mockSesAdiAl.mockResolvedValue('');

        const dogrulanmis = await MuhafizKanalServisi.hazirla(
            matrisOlustur(dortSeviye({ bildirimSesi: OZEL_SES, sesAdi: 'Kayıp ses' }))
        );

        // Hiçbir hash'li kanal kurulmaz; hepsi TABAN kanala düşer.
        expect(mockGarantile).not.toHaveBeenCalled();
        expect(mockTemizle).toHaveBeenCalledWith(
            expect.arrayContaining(['muhafiz', 'muhafiz_acil'])
        );
        // Dönen matris planlama için kullanılır: ses ve ad temizlenmiş olmalı.
        expect(dogrulanmis!.ogle.seviyeler[0].bildirimSesi).toBe(VARSAYILAN_SES);
        expect(dogrulanmis!.ogle.seviyeler[0].sesAdi).toBeUndefined();
    });

    it('çözülebilen ses DOKUNULMADAN geri döner (aynı referans)', async () => {
        const matris = matrisOlustur(dortSeviye({ bildirimSesi: OZEL_SES }));

        const dogrulanmis = await MuhafizKanalServisi.hazirla(matris);

        expect(dogrulanmis).toBe(matris);
    });

    it('Android dışında hiçbir native çağrı yapmaz', async () => {
        (Platform as { OS: string }).OS = 'ios';

        await MuhafizKanalServisi.hazirla(matrisOlustur(dortSeviye({ bildirimSesi: OZEL_SES })));

        expect(mockGarantile).not.toHaveBeenCalled();
        expect(mockTemizle).not.toHaveBeenCalled();
    });

    it('bir kanal patlarsa DİĞERLERİ yine kurulur (döngü kesilmez)', async () => {
        // Tek ortak catch olsaydı ilk hata döngüyü keser, kalan kanallar hiç
        // oluşmaz ve o adımlar Android 8+'ta HİÇ GÖSTERİLMEZDİ.
        mockGarantile.mockImplementationOnce(() => {
            throw new Error('native yok');
        });

        await expect(
            MuhafizKanalServisi.hazirla(matrisOlustur(dortSeviye({ bildirimSesi: OZEL_SES })))
        ).resolves.toBeDefined();

        // 2 kanal gerekiyordu (normal + acil); ilki patladı, ikincisi yine denendi.
        expect(mockGarantile).toHaveBeenCalledTimes(2);
        expect(mockTemizle).toHaveBeenCalled();
    });
});
