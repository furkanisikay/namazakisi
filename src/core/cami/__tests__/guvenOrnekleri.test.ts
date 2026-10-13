import { guvenOrnekleriOlustur } from '../guvenOrnekleri';

const eylemler = (a: Parameters<typeof guvenOrnekleriOlustur>[0]) =>
    Object.fromEntries(guvenOrnekleriOlustur(a).map((o) => [o.id, o.eylem]));

describe('guvenOrnekleriOlustur — ekran örnekleri güven puanından canlı', () => {
    it('akıllı (varsayılan): ezan ve cuma açılır, trafik sorulur, geçiş ve kafe hiçbir şey, vakit dışı ölçülmez', () => {
        expect(eylemler({ acilisBicimi: 'akilli', beklemeDk: 3, vakitKapisi: true })).toEqual({
            ezan: 'otomatik',
            cuma: 'otomatik',
            trafik: 'sor',
            gecis: 'hicbir',
            kafe: 'hicbir',
            vakitDisi: 'hicbir',
        });
    });

    it('sorarak: açılacak olanlar sorulur; otomatik: sorulacak olanlar açılır, geçiş yine hiçbir şey', () => {
        expect(eylemler({ acilisBicimi: 'sorarak', beklemeDk: 3, vakitKapisi: true })).toMatchObject({ ezan: 'sor', trafik: 'sor', gecis: 'hicbir' });
        expect(eylemler({ acilisBicimi: 'otomatik', beklemeDk: 3, vakitKapisi: true })).toMatchObject({ trafik: 'otomatik', gecis: 'hicbir' });
    });

    it('vakit kapısı kapalıyken vakit dışı uğrama ölçülür ama en fazla sorulur', () => {
        const o = guvenOrnekleriOlustur({ acilisBicimi: 'akilli', beklemeDk: 3, vakitKapisi: false }).find((x) => x.id === 'vakitDisi');
        expect(o).toMatchObject({ eylem: 'sor' });
        expect(o?.olculmez).toBeUndefined();
    });
});
