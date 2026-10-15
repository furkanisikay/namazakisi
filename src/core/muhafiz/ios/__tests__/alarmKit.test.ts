/**
 * iOS GERÇEK ALARM (AlarmKit, issue #74) — saf kurallar ve Swift ikiziyle ORTAK fikstür.
 *
 * Fikstür (`modules/expo-muhafiz-alarmkit/test/alarmkit-ornek.json`) bağımsız bir
 * üreteçle (Python) yazıldı; Swift `test/main.swift` aynı dosyayı doğrular.
 */
import * as fs from 'fs';
import * as path from 'path';
import {
    alarmKitDurumunuCoz,
    alarmKitErtelemeleri,
    alarmKitIkincilDugme,
    alarmKitIptalSecimi,
    alarmKitKayitlariniCoz,
    alarmKitUuid,
    alarmKitYukuOlustur,
} from '../alarmKit';
import { ertelemeBasligiSablonu, ertelemeSiniriMs, gurubKerahatiBaslangiciMs } from '../../erteleme';

const FIKSTUR = path.join(__dirname, '../../../../../modules/expo-muhafiz-alarmkit/test/alarmkit-ornek.json');
const fikstur = JSON.parse(fs.readFileSync(FIKSTUR, 'utf8')) as {
    uuidler: { kimlik: string; uuid: string }[];
    dugmeler: { ad: string; tetikMs: number; erteleSinirMs: number; beklenen: 'ertele' | 'kildim' }[];
    iptalSecimi: {
        ad: string;
        kayitlar: { kimlik: string; caliyor: boolean }[];
        calaniDurdur: boolean;
        beklenen: string[];
    }[];
};

describe('alarmKitIptalSecimi — ÇALAN alarm planlama turunda korunur (Swift ikiziyle ortak fikstür)', () => {
    test.each(fikstur.iptalSecimi)('$ad', ({ kayitlar, calaniDurdur, beklenen }) => {
        // Köprüden geldiği gibi: `caliyor` yalnız true iken yazılır.
        const ham = JSON.stringify(
            kayitlar.map((k, i) => (k.caliyor ? { kimlik: k.kimlik, tetikMs: i, caliyor: true } : { kimlik: k.kimlik, tetikMs: i }))
        );
        expect(alarmKitIptalSecimi(alarmKitKayitlariniCoz(ham), () => true, calaniDurdur)).toEqual(beklenen);
    });

    test('seçici yine uygulanır (önek dışı kimlik ne olursa olsun kalır)', () => {
        const kayitlar = [
            { kimlik: 'muhafiz_2026-10-13_vakit_ogle_seviye_1_dk_45', tetikMs: 1 },
            { kimlik: 'muhafiz_2026-10-13_vakit_ikindi_seviye_1_dk_45', tetikMs: 2, caliyor: true as const },
        ];
        const ogle = (k: string) => k.startsWith('muhafiz_2026-10-13_vakit_ogle');
        expect(alarmKitIptalSecimi(kayitlar, ogle, true)).toEqual(['muhafiz_2026-10-13_vakit_ogle_seviye_1_dk_45']);
    });
});

