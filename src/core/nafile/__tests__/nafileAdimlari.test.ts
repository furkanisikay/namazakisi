/**
 * Nafile adımları (issue #273) — göç, normalize, düzenleme ve bütçe kapısı.
 */
import {
    adimlariNormalize,
    gunduzNafileNormalize,
    nafileAdimEkle,
    nafileAdimGuncelle,
    nafileAdimi,
    nafileAdimSil,
    nafileKanalAyarlari,
    nafileYonunuDegistir,
    nafileYukuArtiyorMu,
    teheccudNormalize,
} from '../nafileAdimlari';
import {
    NAFILE_MAKS_ADIM,
    NAFILE_TEKRAR_MIN_DK,
    VARSAYILAN_NAFILE_AYARLARI,
    type NafileAyarlari,
    type NafileHatirlatmaAyari,
} from '../nafileTipleri';

const V = VARSAYILAN_NAFILE_AYARLARI;
const ac = (a: NafileHatirlatmaAyari): NafileHatirlatmaAyari => ({ ...a, aktif: true });

describe('göç (eski tek-ofsetli kayıt)', () => {
    it('gündüz ofseti → giriş yönlü tek adım, yalnız bildirim, tek atış', () => {
        const a = gunduzNafileNormalize({ aktif: true, ofsetDk: 35 }, V.hatirlatmalar.kusluk);
        expect(a).toEqual({ aktif: true, yon: 'girisindenItibaren', adimlar: [nafileAdimi(35)] });
    });

    it('teheccüd imsaktanOnce + uyandırma → yatsıdan, çıkış yönü, N ve N−3 dk', () => {
        const t = teheccudNormalize({ aktif: true, hedef: 'imsaktanOnce', imsaktanOnceDk: 45, uyandirma: true }, V.teheccud);
        expect(t.pencere).toBe('yatsi');
        expect(t.yon).toBe('cikisaDogru');
        expect(t.adimlar.map((a) => a.esikDk)).toEqual([45, 42]);
        expect(t.uyandirma).toBe(true);
    });

    it('teheccüd son üçte bir → giriş yönü, eşik 1 (motorun alt sınırı)', () => {
        const t = teheccudNormalize({ aktif: false, hedef: 'sonUcteBir', imsaktanOnceDk: 60, uyandirma: false }, V.teheccud);
        expect(t).toMatchObject({ pencere: 'sonUcteBir', yon: 'girisindenItibaren', aktif: false });
        expect(t.adimlar.map((a) => a.esikDk)).toEqual([1]);
    });

    it('göç sesli kanalı AÇMAZ (rıza uydurulamaz)', () => {
        const t = teheccudNormalize({ aktif: true, hedef: 'sonUcteBir', uyandirma: true }, V.teheccud);
        expect(t.adimlar.every((a) => a.kanallar.sesli !== true)).toBe(true);
    });
});

describe('adimlariNormalize', () => {
    it('kronolojik sıralar, tekilleştirir, en fazla 3 tutar, nafile kısıtlarını zorlar', () => {
        const ham = [
            { esikDk: 30, kanallar: { sesli: true }, siklik: { herDk: 2 }, kademe: 'acil', acilKanal: true, bildirimSesi: 'content://x' },
            { esikDk: 10 },
            { esikDk: 30 },
            { esikDk: 50 },
            { esikDk: 70 },
            { bozuk: true },
        ];
        const a = adimlariNormalize(ham, 'girisindenItibaren', 5);
        expect(a.map((x) => x.esikDk)).toEqual([10, 30, 50]);
        expect(a).toHaveLength(NAFILE_MAKS_ADIM);
        const sesli = a[1];
        expect(sesli.kademe).toBe('nazik');
        expect(sesli.acilKanal).toBe(false);
        expect(sesli.bildirimSesi).toBe('varsayilan');
        expect(sesli.siklik).toEqual({ herDk: NAFILE_TEKRAR_MIN_DK });
        expect(sesli.kanallar).toEqual({ sesli: true });
    });

    it('boş/bozuk → yedek eşikle tek adım; kanalsız adım bildirime düşer', () => {
        expect(adimlariNormalize(null, 'cikisaDogru', 7)).toEqual([nafileAdimi(7)]);
        expect(adimlariNormalize([{ esikDk: 9, kanallar: {} }], 'cikisaDogru', 7)[0].kanallar).toEqual({ bildirim: true });
    });
});

