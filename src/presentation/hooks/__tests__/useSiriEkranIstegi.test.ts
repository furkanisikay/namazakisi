/**
 * Siri / Kısayollar "Kıbleyi aç" (issue #279): intent EKRAN İSTEĞİ bırakır, gezinme
 * kabı hazır olunca tüketilir. Köprü global mock'tan (`__mocks__/expo-siri-kisayollari.js`)
 * gelir ve `require` ile kurulur (AGENTS.md: moduleNameMapper mock'una jest.requireMock değil).
 */
import { renderHook, waitFor } from '@testing-library/react-native';
import { useSiriEkranIstegi } from '../useSiriEkranIstegi';

const kopru = require('../../../../modules/expo-siri-kisayollari/src') as {
    siriEkranIstegiAl: jest.Mock;
    siriDegisikliginiDinle: jest.Mock;
};

const navKur = (hazir = true) => ({ isReady: jest.fn(() => hazir), navigate: jest.fn() });

beforeEach(() => {
    jest.clearAllMocks();
    kopru.siriEkranIstegiAl.mockResolvedValue(null);
    kopru.siriDegisikliginiDinle.mockReturnValue(() => undefined);
});

describe('useSiriEkranIstegi', () => {
    it('açılışta bekleyen "kible" isteği Kıble ekranına götürür', async () => {
        kopru.siriEkranIstegiAl.mockResolvedValueOnce('kible');
        const nav = navKur();
        renderHook(() => useSiriEkranIstegi(true, nav as never));
        await waitFor(() => expect(nav.navigate).toHaveBeenCalledWith('KibleSayfasi'));
    });

    it('gezinme hazır DEĞİLKEN istek TÜKETİLMEZ (onReady yeniden dener)', async () => {
        const nav = navKur(false);
        const { result } = renderHook(() => useSiriEkranIstegi(true, nav as never));
        expect(kopru.siriEkranIstegiAl).not.toHaveBeenCalled();

        nav.isReady.mockReturnValue(true);
        kopru.siriEkranIstegiAl.mockResolvedValueOnce('kible');
        result.current();
        await waitFor(() => expect(nav.navigate).toHaveBeenCalledWith('KibleSayfasi'));
    });

    it('uygulama açıkken gelen "ekran" olayı isteği işler', async () => {
        let dinleyici: (tur: string) => void = () => undefined;
        kopru.siriDegisikliginiDinle.mockImplementation((fn: (tur: string) => void) => {
            dinleyici = fn;
            return () => undefined;
        });
        const nav = navKur();
        renderHook(() => useSiriEkranIstegi(true, nav as never));
        await waitFor(() => expect(kopru.siriEkranIstegiAl).toHaveBeenCalledTimes(1));

        kopru.siriEkranIstegiAl.mockResolvedValueOnce('kible');
        dinleyici('kildim'); // başka tür → yok sayılır
        dinleyici('ekran');
        await waitFor(() => expect(nav.navigate).toHaveBeenCalledTimes(1));
        expect(kopru.siriEkranIstegiAl).toHaveBeenCalledTimes(2);
    });

    it('kurulum sihirbazı sürerken (etkin değil) hiçbir şey tüketilmez', () => {
        const nav = navKur();
        const { result } = renderHook(() => useSiriEkranIstegi(false, nav as never));
        result.current();
        expect(kopru.siriEkranIstegiAl).not.toHaveBeenCalled();
        expect(kopru.siriDegisikliginiDinle).not.toHaveBeenCalled();
    });

    it('bilinmeyen ekran adı yok sayılır', async () => {
        kopru.siriEkranIstegiAl.mockResolvedValueOnce('bilinmeyen');
        const nav = navKur();
        renderHook(() => useSiriEkranIstegi(true, nav as never));
        await waitFor(() => expect(kopru.siriEkranIstegiAl).toHaveBeenCalled());
        expect(nav.navigate).not.toHaveBeenCalled();
    });
});
