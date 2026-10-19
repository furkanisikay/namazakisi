/**
 * Düzey özeti motorun gerçek planından ölçülür — elle yazılmış sayı yok.
 * Nöbetçi: preset değişirse (muhafizSlice) kullanıcıya görünen cümle de değişmeli.
 */
import { duzeyCumlesi, duzeyiOlc, duzeyKisaAciklamasi, duzeyOnizlemeAdimlari, sesliBilgiMetni } from '../duzeyOzeti';
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
        expect(duzeyCumlesi('hafif', duzeyiOlc(HATIRLATMA_PRESETLERI.hafif.seviyeler))).toBe('Çıkmadan 30 dk önce başlar, 4 uyarı. Sesli okuma yok.');
        expect(duzeyCumlesi('kapali', null)).toBe('Vakit çıkmadan hatırlatma gelmez.');
    });

    it('cümle 12 kelimeyi geçmez', () => {
        for (const y of ['hafif', 'normal', 'yogun'] as const) {
            const c = duzeyCumlesi(y, duzeyiOlc(HATIRLATMA_PRESETLERI[y].seviyeler));
            expect(c.trim().split(/\s+/).length).toBeLessThanOrEqual(12);
        }
    });

    it('NÖBETÇİ: sesli bilgi platforma göre doğru — Android DND der, iPhone "sessizde duyulur" DEMEZ', () => {
        expect(sesliBilgiMetni(true)).toMatch(/Rahatsız Etmeyin/);
        expect(sesliBilgiMetni(false)).toMatch(/sessizdeyken duyulmaz/);
        expect(sesliBilgiMetni(false)).not.toMatch(/sessiz modda.*de duyulur/);
        for (const m of [sesliBilgiMetni(true), sesliBilgiMetni(false)]) {
            expect(m.trim().split(/\s+/).length).toBeLessThanOrEqual(12);
        }
    });

    it('kısa açıklama', () => {
        expect(duzeyKisaAciklamasi('yogun', duzeyiOlc(HATIRLATMA_PRESETLERI.yogun.seviyeler))).toBe('Vakit başına 7 uyarı, sesli');
        expect(duzeyKisaAciklamasi('kapali', null)).toBe('Hatırlatma yok');
        // Rıza yoksa sesli adım bildirimle kurulur → "sesli" denmez (D9).
        expect(duzeyKisaAciklamasi('yogun', duzeyiOlc(HATIRLATMA_PRESETLERI.yogun.seviyeler), false)).toBe('Vakit başına 7 uyarı');
        expect(duzeyCumlesi('normal', duzeyiOlc(HATIRLATMA_PRESETLERI.normal.seviyeler), false)).toMatch(/Sesli okuma yok\.$/);
    });
});

describe('duzeyOnizlemeAdimlari', () => {
    it('ölçüyle AYNI planı verir (sayı, ilk eşik, sesli sayısı) ve kronolojiktir', () => {
        for (const y of ['hafif', 'normal', 'yogun'] as const) {
            const s = HATIRLATMA_PRESETLERI[y].seviyeler;
            const adimlar = duzeyOnizlemeAdimlari(s);
            const olcu = duzeyiOlc(s);
            expect(adimlar).toHaveLength(olcu.uyariSayisi);
            expect(adimlar[0].kalanDk).toBe(olcu.ilkDk);
            expect(adimlar.filter((a) => a.sesli)).toHaveLength(olcu.sesliSayisi);
            for (let i = 1; i < adimlar.length; i++) expect(adimlar[i].kalanDk).toBeLessThan(adimlar[i - 1].kalanDk);
        }
    });

    it('sesli izin yokken sesli nokta YOK, uyarı sayısı aynı (sesli hücre bildirime düşer)', () => {
        const s = HATIRLATMA_PRESETLERI.normal.seviyeler;
        const izinsiz = duzeyOnizlemeAdimlari(s, false);
        expect(izinsiz.some((a) => a.sesli)).toBe(false);
        expect(izinsiz).toHaveLength(duzeyOnizlemeAdimlari(s).length);
    });

    it('kapalı düzeyde nokta yok', () => {
        expect(duzeyOnizlemeAdimlari(null)).toEqual([]);
    });
});
