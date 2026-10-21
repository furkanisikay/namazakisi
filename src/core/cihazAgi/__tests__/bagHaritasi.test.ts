import { haritaYerlesimi, HARITA } from '../bagHaritasi';

describe('bağ haritası yerleşimi', () => {
    it('kartlar taşmaz, üst üste binmez; çizgiler telefonun altından kart üstüne iner', () => {
        for (const adet of [1, 2, 3]) {
            const y = haritaYerlesimi(358, adet);
            expect(y.dugumler).toHaveLength(adet);
            for (const d of y.dugumler) {
                expect(d.x).toBeGreaterThanOrEqual(0);
                expect(d.x + d.en).toBeLessThanOrEqual(358.01);
                expect(d.yol.startsWith(`M179 ${HARITA.ustBosluk + HARITA.telefon + HARITA.etiket}`)).toBe(true);
                expect(d.uzunluk).toBeGreaterThan(HARITA.cizgiBoy - 1);
            }
            for (let i = 0; i < y.dugumler.length; i++) {
                for (let j = i + 1; j < y.dugumler.length; j++) {
                    const a = y.dugumler[i];
                    const b = y.dugumler[j];
                    const ayri = a.x + a.en <= b.x || b.x + b.en <= a.x || a.y + a.boy <= b.y || b.y + b.boy <= a.y;
                    expect(ayri).toBe(true);
                }
            }
        }
    });

    it('3 düğümde alttaki kart ortada ve çizgisi oluktan dimdik iner', () => {
        const y = haritaYerlesimi(358, 3);
        expect(y.dugumler[2].x + y.dugumler[2].en / 2).toBeCloseTo(179);
        expect(y.dugumler[2].yol).toMatch(/^M179 \d+ L179 \d+/);
    });

    it('fazla düğüm istenirse 3 ile sınırlanır', () => {
        expect(haritaYerlesimi(358, 9).dugumler).toHaveLength(3);
    });
});
