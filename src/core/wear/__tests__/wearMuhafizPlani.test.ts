/**
 * Saat için hazır muhafız planı (issue #280). Nöbetçiler:
 * - kimlik, zaman ve başlık TELEFONUN motoruyla birebir aynı (ikinci motor yok);
 * - gövde kimlikten DETERMİNİSTİK (Math.random'a dokunulmaz);
 * - kılınmış vakit / kapalı muhafız planı boşaltır;
 * - boyut sınırı vakit bütünlüğüyle ve SONDAN keser.
 */
import { muhafizMatrisiniCoz, vakitUyariPlaniOlustur } from '../../muhafiz/motorAdaptoru';
import { muhafizBildirimIdOlustur } from '../../muhafiz/anonsKimligi';
import { basligiOlustur } from '../../utils/muhafizMetinYardimcisi';
import { pencereUzunluguDkHesapla } from '../../muhafiz/pencereUzunlugu';
import type { MuhafizMatrisi } from '../../muhafiz/matrisTipleri';
import {
    WEAR_PLAN_UFKU_MS,
    pencereninKayitlari,
    utf8BaytUzunlugu,
    vakitPencereleriniOlustur,
    wearMuhafizPlaniOlustur,
} from '../wearMuhafizPlani';
import { kimliktenOran, muhafizGovdesiSec } from '../../muhafiz/muhafizGovdesi';
import { gunEkle } from '../../utils/TarihYardimcisi';

const ISTANBUL = { lat: 41.0082, lng: 28.9784 };
const BUGUN = '2026-10-12';

const varsayilanMatris = (): MuhafizMatrisi =>
    muhafizMatrisiniCoz({
        esikler: { seviye1: 45, seviye2: 25, seviye3: 10, seviye4: 3 },
        sikliklar: { seviye1: 15, seviye2: 10, seviye3: 5, seviye4: 1 },
    });

const pencereler = vakitPencereleriniOlustur(ISTANBUL, BUGUN, 3);
const bugunOgle = pencereler.find((p) => p.tarih === BUGUN && p.vakit === 'ogle')!;
/** Bugünün imsakından hemen önce: dünün yatsısı sürüyor. */
const IMSAK_ONCESI = pencereler.find((p) => p.tarih === BUGUN && p.vakit === 'imsak')!.giris.getTime() - 60_000;

describe('vakitPencereleriniOlustur', () => {
    it('dünden başlar, yatsı ertesi imsakta biter, pencereler kesintisiz ve kronolojik', () => {
        expect(pencereler[0]).toMatchObject({ vakit: 'imsak', tarih: gunEkle(BUGUN, -1) });
        expect(pencereler).toHaveLength(15);
        const yatsi = pencereler.find((p) => p.tarih === gunEkle(BUGUN, -1) && p.vakit === 'yatsi')!;
        const imsak = pencereler.find((p) => p.tarih === BUGUN && p.vakit === 'imsak')!;
        expect(yatsi.cikis.getTime()).toBe(imsak.giris.getTime());
        for (const p of pencereler) expect(p.cikis.getTime()).toBeGreaterThan(p.giris.getTime());
    });
});

describe('pencereninKayitlari — TELEFONLA PARİTE', () => {
    const matris = varsayilanMatris();
    const kayitlar = pencereninKayitlari(bugunOgle, matris);

    it('kimlik/zaman/başlık telefonun motoruyla birebir (varsayılan matris 45/25/10/3)', () => {
        const pencereDk = pencereUzunluguDkHesapla(bugunOgle.giris, bugunOgle.cikis);
        const plan = vakitUyariPlaniOlustur(matris.ogle, Number.MAX_SAFE_INTEGER, { pencereUzunluguDk: pencereDk });
        expect(kayitlar).toHaveLength(plan.length);
        plan.forEach((u, i) => {
            expect(kayitlar[i].id).toBe(muhafizBildirimIdOlustur('ogle', u.seviye, BUGUN, u.kalanDk));
            expect(kayitlar[i].ms).toBe(bugunOgle.cikis.getTime() - u.kalanDk * 60_000);
            expect(kayitlar[i].baslik).toBe(basligiOlustur('ogle', u.seviye, u.olcuDk));
        });
        // Adım sırası (issue #274): saatin "son adım" kararı bununla verilir.
        expect(kayitlar.map((k) => k.adim)).toEqual(plan.map((u) => u.adimIndeks));
        expect(kayitlar.map((k) => k.adim)).toEqual([0, 0, 1, 1, 2, 2, 3, 3, 3]);
        // Varsayılan matris: 45,30,25,15,10,5,3,2,1 (birebir eski plan)
        expect(kayitlar.map((k) => k.id.split('_dk_')[1])).toEqual(['45', '30', '25', '15', '10', '5', '3', '2', '1']);
    });

    it('ton: varsayılan kayıtta (acilKanal yok) seviye ≥3 acildir; titreşim kapalı', () => {
        expect(kayitlar.filter((k) => k.acil).map((k) => k.seviye)).toEqual([3, 3, 4, 4, 4]);
        expect(kayitlar.every((k) => !k.titresim)).toBe(true);
    });

    it('hücrenin titreşimi ve acilKanal:false tercihi taşınır', () => {
        const m = varsayilanMatris();
        m.ogle = {
            ...m.ogle,
            seviyeler: m.ogle.seviyeler.map((s) =>
                s.kademe === 'acil' ? { ...s, kanallar: { bildirim: true, titresim: true }, acilKanal: false } : s
            ),
        };
        const acilKayitlar = pencereninKayitlari(bugunOgle, m).filter((k) => k.seviye === 4);
        expect(acilKayitlar.length).toBeGreaterThan(0);
        expect(acilKayitlar.every((k) => k.titresim && !k.acil)).toBe(true);
    });

    it('gövde DETERMİNİSTİK: kimlikten seçilir, Math.random çağrılmaz', () => {
        const spy = jest.spyOn(Math, 'random');
        const a = pencereninKayitlari(bugunOgle, matris);
        const b = pencereninKayitlari(bugunOgle, matris);
        expect(spy).not.toHaveBeenCalled();
        spy.mockRestore();
        expect(a.map((k) => k.govde)).toEqual(b.map((k) => k.govde));
        for (const k of a) {
            expect(k.govde).toBe(muhafizGovdesiSec('ogle', k.seviye, 'cikisaDogru', () => kimliktenOran(k.id)));
            expect(k.govde.length).toBeGreaterThan(0);
        }
    });

    it('giriş yönlü vakitte giriş dili ve giriş ölçüsü kullanılır', () => {
        const m = varsayilanMatris();
        m.ogle = {
            ...m.ogle,
            yon: 'girisindenItibaren',
            seviyeler: m.ogle.seviyeler.map((s, i) => ({ ...s, esikDk: [5, 20, 40, 60][i], siklik: 'birkez' as const })),
        };
        const k = pencereninKayitlari(bugunOgle, m);
        expect(k.map((x) => x.ms)).toEqual(
            [5, 20, 40, 60].map((dk) => bugunOgle.giris.getTime() + dk * 60_000)
        );
        expect(k[0].baslik).toBe(basligiOlustur('ogle', 1, 5, 'girisindenItibaren'));
    });
});

