/**
 * Yatış hatırlatması + gün sonu muhasebesi planı (issue #290) — saf kurallar.
 */
import {
    FARZ_VAKITLER,
    MUHASEBE_KATEGORILERI,
    YATIS_VARSAYILAN_AYARLARI,
    YATIS_YATSI_GIRIS_PAYI_DK,
    namazGunuVakitleri,
    yatisIcerigiOlustur,
    yatisKimligiMi,
    yatisPlaniOlustur,
    yatisTetikAni,
    yatsiHatirlatmaTetigi,
    yatsiOncesiTetikBilgisi,
    otomatikKazaSatiri,
    type FarzVakit,
    type OtomatikKazaBilgisi,
    type VakitPenceresi,
    type YatisAyarlari,
} from '../yatisPlani';
import { muhafizPlanKimligiMi } from '../../muhafiz/erteleme';
import { yatisAyarlariniNormalize } from '../yatisAyarlari';
import { tarihiISOFormatinaCevir } from '../../utils/TarihYardimcisi';
import type { VakitAdi } from '../../types';

const ISTANBUL = { lat: 41.0082, lng: 28.9784 };
const AYAR: YatisAyarlari = { ...YATIS_VARSAYILAN_AYARLARI, aktif: true };

/** Sabit bir namaz günü: 13 Ekim 2026 (İstanbul'a yakın saatler). */
const t = (gun: number, saat: number, dk = 0) => new Date(2026, 9, gun, saat, dk);
const VAKITLER: Record<FarzVakit, VakitPenceresi> = {
    imsak: { giris: t(13, 5, 40), cikis: t(13, 7, 5) },
    ogle: { giris: t(13, 12, 56), cikis: t(13, 16, 2) },
    ikindi: { giris: t(13, 16, 2), cikis: t(13, 18, 35) },
    aksam: { giris: t(13, 18, 35), cikis: t(13, 19, 54) },
    yatsi: { giris: t(13, 19, 54), cikis: t(14, 5, 41) },
};
const TETIK = t(13, 22, 30).getTime();
const GUN = '2026-10-13';

describe('yatisTetikAni', () => {
    it('akşam saati: aynı takvim günü, yatıştan X dk önce', () => {
        expect(yatisTetikAni(t(13, 0), { saat: 23, dakika: 0, onceDk: 30 })).toEqual(t(13, 22, 30));
    });

    it('gece yarısından sonra yatan: ERTESİ takvim günü (namaz günü hâlâ aynı)', () => {
        expect(yatisTetikAni(t(13, 0), { saat: 0, dakika: 30, onceDk: 30 })).toEqual(t(14, 0, 0));
        expect(yatisTetikAni(t(13, 0), { saat: 1, dakika: 0, onceDk: 45 })).toEqual(t(14, 0, 15));
    });
});

