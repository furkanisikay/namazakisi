/**
 * iOS Odak filtresi (issue #279) — saf kurallar. Platform mock'lanmaz.
 */
import { ODAK_AZAMI_SURE_MS, odakDurumunuCoz, odakSessizlestirirMi } from '../odakFiltresi';

describe('odakDurumunuCoz', () => {
    it('geçerli kaydı çözer', () => {
        expect(odakDurumunuCoz('{"sessiz":true,"ms":1000}')).toEqual({ sessiz: true, ms: 1000 });
    });

    it.each([
        ['null', null],
        ['boş', ''],
        ['kesik JSON', '{"sessiz":tr'],
        ['JSON null', 'null'],
        ['sayı', '42'],
        ['eksik alan', '{"sessiz":true}'],
        ['yanlış tip', '{"sessiz":"evet","ms":1}'],
    ])('bozuk kayıt (%s) → filtre yok', (_ad, ham) => {
        expect(odakDurumunuCoz(ham as string | null)).toBeNull();
    });
});

describe('odakSessizlestirirMi', () => {
    const odak = { sessiz: true, ms: 1_000_000 };

    it('filtre yoksa ya da sessiz kapalıysa hiçbir şey değişmez', () => {
        expect(odakSessizlestirirMi(null, 1_000_000)).toBe(false);
        expect(odakSessizlestirirMi({ sessiz: false, ms: 1_000_000 }, 1_000_001)).toBe(false);
    });

    it('filtre açıldıktan sonraki uyarılar sessiz verilir', () => {
        expect(odakSessizlestirirMi(odak, odak.ms)).toBe(true);
        expect(odakSessizlestirirMi(odak, odak.ms + 60_000)).toBe(true);
    });

    it('SÜRE TAVANI: kapanış çağrısı gelmese de sessizlik sonsuza kadar sürmez', () => {
        expect(odakSessizlestirirMi(odak, odak.ms + ODAK_AZAMI_SURE_MS - 1)).toBe(true);
        expect(odakSessizlestirirMi(odak, odak.ms + ODAK_AZAMI_SURE_MS)).toBe(false);
    });

    it('filtre açılmadan önceki anlara uygulanmaz (saat geri alınmış olabilir)', () => {
        expect(odakSessizlestirirMi(odak, odak.ms - 1)).toBe(false);
    });
});
