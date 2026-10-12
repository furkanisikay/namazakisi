import { nafileSeritMetniOlustur } from '../nafileSeritMetni';
import type { NafilePencere } from '../nafileVakitleri';

const p = (tur: NafilePencere['tur'], b: [number, number], e: [number, number], f: [number, number]): NafilePencere => ({
    tur,
    baslangic: new Date(2026, 5, 21, ...b),
    bitis: new Date(2026, 5, 21, ...e),
    faziletli: new Date(2026, 5, 21, ...f),
});
const PENCERELER = [p('kusluk', [6, 15], [13, 0], [9, 40]), p('evvabin', [20, 40], [22, 30], [20, 40])];

describe('nafileSeritMetniOlustur', () => {
    it('durum yoksa şerit yok', () => {
        expect(nafileSeritMetniOlustur(null, PENCERELER)).toBeNull();
    });

    it('aktif: "Kuşluk vakti · bitiş 13:00" + bilgi pencereyi ve faziletli anı söyler', () => {
        const m = nafileSeritMetniOlustur({ tur: 'kusluk', durum: 'aktif', an: PENCERELER[0].bitis }, PENCERELER)!;
        expect(m.metin).toBe('Kuşluk vakti · bitiş 13:00');
        expect(m.aktif).toBe(true);
        expect(m.bilgiMetni).toContain('Bugün: 06:15 – 13:00');
        expect(m.bilgiMetni).toContain('09:40');
    });

    it('sırada: "Sıradaki nafile: Evvâbîn · 20:40" — saate hal eki yok', () => {
        const m = nafileSeritMetniOlustur({ tur: 'evvabin', durum: 'sirada', an: PENCERELER[1].baslangic }, PENCERELER)!;
        expect(m.metin).toBe('Sıradaki nafile: Evvâbîn · 20:40');
        expect(m.metin).not.toMatch(/\d'/);
    });
});