describe('yatisIcerigiOlustur', () => {
    const icerik = (kilinan: FarzVakit[], ayar: Partial<YatisAyarlari> = {}, tetik = TETIK) =>
        yatisIcerigiOlustur(GUN, VAKITLER, kilinan, tetik, { ...AYAR, ...ayar });

    it('yatsı kılınmadıysa YATSI hatırlatması (sen + emir), muhafız uzayında, "Kıldım" yatsıyı işaretler', () => {
        const i = icerik(['imsak', 'ogle', 'ikindi', 'aksam'])!;
        expect(i.tur).toBe('yatsi');
        expect(i.kimlik).toBe('muhafiz_2026-10-13_vakit_yatsi_yatis');
        expect(i.baslik).toBe('Yatsı · yatmadan önce kıl 🌙');
        expect(i.govde).toBe('Yatsı vakti hâlâ sürüyor; uykuya dalmadan namaza dur.');
        expect(i.kategori).toBe('muhafiz_category');
        expect(i.data).toEqual({ tip: 'yatis', tarih: GUN, vakit: 'yatsi', kazayaEklenebilir: [] });
    });

    it('yatsı hatırlatmasına muhasebe satırı eklenir (başka eksik varsa)', () => {
        const i = icerik(['imsak', 'aksam'])!;
        expect(i.govde).toBe(
            'Yatsı vakti hâlâ sürüyor; uykuya dalmadan namaza dur.\nBugün 2/5 · öğle, ikindi işaretlenmemiş.'
        );
    });

    it('yatsı kılındı, TEK eksik (vakti çıkmış): "Bugün 4/5 · öğle işaretlenmemiş" + Kıldım/Kazaya ekle', () => {
        const i = icerik(['imsak', 'ikindi', 'aksam', 'yatsi'])!;
        expect(i.tur).toBe('muhasebeTek');
        expect(i.baslik).toBe('Bugün 4/5 · öğle işaretlenmemiş');
        expect(i.kimlik).toBe('muhafiz_2026-10-13_vakit_ogle_muhasebe');
        expect(i.kategori).toBe(MUHASEBE_KATEGORILERI.TEK);
        expect(i.data).toEqual({ tip: 'muhasebe', tarih: GUN, vakit: 'ogle', kazayaEklenebilir: ['ogle'] });
    });

    it('BİRDEN FAZLA eksik: yalnız uygulamayı açan "İnceleyin" (Kıldım hangi vakti işaretleyeceğini bilemez)', () => {
        const i = icerik(['imsak', 'yatsi'])!;
        expect(i.tur).toBe('muhasebeCoklu');
        expect(i.kimlik).toBe('muhasebe_2026-10-13');
        expect(i.kategori).toBe(MUHASEBE_KATEGORILERI.COKLU);
        expect(i.baslik).toBe('Bugün 2/5 · öğle, ikindi, akşam işaretlenmemiş');
        expect(i.data.vakit).toBeUndefined();
    });

    it('hepsi kılındıysa bildirim YOK', () => {
        expect(icerik([...FARZ_VAKITLER])).toBeNull();
    });

    it('yatsı hatırlatması kapalı, tek eksik yatsı: vakit sürüyor → yalnız Kıldım, KAZAYA EKLENEMEZ', () => {
        const i = icerik(['imsak', 'ogle', 'ikindi', 'aksam'], { yatsiHatirlatmasi: false })!;
        expect(i.tur).toBe('muhasebeTek');
        expect(i.kategori).toBe('muhafiz_category');
        expect(i.data.kazayaEklenebilir).toEqual([]);
    });

    it('muhasebe kapalı, yatsı kılınmış: bildirim YOK', () => {
        expect(icerik(['imsak', 'yatsi'], { muhasebe: false })).toBeNull();
    });

    it('henüz girmemiş vakit eksik SAYILMAZ (yatış yatsıdan önce)', () => {
        const i = icerik(['imsak', 'ogle', 'ikindi', 'aksam'], {}, t(13, 19, 30).getTime());
        expect(i).toBeNull();
    });

    it('FIKIH nöbetçisi: "secde" ve terk/küfür dili YOK', () => {
        for (const kilinan of [[], ['imsak'], ['imsak', 'ogle', 'ikindi', 'aksam']] as FarzVakit[][]) {
            const i = icerik(kilinan)!;
            expect(`${i.baslik} ${i.govde}`).not.toMatch(/secde|terk|küfür|kufur/i);
        }
    });

    it('vakte bağlı kimlikler muhafız PLANI değildir (plan temizliği silmez), servisin kendi kimliğidir', () => {
        for (const k of ['muhafiz_2026-10-13_vakit_yatsi_yatis', 'muhafiz_2026-10-13_vakit_ogle_muhasebe', 'muhasebe_2026-10-13']) {
            expect(muhafizPlanKimligiMi(k)).toBe(false);
            expect(yatisKimligiMi(k)).toBe(true);
        }
        expect(yatisKimligiMi('muhafiz_2026-10-13_vakit_ogle_seviye_1_dk_5')).toBe(false);
        expect(yatisKimligiMi('muhafiz_2026-10-13_vakit_ogle_ertele')).toBe(false);
    });
});

