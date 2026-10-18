import { haftalikHedefHesapla } from '../haftalikHedef';

const hafta = (dizi: number[]) => dizi.map((tamamlananNamaz) => ({ tamamlananNamaz }));

describe('haftalikHedefHesapla — hedef tam gün eşiğinden türer (sabit 35 / %80 YOK)', () => {
    it('eşik 5 → hedef 35; eşiği geçen gün sayılır', () => {
        expect(haftalikHedefHesapla(hafta([5, 5, 4, 0, 5, 3, 5]), 5)).toEqual({
            kilinan: 27,
            namazHedefi: 35,
            esigiGecenGun: 4,
            esik: 5,
        });
    });

    it('eşik 3 → hedef 21; 3 kılınan gün eşiği geçer', () => {
        const h = haftalikHedefHesapla(hafta([3, 2, 5, 3, 0, 0, 1]), 3);
        expect(h.namazHedefi).toBe(21);
        expect(h.esigiGecenGun).toBe(3);
    });

    it('bozuk/eksik veri çökertmez; eşik 1..5 arasına kenetlenir', () => {
        expect(haftalikHedefHesapla(undefined, 4)).toEqual({ kilinan: 0, namazHedefi: 28, esigiGecenGun: 0, esik: 4 });
        expect(haftalikHedefHesapla(hafta([5]), 9).esik).toBe(5);
        expect(haftalikHedefHesapla(hafta([1]), 0).esik).toBe(1);
        expect(haftalikHedefHesapla(hafta([1]), Number.NaN).esik).toBe(5);
    });
});
