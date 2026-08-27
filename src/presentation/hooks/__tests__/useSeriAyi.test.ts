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
import { Logger } from '../../../core/utils/Logger';
import { useSeriAyi, KIBAR_HATA_METNI } from '../useSeriAyi';
import { NamazVaktiHesaplayiciServisi } from '../../../domain/services/NamazVaktiHesaplayiciServisi';

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

// Ham teknik hata metni UI'a DEĞİL, yalnız Logger'a gitmeli (inceleme
// bulgusu) — bu yüzden Logger.error çağrısını doğrulanabilir kılmak için mock'lanır.
jest.mock('../../../core/utils/Logger', () => ({ Logger: { error: jest.fn() } }));

const VARSAYILAN_AYARLAR = { tamGunEsigi: 5, gunBitisSaati: '05:00' };
const VARSAYILAN_OZEL_GUN_AYARLARI = {
  ozelGunModuAktif: false,
  aktifOzelGun: null,
  gecmisKayitlar: [],
};

// Gün sınırı imsağa bağlandığından (Faz 5a) hook artık `konum.koordinatlar`'ı da
// okur — sınırın yeniden çözülmesi için tek reaktif tetikleyici odur. Testlerin
// çoğu imsak kaynağını hiç kurmaz; koordinat dolu olsa da `NamazVaktiHesaplayiciServisi`
// yapılandırılmadığı için 05:00 fallback'i uygulanır (eski davranış).
const VARSAYILAN_KOORDINAT = { lat: 41.0082, lng: 28.9784 };

