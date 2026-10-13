/**
 * Özel gün thunk'ları fulfilled olunca hatırlatmalar yeniden planlanır (issue #272).
 */
const mockOzelGunDegistiUygula = jest.fn();
jest.mock('../../../domain/services/OzelGunDegisikligiServisi', () => ({
  ozelGunDegistiUygula: () => mockOzelGunDegistiUygula(),
}));
// seriSlice BildirimServisi üzerinden native köprü grafiğini çeker (AGENTS.md).
jest.mock('../../../domain/services/BildirimServisi', () => ({
  BildirimServisi: {
    getInstance: () => ({ bildirimPlanla: jest.fn(), bildirimIptalEt: jest.fn() }),
  },
}));

import { configureStore } from '@reduxjs/toolkit';
import seriReducer, {
  ozelGunBaslat,
  ozelGunBitir,
  ozelGunModuDurumunuGuncelle,
  seriAyarlariniGuncelle,
} from '../seriSlice';
import { ozelGunListenerMiddleware } from '../ozelGunListener';

const storeKur = () =>
  configureStore({
    reducer: { seri: seriReducer },
    middleware: (gdm) =>
      gdm({ serializableCheck: false }).prepend(ozelGunListenerMiddleware.middleware),
  });

describe('ozelGunListener', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOzelGunDegistiUygula.mockResolvedValue(undefined);
  });

  test('başlat / bitir / mod değişimi yeniden planlamayı tetikler', async () => {
    const store = storeKur();

    await store.dispatch(ozelGunModuDurumunuGuncelle({ aktif: true }));
    await store.dispatch(ozelGunBaslat({ baslangicTarihi: '2026-10-13', bitisTarihi: '2026-10-18' }));
    await store.dispatch(ozelGunBitir());

    expect(mockOzelGunDegistiUygula).toHaveBeenCalledTimes(3);
  });

  test("alakasız seri thunk'ı tetiklemez", async () => {
    const store = storeKur();
    await store.dispatch(seriAyarlariniGuncelle({ ayarlar: { gunSonuBildirimAktif: false } }));
    expect(mockOzelGunDegistiUygula).not.toHaveBeenCalled();
  });
});
