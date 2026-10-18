/**
 * TEK RIZA (sade tasarım, Dalga 3) — saf çekirdek.
 *
 * Sahip kararı: sesli okuma ve gerçek alarm onayı bir kez, tüm hatırlatmalar için.
 * Nöbetçi kurallar: (1) herhangi bir yüzeyde verilmiş onay genel onaydır; (2) hiçbir
 * yol olmayan onayı UYDURMAZ; (3) göç değişiklik yoksa aynı referansı döndürür ve
 * hiçbir onayı geri almaz.
 */
import { genelRizayiTuret, rizaEkle, rizaGocu, rizaKaydiniNormalize } from '../rizalar';

describe('rizaKaydiniNormalize', () => {
    it('yalnız gerçek `true` alanları taşır; bozuk kayıt = onay yok', () => {
        expect(rizaKaydiniNormalize(null)).toEqual({});
        expect(rizaKaydiniNormalize('evet')).toEqual({});
        expect(rizaKaydiniNormalize([true])).toEqual({});
        expect(rizaKaydiniNormalize({ sesliOnayi: 'true', alarmOnayi: 1 })).toEqual({});
        expect(rizaKaydiniNormalize({ sesliOnayi: true, alarmOnayi: false, baska: 1 })).toEqual({ sesliOnayi: true });
    });
});

describe('genelRizayiTuret', () => {
    it('hiçbir kayıtta onay yoksa genel onay YOK (uydurulmaz)', () => {
        expect(genelRizayiTuret({}, [{}, null, undefined, { sesliOnayi: false }])).toEqual({ sesli: false, alarm: false });
    });

    it('bir yüzeyde verilen onay hepsinde geçerlidir', () => {
        expect(genelRizayiTuret({}, [null, { sesliOnayi: true }])).toEqual({ sesli: true, alarm: false });
        expect(genelRizayiTuret(undefined, [{ alarmOnayi: true }])).toEqual({ sesli: false, alarm: true });
    });

    it('ortak kayıt tek başına yeter', () => {
        expect(genelRizayiTuret({ sesliOnayi: true, alarmOnayi: true })).toEqual({ sesli: true, alarm: true });
    });
});

describe('rizaGocu', () => {
    it('eski yüzey onayını ortak kayda taşır', () => {
        expect(rizaGocu({}, [{ sesliOnayi: true }, { alarmOnayi: true }])).toEqual({ sesliOnayi: true, alarmOnayi: true });
    });

    it('taşınacak bir şey yoksa AYNI referans (gereksiz yazım yok)', () => {
        const ortak = { sesliOnayi: true as const };
        expect(rizaGocu(ortak, [{ sesliOnayi: true }, null])).toBe(ortak);
        const bos = {};
        expect(rizaGocu(bos, [{}, { sesliOnayi: false }])).toBe(bos);
    });

    it('hiçbir onayı geri almaz (yüzeyde onay olmasa da ortak kalır)', () => {
        expect(rizaGocu({ alarmOnayi: true }, [{ sesliOnayi: true }])).toEqual({ alarmOnayi: true, sesliOnayi: true });
    });
});

describe('rizaEkle', () => {
    it('yalnız `true` alanları ekler, değişiklik yoksa aynı referans', () => {
        const ortak = {};
        expect(rizaEkle(ortak, {})).toBe(ortak);
        expect(rizaEkle(ortak, { sesliOnayi: false })).toBe(ortak);
        expect(rizaEkle(ortak, { alarmOnayi: true })).toEqual({ alarmOnayi: true });
        const dolu = { sesliOnayi: true as const };
        expect(rizaEkle(dolu, { sesliOnayi: true })).toBe(dolu);
    });
});
