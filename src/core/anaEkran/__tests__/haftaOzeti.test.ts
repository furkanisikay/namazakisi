import { haftaBasi, haftaOzetiHesapla } from '../haftaOzeti';

describe('haftaOzeti', () => {
    it('hafta Pazartesi başlar (Pazar günü bir önceki Pazartesi)', () => {
        expect(haftaBasi('2026-10-21')).toBe('2026-10-19'); // Çarşamba
        expect(haftaBasi('2026-10-19')).toBe('2026-10-19'); // Pazartesi
        expect(haftaBasi('2026-10-25')).toBe('2026-10-19'); // Pazar
    });

    it('oran yalnız geçmiş + bugün üzerinden; gelecek günler 0 ve paydada yok', () => {
        const o = haftaOzetiHesapla('2026-10-21', {
            '2026-10-19': 5,
            '2026-10-20': 3,
            '2026-10-21': 2,
            '2026-10-22': 5, // gelecek: sayılmaz
        });
        expect(o.gunler.map((g) => g.harf)).toEqual(['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz']);
        expect(o.kilinan).toBe(10);
        expect(o.toplam).toBe(15);
        expect(o.yuzde).toBe(67);
        expect(o.gunler[2].bugunMu).toBe(true);
        expect(o.gunler[3]).toMatchObject({ gelecekMi: true, kilinan: 0 });
    });

    it('bozuk sayı 0–5 aralığına kırpılır', () => {
        const o = haftaOzetiHesapla('2026-10-19', { '2026-10-19': 9 });
        expect(o.gunler[0].kilinan).toBe(5);
        expect(o.yuzde).toBe(100);
    });
});
