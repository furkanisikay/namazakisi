/**
 * iPhone'da eklenen sesi silmek: dosya + HER kayıt varsayılana + değişen slice'lar diskten
 * tazelenir + planlar tek yayma listesiyle yenilenir (planlı bildirim silinen dosyayı istemesin).
 */
const mockVarsayilanaDondur = jest.fn();
jest.mock('../../../data/local/LocalSesReferansServisi', () => ({
    LocalSesReferansServisi: { varsayilanaDondur: (k: string) => mockVarsayilanaDondur(k) },
}));
const mockKonumDegistiUygula = jest.fn(async (_k: unknown) => undefined);
jest.mock('../../../domain/services/KonumDegisikligiServisi', () => ({
    konumDegistiUygula: (k: unknown) => mockKonumDegistiUygula(k),
}));
jest.mock('../muhafizSlice', () => ({ muhafizAyarlariniYukle: () => ({ type: 'yukle/muhafiz' }) }));
jest.mock('../cumaHatirlatmaSlice', () => ({ cumaHatirlatmaAyarlariniYukle: () => ({ type: 'yukle/cuma' }) }));
jest.mock('../vakitBildirimSlice', () => ({ vakitBildirimSesleriniYukle: () => ({ type: 'yukle/vakitSesi' }) }));

import { iosSesiniSil } from '../iosSesSilme';
import { cihazdaCalinirMi, eklenmisSesleriAyarla, sesPlatformunuAyarla } from '../../../core/muhafiz/sesKimligi';

const anons = require('../../../../modules/expo-muhafiz-anons/src') as Record<string, jest.Mock>;
const DOSYA = 'kullanici_ses_0123abcd.caf';

async function calistir(kimlik: string, koordinatlar: { lat: number; lng: number } | null = { lat: 41, lng: 29 }) {
    const dispatch = jest.fn(async (a: unknown) => a);
    const sonuc = await iosSesiniSil(kimlik)(dispatch as never, () => ({ konum: { koordinatlar } }), undefined);
    return { dispatch, sonuc };
}

describe('iosSesiniSil', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        sesPlatformunuAyarla('ios');
        anons.iceAktarilanSesiSil.mockResolvedValue(true);
        anons.iceAktarilanSesler.mockResolvedValue([]);
        mockVarsayilanaDondur.mockResolvedValue(['muhafiz', 'cuma', 'vakitSesi']);
    });

    afterEach(() => {
        sesPlatformunuAyarla('android');
        eklenmisSesleriAyarla(null);
    });

    it('dosyayı siler, kayıtları düzeltir, DEĞİŞEN slice\'ları tazeler ve planları yeniler', async () => {
        const { dispatch, sonuc } = await calistir(`dosya:${DOSYA}`);
        expect(anons.iceAktarilanSesiSil).toHaveBeenCalledWith(DOSYA);
        expect(mockVarsayilanaDondur).toHaveBeenCalledWith(`dosya:${DOSYA}`);
        const tipler = dispatch.mock.calls.map((c) => (c[0] as { type: string }).type);
        expect(tipler).toEqual(expect.arrayContaining(['yukle/muhafiz', 'yukle/cuma', 'yukle/vakitSesi']));
        expect(mockKonumDegistiUygula).toHaveBeenCalledWith({ lat: 41, lng: 29 });
        expect((sonuc as { payload: unknown }).payload).toEqual(['muhafiz', 'cuma', 'vakitSesi']);
        // Ad üreticisi silinen dosyayı hemen "çalınmaz" görür (ekran varsayılanı gösterir).
        expect(cihazdaCalinirMi(`dosya:${DOSYA}`)).toBe(false);
    });

    it('hiçbir kayıt kullanmıyorsa yeniden plan YAPILMAZ', async () => {
        mockVarsayilanaDondur.mockResolvedValue([]);
        await calistir(`dosya:${DOSYA}`);
        expect(anons.iceAktarilanSesiSil).toHaveBeenCalledWith(DOSYA);
        expect(mockKonumDegistiUygula).not.toHaveBeenCalled();
    });

    it('konum yoksa ({0,0}) plan kurulmaz ama kayıtlar yine düzelir', async () => {
        await calistir(`dosya:${DOSYA}`, { lat: 0, lng: 0 });
        expect(mockVarsayilanaDondur).toHaveBeenCalled();
        expect(mockKonumDegistiUygula).not.toHaveBeenCalled();
    });

    it('dosya kimliği olmayan (paket/bozuk) girdiye dokunmaz', async () => {
        await calistir('paket:zil');
        await calistir('dosya:../x.caf');
        expect(anons.iceAktarilanSesiSil).not.toHaveBeenCalled();
        expect(mockVarsayilanaDondur).not.toHaveBeenCalled();
    });
});