describe('Kaza Defteri 2.0 — otomatik ekleme satırı (ileriye dönük)', () => {
    const icerik = (kilinan: FarzVakit[], oto: OtomatikKazaBilgisi | null) =>
        yatisIcerigiOlustur(GUN, VAKITLER, kilinan, TETIK, AYAR, oto);

    it('otomatik kapalıysa muhasebe metni DEĞİŞMEZ', () => {
        expect(icerik(['imsak', 'ikindi', 'aksam', 'yatsi'], null)!.govde).toBe(
            'Kıldıysanız işaretleyin; kılamadıysanız kaza defterinize ekleyin.'
        );
    });

    it('açıkken "eklenecek" der, "eklendi" DEMEZ (tetik anında kayıt henüz yazılmamıştır)', () => {
        const oto = { baslangic: '2026-10-01', kayitsizSor: true };
        const tek = icerik(['imsak', 'ikindi', 'aksam', 'yatsi'], oto)!;
        expect(tek.govde).toBe('Kıldıysanız işaretleyin. İşaretlemezseniz namaz günü bitince kazaya eklenecek.');
        const coklu = icerik(['imsak', 'yatsi'], oto)!;
        expect(coklu.govde).toMatch(/kazaya eklenecek\.$/);
        for (const i of [tek, coklu]) expect(i.govde).not.toMatch(/eklendi/);
    });

    it('aralık öncesindeki gün için satır YOK', () => {
        const i = icerik(['imsak', 'ikindi', 'aksam', 'yatsi'], { baslangic: '2026-10-14', kayitsizSor: false })!;
        expect(i.govde).not.toMatch(/eklenecek/);
    });

    it('hiç işaretsiz gün "bana sorun" tercihinde YAZILMAZ → "size sorulacak" der', () => {
        expect(otomatikKazaSatiri(GUN, 0, { baslangic: '2026-10-01', kayitsizSor: true })).toBe(
            "İşaretlemezseniz bu gün Kaza Defteri'nde size sorulacak."
        );
        expect(otomatikKazaSatiri(GUN, 0, { baslangic: '2026-10-01', kayitsizSor: false })).toMatch(/kazaya eklenecek/);
    });
});

describe('yatisPlaniOlustur', () => {
    const simdi = t(13, 15, 0);

    it('Android ufku: 7 namaz günü, kronolojik, gelecek günler "0/5" ile kurulur', () => {
        const plan = yatisPlaniOlustur({ koordinat: ISTANBUL, ayarlar: AYAR, simdi, gunSayisi: 7 });
        expect(plan).toHaveLength(7);
        expect(plan.map((p) => p.gun)).toEqual([
            '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16', '2026-10-17', '2026-10-18', '2026-10-19',
        ]);
        expect(plan[0].zaman).toEqual(t(13, 22, 30));
        for (let i = 1; i < plan.length; i++) expect(plan[i].zaman.getTime()).toBeGreaterThan(plan[i - 1].zaman.getTime());
        expect(plan[1].govde).toContain('Bugün 0/5');
    });

    it('kılınmışlık o günün içeriğini belirler', () => {
        const plan = yatisPlaniOlustur({
            koordinat: ISTANBUL,
            ayarlar: AYAR,
            simdi,
            gunSayisi: 1,
            kilinanlar: (g) => (g === '2026-10-13' ? ['imsak', 'ikindi', 'aksam', 'yatsi'] : []),
        });
        expect(plan[0].tur).toBe('muhasebeTek');
        expect(plan[0].baslik).toBe('Bugün 4/5 · öğle işaretlenmemiş');
    });

    it('GECE YARISINDAN SONRA (imsak öncesi) bildirim DÜNÜN namaz gününe aittir', () => {
        const plan = yatisPlaniOlustur({
            koordinat: ISTANBUL,
            ayarlar: { ...AYAR, saat: 1, dakika: 0, onceDk: 30 },
            simdi: t(14, 0, 10),
            gunSayisi: 1,
        });
        expect(plan[0].gun).toBe('2026-10-13');
        expect(plan[0].zaman).toEqual(t(14, 0, 30));
        expect(plan[0].kimlik).toBe('muhafiz_2026-10-13_vakit_yatsi_yatis');
    });

    it('ÖZEL GÜN aralığındaki gün atlanır, ufuk kaymaz', () => {
        const plan = yatisPlaniOlustur({
            koordinat: ISTANBUL,
            ayarlar: AYAR,
            simdi,
            gunSayisi: 3,
            gunAtlanirMi: (g) => g === '2026-10-14',
        });
        expect(plan.map((p) => p.gun)).toEqual(['2026-10-13', '2026-10-15']);
    });

    it('kapalı / iki alt seçenek de kapalı / konum yok → plan BOŞ', () => {
        expect(yatisPlaniOlustur({ koordinat: ISTANBUL, ayarlar: { ...AYAR, aktif: false }, simdi, gunSayisi: 7 })).toEqual([]);
        expect(
            yatisPlaniOlustur({
                koordinat: ISTANBUL,
                ayarlar: { ...AYAR, yatsiHatirlatmasi: false, muhasebe: false },
                simdi,
                gunSayisi: 7,
            })
        ).toEqual([]);
        expect(yatisPlaniOlustur({ koordinat: { lat: 0, lng: 0 }, ayarlar: AYAR, simdi, gunSayisi: 7 })).toEqual([]);
        expect(yatisPlaniOlustur({ koordinat: null, ayarlar: AYAR, simdi, gunSayisi: 7 })).toEqual([]);
    });

    it('namazGunuVakitleri: yatsı ERTESİ imsakta biter', () => {
        const v = namazGunuVakitleri(ISTANBUL, t(13, 0));
        expect(v.yatsi.cikis.getDate()).toBe(14);
        expect(v.yatsi.giris.getTime()).toBe(v.aksam.cikis.getTime());
    });
});

