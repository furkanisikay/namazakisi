import {
    camiyeGitAyarlariniBirlestir,
    camiyeGitAyarlariniNormalize,
    camiyeGitOfsetiniUygula,
    camiyeGitOncedenDk,
    CAMIYE_GIT_ESIK_MAX_DK,
    HAZIRLIK_MAX_DK,
    VARSAYILAN_CAMIYE_GIT_AYARLARI,
    YURUME_MAX_DK,
    YURUME_MIN_DK,
} from '../camiyeGitAyarlari';
import { ekAdim } from '../../hatirlatma/adimDizisi';

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
            // Göç: eski ofset (14 + 5) TEK adım.
            adimlar: [ekAdim(19)],
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

describe('GÖÇ (ortak model, plan §5.2) — şekle bakar, bayrağa değil', () => {
    it('adimlar yoksa eski ofsetten (yürüme + hazırlık) TEK adım, tek atış, yalnız bildirim', () => {
        const a = camiyeGitAyarlariniNormalize({ aktif: true, yurumeDk: 12, hazirlikDk: 5 });
        expect(a.adimlar).toEqual([ekAdim(17)]);
        expect(a.adimlar[0].kanallar).toEqual({ bildirim: true });
        expect(a.adimlar[0].siklik).toBe('birkez');
    });

    it('idempotent: göçmüş kayıt yeniden normalize edilince aynı kalır', () => {
        const bir = camiyeGitAyarlariniNormalize({ aktif: true, yurumeDk: 12, hazirlikDk: 5 });
        expect(camiyeGitAyarlariniNormalize(JSON.parse(JSON.stringify(bir)))).toEqual(bir);
    });

    it('kullanıcının seçtikleri (kanallar, ses, alarm kapsamı) KORUNUR; ton/aciliyet zorlanır', () => {
        const a = camiyeGitAyarlariniNormalize({
            aktif: true,
            adimlar: [
                {
                    ...ekAdim(30, { herDk: 10 }, { bildirim: true, sesli: true, alarm: true }),
                    kademe: 'acil',
                    acilKanal: true,
                    bildirimSesi: 'content://ses/1',
                    sesAdi: 'Ezan',
                    alarmKapsami: 'hepsi',
                },
            ],
        });
        const s = a.adimlar[0];
        expect(s.kanallar).toEqual({ bildirim: true, sesli: true, alarm: true });
        expect(s.bildirimSesi).toBe('content://ses/1');
        expect(s.sesAdi).toBe('Ezan');
        expect(s.alarmKapsami).toBe('hepsi');
        expect(s.kademe).toBe('nazik');
        expect(s.acilKanal).toBe(false);
    });

    it('rızalar yalnız açıkça true iken taşınır; göç UYDURMAZ', () => {
        expect(camiyeGitAyarlariniNormalize({ aktif: true }).sesliOnayi).toBeUndefined();
        expect(camiyeGitAyarlariniNormalize({ aktif: true }).alarmOnayi).toBeUndefined();
        const r = camiyeGitAyarlariniNormalize({ aktif: true, sesliOnayi: true, alarmOnayi: true });
        expect(r.sesliOnayi).toBe(true);
        expect(r.alarmOnayi).toBe(true);
    });

    it('en fazla 3 adım, eşik tekil, kronolojik (eşik azalan)', () => {
        const a = camiyeGitAyarlariniNormalize({
            aktif: true,
            adimlar: [ekAdim(10), ekAdim(40), ekAdim(10), ekAdim(25), ekAdim(5)],
        });
        expect(a.adimlar.map((s) => s.esikDk)).toEqual([40, 25, 10]);
    });
});

describe('camiyeGitOfsetiniUygula — yola çıkış süresi değişince TÜM dizi kayar', () => {
    it('aralıklar korunur', () => {
        const yeni = camiyeGitOfsetiniUygula([ekAdim(40), ekAdim(25), ekAdim(15)], 15, 20);
        expect(yeni.map((s) => s.esikDk)).toEqual([45, 30, 20]);
    });

    it('fark 0 → AYNI dizi', () => {
        const dizi = [ekAdim(15)];
        expect(camiyeGitOfsetiniUygula(dizi, 15, 15)).toBe(dizi);
    });

    it('tavana/tabana kenetlenir, çakışanlar ayrılır (adım kaybolmaz)', () => {
        const ust = camiyeGitOfsetiniUygula([ekAdim(178), ekAdim(176), ekAdim(170)], 100, 150);
        expect(ust.map((s) => s.esikDk)).toEqual([CAMIYE_GIT_ESIK_MAX_DK, 179, 178]);
        const alt = camiyeGitOfsetiniUygula([ekAdim(6), ekAdim(4), ekAdim(2)], 20, 5);
        expect(alt.map((s) => s.esikDk)).toEqual([3, 2, 1]);
    });
});

describe('camiyeGitAyarlariniBirlestir', () => {
    it('yürüme süresi değişince adımlar aynı farkla kayar', () => {
        const temel = camiyeGitAyarlariniNormalize({
            aktif: true,
            yurumeDk: 10,
            hazirlikDk: 5,
            adimlar: [ekAdim(30), ekAdim(15)],
        });
        const yeni = camiyeGitAyarlariniBirlestir(temel, { yurumeDk: 14, yurumeKaynagi: 'elle' });
        expect(yeni.adimlar.map((s) => s.esikDk)).toEqual([34, 19]);
        expect(yeni.yurumeKaynagi).toBe('elle');
    });

    it('aynı değişiklik adimlar taşıyorsa kaydırma YAPILMAZ', () => {
        const temel = camiyeGitAyarlariniNormalize({ aktif: true, yurumeDk: 10, hazirlikDk: 5 });
        const yeni = camiyeGitAyarlariniBirlestir(temel, { hazirlikDk: 10, adimlar: [ekAdim(50)] });
        expect(yeni.adimlar.map((s) => s.esikDk)).toEqual([50]);
    });

    it('vakitler kısmi birleşir; tahmin değilse cami adı düşer', () => {
        const temel = camiyeGitAyarlariniNormalize({ aktif: true, yurumeKaynagi: 'tahmin', camiAdi: 'X' });
        const yeni = camiyeGitAyarlariniBirlestir(temel, { vakitler: { imsak: false } as never, yurumeKaynagi: 'elle' });
        expect(yeni.vakitler).toEqual({ imsak: false, ogle: true, ikindi: true, aksam: true, yatsi: true });
        expect(yeni.camiAdi).toBeUndefined();
    });
});
