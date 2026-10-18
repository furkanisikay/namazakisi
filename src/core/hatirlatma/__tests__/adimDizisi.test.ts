import {
    adimEkle,
    adimGuncelle,
    adimlariNormalize,
    adimYukuArtiyorMu,
    ekAdim,
    yeniEkAdimEsigi,
    type AdimKisitlari,
} from '../adimDizisi';

const CUMA_GIBI: AdimKisitlari = {
    maksAdim: 3,
    tekrarMinDk: 5,
    tekrarMaxDk: 60,
    esikMinDk: 15,
    esikMaxDk: 180,
    esikAdimDk: 15,
};

describe('adimDizisi — ortak ek hatırlatma adımları', () => {
    it('normalize: ton/aciliyet ZORLANIR, kullanıcı seçimleri (metin dahil) KORUNUR', () => {
        const [a] = adimlariNormalize(
            [{ kademe: 'acil', acilKanal: true, esikDk: 60, siklik: { herDk: 2 }, kanallar: { titresim: true, alarm: true }, bildirimSesi: 'content://x', sesAdi: 'Ezan', alarmKapsami: 'hepsi', anonsMetni: 'yaz' }],
            'cikisaDogru',
            60,
            CUMA_GIBI
        );
        expect(a.kademe).toBe('nazik');
        expect(a.acilKanal).toBe(false);
        // Sesli okuma metni artık KORUNUR (birleşik hatırlatma modülü §4.1).
        expect(a.anonsMetni).toBe('yaz');
        expect(a.siklik).toEqual({ herDk: 5 });
        // Titreşim/alarm tek başına konuşmaz → bildirim de açılır.
        expect(a.kanallar).toEqual({ bildirim: true, titresim: true, alarm: true });
        expect(a.bildirimSesi).toBe('content://x');
        expect(a.sesAdi).toBe('Ezan');
        expect(a.alarmKapsami).toBe('hepsi');
    });

    it('normalize: eşik sınırlara kenetlenir, tekil ve kronolojik, en fazla maksAdim', () => {
        const adimlar = adimlariNormalize(
            [ekAdim(5), ekAdim(400), ekAdim(60), ekAdim(60), ekAdim(90), ekAdim(120)],
            'cikisaDogru',
            60,
            CUMA_GIBI
        );
        expect(adimlar.map((a) => a.esikDk)).toEqual([180, 120, 90]);
    });

    it('boş/bozuk dizi yedek eşikle tek adıma düşer', () => {
        expect(adimlariNormalize('bozuk', 'cikisaDogru', 45, CUMA_GIBI).map((a) => a.esikDk)).toEqual([45]);
    });

    it('yeni adım eşik adımının katlarında, en erken adımdan bir adım ÖNCE', () => {
        expect(yeniEkAdimEsigi([ekAdim(60)], 'cikisaDogru', CUMA_GIBI)).toBe(75);
        // Tavanda: öbür yöne kayar.
        expect(yeniEkAdimEsigi([ekAdim(180)], 'cikisaDogru', CUMA_GIBI)).toBe(165);
        expect(adimEkle({ aktif: true, adimlar: [ekAdim(60)] }, 'cikisaDogru', CUMA_GIBI).adimlar.map((a) => a.esikDk)).toEqual([75, 60]);
    });

    it('maksAdim dolunca AYNI referans döner', () => {
        const ayar = { aktif: true, adimlar: [ekAdim(90), ekAdim(60), ekAdim(30)] };
        expect(adimEkle(ayar, 'cikisaDogru', CUMA_GIBI)).toBe(ayar);
    });

    it('güncelleme diziyi yeniden kronolojik sıralar', () => {
        const ayar = { aktif: true, adimlar: [ekAdim(90), ekAdim(60)] };
        const yeni = adimGuncelle(ayar, 1, { ...ekAdim(120) }, 'cikisaDogru', CUMA_GIBI);
        expect(yeni.adimlar.map((a) => a.esikDk)).toEqual([120, 90]);
    });

    describe('adimYukuArtiyorMu (ekleme kapısı)', () => {
        const temel = { aktif: true, adimlar: [ekAdim(60)] };
        it('açma, adım ekleme, sesli, tekrar ARTIŞTIR', () => {
            expect(adimYukuArtiyorMu({ ...temel, aktif: false }, temel)).toBe(true);
            expect(adimYukuArtiyorMu(temel, { ...temel, adimlar: [ekAdim(90), ekAdim(60)] })).toBe(true);
            expect(adimYukuArtiyorMu(temel, { ...temel, adimlar: [ekAdim(60, 'birkez', { bildirim: true, sesli: true })] })).toBe(true);
            expect(adimYukuArtiyorMu(temel, { ...temel, adimlar: [ekAdim(60, { herDk: 15 })] })).toBe(true);
        });
        it('kapalı adımı AÇMAK artıştır', () => {
            const kapali = { ...temel, adimlar: [ekAdim(60, 'birkez', {})] };
            expect(adimYukuArtiyorMu(kapali, temel)).toBe(true);
        });
        it('salt eşik değişimi ARTIŞ DEĞİLDİR', () => {
            expect(adimYukuArtiyorMu(temel, { ...temel, adimlar: [ekAdim(120)] })).toBe(false);
        });
    });
});