/**
 * YAZ + ERKEN YATIŞ (Fable incelemesi M2): yazın İstanbul'da yatsı ~22:30'da
 * girer; 20:30'da yatan kullanıcının tetiği yatsıdan ÖNCE düşer. Eskiden o anda
 * yatsı "girmemiş" sayılıyordu → yatsı hatırlatması hiç tutmuyor, muhasebe de
 * yatsıyı saymıyordu ve ekran bunu söylemiyordu. Saatler o günün gerçek yatsı
 * girişinden türetilir (test saat dilimine bağlı kalmasın).
 */
describe('yatış yatsı girişinden ÖNCE (yaz fikstürü)', () => {
    const YAZ_GUNU = new Date(2026, 5, 21);
    const v = namazGunuVakitleri(ISTANBUL, YAZ_GUNU);
    // Yatış = yatsı girişinden 30 dk önce, 30 dk önce hatırlat → tetik yatsıdan 1 sa önce.
    const yatis = new Date(v.yatsi.giris.getTime() - 30 * 60_000);
    const ayar: YatisAyarlari = { ...AYAR, saat: yatis.getHours(), dakika: yatis.getMinutes(), onceDk: 30 };
    const simdi = new Date(2026, 5, 21, 12, 0);
    const plan = (a: Partial<YatisAyarlari> = {}, kilinan: FarzVakit[] = []) =>
        yatisPlaniOlustur({
            koordinat: ISTANBUL,
            ayarlar: { ...ayar, ...a },
            simdi,
            gunSayisi: 1,
            kilinanlar: () => kilinan,
        })[0];

    it('yatsı hatırlatması yatsı GİRDİKTEN sonra (giriş + pay) gelir ve yatsıyı hatırlatır', () => {
        const k = plan({}, ['imsak', 'ogle', 'ikindi', 'aksam']);
        expect(k.tur).toBe('yatsi');
        expect(k.zaman.getTime()).toBe(v.yatsi.giris.getTime() + YATIS_YATSI_GIRIS_PAYI_DK * 60_000);
        expect(k.zaman.getTime()).toBeLessThan(v.yatsi.cikis.getTime());
    });

    it('yatsı zaten kılınmışsa seçilen saat KORUNUR (muhasebe)', () => {
        const k = plan({}, ['imsak', 'ikindi', 'aksam', 'yatsi']);
        expect(k.zaman.getTime()).toBe(v.yatsi.giris.getTime() - 60 * 60_000);
        expect(k.tur).toBe('muhasebeTek');
    });

    it('yalnız muhasebe açıkken saat kaymaz; muhasebe yatsıyı saymaz (ekran söyler)', () => {
        const k = plan({ yatsiHatirlatmasi: false }, ['imsak', 'ogle', 'ikindi']);
        expect(k.zaman.getTime()).toBe(v.yatsi.giris.getTime() - 60 * 60_000);
        expect(k.baslik).toBe('Bugün 3/5 · akşam işaretlenmemiş');
    });

    it('REGRESYON: yalnız muhasebe + çok adım — ilk tetik içeriksizse sonraki (yatsı girdikten sonraki) tetik YİNE kurulur', () => {
        // Yatış yatsıdan 60 dk sonra; adımlar 120 dk önce (yatsı girmeden → eksik yok, içerik null)
        // ve 30 dk önce (yatsı girmiş → yatsı eksik). Eskiden ilk tetiğe bakıp günü atlıyordu.
        const gec = new Date(v.yatsi.giris.getTime() + 60 * 60_000);
        const ayarlar = yatisAyarlariniNormalize({
            ...ayar,
            saat: gec.getHours(),
            dakika: gec.getMinutes(),
            yatsiHatirlatmasi: false,
            muhasebe: true,
            adimlar: [
                { esikDk: 120, siklik: 'birkez', kanallar: { bildirim: true } },
                { esikDk: 30, siklik: 'birkez', kanallar: { bildirim: true } },
            ],
        } as Partial<YatisAyarlari>);
        const kayitlar = yatisPlaniOlustur({
            koordinat: ISTANBUL,
            ayarlar,
            simdi,
            gunSayisi: 1,
            kilinanlar: () => ['imsak', 'ogle', 'ikindi', 'aksam'],
        });
        expect(kayitlar).toHaveLength(1);
        // Kurulan tek tetik 30 dk'lık adımdır: yatsı girdikten SONRA (eksik = yatsı).
        expect(kayitlar[0].zaman.getTime()).toBeGreaterThan(v.yatsi.giris.getTime());
        expect(kayitlar[0].kalanDk).toBe(30);
        expect(kayitlar[0].tur).toBe('muhasebeTek');
    });

    it('ekran bilgisi: tetik yatsıdan önceyse yatsı girişini, değilse null döner', () => {
        expect(yatsiOncesiTetikBilgisi(ISTANBUL, ayar, simdi)).toEqual({ yatsiGiris: v.yatsi.giris });
        const gec = new Date(v.yatsi.giris.getTime() + 90 * 60_000);
        expect(
            yatsiOncesiTetikBilgisi(ISTANBUL, { saat: gec.getHours(), dakika: gec.getMinutes(), onceDk: 30 }, simdi)
        ).toBeNull();
        expect(yatsiOncesiTetikBilgisi(null, ayar, simdi)).toBeNull();
        expect(yatsiOncesiTetikBilgisi({ lat: 0, lng: 0 }, ayar, simdi)).toBeNull();
    });
});

