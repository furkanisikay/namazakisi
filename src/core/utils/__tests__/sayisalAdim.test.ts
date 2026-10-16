import {
    ADIM_BUYUTME_CARPANI,
    ADIM_BUYUTME_ESIGI,
    TEKRAR_EN_KISA_ARALIK_MS,
    TEKRAR_ILK_ARALIK_MS,
    sinirdaMi,
    sonrakiAdimDegeri,
    tekrarAdimCarpani,
    tekrarAraligiMs,
} from '../sayisalAdim';

describe('sonrakiAdimDegeri — ızgaraya oturma', () => {
    it.each([
        // [deger, adim, yon, min, max, beklenen]
        [1, 5, 1, 1, 60, 5], // sahadaki hata: 1 → 6 değil 5
        [5, 5, 1, 1, 60, 10],
        [3, 5, 1, 1, 9, 5], // muhafız varsayılan 3 dk
        [3, 5, -1, 1, 9, 1],
        [5, 5, -1, 1, 60, 1],
        [16, 5, -1, 1, 60, 15],
        [15, 5, -1, 1, 60, 10],
        [5, 2, 1, 0, 10, 6],
        [9, 5, 1, 0, 10, 10], // max'a kelepçe
        [1, 5, -1, 0, 10, 0], // min'e kelepçe
        [7, 1, 1, 0, 10, 8],
        [7, 1, -1, 0, 10, 6],
    ] as const)('%p adim %p yön %p [%p,%p] → %p', (deger, adim, yon, min, max, beklenen) => {
        expect(sonrakiAdimDegeri(deger, adim, yon, min, max)).toBe(beklenen);
    });

    it('1 dk\'dan 5\'lik adımla tekrar 15\'e ulaşılır (iç test senaryosu)', () => {
        let d = 1;
        for (let i = 0; i < 3; i++) d = sonrakiAdimDegeri(d, 5, 1, 1, 60);
        expect(d).toBe(15);
    });

    it('geçersiz adım 1 sayılır', () => {
        expect(sonrakiAdimDegeri(4, 0, 1, 0, 10)).toBe(5);
        expect(sonrakiAdimDegeri(4, Number.NaN, -1, 0, 10)).toBe(3);
    });

    it('sınırın dışındaki değer de aralığa çekilir', () => {
        expect(sonrakiAdimDegeri(100, 5, -1, 0, 60)).toBe(60);
    });
});

describe('basılı tutma hızlanması', () => {
    it('aralık ilk değerden başlar, monoton kısalır ve alt sınırda durur', () => {
        expect(tekrarAraligiMs(0)).toBe(TEKRAR_ILK_ARALIK_MS);
        let onceki = Infinity;
        for (let n = 0; n < 50; n++) {
            const a = tekrarAraligiMs(n);
            expect(a).toBeLessThanOrEqual(onceki);
            expect(a).toBeGreaterThanOrEqual(TEKRAR_EN_KISA_ARALIK_MS);
            onceki = a;
        }
        expect(tekrarAraligiMs(100)).toBe(TEKRAR_EN_KISA_ARALIK_MS);
    });

    it('adım yalnız geniş aralıkta ve uzun tutuşta büyür', () => {
        expect(tekrarAdimCarpani(0, 1, 1, 365)).toBe(1);
        expect(tekrarAdimCarpani(ADIM_BUYUTME_ESIGI, 1, 1, 365)).toBe(ADIM_BUYUTME_CARPANI);
        // dar aralık (10–40 dk, adım 5) hiç büyümez
        expect(tekrarAdimCarpani(100, 5, 10, 40)).toBe(1);
    });

    it('büyütülen adım ızgarayı bozmaz', () => {
        const d = sonrakiAdimDegeri(7, 5 * ADIM_BUYUTME_CARPANI, 1, 0, 1000);
        expect(d % 5).toBe(0);
    });

    it('sinirdaMi yönü dikkate alır', () => {
        expect(sinirdaMi(10, 1, 0, 10)).toBe(true);
        expect(sinirdaMi(10, -1, 0, 10)).toBe(false);
        expect(sinirdaMi(0, -1, 0, 10)).toBe(true);
    });
});
