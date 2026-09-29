/**
 * useKonumYenile — "konumu yenile" eyleminin tek kaynağı.
 *
 * Ana ekran çipi ve Ayarlar satırı bu hook'u paylaşır; sonuç metinleri ve izin
 * yönlendirmesi burada sabitlenir ki iki ekran zamanla ayrışmasın.
 */
import { renderHook, act } from '@testing-library/react-native';
import { useKonumYenile } from '../useKonumYenile';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { kisaBildirimGoster } from '../../components/common/KisaBildirim';

// Mesaj platforma göre farklı çizilir (Android sistem toastı, iOS uygulama katmanı);
// hook yalnız NE söyleneceğine karar verir, onu ölçeriz.
jest.mock('../../components/common/KisaBildirim', () => ({ kisaBildirimGoster: jest.fn() }));

jest.mock('../../store/hooks', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

jest.mock('../../store/konumSlice', () => ({
  konumuYenileAsync: jest.fn(() => ({ type: 'konum/yenile' })),
}));

const useAppDispatchMock = useAppDispatch as unknown as jest.Mock;
const useAppSelectorMock = useAppSelector as unknown as jest.Mock;

interface KonumParcasi {
  konumModu: 'oto' | 'manuel';
  yenileniyor: boolean;
}

describe('useKonumYenile', () => {
  const toastSpy = kisaBildirimGoster as jest.Mock;
  let unwrapSonucu: unknown;
  let unwrapReddeder: boolean;
  let dispatchMock: jest.Mock;

  const kur = (konum: KonumParcasi) => {
    useAppSelectorMock.mockImplementation((secici: (s: { konum: KonumParcasi }) => unknown) =>
      secici({ konum })
    );
    return renderHook(() => useKonumYenile());
  };

  beforeEach(() => {
    jest.clearAllMocks();
    unwrapSonucu = { durum: 'basarili' };
    unwrapReddeder = false;

    dispatchMock = jest.fn(() => ({
      unwrap: () =>
        unwrapReddeder ? Promise.reject(new Error('thunk patladı')) : Promise.resolve(unwrapSonucu),
    }));
    useAppDispatchMock.mockReturnValue(dispatchMock);
  });

  test('otomatik modda yenilenebilir, manuel modda DEĞİL', () => {
    expect(kur({ konumModu: 'oto', yenileniyor: false }).result.current.yenilenebilir).toBe(true);
    expect(kur({ konumModu: 'manuel', yenileniyor: false }).result.current.yenilenebilir).toBe(false);
  });

  test('başarılı yenilemede kullanıcıya olumlu geri bildirim verilir', async () => {
    const { result } = kur({ konumModu: 'oto', yenileniyor: false });

    await act(async () => {
      result.current.yenile();
    });

    expect(dispatchMock).toHaveBeenCalledTimes(1);
    expect(toastSpy).toHaveBeenCalledWith('Konumunuz güncellendi');
  });

  test('izin yoksa kullanıcı Konum Ayarları\'na yönlendirilir (sessizce izin İSTENMEZ)', async () => {
    unwrapSonucu = { durum: 'izinYok' };
    const { result } = kur({ konumModu: 'oto', yenileniyor: false });

    await act(async () => {
      result.current.yenile();
    });

    expect(toastSpy).toHaveBeenCalledWith('Konum izni gerekiyor: Ayarlar > Konum', true);
  });

  test('konum alınamazsa tekrar denemeye çağıran mesaj gösterilir', async () => {
    unwrapSonucu = { durum: 'konumAlinamadi' };
    const { result } = kur({ konumModu: 'oto', yenileniyor: false });

    await act(async () => {
      result.current.yenile();
    });

    expect(toastSpy).toHaveBeenCalledWith(
      'Konum güncellenemedi, lütfen tekrar deneyin'
    );
  });

  test('thunk reddedilse bile çökmez, hata mesajı gösterilir', async () => {
    unwrapReddeder = true;
    const { result } = kur({ konumModu: 'oto', yenileniyor: false });

    await act(async () => {
      result.current.yenile();
    });

    expect(toastSpy).toHaveBeenCalledWith(
      'Konum güncellenemedi, lütfen tekrar deneyin'
    );
  });

  test('zaten yenileniyorken ikinci istek gönderilmez (çift GPS sabitlemesi yok)', async () => {
    const { result } = kur({ konumModu: 'oto', yenileniyor: true });

    await act(async () => {
      result.current.yenile();
    });

    expect(dispatchMock).not.toHaveBeenCalled();
  });
});