/**
 * DONDURULMUŞ eski üretici (refactor öncesi, tek ofset `onceDk`). İçerik üretimi
 * (`yatisIcerigiOlustur`) ve kayma (`yatsiHatirlatmaTetigi`) değişmedi; değişen yalnız
 * tetiklerin kurulması → eski döngü burada aynen tutulur.
 */
function eskiYatisPlani(g: {
    koordinat: { lat: number; lng: number };
    ayarlar: Omit<YatisAyarlari, 'adimlar'>;
    simdi: Date;
    gunSayisi: number;
    kilinanlar?: (gun: string) => readonly VakitAdi[];
}) {
    const { ayarlar, simdi } = g;
    if (!ayarlar.aktif || (!ayarlar.yatsiHatirlatmasi && !ayarlar.muhasebe)) return [];
    const kilinanlar = g.kilinanlar ?? (() => []);
    const gunKaydir = (taban: Date, gun: number) => new Date(taban.getFullYear(), taban.getMonth(), taban.getDate() + gun);
    const bugun = gunKaydir(simdi, 0);
    const adaylar: Array<{ gun: string; gunTarih: Date; zaman: Date }> = [];
    for (let k = -1; k <= g.gunSayisi; k++) {
        const gunTarih = gunKaydir(bugun, k);
        const zaman = yatisTetikAni(gunTarih, ayarlar);
        if (zaman.getTime() <= simdi.getTime()) continue;
        adaylar.push({ gun: tarihiISOFormatinaCevir(gunTarih), gunTarih, zaman });
    }
    const plan: Array<{ kimlik: string; zaman: Date; kategori: string; baslik: string; govde: string; data: unknown }> = [];
    for (const a of adaylar.sort((x, y) => x.zaman.getTime() - y.zaman.getTime()).slice(0, g.gunSayisi)) {
        const vakitler = namazGunuVakitleri(g.koordinat, a.gunTarih);
        if (a.zaman.getTime() >= vakitler.yatsi.cikis.getTime()) continue;
        const kilinan = kilinanlar(a.gun);
        const zaman = yatsiHatirlatmaTetigi(a.zaman, vakitler, kilinan, ayarlar);
        const icerik = yatisIcerigiOlustur(a.gun, vakitler, kilinan, zaman.getTime(), ayarlar, null);
        if (icerik) {
            plan.push({ kimlik: icerik.kimlik, zaman, kategori: icerik.kategori, baslik: icerik.baslik, govde: icerik.govde, data: icerik.data });
        }
    }
    return plan;
}

