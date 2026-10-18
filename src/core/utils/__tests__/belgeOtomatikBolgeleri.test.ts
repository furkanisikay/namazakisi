/**
 * Nobetci: README.md / docs/index.md'deki OTOMATIK bolgeler (scripts/belgeleri-guncelle.js).
 *
 * Bilerek ICERIK FARKINA bakmaz: kaynak (YeniOzellikler.ts, package.json surumu, magaza
 * kareleri) degisince bolgeleri `.github/workflows/belgeler.yml` kendisi yeniler; her
 * ozellik PR'ini "README'yi de guncelle" diye kirmak sahibin istemedigi el isidir.
 * Yakalanan: isaretlerin elle bozulmasi (silinen/ic ice/eslesmeyen BASLA-BITIR) ve
 * uretecin patlamasi (or. YeniOzellikler.ts'in sekli degisti).
 */
const { bolgeleriAyristir, hepsiniUret, karAltyazisi } = require('../../../../scripts/belgeleri-guncelle');

describe('belge otomatik bolgeleri', () => {
    it('gercek belgelerde isaretler saglam ve uretec calisiyor', () => {
        const sonuclar = hepsiniUret();
        const dosyalar = sonuclar.map((s: { dosya: string }) => s.dosya);
        expect(dosyalar).toEqual(expect.arrayContaining(['README.md', 'docs/index.md', 'docs/ekran-goruntuleri/README.md']));
        for (const s of sonuclar) {
            expect({ dosya: s.dosya, hatalar: s.hatalar }).toEqual({ dosya: s.dosya, hatalar: [] });
            expect(s.yeni.length).toBeGreaterThan(0);
        }
    });

    it('uretilen README surumu package.json ile tasir', () => {
        const { version } = require('../../../../package.json');
        const readme = hepsiniUret().find((s: { dosya: string }) => s.dosya === 'README.md');
        expect(readme.yeni).toContain(`**${version}**`);
    });

    it('bozuk isaretleri yakalar', () => {
        const b = (tur: string, ad: string) => `<!-- OTOMATIK:${tur} ${ad} -->`;
        expect(bolgeleriAyristir(`${b('BASLA', 'a')}\nx\n${b('BITIR', 'a')}`).hatalar).toEqual([]);
        expect(bolgeleriAyristir(`${b('BASLA', 'a')}\nx`).hatalar).toHaveLength(1);
        expect(bolgeleriAyristir(`x\n${b('BITIR', 'a')}`).hatalar).toHaveLength(1);
        expect(bolgeleriAyristir(`${b('BASLA', 'a')}${b('BASLA', 'b')}${b('BITIR', 'b')}`).hatalar.length).toBeGreaterThan(0);
        expect(bolgeleriAyristir(`${b('BASLA', 'a')}${b('BITIR', 'b')}`).hatalar).toHaveLength(1);
        expect(
            bolgeleriAyristir(`${b('BASLA', 'a')}${b('BITIR', 'a')}${b('BASLA', 'a')}${b('BITIR', 'a')}`).hatalar
        ).toHaveLength(1);
    });

    it('kare altyazisini Turkce yazar', () => {
        expect(karAltyazisi('07-muhafiz-zaman-seridi.webp')).toBe('Muhafız zaman şeridi');
        expect(karAltyazisi('08-istatistik.webp')).toBe('İstatistik');
        expect(karAltyazisi('03.webp')).toBe('');
    });
});
