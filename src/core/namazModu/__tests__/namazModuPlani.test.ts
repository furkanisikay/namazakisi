import {
    CUMA_HUTBE_SURESI_DK,
    VARSAYILAN_NAMAZ_MODU_AYARLARI,
    namazModuAyarlariniNormalize,
    namazModuPlaniOlustur,
    turdanNamaz,
} from '../namazModuPlani';
import type { GunGirisleri } from '../../cami/camiKarar';

const DK = 60_000;
const gun = (tarih: string, cuma: boolean, taban: number): GunGirisleri => ({
    tarih,
    cuma,
    girisler: { imsak: taban, ogle: taban + 400 * DK, ikindi: taban + 600 * DK, aksam: taban + 780 * DK, yatsi: taban + 860 * DK },
});

describe('namazModuPlaniOlustur', () => {
    const gunler = [gun('2026-10-15', false, 0), gun('2026-10-16', true, 1440 * DK)];

    it('kapalıyken hiç pencere yok', () => {
        expect(namazModuPlaniOlustur(gunler, { ...VARSAYILAN_NAMAZ_MODU_AYARLARI, etkin: false })).toEqual([]);
    });

    it('varsayılan: yalnız cuma hutbesi (öğle girişi → +50 dk)', () => {
        const plan = namazModuPlaniOlustur(gunler, { ...VARSAYILAN_NAMAZ_MODU_AYARLARI, etkin: true });
        expect(plan).toEqual([
            { bas: 1440 * DK + 400 * DK, son: 1440 * DK + (400 + CUMA_HUTBE_SURESI_DK) * DK, tur: 'cuma:2026-10-16' },
        ]);
    });

    it('her vakit: N dk; cuma öğlesinde hutbe penceresi tekildir', () => {
        const plan = namazModuPlaniOlustur(gunler, { ...VARSAYILAN_NAMAZ_MODU_AYARLARI, etkin: true, vakit: true, vakitSureDk: 15 });
        expect(plan).toHaveLength(10);
        expect(plan.filter((p) => p.tur.includes('2026-10-16_ogle'))).toEqual([]);
        expect(plan.find((p) => p.tur === 'vakit:2026-10-15_ikindi')).toEqual({ bas: 600 * DK, son: 615 * DK, tur: 'vakit:2026-10-15_ikindi' });
        // Kronolojik
        expect([...plan].sort((a, b) => a.bas - b.bas)).toEqual(plan);
    });

    it('bitmiş pencereler atılır', () => {
        const plan = namazModuPlaniOlustur(gunler, { ...VARSAYILAN_NAMAZ_MODU_AYARLARI, etkin: true, vakit: true }, 1440 * DK);
        expect(plan.every((p) => p.son > 1440 * DK)).toBe(true);
    });
});

describe('namazModuAyarlariniNormalize', () => {
    it('bozuk kayıt varsayılana düşer, süre kenetlenir', () => {
        expect(namazModuAyarlariniNormalize(null)).toEqual(VARSAYILAN_NAMAZ_MODU_AYARLARI);
        expect(namazModuAyarlariniNormalize({ etkin: true, vakitSureDk: 999 }).vakitSureDk).toBe(40);
        expect(namazModuAyarlariniNormalize({ vakitSureDk: 1 }).vakitSureDk).toBe(10);
        expect(namazModuAyarlariniNormalize({ cuma: false, kildimKapat: false })).toMatchObject({ cuma: false, kildimKapat: false });
    });
});

describe('turdanNamaz', () => {
    it.each([
        ['cuma:2026-10-16', { tarih: '2026-10-16', vakit: 'ogle' }],
        ['vakit:2026-10-15_ikindi', { tarih: '2026-10-15', vakit: 'ikindi' }],
        ['cami:2026-10-15_yatsi', { tarih: '2026-10-15', vakit: 'yatsi' }],
        ['cami:?_serbest', null],
        // NÖBETÇİ (inceleme bulgusu 3): bilekten açılan mod da "Kıldım" ile kapanır.
        ['saat:2026-10-15_imsak', { tarih: '2026-10-15', vakit: 'imsak' }],
        ['saat:2026-10-15_serbest', null],
        // Vakit kapısı kapalıyken native `IzlemeKarari.camiTuru` biçimi: vakit
        // bilinmediği için namaza ÇÖZÜLMEZ (yanlış namazın "kıldım"ı modu kapatmasın).
        ['cami:2026-10-15_serbest_osm:n123', null],
        ['vakit:2026-10-15_gunes', null],
        ['bozuk', null],
    ])('%s', (tur, beklenen) => {
        expect(turdanNamaz(tur)).toEqual(beklenen);
    });
});
