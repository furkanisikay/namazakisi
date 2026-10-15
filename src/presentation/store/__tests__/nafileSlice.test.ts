import { configureStore } from '@reduxjs/toolkit';
import nafileReducer, { nafileAyarlariniYukle, nafileAyariniGuncelle, nafileAyarlariniBirlestir } from '../nafileSlice';
import { LocalNafileServisi } from '../../../data/local/LocalNafileServisi';
import { VARSAYILAN_NAFILE_AYARLARI } from '../../../core/nafile/nafileTipleri';

jest.mock('../../../data/local/LocalNafileServisi', () => ({
    ...jest.requireActual('../../../data/local/LocalNafileServisi'),
    LocalNafileServisi: { getAyarlar: jest.fn(), saveAyarlar: jest.fn() },
}));
const mockGuncelle = jest.fn(() => Promise.resolve());
jest.mock('../../../domain/services/NafileHatirlatmaServisi', () => ({
    NafileHatirlatmaServisi: { getInstance: () => ({ hatirlatmalariGuncelle: mockGuncelle }) },
}));

const ANKARA = { lat: 39.92, lng: 32.85 };
const storeKur = () =>
    configureStore({
        reducer: { nafile: nafileReducer, konum: (s = { koordinatlar: ANKARA }) => s },
    });

describe('nafileSlice', () => {
    beforeEach(() => jest.clearAllMocks());

    it('initialState hepsi kapalı ve yuklendi=false (ana ekran gerçek veri sanmasın)', () => {
        const s = storeKur().getState().nafile;
        expect(s.ayarlar).toEqual(VARSAYILAN_NAFILE_AYARLARI);
        expect(s.yuklendi).toBe(false);
    });

    it('yükleme diskteki ayarı yazar', async () => {
        const disk = { ...VARSAYILAN_NAFILE_AYARLARI, gostergeAktif: true };
        (LocalNafileServisi.getAyarlar as jest.Mock).mockResolvedValue(disk);
        const store = storeKur();
        await store.dispatch(nafileAyarlariniYukle());
        expect(store.getState().nafile).toMatchObject({ ayarlar: disk, yuklendi: true });
    });

    it('güncelleme: iç içe birleştirir, kaydeder ve store koordinatıyla YENİDEN PLANLAR', async () => {
        (LocalNafileServisi.saveAyarlar as jest.Mock).mockResolvedValue(true);
        (LocalNafileServisi.getAyarlar as jest.Mock).mockImplementation(async () =>
            (LocalNafileServisi.saveAyarlar as jest.Mock).mock.calls.at(-1)[0]
        );
        const store = storeKur();
        await store.dispatch(nafileAyariniGuncelle({ hatirlatmalar: { evvabin: { aktif: true } } }));

        const kaydedilen = (LocalNafileServisi.saveAyarlar as jest.Mock).mock.calls[0][0];
        expect(kaydedilen.hatirlatmalar.evvabin).toEqual({ ...VARSAYILAN_NAFILE_AYARLARI.hatirlatmalar.evvabin, aktif: true });
        expect(kaydedilen.hatirlatmalar.kusluk).toEqual(VARSAYILAN_NAFILE_AYARLARI.hatirlatmalar.kusluk);
        expect(mockGuncelle).toHaveBeenCalledWith(ANKARA);
        expect(store.getState().nafile.ayarlar.hatirlatmalar.evvabin.aktif).toBe(true);
    });

    it('kayıt başarısızsa planlama YAPILMAZ', async () => {
        (LocalNafileServisi.saveAyarlar as jest.Mock).mockResolvedValue(false);
        await storeKur().dispatch(nafileAyariniGuncelle({ gostergeAktif: true }));
        expect(mockGuncelle).not.toHaveBeenCalled();
    });

    it('birleştirme teheccüd alanlarını kısmen günceller', () => {
        const b = nafileAyarlariniBirlestir(VARSAYILAN_NAFILE_AYARLARI, { teheccud: { uyandirma: true } });
        expect(b.teheccud).toEqual({ ...VARSAYILAN_NAFILE_AYARLARI.teheccud, uyandirma: true });
    });

    it('sesli anons rızası (issue #273) birleştirmede taşınır, yazılmadıkça UYDURULMAZ', () => {
        const onayli = nafileAyarlariniBirlestir(VARSAYILAN_NAFILE_AYARLARI, { sesliOnayi: true });
        expect(onayli.sesliOnayi).toBe(true);
        expect(nafileAyarlariniBirlestir(onayli, { gostergeAktif: true }).sesliOnayi).toBe(true);
        expect(nafileAyarlariniBirlestir(VARSAYILAN_NAFILE_AYARLARI, { gostergeAktif: true })).not.toHaveProperty('sesliOnayi');
    });
});
