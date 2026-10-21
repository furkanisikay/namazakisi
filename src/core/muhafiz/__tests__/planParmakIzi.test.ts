import {
    MUHAFIZ_PLAN_KAYDI_SURUMU,
    PLAN_KAYDI_AZAMI_YAS_MS,
    PLAN_TETIK_PAYI_MS,
    muhafizPlanKaydiniCoz,
    muhafizPlaniAtlanabilirMi,
    muhafizPlanParmakIzi,
    type MuhafizPlanKaydi,
    type MuhafizPlanParmakIziGirdisi,
    type PlanAtlamaGirdisi,
} from '../planParmakIzi';
import { kanonikJsonOlustur, kararliOzet } from '../../utils/kararliOzet';

const T0 = 1_800_000_000_000;

const girdi = (): MuhafizPlanParmakIziGirdisi => ({
    surum: '0.58.0',
    platform: 'android',
    aktif: true,
    matris: { ogle: { seviyeler: [{ esikDk: 45 }] }, aksam: { yon: 'cikisaDogru' } },
    vakitler: [
        { vakit: 'ogle', tarih: '2027-01-15', giris: new Date(T0), cikis: new Date(T0 + 3600_000) },
        { vakit: 'imsak', tarih: '2027-01-16', giris: new Date(T0 + 7200_000), cikis: new Date(T0 + 9000_000), yarininImsagi: true },
    ],
    kilinanlar: { '2027-01-15': ['imsak', 'ogle'] },
    ozelGunler: { '2027-01-15': false, '2027-01-16': false },
    saatAyarlari: { uyandirmaYeri: 'telefon' },
    geceSessizligi: { aktif: false },
    teslimBaglami: '{"cami":0}',
});

describe('kararliOzet', () => {
    it('nesne anahtar sırası özeti değiştirmez; undefined alan atlanır; Date ms olur', () => {
        expect(kararliOzet({ a: 1, b: { c: 2, d: 3 } })).toBe(kararliOzet({ b: { d: 3, c: 2 }, a: 1, x: undefined }));
        expect(kanonikJsonOlustur(new Date(5))).toBe('5');
    });

    it('farklı içerik farklı özet', () => {
        expect(kararliOzet({ a: 1 })).not.toBe(kararliOzet({ a: 2 }));
        expect(kararliOzet([1, 2])).not.toBe(kararliOzet([2, 1]));
    });
});

describe('muhafizPlanParmakIzi (denetim D-02)', () => {
    it('aynı girdi → aynı iz (nesne sırası ve kılınan sırası önemsiz)', () => {
        const a = girdi();
        const b = girdi();
        b.kilinanlar = { '2027-01-15': ['ogle', 'imsak', 'ogle'] };
        expect(muhafizPlanParmakIzi(a)).toBe(muhafizPlanParmakIzi(b));
    });

    it.each<[string, (g: MuhafizPlanParmakIziGirdisi) => void]>([
        ['sürüm', (g) => (g.surum = '0.59.0')],
        ['platform', (g) => (g.platform = 'ios')],
        ['aktif', (g) => (g.aktif = false)],
        ['matris eşiği', (g) => ((g.matris as { ogle: { seviyeler: { esikDk: number }[] } }).ogle.seviyeler[0].esikDk = 40)],
        ['vakit çıkışı 1 dk', (g) => (g.vakitler[0].cikis = new Date(T0 + 3660_000))],
        ['gün dönümü (vakit tarihi)', (g) => (g.vakitler[0].tarih = '2027-01-16')],
        ['vakit listesi (gece yarısı dalı)', (g) => (g.vakitler = g.vakitler.slice(1))],
        ['yarının imsağı bayrağı', (g) => delete g.vakitler[1].yarininImsagi],
        ['kılınan eklendi', (g) => (g.kilinanlar = { '2027-01-15': ['imsak', 'ogle', 'ikindi'] })],
        ['dünün kılınanı', (g) => (g.kilinanlar = { ...g.kilinanlar, '2027-01-14': ['yatsi'] })],
        ['özel gün', (g) => (g.ozelGunler = { ...g.ozelGunler, '2027-01-15': true })],
        ['saat iş bölümü', (g) => (g.saatAyarlari = { uyandirmaYeri: 'saat' })],
        ['gece sessizliği', (g) => (g.geceSessizligi = { aktif: true })],
        ['teslim bağlamı (camide)', (g) => (g.teslimBaglami = '{"cami":123}')],
    ])('%s değişince iz değişir', (_ad, degistir) => {
        const g = girdi();
        degistir(g);
        expect(muhafizPlanParmakIzi(g)).not.toBe(muhafizPlanParmakIzi(girdi()));
    });

    it('boş kılınan listesi yokmuş gibi sayılır (dün kaydı hiç yokken)', () => {
        const g = girdi();
        g.kilinanlar = { ...g.kilinanlar, '2027-01-14': [] };
        expect(muhafizPlanParmakIzi(g)).toBe(muhafizPlanParmakIzi(girdi()));
    });
});