describe('yatisPlaniOlustur — GÖÇ: eski kayıt BİREBİR aynı plan (dondurulmuş eski üretici)', () => {
    const KAYITLAR = [
        { aktif: true, saat: 23, dakika: 0, onceDk: 30, yatsiHatirlatmasi: true, muhasebe: true },
        { aktif: true, saat: 20, dakika: 30, onceDk: 30, yatsiHatirlatmasi: true, muhasebe: true },
        { aktif: true, saat: 0, dakika: 45, onceDk: 60, yatsiHatirlatmasi: true, muhasebe: false },
        { aktif: true, saat: 2, dakika: 55, onceDk: 120, yatsiHatirlatmasi: false, muhasebe: true },
    ];
    const KILINANLAR: ((gun: string) => readonly VakitAdi[])[] = [
        () => [],
        (gun) => (gun === GUN ? ['ogle', 'ikindi', 'aksam', 'yatsi'] : []),
        (gun) => (gun === GUN ? ['aksam', 'yatsi'] : ['imsak']),
    ];
    it.each(KAYITLAR)('%o', (kayit) => {
        for (const kilinanlar of KILINANLAR) {
            for (const simdi of [t(13, 9), t(13, 23, 50), new Date(2026, 5, 20, 1, 0), new Date(2026, 11, 31, 22, 0)]) {
                const eski = eskiYatisPlani({ koordinat: ISTANBUL, ayarlar: kayit, simdi, gunSayisi: 7, kilinanlar });
                const yeni = yatisPlaniOlustur({
                    koordinat: ISTANBUL,
                    ayarlar: yatisAyarlariniNormalize(kayit),
                    simdi,
                    gunSayisi: 7,
                    kilinanlar,
                }).map(({ kimlik, zaman, kategori, baslik, govde, data }) => ({ kimlik, zaman, kategori, baslik, govde, data }));
                expect(yeni).toEqual(eski);
            }
        }
    });
});

