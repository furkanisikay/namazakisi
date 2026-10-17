/**
 * takvimCakismaSlice (issue #291) — varsayılan KAPALI, kayıttan SONRA yeniden
 * planlama, koordinat PARAMETRE, kapatmak rıza kaydını SİLER.
 */
import { configureStore } from '@reduxjs/toolkit';
import reducer, { takvimCakismaAyarlariniYukle, takvimCakismaAyariniGuncelle } from '../takvimCakismaSlice';
import { LocalTakvimCakismaServisi } from '../../../data/local/LocalTakvimCakismaServisi';
import { TakvimCakismaServisi } from '../../../domain/services/TakvimCakismaServisi';
import { VARSAYILAN_TAKVIM_CAKISMA_AYARLARI } from '../../../core/takvimCakisma/takvimCakismaAyarlari';

jest.mock('../../../data/local/LocalTakvimCakismaServisi', () => ({
    LocalTakvimCakismaServisi: { getAyarlar: jest.fn(), saveAyarlar: jest.fn() },
}));
jest.mock('../../../domain/services/TakvimCakismaServisi', () => ({
    TakvimCakismaServisi: { getInstance: jest.fn() },
}));

const KONUM = { lat: 41.0082, lng: 28.9784 };
const RIZA = '2026-10-13T10:00:00.000Z';
const storeOlustur = () =>
    configureStore({ reducer: { takvimCakisma: reducer, konum: () => ({ koordinatlar: KONUM }) } });

const mockGuncelle = jest.fn().mockResolvedValue(undefined);

beforeEach(() => {
    jest.clearAllMocks();
    (TakvimCakismaServisi.getInstance as jest.Mock).mockReturnValue({ hatirlatmalariGuncelle: mockGuncelle });
    (LocalTakvimCakismaServisi.saveAyarlar as jest.Mock).mockResolvedValue(true);
    (LocalTakvimCakismaServisi.getAyarlar as jest.Mock).mockResolvedValue({ ...VARSAYILAN_TAKVIM_CAKISMA_AYARLARI });
});

describe('takvimCakismaSlice', () => {
    it('varsayılan KAPALI ve etkinlik adı GİZLİ', () => {
        expect(storeOlustur().getState().takvimCakisma.ayarlar).toMatchObject({ aktif: false, baslikGoster: false });
    });

    it('yükleme diskteki ayarı state\'e yazar', async () => {
        (LocalTakvimCakismaServisi.getAyarlar as jest.Mock).mockResolvedValue({
            ...VARSAYILAN_TAKVIM_CAKISMA_AYARLARI,
            aktif: true,
            rizaZamani: RIZA,
        });
        const store = storeOlustur();
        await store.dispatch(takvimCakismaAyarlariniYukle());
        expect(store.getState().takvimCakisma.ayarlar).toMatchObject({ aktif: true, rizaZamani: RIZA });
    });

    it('açma: rıza ile birlikte kaydedilir, SONRA koordinatla yeniden planlanır', async () => {
        const normalize = { ...VARSAYILAN_TAKVIM_CAKISMA_AYARLARI, aktif: true, rizaZamani: RIZA };
        (LocalTakvimCakismaServisi.getAyarlar as jest.Mock).mockResolvedValue(normalize);
        const store = storeOlustur();
        await store.dispatch(takvimCakismaAyariniGuncelle({ aktif: true, rizaZamani: RIZA }));
        expect(LocalTakvimCakismaServisi.saveAyarlar).toHaveBeenCalledWith(normalize);
        expect(mockGuncelle).toHaveBeenCalledWith(KONUM);
        expect(store.getState().takvimCakisma.ayarlar).toEqual(normalize);
    });

    it('kapatmak rıza kaydını SİLER (yeniden açan açıklamayı yeniden görür)', async () => {
        (LocalTakvimCakismaServisi.getAyarlar as jest.Mock).mockResolvedValue({
            ...VARSAYILAN_TAKVIM_CAKISMA_AYARLARI,
            aktif: true,
            rizaZamani: RIZA,
        });
        const store = storeOlustur();
        await store.dispatch(takvimCakismaAyarlariniYukle());
        await store.dispatch(takvimCakismaAyariniGuncelle({ aktif: false }));
        const yazilan = (LocalTakvimCakismaServisi.saveAyarlar as jest.Mock).mock.calls[0][0];
        expect(yazilan.aktif).toBe(false);
        expect(yazilan).not.toHaveProperty('rizaZamani');
    });

    it('kapatmak sesli/alarm rızasına ve adımlara DOKUNMAZ (ayardır; yalnız takvim rızası silinir)', async () => {
        (LocalTakvimCakismaServisi.getAyarlar as jest.Mock).mockResolvedValue({
            ...VARSAYILAN_TAKVIM_CAKISMA_AYARLARI,
            aktif: true,
            rizaZamani: RIZA,
            sesliOnayi: true,
            alarmOnayi: true,
        });
        const store = storeOlustur();
        await store.dispatch(takvimCakismaAyarlariniYukle());
        await store.dispatch(takvimCakismaAyariniGuncelle({ aktif: false }));
        const yazilan = (LocalTakvimCakismaServisi.saveAyarlar as jest.Mock).mock.calls[0][0];
        expect(yazilan).toMatchObject({ aktif: false, sesliOnayi: true, alarmOnayi: true });
        expect(yazilan.adimlar).toEqual(VARSAYILAN_TAKVIM_CAKISMA_AYARLARI.adimlar);
    });

    it('disk yazımı başarısızsa planlama YAPILMAZ ve state değişmez', async () => {
        (LocalTakvimCakismaServisi.saveAyarlar as jest.Mock).mockResolvedValue(false);
        const store = storeOlustur();
        await store.dispatch(takvimCakismaAyariniGuncelle({ aktif: true, rizaZamani: RIZA }));
        expect(mockGuncelle).not.toHaveBeenCalled();
        expect(store.getState().takvimCakisma.ayarlar.aktif).toBe(false);
        expect(store.getState().takvimCakisma.hata).toBeTruthy();
    });
});
