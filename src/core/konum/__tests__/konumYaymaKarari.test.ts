import {
    YAYMA_VAKIT_TOLERANSI_MS,
    konumYaymasiGerekliMi,
    varsayilanYaymaVakitleri,
} from '../konumYaymaKarari';

const SIMDI = new Date(2026, 9, 21, 12, 0, 0);
const ESKI = { lat: 41.0, lng: 29.0 };
const AD = { il: 'Istanbul', ilce: 'Uskudar' };

describe('konumYaymasiGerekliMi (denetim D-14)', () => {
    it('~6 km doğu kayması (vakitler ~17 sn) + aynı ad → yayma GEREKMEZ', () => {
        expect(
            konumYaymasiGerekliMi({ eski: ESKI, yeni: { lat: 41.0, lng: 29.0715 }, eskiAdres: AD, yeniAdres: AD, simdi: SIMDI })
        ).toBe(false);
    });

    it('İstanbul → Ankara → yayılır', () => {
        expect(
            konumYaymasiGerekliMi({
                eski: ESKI,
                yeni: { lat: 39.93, lng: 32.86 },
                eskiAdres: AD,
                yeniAdres: AD,
                simdi: SIMDI,
            })
        ).toBe(true);
    });

    it('~25 km doğu (≥1 dk) aynı adla bile yayılır', () => {
        expect(
            konumYaymasiGerekliMi({ eski: ESKI, yeni: { lat: 41.0, lng: 29.3 }, eskiAdres: AD, yeniAdres: AD, simdi: SIMDI })
        ).toBe(true);
    });

    it.each([
        ['ilçe değişti', AD, { il: 'Istanbul', ilce: 'Atasehir' }],
        ['il değişti', AD, { il: 'Kocaeli', ilce: 'Uskudar' }],
        ['eski ad yok', null, AD],
        ['yeni ad çözülemedi', AD, null],
        ['il boş', { il: '', ilce: '' }, { il: '', ilce: '' }],
    ])('%s → yayılır (ihtiyatlı)', (_ad, eskiAdres, yeniAdres) => {
        expect(
            konumYaymasiGerekliMi({ eski: ESKI, yeni: { lat: 41.0, lng: 29.0715 }, eskiAdres, yeniAdres, simdi: SIMDI })
        ).toBe(true);
    });

    it('tam sınır: fark tam 1 dk ise yayılır, 1 dk − 1 ms ise yayılmaz', () => {
        const hesap = (fark: number) => (k: { lat: number; lng: number }) => (k === ESKI ? [0, 0] : [0, fark]);
        const girdi = { eski: ESKI, yeni: { lat: 41, lng: 29.01 }, eskiAdres: AD, yeniAdres: AD, simdi: SIMDI };
        expect(konumYaymasiGerekliMi({ ...girdi, vakitHesapla: hesap(YAYMA_VAKIT_TOLERANSI_MS) })).toBe(true);
        expect(konumYaymasiGerekliMi({ ...girdi, vakitHesapla: hesap(YAYMA_VAKIT_TOLERANSI_MS - 1) })).toBe(false);
    });

    it('hesap fırlatırsa / NaN / boş liste → yayılır', () => {
        const girdi = { eski: ESKI, yeni: { lat: 41, lng: 29.01 }, eskiAdres: AD, yeniAdres: AD, simdi: SIMDI };
        expect(konumYaymasiGerekliMi({ ...girdi, vakitHesapla: () => { throw new Error('x'); } })).toBe(true);
        expect(konumYaymasiGerekliMi({ ...girdi, vakitHesapla: () => [NaN] })).toBe(true);
        expect(konumYaymasiGerekliMi({ ...girdi, vakitHesapla: () => [] })).toBe(true);
    });

    it('varsayılan hesap 7 an verir (bugün 6 + yarının imsağı), yuvarlanmamış', () => {
        const anlar = varsayilanYaymaVakitleri(ESKI, SIMDI);
        expect(anlar).toHaveLength(7);
        expect(anlar.some((ms) => ms % 60000 !== 0)).toBe(true);
        expect(anlar[6] - anlar[0]).toBeGreaterThan(20 * 3600 * 1000);
    });
});
