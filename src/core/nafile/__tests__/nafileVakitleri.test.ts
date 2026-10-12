/**
 * Nafile pencereleri (issue #77) — fıkıh sabitleri ve gece yarısı tabanı nöbetçileri.
 * Vakitler gerçek adhan'dan (İstanbul, iki mevsim) gelir; sabit "bugün" yazılmaz,
 * mevsim tarihleri yıl bağımsız sabit günlerdir.
 */
import { Coordinates, CalculationMethod, PrayerTimes, SunnahTimes } from 'adhan';
import {
    NAFILE_SABITLERI,
    gecininSonUcteBiri,
    nafileDurumunuBul,
    nafilePencereleriHesapla,
    teheccudHedefZamani,
} from '../nafileVakitleri';
import { gununNafilePencereleri, gunVakitleriniHesapla, koordinatGecerliMi } from '../gunVakitleri';

const ISTANBUL = { lat: 41.0082, lng: 28.9784 };
const DK = 60 * 1000;

describe.each([
    ['yaz', '2026-06-21', '2026-06-22'],
    ['kış', '2026-12-21', '2026-12-22'],
])('nafilePencereleriHesapla — %s', (_ad, gunIso, ertesiIso) => {
    const gun = gunVakitleriniHesapla(ISTANBUL, gunIso);
    const ertesi = gunVakitleriniHesapla(ISTANBUL, ertesiIso);
    const pencereler = nafilePencereleriHesapla(gun, ertesi.imsak);
    const bul = (tur: string) => pencereler.find((p) => p.tur === tur)!;

    it('üç pencere kronolojik sırada üretilir (işrak AYRI pencere değildir)', () => {
        expect(pencereler.map((p) => p.tur)).toEqual(['kusluk', 'evvabin', 'teheccud']);
    });

    it('kuşluk: güneş + 45 dk → öğle − 10 dk; sonu öğleden ÖNCE', () => {
        const k = bul('kusluk');
        expect(k.baslangic.getTime() - gun.gunes.getTime()).toBe(NAFILE_SABITLERI.SURUK_SONRASI_DK * DK);
        expect(gun.ogle.getTime() - k.bitis.getTime()).toBe(NAFILE_SABITLERI.ISTIVA_ONCESI_DK * DK);
        expect(k.bitis.getTime()).toBeLessThan(gun.ogle.getTime());
        expect(k.faziletli.getTime()).toBeGreaterThanOrEqual(k.baslangic.getTime());
        expect(k.faziletli.getTime()).toBeLessThanOrEqual(k.bitis.getTime());
    });

    it('evvâbîn: akşam → yatsı', () => {
        expect(bul('evvabin').baslangic).toEqual(gun.aksam);
        expect(bul('evvabin').bitis).toEqual(gun.yatsi);
    });

    it('teheccüd: yatsı → ERTESİ imsak; son üçte bir adhan SunnahTimes ile birebir', () => {
        const t = bul('teheccud');
        expect(t.baslangic).toEqual(gun.yatsi);
        expect(t.bitis).toEqual(ertesi.imsak);
        const pt = new PrayerTimes(
            new Coordinates(ISTANBUL.lat, ISTANBUL.lng),
            new Date(`${gunIso}T12:00:00`),
            CalculationMethod.Turkey()
        );
        const sunnah = new SunnahTimes(pt);
        // adhan dakikaya yuvarlar; bizim hesap ms hassasiyetinde → 1 dk tolerans.
        expect(Math.abs(t.faziletli.getTime() - sunnah.lastThirdOfTheNight.getTime())).toBeLessThanOrEqual(DK);
    });
});

