/**
 * yatisHatirlatmaSlice (issue #290) — varsayılan KAPALI, kayıttan SONRA
 * yeniden planlama, koordinat PARAMETRE, disk yazımı başarısızsa planlama yok.
 */
import { configureStore } from '@reduxjs/toolkit';
import reducer, { yatisHatirlatmaAyarlariniYukle, yatisHatirlatmaAyariniGuncelle } from '../yatisHatirlatmaSlice';
import { LocalYatisHatirlatmaServisi } from '../../../data/local/LocalYatisHatirlatmaServisi';
import { YatisHatirlatmaServisi } from '../../../domain/services/YatisHatirlatmaServisi';
import { YATIS_VARSAYILAN_AYARLARI } from '../../../core/yatis/yatisPlani';

jest.mock('../../../data/local/LocalYatisHatirlatmaServisi', () => ({
    LocalYatisHatirlatmaServisi: { getAyarlar: jest.fn(), saveAyarlar: jest.fn() },
}));
jest.mock('../../../domain/services/YatisHatirlatmaServisi', () => ({
    YatisHatirlatmaServisi: { getInstance: jest.fn() },
}));

const KONUM = { lat: 41.0082, lng: 28.9784 };
const storeOlustur = () =>
    configureStore({ reducer: { yatisHatirlatma: reducer, konum: () => ({ koordinatlar: KONUM }) } });

const mockGuncelle = jest.fn().mockResolvedValue(undefined);

beforeEach(() => {
    jest.clearAllMocks();
    (YatisHatirlatmaServisi.getInstance as jest.Mock).mockReturnValue({ hatirlatmalariGuncelle: mockGuncelle });
    (LocalYatisHatirlatmaServisi.saveAyarlar as jest.Mock).mockResolvedValue(true);
    (LocalYatisHatirlatmaServisi.getAyarlar as jest.Mock).mockResolvedValue({ ...YATIS_VARSAYILAN_AYARLARI });
});

describe('yatisHatirlatmaSlice', () => {
    it('varsayılan KAPALI (yatış saati kişisel; ayardan açılır)', () => {
        expect(storeOlustur().getState().yatisHatirlatma.ayarlar.aktif).toBe(false);
    });

    it('yükleme diskteki ayarı state\'e yazar', async () => {
        (LocalYatisHatirlatmaServisi.getAyarlar as jest.Mock).mockResolvedValue({ ...YATIS_VARSAYILAN_AYARLARI, aktif: true, saat: 0 });
        const store = storeOlustur();
        await store.dispatch(yatisHatirlatmaAyarlariniYukle());
        expect(store.getState().yatisHatirlatma.ayarlar).toMatchObject({ aktif: true, saat: 0 });
    });

    it('güncelleme: kısmi değişiklik birleştirilir, kaydedilir, SONRA koordinatla yeniden planlanır', async () => {
        const normalize = { ...YATIS_VARSAYILAN_AYARLARI, aktif: true };
        (LocalYatisHatirlatmaServisi.getAyarlar as jest.Mock).mockResolvedValue(normalize);
        const store = storeOlustur();
        await store.dispatch(yatisHatirlatmaAyariniGuncelle({ aktif: true }));
        expect(LocalYatisHatirlatmaServisi.saveAyarlar).toHaveBeenCalledWith({ ...YATIS_VARSAYILAN_AYARLARI, aktif: true });
        expect(mockGuncelle).toHaveBeenCalledWith(KONUM, normalize);
        expect(store.getState().yatisHatirlatma.ayarlar).toEqual(normalize);
    });

    it('disk yazımı başarısızsa planlama YAPILMAZ ve state değişmez', async () => {
        (LocalYatisHatirlatmaServisi.saveAyarlar as jest.Mock).mockResolvedValue(false);
        const store = storeOlustur();
        await store.dispatch(yatisHatirlatmaAyariniGuncelle({ aktif: true }));
        expect(mockGuncelle).not.toHaveBeenCalled();
        expect(store.getState().yatisHatirlatma.ayarlar.aktif).toBe(false);
        expect(store.getState().yatisHatirlatma.hata).toBeTruthy();
    });
});
