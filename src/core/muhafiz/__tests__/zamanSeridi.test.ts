import {
    cubukKonumlariniYay,
    kalanDkAni,
    saatMetni,
    seritCumlesiOlustur,
    seritDuzeniHesapla,
    simdiOrani,
} from '../zamanSeridi';
import { vakitUyariPlaniOlustur, type UyariPlani } from '../motorAdaptoru';
import { GIRIS_ZAMANLAMA_TABLOSU } from '../girisZamanlamasi';
import { SEVIYE_KADEMELERI, VARSAYILAN_SES } from '../matrisTipleri';
import type { Siklik, VakitMuhafizAyari } from '../matrisTipleri';
import type { PencereYonu } from '../pencereTipleri';

/** Kis yatsisi: 20:12 → 05:11 (539 dk). Asimetrik fikstur — olcu ≠ kalan. */
const BASLANGIC = new Date(2026, 0, 10, 20, 12);
const PENCERE_DK = 539;
const BITIS = new Date(BASLANGIC.getTime() + PENCERE_DK * 60000);

const vakit = (
    yon: PencereYonu,
    zamanlama: { esikDk: number; siklik: Siklik }[]
): VakitMuhafizAyari => ({
    yon,
    seviyeler: SEVIYE_KADEMELERI.map((kademe, i) => ({
        kademe,
        kanallar: { bildirim: true },
        esikDk: zamanlama[i].esikDk,
        siklik: zamanlama[i].siklik,
        bildirimSesi: VARSAYILAN_SES,
        anonsMetni: '',
    })),
});

/** Varsayilan "Dengeli" cikis zamanlamasi. */
const CIKIS = vakit('cikisaDogru', [
    { esikDk: 45, siklik: 'birkez' },
    { esikDk: 25, siklik: { herDk: 10 } },
    { esikDk: 10, siklik: { herDk: 5 } },
    { esikDk: 3, siklik: 'birkez' },
]);

const GIRIS = vakit(
    'girisindenItibaren',
    SEVIYE_KADEMELERI.map((k) => GIRIS_ZAMANLAMA_TABLOSU.uzun.normal[k])
);

const cikisPlani = () => vakitUyariPlaniOlustur(CIKIS, 24 * 60, { pencereUzunluguDk: PENCERE_DK });
const girisPlani = () => vakitUyariPlaniOlustur(GIRIS, 1, { pencereUzunluguDk: PENCERE_DK });

describe('seritDuzeniHesapla', () => {
    it('bos plan / gecersiz pencere → bos duzen', () => {
        expect(seritDuzeniHesapla([], PENCERE_DK).cubuklar).toHaveLength(0);
        expect(seritDuzeniHesapla(cikisPlani(), 0).bant).toBeNull();
    });

    it('her adim icin TEK cubuk, tekrarlar tik olur; toplam plan uzunluguna esit', () => {
        const plan = cikisPlani();
        const duzen = seritDuzeniHesapla(plan, PENCERE_DK);

        expect(duzen.cubuklar.map((c) => c.seviye)).toEqual([1, 2, 3, 4]);
        expect(duzen.cubuklar.length + duzen.tikler.length).toBe(plan.length);
        expect(duzen.uyariSayisi).toBe(plan.length);
    });

    /**
     * ASIL ANLATI: iki yon ayni dort adimi tasir, fark pencerenin NERESINE
     * dustukleridir. Konum `kalanDk`'dan gelir (yonden bagimsiz) — `olcuDk`
     * kullanilsaydi giris yonu aynalanir ve cubuklar yine saga yigilirdi.
     */
    it('CIKIS yonunde tum cubuklar pencerenin SON %10unda', () => {
        const duzen = seritDuzeniHesapla(cikisPlani(), PENCERE_DK);
        for (const c of duzen.cubuklar) expect(c.oran).toBeGreaterThan(0.9);
    });

    it('GIRIS yonunde ilk cubuk bastadir ve cubuklar ARTAN sirada ilerler', () => {
        const duzen = seritDuzeniHesapla(girisPlani(), PENCERE_DK);
        const oranlar = duzen.cubuklar.map((c) => c.oran);

        expect(oranlar[0]).toBeLessThan(0.05);
        expect([...oranlar].sort((a, b) => a - b)).toEqual(oranlar);
        expect(duzen.cubuklar.map((c) => c.seviye)).toEqual([1, 2, 3, 4]);
    });

    it('bant ilk uyaridan son uyariya uzanir', () => {
        const giris = seritDuzeniHesapla(girisPlani(), PENCERE_DK);
        const cikis = seritDuzeniHesapla(cikisPlani(), PENCERE_DK);

        expect(giris.bant!.son - giris.bant!.bas).toBeGreaterThan(0.7);
        expect(cikis.bant!.son - cikis.bant!.bas).toBeLessThan(0.1);
    });

    it('sonAdimTekrarli: tekrarli acilde true, tek atista false', () => {
        expect(seritDuzeniHesapla(girisPlani(), PENCERE_DK).sonAdimTekrarli).toBe(true);
        expect(seritDuzeniHesapla(cikisPlani(), PENCERE_DK).sonAdimTekrarli).toBe(false);
    });
});

