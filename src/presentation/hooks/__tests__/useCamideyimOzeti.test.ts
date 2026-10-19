import { camideyimOzetiOlustur } from '../useCamideyimOzeti';

const mod = (etkin: boolean, ek: object = {}) => ({
    destek: 'kural' as const,
    erisim: true,
    kuralVar: true,
    aktif: false,
    ayarlar: { etkin, cuma: true, vakit: false, vakitSureDk: 20, kildimKapat: true },
    ...ek,
});
const durum = (ek: object = {}) => ({
    veriVar: true,
    kayitSayisi: 1,
    veriZamani: 0,
    izin: 'tamam' as const,
    izlenenSayisi: 1,
    camide: null,
    sessizBitisMs: 0,
    namazModu: mod(false),
    ...ek,
});

describe('camideyimOzetiOlustur', () => {
    it('kapalı / açık / izin eksik / camide', () => {
        expect(camideyimOzetiOlustur(null, null)).toEqual({ cami: 'Kapalı', namazModu: 'Kapalı' });
        expect(camideyimOzetiOlustur({ aktif: true, beklemeDk: 4 }, durum()).cami).toBe('Camide 4 dk kalınca');
        expect(camideyimOzetiOlustur({ aktif: true }, durum({ izin: 'arkaPlanYok' })).cami).toBe('Konum izni gerekiyor');
        expect(
            camideyimOzetiOlustur({ aktif: true }, durum({ camide: { yerId: 'x', ad: 'Kare Camii' } })).cami
        ).toBe('Şu an camidesiniz');
    });

    it('Namaz modu: erişim, etkin tetikler', () => {
        expect(camideyimOzetiOlustur({}, durum({ namazModu: mod(true, { erisim: false }) })).namazModu).toBe(
            'Rahatsız Etmeyin erişimi gerekiyor'
        );
        expect(camideyimOzetiOlustur({ aktif: true }, durum({ namazModu: mod(true) })).namazModu).toBe('Cuma hutbesi, camide');
        expect(camideyimOzetiOlustur({}, durum({ namazModu: mod(true, { aktif: true }) })).namazModu).toBe('Şu an açık');
    });
});
