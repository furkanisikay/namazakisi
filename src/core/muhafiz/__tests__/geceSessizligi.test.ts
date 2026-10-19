/**
 * Gece sessizliği — TEK kural (`geceSessizligiSusturuyorMu`) ve arka plan üreticisi
 * (`vakitTeslimAdaylari`, defter de buradan beslenir) üzerinden uçtan uca.
 * Saatler YEREL kurulur (kural da yerel saate bakar) → saat diliminden bağımsız.
 */
import {
    VARSAYILAN_GECE_SESSIZLIGI,
    geceBaslangicMs,
    geceBaslangicMetni,
    geceSessizligiSusturuyorMu,
    geceSessizliginiNormalize,
} from '../geceSessizligi';
import { muhafizTeslimPlaniOlustur, vakitTeslimAdaylari, type MuhafizVakitZamani } from '../muhafizTeslimPlani';
import { presetMatrisiOlustur } from '../matrisIslemleri';
import { HATIRLATMA_PRESETLERI } from '../../../presentation/store/muhafizSlice';
import { wearMuhafizPlaniOlustur } from '../../wear/wearMuhafizPlani';

const yerel = (g: number, s: number, d = 0) => new Date(2026, 5, g, s, d, 0, 0);
const ACIK = VARSAYILAN_GECE_SESSIZLIGI;

describe('geceSessizligiSusturuyorMu', () => {
    it('kapalı ya da alanı olmayan kayıt hiçbir şeyi susturmaz (mevcut kullanıcı göçle susmaz)', () => {
        expect(geceSessizligiSusturuyorMu(undefined, '2026-06-21', yerel(22, 3).getTime())).toBe(false);
        expect(geceSessizligiSusturuyorMu({ ...ACIK, aktif: false }, '2026-06-21', yerel(22, 3).getTime())).toBe(false);
    });

    it('namaz gününün 23:00’ünden itibaren susturur (gece yarısından sonrası dahil)', () => {
        expect(geceSessizligiSusturuyorMu(ACIK, '2026-06-21', yerel(21, 22, 59).getTime())).toBe(false);
        expect(geceSessizligiSusturuyorMu(ACIK, '2026-06-21', yerel(21, 23, 0).getTime())).toBe(true);
        expect(geceSessizligiSusturuyorMu(ACIK, '2026-06-21', yerel(22, 3, 21).getTime())).toBe(true);
    });

    it('ertesi sabahın uyarıları ertesi namaz gününe aittir → susmaz', () => {
        expect(geceSessizligiSusturuyorMu(ACIK, '2026-06-22', yerel(22, 4, 40).getTime())).toBe(false);
    });

    it('GERÇEK ALARM muaftır', () => {
        expect(geceSessizligiSusturuyorMu(ACIK, '2026-06-21', yerel(22, 3, 0).getTime(), true)).toBe(false);
    });

    it('öğleden önceki başlangıç gece yarısından SONRA demektir', () => {
        const a = { aktif: true, baslangicSaat: 0, baslangicDakika: 30 };
        expect(geceBaslangicMs('2026-06-21', a)).toBe(yerel(22, 0, 30).getTime());
        expect(geceSessizligiSusturuyorMu(a, '2026-06-21', yerel(21, 23, 50).getTime())).toBe(false);
        expect(geceBaslangicMetni(a)).toBe('00:30');
    });

    it('normalize: bozuk kayıt kapalı (undefined), eksik saat varsayılana düşer', () => {
        expect(geceSessizliginiNormalize(undefined)).toBeUndefined();
        expect(geceSessizliginiNormalize({ aktif: 'evet' })).toBeUndefined();
        expect(geceSessizliginiNormalize({ aktif: true, baslangicSaat: 99 })).toEqual(ACIK);
    });
});

describe('vakitTeslimAdaylari — gece sessizliği (arka plan + defter AYNI üretici)', () => {
    const yatsi: MuhafizVakitZamani = { vakit: 'yatsi', giris: yerel(21, 22, 38), cikis: yerel(22, 3, 24), tarih: '2026-06-21' };
    const simdi = yerel(21, 20, 0);
    const matris = presetMatrisiOlustur(HATIRLATMA_PRESETLERI.normal.seviyeler, true);

    it('çıkış yönlü yatsının gece uyarıları KURULMAZ', () => {
        expect(vakitTeslimAdaylari(matris, yatsi, simdi)).toHaveLength(3);
        expect(vakitTeslimAdaylari(matris, yatsi, simdi, undefined, ACIK)).toHaveLength(0);
    });

    it('gerçek alarm adımı sessizlikte de kurulur', () => {
        const alarmli = presetMatrisiOlustur(HATIRLATMA_PRESETLERI.normal.seviyeler, true);
        alarmli.yatsi.seviyeler[0] = { ...alarmli.yatsi.seviyeler[0], kanallar: { ...alarmli.yatsi.seviyeler[0].kanallar, alarm: true } };
        const adaylar = vakitTeslimAdaylari(alarmli, yatsi, simdi, undefined, ACIK);
        expect(adaylar).toHaveLength(1);
        expect(adaylar[0].uyari.alarm).toBe(true);
    });

    it('plan girdisinden de geçer (muhafizTeslimPlaniOlustur → defter)', () => {
        const plan = muhafizTeslimPlaniOlustur({ matris, vakitler: [yatsi], simdi, geceSessizligi: ACIK });
        expect(plan).toHaveLength(0);
    });
});

describe('saatin hazır planı (Wear) — telefonla AYNI kural', () => {
    it('gece penceresindeki yatsı kayıtları saate GİTMEZ', () => {
        const g = {
            koordinat: { lat: 41.01, lng: 28.97 },
            bugunIso: '2026-06-21',
            simdiMs: yerel(21, 12, 0).getTime(),
            aktif: true,
            matris: presetMatrisiOlustur(HATIRLATMA_PRESETLERI.normal.seviyeler, true),
            kilinanlar: {},
        };
        const yatsiSayisi = (plan: ReturnType<typeof wearMuhafizPlaniOlustur>) =>
            plan.flat().filter((k) => k.vakit === 'yatsi' && k.tarih === '2026-06-21').length;
        expect(yatsiSayisi(wearMuhafizPlaniOlustur(g))).toBe(3);
        expect(yatsiSayisi(wearMuhafizPlaniOlustur({ ...g, geceSessizligi: ACIK }))).toBe(0);
    });
});