describe('cubukKonumlariniYay', () => {
    const aralik = (px: number[]) => {
        const s = [...px].sort((a, b) => a - b);
        return Math.min(...s.slice(1).map((x, i) => x - s[i]));
    };

    it('cikis: ust uste binen cubuklar SOLA itilir, capaya en yakin yerinde kalir', () => {
        const oranlar = [0.99, 0.995, 0.998, 0.999];
        const px = cubukKonumlariniYay(oranlar, 300, 7, 'cikisaDogru');

        expect(aralik(px)).toBeGreaterThanOrEqual(7 - 1e-9);
        expect(px[3]).toBeCloseTo(0.999 * 300);
        for (const x of px) expect(x).toBeLessThanOrEqual(300);
    });

    it('giris: SAGA itilir, genislik asilmaz', () => {
        const px = cubukKonumlariniYay([0, 0.001, 0.002, 0.003], 300, 7, 'girisindenItibaren');

        expect(px[0]).toBeCloseTo(0);
        expect(aralik(px)).toBeGreaterThanOrEqual(7 - 1e-9);
    });

    it('zaten aralikli cubuklara dokunmaz', () => {
        expect(cubukKonumlariniYay([0.1, 0.5, 0.9], 100, 7, 'girisindenItibaren')).toEqual([10, 50, 90]);
    });
});

describe('saat yardimcilari', () => {
    it('saatMetni sifir doldurur', () => {
        expect(saatMetni(new Date(2026, 0, 1, 4, 7))).toBe('04:07');
    });

    it('kalanDkAni cikistan geri sayar', () => {
        expect(saatMetni(kalanDkAni(BITIS, 45))).toBe('04:26');
    });

    it('simdiOrani yalniz pencere icinde deger doner', () => {
        expect(simdiOrani(BASLANGIC, BITIS, new Date(BASLANGIC.getTime() - 1))).toBeNull();
        expect(simdiOrani(BASLANGIC, BITIS, BITIS)).toBeNull();
        expect(simdiOrani(BASLANGIC, BITIS, BASLANGIC)).toBe(0);
    });
});

describe('seritCumlesiOlustur', () => {
    const cumle = (plan: UyariPlani[], yon: PencereYonu, ek: Partial<Parameters<typeof seritCumlesiOlustur>[0]> = {}) =>
        seritCumlesiOlustur({
            duzen: seritDuzeniHesapla(plan, PENCERE_DK),
            yon,
            bitis: BITIS,
            tumAdimlarKapali: false,
            ...ek,
        });

    it('cikis: ilk ve son saat + sayi', () => {
        const plan = cikisPlani();
        expect(cumle(plan, 'cikisaDogru')).toBe(
            `Bugün ilk hatırlatma 04:26, sonuncusu 05:08 — toplam ${plan.length} uyarı.`
        );
    });

    it('giris + tekrarli son adim: "kılana kadar"', () => {
        const plan = girisPlani();
        expect(cumle(plan, 'girisindenItibaren')).toBe(
            `Vakit girince başlar: ilk hatırlatma 20:27, kılana kadar toplam ${plan.length} uyarı.`
        );
    });

    /** 'hafif' yogunlukta dort adim da tek atis — "kılana kadar" YALAN olurdu. */
    it('giris + tek atislar: son saat yazilir, "kılana kadar" DENMEZ', () => {
        const hafif = vakit(
            'girisindenItibaren',
            SEVIYE_KADEMELERI.map((k) => GIRIS_ZAMANLAMA_TABLOSU.uzun.hafif[k])
        );
        const plan = vakitUyariPlaniOlustur(hafif, 1, { pencereUzunluguDk: PENCERE_DK });
        const metin = cumle(plan, 'girisindenItibaren');

        expect(metin).not.toContain('kılana kadar');
        expect(metin).toContain('sonuncusu');
    });

    it('bos plan: kapali ile planlanmayani ayirt eder', () => {
        expect(cumle([], 'cikisaDogru', { tumAdimlarKapali: true })).toContain('Tüm adımlar kapalı');
        expect(cumle([], 'cikisaDogru')).toBe('Bugün bu vakitte hatırlatma planlanmıyor.');
    });

    /** Turkce hal eki tuzagi: saate "'de/'da" eklenmez (okunusa gore degisir). */
    it('saatlere HAL EKI eklenmez', () => {
        const metin = cumle(cikisPlani(), 'cikisaDogru');
        expect(metin).not.toMatch(/\d{2}:\d{2}'/);
    });

    it('vakit suruyorsa siradaki hatirlatma eklenir, sonrasi degil', () => {
        const simdi = new Date(kalanDkAni(BITIS, 30).getTime() + 1000); // 04:41:01
        const metin = cumle(cikisPlani(), 'cikisaDogru', { simdi, baslangic: BASLANGIC });
        expect(metin).toMatch(/Sıradaki: 04:46\.$/);
    });

    it('vakit disindayken siradaki eklenmez', () => {
        const simdi = new Date(BASLANGIC.getTime() - 60000);
        expect(cumle(cikisPlani(), 'cikisaDogru', { simdi, baslangic: BASLANGIC })).not.toContain('Sıradaki');
    });
});
