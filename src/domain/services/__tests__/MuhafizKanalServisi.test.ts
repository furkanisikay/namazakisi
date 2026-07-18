/**
 * Muhafiz bildirim kanali hazirligi — TEMBEL olusturma + cop toplama.
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
jest.mock('../../../../modules/expo-countdown-notification/src', () => ({
    muhafizKanaliniGarantile: (...args: unknown[]) => mockGarantile(...args),
    muhafizKanallariniTemizle: (...args: unknown[]) => mockTemizle(...args),
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
    });

    afterAll(() => {
        (Platform as { OS: string }).OS = oncekiPlatform;
    });

    it('TABAN kanallari yeniden olusturmaya CALISMAZ (kullanici tercihleri korunur)', () => {
        // Yalniz varsayilan ses → `muhafiz` + `muhafiz_acil`, ikisi de taban.
        MuhafizKanalServisi.hazirla(matrisOlustur(dortSeviye()));

        expect(mockGarantile).not.toHaveBeenCalled();
        // GC yine calisir; taban kanallar korunacak listede yer alir.
        expect(mockTemizle).toHaveBeenCalledWith(
            expect.arrayContaining(['muhafiz', 'muhafiz_acil'])
        );
    });

    it('ÖZEL sesli kanali sesin URI si ve ADIyla olusturur', () => {
        const seviyeler = dortSeviye();
        seviyeler[0].bildirimSesi = OZEL_SES;
        seviyeler[0].sesAdi = 'Hızır';

        MuhafizKanalServisi.hazirla(matrisOlustur(seviyeler));

        expect(mockGarantile).toHaveBeenCalledWith(
            muhafizKanalIdOlustur(OZEL_SES, false),
            expect.stringContaining('Hızır'),
            expect.any(String),
            OZEL_SES,
            false
        );
    });

    it('KANAL ENFLASYONU YOK: 20 hücre tek özel ses = tek çağrı', () => {
        MuhafizKanalServisi.hazirla(matrisOlustur(dortSeviye({ bildirimSesi: OZEL_SES })));

        // 5 vakit x 4 seviye ayni sesi kullaniyor; yalniz aciliyet ekseni ayirir.
        const olusturulanIdler = new Set(mockGarantile.mock.calls.map((c) => c[0]));
        expect(olusturulanIdler).toEqual(
            new Set([muhafizKanalIdOlustur(OZEL_SES, false), muhafizKanalIdOlustur(OZEL_SES, true)])
        );
    });

    it('GC: yalnız MATRİSTE REFERANS VERİLEN kanallar korunur', () => {
        const seviyeler = dortSeviye();
        seviyeler[0].bildirimSesi = OZEL_SES;

        MuhafizKanalServisi.hazirla(matrisOlustur(seviyeler));

        const korunacak: string[] = mockTemizle.mock.calls[0][0];
        expect(korunacak).toContain(muhafizKanalIdOlustur(OZEL_SES, false));
        // Kullanilmayan baska bir sesin kanali listede OLMAMALI → silinir.
        expect(korunacak).not.toContain(
            muhafizKanalIdOlustur('content://media/external/audio/media/999', false)
        );
    });

    it('Android dışında hiçbir native çağrı yapmaz', () => {
        (Platform as { OS: string }).OS = 'ios';

        MuhafizKanalServisi.hazirla(matrisOlustur(dortSeviye({ bildirimSesi: OZEL_SES })));

        expect(mockGarantile).not.toHaveBeenCalled();
        expect(mockTemizle).not.toHaveBeenCalled();
    });

    it('native çağrı patlarsa YUTAR — planlama kanal hazırlığı yüzünden durmamalı', () => {
        mockGarantile.mockImplementationOnce(() => {
            throw new Error('native yok');
        });

        expect(() =>
            MuhafizKanalServisi.hazirla(matrisOlustur(dortSeviye({ bildirimSesi: OZEL_SES })))
        ).not.toThrow();
    });
});