describe('wearMuhafizPlaniOlustur', () => {
    const temel = {
        koordinat: ISTANBUL,
        bugunIso: BUGUN,
        aktif: true,
        matris: varsayilanMatris(),
        kilinanlar: {},
    };

    it('muhafız kapalıysa plan boş', () => {
        expect(wearMuhafizPlaniOlustur({ ...temel, aktif: false, simdiMs: IMSAK_ONCESI })).toEqual([]);
    });

    it('imsak öncesi: dünün yatsısı (dün tarihiyle) dahil, ufuk 48 sa', () => {
        const gruplar = wearMuhafizPlaniOlustur({ ...temel, simdiMs: IMSAK_ONCESI });
        const ilk = gruplar[0][0];
        expect(ilk.vakit).toBe('yatsi');
        expect(ilk.tarih).toBe(gunEkle(BUGUN, -1));
        // Dünün yatsısı + 2 günün 5 vakti (ufuk sonuna giren pencere dahil).
        const sonGiris = Math.max(...gruplar.map((g) => g[0].ms));
        expect(sonGiris).toBeLessThan(IMSAK_ONCESI + WEAR_PLAN_UFKU_MS);
        expect(gruplar.length).toBeGreaterThanOrEqual(10);
    });

    it('kılınmış vaktin penceresi planlanmaz', () => {
        const gruplar = wearMuhafizPlaniOlustur({
            ...temel,
            simdiMs: IMSAK_ONCESI,
            kilinanlar: { [gunEkle(BUGUN, -1)]: ['yatsi'], [BUGUN]: ['ogle'] },
        });
        const anahtarlar = gruplar.map((g) => `${g[0].tarih}_${g[0].vakit}`);
        expect(anahtarlar).not.toContain(`${gunEkle(BUGUN, -1)}_yatsi`);
        expect(anahtarlar).not.toContain(`${BUGUN}_ogle`);
        expect(anahtarlar).toContain(`${BUGUN}_ikindi`);
    });

    it('özel gün kapısı VAKTİN GÜNÜNE uygulanır: gece yarısı sonrası yatsı dünün günüdür (#272)', () => {
        const gruplar = wearMuhafizPlaniOlustur({
            ...temel,
            simdiMs: IMSAK_ONCESI,
            ozelGundeMi: (t) => t === gunEkle(BUGUN, -1),
        });
        const anahtarlar = gruplar.map((g) => `${g[0].tarih}_${g[0].vakit}`);
        expect(anahtarlar).not.toContain(`${gunEkle(BUGUN, -1)}_yatsi`);
        expect(anahtarlar[0]).toBe(`${BUGUN}_imsak`);
        expect(wearMuhafizPlaniOlustur({ ...temel, simdiMs: IMSAK_ONCESI, ozelGundeMi: () => true })).toEqual([]);
    });

    it('bitmiş vakit planlanmaz; süren vaktin geçmiş dakikaları kalır (içerik vakit bitene dek sabit)', () => {
        const simdi = bugunOgle.cikis.getTime() - 20 * 60_000;
        const gruplar = wearMuhafizPlaniOlustur({ ...temel, simdiMs: simdi });
        expect(gruplar[0][0]).toMatchObject({ vakit: 'ogle', tarih: BUGUN });
        expect(gruplar[0].some((k) => k.ms < simdi)).toBe(true);
        expect(gruplar.flat().some((k) => k.vakit === 'imsak' && k.tarih === BUGUN)).toBe(false);
    });
});

describe('utf8BaytUzunlugu', () => {
    it('ASCII 1, Türkçe 2, emoji 4 bayt', () => {
        expect(utf8BaytUzunlugu('abc')).toBe(3);
        expect(utf8BaytUzunlugu('ı')).toBe(2);
        expect(utf8BaytUzunlugu('🚨')).toBe(4);
        expect(utf8BaytUzunlugu('⏰')).toBe(3);
    });
});