describe('alarmKitUuid — Swift ikiziyle ortak fikstür', () => {
    test.each(fikstur.uuidler)('$kimlik', ({ kimlik, uuid }) => {
        expect(alarmKitUuid(kimlik)).toBe(uuid);
    });

    test('RFC 9562 UUIDv8 biçimi (sürüm 8, varyant 10xx)', () => {
        for (const { kimlik } of fikstur.uuidler) {
            expect(alarmKitUuid(kimlik)).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-8[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
        }
    });

    test('deterministik ve ayırt edici (ayni tetik = ayni alarm; komsu dakika farkli)', () => {
        const a = 'muhafiz_2026-10-13_vakit_ogle_seviye_1_dk_45';
        expect(alarmKitUuid(a)).toBe(alarmKitUuid(a));
        expect(alarmKitUuid(a)).not.toBe(alarmKitUuid('muhafiz_2026-10-13_vakit_ogle_seviye_1_dk_44'));
    });
});

describe('alarmKitIkincilDugme — bildirimdeki erteleme kuralıyla AYNI', () => {
    test.each(fikstur.dugmeler)('$ad → $beklenen', ({ tetikMs, erteleSinirMs, beklenen }) => {
        expect(alarmKitIkincilDugme(tetikMs, erteleSinirMs)).toBe(beklenen);
    });
});

describe('alarmKitYukuOlustur', () => {
    const cikis = new Date(2026, 9, 13, 16, 0).getTime();
    const tetik = cikis - 45 * 60_000;

    test('erteleme alanları bildirimle AYNI kaynaktan (ikindide kerahat sınırı)', () => {
        const yuk = alarmKitYukuOlustur({
            kimlik: 'muhafiz_2026-10-13_vakit_ikindi_seviye_1_dk_45',
            tetikMs: tetik,
            baslik: 'İkindi · 45 dk kaldı ⏰',
            vakit: 'ikindi',
            tarih: '2026-10-13',
            cikisMs: cikis,
        });
        expect(yuk).toEqual({
            kimlik: 'muhafiz_2026-10-13_vakit_ikindi_seviye_1_dk_45',
            tetikMs: tetik,
            baslik: 'İkindi · 45 dk kaldı ⏰',
            vakit: 'ikindi',
            tarih: '2026-10-13',
            cikisMs: cikis,
            erteleSinirMs: ertelemeSiniriMs('ikindi', cikis),
            ertelemeBasligi: ertelemeBasligiSablonu('İkindi'),
        });
        expect(yuk.erteleSinirMs).toBe(gurubKerahatiBaslangiciMs(cikis));
    });

    test('çıkış bilinmiyorsa erteleme YOK (ikinci düğme "Kıldım")', () => {
        const yuk = alarmKitYukuOlustur({ kimlik: 'k', tetikMs: tetik, baslik: 'b', vakit: 'ogle', tarih: '2026-10-13' });
        expect(yuk.erteleSinirMs).toBe(0);
        expect(yuk.ertelemeBasligi).toBe('');
        expect(alarmKitIkincilDugme(yuk.tetikMs, yuk.erteleSinirMs)).toBe('kildim');
    });
});

describe('köprü verisi çözümü', () => {
    test('durum: bilinmeyen/bozuk değer "desteklenmiyor"', () => {
        expect(alarmKitDurumunuCoz('izinli')).toBe('izinli');
        expect(alarmKitDurumunuCoz('authorized')).toBe('desteklenmiyor');
        expect(alarmKitDurumunuCoz(null)).toBe('desteklenmiyor');
    });

    test('kayıtlar: JSON dizesi ya da dizi; bozuk öğe düşer', () => {
        const ham = JSON.stringify([
            { kimlik: 'a', tetikMs: 1 },
            { kimlik: 2, tetikMs: 1 },
            { kimlik: 'b' },
            null,
            { kimlik: 'c', tetikMs: Number.NaN },
            { kimlik: 'd', tetikMs: 4, caliyor: true },
            { kimlik: 'e', tetikMs: 5, caliyor: 'evet' },
        ]);
        expect(alarmKitKayitlariniCoz(ham)).toEqual([
            { kimlik: 'a', tetikMs: 1 },
            { kimlik: 'd', tetikMs: 4, caliyor: true },
            { kimlik: 'e', tetikMs: 5 },
        ]);
        expect(alarmKitKayitlariniCoz('{bozuk')).toEqual([]);
        expect(alarmKitKayitlariniCoz({ kimlik: 'a' })).toEqual([]);
    });

    test('ertelemeler: yalnız ertelenmiş alarm kimlikleri, namaz günü + vakit anahtarıyla', () => {
        expect(
            alarmKitErtelemeleri([
                { kimlik: 'muhafiz_2026-10-12_vakit_yatsi_ertele', tetikMs: 500 },
                { kimlik: 'muhafiz_2026-10-13_vakit_ogle_seviye_1_dk_45', tetikMs: 100 },
            ])
        ).toEqual({ '2026-10-12_yatsi': 500 });
    });
});
