import { kildimDugmesiRenkleri, KOYU_METIN_ADAYI } from '../kildimDugmesiRenkleri';
import { kontrastOrani } from '../../utils/kontrastOrani';
import { ACIK_TEMA, KOYU_TEMA, RENK_PALETLERI } from '../../theme/temalar';

const AA = 4.5;

describe('kildimDugmesiRenkleri — vakit kartı düğmesi kontrastı (WCAG AA ≥ 4.5:1)', () => {
    for (const tema of [ACIK_TEMA, KOYU_TEMA]) {
        for (const palet of RENK_PALETLERI) {
            it(`NÖBETÇİ: ${tema.mod} tema × ${palet.ad} — üç zeminin hepsi AA`, () => {
                const g = {
                    birincil: palet.birincil,
                    basarili: tema.renkler.durum.basarili,
                    metinIkincil: tema.renkler.metinIkincil,
                    birincilMetin: '#FFFFFF',
                };
                const r = kildimDugmesiRenkleri(g);
                expect(kontrastOrani(g.birincil, r.isaretleMetin)).toBeGreaterThanOrEqual(AA);
                expect(kontrastOrani(g.basarili, r.kilindiMetin)).toBeGreaterThanOrEqual(AA);
                expect(kontrastOrani(g.metinIkincil, r.girmediMetin)).toBeGreaterThanOrEqual(AA);
            });
        }
    }

    it('yeşil zeminde beyaz YETMEZ (≈ 2.8:1) → koyu metin seçilir', () => {
        expect(kontrastOrani(ACIK_TEMA.renkler.durum.basarili, '#FFFFFF')).toBeLessThan(AA);
        const r = kildimDugmesiRenkleri({
            birincil: RENK_PALETLERI[0].birincil,
            basarili: ACIK_TEMA.renkler.durum.basarili,
            metinIkincil: ACIK_TEMA.renkler.metinIkincil,
            birincilMetin: '#FFFFFF',
        });
        expect(r.kilindiMetin).toBe(KOYU_METIN_ADAYI);
    });

    it('koyu zeminde (Gece) beyaz korunur', () => {
        const gece = RENK_PALETLERI.find((p) => p.id === 'gece')!;
        const r = kildimDugmesiRenkleri({
            birincil: gece.birincil,
            basarili: ACIK_TEMA.renkler.durum.basarili,
            metinIkincil: ACIK_TEMA.renkler.metinIkincil,
            birincilMetin: '#FFFFFF',
        });
        expect(r.isaretleMetin).toBe('#FFFFFF');
    });
});
