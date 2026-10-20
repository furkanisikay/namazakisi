jest.mock('@expo/vector-icons/FontAwesome5', () => 'FontAwesome5');

import { duzeyEtiketleriniYerlestir } from '../DuzeyOnizlemesi';

describe('düzey önizlemesi — nokta etiketleri', () => {
    const adim = (kalanDk: number, sesli = false) => ({ kalanDk, sesli });

    test('her noktaya aynı biçimde kısa etiket ("N dk")', () => {
        const e = duzeyEtiketleriniYerlestir([adim(25), adim(10), adim(3, true)], 320, 4, 25);
        expect(e.map((x) => x.metin)).toEqual(['25 dk', '10 dk', '3 dk']);
        expect(e[2].sesli).toBe(true);
    });

    test('HİÇBİR etiket atlanmaz: binen etiket alt satıra kayar, aynı satırda çakışma yok', () => {
        const adimlar = [adim(25), adim(24), adim(23), adim(10), adim(3)];
        const e = duzeyEtiketleriniYerlestir(adimlar, 300, 4, 25);
        expect(e.map((x) => x.kalanDk)).toEqual([25, 24, 23, 10, 3]);
        expect(Math.max(...e.map((x) => x.satir))).toBeGreaterThan(0);
        for (const a of e) {
            expect(a.sol).toBeGreaterThanOrEqual(0);
            expect(a.sol + a.genislik).toBeLessThanOrEqual(300);
            for (const b of e) {
                if (a === b || a.satir !== b.satir) continue;
                const cakisir = a.sol < b.sol + b.genislik && b.sol < a.sol + a.genislik;
                expect(cakisir).toBe(false);
            }
        }
    });

    test('Normal düzeyin üç etiketi dar kartta da görünür (ortadaki "10 dk" dahil)', () => {
        const e = duzeyEtiketleriniYerlestir([adim(25), adim(10), adim(3, true)], 280, 4, 25);
        expect(e.map((x) => x.metin)).toEqual(['25 dk', '10 dk', '3 dk']);
    });

    test('ölçü yokken etiket yok', () => {
        expect(duzeyEtiketleriniYerlestir([adim(25)], 0, 4, 25)).toEqual([]);
    });
});
