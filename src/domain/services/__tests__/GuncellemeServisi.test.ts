/**
 * GuncellemeServisi Testleri
 *
 * Guncelleme kontrol servisi icin kapsamli birim testleri:
 * - Versiyon karsilastirma
 * - GitHub API entegrasyonu
 * - Onbellek mekanizmasi
 * - Erteleme mantigi
 * - Offline davranisi
 * - Provider pattern
 */

import {
  GuncellemeServisi,
  GitHubGuncellemeKaynagi,
  versiyonKarsilastir,
  yayinTarihiniFormatla,
  guvenilirBaglantiMi,
  GuncellemeKaynagi,
  GuncellemeKontrolSonucu,
} from '../GuncellemeServisi';
import { UYGULAMA, GUNCELLEME_SABITLERI } from '../../../core/constants/UygulamaSabitleri';

// ==================== MOCKLAR ====================

// AsyncStorage mock
const asyncStorageMock: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((key: string) => Promise.resolve(asyncStorageMock[key] || null)),
  setItem: jest.fn((key: string, value: string) => {
    asyncStorageMock[key] = value;
    return Promise.resolve();
  }),
  removeItem: jest.fn((key: string) => {
    delete asyncStorageMock[key];
    return Promise.resolve();
  }),
}));

// react-native Platform mock
jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
  },
}));

// NetInfo mock
const mockNetInfoFetch = jest.fn().mockResolvedValue({ isConnected: true });
jest.mock('@react-native-community/netinfo', () => ({
  fetch: () => mockNetInfoFetch(),
}));

// Global fetch mock
const mockFetch = jest.fn();
global.fetch = mockFetch;

// ==================== YARDIMCI FONKSIYONLAR ====================

/**
 * Mock GitHub API yaniti olustur
 */
function githubYanitiOlustur(versiyon: string, options: {
  body?: string;
  assets?: { name: string; browser_download_url: string }[];
  published_at?: string;
  html_url?: string;
} = {}) {
  return {
    ok: true,
    json: () => Promise.resolve({
      tag_name: `v${versiyon}`,
      body: options.body || `## v${versiyon}\n- Yeni ozellikler\n- Hata duzeltmeleri`,
      assets: options.assets || [
        {
          name: `NamazAkisi-v${versiyon}.apk`,
          browser_download_url: `https://github.com/furkanisikay/namazakisi/releases/download/v${versiyon}/NamazAkisi-v${versiyon}.apk`,
        },
      ],
      published_at: options.published_at || '2026-02-14T10:00:00Z',
      html_url: options.html_url || `https://github.com/furkanisikay/namazakisi/releases/tag/v${versiyon}`,
    }),
  };
}

/**
 * Basarili GitHub API kontrolu icin fetch mock ayarla
 */
function agBasariliMock() {
  mockFetch.mockResolvedValue(githubYanitiOlustur('1.0.0'));
}

// ==================== TESTLER ====================

describe('versiyonKarsilastir', () => {
  it('esit versiyonlar icin 0 dondurur', () => {
    expect(versiyonKarsilastir('1.0.0', '1.0.0')).toBe(0);
    expect(versiyonKarsilastir('0.3.0', '0.3.0')).toBe(0);
  });

  it('daha buyuk major versiyon icin pozitif dondurur', () => {
    expect(versiyonKarsilastir('2.0.0', '1.0.0')).toBeGreaterThan(0);
  });

  it('daha kucuk major versiyon icin negatif dondurur', () => {
    expect(versiyonKarsilastir('1.0.0', '2.0.0')).toBeLessThan(0);
  });

  it('minor versiyon farkini dogru karsilastirir', () => {
    expect(versiyonKarsilastir('1.2.0', '1.1.0')).toBeGreaterThan(0);
    expect(versiyonKarsilastir('1.1.0', '1.2.0')).toBeLessThan(0);
  });

  it('patch versiyon farkini dogru karsilastirir', () => {
    expect(versiyonKarsilastir('1.0.2', '1.0.1')).toBeGreaterThan(0);
    expect(versiyonKarsilastir('1.0.1', '1.0.2')).toBeLessThan(0);
  });

  it('v onekini dogru isler', () => {
    expect(versiyonKarsilastir('v1.0.0', '1.0.0')).toBe(0);
    expect(versiyonKarsilastir('v2.0.0', 'v1.0.0')).toBeGreaterThan(0);
  });

  it('farkli uzunlukta versiyonlari karsilastirir', () => {
    expect(versiyonKarsilastir('1.0', '1.0.0')).toBe(0);
    expect(versiyonKarsilastir('1.0.1', '1.0')).toBeGreaterThan(0);
  });

  it('gecersiz versiyon parcalari icin 0 kullanir', () => {
    expect(versiyonKarsilastir('1.abc.0', '1.0.0')).toBe(0);
  });
});

