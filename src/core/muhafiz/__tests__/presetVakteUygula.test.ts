/**
 * Vakit başına düzey (persona çalışması 2026-10-19) — `presetVakteUygula` ve
 * düzeyin matristen TÜRETİLMESİ (`vakitPresetleUyumluMu`).
 */
import { presetMatrisiOlustur, presetUygula, presetVakteUygula, vakitPresetleUyumluMu } from '../matrisIslemleri';
import { esikSiralamasiGecerliMi } from '../aktifSeviye';
import { ESKI_PRESET_SEVIYELERI, HATIRLATMA_PRESETLERI } from '../../../presentation/store/muhafizSlice';
import { MUHAFIZ_VAKITLERI } from '../matrisTipleri';

const P = HATIRLATMA_PRESETLERI;

describe('presetVakteUygula', () => {
    it('presetUygula her vakti presetVakteUygula ile kurar (ikiz yazma yok)', () => {
        const m = presetMatrisiOlustur(ESKI_PRESET_SEVIYELERI.normal, false);
        const tum = presetUygula(m, P.yogun.seviyeler, true, 'yogun');
        for (const v of MUHAFIZ_VAKITLERI) {
            expect(tum[v]).toEqual(presetVakteUygula(m[v], v, P.yogun.seviyeler, true, 'yogun'));
        }
    });

    it('YÖNÜ KORUR ve giriş yönünde adım sayısı farklı preset de KESİN ARTAN sıra kurar', () => {
        const m = presetMatrisiOlustur(P.normal.seviyeler, false);
        const giris = { ...m.yatsi, yon: 'girisindenItibaren' as const };
        for (const y of ['hafif', 'normal', 'yogun'] as const) {
            const sonuc = presetVakteUygula(giris, 'yatsi', P[y].seviyeler, false, y);
            expect(sonuc.yon).toBe('girisindenItibaren');
            expect(sonuc.seviyeler).toHaveLength(P[y].seviyeler.length);
            expect(esikSiralamasiGecerliMi(sonuc.seviyeler, 'girisindenItibaren')).toBe(true);
        }
    });

    it('tek vakte uygulanır, diğer vakitlere dokunmaz', () => {
        const m = presetMatrisiOlustur(P.normal.seviyeler, false);
        const aksam = presetVakteUygula(m.aksam, 'aksam', P.hafif.seviyeler, false, 'hafif');
        expect(aksam.seviyeler).toHaveLength(1);
        expect(m.aksam.seviyeler).toHaveLength(3); // girdi değişmez (kopya)
    });
});

describe('vakitPresetleUyumluMu — düzey matristen türetilir', () => {
    it('yeni kurulan vakit kendi düzeyine uyar, başkasına uymaz', () => {
        const m = presetMatrisiOlustur(P.normal.seviyeler, false);
        expect(vakitPresetleUyumluMu(m.ogle, 'ogle', P.normal.seviyeler, 'normal')).toBe(true);
        expect(vakitPresetleUyumluMu(m.ogle, 'ogle', P.hafif.seviyeler, 'hafif')).toBe(false);
    });

    it('ESKİ (v1) normal matris yeni Normal SAYILMAZ (ekran "eski ayar" diyebilsin)', () => {
        const eski = presetMatrisiOlustur(ESKI_PRESET_SEVIYELERI.normal, true);
        expect(vakitPresetleUyumluMu(eski.ogle, 'ogle', P.normal.seviyeler, 'normal')).toBe(false);
    });

    it('kanal değişikliği uyumu bozmaz (yalnız zamanlama)', () => {
        const m = presetMatrisiOlustur(P.normal.seviyeler, false);
        const v = { ...m.ogle, seviyeler: m.ogle.seviyeler.map((s) => ({ ...s, kanallar: { bildirim: true } })) };
        expect(vakitPresetleUyumluMu(v, 'ogle', P.normal.seviyeler, 'normal')).toBe(true);
    });
});
