/**
 * Bildirim defteri özeti (issue #298): eşikler, platform sayımı, kaynak dökümü.
 * Plan üreticileriyle PARİTE `domain/services/__tests__/BildirimDefteriParite.test.ts`'te.
 */
import { bildirimDefteriOlustur, defterOzeti, type DefterKaydi } from '../bildirimDefteri';
import {
    ANDROID_DIGER_PAYI,
    ANDROID_MUHAFIZ_PAYI,
    ANDROID_TOPLAM_TAVANI,
    ANDROID_UYARI_ESIGI,
    IOS_BEKLEYEN_TAVANI,
} from '../butceSabitleri';
import { IOS_BEKLEYEN_TAVANI as IOS_ESKI_YOL } from '../../muhafiz/ios/bildirimButcesi';
import { ISTANBUL, matrisKur } from './defterFikstur';

const kayit = (kaynak: DefterKaydi['kaynak'], tur: DefterKaydi['tur'] = 'bildirim'): DefterKaydi => ({
    kaynak,
    zamanMs: 1,
    tur,
});
const n = (adet: number, kaynak: DefterKaydi['kaynak'] = 'muhafiz', tur: DefterKaydi['tur'] = 'bildirim') =>
    Array.from({ length: adet }, () => kayit(kaynak, tur));

describe('bütçe sabitleri — tek kaynak', () => {
    it('muhafız payı toplam havuzdan türer (480 − 120 = 360)', () => {
        expect(ANDROID_TOPLAM_TAVANI).toBe(480);
        expect(ANDROID_MUHAFIZ_PAYI).toBe(ANDROID_TOPLAM_TAVANI - ANDROID_DIGER_PAYI);
        expect(ANDROID_MUHAFIZ_PAYI).toBe(360);
    });

    it('iOS teslim katmanı aynı sabiti okur', () => {
        expect(IOS_ESKI_YOL).toBe(IOS_BEKLEYEN_TAVANI);
        expect(IOS_BEKLEYEN_TAVANI).toBe(64);
    });
});

describe('defterOzeti — iOS', () => {
    it('yalnız BİLDİRİMLER sayılır (alarm türü 64 sınırına girmez)', () => {
        const o = defterOzeti([...n(10), ...n(5, 'anons', 'alarm')], 'ios');
        expect(o.toplam).toBe(10);
        expect(o.kaynaklar).toEqual([{ kaynak: 'muhafiz', sayi: 10 }]);
    });

    it('eşikler: %85 altı normal, üstü yakın (turuncu), 64 üstü aşım (kırmızı)', () => {
        expect(defterOzeti(n(54, 'nafile'), 'ios').durum).toBe('normal');
        expect(defterOzeti(n(55, 'nafile'), 'ios').durum).toBe('yakin');
        expect(defterOzeti(n(64, 'nafile'), 'ios').durum).toBe('yakin');
        const asim = defterOzeti(n(84, 'nafile'), 'ios');
        expect(asim.durum).toBe('asim');
        expect(asim.gelmeyecek).toBe(20); // "en geç kurulan 20 bildirim gelmeyecek"
        expect(asim.oran).toBe(1);
    });

    it('muhafız teslimcinin slotunu (64 − diğer − güvenlik payı) aşarsa 64 altında da KESİLEN sayılır', () => {
        // 37 diğer + 25 muhafız = 62 < 64, ama teslimci muhafıza 64 − 37 − 4 = 23 slot bırakır.
        const o = defterOzeti([...n(37, 'nafile'), ...n(25)], 'ios');
        expect(o.toplam).toBe(62);
        expect(o.gelmeyecek).toBe(2);
        expect(o.durum).toBe('asim');
        // Slot içinde kalan muhafız kesilmez.
        expect(defterOzeti([...n(37, 'nafile'), ...n(23)], 'ios').gelmeyecek).toBe(0);
    });

    it('kart iOS\'ta daima görünür (hiç bildirim yoksa gizli)', () => {
        expect(defterOzeti(n(3), 'ios').kartGorunur).toBe(true);
        expect(defterOzeti([], 'ios').kartGorunur).toBe(false);
    });
});

