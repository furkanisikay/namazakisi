/**
 * `useTurkceTtsDestegi` — PLATFORM DAVRANISI.
 *
 * Sozlesme:
 *   `null`  → bilinmiyor → uyari GOSTERME
 *   `true`  → Turkce TTS paketi var
 *   `false` → paket yok → kibar uyari goster
 *
 * iOS'TA HEP `null`. Kopru (`trDestekleniyorMu`) Android disinda `false` doner —
 * "sorgulanamadi" anlaminda, "paket yok" anlaminda DEGIL. Hook bu degeri oldugu
 * gibi state'e yazsaydi iOS'ta "Cihazinizda Turkce konusma paketi bulunamadi"
 * bandi YANLIS yere yanardi: iOS'ta sesli anons zaten TTS ile degil on-kayitli
 * ses klibiyle calisir ve kullanicinin yapabilecegi bir sey yoktur.
 *
 * DIKKAT — bu repoda jest'in VARSAYILAN `Platform.OS` degeri **`ios`**
 * (`preset: "react-native"` → `haste.defaultPlatform: 'ios'`). Platform
 * mock'lamayan her test iOS olarak kosar; bu yuzden asagida platform ACIKCA
 * kurulur.
 */

const mockPlatformDurumu = { OS: 'android' };
jest.mock('react-native', () => ({
  Platform: {
    get OS() {
      return mockPlatformDurumu.OS;
    },
  },
}));

const mockTrDestekleniyorMu = jest.fn();
jest.mock('../../../../modules/expo-countdown-notification/src', () => ({
  trDestekleniyorMu: () => mockTrDestekleniyorMu(),
}));

import { renderHook, waitFor } from '@testing-library/react-native';
import { useTurkceTtsDestegi } from '../useTurkceTtsDestegi';

describe('useTurkceTtsDestegi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPlatformDurumu.OS = 'android';
    mockTrDestekleniyorMu.mockResolvedValue(true);
  });

  describe('Android', () => {
    test('paket VARSA true doner', async () => {
      mockTrDestekleniyorMu.mockResolvedValue(true);
      const { result } = renderHook(() => useTurkceTtsDestegi());
      await waitFor(() => expect(result.current).toBe(true));
    });

    test('paket YOKSA false doner (uyari gosterilir)', async () => {
      mockTrDestekleniyorMu.mockResolvedValue(false);
      const { result } = renderHook(() => useTurkceTtsDestegi());
      await waitFor(() => expect(result.current).toBe(false));
    });

    test('sorgu patlarsa null kalir — YANLIS ALARM YOK', async () => {
      mockTrDestekleniyorMu.mockRejectedValue(new Error('native yok'));
      const { result } = renderHook(() => useTurkceTtsDestegi());
      // Bir kez cagrildigini bekle, sonra degerin hala null oldugunu dogrula.
      await waitFor(() => expect(mockTrDestekleniyorMu).toHaveBeenCalled());
      await waitFor(() => expect(result.current).toBeNull());
    });
  });

  describe('iOS', () => {
    beforeEach(() => {
      mockPlatformDurumu.OS = 'ios';
    });

    test('NOBETCI: kopru HIC sorgulanmaz', () => {
      renderHook(() => useTurkceTtsDestegi());
      expect(mockTrDestekleniyorMu).not.toHaveBeenCalled();
    });

    test('NOBETCI: deger null kalir — kopru false dondurse bile uyari yanmaz', async () => {
      // Kopru Android disinda `false` doner; hook bunu state'e YAZMAMALI.
      mockTrDestekleniyorMu.mockResolvedValue(false);
      const { result } = renderHook(() => useTurkceTtsDestegi());
      await waitFor(() => expect(mockTrDestekleniyorMu).not.toHaveBeenCalled());
      expect(result.current).toBeNull();
    });
  });
});