function stateOlustur(ustyaz: Record<string, unknown> = {}) {
  return {
    konum: { koordinatlar: VARSAYILAN_KOORDINAT },
    seri: {
      ayarlar: VARSAYILAN_AYARLAR,
      ozelGunAyarlari: VARSAYILAN_OZEL_GUN_AYARLARI,
      seriDurumu: { mevcutSeri: 7 },
      // Hidrate edilmiş (`seriVerileriniYukle` tamamlanmış) durumu temsil
      // eder — testlerin çoğu bu "normal" durumu varsayar. Hidrasyon-yarışı
      // senaryosu bunu açıkça `sonYukleme: null` ile ezer (aşağıda).
      sonYukleme: '2026-01-01T00:00:00.000Z',
      // `seriVerileriniYukle` reddedilmediyse `hata` `null`dur (bkz.
      // seriSlice.ts pending/fulfilled case'leri) — ret senaryosu bunu açıkça
      // dolu bir metinle ezer.
      hata: null,
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
    // Gün sınırı testleri `NamazVaktiHesaplayiciServisi.getInstance`'ı spy'lar;
    // restore edilmezse sonraki testlere sızar (AGENTS.md: clearAllMocks
    // implementasyonu SİLMEZ).
    jest.restoreAllMocks();
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
      hata: 'SyntaxError: Unexpected token in JSON at position 0 (teknik, ham hata)',
    });

    const { result } = renderHook(() => useSeriAyi());

    await waitFor(() => expect(result.current.yukleniyor).toBe(false));
    // KRITIK (inceleme bulgusu): UI'a giden hata DAİMA sabit/kibar metindir —
    // LocalNamazServisi'nin ham error.message'ı asla ekrana sızmaz.
    expect(result.current.hata).toBe(KIBAR_HATA_METNI);
  });

  it('KRITIK (inceleme bulgusu): ham teknik hata metni Logger.error\'a gider, UI\'a sızmaz', async () => {
    (localTarihAraligindakiNamazlariGetir as jest.Mock).mockResolvedValue({
      basarili: false,
      hata: 'SyntaxError: Unexpected token in JSON at position 0 (teknik, ham hata)',
    });

    const { result } = renderHook(() => useSeriAyi());
    await waitFor(() => expect(result.current.yukleniyor).toBe(false));

    expect(Logger.error).toHaveBeenCalledWith(
      'useSeriAyi',
      expect.any(String),
      expect.objectContaining({ hata: 'SyntaxError: Unexpected token in JSON at position 0 (teknik, ham hata)' })
    );
  });

  it('hata mesajı gelmeden basarili:false dönerse kibar sabit hata gösterilir', async () => {
    (localTarihAraligindakiNamazlariGetir as jest.Mock).mockResolvedValue({ basarili: false });

    const { result } = renderHook(() => useSeriAyi());

    await waitFor(() => expect(result.current.yukleniyor).toBe(false));
    expect(result.current.hata).toBe(KIBAR_HATA_METNI);
  });

  it('yenidenDene çağrıldığında okuma tekrar denenir ve önceki hata temizlenir', async () => {
    (localTarihAraligindakiNamazlariGetir as jest.Mock).mockResolvedValueOnce({
      basarili: false,
      hata: 'ilk deneme başarısız',
    });

    const { result } = renderHook(() => useSeriAyi());
    await waitFor(() => expect(result.current.hata).toBe(KIBAR_HATA_METNI));

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

  it('BAĞLAYICI (inceleme bulgusu — ikiz kod): localTarihAraligindakiNamazlariGetir, izgaranın ilk ve son gününün tarihiyle çağrılır', async () => {
    const { result } = renderHook(() => useSeriAyi());

    await waitFor(() => expect(result.current.yukleniyor).toBe(false));

    const izgara = result.current.izgara;
    expect(izgara.length).toBeGreaterThan(0);
    expect(localTarihAraligindakiNamazlariGetir).toHaveBeenCalledWith(
      izgara[0].tarih,
      izgara[izgara.length - 1].tarih
    );
  });

  it('KRITIK (hidrasyon yarışı — inceleme bulgusu): seri slice henüz hidrate edilmediyse (sonYukleme null) namaz okuması bitse de yukleniyor true kalır', async () => {
    selectorlaKur({ sonYukleme: null });

    const { result } = renderHook(() => useSeriAyi());
    await waitFor(() => expect(localTarihAraligindakiNamazlariGetir).toHaveBeenCalled());
    // Namaz okuması bitmesi için mikro görevleri boşalt.
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.hata).toBeNull();
    expect(result.current.yukleniyor).toBe(true);
  });

  it('KRITIK (2. inceleme turu — AGENTS.md kaza-defteri dersi): seri yüklemesi REDDEDİLDİĞİNDE (sonYukleme null, hata dolu) yukleniyor false olur, ekran sonsuz spinner\'da kalmaz', async () => {
    // seriVerileriniYukle rejected -> seriSlice'ta sonYukleme HİÇ yazılmaz,
    // yalnız hata dolar (bkz. seriSlice.ts rejected case). sonYukleme'yi TEK
    // BAŞINA bekleyen bir kapı burada sonsuza dek yukleniyor=true kalırdı.
    selectorlaKur({ sonYukleme: null, hata: 'Seri verileri yuklenemedi' });

    const { result } = renderHook(() => useSeriAyi());

    await waitFor(() => expect(result.current.yukleniyor).toBe(false));
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

  // ==================== FAZ 5a: GÜN SINIRI = ERTESİ İMSAK ====================

  /** Sahte zamanı, timer fonksiyonlarına dokunmadan kurar (dosya başı gerekçesi). */
  const zamaniKur = (tarih: Date) => {
    jest.useFakeTimers({
      doNotFake: ['nextTick', 'setImmediate', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'queueMicrotask'],
    });
    jest.setSystemTime(tarih);
  };

  it('KRİTİK (hidrasyon zıplaması): imsak kaynağı hazır DEĞİLKEN bugun 05:00 fallback\'inde SABİT kalır', async () => {
    // 04:00 — yaz imsağından (03:30) SONRA ama 05:00'ten ÖNCE. Kaynak hazır
    // olmadığı için değer fallback'te kalmalı ve tekrar render'larda DEĞİŞMEMELİ
    // (ilk render'da bir değer, hemen sonra başkası = AnaSayfa snap-back tuzağı).
    zamaniKur(new Date(2026, 6, 2, 4, 0, 0));

    const { result, rerender } = renderHook(() => useSeriAyi());
    await waitFor(() => expect(result.current.yukleniyor).toBe(false));

    expect(result.current.bugun).toBe('2026-07-01');
    rerender(undefined);
    expect(result.current.bugun).toBe('2026-07-01');
  });

  it('imsak kaynağı hazır olduğunda gün sınırı imsağa kayar (imsak 03:30 → 04:00 BUGÜNE)', async () => {
    zamaniKur(new Date(2026, 6, 2, 4, 0, 0));
    jest.spyOn(NamazVaktiHesaplayiciServisi, 'getInstance').mockReturnValue({
      getKonfig: () => ({ latitude: 41.0082, longitude: 28.9784 }),
      getGunlukVakitler: (tarih: Date) => ({
        imsak: new Date(tarih.getFullYear(), tarih.getMonth(), tarih.getDate(), 3, 30, 0, 0),
      }),
    } as unknown as NamazVaktiHesaplayiciServisi);

    const { result } = renderHook(() => useSeriAyi());

    await waitFor(() => expect(result.current.bugun).toBe('2026-07-02'));
    await waitFor(() => expect(result.current.yukleniyor).toBe(false));
  });

  it('koordinat {0,0} nöbetçisi: imsak kaynağı cevap verse bile 05:00 fallback korunur', async () => {
    // `{lat:0,lng:0}` "konum henüz yok" demektir; o koordinatla hesaplanan bir
    // imsak Gine Körfezi'ne aittir ve gün sınırını saatlerce kaydırırdı.
    zamaniKur(new Date(2026, 6, 2, 4, 0, 0));
    selectorlaKur();
    (useAppSelector as unknown as jest.Mock).mockImplementation(
      (selector: (state: { konum: { koordinatlar: { lat: number; lng: number } } }) => unknown) =>
        selector({
          ...(stateOlustur() as unknown as { konum: { koordinatlar: { lat: number; lng: number } } }),
          konum: { koordinatlar: { lat: 0, lng: 0 } },
        })
    );
    jest.spyOn(NamazVaktiHesaplayiciServisi, 'getInstance').mockReturnValue({
      getKonfig: () => ({ latitude: 41.0082, longitude: 28.9784 }),
      getGunlukVakitler: (tarih: Date) => ({
        imsak: new Date(tarih.getFullYear(), tarih.getMonth(), tarih.getDate(), 3, 30, 0, 0),
      }),
    } as unknown as NamazVaktiHesaplayiciServisi);

    const { result } = renderHook(() => useSeriAyi());

    await waitFor(() => expect(result.current.yukleniyor).toBe(false));
    expect(result.current.bugun).toBe('2026-07-01');
  });

  it('KIŞ (imsak 06:40): 05:30 DÜNE sayılır — sınır İLERİ kayar', async () => {
    zamaniKur(new Date(2026, 0, 15, 5, 30, 0));
    jest.spyOn(NamazVaktiHesaplayiciServisi, 'getInstance').mockReturnValue({
      getKonfig: () => ({ latitude: 41.0082, longitude: 28.9784 }),
      getGunlukVakitler: (tarih: Date) => ({
        imsak: new Date(tarih.getFullYear(), tarih.getMonth(), tarih.getDate(), 6, 40, 0, 0),
      }),
    } as unknown as NamazVaktiHesaplayiciServisi);

    const { result } = renderHook(() => useSeriAyi());

    await waitFor(() => expect(result.current.yukleniyor).toBe(false));
    expect(result.current.bugun).toBe('2026-01-14');
  });
});