describe('defterOzeti — Android', () => {
    it('havuz bildirim + alarmların TOPLAMIDIR', () => {
        const o = defterOzeti([...n(100), ...n(30, 'anons', 'alarm'), ...n(1, 'widget', 'alarm')], 'android');
        expect(o.toplam).toBe(131);
        expect(o.sinir).toBe(480);
    });

    it('uyarı YALNIZ 400+ (kart altında gizli)', () => {
        expect(defterOzeti(n(ANDROID_UYARI_ESIGI - 1, 'nafile'), 'android').kartGorunur).toBe(false);
        const yakin = defterOzeti(n(ANDROID_UYARI_ESIGI, 'nafile'), 'android');
        expect(yakin.kartGorunur).toBe(true);
        expect(yakin.durum).toBe('yakin');
        expect(defterOzeti(n(481, 'nafile'), 'android').gelmeyecek).toBe(1);
    });

    it('muhafız kendi payını (360) aşarsa toplam sınır altında olsa da kesilen sayılır', () => {
        const o = defterOzeti([...n(300), ...n(70, 'anons', 'alarm')], 'android');
        expect(o.toplam).toBe(370);
        expect(o.gelmeyecek).toBe(10);
        expect(o.durum).toBe('asim');
    });
});

describe('bildirimDefteriOlustur', () => {
    const simdi = new Date(2026, 9, 13, 9, 0, 0);

    it('kayıtlar KRONOLOJİK ve hepsi gelecekte', () => {
        const kayitlar = bildirimDefteriOlustur({
            platform: 'android',
            simdi,
            koordinat: ISTANBUL,
            muhafiz: { aktif: true, matris: matrisKur() },
            cuma: { aktif: true, oncedenDk: 60, siklik: 'birkez' },
        });
        expect(kayitlar.length).toBeGreaterThan(0);
        for (let i = 1; i < kayitlar.length; i++) expect(kayitlar[i].zamanMs).toBeGreaterThanOrEqual(kayitlar[i - 1].zamanMs);
        expect(kayitlar.every((k) => k.zamanMs > simdi.getTime())).toBe(true);
    });

    it('konum yoksa ({0,0}) vakte bağlı hiçbir kaynak sayılmaz (servislerle aynı)', () => {
        const kayitlar = bildirimDefteriOlustur({
            platform: 'ios',
            simdi,
            koordinat: { lat: 0, lng: 0 },
            muhafiz: { aktif: true, matris: matrisKur() },
            cuma: { aktif: true, oncedenDk: 60, siklik: 'birkez' },
        });
        expect(kayitlar).toEqual([]);
    });

    it('kılınmış vakit ve özel gün muhafızda sayılmaz', () => {
        const temel = { platform: 'ios' as const, simdi, koordinat: ISTANBUL, muhafiz: { aktif: true, matris: matrisKur() } };
        const hepsi = bildirimDefteriOlustur(temel).length;
        const bugun = '2026-10-13';
        const kilinmis = bildirimDefteriOlustur({ ...temel, kilinan: { [bugun]: ['ogle'] } }).length;
        expect(kilinmis).toBeLessThan(hepsi);
        expect(bildirimDefteriOlustur({ ...temel, ozelGundeMi: (iso) => iso === bugun })).toEqual([]);
    });

    it('iOS\'ta anons ALARMI ve widget yoktur; Android\'de vardır', () => {
        const g = { simdi, koordinat: ISTANBUL, muhafiz: { aktif: true, matris: matrisKur() } };
        const ios = bildirimDefteriOlustur({ ...g, platform: 'ios' });
        const android = bildirimDefteriOlustur({ ...g, platform: 'android' });
        expect(ios.some((k) => k.kaynak === 'anons' || k.kaynak === 'widget')).toBe(false);
        expect(android.some((k) => k.kaynak === 'anons')).toBe(true);
        expect(android.filter((k) => k.kaynak === 'widget')).toHaveLength(1);
    });

    it('muhafız kapalıysa muhafız sayılmaz', () => {
        expect(
            bildirimDefteriOlustur({ platform: 'ios', simdi, koordinat: ISTANBUL, muhafiz: { aktif: false, matris: matrisKur() } })
        ).toEqual([]);
    });
});
