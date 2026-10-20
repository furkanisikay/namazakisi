import fikstur from '../../../../modules/expo-siri-kisayollari/test/siri-ornek.json';
import type { WidgetVakitAni } from '../../widget/widgetYuku';
import {
    gununSessizlikPencereleri,
    namazSessizligi,
    sessizlikDakikasiniKenetle,
    SESSIZLIK_VARSAYILAN_DK,
} from '../sessizlikKarari';

const vakitler = fikstur.vakitler as WidgetVakitAni[];

describe('namazSessizligi — Swift ikiziyle ortak fikstür', () => {
    for (const d of fikstur.sessizlik.durumlar) {
        it(d.ad, () => {
            expect(namazSessizligi(vakitler, d.simdiMs, d.dakika)).toEqual({
                sessiz: d.sessiz,
                vakit: d.vakit,
                bitisMs: d.bitisMs,
            });
        });
    }

    it('sırasız çizelgede de aynı karar', () => {
        const d = fikstur.sessizlik.durumlar[0];
        expect(namazSessizligi([...vakitler].reverse(), d.simdiMs, d.dakika)).toEqual(
            namazSessizligi(vakitler, d.simdiMs, d.dakika)
        );
    });

    it('çizelge boşsa sessiz değil', () => {
        expect(namazSessizligi([], 0, 20)).toEqual({ sessiz: false, vakit: null, bitisMs: null });
    });
});

describe('gununSessizlikPencereleri', () => {
    it('beş vakit, güneş yok, sıra korunur', () => {
        const p = fikstur.sessizlik.pencereler;
        expect(gununSessizlikPencereleri(vakitler, p.tarih, p.dakika)).toEqual(p.beklenen);
    });
});

describe('sessizlikDakikasiniKenetle', () => {
    it('sayı olmayan değer varsayılana düşer', () => {
        expect(sessizlikDakikasiniKenetle(Number.NaN)).toBe(SESSIZLIK_VARSAYILAN_DK);
    });
    it('küsurat yuvarlanır', () => {
        expect(sessizlikDakikasiniKenetle(19.6)).toBe(20);
    });
});
