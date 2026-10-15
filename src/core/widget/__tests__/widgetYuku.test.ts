/**
 * Widget/kutu veri sözleşmesi (issue #275/#276).
 *
 * İKİ TARAFLI KİLİT: `android/app/src/test/resources/widget-ornek.json` hem bu
 * test hem Kotlin `VakitCizelgesiTest` tarafından okunur. `aktifVakitBul` ile
 * `VakitCizelgesi.durumHesapla` ayrışırsa iOS/derin bağlantı ile widget/kutu
 * farklı vakti işaretler.
 */
import fs from 'fs';
import path from 'path';
import { NamazAdi } from '../../constants/UygulamaSabitleri';
import {
    WIDGET_GUN_SAYISI,
    WIDGET_YUK_SURUMU,
    aktifVakitBul,
    kildimIstekKodu,
    widgetKilinanlariOlustur,
    widgetKoduNamazAdina,
    widgetKoduVakitAdina,
    widgetVerisiOlustur,
    type WidgetVakitAni,
} from '../widgetYuku';
import type { VakitAdi } from '../../types';

const ORNEK = path.join(__dirname, '../../../../android/app/src/test/resources/widget-ornek.json');

interface OrnekDurum {
    ad: string;
    simdiMs: number;
    aktif: { vakit: string; tarih: string } | null;
    bitisMs: number | null;
    sonraki: { vakit: string; tarih: string } | null;
}

const ornek = JSON.parse(fs.readFileSync(ORNEK, 'utf8')) as {
    vakitler: WidgetVakitAni[];
    durumlar: OrnekDurum[];
    istekKodlari: { tarih: string; vakit: VakitAdi; kod: number }[];
};

describe('aktifVakitBul — Kotlin VakitCizelgesi ile ortak örnekler', () => {
    it.each(ornek.durumlar.map((d) => [d.ad, d] as const))('%s', (_ad, d) => {
        const sonuc = aktifVakitBul(ornek.vakitler, d.simdiMs);
        expect(sonuc.aktif ? { vakit: sonuc.aktif.vakit, tarih: sonuc.aktif.tarih } : null).toEqual(d.aktif);
        expect(sonuc.bitisMs).toEqual(d.bitisMs);
        expect(sonuc.sonraki ? { vakit: sonuc.sonraki.vakit, tarih: sonuc.sonraki.tarih } : null).toEqual(d.sonraki);
    });

    it('sıralanmamış veride de aynı cevabı verir', () => {
        const ters = [...ornek.vakitler].reverse();
        const d = ornek.durumlar[0];
        expect(aktifVakitBul(ters, d.simdiMs)).toEqual(aktifVakitBul(ornek.vakitler, d.simdiMs));
    });
});

describe('kildimIstekKodu — Java String.hashCode', () => {
    it.each(ornek.istekKodlari.map((k) => [`${k.tarih}_${k.vakit}`, k] as const))('%s', (_ad, k) => {
        expect(kildimIstekKodu(k.tarih, k.vakit)).toBe(k.kod);
    });

    it('32 bit işaretli tamsayıdır', () => {
        const kod = kildimIstekKodu('2099-12-31', 'yatsi');
        expect(Number.isInteger(kod)).toBe(true);
        expect(kod).toBeGreaterThanOrEqual(-(2 ** 31));
        expect(kod).toBeLessThan(2 ** 31);
    });
});

describe('widgetVerisiOlustur', () => {
    const istanbul = { lat: 41.0082, lng: 28.9784 };

    it('dün + 8 gün, her gün 6 giriş, kronolojik ve namaz günü etiketli', () => {
        const v = widgetVerisiOlustur(istanbul, '2026-06-21');
        expect(v.surum).toBe(WIDGET_YUK_SURUMU);
        expect(v.vakitler).toHaveLength(WIDGET_GUN_SAYISI * 6);
        expect(v.vakitler[0]).toMatchObject({ vakit: 'sabah', tarih: '2026-06-20' });
        expect(v.vakitler[v.vakitler.length - 1]).toMatchObject({ vakit: 'yatsi', tarih: '2026-06-28' });
        for (let i = 1; i < v.vakitler.length; i++) {
            expect(v.vakitler[i].ms).toBeGreaterThan(v.vakitler[i - 1].ms);
        }
    });

    it('gece yarısından sonra aktif vakit DÜNÜN yatsısıdır (dün verisi şart)', () => {
        const v = widgetVerisiOlustur(istanbul, '2026-06-21');
        const bugunImsak = v.vakitler.find((x) => x.vakit === 'sabah' && x.tarih === '2026-06-21')!;
        const sonuc = aktifVakitBul(v.vakitler, bugunImsak.ms - 60_000);
        expect(sonuc.aktif).toMatchObject({ vakit: 'yatsi', tarih: '2026-06-20' });
        expect(sonuc.bitisMs).toBe(bugunImsak.ms);
    });
});

describe('widgetKilinanlariOlustur', () => {
    it('NamazAdi → widget kodu, sabit sıra, kılınmayan/güneş yok', () => {
        const sonuc = widgetKilinanlariOlustur([
            {
                tarih: '2026-06-20',
                namazlar: [
                    { namazAdi: NamazAdi.Yatsi, tamamlandi: true, tarih: '2026-06-20' },
                    { namazAdi: NamazAdi.Sabah, tamamlandi: true, tarih: '2026-06-20' },
                    { namazAdi: NamazAdi.Ogle, tamamlandi: false, tarih: '2026-06-20' },
                ],
            },
            { tarih: '2026-06-21', namazlar: [] },
        ]);
        expect(sonuc).toEqual({ '2026-06-20': ['sabah', 'yatsi'], '2026-06-21': [] });
    });
});

describe('kod eşlemeleri', () => {
    it("widget 'sabah' kayıtta 'imsak'tır; güneş namaz değildir", () => {
        expect(widgetKoduVakitAdina('sabah')).toBe('imsak');
        expect(widgetKoduVakitAdina('ikindi')).toBe('ikindi');
        expect(widgetKoduVakitAdina('gunes')).toBeNull();
        expect(widgetKoduNamazAdina('aksam')).toBe(NamazAdi.Aksam);
        expect(widgetKoduNamazAdina('gunes')).toBeNull();
    });
});
