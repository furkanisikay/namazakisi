/**
 * Muhafız "Ertele" (issue #289) — saf kurallar.
 *
 * İKİ TARAFLI KİLİT: `android/app/src/test/resources/erteleme-ornekleri.json`
 * hem bu test hem Kotlin `ErtelemeKurallariTest` tarafından okunur. Android'de
 * düğme native işlendiği için iki taraf ayrışırsa ekrandaki düğme ile basışın
 * sonucu farklı kurala göre çalışır.
 */
import fs from 'fs';
import path from 'path';
import { KAZA_SABITLERI } from '../../constants/UygulamaSabitleri';
import {
    ERTELEME_CIKIS_PAYI_DK,
    ertelemeBasligiOlustur,
    ertelemeBasligiSablonu,
    ertelemedeSusturulurMu,
    ertelemeHedefiHesapla,
    ertelemeleriBirlestir,
    ertelemeSusturuyorMu,
    ertelemeKategorisi,
    ertelemeKimligi,
    ertelemeKimligiMi,
    ertelemeSecenekleri,
    ertelemeSiniriMs,
    ertelemeTeslimBilgisi,
    etkinErtelemeler,
    eylemSuresiDk,
    gurubKerahatiBaslangiciMs,
    kimliktenKalanDk,
    muhafizPlanKimligiMi,
    sureMetni,
} from '../erteleme';
import { muhafizBildirimIdOlustur } from '../anonsKimligi';

const ORNEK = path.join(__dirname, '../../../../android/app/src/test/resources/erteleme-ornekleri.json');
const ornek = JSON.parse(fs.readFileSync(ORNEK, 'utf8'));
const DK = 60_000;

describe('ortak fikstür (Kotlin ikiziyle AYNI)', () => {
    it.each(ornek.secenekler as Array<{ ad: string; tetikMs: number; sinirMs: number; beklenen: number[]; kategori: string }>)(
        'seçenekler: $ad',
        ({ tetikMs, sinirMs, beklenen, kategori }) => {
            expect(ertelemeSecenekleri(tetikMs, sinirMs)).toEqual(beklenen);
            expect(ertelemeKategorisi(tetikMs, sinirMs)).toBe(kategori);
        }
    );

    it.each(ornek.hedef as Array<{ ad: string; simdiMs: number; sureDk: number; sinirMs: number; beklenen: number | null }>)(
        'hedef: $ad',
        ({ simdiMs, sureDk, sinirMs, beklenen }) => {
            expect(ertelemeHedefiHesapla(simdiMs, sureDk, sinirMs)).toBe(beklenen);
        }
    );

    it('eylemler', () => {
        for (const e of ornek.eylemler) expect(eylemSuresiDk(e.eylem)).toBe(e.sure);
    });

    it('kimlikler', () => {
        for (const k of ornek.kimlikler) {
            expect([k.kimlik, muhafizPlanKimligiMi(k.kimlik)]).toEqual([k.kimlik, k.planMi]);
            expect([k.kimlik, kimliktenKalanDk(k.kimlik)]).toEqual([k.kimlik, k.kalanDk]);
            expect([k.kimlik, ertelemeKimligiMi(k.kimlik)]).toEqual([k.kimlik, k.ertelemeMi]);
        }
        for (const k of ornek.ertelemeKimligi) expect(ertelemeKimligi(k.tarih, k.vakit)).toBe(k.kimlik);
    });

    it('süre metni', () => {
        for (const s of ornek.sureMetni) expect(sureMetni(s.dk)).toBe(s.metin);
    });

    it('başlık', () => {
        for (const b of ornek.baslik) {
            expect([b.ad, ertelemeBasligiOlustur(b.sablon, b.cikisMs, b.hedefMs)]).toEqual([b.ad, b.beklenen]);
        }
    });

    it('susturma', () => {
        for (const s of ornek.susturma) expect(ertelemedeSusturulurMu(s.tetikMs, s.hedefMs)).toBe(s.beklenen);
    });
});

describe('fıkhi üst sınır', () => {
    const cikis = new Date(2026, 9, 13, 18, 35).getTime();

    it('genel kural: çıkış − 3 dk', () => {
        expect(ertelemeSiniriMs('ogle', cikis)).toBe(cikis - ERTELEME_CIKIS_PAYI_DK * DK);
        expect(ertelemeSiniriMs('yatsi', cikis)).toBe(cikis - 3 * DK);
    });

    it('ikindi: gurub kerahati başlangıcı (kaza ekranıyla AYNI kaynak, yeni sabit yok)', () => {
        expect(ertelemeSiniriMs('ikindi', cikis)).toBe(gurubKerahatiBaslangiciMs(cikis));
        expect(gurubKerahatiBaslangiciMs(cikis)).toBe(cikis - KAZA_SABITLERI.MEKRUH_TOLERANS_DK * DK);
        expect(ertelemeSiniriMs('ikindi', cikis)).toBeLessThan(ertelemeSiniriMs('ogle', cikis));
    });

    it('NÖBETÇİ: ertelenen an sınırı ASLA geçmez', () => {
        const sinir = ertelemeSiniriMs('ikindi', cikis);
        for (let dk = -30; dk <= 60; dk++) {
            const simdi = sinir - dk * DK;
            for (const sure of [10, 20]) {
                const hedef = ertelemeHedefiHesapla(simdi, sure, sinir);
                if (hedef !== null) expect(hedef).toBeLessThanOrEqual(sinir);
            }
        }
    });
});

