import { act, renderHook, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useKurulumOnarimi } from '../useKurulumOnarimi';

const mockIzin = jest.fn();
const mockTamAlarm = jest.fn();
const mockEylem = jest.fn();

jest.mock('../../../domain/services/BildirimIzinOkuyucu', () => ({ izinDurumunuOku: () => mockIzin() }));
jest.mock('../../../domain/services/SistemDurumuOkuyucu', () => ({ tamAlarmDurumunuOku: () => mockTamAlarm() }));
jest.mock('../../../domain/services/DurumEylemleri', () => ({ durumEylemiUygula: (e: string) => mockEylem(e), ANDROID_BILDIRIM_IZNI_API: 33 }));
jest.mock('../../store/hooks', () => ({
    useAppSelector: (sec: (s: unknown) => unknown) => sec({ muhafiz: { aktif: true }, vakitBildirim: { ayarlar: {} } }),
}));

describe('useKurulumOnarimi', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (AsyncStorage.clear as () => Promise<void>)();
        mockIzin.mockResolvedValue('verildi');
        mockTamAlarm.mockResolvedValue('verildi');
        mockEylem.mockResolvedValue(true);
    });

    it('sorun yokken bant yok', async () => {
        const { result } = renderHook(() => useKurulumOnarimi());
        await waitFor(() => expect(mockTamAlarm).toHaveBeenCalled());
        expect(result.current.sorun).toBeNull();
    });

    it('kapalı bildirim iznini söyler; yeniden istek reddedilirse uygulama ayarlarını açar', async () => {
        mockIzin.mockResolvedValue('reddedildi');
        const ayar = jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);
        const { result } = renderHook(() => useKurulumOnarimi());
        await waitFor(() => expect(result.current.sorun).toBe('bildirimIzni'));
        await act(async () => {
            result.current.onar();
        });
        await waitFor(() => expect(ayar).toHaveBeenCalled());
        expect(mockEylem).toHaveBeenCalledWith('bildirimIzni');
    });

    it('"Şimdi değil" 7 gün diske yazılır: yeniden açılışta da susar, sıradaki sorun görünür', async () => {
        mockIzin.mockResolvedValue('reddedildi');
        mockTamAlarm.mockResolvedValue('reddedildi');
        const { result } = renderHook(() => useKurulumOnarimi());
        await waitFor(() => expect(result.current.sorun).toBe('bildirimIzni'));
        act(() => result.current.ertele());
        expect(result.current.sorun).toBe('tamAlarm');
        await waitFor(async () =>
            expect(JSON.parse((await AsyncStorage.getItem('@namaz_akisi/kurulum_onarim_erteleme')) ?? '{}')).toHaveProperty('bildirimIzni'),
        );
        const ikinci = renderHook(() => useKurulumOnarimi());
        await waitFor(() => expect(ikinci.result.current.sorun).toBe('tamAlarm'));
    });

    it('7 günden eski erteleme geçersizdir', async () => {
        mockIzin.mockResolvedValue('reddedildi');
        await AsyncStorage.setItem('@namaz_akisi/kurulum_onarim_erteleme', JSON.stringify({ bildirimIzni: Date.now() - 8 * 86400000 }));
        const { result } = renderHook(() => useKurulumOnarimi());
        await waitFor(() => expect(result.current.sorun).toBe('bildirimIzni'));
    });
});