describe('teheccudHedefZamani', () => {
    const p = {
        tur: 'teheccud' as const,
        baslangic: new Date(2026, 5, 21, 22, 0),
        bitis: new Date(2026, 5, 22, 3, 30),
        faziletli: new Date(2026, 5, 22, 1, 10),
    };
    it('sonUcteBir → faziletli an', () => {
        expect(teheccudHedefZamani(p, 'sonUcteBir', 60)).toEqual(p.faziletli);
    });
    it('imsaktanOnce → imsak − N dk', () => {
        expect(teheccudHedefZamani(p, 'imsaktanOnce', 60)).toEqual(new Date(2026, 5, 22, 2, 30));
    });
    it('kısa gecede yatsıdan önceye taşmaz (yatsıya kenetlenir)', () => {
        const kisa = { ...p, bitis: new Date(2026, 5, 21, 23, 0) };
        expect(teheccudHedefZamani(kisa, 'imsaktanOnce', 120)).toEqual(kisa.baslangic);
    });
});

describe('gecininSonUcteBiri', () => {
    it('akşam 18:00, imsak 06:00 → 02:00', () => {
        expect(gecininSonUcteBiri(new Date(2026, 0, 1, 18, 0), new Date(2026, 0, 2, 6, 0))).toEqual(
            new Date(2026, 0, 2, 2, 0)
        );
    });
});

describe('nafileDurumunuBul', () => {
    const pencereler = gununNafilePencereleri(ISTANBUL, '2026-06-21');
    const kusluk = pencereler[0];
    const teheccud = pencereler[2];
    const hedef = { hedef: 'sonUcteBir' as const, imsaktanOnceDk: 60 };

    it('kuşluk başlamadan → sıradaki kuşluk, an = başlangıç', () => {
        const d = nafileDurumunuBul(pencereler, new Date(kusluk.baslangic.getTime() - DK), hedef);
        expect(d).toEqual({ tur: 'kusluk', durum: 'sirada', an: kusluk.baslangic });
    });

    it('kuşluk içinde → aktif, an = pencere sonu', () => {
        const d = nafileDurumunuBul(pencereler, new Date(kusluk.baslangic.getTime() + DK), hedef);
        expect(d).toEqual({ tur: 'kusluk', durum: 'aktif', an: kusluk.bitis });
    });

    it('teheccüd yatsı girince DEĞİL, hedef an girince aktif olur (uyuyup kalkma şartı)', () => {
        const yatsidanSonra = new Date(teheccud.baslangic.getTime() + 5 * DK);
        expect(nafileDurumunuBul(pencereler, yatsidanSonra, hedef)).toEqual({
            tur: 'teheccud',
            durum: 'sirada',
            an: teheccud.faziletli,
        });
        const hedeftenSonra = new Date(teheccud.faziletli.getTime() + DK);
        expect(nafileDurumunuBul(pencereler, hedeftenSonra, hedef)?.durum).toBe('aktif');
    });

    it('GECE YARISI: aktif gün = dün iken taban DÜNÜN pencereleridir — gecenin ortasında teheccüd sıradadır', () => {
        // Saat dilimi bağımsız: yatsı ile ertesi imsakın ortası (İstanbul'da ~00:40).
        const dun = gununNafilePencereleri(ISTANBUL, '2026-06-21');
        const t = dun[2];
        const geceOrtasi = new Date((t.baslangic.getTime() + t.bitis.getTime()) / 2);
        expect(nafileDurumunuBul(dun, geceOrtasi, hedef)).toEqual({ tur: 'teheccud', durum: 'sirada', an: t.faziletli });
        // Aynı anda BUGÜNÜN pencereleriyle bakmak teheccüdü kaçırırdı (bugünün kuşluğunu gösterirdi).
        const bugun = gununNafilePencereleri(ISTANBUL, '2026-06-22');
        expect(nafileDurumunuBul(bugun, geceOrtasi, hedef)?.tur).toBe('kusluk');
    });

    it('imsaktan sonra (gün bitmiş) → null', () => {
        expect(nafileDurumunuBul(pencereler, new Date(teheccud.bitis.getTime() + DK), hedef)).toBeNull();
    });
});

describe('koordinatGecerliMi', () => {
    it('(0,0) "yapılandırılmadı" nöbetçisidir', () => {
        expect(koordinatGecerliMi({ lat: 0, lng: 0 })).toBe(false);
        expect(koordinatGecerliMi(null)).toBe(false);
        expect(koordinatGecerliMi(ISTANBUL)).toBe(true);
    });
});
