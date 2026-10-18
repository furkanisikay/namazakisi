import { GURUB_IKINDI_METNI, kerahatMetniSec } from '../kerahatNotu';
import { durumlariBirlestir, durumSec } from '../durumAlani';

const GURUB = 'Güneş batış vaktidir (gurub). Bu vakitte namaz kılınması mekruhtur. Akşam ezanını bekleyiniz.';

describe('kerahatMetniSec', () => {
    it('NÖBETÇİ: gurubda bugünün ikindisi kılınmadıysa "bekleyin" DEMEZ, şimdi kılınabilir der', () => {
        const m = kerahatMetniSec({ aciklama: GURUB, tur: 'gurub', ikindiKilindi: false });
        expect(m).toBe(GURUB_IKINDI_METNI);
        expect(m).not.toMatch(/bekleyiniz/);
    });
    it('gurubda ikindi kılındıysa ya da bilinmiyorsa servisin metni kalır', () => {
        expect(kerahatMetniSec({ aciklama: GURUB, tur: 'gurub', ikindiKilindi: true })).toBe(GURUB);
        expect(kerahatMetniSec({ aciklama: GURUB, tur: 'gurub', ikindiKilindi: null })).toBe(GURUB);
    });
    it('şuruk/istivada metin değişmez; metin yoksa null', () => {
        expect(kerahatMetniSec({ aciklama: 'şuruk', tur: 'suruk', ikindiKilindi: false })).toBe('şuruk');
        expect(kerahatMetniSec({ aciklama: null, tur: 'gurub', ikindiKilindi: false })).toBeNull();
    });
});

describe('durumlariBirlestir', () => {
    it('NÖBETÇİ: muhafız + kerahat → muhafız birincil, kerahat ayrı öğe olarak GİZLENMEZ (not olur)', () => {
        const b = durumlariBirlestir(['kerahat', 'muhafiz', 'toparlanma']);
        expect(b.muhafizKerahatNotu).toBe(true);
        expect(durumSec(b.etkinler)).toEqual({ birincil: 'muhafiz', gizlenenler: ['toparlanma'] });
    });
    it('yalnız kerahat varsa olduğu gibi kalır', () => {
        expect(durumlariBirlestir(['kerahat', 'seferilik'])).toEqual({ etkinler: ['kerahat', 'seferilik'], muhafizKerahatNotu: false });
    });
});
