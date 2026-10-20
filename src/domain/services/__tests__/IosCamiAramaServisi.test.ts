import * as fs from 'fs';
import * as path from 'path';

const mockOku = jest.fn();
jest.mock('../../../data/local/camiVeriDosyasi', () => ({ camiVeriBaytlariniOku: () => mockOku() }));

import { _onbellegiSifirla, yakinCamileriBul } from '../IosCamiAramaServisi';

const TR_BIN = path.join(__dirname, '../../../../assets/camiler/tr.bin');

describe('IosCamiAramaServisi — paketlenmiş tr.bin JS ile', () => {
    beforeEach(() => {
        _onbellegiSifirla();
        mockOku.mockReset();
    });

    it('Sultanahmet yakınında adlı camileri mesafeye göre sıralı verir', async () => {
        mockOku.mockResolvedValue(new Uint8Array(fs.readFileSync(TR_BIN)));
        const liste = await yakinCamileriBul(41.0054, 28.9768, 4);
        expect(liste.length).toBe(4);
        for (const c of liste) expect(c.ad.trim().length).toBeGreaterThan(0);
        const mesafeler = liste.map((c) => c.mesafeM);
        expect([...mesafeler].sort((a, b) => a - b)).toEqual(mesafeler);
        expect(mesafeler[0]).toBeLessThan(1000);
        // Önbellek: ikinci sorgu dosyayı yeniden okumaz.
        await yakinCamileriBul(41.0, 29.0, 2);
        expect(mockOku).toHaveBeenCalledTimes(1);
    });

    it('veri okunamazsa boş liste döner ve sonraki çağrı yeniden dener', async () => {
        mockOku.mockResolvedValueOnce(null);
        expect(await yakinCamileriBul(41, 29, 3)).toEqual([]);
        mockOku.mockResolvedValueOnce(new Uint8Array([1, 2, 3]));
        expect(await yakinCamileriBul(41, 29, 3)).toEqual([]);
        expect(mockOku).toHaveBeenCalledTimes(2);
    });
});
