/**
 * Apple Watch yük boyutu (#285 yeniden tasarım) — GERÇEK ölçüm.
 *
 * `updateApplicationContext` sözlüğünün üst sınırı belgelenmez (yaygın raporlar ~64 KB);
 * telefon `APPLE_WATCH_YUK_BAYT_SINIRI` (60 KB) ile keser. Bu test gerçekçi kurulumlarda
 * yükün ne kadar olduğunu ölçer ve sınıra yaklaşırsa kırılır (sessizce en uzak vakitlerin
 * planı düşmeye başlamadan önce görülsün).
 */
import { APPLE_WATCH_YUK_BAYT_SINIRI, WEAR_GUN_SAYISI, wearYukuOlustur } from '../wearYuku';
import { utf8BaytUzunlugu } from '../wearMuhafizPlani';
import { muhafizMatrisiniCoz } from '../../muhafiz/motorAdaptoru';

const ISTANBUL = { lat: 41.0082, lng: 28.9784 };
const ESKI_AYAR = {
    esikler: { seviye1: 45, seviye2: 25, seviye3: 10, seviye4: 3 },
    sikliklar: { seviye1: 15, seviye2: 10, seviye3: 5, seviye4: 1 },
};
const BUGUN = '2026-10-21';
const SIMDI = Date.UTC(2026, 9, 21, 9, 0, 0);

function olc(muhafizAktif: boolean): { bayt: number; plan: number } {
    const yuk = wearYukuOlustur({
        koordinat: ISTANBUL,
        bugunIso: BUGUN,
        konumAdi: 'Fatih, İstanbul',
        kilinanlar: {},
        muhafiz: muhafizAktif
            ? { aktif: true, matris: muhafizMatrisiniCoz(ESKI_AYAR), simdiMs: SIMDI, kilinanlar: {} }
            : undefined,
        kibleKonumu: true,
        baytSiniri: APPLE_WATCH_YUK_BAYT_SINIRI,
        anonsMetinleri: false,
    });
    return { bayt: utf8BaytUzunlugu(JSON.stringify(yuk)), plan: yuk.muhafiz.length };
}

describe('Apple Watch yük boyutu (gerçek ölçüm)', () => {
    it('muhafız kapalı: yalnız 31 günlük vakitler ≈ 6 KB', () => {
        const { bayt } = olc(false);
        expect(WEAR_GUN_SAYISI).toBe(31);
        expect(bayt).toBeGreaterThan(4_000);
        expect(bayt).toBeLessThan(8_000);
    });

    it('varsayılan muhafız planıyla 48 saatlik plan BÜTÜN gider ve sınırın rahatça altında kalır', () => {
        const { bayt, plan } = olc(true);
        expect(plan).toBeGreaterThan(0);
        // Ölçüm (2026-10-21): vakitler 5,8 KB + 90 kayıtlık 48 sa plan = 32,1 KB (sınır 60 KB).
        expect(bayt).toBeLessThan(40_000);
    });
});
