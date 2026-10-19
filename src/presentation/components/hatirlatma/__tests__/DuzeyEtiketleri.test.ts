jest.mock('@expo/vector-icons/FontAwesome5', () => 'FontAwesome5');

import { duzeyEtiketleriniYerlestir } from '../DuzeyOnizlemesi';

describe('düzey önizlemesi — nokta etiketleri', () => {
    const adim = (kalanDk: number, sesli = false) => ({ kalanDk, sesli });

    test('her noktaya kısa etiket; ilki ekseni anlatır ("N dk önce")', () => {
        const e = duzeyEtiketleriniYerlestir([adim(25), adim(10), adim(3, true)], 320, 4, 25);
        expect(e.map((x) => x.metin)).toEqual(['25 dk önce', '10 dk', '3 dk']);
        expect(e[2].sesli).toBe(true);
    });

    test('binecek etiket atlanır; etiketler kart sınırında kalır', () => {
        const e = duzeyEtiketleriniYerlestir([adim(25), adim(24), adim(23), adim(3)], 320, 4, 25);
        expect(e.map((x) => x.kalanDk)).toEqual([25, 3]);
        for (const x of e) {
            expect(x.sol).toBeGreaterThanOrEqual(0);
            expect(x.sol + x.genislik).toBeLessThanOrEqual(320);
        }
    });

    test('ölçü yokken etiket yok', () => {
        expect(duzeyEtiketleriniYerlestir([adim(25)], 0, 4, 25)).toEqual([]);
    });
});