describe('teslim bilgisi', () => {
    it('kategori + data alanları (Android/iOS teslimcisi ortak)', () => {
        const cikis = new Date(2026, 9, 13, 18, 35).getTime();
        const tetik = cikis - 45 * DK;
        const b = ertelemeTeslimBilgisi('ikindi', cikis, tetik);
        expect(b.kategori).toBe(ertelemeKategorisi(tetik, ertelemeSiniriMs('ikindi', cikis)));
        expect(b.veri).toEqual({
            cikisMs: cikis,
            erteleSinirMs: ertelemeSiniriMs('ikindi', cikis),
            ertelemeBasligi: ertelemeBasligiSablonu('İkindi'),
        });
    });

    it('son dakika uyarısında ertele düğmesi YOK', () => {
        const cikis = 1_800_000_000_000;
        expect(ertelemeTeslimBilgisi('ogle', cikis, cikis - 3 * DK).kategori).toBe('muhafiz_category');
    });
});

describe('kimlik uzayı', () => {
    it('plan kimliği üreticisiyle uyumlu', () => {
        expect(muhafizPlanKimligiMi(muhafizBildirimIdOlustur('ikindi', 2, '2026-10-13', 25))).toBe(true);
        expect(kimliktenKalanDk(muhafizBildirimIdOlustur('ikindi', 2, '2026-10-13', 25))).toBe(25);
    });

    it('erteleme kimliği "Kıldım" iptal önekiyle eşleşir', () => {
        expect(ertelemeKimligi('2026-10-13', 'ikindi').startsWith('muhafiz_2026-10-13_vakit_ikindi')).toBe(true);
    });
});

describe('etkinErtelemeler', () => {
    it('yalnız geçerli hedefi olan ertelemeleri toplar', () => {
        expect(
            etkinErtelemeler([
                { identifier: 'muhafiz_2026-10-13_vakit_ikindi_ertele', content: { data: { ertelemeHedefMs: 123 } } },
                { identifier: 'muhafiz_2026-10-13_vakit_ogle_ertele', content: { data: {} } },
                { identifier: 'muhafiz_2026-10-13_vakit_aksam_seviye_1_dk_25', content: { data: { ertelemeHedefMs: 5 } } },
                { identifier: 'cuma_hatirlatma_2026-10-16' },
            ])
        ).toEqual({ '2026-10-13_ikindi': 123 });
    });
});

describe('ertelemeSusturuyorMu — üç tüketicinin (arka plan, ön plan, saat) TEK kuralı', () => {
    const ertelemeler = { '2026-10-13_ogle': 10 * DK };

    it('hedef + çakışma payı öncesindeki uyarı susar, sonrası susmaz', () => {
        expect(ertelemeSusturuyorMu(ertelemeler, '2026-10-13', 'ogle', 5 * DK)).toBe(true);
        expect(ertelemeSusturuyorMu(ertelemeler, '2026-10-13', 'ogle', 10 * DK)).toBe(true);
        expect(ertelemeSusturuyorMu(ertelemeler, '2026-10-13', 'ogle', 11 * DK)).toBe(false);
        // Kuralın kendisiyle birebir (ayrışma imkânsız).
        for (const t of [0, 10 * DK + 59_999, 11 * DK]) {
            expect(ertelemeSusturuyorMu(ertelemeler, '2026-10-13', 'ogle', t)).toBe(ertelemedeSusturulurMu(t, 10 * DK));
        }
    });

    it('başka vakit / başka gün / erteleme yok → susmaz', () => {
        expect(ertelemeSusturuyorMu(ertelemeler, '2026-10-13', 'ikindi', 5 * DK)).toBe(false);
        expect(ertelemeSusturuyorMu(ertelemeler, '2026-10-12', 'ogle', 5 * DK)).toBe(false);
        expect(ertelemeSusturuyorMu(undefined, '2026-10-13', 'ogle', 5 * DK)).toBe(false);
    });
});

describe('ertelemeleriBirlestir', () => {
    it('bekleyenlerden düşen ama payı süren ertelemeyi korur, payı bitmişi atar; yeni değer kazanır', () => {
        const eski = { '2026-10-13_ogle': 10 * DK, '2026-10-13_imsak': 1 * DK, '2026-10-13_ikindi': 50 * DK };
        const yeni = { '2026-10-13_ikindi': 70 * DK };
        expect(ertelemeleriBirlestir(eski, yeni, 10 * DK + 30_000)).toEqual({
            '2026-10-13_ogle': 10 * DK,
            '2026-10-13_ikindi': 70 * DK,
        });
    });

    it('etkinErtelemeler dizi olmayan girdide boş döner (mock/eski köprü)', () => {
        expect(etkinErtelemeler(undefined as unknown as [])).toEqual({});
    });
});
