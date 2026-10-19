/**
 * Now Bar planlayıcısı (issue #282 ikinci aşama): sayaç kaynakları + kullanıcı
 * seçimi → native plan. Saf zaman çizelgesi `canliSayacPlani.test.ts`'te; burada
 * orkestrasyon (devralma kararı, kapalı izin, kılınmış vakit, saat payı) ölçülür.
 */
const mockDepo: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (k: string) => mockDepo[k] ?? null),
    setItem: jest.fn(async (k: string, v: string) => {
      mockDepo[k] = v;
    }),
  },
}));

jest.mock('react-native', () => ({ Platform: { OS: 'android' }, AppState: { currentState: 'active' } }));

const mockCanliDurumu = jest.fn();
const mockCanliPlaniKur = jest.fn();
const mockCanliTaniHam = jest.fn();
jest.mock('../../../../modules/expo-countdown-notification/src', () => ({
  canliDurumu: (...a: unknown[]) => mockCanliDurumu(...a),
  canliPlaniKur: (...a: unknown[]) => mockCanliPlaniKur(...a),
  canliTaniHam: (...a: unknown[]) => mockCanliTaniHam(...a),
}));
const mockLogInfo = jest.fn();
jest.mock('../../../core/utils/Logger', () => ({
  Logger: { info: (...a: unknown[]) => mockLogInfo(...a), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

const mockKilinan = jest.fn();
const mockKayit = jest.fn();
const mockDinleyiciEkle = jest.fn();
jest.mock('../../../data/local/LocalNamazServisi', () => ({
  kilinanVakitleriAl: (...a: unknown[]) => mockKilinan(...a),
  localTarihAraligindakiNamazlariGetir: (...a: unknown[]) => mockKayit(...a),
  kayitDegistiDinleyicisiEkle: (...a: unknown[]) => mockDinleyiciEkle(...a),
}));
jest.mock('../../../data/local/LocalOzelGunOkuyucu', () => ({
  ozelGunSuzgeciniOku: jest.fn(async () => () => false),
}));

import { CanliSayacPlanlayici } from '../CanliSayacPlanlayici';
import { canliSaatDinleyicisiniAyarla } from '../canliSaatGozlemcisi';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';
import { VARSAYILAN_NOW_BAR_AYARLARI, nowBarAyariniBirlestir } from '../../../core/sayac/nowBar';
import { bugunuAl } from '../../../core/utils/TarihYardimcisi';
import type { CanliAday } from '../../../core/sayac/canliSayacPlani';

const DK = 60_000;

const aday = (ek: Partial<CanliAday> = {}): CanliAday => ({
  oge: 'iftar',
  kaynak: 'sayac',
  id: 'iftar_sayac_x',
  baslangicMs: Date.now() - 60 * DK,
  hedefMs: Date.now() + 60 * DK,
  baslik: 'İftar',
  govdeSablonu: '{time}',
  kanalId: 'iftar_sayac_v2',
  tema: 'iftar',
  hedefteKaybol: false,
  canli: { baslangicMs: Date.now() - 60 * DK, bolumler: [] },
  ...ek,
});

const sonPlan = (): { id: string; eylem: string }[] => {
  const cagri = mockCanliPlaniKur.mock.calls.at(-1);
  return cagri ? JSON.parse(cagri[0] as string) : [];
};

describe('CanliSayacPlanlayici', () => {
  const p = CanliSayacPlanlayici.getInstance();

  beforeEach(() => {
    for (const k of Object.keys(mockDepo)) delete mockDepo[k];
    jest.clearAllMocks();
    p.__testIcinSifirla();
    mockCanliDurumu.mockResolvedValue('acik');
    mockCanliPlaniKur.mockResolvedValue(true);
    mockKilinan.mockResolvedValue([]);
    mockCanliTaniHam.mockResolvedValue(null);
    canliSaatDinleyicisiniAyarla(null);
  });

  test('SAHA: muhafızın bastırdığı vaktin YEDEĞİ (varsayılan "Sayaçla") plana öne çıkan olay olarak girer', async () => {
    await p.kaynakBildir('vakitSayac', [
      aday({
        oge: 'ikindi',
        kaynak: 'nowBar',
        sayacYedegi: true,
        id: `sayac_${bugunuAl()}_ikindi`,
        kanalId: 'canli_sayac',
        tema: 'vakit',
        hedefteKaybol: true,
      }),
    ]);
    expect(sonPlan()).toEqual([
      expect.objectContaining({ id: `sayac_${bugunuAl()}_ikindi`, eylem: 'oneCikar', kaynak: 'nowBar' }),
    ]);
  });

  test('Now Bar tanısı tanı loguna yazılır, aynı teşhis TEKRAR yazılmaz', async () => {
    mockCanliTaniHam.mockResolvedValue(
      JSON.stringify({
        sdkInt: 36,
        samsung: true,
        oneUi: '8.0',
        izinVar: true,
        planOlaySayisi: 1,
        gosterilenler: [],
        sonGosterim: { zamanMs: 0, id: 'x', tema: 'iftar', kanalId: 'k', kanalOnemi: 3, oneCikarilabilir: true, izinVar: true, oneCikarildi: false },
        aktifBildirimler: [],
      })
    );
    await p.kaynakBildir('iftarSayac', [aday()]);
    await p.kaynakBildir('iftarSayac', [aday()]);
    const tanilar = mockLogInfo.mock.calls.filter((c) => String(c[1]).startsWith('Now Bar tanisi'));
    expect(tanilar).toHaveLength(1);
    expect(String(tanilar[0][1])).toContain('ureticiEngeli');
    expect(String(tanilar[0][1])).toContain('One UI 8.0');
  });

  test('devralma yalnız öne çıkarma AÇIK ve öğe açıkken', async () => {
    expect(await p.ogeKarari('iftar')).toEqual({ devralir: true, oneCikar: true });
    mockCanliDurumu.mockResolvedValue('kapali');
    expect(await p.ogeKarari('iftar')).toEqual({ devralir: false, oneCikar: true });
    mockDepo[DEPOLAMA_ANAHTARLARI.NOW_BAR_AYARLARI] = JSON.stringify(
      nowBarAyariniBirlestir(VARSAYILAN_NOW_BAR_AYARLARI, 'iftar', { acik: false })
    );
    mockCanliDurumu.mockResolvedValue('acik');
    expect(await p.ogeKarari('iftar')).toEqual({ devralir: false, oneCikar: false });
  });

  test('bildirilen sayaç penceresi plana öne çıkan olay olarak girer', async () => {
    await p.kaynakBildir('iftarSayac', [aday()]);
    expect(sonPlan()).toEqual([expect.objectContaining({ id: 'iftar_sayac_x', eylem: 'oneCikar' })]);
  });

  test('sistemde canlı güncellemeler kapalıysa plan BOŞALTILIR (sayaçlar kendi yolunda)', async () => {
    mockCanliDurumu.mockResolvedValue('kapali');
    await p.kaynakBildir('iftarSayac', [aday()]);
    expect(mockCanliPlaniKur).toHaveBeenLastCalledWith('[]');
  });

  test('desteklenmeyen cihazda native plana hiç dokunulmaz', async () => {
    mockCanliDurumu.mockResolvedValue('desteklenmiyor');
    await p.kaynakBildir('iftarSayac', [aday()]);
    expect(mockCanliPlaniKur).not.toHaveBeenCalled();
  });

  test('bildirildikten SONRA kılınan vaktin sayaç penceresi düşer', async () => {
    mockKilinan.mockImplementation(async (t: string) => (t === bugunuAl() ? ['ogle'] : []));
    await p.kaynakBildir('vakitSayac', [
      aday({
        oge: 'ogle',
        id: `sayac_${bugunuAl()}_ogle`,
        tema: 'vakit',
        canli: { baslangicMs: 0, bolumler: [], kildim: { tarih: bugunuAl(), vakit: 'ogle' } },
      }),
    ]);
    expect(sonPlan()).toEqual([]);
  });

  test('kaynaklar ayrı saklanır: bir kaynağın boş bildirimi diğerini silmez', async () => {
    await p.kaynakBildir('iftarSayac', [aday()]);
    await p.kaynakBildir('seriSayac', []);
    expect(sonPlan().map((o) => o.id)).toEqual(['iftar_sayac_x']);
  });

  test('saat payı yazılır ve gözlemciye YALNIZ değişince haber verilir', async () => {
    const dinleyici = jest.fn();
    canliSaatDinleyicisiniAyarla(dinleyici);
    await p.kaynakBildir('iftarSayac', [aday()]);
    await p.yenidenPlanla();
    expect(dinleyici).toHaveBeenCalledTimes(1);
    const veri = JSON.parse(mockDepo[DEPOLAMA_ANAHTARLARI.CANLI_SAAT_VERISI]);
    expect(veri.vakitler).toEqual({ imsak: true, ogle: true, ikindi: true, aksam: true, yatsi: true });
    expect(veri.pencereler).toEqual([expect.objectContaining({ oge: 'iftar', ad: 'İftar', oncelik: 2 })]);
  });

  test('bozuk kaynak kaydı planı düşürmez', async () => {
    mockDepo[DEPOLAMA_ANAHTARLARI.CANLI_SAYAC_KAYNAKLARI] = '{bozuk';
    await p.yenidenPlanla();
    expect(mockCanliPlaniKur).toHaveBeenCalledWith('[]');
  });

  describe('iOS canlı etkinlik (#295)', () => {
    // moduleNameMapper mock'u: aynı örneğe `require` ile ulaşılır (AGENTS.md).
    const siri = require('../../../../modules/expo-siri-kisayollari/src') as {
      canliEtkinlikDestekli: jest.Mock;
      canliEtkinlikEsitle: jest.Mock;
    };
    const rn = require('react-native') as { Platform: { OS: string }; AppState: { currentState: string } };
    const platform = rn.Platform;
    // 2026-10-15 11:00 UTC = İstanbul 14:00 → öğle vakti (12:5x–15:5x). Yalnız Date sahte.
    const SIMDI = Date.UTC(2026, 9, 15, 11, 0);

    beforeEach(() => {
      platform.OS = 'ios';
      jest.useFakeTimers({ now: SIMDI, doNotFake: ['setTimeout', 'setInterval', 'setImmediate', 'nextTick', 'queueMicrotask'] });
      siri.canliEtkinlikDestekli.mockReturnValue(true);
      siri.canliEtkinlikEsitle.mockResolvedValue('baslatildi');
      mockKayit.mockResolvedValue({ basarili: true, veri: [] });
      mockDepo[DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI] = JSON.stringify({ koordinatlar: { lat: 41.0082, lng: 28.9784 } });
      mockDepo[DEPOLAMA_ANAHTARLARI.NOW_BAR_AYARLARI] = JSON.stringify(
        nowBarAyariniBirlestir(VARSAYILAN_NOW_BAR_AYARLARI, 'ogle', { baslangic: 'girince' })
      );
    });
    afterEach(() => {
      jest.useRealTimers();
      platform.OS = 'android';
      rn.AppState.currentState = 'active';
      siri.canliEtkinlikDestekli.mockReturnValue(false);
      siri.canliEtkinlikEsitle.mockResolvedValue('desteklenmiyor');
    });

    test('Android planı kurulmaz; şu anki vakit köprüye istenir', async () => {
      await p.yenidenPlanla();
      expect(mockCanliPlaniKur).not.toHaveBeenCalled();
      expect(siri.canliEtkinlikEsitle).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'sayac_2026-10-15_ogle', ad: 'Öğle', kildimTarih: '2026-10-15', kildimVakit: 'ogle' }),
        expect.anything()
      );
    });

    test('namaz KAYDINDA kılınmış vakit (muhafız diski henüz yazılmamış) etkinliği kapatır', async () => {
      mockKayit.mockResolvedValue({
        basarili: true,
        veri: [{ tarih: '2026-10-15', namazlar: [{ namazAdi: 'Öğle', tamamlandi: true }] }],
      });
      await p.yenidenPlanla();
      expect(siri.canliEtkinlikEsitle).toHaveBeenCalledWith(null, { onPlanda: true, korunacaklar: [] });
    });

    test('muhafız diskinde kılınmış vakit de kapatır', async () => {
      mockKilinan.mockImplementation(async (t: string) => (t === '2026-10-15' ? ['ogle'] : []));
      await p.yenidenPlanla();
      expect(siri.canliEtkinlikEsitle).toHaveBeenCalledWith(null, { onPlanda: true, korunacaklar: [] });
    });

    test('konum yoksa: istek yok, geçerlilik BİLİNMİYOR (arka planda native korur)', async () => {
      delete mockDepo[DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI];
      await p.yenidenPlanla();
      expect(siri.canliEtkinlikEsitle).toHaveBeenCalledWith(null, { onPlanda: true, korunacaklar: null });
    });

    test('ön planda: köprüye onPlanda + geçerli kimlikler gider', async () => {
      await p.yenidenPlanla();
      expect(siri.canliEtkinlikEsitle).toHaveBeenCalledWith(expect.objectContaining({ id: 'sayac_2026-10-15_ogle' }), {
        onPlanda: true,
        korunacaklar: ['sayac_2026-10-15_ogle'],
      });
    });

    test('ARKA PLANDA (background fetch / headless Kıldım) yeni etkinlik istenmez, geçerli olan korunur', async () => {
      // Önce bitir sonra iste deseni arka planda kilit ekranını boşaltıyordu:
      // Activity.request arka planda başarısız olur. Native onPlanda=false'ta istemez ve
      // yalnız korunacaklar DIŞINDAKİLERİ bitirir.
      rn.AppState.currentState = 'background';
      await p.yenidenPlanla();
      expect(siri.canliEtkinlikEsitle).toHaveBeenCalledWith(expect.objectContaining({ id: 'sayac_2026-10-15_ogle' }), {
        onPlanda: false,
        korunacaklar: ['sayac_2026-10-15_ogle'],
      });
    });

    test('arka planda kılınan vakit geçerli listeden düşer (native onu bitirir)', async () => {
      rn.AppState.currentState = 'background';
      mockKilinan.mockImplementation(async (t: string) => (t === '2026-10-15' ? ['ogle'] : []));
      await p.yenidenPlanla();
      expect(siri.canliEtkinlikEsitle).toHaveBeenCalledWith(null, { onPlanda: false, korunacaklar: [] });
    });

    test('destek yoksa (widget bayrağı kapalı build) köprüye hiç gidilmez, dinleyici kurulmaz', async () => {
      siri.canliEtkinlikDestekli.mockReturnValue(false);
      await p.yenidenPlanla();
      p.iosBaslat();
      expect(siri.canliEtkinlikEsitle).not.toHaveBeenCalled();
      expect(mockDinleyiciEkle).not.toHaveBeenCalled();
    });

    test('kılınmışlık dinleyicisi adlı yuvaya kurulur ve yeniden eşitler', async () => {
      p.iosBaslat();
      expect(mockDinleyiciEkle).toHaveBeenCalledWith('canliEtkinlik', expect.any(Function));
      (mockDinleyiciEkle.mock.calls[0][1] as () => void)();
      await p.yenidenPlanla();
      expect(siri.canliEtkinlikEsitle).toHaveBeenCalledTimes(2);
    });
  });
});
