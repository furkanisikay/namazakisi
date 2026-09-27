/**
 * `useTurkceTtsDestegi` — PLATFORM DAVRANISI.
 *
 * Sozlesme:
 *   `null`  → bilinmiyor → uyari GOSTERME
 *   `true`  → Turkce TTS paketi var
 *   `false` → paket yok → kibar uyari goster
 *
 * iOS'TA ANDROID KOPRUSU SORULMAZ. `trDestekleniyorMu` Android disinda `false`
 * doner — "sorgulanamadi" anlaminda, "paket yok" anlaminda DEGIL; state'e
 * yazilsaydi uyari bandi YANLIS yere yanardi. Faz 2'den beri iOS'ta soru
 * cihaz-ici anons modulune sorulur (Turkce ses yoksa klip uretilmez, anons
 * duyulmaz → uyari anlamli). Modul bu build'de yoksa soru hic sorulmaz: `null`.
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

const mockAnonsModuluVarMi = jest.fn();
const mockTrSesTanimlayici = jest.fn();
jest.mock('../../../../modules/expo-muhafiz-anons/src', () => ({
  anonsModuluVarMi: () => mockAnonsModuluVarMi(),
  trSesTanimlayici: () => mockTrSesTanimlayici(),
}));

import { renderHook, waitFor } from '@testing-library/react-native';
import { useTurkceTtsDestegi } from '../useTurkceTtsDestegi';

describe('useTurkceTtsDestegi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPlatformDurumu.OS = 'android';
    mockTrDestekleniyorMu.mockResolvedValue(true);
    mockAnonsModuluVarMi.mockReturnValue(false);
    mockTrSesTanimlayici.mockResolvedValue(null);
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

    test('NOBETCI: Android koprusu HIC sorgulanmaz', () => {
      mockAnonsModuluVarMi.mockReturnValue(true);
      renderHook(() => useTurkceTtsDestegi());
      expect(mockTrDestekleniyorMu).not.toHaveBeenCalled();
    });

    test('NOBETCI: anons modulu YOKSA null kalir — kopru false dondurse bile uyari yanmaz', async () => {
      // Eski build / Expo Go: `trSesTanimlayici` modul yokken de null doner;
      // "Turkce ses yok" sanilip uyari yakilmamali.
      mockTrDestekleniyorMu.mockResolvedValue(false);
      const { result } = renderHook(() => useTurkceTtsDestegi());
      expect(mockTrSesTanimlayici).not.toHaveBeenCalled();
      expect(result.current).toBeNull();
    });

    test('modul var + Turkce ses VAR → true', async () => {
      mockAnonsModuluVarMi.mockReturnValue(true);
      mockTrSesTanimlayici.mockResolvedValue('com.apple.voice.compact.tr-TR.Yelda');
      const { result } = renderHook(() => useTurkceTtsDestegi());
      await waitFor(() => expect(result.current).toBe(true));
    });

    test('modul var + Turkce ses YOK → false (uyari gosterilir)', async () => {
      mockAnonsModuluVarMi.mockReturnValue(true);
      mockTrSesTanimlayici.mockResolvedValue(null);
      const { result } = renderHook(() => useTurkceTtsDestegi());
      await waitFor(() => expect(result.current).toBe(false));
    });
  });
});
