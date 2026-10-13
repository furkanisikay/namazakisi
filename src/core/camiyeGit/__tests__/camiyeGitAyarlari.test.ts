import {
    camiyeGitAyarlariniNormalize,
    camiyeGitOncedenDk,
    HAZIRLIK_MAX_DK,
    VARSAYILAN_CAMIYE_GIT_AYARLARI,
    YURUME_MAX_DK,
    YURUME_MIN_DK,
} from '../camiyeGitAyarlari';

describe('camiyeGitAyarlariniNormalize', () => {
    it('nesne dışı/bozuk kayıt varsayılana (KAPALI) düşer, çökmez', () => {
        for (const ham of [null, undefined, 42, 'x', [], { aktif: 'evet' }]) {
            const a = camiyeGitAyarlariniNormalize(ham);
            expect(a.aktif).toBe(false);
            expect(a.vakitler).toEqual(VARSAYILAN_CAMIYE_GIT_AYARLARI.vakitler);
        }
    });

    it('varsayılan nesneyi PAYLAŞMAZ (mutasyon sızmasın)', () => {
        const a = camiyeGitAyarlariniNormalize(null);
        a.vakitler.ogle = false;
        expect(VARSAYILAN_CAMIYE_GIT_AYARLARI.vakitler.ogle).toBe(true);
    });

    it('sayılar sınıra çekilir, kesirli değer yuvarlanır', () => {
        const a = camiyeGitAyarlariniNormalize({ yurumeDk: 999, hazirlikDk: -5 });
        expect(a.yurumeDk).toBe(YURUME_MAX_DK);
        expect(a.hazirlikDk).toBe(0);
        expect(camiyeGitAyarlariniNormalize({ yurumeDk: 0 }).yurumeDk).toBe(YURUME_MIN_DK);
        expect(camiyeGitAyarlariniNormalize({ hazirlikDk: 999 }).hazirlikDk).toBe(HAZIRLIK_MAX_DK);
        expect(camiyeGitAyarlariniNormalize({ yurumeDk: 7.6 }).yurumeDk).toBe(8);
        expect(camiyeGitAyarlariniNormalize({ yurumeDk: NaN }).yurumeDk).toBe(VARSAYILAN_CAMIYE_GIT_AYARLARI.yurumeDk);
    });

    it('vakitler kısmi/bozuk gelirse eksikler varsayılandan tamamlanır', () => {
        const a = camiyeGitAyarlariniNormalize({ aktif: true, vakitler: { imsak: false, ogle: 'evet', gunes: true } });
        expect(a.vakitler).toEqual({ imsak: false, ogle: true, ikindi: true, aksam: true, yatsi: true });
        expect(a.vakitler).not.toHaveProperty('gunes');
    });

    it('elle düzeltilen süre kaynağıyla birlikte KORUNUR; cami adı yalnız tahminde taşınır', () => {
        expect(camiyeGitAyarlariniNormalize({ yurumeDk: 14, yurumeKaynagi: 'elle', camiAdi: 'X' })).toEqual({
            ...VARSAYILAN_CAMIYE_GIT_AYARLARI,
            yurumeDk: 14,
            yurumeKaynagi: 'elle',
        });
        expect(camiyeGitAyarlariniNormalize({ yurumeKaynagi: 'tahmin', camiAdi: 'Merkez Camii' }).camiAdi).toBe('Merkez Camii');
        expect(camiyeGitAyarlariniNormalize({ yurumeKaynagi: 'baska' }).yurumeKaynagi).toBe('varsayilan');
    });
});

describe('camiyeGitOncedenDk', () => {
    it('yürüme + hazırlık, en az 1', () => {
        expect(camiyeGitOncedenDk({ yurumeDk: 12, hazirlikDk: 5 })).toBe(17);
        expect(camiyeGitOncedenDk({ yurumeDk: 0, hazirlikDk: 0 })).toBe(1);
    });
});
