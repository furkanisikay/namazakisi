/**
 * useAyarOzetleri — sync özetlerin store'dan doğru türetilmesi, async
 * (bildirim izni + son dışa aktarma) verinin `useFocusEffect` ile tazelenmesi
 * ve `saglikOzetSatiri` biçimi.
 *
 * `useFocusEffect` bu repoda İLK KEZ kullanılıyor — mock reçetesi task-5-brief
 * ile birebir: `useEffect`'e devredilir, böylece async okuma gerçek zamanda
 * `waitFor` ile beklenebilir (sahte zamanlayıcıya gerek yok).
 */
import { renderHook, act, waitFor } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';
import { useAppSelector } from '../../store/hooks';
import { Depolama } from '../../../data/local/Depolama';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';
import { useAyarOzetleri } from '../useAyarOzetleri';

jest.mock('../../store/hooks', () => ({ useAppSelector: jest.fn() }));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (cb: () => void | (() => void)) => {
    const React = require('react');
    React.useEffect(cb, [cb]);
  },
}));

const mockTema = {
  tema: { mod: 'acik' as const, renkler: {} as unknown },
  palet: { id: 'zumrut', ad: 'Zümrüt' },
};
jest.mock('../../../core/theme', () => ({
  useTema: () => mockTema,
}));

jest.mock('../../../data/local/Depolama', () => ({
  Depolama: { oku: jest.fn() },
}));

const stateOlustur = (ustyaz: Record<string, unknown> = {}) => ({
  konum: {
    konumModu: 'oto',
    seciliIlAdi: 'Istanbul',
    seciliIlceAdi: '',
    gpsAdres: { ilce: 'Kadıköy', il: 'İstanbul' },
    sonGpsGuncellemesi: new Date(Date.now() - 1000).toISOString(),
    akilliTakipAktif: true,
    yukleniyor: false,
  },
  muhafiz: { aktif: true, yogunluk: 'normal' },
  vakitBildirim: {
    ayarlar: { imsak: true, ogle: false, ikindi: false, aksam: true, yatsi: false },
  },
  cumaHatirlatma: { ayarlar: { aktif: true, oncedenDk: 60 } },
  seri: { ayarlar: { tamGunEsigi: 4, gunSonuBildirimAktif: true } },
  iftarSayac: { ayarlar: { aktif: true } },
  sahurSayac: { ayarlar: { aktif: false } },
  takvim: { ayarlar: { aktif: true } },
  guncelleme: { guncellemeMevcut: false },
  ...ustyaz,
});

function selectorlaKur(ustyaz: Record<string, unknown> = {}) {
  (useAppSelector as unknown as jest.Mock).mockImplementation(
    (selector: (state: ReturnType<typeof stateOlustur>) => unknown) => selector(stateOlustur(ustyaz))
  );
}

describe('useAyarOzetleri', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Depolama.oku as jest.Mock).mockResolvedValue(null);
  });

  it('sync özetleri store girdilerinden birebir türetir', async () => {
    selectorlaKur();
    const { result } = renderHook(() => useAyarOzetleri());

    expect(result.current.ozetler.konum).toBe('Kadıköy, İstanbul · otomatik');
    expect(result.current.ozetler.takvim).toBe('Açık');
    expect(result.current.ozetler.muhafiz).toBe('Açık · normal yoğunluk');
    expect(result.current.ozetler.bildirim).toBe('2 vakit · cuma hatırlatması açık');
    expect(result.current.ozetler.seri).toBe('Tam gün: 4 namaz · gün sonu açık');
    expect(result.current.ozetler.ramazan).toBe('İftar sayacı açık');
    expect(result.current.ozetler.gorunum).toBe('Açık tema · Zümrüt');
    expect(result.current.ozetler.hakkinda).toMatch(/^Sürüm .+ · güncel$/);

    await act(async () => {
      await Promise.resolve();
    });
  });

  it('sonDisaAktarmaISO null iken yedekleme özeti "Henüz dışa aktarılmadı" olur', async () => {
    selectorlaKur();
    const { result } = renderHook(() => useAyarOzetleri());

    await waitFor(() => {
      expect(result.current.ozetler.yedekleme).toBe('Henüz dışa aktarılmadı');
    });
  });

  it('saglikOzetSatiri "Kurulumunuz eksiksiz · <konum> · muhafız açık|kapalı" biçimindedir (mod eki YOK)', async () => {
    selectorlaKur();
    const { result } = renderHook(() => useAyarOzetleri());

    expect(result.current.saglikOzetSatiri).toBe(
      'Kurulumunuz eksiksiz · Kadıköy, İstanbul · muhafız açık'
    );

    await act(async () => {
      await Promise.resolve();
    });
  });

  it('muhafiz kapalıyken saglikOzetSatiri "muhafız kapalı" der', async () => {
    selectorlaKur({ muhafiz: { aktif: false, yogunluk: 'normal' } });
    const { result } = renderHook(() => useAyarOzetleri());

    expect(result.current.saglikOzetSatiri).toContain('muhafız kapalı');

    await act(async () => {
      await Promise.resolve();
    });
  });

  it('bildirim izni reddedilmişse (async çözüldükten sonra) sorunlar listesine "bildirimIzni" eklenir', async () => {
    selectorlaKur();
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

    const { result } = renderHook(() => useAyarOzetleri());

    // Effect henüz çözülmeden önce varsayılan 'belirsiz' kullanılır — o dal tetiklemez.
    await waitFor(() => {
      expect(result.current.sorunlar.some((s) => s.id === 'bildirimIzni')).toBe(true);
    });
  });

  it('izin verilmiş ve konum tazeyse sorunlar boş, kurulumSagligi çağrısı doğru girdilerle yapılır', async () => {
    selectorlaKur();
    const { result } = renderHook(() => useAyarOzetleri());

    await waitFor(() => {
      expect(result.current.sorunlar).toEqual([]);
    });
  });

  it('async okuma Promise.all ile tek turda yapılır (izinDurumunuOku + Depolama.oku)', async () => {
    selectorlaKur();
    renderHook(() => useAyarOzetleri());

    await waitFor(() => {
      expect(Notifications.getPermissionsAsync).toHaveBeenCalledTimes(1);
      expect(Depolama.oku).toHaveBeenCalledWith(DEPOLAMA_ANAHTARLARI.SON_DISA_AKTARMA);
    });
  });

  it('unmount sonrası async çözülen veri setState çağırmaya çalışmaz (hata fırlatmaz)', async () => {
    selectorlaKur();
    let cozAsyncOkuma: (() => void) | undefined;
    (Depolama.oku as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          cozAsyncOkuma = () => resolve(null);
        })
    );

    const { unmount } = renderHook(() => useAyarOzetleri());
    unmount();

    expect(() => {
      cozAsyncOkuma?.();
    }).not.toThrow();

    await act(async () => {
      await Promise.resolve();
    });
  });
});
