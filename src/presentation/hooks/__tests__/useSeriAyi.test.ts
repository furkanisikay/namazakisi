/**
 * useSeriAyi — hidrasyon nöbetçisi (mount'ta `seriVerileriniYukle` dispatch
 * edilir), hata yolu (sonsuz spinner YOK), boş veride çökmeme ve `bugun`'ün
 * `namazGunuHesapla`'dan (takvim gününden DEĞİL) geldiği doğrulanır.
 *
 * Yalnız `Date` sahtelenir (`doNotFake` ile timer/microtask fonksiyonları
 * GERÇEK bırakılır) — AGENTS.md'nin "sahte zamanlayıcı + tam-sayfa render
 * CI'da asılır" dersi `renderHook` (hafif, tam sayfa DEĞİL) için geçerli
 * değil, ama zamanlayıcı fonksiyonlarını sahtelemekten yine de kaçınıyoruz.
 */
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { localTarihAraligindakiNamazlariGetir } from '../../../data/local/LocalNamazServisi';
import { useSeriAyi } from '../useSeriAyi';

jest.mock('../../store/hooks', () => ({ useAppSelector: jest.fn(), useAppDispatch: jest.fn() }));

// seriSlice, LocalSeriServisi/PuanlamaServisi/BildirimServisi gibi native-bağımlı
// servisleri import ediyor -> bu saf hook testinde gerçek thunk'ı DEĞİL, dispatch
// edilen aksiyonun kimliğini doğrulamaya yeten bir işaretleyici yeter (bkz.
// useAyarOzetleri.test.ts'teki aynı desen).
jest.mock('../../store/seriSlice', () => ({
  seriVerileriniYukle: jest.fn(() => ({ type: 'seri/seriVerileriniYukle' })),
}));

jest.mock('../../../data/local/LocalNamazServisi', () => ({
  localTarihAraligindakiNamazlariGetir: jest.fn(),
}));

const VARSAYILAN_AYARLAR = { tamGunEsigi: 5, gunBitisSaati: '05:00' };
const VARSAYILAN_OZEL_GUN_AYARLARI = {
  ozelGunModuAktif: false,
  aktifOzelGun: null,
  gecmisKayitlar: [],
};

function stateOlustur(ustyaz: Record<string, unknown> = {}) {
  return {
    seri: {
      ayarlar: VARSAYILAN_AYARLAR,
      ozelGunAyarlari: VARSAYILAN_OZEL_GUN_AYARLARI,
      seriDurumu: { mevcutSeri: 7 },
      ...ustyaz,
    },
  };
}

function selectorlaKur(ustyaz: Record<string, unknown> = {}) {
  (useAppSelector as unknown as jest.Mock).mockImplementation(
    (selector: (state: ReturnType<typeof stateOlustur>) => unknown) => selector(stateOlustur(ustyaz))
  );
}

describe('useSeriAyi', () => {
  const dispatchMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppDispatch as unknown as jest.Mock).mockReturnValue(dispatchMock);
    selectorlaKur();
    (localTarihAraligindakiNamazlariGetir as jest.Mock).mockResolvedValue({ basarili: true, veri: [] });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('NÖBETÇİ: mount olduğunda seriVerileriniYukle dispatch edilir (hidrasyon garantisi)', async () => {
    const { result } = renderHook(() => useSeriAyi());
    expect(dispatchMock).toHaveBeenCalledWith({ type: 'seri/seriVerileriniYukle' });

    // Bekleyen namaz-okuma promise'ini test bitmeden boşalt — aksi halde
    // promise sonraki testin ortasında çözülüp "not wrapped in act(...)"
    // gürültüsü üretir (AGENTS.md: asenkron hook'lu sayfa testi tuzağı).
    await waitFor(() => expect(result.current.yukleniyor).toBe(false));
  });

  it('okuma başarısız (basarili:false) olduğunda sonsuz spinner YOK — hata dolar, yukleniyor false olur', async () => {
    (localTarihAraligindakiNamazlariGetir as jest.Mock).mockResolvedValue({
      basarili: false,
      hata: 'Diskten okunamadı',
    });

    const { result } = renderHook(() => useSeriAyi());

    await waitFor(() => expect(result.current.yukleniyor).toBe(false));
    expect(result.current.hata).toBe('Diskten okunamadı');
  });

  it('hata mesajı gelmeden basarili:false dönerse kibar bir varsayılan hata gösterilir', async () => {
    (localTarihAraligindakiNamazlariGetir as jest.Mock).mockResolvedValue({ basarili: false });

    const { result } = renderHook(() => useSeriAyi());

    await waitFor(() => expect(result.current.yukleniyor).toBe(false));
    expect(result.current.hata).toBeTruthy();
  });

  it('yenidenDene çağrıldığında okuma tekrar denenir ve önceki hata temizlenir', async () => {
    (localTarihAraligindakiNamazlariGetir as jest.Mock).mockResolvedValueOnce({
      basarili: false,
      hata: 'ilk deneme başarısız',
    });

    const { result } = renderHook(() => useSeriAyi());
    await waitFor(() => expect(result.current.hata).toBe('ilk deneme başarısız'));

    (localTarihAraligindakiNamazlariGetir as jest.Mock).mockResolvedValueOnce({ basarili: true, veri: [] });
    act(() => {
      result.current.yenidenDene();
    });

    await waitFor(() => expect(result.current.yukleniyor).toBe(false));
    expect(result.current.hata).toBeNull();
  });

  it('boş veride (kayıt yok) çökmez — izgara yine hesaplanır', async () => {
    const { result } = renderHook(() => useSeriAyi());

    await waitFor(() => expect(result.current.yukleniyor).toBe(false));
    expect(result.current.izgara.length).toBeGreaterThan(0);
    expect(result.current.hata).toBeNull();
  });

  it('bugun namazGunuHesapla ile üretilir — gece yarısı sonrası TAKVİM GÜNÜNE DEĞİL, dünküne düşer', async () => {
    jest.useFakeTimers({
      doNotFake: ['nextTick', 'setImmediate', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'queueMicrotask'],
    });
    // 2 Temmuz 2026, 02:00 (yerel) — gün bitiş saati 05:00'ten ÖNCE -> namazGunuHesapla
    // bunu 1 Temmuz'a sayar. Takvim günü (calendar day) olsaydı "2026-07-02" olurdu.
    jest.setSystemTime(new Date(2026, 6, 2, 2, 0, 0));

    const { result } = renderHook(() => useSeriAyi());

    await waitFor(() => expect(result.current.yukleniyor).toBe(false));
    expect(result.current.bugun).toBe('2026-07-01');
  });
});