describe('yayinTarihiniFormatla', () => {
  it('ISO tarihini dd.mm.yyyy formatina cevirir', () => {
    const sonuc = yayinTarihiniFormatla('2026-02-14T10:00:00Z');
    expect(sonuc).toMatch(/14\.02\.2026/);
  });

  it('bos string icin bos string dondurur', () => {
    expect(yayinTarihiniFormatla('')).toBe('');
  });

  it('gecersiz tarih icin bos string dondurur', () => {
    expect(yayinTarihiniFormatla('gecersiz')).toBe('');
  });
});

describe('GitHubGuncellemeKaynagi', () => {
  let kaynak: GitHubGuncellemeKaynagi;

  beforeEach(() => {
    kaynak = new GitHubGuncellemeKaynagi('furkanisikay/namazakisi');
    mockFetch.mockReset();
  });

  it('tum platformlarda desteklenir', () => {
    expect(kaynak.destekleniyor()).toBe(true);
  });

  it('tip olarak github dondurur', () => {
    expect(kaynak.tip).toBe('github');
  });

  it('yeni versiyon mevcut oldugunda guncellemeMevcut true dondurur', async () => {
    const yeniVersiyon = '99.0.0'; // Mevcut versiyondan buyuk
    mockFetch.mockResolvedValue(githubYanitiOlustur(yeniVersiyon));

    const sonuc = await kaynak.enSonSurumuKontrolEt();

    expect(sonuc.guncellemeMevcut).toBe(true);
    expect(sonuc.bilgi?.yeniVersiyon).toBe(yeniVersiyon);
    expect(sonuc.bilgi?.mevcutVersiyon).toBe(UYGULAMA.VERSIYON);
    expect(sonuc.bilgi?.kaynak).toBe('github');
  });

  it('mevcut versiyon guncel oldugunda guncellemeMevcut false dondurur', async () => {
    // Mevcut versiyonla ayni
    mockFetch.mockResolvedValue(githubYanitiOlustur(UYGULAMA.VERSIYON));

    const sonuc = await kaynak.enSonSurumuKontrolEt();

    expect(sonuc.guncellemeMevcut).toBe(false);
    expect(sonuc.bilgi).toBeNull();
  });

  it('eski versiyon icin guncellemeMevcut false dondurur', async () => {
    mockFetch.mockResolvedValue(githubYanitiOlustur('0.0.1'));

    const sonuc = await kaynak.enSonSurumuKontrolEt();

    expect(sonuc.guncellemeMevcut).toBe(false);
  });

  it('API hatasi durumunda guncellemeMevcut false dondurur', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
    });

    const sonuc = await kaynak.enSonSurumuKontrolEt();

    expect(sonuc.guncellemeMevcut).toBe(false);
    expect(sonuc.bilgi).toBeNull();
  });

  it('ag hatasi durumunda guncellemeMevcut false dondurur', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const sonuc = await kaynak.enSonSurumuKontrolEt();

    expect(sonuc.guncellemeMevcut).toBe(false);
    expect(sonuc.bilgi).toBeNull();
  });

  it('APK indirme baglantisinii dogru bulur', async () => {
    const yeniVersiyon = '99.0.0';
    const apkUrl = `https://example.com/NamazAkisi-v${yeniVersiyon}.apk`;
    mockFetch.mockResolvedValue(githubYanitiOlustur(yeniVersiyon, {
      assets: [
        { name: `NamazAkisi-v${yeniVersiyon}.apk`, browser_download_url: apkUrl },
      ],
    }));

    const sonuc = await kaynak.enSonSurumuKontrolEt();

    expect(sonuc.bilgi?.indirmeBaglantisi).toBe(apkUrl);
  });

  it('APK yoksa release sayfasina yonlendirir', async () => {
    const yeniVersiyon = '99.0.0';
    const htmlUrl = `https://github.com/furkanisikay/namazakisi/releases/tag/v${yeniVersiyon}`;
    mockFetch.mockResolvedValue(githubYanitiOlustur(yeniVersiyon, {
      assets: [],
      html_url: htmlUrl,
    }));

    const sonuc = await kaynak.enSonSurumuKontrolEt();

    expect(sonuc.bilgi?.indirmeBaglantisi).toBe(htmlUrl);
  });

  it('degisiklik notlarini temizler ve kisaltir', async () => {
    const uzunNot = '## Yeni Ozellikler\n\n**Birinci ozellik**: Aciklama\n\n\n\nDevam';
    mockFetch.mockResolvedValue(githubYanitiOlustur('99.0.0', {
      body: uzunNot,
    }));

    const sonuc = await kaynak.enSonSurumuKontrolEt();

    // Markdown temizlenmis olmali
    expect(sonuc.bilgi?.degisiklikNotlari).not.toContain('##');
    expect(sonuc.bilgi?.degisiklikNotlari).not.toContain('**');
  });

  it('zaman asimi durumunu ele alir', async () => {
    // AbortError simule et
    const abortError = new Error('Aborted');
    abortError.name = 'AbortError';
    mockFetch.mockRejectedValue(abortError);

    const sonuc = await kaynak.enSonSurumuKontrolEt();

    expect(sonuc.guncellemeMevcut).toBe(false);
    expect(sonuc.bilgi).toBeNull();
  });
});

