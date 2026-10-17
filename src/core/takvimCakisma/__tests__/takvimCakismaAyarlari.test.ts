import {
    TAKVIM_CAKISMA_ONCE_MAX_DK,
    TAKVIM_CAKISMA_ONCE_MIN_DK,
    TAKVIM_CAKISMA_TEKRAR_MIN_DK,
    VARSAYILAN_TAKVIM_CAKISMA_AYARLARI,
    takvimCakismaAyarlariniBirlestir,
    takvimCakismaAyarlariniNormalize,
} from '../takvimCakismaAyarlari';
import { ekAdim } from '../../hatirlatma/adimDizisi';

const RIZA = '2026-10-13T10:00:00.000Z';

describe('takvimCakismaAyarlariniNormalize', () => {
    it('varsayılan KAPALI, ad GİZLİ, tek adım 30 dk (türev oncedenDk)', () => {
        expect(VARSAYILAN_TAKVIM_CAKISMA_AYARLARI).toEqual({
            aktif: false,
            baslikGoster: false,
            adimlar: [ekAdim(30)],
            oncedenDk: 30,
        });
        expect(takvimCakismaAyarlariniNormalize(null)).toEqual(VARSAYILAN_TAKVIM_CAKISMA_AYARLARI);
        expect(takvimCakismaAyarlariniNormalize('bozuk')).toEqual(VARSAYILAN_TAKVIM_CAKISMA_AYARLARI);
    });

    it('RIZA UYDURULAMAZ: rıza kaydı olmayan "açık" ayar KAPALI okunur', () => {
        expect(takvimCakismaAyarlariniNormalize({ aktif: true }).aktif).toBe(false);
        expect(takvimCakismaAyarlariniNormalize({ aktif: true, rizaZamani: 'tarih değil' }).aktif).toBe(false);
        const r = takvimCakismaAyarlariniNormalize({ aktif: true, rizaZamani: RIZA });
        expect(r).toMatchObject({ aktif: true, rizaZamani: RIZA });
    });

    it('ESKİ süre sınırlara çekilir ve yuvarlanır; bozuk değer varsayılana düşer', () => {
        expect(takvimCakismaAyarlariniNormalize({ oncedenDk: 1 }).oncedenDk).toBe(TAKVIM_CAKISMA_ONCE_MIN_DK);
        expect(takvimCakismaAyarlariniNormalize({ oncedenDk: 9999 }).oncedenDk).toBe(TAKVIM_CAKISMA_ONCE_MAX_DK);
        expect(takvimCakismaAyarlariniNormalize({ oncedenDk: 44.6 }).oncedenDk).toBe(45);
        expect(takvimCakismaAyarlariniNormalize({ oncedenDk: 'x' }).oncedenDk).toBe(30);
    });

    it('baslikGoster yalnız açıkça true iken açık', () => {
        expect(takvimCakismaAyarlariniNormalize({ baslikGoster: 'true' }).baslikGoster).toBe(false);
        expect(takvimCakismaAyarlariniNormalize({ baslikGoster: true }).baslikGoster).toBe(true);
    });

    it('GÖÇ ŞEKLE BAKAR: adimlar yoksa eski oncedenDk tek adıma; idempotent', () => {
        const eski = { aktif: true, oncedenDk: 45, baslikGoster: true, rizaZamani: RIZA };
        const goc = takvimCakismaAyarlariniNormalize(eski);
        expect(goc.adimlar).toEqual([ekAdim(45)]);
        expect(goc.oncedenDk).toBe(45);
        expect(takvimCakismaAyarlariniNormalize(goc)).toEqual(goc);
        expect(takvimCakismaAyarlariniNormalize(JSON.parse(JSON.stringify(goc)))).toEqual(goc);
    });

    it('rızalar (sesli/alarm) göçle YAZILMAZ, yalnız açıkça true iken taşınır', () => {
        const goc = takvimCakismaAyarlariniNormalize({ aktif: true, oncedenDk: 30, rizaZamani: RIZA });
        expect(goc.sesliOnayi).toBeUndefined();
        expect(goc.alarmOnayi).toBeUndefined();
        const r = takvimCakismaAyarlariniNormalize({ ...goc, sesliOnayi: true, alarmOnayi: 'evet' });
        expect(r.sesliOnayi).toBe(true);
        expect(r.alarmOnayi).toBeUndefined();
    });

    it('adım kısıtları zorlanır: ton nazik, acil yok, tekrar alt sınırı, kronolojik, en fazla 3', () => {
        const r = takvimCakismaAyarlariniNormalize({
            adimlar: [
                { esikDk: 15, siklik: { herDk: 1 }, kademe: 'acil', acilKanal: true, kanallar: { bildirim: true } },
                { esikDk: 90, siklik: 'birkez', kanallar: { sesli: true } },
                { esikDk: 60, siklik: 'birkez', kanallar: { bildirim: true } },
                { esikDk: 30, siklik: 'birkez', kanallar: { bildirim: true } },
            ],
        });
        expect(r.adimlar.map((a) => a.esikDk)).toEqual([90, 60, 30]);
        expect(r.adimlar.every((a) => a.kademe === 'nazik' && a.acilKanal === false)).toBe(true);
        expect(r.oncedenDk).toBe(90);
        const t = takvimCakismaAyarlariniNormalize({ adimlar: [{ esikDk: 15, siklik: { herDk: 1 } }] });
        expect(t.adimlar[0].siklik).toEqual({ herDk: TAKVIM_CAKISMA_TEKRAR_MIN_DK });
    });
});

describe('takvimCakismaAyarlariniBirlestir', () => {
    const acik = takvimCakismaAyarlariniNormalize({
        aktif: true,
        rizaZamani: RIZA,
        sesliOnayi: true,
        alarmOnayi: true,
        adimlar: [ekAdim(60), ekAdim(20)],
    });

    it('kapatmak YALNIZ takvim rızasını siler; sesli/alarm rızası ayardır, kalır', () => {
        const kapali = takvimCakismaAyarlariniBirlestir(acik, { aktif: false });
        expect(kapali.aktif).toBe(false);
        expect(kapali.rizaZamani).toBeUndefined();
        expect(kapali.sesliOnayi).toBe(true);
        expect(kapali.alarmOnayi).toBe(true);
        expect(kapali.adimlar).toEqual(acik.adimlar);
    });

    it('eski alanla (oncedenDk) gelen değişiklik İLK adıma yazılır', () => {
        const r = takvimCakismaAyarlariniBirlestir(acik, { oncedenDk: 75 });
        expect(r.adimlar.map((a) => a.esikDk)).toEqual([75, 20]);
        expect(r.oncedenDk).toBe(75);
    });

    it('eski şekilli mevcut kayıt önce göçer', () => {
        const eski = { aktif: true, oncedenDk: 40, baslikGoster: false, rizaZamani: RIZA } as never;
        const r = takvimCakismaAyarlariniBirlestir(eski, { baslikGoster: true });
        expect(r.adimlar).toEqual([ekAdim(40)]);
        expect(r.baslikGoster).toBe(true);
        expect(r.aktif).toBe(true);
    });
});
