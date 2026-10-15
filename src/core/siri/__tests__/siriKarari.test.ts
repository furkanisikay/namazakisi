/**
 * Siri / Kısayollar karar ve metin sözleşmesi (issue #279).
 *
 * İKİ TARAFLI KİLİT: `modules/expo-siri-kisayollari/test/siri-ornek.json` hem bu
 * test hem Swift test koşucusu (`modules/expo-siri-kisayollari/test/main.swift`,
 * macOS CI'da `swiftc` ile) tarafından okunur. Siri'nin cevabı ile uygulamanın
 * kararı ayrışırsa kullanıcı "Öğle işaretlendi" duyar, uygulamada başka vakit görür.
 */
import fs from 'fs';
import path from 'path';
import { aktifVakitBul, type WidgetVakitAni } from '../../widget/widgetYuku';
import {
    SIRI_VERI_ESKI_METNI,
    siradakiNamazMetni,
    siriKildimKarari,
    siriKildimMetni,
    siriKildimOnayMetni,
    type SiriBekleyenKildim,
} from '../siriKarari';

const FIKSTUR = path.join(__dirname, '../../../../modules/expo-siri-kisayollari/test/siri-ornek.json');
const WIDGET_FIKSTUR = path.join(__dirname, '../../../../android/app/src/test/resources/widget-ornek.json');

interface Durum {
    ad: string;
    simdiMs: number;
    bugun: string;
    kilinanlar: Record<string, string[]>;
    bekleyenler: SiriBekleyenKildim[];
    beklenen: {
        siradakiMetni: string;
        kildim:
            | { tur: 'aday'; tarih: string; kayitVakti: string; ad: string }
            | { tur: 'zatenKilindi'; ad: string }
            | { tur: 'vakitYok'; siradaki: { vakit: string; tarih: string } | null };
        kildimMetni: string;
        onayMetni: string | null;
    };
}

const ornek = JSON.parse(fs.readFileSync(FIKSTUR, 'utf8')) as {
    saatDilimi: string;
    vakitler: WidgetVakitAni[];
    durumlar: Durum[];
};

/** Fikstür saatleri Europe/Istanbul'dadır (2016'dan beri sabit +03:00, yaz saati yok). */
const saat = (ms: number): string => {
    const d = new Date(ms + 3 * 3600_000);
    return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
};

describe('Siri kararları — Swift ile ortak fikstür', () => {
    it('fikstür vakitleri widget/Kotlin fikstürüyle AYNI (üç dil tek çizelge)', () => {
        const widget = JSON.parse(fs.readFileSync(WIDGET_FIKSTUR, 'utf8')) as { vakitler: WidgetVakitAni[] };
        expect(ornek.vakitler).toEqual(widget.vakitler);
        expect(ornek.saatDilimi).toBe('Europe/Istanbul');
    });

    it.each(ornek.durumlar.map((d) => [d.ad, d] as const))('%s', (_ad, d) => {
        const karar = siriKildimKarari(ornek.vakitler, d.kilinanlar, d.bekleyenler, d.simdiMs);
        const kararOzeti =
            karar.tur === 'aday'
                ? { tur: 'aday', tarih: karar.vakit.tarih, kayitVakti: karar.kayitVakti, ad: karar.ad }
                : karar.tur === 'zatenKilindi'
                  ? { tur: 'zatenKilindi', ad: karar.ad }
                  : {
                        tur: 'vakitYok',
                        siradaki: karar.siradaki
                            ? { vakit: karar.siradaki.vakit, tarih: karar.siradaki.tarih }
                            : null,
                    };
        expect(kararOzeti).toEqual(d.beklenen.kildim);
        expect(siriKildimMetni(karar, d.bugun, saat)).toBe(d.beklenen.kildimMetni);
        expect(karar.tur === 'aday' ? siriKildimOnayMetni(karar.ad) : null).toBe(d.beklenen.onayMetni);

        const durum = aktifVakitBul(ornek.vakitler, d.simdiMs);
        expect(siradakiNamazMetni(durum, d.kilinanlar, d.bekleyenler, d.bugun, saat)).toBe(
            d.beklenen.siradakiMetni
        );
    });
});

describe('Siri kararları — kurallar', () => {
    it('güneş→öğle arasında işaretlenecek vakit YOK (widget/saat kuralı)', () => {
        const gunes = ornek.vakitler.find((v) => v.vakit === 'gunes' && v.tarih === '2026-06-21')!;
        const karar = siriKildimKarari(ornek.vakitler, {}, [], gunes.ms + 60_000);
        expect(karar.tur).toBe('vakitYok');
    });

    it("sabahın kayıt/kuyruk kodu 'imsak'tır — kuyruk 'sabah'ı reddeder (AGENTS.md)", () => {
        const sabah = ornek.vakitler.find((v) => v.vakit === 'sabah' && v.tarih === '2026-06-21')!;
        const karar = siriKildimKarari(ornek.vakitler, {}, [], sabah.ms + 60_000);
        expect(karar).toMatchObject({ tur: 'aday', kayitVakti: 'imsak', ad: 'Sabah' });
    });

    it('hiç veri yoksa eskimiş-veri cevabı verilir (sessiz kalınmaz)', () => {
        expect(siradakiNamazMetni({ aktif: null, bitisMs: null, sonraki: null }, {}, [], '2026-06-21', saat)).toBe(
            SIRI_VERI_ESKI_METNI
        );
    });

    it('metinler arayüz kaydındadır: "sen" dili ve saate hal eki yok', () => {
        for (const d of ornek.durumlar) {
            for (const metin of [d.beklenen.siradakiMetni, d.beklenen.kildimMetni, d.beklenen.onayMetni ?? '']) {
                // `\b` Türkçe harfleri (ı, ş…) sözcük sınırı sayar → sözcüklere bölerek bak.
                const sozcukler = metin.toLocaleLowerCase('tr-TR').split(/[\s,.;:!?]+/);
                expect(sozcukler).not.toContain('sen');
                expect(sozcukler).not.toContain('senin');
                expect(metin).not.toMatch(/\d{2}:\d{2}'/);
            }
        }
    });
});
