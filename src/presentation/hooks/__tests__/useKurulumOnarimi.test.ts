import { act, renderHook, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { kurulumOnarimiErtelemeleriniSifirla, useKurulumOnarimi } from '../useKurulumOnarimi';

const mockIzin = jest.fn();
const mockTamAlarm = jest.fn();
const mockEylem = jest.fn();

jest.mock('../../../domain/services/BildirimIzinOkuyucu', () => ({ izinDurumunuOku: () => mockIzin() }));
jest.mock('../../../domain/services/SistemDurumuOkuyucu', () => ({ tamAlarmDurumunuOku: () => mockTamAlarm() }));
jest.mock('../../../domain/services/DurumEylemleri', () => ({ durumEylemiUygula: (e: string) => mockEylem(e) }));
jest.mock('../../store/hooks', () => ({
    useAppSelector: (sec: (s: unknown) => unknown) => sec({ muhafiz: { aktif: true }, vakitBildirim: { ayarlar: {} } }),
}));

describe('useKurulumOnarimi', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        kurulumOnarimiErtelemeleriniSifirla();
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

    it('"Şimdi değil" bu oturumda susturur, sıradaki sorun görünür', async () => {
        mockIzin.mockResolvedValue('reddedildi');
        mockTamAlarm.mockResolvedValue('reddedildi');
        const { result } = renderHook(() => useKurulumOnarimi());
        await waitFor(() => expect(result.current.sorun).toBe('bildirimIzni'));
        act(() => result.current.ertele());
        expect(result.current.sorun).toBe('tamAlarm');
    });
});
