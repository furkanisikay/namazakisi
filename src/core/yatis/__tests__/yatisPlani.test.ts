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
    yatsiOncesiTetikBilgisi,
    type FarzVakit,
    type VakitPenceresi,
    type YatisAyarlari,
} from '../yatisPlani';
import { muhafizPlanKimligiMi } from '../../muhafiz/erteleme';

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
        expect(i.baslik).toBe('🌙 Yatmadan önce yatsını kıl');
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
