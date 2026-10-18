import { aktarimOzeti, bekleyenDegisiklikVarMi, type AktarimAyarlari } from '../aktarimOzeti';

const vakit = (aktif: boolean) => ({ aktif, sureDakika: 15, baslangicTipi: 'vakit_girisi', dakika: 5 });
const ayar = (degisik: Partial<AktarimAyarlari> = {}): AktarimAyarlari => ({
    takvimId: 'k1',
    kaciGunIlerisi: 7,
    vakitAyarlari: { imsak: vakit(true), ogle: vakit(false) },
    ...degisik,
});

describe('aktarimOzeti / bekleyenDegisiklikVarMi', () => {
    it('hiç aktarılmadıysa bant yok', () => {
        expect(bekleyenDegisiklikVarMi(null, ayar())).toBe(false);
    });

    it('aynı ayar → bekleyen yok; anahtar sırası özeti değiştirmez', () => {
        const ozet = aktarimOzeti(ayar());
        expect(bekleyenDegisiklikVarMi(ozet, ayar({ vakitAyarlari: { ogle: vakit(false), imsak: vakit(true) } }))).toBe(false);
    });

    it.each([
        ['takvim', { takvimId: 'k2' }],
        ['gün sayısı', { kaciGunIlerisi: 14 }],
        ['vakit açma', { vakitAyarlari: { imsak: vakit(true), ogle: vakit(true) } }],
        ['süre', { vakitAyarlari: { imsak: { ...vakit(true), sureDakika: 20 }, ogle: vakit(false) } }],
    ])('%s değişince bekleyen değişiklik var', (_ad, degisik) => {
        expect(bekleyenDegisiklikVarMi(aktarimOzeti(ayar()), ayar(degisik as Partial<AktarimAyarlari>))).toBe(true);
    });
});