describe('düzenleme', () => {
    const kusluk = ac(V.hatirlatmalar.kusluk);

    it('adım ekle: en erkenin 15 dk öncesine (sığmazsa en yakın boş dakikaya), en fazla 3', () => {
        let a = nafileAdimEkle({ ...kusluk, adimlar: [nafileAdimi(40)] }, 200);
        expect(a.adimlar.map((x) => x.esikDk)).toEqual([25, 40]);
        a = nafileAdimEkle(a, 200);
        a = nafileAdimEkle(a, 200);
        expect(a.adimlar).toHaveLength(3);
        expect(nafileAdimEkle(a, 200)).toBe(a);
    });

    it('son adım silinmez; geçersiz indeks aynı referans', () => {
        expect(nafileAdimSil(kusluk, 0)).toBe(kusluk);
        const iki = { ...kusluk, adimlar: [nafileAdimi(5), nafileAdimi(25)] };
        expect(nafileAdimSil(iki, 0).adimlar.map((x) => x.esikDk)).toEqual([25]);
        expect(nafileAdimSil(iki, 5)).toBe(iki);
    });

    it('adım güncelleme kısıtları zorlar ve sırayı korur', () => {
        const iki = { ...kusluk, adimlar: [nafileAdimi(5), nafileAdimi(25)] };
        const yeni = nafileAdimGuncelle(iki, 1, { ...nafileAdimi(25), kademe: 'acil', acilKanal: true, siklik: { herDk: 3 } });
        expect(yeni.adimlar[1]).toMatchObject({ kademe: 'nazik', acilKanal: false, siklik: { herDk: 10 } });
    });

    it('yön değişimi eşik değerlerini korur, diziyi yeni yöne göre sıralar', () => {
        const iki = { ...kusluk, adimlar: [nafileAdimi(5), nafileAdimi(25)] };
        const cikis = nafileYonunuDegistir(iki, 'cikisaDogru');
        expect(cikis.yon).toBe('cikisaDogru');
        expect(cikis.adimlar.map((x) => x.esikDk)).toEqual([25, 5]);
        expect(nafileYonunuDegistir(cikis, 'cikisaDogru')).toBe(cikis);
    });
});

describe('nafileKanalAyarlari', () => {
    it('yalnız açık nafileler; uyandırmalı teheccüd ortak kanal istemez', () => {
        const a: NafileAyarlari = {
            ...V,
            hatirlatmalar: { kusluk: ac(V.hatirlatmalar.kusluk), evvabin: V.hatirlatmalar.evvabin },
            teheccud: { ...V.teheccud, aktif: true, uyandirma: true },
        };
        expect(nafileKanalAyarlari(a)).toEqual([{ yon: 'girisindenItibaren', seviyeler: V.hatirlatmalar.kusluk.adimlar }]);
    });
});

describe('nafileYukuArtiyorMu — bütçe kapısı yalnız YAPISAL artışta (Fable M4)', () => {
    const temel: NafileAyarlari = {
        ...V,
        hatirlatmalar: { kusluk: ac(V.hatirlatmalar.kusluk), evvabin: V.hatirlatmalar.evvabin },
        teheccud: { ...V.teheccud, aktif: true },
    };
    const kuslukla = (k: Partial<NafileHatirlatmaAyari>): NafileAyarlari => ({
        ...temel,
        hatirlatmalar: { ...temel.hatirlatmalar, kusluk: { ...temel.hatirlatmalar.kusluk, ...k } },
    });

    it.each([
        ['nafile açma', { ...temel, hatirlatmalar: { ...temel.hatirlatmalar, evvabin: ac(V.hatirlatmalar.evvabin) } }],
        ['adım ekleme', kuslukla({ adimlar: [nafileAdimi(5), nafileAdimi(30)] })],
        ['sesli kanal açma', kuslukla({ adimlar: [nafileAdimi(5, 'birkez', { bildirim: true, sesli: true })] })],
        ['tekrara geçme', kuslukla({ adimlar: [nafileAdimi(5, { herDk: 30 })] })],
        ['günü gününe kapatma', { ...temel, gunuGununeKur: false }],
    ])('ARTIRIR: %s', (_ad, yeni) => {
        const eski = _ad === 'günü gününe kapatma' ? { ...temel, gunuGununeKur: true } : temel;
        expect(nafileYukuArtiyorMu(eski, yeni as NafileAyarlari)).toBe(true);
    });

    it('tekrar aralığını kısaltma ARTIRIR, uzatma artırmaz', () => {
        const otuz = kuslukla({ adimlar: [nafileAdimi(5, { herDk: 30 })] });
        const on = kuslukla({ adimlar: [nafileAdimi(5, { herDk: 10 })] });
        expect(nafileYukuArtiyorMu(otuz, on)).toBe(true);
        expect(nafileYukuArtiyorMu(on, otuz)).toBe(false);
    });

    it.each([
        ['eşik değişimi', kuslukla({ adimlar: [nafileAdimi(45)] })],
        ['yön değişimi', kuslukla({ yon: 'cikisaDogru' })],
        ['teheccüd penceresi (tekrarsız)', { ...temel, teheccud: { ...temel.teheccud, pencere: 'yatsi' as const } }],
        ['uyandırma', { ...temel, teheccud: { ...temel.teheccud, uyandirma: true } }],
        ['kapatma', kuslukla({ aktif: false })],
    ])('ARTIRMAZ (salt zaman/azaltma): %s', (_ad, yeni) => {
        expect(nafileYukuArtiyorMu(temel, yeni as NafileAyarlari)).toBe(false);
    });

    it('tekrarlı adım varken teheccüd penceresini uzatmak ARTIRIR', () => {
        const tekrarli = { ...temel, teheccud: { ...temel.teheccud, adimlar: [nafileAdimi(5, { herDk: 20 })] } };
        const yatsidan = { ...tekrarli, teheccud: { ...tekrarli.teheccud, pencere: 'yatsi' as const } };
        expect(nafileYukuArtiyorMu(tekrarli, yatsidan)).toBe(true);
    });
});
