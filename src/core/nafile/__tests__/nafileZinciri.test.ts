import { NamazAdi } from '../../constants/UygulamaSabitleri';
import { nafileZincirSatirlariOlustur } from '../nafileZinciri';
import type { NafilePencere } from '../nafileVakitleri';

const an = (g: number, s: number, d: number) => new Date(2026, 5, g, s, d);
const p = (
    tur: NafilePencere['tur'],
    b: [number, number, number],
    e: [number, number, number],
    f: [number, number, number]
): NafilePencere => ({ tur, baslangic: an(...b), bitis: an(...e), faziletli: an(...f) });

const PENCERELER: NafilePencere[] = [
    p('kusluk', [21, 6, 15], [21, 13, 0], [21, 9, 40]),
    p('evvabin', [21, 20, 40], [21, 22, 30], [21, 20, 40]),
    p('teheccud', [21, 22, 30], [22, 3, 30], [22, 1, 50]),
];
const SON_UCTE_BIR = { hedef: 'sonUcteBir' as const, imsaktanOnceDk: 60 };

describe('nafileZincirSatirlariOlustur', () => {
    it('her nafile kendi farzının ARDINA girer (kuşluk→sabah, evvâbîn→akşam, teheccüd→yatsı)', () => {
        const s = nafileZincirSatirlariOlustur(PENCERELER, an(21, 5, 0), SON_UCTE_BIR);
        expect(s.map((x) => [x.tur, x.ardindan])).toEqual([
            ['kusluk', NamazAdi.Sabah],
            ['evvabin', NamazAdi.Aksam],
            ['teheccud', NamazAdi.Yatsi],
        ]);
    });

    it('pencere içindeyken aktif: "Vakti girdi · bitiş 13:00"; saate hal eki yok', () => {
        const [kusluk] = nafileZincirSatirlariOlustur(PENCERELER, an(21, 9, 0), SON_UCTE_BIR);
        expect(kusluk.durum).toBe('aktif');
        expect(kusluk.saat).toBe('06:15');
        expect(kusluk.durumMetni).toBe('Vakti girdi · bitiş 13:00');
        expect(kusluk.durumMetni).not.toMatch(/\d'/);
    });

    it('önce sırada, sonra geçti — metin pencereyi gösterir', () => {
        const once = nafileZincirSatirlariOlustur(PENCERELER, an(21, 5, 0), SON_UCTE_BIR);
        expect(once[0].durum).toBe('sirada');
        expect(once[0].durumMetni).toBe('Nafile · 06:15–13:00');
        const sonra = nafileZincirSatirlariOlustur(PENCERELER, an(21, 14, 0), SON_UCTE_BIR);
        expect(sonra[0].durum).toBe('gecti');
    });

    it('teheccüd yatsı girer girmez DEĞİL, hedef an girince aktif olur; saati hedef andır', () => {
        const yatsidaSonra = nafileZincirSatirlariOlustur(PENCERELER, an(21, 23, 0), SON_UCTE_BIR)[2];
        expect(yatsidaSonra.durum).toBe('sirada');
        expect(yatsidaSonra.saat).toBe('01:50');
        expect(yatsidaSonra.durumMetni).toBe('Nafile · 01:50–03:30');
        const gece = nafileZincirSatirlariOlustur(PENCERELER, an(22, 2, 0), SON_UCTE_BIR)[2];
        expect(gece.durum).toBe('aktif');
        const imsakOncesi = nafileZincirSatirlariOlustur(PENCERELER, an(21, 23, 0), {
            hedef: 'imsaktanOnce',
            imsaktanOnceDk: 60,
        })[2];
        expect(imsakOncesi.saat).toBe('02:30');
    });

    it('bilgi metni pencereyi ve faziletli anı söyler', () => {
        const [kusluk, , teheccud] = nafileZincirSatirlariOlustur(PENCERELER, an(21, 9, 0), SON_UCTE_BIR);
        expect(kusluk.bilgiMetni).toContain('Bugün: 06:15 – 13:00 · en faziletli 09:40 sonrası');
        expect(teheccud.bilgiMetni).toContain('son üçte bir 01:50');
    });
});