const kayitKur = (ek: Partial<MuhafizPlanKaydi> = {}): MuhafizPlanKaydi => ({
    s: MUHAFIZ_PLAN_KAYDI_SURUMU,
    parmakIzi: 'iz',
    kurulumMs: T0,
    eksik: false,
    butceDoldu: false,
    ogeler: [
        { id: 'muhafiz_a', zamanMs: T0 + 60 * 60_000, bildirim: true },
        { id: 'muhafiz_b', zamanMs: T0 + 90 * 60_000, bildirim: true, anons: true },
        { id: 'muhafiz_c', zamanMs: T0 + 120 * 60_000, alarm: true },
    ],
    ...ek,
});

const atlama = (ek: Partial<PlanAtlamaGirdisi> = {}): PlanAtlamaGirdisi => ({
    kayit: kayitKur(),
    parmakIzi: 'iz',
    simdiMs: T0 + 15 * 60_000,
    kuruluKimlikler: ['muhafiz_a', 'muhafiz_b'],
    bekleyenAnonsSayisi: 3,
    bekleyenAlarmSayisi: 1,
    ...ek,
});

describe('muhafizPlaniAtlanabilirMi', () => {
    it('her şey yerindeyse atlar', () => {
        expect(muhafizPlaniAtlanabilirMi(atlama())).toEqual({ atla: true, neden: 'atla' });
    });

    it.each<[string, Partial<PlanAtlamaGirdisi>]>([
        ['kayitYok', { kayit: null }],
        ['eksikKayit', { kayit: kayitKur({ eksik: true }) }],
        ['butceDoldu', { kayit: kayitKur({ butceDoldu: true }) }],
        ['girdiDegisti', { parmakIzi: 'baska' }],
        ['saatGeriAlindi', { simdiMs: T0 - 1 }],
        ['yasAsti', { simdiMs: T0 + PLAN_KAYDI_AZAMI_YAS_MS }],
        ['bildirimEksik', { kuruluKimlikler: ['muhafiz_a'] }],
        ['yabanciKimlik', { kuruluKimlikler: ['muhafiz_a', 'muhafiz_b', 'muhafiz_x_ertele'] }],
        ['anonsEksik', { bekleyenAnonsSayisi: 0 }],
        ['anonsEksik', { bekleyenAnonsSayisi: null }],
        ['alarmEksik', { bekleyenAlarmSayisi: 0 }],
        ['alarmEksik', { bekleyenAlarmSayisi: null }],
    ])('%s → kurar', (neden, ek) => {
        expect(muhafizPlaniAtlanabilirMi(atlama(ek))).toEqual({ atla: false, neden });
    });

    it('çalmış (geçmiş) tetiğin listede olmaması kurulumu BOZUK saymaz', () => {
        const simdiMs = T0 + 61 * 60_000; // muhafiz_a geçti
        expect(muhafizPlaniAtlanabilirMi(atlama({ simdiMs, kuruluKimlikler: ['muhafiz_b'] })).atla).toBe(true);
    });

    it('tam şimdi çalan (pay içindeki) tetik eksik sayılmaz', () => {
        const simdiMs = T0 + 60 * 60_000 - PLAN_TETIK_PAYI_MS + 1;
        expect(muhafizPlaniAtlanabilirMi(atlama({ simdiMs, kuruluKimlikler: ['muhafiz_b'] })).atla).toBe(true);
    });

    it('geçmiş anons/alarm beklenmez (sayı düşmüş olabilir)', () => {
        const simdiMs = T0 + 121 * 60_000;
        expect(
            muhafizPlaniAtlanabilirMi(atlama({ simdiMs, kuruluKimlikler: [], bekleyenAnonsSayisi: 0, bekleyenAlarmSayisi: 0 })).atla
        ).toBe(true);
    });

    it('boş plan kaydı + boş kurulum → atlar', () => {
        expect(
            muhafizPlaniAtlanabilirMi(atlama({ kayit: kayitKur({ ogeler: [] }), kuruluKimlikler: [], bekleyenAnonsSayisi: null })).atla
        ).toBe(true);
    });
});

describe('muhafizPlanKaydiniCoz', () => {
    it('geçerli kaydı okur', () => {
        expect(muhafizPlanKaydiniCoz(JSON.stringify(kayitKur()))).toEqual(kayitKur());
    });

    it.each([
        ['null', null],
        ['bozuk JSON', '{x'],
        ['JSON null', 'null'],
        ['sayı', '42'],
        ['eski sürüm', JSON.stringify({ ...kayitKur(), s: 0 })],
        ['öğe bozuk', JSON.stringify({ ...kayitKur(), ogeler: [{ id: 1 }] })],
        ['alan eksik', JSON.stringify({ ...kayitKur(), eksik: undefined })],
    ])('%s → null', (_ad, ham) => {
        expect(muhafizPlanKaydiniCoz(ham as string | null)).toBeNull();
    });
});
