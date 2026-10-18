import { durumSec } from '../durumAlani';

describe('durumSec', () => {
    it('hiçbiri yoksa alan boştur', () => {
        expect(durumSec([])).toEqual({ birincil: null, gizlenenler: [] });
    });

    it('kerahat > muhafız > toparlanma > seferîlik; girdi sırası önemsiz', () => {
        expect(durumSec(['seferilik', 'toparlanma', 'muhafiz', 'kerahat'])).toEqual({
            birincil: 'kerahat',
            gizlenenler: ['muhafiz', 'toparlanma', 'seferilik'],
        });
        expect(durumSec(['seferilik', 'toparlanma'])).toEqual({ birincil: 'toparlanma', gizlenenler: ['seferilik'] });
    });

    it('tekrarlanan anahtar bir kez sayılır', () => {
        expect(durumSec(['muhafiz', 'muhafiz'])).toEqual({ birincil: 'muhafiz', gizlenenler: [] });
    });
});
