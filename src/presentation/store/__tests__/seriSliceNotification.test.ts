
import seriReducer, { seriAyarlariniGuncelle } from '../seriSlice';
import { VARSAYILAN_SERI_AYARLARI, SeriAyarlari } from '../../../core/types/SeriTipleri';
import { BildirimServisi } from '../../../domain/services/BildirimServisi';
import { KonumYoneticiServisi } from '../../../domain/services/KonumYoneticiServisi';
import * as LocalSeriServisi from '../../../data/local/LocalSeriServisi';

// Mocks
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
}));

jest.mock('../../../data/local/LocalSeriServisi', () => ({
  localSeriAyarlariniKaydet: jest.fn(() => Promise.resolve()),
  VARSAYILAN_OZEL_GUN_AYARLARI: {},
}));

jest.mock('../../../domain/services/BildirimServisi', () => ({
  BildirimServisi: {
    getInstance: jest.fn(() => ({
      bildirimPlanla: jest.fn(() => Promise.resolve()),
      bildirimIptalEt: jest.fn(() => Promise.resolve()),
    })),
  },
}));

jest.mock('../../../domain/services/KonumYoneticiServisi', () => ({
  KonumYoneticiServisi: {
    getInstance: jest.fn(() => ({
      sonrakiGunImsakVaktiGetir: jest.fn(),
    })),
  },
}));

describe('seriSlice Notification Logic', () => {
  let storeMock: any;
  let bildirimPlanlaMock: jest.Mock;
  let imsakVaktiGetirMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    bildirimPlanlaMock = jest.fn();
    (BildirimServisi.getInstance as jest.Mock).mockReturnValue({
      bildirimPlanla: bildirimPlanlaMock,
      bildirimIptalEt: jest.fn(),
    });

    imsakVaktiGetirMock = jest.fn();
    (KonumYoneticiServisi.getInstance as jest.Mock).mockReturnValue({
      sonrakiGunImsakVaktiGetir: imsakVaktiGetirMock,
    });

    storeMock = {
      getState: () => ({
        seri: {
          ayarlar: VARSAYILAN_SERI_AYARLARI,
          ozelGunAyarlari: {},
        },
      }),
      dispatch: jest.fn(),
    };
  });

  it('SABIT mod secildiginde kullanicinin belirledigi saatte bildirim planlamali', async () => {
    // Kullanici 23:45 secti
    const yeniAyarlar: Partial<SeriAyarlari> = {
      gunSonuBildirimAktif: true,
      gunSonuBildirimModu: 'sabit',
      bildirimSaati: 23,
      bildirimDakikasi: 45,
      bildirimGunSecimi: 'ayniGun',
    };

    // Thunk'i calistir
    const thunk = seriAyarlariniGuncelle({ ayarlar: yeniAyarlar });
    await thunk(storeMock.dispatch, storeMock.getState, undefined);

    // Bildirim planla cagrisini kontrol et
    expect(bildirimPlanlaMock).toHaveBeenCalledWith(
      'gun_sonu_hatirlatici',
      expect.any(String),
      expect.any(String),
      23, // Beklenen saat
      45  // Beklenen dakika
    );
  });

  it('OTOMATIK mod secildiginde imsak vaktine gore bildirim planlamali', async () => {
    // Imsak vaktini mockla: Yarin 05:30
    const mockImsak = new Date();
    mockImsak.setHours(5, 30, 0, 0);
    imsakVaktiGetirMock.mockReturnValue(mockImsak);

    // Kullanici Imsak'tan 45 dk once secti
    const yeniAyarlar: Partial<SeriAyarlari> = {
      gunSonuBildirimAktif: true,
      gunSonuBildirimModu: 'otomatik',
      bildirimImsakOncesiDk: 45,
    };

    // Thunk'i calistir
    const thunk = seriAyarlariniGuncelle({ ayarlar: yeniAyarlar });
    await thunk(storeMock.dispatch, storeMock.getState, undefined);

    // 05:30 - 45 dk = 04:45
    expect(bildirimPlanlaMock).toHaveBeenCalledWith(
      'gun_sonu_hatirlatici',
      expect.any(String),
      expect.any(String),
      4,  // 04
      45  // 45
    );
  });

  it('Eski (deprecated) mantik yerine yeni mantigin calistigini dogrula', async () => {
     // Eski default: 05:00 gun bitis, 60 dk oncesi -> 04:00
     // Yeni ayar: 23:45

     const yeniAyarlar: Partial<SeriAyarlari> = {
      gunSonuBildirimAktif: true,
      gunSonuBildirimModu: 'sabit',
      bildirimSaati: 23,
      bildirimDakikasi: 45,
      // Eski degerler store'da default olarak duruyor (05:00, 60dk)
    };

    // Thunk'i calistir
    const thunk = seriAyarlariniGuncelle({ ayarlar: yeniAyarlar });
    await thunk(storeMock.dispatch, storeMock.getState, undefined);

    // Eger bug varsa, 04:00 ile cagrilacak (eski mantik)
    // Eger fix varsa, 23:45 ile cagrilacak

    // Su an fail etmesini bekliyoruz (fix uygulanmadi)
    expect(bildirimPlanlaMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        23,
        45
    );
  });
});