describe('GuncellemeServisi', () => {
  beforeEach(() => {
    // Her test oncesi temizle
    GuncellemeServisi.resetInstance();
    mockFetch.mockReset();
    mockNetInfoFetch.mockReset().mockResolvedValue({ isConnected: true });
    // AsyncStorage temizle
    Object.keys(asyncStorageMock).forEach(key => delete asyncStorageMock[key]);
  });

  it('singleton pattern dogru calisir', () => {
    const a = GuncellemeServisi.getInstance();
    const b = GuncellemeServisi.getInstance();
    expect(a).toBe(b);
  });

  it('resetInstance yeni instance olusturur', () => {
    const a = GuncellemeServisi.getInstance();
    GuncellemeServisi.resetInstance();
    const b = GuncellemeServisi.getInstance();
    expect(a).not.toBe(b);
  });

  it('guncelleme mevcut oldugunda dogru sonuc dondurur', async () => {
    const yeniVersiyon = '99.0.0';
    mockFetch.mockResolvedValue(githubYanitiOlustur(yeniVersiyon));

    const servis = GuncellemeServisi.getInstance();
    const sonuc = await servis.guncellemeKontrolEt(true);

    expect(sonuc.guncellemeMevcut).toBe(true);
    expect(sonuc.bilgi?.yeniVersiyon).toBe(yeniVersiyon);
  });

  it('guncelleme yokken dogru sonuc dondurur', async () => {
    mockFetch.mockResolvedValue(githubYanitiOlustur(UYGULAMA.VERSIYON));

    const servis = GuncellemeServisi.getInstance();
    const sonuc = await servis.guncellemeKontrolEt(true);

    expect(sonuc.guncellemeMevcut).toBe(false);
  });

  it('cevrimdisi iken guvenli sonuc dondurur', async () => {
    // NetInfo cevrimdisi rapor ediyor
    mockNetInfoFetch.mockResolvedValue({ isConnected: false });

    const servis = GuncellemeServisi.getInstance();
    const sonuc = await servis.guncellemeKontrolEt(true);

    expect(sonuc.guncellemeMevcut).toBe(false);
    // fetch cagirilmamis olmali
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('onbellek gecerli iken tekrar API cagrisi yapmiyor', async () => {
    const yeniVersiyon = '99.0.0';
    mockFetch.mockResolvedValue(githubYanitiOlustur(yeniVersiyon));

    const servis = GuncellemeServisi.getInstance();

    // Ilk kontrol - API cagrisi yapilir
    await servis.guncellemeKontrolEt(true);
    const fetchCallCount = mockFetch.mock.calls.length;

    // Ikinci kontrol - onbellekten doner (zorla degil)
    const sonuc = await servis.guncellemeKontrolEt(false);

    // Ek API cagrisi yapilmamis olmali
    expect(mockFetch.mock.calls.length).toBe(fetchCallCount);
    expect(sonuc.guncellemeMevcut).toBe(true);
  });

  it('zorla kontrol onbellegi atlar', async () => {
    const yeniVersiyon = '99.0.0';
    mockFetch.mockResolvedValue(githubYanitiOlustur(yeniVersiyon));

    const servis = GuncellemeServisi.getInstance();

    // Ilk kontrol
    await servis.guncellemeKontrolEt(true);
    const fetchCallCount = mockFetch.mock.calls.length;

    // Zorla kontrol - onbellek gecerli olsa bile API cagrisi yapilir
    await servis.guncellemeKontrolEt(true);

    expect(mockFetch.mock.calls.length).toBeGreaterThan(fetchCallCount);
  });

  it('erteleme dogru calisir', async () => {
    const yeniVersiyon = '99.0.0';
    mockFetch.mockResolvedValue(githubYanitiOlustur(yeniVersiyon));

    const servis = GuncellemeServisi.getInstance();

    // Ilk kontrol
    await servis.guncellemeKontrolEt(true);

    // Ertele
    await servis.guncellemeErtele(yeniVersiyon);

    // Zorla degil kontrol - erteleme icinde olmali
    const fetchCallCountBefore = mockFetch.mock.calls.length;
    await servis.guncellemeKontrolEt(false);

    // API cagrisi yapilmamis olmali (erteleme sureci devam ediyor)
    expect(mockFetch.mock.calls.length).toBe(fetchCallCountBefore);
  });

  it('ozel kaynak eklenebilir', async () => {
    const ozelSonuc: GuncellemeKontrolSonucu = {
      guncellemeMevcut: true,
      bilgi: {
        yeniVersiyon: '99.0.0',
        mevcutVersiyon: UYGULAMA.VERSIYON,
        degisiklikNotlari: 'Test',
        indirmeBaglantisi: 'https://example.com',
        yayinTarihi: '2026-01-01',
        kaynak: 'playstore',
        zorunluMu: false,
      },
    };

    const ozelKaynak: GuncellemeKaynagi = {
      tip: 'playstore',
      destekleniyor: () => true,
      enSonSurumuKontrolEt: jest.fn().mockResolvedValue(ozelSonuc),
    };

    // GitHub kaynak basarisiz olsun
    mockFetch.mockResolvedValue({ ok: false, status: 404 });

    const servis = GuncellemeServisi.getInstance();
    servis.kaynakEkle(ozelKaynak);

    const sonuc = await servis.guncellemeKontrolEt(true);

    expect(ozelKaynak.enSonSurumuKontrolEt).toHaveBeenCalled();
    expect(sonuc.guncellemeMevcut).toBe(true);
    expect(sonuc.bilgi?.kaynak).toBe('playstore');
  });

  it('desteklenmeyen kaynak atlanir', async () => {
    const desteklenmeyenKaynak: GuncellemeKaynagi = {
      tip: 'appstore',
      destekleniyor: () => false,
      enSonSurumuKontrolEt: jest.fn(),
    };

    mockFetch.mockResolvedValue(githubYanitiOlustur(UYGULAMA.VERSIYON));

    const servis = GuncellemeServisi.getInstance();
    servis.kaynakEkle(desteklenmeyenKaynak);

    await servis.guncellemeKontrolEt(true);

    expect(desteklenmeyenKaynak.enSonSurumuKontrolEt).not.toHaveBeenCalled();
  });

  it('onbellek AsyncStorage a kaydedilir', async () => {
    mockFetch.mockResolvedValue(githubYanitiOlustur('99.0.0'));

    const servis = GuncellemeServisi.getInstance();
    await servis.guncellemeKontrolEt(true);

    // AsyncStorage'da kayit olmali
    expect(asyncStorageMock[GUNCELLEME_SABITLERI.DEPOLAMA_ANAHTARI]).toBeDefined();

    const kayitliVeri = JSON.parse(asyncStorageMock[GUNCELLEME_SABITLERI.DEPOLAMA_ANAHTARI]);
    expect(kayitliVeri.sonSonuc.guncellemeMevcut).toBe(true);
    expect(kayitliVeri.sonKontrolZamani).toBeDefined();
  });

  it('hata durumunda guvenli sonuc dondurur', async () => {
    // Beklenmedik hata
    mockFetch.mockImplementation(() => {
      throw new Error('Beklenmedik hata');
    });

    const servis = GuncellemeServisi.getInstance();
    const sonuc = await servis.guncellemeKontrolEt(true);

    expect(sonuc.guncellemeMevcut).toBe(false);
    expect(sonuc.bilgi).toBeNull();
  });
});

describe('guvenilirBaglantiMi', () => {
  it('github.com HTTPS baglantisini kabul eder', () => {
    expect(guvenilirBaglantiMi('https://github.com/furkanisikay/namazakisi/releases')).toBe(true);
  });

  it('objects.githubusercontent.com baglantisini kabul eder', () => {
    expect(guvenilirBaglantiMi('https://objects.githubusercontent.com/some-asset')).toBe(true);
  });

  it('play.google.com baglantisini kabul eder', () => {
    expect(guvenilirBaglantiMi('https://play.google.com/store/apps/details?id=com.test')).toBe(true);
  });

  it('apps.apple.com baglantisini kabul eder', () => {
    expect(guvenilirBaglantiMi('https://apps.apple.com/app/test/id123')).toBe(true);
  });

  it('HTTP baglantisini reddeder', () => {
    expect(guvenilirBaglantiMi('http://github.com/test')).toBe(false);
  });

  it('bilinmeyen domaini reddeder', () => {
    expect(guvenilirBaglantiMi('https://evil-site.com/malware.apk')).toBe(false);
  });

  it('gecersiz URL icin false dondurur', () => {
    expect(guvenilirBaglantiMi('not-a-url')).toBe(false);
  });

  it('bos string icin false dondurur', () => {
    expect(guvenilirBaglantiMi('')).toBe(false);
  });
});
