import { renderHook, waitFor } from '@testing-library/react-native';
import { useCihazDurumu } from '../useCihazDurumu';

const mockOku = jest.fn();
jest.mock('../../../domain/services/CihazDurumOkuyucu', () => ({
    TUM_CIHAZ_ALANLARI: ['konumIzni'],
    surumuOku: () => ({ platform: 'android', ana: 35, alt: 0, tam: '15' }),
    cihazDurumunuOku: (...a: unknown[]) => mockOku(...a),
}));

describe('useCihazDurumu', () => {
    beforeEach(() => mockOku.mockReset());

    it('sürüm ilk çizimde senkron bilinir, alan okununca dolar', async () => {
        mockOku.mockResolvedValue({ konumIzni: 'reddedildi' });
        const { result } = renderHook(() => useCihazDurumu(['konumIzni']));
        expect(result.current.durum.surum?.ana).toBe(35);
        expect(result.current.durum.konumIzni).toBeNull();
        await waitFor(() => expect(result.current.durum.konumIzni).toBe('reddedildi'));
        expect(mockOku).toHaveBeenCalledWith(['konumIzni']);
    });

    it('etkin değilken okumaz', () => {
        renderHook(() => useCihazDurumu(['konumIzni'], false));
        expect(mockOku).not.toHaveBeenCalled();
    });
});