describe('yatisPlaniOlustur — adım dizisi (plan §5.3)', () => {
    const cokAdim = (ek: Partial<YatisAyarlari> = {}): YatisAyarlari =>
        yatisAyarlariniNormalize({
            ...AYAR,
            adimlar: [
                { esikDk: 60, siklik: { herDk: 20 }, kanallar: { bildirim: true, sesli: true } },
                { esikDk: 10, kanallar: { bildirim: true } },
            ],
            ...ek,
        });

    it('ilk tetik tarihsel kimlik, tekrarlar `_<kalanDk>`; günün TÜM tetikleri aynı içerik', () => {
        const plan = yatisPlaniOlustur({ koordinat: ISTANBUL, ayarlar: cokAdim(), simdi: t(13, 9), gunSayisi: 1 });
        expect(plan.map((k) => k.kimlik)).toEqual([
            'muhafiz_2026-10-13_vakit_yatsi_yatis',
            'muhafiz_2026-10-13_vakit_yatsi_yatis_40',
            'muhafiz_2026-10-13_vakit_yatsi_yatis_20',
            'muhafiz_2026-10-13_vakit_yatsi_yatis_10',
        ]);
        expect(new Set(plan.map((k) => k.baslik)).size).toBe(1);
        expect(plan.every((k) => yatisKimligiMi(k.kimlik) && !muhafizPlanKimligiMi(k.kimlik))).toBe(true);
        expect(plan[0].uyari.anonsMetni).toBe('Yatmadan önce yatsıyı kıl.');
        // Pencere sonu = namaz gününün sonu (ertesi imsak).
        expect(plan[0].cikis.getTime()).toBe(namazGunuVakitleri(ISTANBUL, t(13, 0)).yatsi.cikis.getTime());
    });

    it('KAYMA her tetiğe uygulanır; aynı ana düşenler TEK uyarıda birleşir', () => {
        // Saat diliminden bağımsız (CI UTC'de koşar): yatış saati 20:00–02:55'e sıkıştırıldığı
        // için yerel yatsı İstanbul'unkiyle aynı olmalı → boylam, makinenin UTC farkına göre
        // kaydırılır (İstanbul UTC+3). Yatış = yatsı + 25 dk → tetikler giriş −35/−15/+5/+15;
        // girişten öncekiler giriş + pay'a kayar ve TEK ana iner.
        const yerelFark = -t(13, 0).getTimezoneOffset() / 60;
        const koord = { lat: ISTANBUL.lat, lng: ISTANBUL.lng + (yerelFark - 3) * 15 };
        const giris = namazGunuVakitleri(koord, t(13, 0)).yatsi.giris;
        const yatis = new Date(Math.ceil(giris.getTime() / 60_000) * 60_000 + 25 * 60_000);
        const plan = yatisPlaniOlustur({
            koordinat: koord,
            ayarlar: cokAdim({ saat: yatis.getHours(), dakika: yatis.getMinutes() }),
            simdi: t(13, 9),
            gunSayisi: 1,
        });
        const zamanlar = plan.map((k) => k.zaman.getTime());
        expect(new Set(zamanlar).size).toBe(zamanlar.length);
        const yatsiGiris = giris.getTime();
        expect(Math.min(...zamanlar)).toBe(yatsiGiris + YATIS_YATSI_GIRIS_PAYI_DK * 60_000);
        expect(plan.length).toBeLessThan(4);
    });

    it('REGRESYON: kaymayla aynı ana düşen adımlarda GÜÇLÜ kanal (gerçek alarm) düşmez', () => {
        // Yatış 20:30 → 19:30 (yalnız bildirim) ve 19:50 (gerçek alarm); İstanbul Ekim yatsısı
        // ~19:54 → ikisi de aynı ana kayar. Eskiden ilki (bildirim) kalıyor, alarm kayboluyordu.
        const plan = yatisPlaniOlustur({
            koordinat: ISTANBUL,
            ayarlar: yatisAyarlariniNormalize({
                ...AYAR,
                saat: 20,
                dakika: 30,
                adimlar: [
                    { esikDk: 60, kanallar: { bildirim: true } },
                    { esikDk: 40, kanallar: { bildirim: true, alarm: true } },
                ],
            }),
            simdi: t(13, 9),
            gunSayisi: 1,
        });
        expect(plan).toHaveLength(1);
        expect(plan[0].kimlik).toBe('muhafiz_2026-10-13_vakit_yatsi_yatis');
        expect(plan[0].uyari.alarm).toBe(true);
        expect(plan[0].uyari.kanallar).toEqual({ bildirim: true, alarm: true });
    });

    it('muhasebe içeriği tekrarlarda da aynı; çoklu muhasebe kimliği `muhasebe_<gün>_<k>`', () => {
        const plan = yatisPlaniOlustur({
            koordinat: ISTANBUL,
            ayarlar: cokAdim(),
            simdi: t(13, 9),
            gunSayisi: 1,
            kilinanlar: () => ['aksam', 'yatsi'],
        });
        expect(plan.map((k) => k.kimlik)).toEqual([
            'muhasebe_2026-10-13',
            'muhasebe_2026-10-13_40',
            'muhasebe_2026-10-13_20',
            'muhasebe_2026-10-13_10',
        ]);
        expect(plan.every((k) => k.kategori === MUHASEBE_KATEGORILERI.COKLU)).toBe(true);
        expect(plan[0].uyari.anonsMetni).toBe('Bugün 3 vakit işaretlenmemiş görünüyor.');
    });

    it('Android alarm payı KRONOLOJİK keser', () => {
        const tam = yatisPlaniOlustur({ koordinat: ISTANBUL, ayarlar: cokAdim(), simdi: t(13, 9), gunSayisi: 7 });
        const kesik = yatisPlaniOlustur({ koordinat: ISTANBUL, ayarlar: cokAdim(), simdi: t(13, 9), gunSayisi: 7, alarmButcesi: 9 });
        expect(kesik.length).toBeGreaterThan(0);
        expect(kesik).toEqual(tam.slice(0, kesik.length));
        expect(kesik.length).toBeLessThan(tam.length);
    });

    it('anons metinleri: fıkıh/dil nöbetçisi (secde, terk, küfür yok)', () => {
        for (const kilinan of [[], ['yatsi'], ['aksam', 'yatsi'], ['imsak', 'ogle', 'ikindi', 'yatsi']] as VakitAdi[][]) {
            const icerik = yatisIcerigiOlustur(GUN, VAKITLER, kilinan, TETIK, AYAR);
            if (!icerik) continue;
            expect(icerik.anons.toLocaleLowerCase('tr-TR')).not.toMatch(/secde|terk|küfr/);
        }
    });
});
