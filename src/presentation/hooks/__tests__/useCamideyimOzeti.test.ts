import { camideyimOzetiOlustur } from '../useCamideyimOzeti';
import { aktifDiliKur, aktifDilSifirla } from '../../../core/dil/aktifDil';

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

describe('camideyimOzetiOlustur — İngilizce', () => {
    beforeEach(() => aktifDiliKur('en'));
    afterEach(() => aktifDilSifirla());

    it('özetler İngilizce', () => {
        expect(camideyimOzetiOlustur(null, null)).toEqual({ cami: 'Off', namazModu: 'Off' });
        expect(camideyimOzetiOlustur({ aktif: true, beklemeDk: 4 }, durum()).cami).toBe('After 4 min at the mosque');
        expect(camideyimOzetiOlustur({ aktif: true }, durum({ izin: 'arkaPlanYok' })).cami).toBe('Location permission needed');
        expect(camideyimOzetiOlustur({}, durum({ namazModu: mod(true, { erisim: false }) })).namazModu).toBe('Do Not Disturb access needed');
        expect(camideyimOzetiOlustur({ aktif: true }, durum({ namazModu: mod(true) })).namazModu).toBe("Jumu'ah sermon, at the mosque");
    });
});
