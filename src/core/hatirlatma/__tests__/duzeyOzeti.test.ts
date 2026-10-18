/**
 * Düzey özeti motorun gerçek planından ölçülür — elle yazılmış sayı yok.
 * Nöbetçi: preset değişirse (muhafizSlice) kullanıcıya görünen cümle de değişmeli.
 */
import { duzeyCumlesi, duzeyiOlc, duzeyKisaAciklamasi } from '../duzeyOzeti';
import { HATIRLATMA_PRESETLERI } from '../../../presentation/store/muhafizSlice';

describe('duzeyiOlc', () => {
    it('hazır düzeyleri motorla ölçer (hafif 4 / normal 6 / yoğun 7)', () => {
        expect(duzeyiOlc(HATIRLATMA_PRESETLERI.hafif.seviyeler)).toEqual({ ilkDk: 30, uyariSayisi: 4, sesliSayisi: 0, sesli: false });
        expect(duzeyiOlc(HATIRLATMA_PRESETLERI.normal.seviyeler)).toEqual({ ilkDk: 45, uyariSayisi: 6, sesliSayisi: 1, sesli: true });
        expect(duzeyiOlc(HATIRLATMA_PRESETLERI.yogun.seviyeler)).toEqual({ ilkDk: 60, uyariSayisi: 7, sesliSayisi: 2, sesli: true });
    });
});

describe('duzeyCumlesi', () => {
    it('ölçüden tek cümle üretir', () => {
        const olcu = duzeyiOlc(HATIRLATMA_PRESETLERI.normal.seviyeler);
        expect(duzeyCumlesi('normal', olcu)).toBe('Çıkmadan 45 dk önce başlar, 6 uyarı. Son dakikada sesli okur.');
        expect(duzeyCumlesi('hafif', duzeyiOlc(HATIRLATMA_PRESETLERI.hafif.seviyeler))).toContain('sessiz');
        expect(duzeyCumlesi('kapali', null)).toBe('Vakit çıkmadan hatırlatma gelmez.');
    });

    it('cümle 12 kelimeyi geçmez', () => {
        for (const y of ['hafif', 'normal', 'yogun'] as const) {
            const c = duzeyCumlesi(y, duzeyiOlc(HATIRLATMA_PRESETLERI[y].seviyeler));
            expect(c.trim().split(/\s+/).length).toBeLessThanOrEqual(12);
        }
    });

    it('kısa açıklama', () => {
        expect(duzeyKisaAciklamasi('yogun', duzeyiOlc(HATIRLATMA_PRESETLERI.yogun.seviyeler))).toBe('Vakit başına 7 uyarı, sesli');
        expect(duzeyKisaAciklamasi('kapali', null)).toBe('Hatırlatma yok');
    });
});
