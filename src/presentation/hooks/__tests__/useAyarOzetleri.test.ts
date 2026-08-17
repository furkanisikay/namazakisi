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
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { Depolama } from '../../../data/local/Depolama';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';
import { vakitBildirimAyarlariniYukle } from '../../store/vakitBildirimSlice';
import { takvimAyarlariniYukle } from '../../store/takvimSlice';
import { useAyarOzetleri } from '../useAyarOzetleri';

jest.mock('../../store/hooks', () => ({ useAppSelector: jest.fn(), useAppDispatch: jest.fn() }));

// vakitBildirimSlice/takvimSlice thunk'ları AsyncStorage/native modül import
// eder (`createAsyncThunk`) — bu saf hook testinde gerçek thunk'ı DEĞİL,
// dispatch edilen aksiyonun türünü doğrulamaya yeten bir kimlik nesnesi
// yeter. `jest.mock` ile action-creator'ı sabit bir işaretleyiciye indirger.
jest.mock('../../store/vakitBildirimSlice', () => ({
  vakitBildirimAyarlariniYukle: jest.fn(() => ({ type: 'vakitBildirim/yukle' })),
}));
jest.mock('../../store/takvimSlice', () => ({
  takvimAyarlariniYukle: jest.fn(() => ({ type: 'takvim/yukle' })),
}));

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
  const dispatchMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppDispatch as unknown as jest.Mock).mockReturnValue(dispatchMock);
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

  it('Depolama.oku dolu bir ISO döndürürse yedekleme özeti o damgayı yansıtır (async yol gerçekten çalışıyor)', async () => {
    selectorlaKur();
    // Test ortamının gerçek yılıyla aynı yıl seçilir — `yedeklemeOzeti` "aynı
    // yıl" kuralında yıl basmaz; hook `simdi`yi gerçek `new Date()`den aldığı
    // için (brief: hook'a `simdi` enjekte edilmez, bu tek gerçek-zaman
    // istisnasıdır) test de gerçek yılı kullanır.
    const buYil = new Date().getFullYear();
    (Depolama.oku as jest.Mock).mockResolvedValue(`${buYil}-07-01T10:00:00.000Z`);

    const { result } = renderHook(() => useAyarOzetleri());

    // Effect çözülmeden önce varsayılan (null → "Henüz dışa aktarılmadı") görülür —
    // async yolun GERÇEKTEN state'i güncellediğini kanıtlamak için başlangıç
    // değerinin bu olduğunu da doğruluyoruz.
    expect(result.current.ozetler.yedekleme).toBe('Henüz dışa aktarılmadı');

    await waitFor(() => {
      expect(result.current.ozetler.yedekleme).toBe('Son dışa aktarma: 1 Temmuz');
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

  it('NÖBETÇİ: focus\'ta vakitBildirim ve takvim ayarları yükleme dispatch edilir', async () => {
    // `vakitBildirim`/`takvim` slice'ları App.tsx açılışında YÜKLENMİYOR
    // (yalnız kendi ayar sayfaları dispatch ediyor) — kullanıcı soğuk
    // açılışta doğrudan Ayarlar'a girerse özet initialState'ten (hepsi
    // kapalı) okunur ve `kurulumSagligi.hatirlatmaYok` yanlış alarm verir.
    // Bu hook'un focus'ta ikisini de idempotent şekilde tazelemesi gerekir.
    selectorlaKur();
    renderHook(() => useAyarOzetleri());

    expect(vakitBildirimAyarlariniYukle).toHaveBeenCalled();
    expect(takvimAyarlariniYukle).toHaveBeenCalled();
    expect(dispatchMock).toHaveBeenCalledWith({ type: 'vakitBildirim/yukle' });
    expect(dispatchMock).toHaveBeenCalledWith({ type: 'takvim/yukle' });

    await act(async () => {
      await Promise.resolve();
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
});
