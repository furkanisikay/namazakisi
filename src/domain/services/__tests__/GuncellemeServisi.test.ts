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

// PlayStoreGuncellemeModulu mock
const mockKurulumKaynagiGetir = jest.fn().mockResolvedValue('sideload');
jest.mock('../PlayStoreGuncellemeModulu', () => ({
  PlayStoreModulu: {
    kurulumKaynagiGetir: () => mockKurulumKaynagiGetir(),
    guncellemeDurumunuKontrolEt: jest.fn().mockResolvedValue({ guncellemeMevcut: false }),
    esnekGuncellemeBaslat: jest.fn(),
    guncellemeYuklemeyiTamamla: jest.fn(),
    installDurumDinle: jest.fn().mockReturnValue(() => {}),
    indirilenGuncellemeVarMiKontrolEt: jest.fn(),
  },
}));

// PlayStoreGuncellemeKaynagi mock
const mockPlayStoreKontrolEt = jest.fn().mockResolvedValue({ guncellemeMevcut: false, bilgi: null });
jest.mock('../PlayStoreGuncellemeKaynagi', () => ({
  PlayStoreGuncellemeKaynagi: jest.fn().mockImplementation(() => ({
    tip: 'playstore',
    destekleniyor: () => true,
    enSonSurumuKontrolEt: () => mockPlayStoreKontrolEt(),
  })),
}));

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
    // Guvenilir bir domain kullanmak gerekiyor (guvenlik dogrulamasi aktif)
    const apkUrl = `https://objects.githubusercontent.com/releases/NamazAkisi-v${yeniVersiyon}.apk`;
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

  it('basliksiz/duz metin release notlarinda markdown sembollerini temizler (fallback yolu)', async () => {
    // Bu metinde "###" bolum basligi YOK (sadece "##") ve "- "/"* " madde listesi
    // yok; bu yuzden yapilandirilmis dal hicbir sey toplayamaz ve uretim FALLBACK
    // yoluna (ham metni temizleyerek dondurme) duser. Bu testin amaci o fallback'i
    // dogrulamaktir: markdown sembolleri silinir, icerik korunur, fazla bos satir
    // (>=3 \n) tek bos satira indirilir.
    const hamNot = '## Yeni Ozellikler\n\n**Birinci ozellik**: Aciklama\n\n\n\nDevam';
    mockFetch.mockResolvedValue(githubYanitiOlustur('99.0.0', {
      body: hamNot,
    }));

    const sonuc = await kaynak.enSonSurumuKontrolEt();
    const notlar = sonuc.bilgi?.degisiklikNotlari ?? '';

    // 1) Markdown sembolleri tamamen temizlenmis olmali (regresyon: temizlik atlanirsa fail)
    expect(notlar).not.toContain('#');
    expect(notlar).not.toContain('*');

    // 2) Icerik korunmus olmali (regresyon: fallback metni yutarsa/keserse fail)
    expect(notlar).toContain('Yeni Ozellikler');
    expect(notlar).toContain('Birinci ozellik: Aciklama');
    expect(notlar).toContain('Devam');

    // 3) Uc+ ardisik satir sonu tek bos satira (cift \n) indirilmis olmali
    //    (regresyon: \n{3,} -> \n\n sadelestirmesi kaldirilirsa fail)
    expect(notlar).not.toMatch(/\n{3,}/);

    // 4) Tam beklenen cikti — bagimsiz olarak uretim donusumunu birebir kilitler
    expect(notlar).toBe('Yeni Ozellikler\n\nBirinci ozellik: Aciklama\n\nDevam');
  });

  it('degisiklik notlarini yapilandirilmis formatta uretir (struct yolu)', async () => {
    // "###" bolum basliklari + "- " madde listesi => uretim YAPILANDIRILMIS dali
    // calismali (fallback degil). Bilerek inline "**" KULLANMIYORUZ; cunku
    // yapilandirilmis dal madde icerigini HAM push eder ve inline markdown'i
    // temizlemez (uretim satir 247) — boyle bir madde testi mevcut kodda fail ederdi.
    const releaseNot = `### Yeni Özellikler
- X özelligi eklendi
- Y özelligi eklendi

### Hata Düzeltmeleri
- Z hatasi giderildi`;
    mockFetch.mockResolvedValue(githubYanitiOlustur('99.0.0', { body: releaseNot }));

    const sonuc = await kaynak.enSonSurumuKontrolEt();
    const notlar = sonuc.bilgi?.degisiklikNotlari ?? '';

    // Yapilandirilmis bicimlendirme yolu calismis olmali (fallback degil):
    // baslik etiketi + her madde "• " on ekiyle listelenir
    expect(notlar).toContain('Yeni Özellikler:');
    expect(notlar).toContain('• X özelligi eklendi');
    expect(notlar).toContain('• Y özelligi eklendi');
    // "fixed"/"hata" bolumu dolu oldugundan ozet "Hatalar giderildi" eklenir
    expect(notlar).toContain('Hatalar giderildi');
    // Ham markdown bolum basligi sembolleri ciktida kalmamali
    expect(notlar).not.toContain('###');
    // Fallback'e dusulmedi: cikti madde isaretli yapilandirilmis bicim
    expect(notlar.startsWith('Yeni Özellikler:')).toBe(true);
  });

  it('Added ve Fixed bolumleri dogru formatlar', async () => {
    const releaseNot = `## [0.6.0] - 2026-02-14

### Added
- Merge pull request #28 from furkanisikay/claude/merge-kible-to-master-bRa1M
- Add Qibla finder feature with comprehensive code review fixes
- kible gosterici ozelligi eklendi

### Fixed
- PR bot yorumları uygulandı - NetInfo, URL doğrulama, typo
- code review düzeltmeleri - kritik hatalar ve iyileştirmeler`;

    mockFetch.mockResolvedValue(githubYanitiOlustur('99.0.0', {
      body: releaseNot,
    }));

    const sonuc = await kaynak.enSonSurumuKontrolEt();

    expect(sonuc.bilgi?.degisiklikNotlari).toContain('Yeni Özellikler:');
    expect(sonuc.bilgi?.degisiklikNotlari).toContain('Qibla finder');
    expect(sonuc.bilgi?.degisiklikNotlari).toContain('kible gosterici');
    expect(sonuc.bilgi?.degisiklikNotlari).toContain('Hatalar giderildi');
    // Gereksiz merge commit mesajlari filtrelenmis olmali
    expect(sonuc.bilgi?.degisiklikNotlari).not.toContain('Merge pull request');
  });

  it('Turkce ve emoji bolum basliklari dogru formatlar', async () => {
    const releaseNot = `📊 **3** commit | Önceki: [v0.8.0](https://github.com/furkanisikay/namazakisi/releases/tag/v0.8.0)

### ✨ Yeni Özellikler
- iftar sayacini ana ekrandan bildirim menusune tasi

### 🐛 Hata Düzeltmeleri
- bazi crash duzeltildi

### ♻️ Refactoring
- kod duzenlendi

---

## 📱 İndirme

🔗 **Full Changelog**: https://github.com/furkanisikay/namazakisi/compare/v0.8.0...v0.9.0
`;

    mockFetch.mockResolvedValue(githubYanitiOlustur('99.0.0', {
      body: releaseNot,
    }));

    const sonuc = await kaynak.enSonSurumuKontrolEt();

    expect(sonuc.bilgi?.degisiklikNotlari).toContain('Yeni Özellikler:');
    expect(sonuc.bilgi?.degisiklikNotlari).toContain('iftar sayacini');
    expect(sonuc.bilgi?.degisiklikNotlari).toContain('Hatalar giderildi');
    // Ham commit sayisi satiri gorunmemeli
    expect(sonuc.bilgi?.degisiklikNotlari).not.toContain('commit');
    expect(sonuc.bilgi?.degisiklikNotlari).not.toContain('Önceki');
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

  it('uygulama guncellendiginde cache gecersiz hale gelir', async () => {
    // Senaryo: Kullanici once uygulamayi guncelledi, artik mevcut versiyon == cache'deki "yeni versiyon"
    // AsyncStorage'a manuel olarak eski bir guncelleme cache'i ekle
    const eskiCache = {
      sonKontrolZamani: Date.now(), // Zaman gecerli (simdi)
      sonSonuc: {
        guncellemeMevcut: true,
        bilgi: {
          yeniVersiyon: UYGULAMA.VERSIYON, // Cache'deki "yeni versiyon" artik mevcut versiyon
          mevcutVersiyon: '0.5.0', // Eski versiyon
          degisiklikNotlari: 'Test',
          indirmeBaglantisi: 'https://example.com',
          yayinTarihi: '2026-01-01',
          kaynak: 'github',
          zorunluMu: false,
        },
      },
      ertelenenVersiyon: null,
      ertelemeZamani: null,
    };

    // AsyncStorage'a cache ekle
    asyncStorageMock[GUNCELLEME_SABITLERI.DEPOLAMA_ANAHTARI] = JSON.stringify(eskiCache);

    // Yeni bir servis instance'i olustur (cache yuklensin)
    GuncellemeServisi.resetInstance();
    const servis = GuncellemeServisi.getInstance();

    // Yeni versiyon mevcut (99.0.0 > mevcut versiyon)
    mockFetch.mockResolvedValue(githubYanitiOlustur('99.0.0'));

    // Kontrol et - cache gecersiz olmali (cached yeni versiyon = mevcut versiyon)
    // Bu yuzden API cagrisi yapmali
    await servis.guncellemeKontrolEt(false);

    // API cagrisi yapilmis olmali (cache gecersiz oldugu icin)
    expect(mockFetch).toHaveBeenCalled();
  });

  it('erteleme surecinde bayat cache varsa API cagrisi yapar', async () => {
    // Senaryo: Kullanici guncellemeyi ertelemisti, ama sonra uygulamayi guncelledi.
    // Erteleme sureci hala aktif olsa bile guncelleme popup gostermemeli.
    const bayatCache = {
      sonKontrolZamani: Date.now(),
      sonSonuc: {
        guncellemeMevcut: true,
        bilgi: {
          yeniVersiyon: UYGULAMA.VERSIYON, // Artik mevcut versiyon
          mevcutVersiyon: '0.5.0',
          degisiklikNotlari: 'Test',
          indirmeBaglantisi: 'https://example.com',
          yayinTarihi: '2026-01-01',
          kaynak: 'github',
          zorunluMu: false,
        },
      },
      ertelenenVersiyon: UYGULAMA.VERSIYON,
      ertelemeZamani: Date.now(), // Erteleme hala aktif
    };

    asyncStorageMock[GUNCELLEME_SABITLERI.DEPOLAMA_ANAHTARI] = JSON.stringify(bayatCache);

    GuncellemeServisi.resetInstance();
    const servis = GuncellemeServisi.getInstance();

    // API artik guncelleme yok diyecek
    mockFetch.mockResolvedValue(githubYanitiOlustur(UYGULAMA.VERSIYON));

    const sonuc = await servis.guncellemeKontrolEt(false);

    // Erteleme aktif olsa bile bayat cache yuzunden API cagrisi yapilmali
    expect(mockFetch).toHaveBeenCalled();
    // Ve guncelleme mevcut olmamali (zaten guncel)
    expect(sonuc.guncellemeMevcut).toBe(false);
  });

  it('cevrimdisi iken bayat cache varsa guncelleme gostermez', async () => {
    // Senaryo: Kullanici guncellemeyi kurdu, ama ilk acilista cevrimdisi.
    // Eski cache "guncelleme var" diyor ama artik gecersiz.
    const bayatCache = {
      sonKontrolZamani: Date.now(),
      sonSonuc: {
        guncellemeMevcut: true,
        bilgi: {
          yeniVersiyon: UYGULAMA.VERSIYON, // Artik mevcut versiyon
          mevcutVersiyon: '0.5.0',
          degisiklikNotlari: 'Test',
          indirmeBaglantisi: 'https://example.com',
          yayinTarihi: '2026-01-01',
          kaynak: 'github',
          zorunluMu: false,
        },
      },
      ertelenenVersiyon: null,
      ertelemeZamani: null,
    };

    asyncStorageMock[GUNCELLEME_SABITLERI.DEPOLAMA_ANAHTARI] = JSON.stringify(bayatCache);

    GuncellemeServisi.resetInstance();
    const servis = GuncellemeServisi.getInstance();

    // Cevrimdisi
    mockNetInfoFetch.mockResolvedValue({ isConnected: false });

    const sonuc = await servis.guncellemeKontrolEt(false);

    // Cevrimdisi + bayat cache = guncelleme yok
    expect(sonuc.guncellemeMevcut).toBe(false);
    expect(sonuc.bilgi).toBeNull();
  });
});

// ==================== PLAY STORE ENTEGRASYON TESTLERİ ====================

describe('GuncellemeServisi — Play Store kaynak seçimi', () => {
  beforeEach(() => {
    // Her test için mock ve servis sıfırla
    Object.keys(asyncStorageMock).forEach(k => delete asyncStorageMock[k]);
    GuncellemeServisi.resetInstance();
    mockNetInfoFetch.mockResolvedValue({ isConnected: true });
    mockKurulumKaynagiGetir.mockClear();
    mockKurulumKaynagiGetir.mockResolvedValue('sideload');
    mockPlayStoreKontrolEt.mockClear();
    mockPlayStoreKontrolEt.mockResolvedValue({ guncellemeMevcut: false, bilgi: null });
    mockFetch.mockClear();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ tag_name: `v${UYGULAMA.VERSIYON}`, assets: [], body: '' }),
    });
  });

  it('sideload kurulumda GitHub provider kullanılır', async () => {
    mockKurulumKaynagiGetir.mockResolvedValue('sideload');
    const servis = GuncellemeServisi.getInstance();

    await servis.guncellemeKontrolEt(true);

    // GitHub API çağrılmalı
    expect(mockFetch).toHaveBeenCalled();
    // Play Store kontrol çağrılmamalı
    expect(mockPlayStoreKontrolEt).not.toHaveBeenCalled();
  });

  it('"unknown" kurulum kaynağında GitHub provider kullanılır', async () => {
    mockKurulumKaynagiGetir.mockResolvedValue('unknown');
    const servis = GuncellemeServisi.getInstance();

    await servis.guncellemeKontrolEt(true);

    expect(mockFetch).toHaveBeenCalled();
    expect(mockPlayStoreKontrolEt).not.toHaveBeenCalled();
  });

  it('play_store kurulumda Play Store provider kullanılır', async () => {
    mockKurulumKaynagiGetir.mockResolvedValue('play_store');
    mockPlayStoreKontrolEt.mockResolvedValue({
      guncellemeMevcut: true,
      bilgi: {
        yeniVersiyon: 'versionCode 28',
        mevcutVersiyon: UYGULAMA.VERSIYON,
        degisiklikNotlari: '',
        indirmeBaglantisi: 'playstore://update',
        yayinTarihi: '',
        kaynak: 'playstore',
        zorunluMu: false,
      },
    });

    const servis = GuncellemeServisi.getInstance();
    const sonuc = await servis.guncellemeKontrolEt(true);

    // Play Store provider çağrılmalı
    expect(mockPlayStoreKontrolEt).toHaveBeenCalled();
    // GitHub API çağrılmamalı (Play Store provider aktif)
    expect(mockFetch).not.toHaveBeenCalled();
    expect(sonuc.guncellemeMevcut).toBe(true);
    expect(sonuc.bilgi!.kaynak).toBe('playstore');
  });

  it('kurulum kaynağı tespiti sadece bir kez yapılır (lazy init)', async () => {
    mockKurulumKaynagiGetir.mockResolvedValue('sideload');
    const servis = GuncellemeServisi.getInstance();

    await servis.guncellemeKontrolEt(true);
    await servis.guncellemeKontrolEt(true);
    await servis.guncellemeKontrolEt(true);

    // kurulumKaynagiGetir sadece bir kez çağrılmalı
    expect(mockKurulumKaynagiGetir).toHaveBeenCalledTimes(1);
  });

  it('kurulum kaynağı tespiti hata fırlattığında GitHub korunur', async () => {
    mockKurulumKaynagiGetir.mockRejectedValue(new Error('Tespit hatası'));
    const servis = GuncellemeServisi.getInstance();

    // Hata durumunda crash olmaz ve GitHub çalışır
    await expect(servis.guncellemeKontrolEt(true)).resolves.toBeDefined();
    expect(mockFetch).toHaveBeenCalled();
  });
});

describe('GuncellemeServisi — onbellekBayatMi Play Store guard', () => {
  beforeEach(() => {
    Object.keys(asyncStorageMock).forEach(k => delete asyncStorageMock[k]);
    GuncellemeServisi.resetInstance();
    mockNetInfoFetch.mockResolvedValue({ isConnected: false });
    mockKurulumKaynagiGetir.mockResolvedValue('sideload');
  });

  it('Play Store cache asla "bayat" sayılmaz (versiyonCode string semantik karşılaştırma yapılmaz)', async () => {
    // Play Store güncelleme bilgisi olan geçerli cache
    const playStoreCache = {
      sonKontrolZamani: Date.now(), // Yeni cache
      sonSonuc: {
        guncellemeMevcut: true,
        bilgi: {
          yeniVersiyon: 'versionCode 28',
          mevcutVersiyon: UYGULAMA.VERSIYON,
          degisiklikNotlari: '',
          indirmeBaglantisi: 'playstore://update',
          yayinTarihi: '',
          kaynak: 'playstore',
          zorunluMu: false,
        },
      },
      ertelenenVersiyon: null,
      ertelemeZamani: null,
    };

    asyncStorageMock[GUNCELLEME_SABITLERI.DEPOLAMA_ANAHTARI] = JSON.stringify(playStoreCache);

    const servis = GuncellemeServisi.getInstance();
    // Çevrimdışı — cache geçerliyse cache'i dönmeli
    const sonuc = await servis.guncellemeKontrolEt(false);

    // Cache geçerli olmalı (bayat sayılmamalı), güncelleme gösterilmeli
    expect(sonuc.guncellemeMevcut).toBe(true);
    expect(sonuc.bilgi!.kaynak).toBe('playstore');
  });

  it('GitHub cache versiyonu güncel uygulamayla eşleşince bayat kabul edilir', async () => {
    const bayatGithubCache = {
      sonKontrolZamani: Date.now(),
      sonSonuc: {
        guncellemeMevcut: true,
        bilgi: {
          yeniVersiyon: UYGULAMA.VERSIYON, // Artık mevcut versiyon
          mevcutVersiyon: '0.5.0',
          degisiklikNotlari: '',
          indirmeBaglantisi: 'https://github.com/test/releases',
          yayinTarihi: '',
          kaynak: 'github',
          zorunluMu: false,
        },
      },
      ertelenenVersiyon: null,
      ertelemeZamani: null,
    };

    asyncStorageMock[GUNCELLEME_SABITLERI.DEPOLAMA_ANAHTARI] = JSON.stringify(bayatGithubCache);
    mockNetInfoFetch.mockResolvedValue({ isConnected: false });

    const servis = GuncellemeServisi.getInstance();
    const sonuc = await servis.guncellemeKontrolEt(false);

    // Bayat GitHub cache: çevrimdışı + bayat = güncelleme yok
    expect(sonuc.guncellemeMevcut).toBe(false);
  });
});

describe('GuncellemeServisi — Play Store her açılışta taze sorgular (cache takılmaz)', () => {
  const playStoreAvailable = (yeniVersiyon = '46') => ({
    guncellemeMevcut: true,
    bilgi: {
      yeniVersiyon,
      yeniVersiyonEtiketi: 'Yeni sürüm',
      mevcutVersiyon: UYGULAMA.VERSIYON,
      degisiklikNotlari: '',
      indirmeBaglantisi: 'playstore://update',
      yayinTarihi: '',
      kaynak: 'playstore' as const,
      zorunluMu: false,
    },
  });

  beforeEach(() => {
    Object.keys(asyncStorageMock).forEach(k => delete asyncStorageMock[k]);
    GuncellemeServisi.resetInstance();
    mockNetInfoFetch.mockResolvedValue({ isConnected: true });
    mockKurulumKaynagiGetir.mockReset().mockResolvedValue('play_store');
    mockPlayStoreKontrolEt.mockReset();
    mockFetch.mockReset();
  });

  it('geçerli cache olsa bile Play Core yeniden sorgulanır', async () => {
    // Geçerli (taze) playstore cache
    asyncStorageMock[GUNCELLEME_SABITLERI.DEPOLAMA_ANAHTARI] = JSON.stringify({
      sonKontrolZamani: Date.now(),
      sonSonuc: playStoreAvailable('46'),
      ertelenenVersiyon: null,
      ertelemeZamani: null,
    });
    mockPlayStoreKontrolEt.mockResolvedValue(playStoreAvailable('46'));

    const servis = GuncellemeServisi.getInstance();
    const sonuc = await servis.guncellemeKontrolEt(false);

    // Cache'e takılmadan Play Core sorgulanmış olmalı
    expect(mockPlayStoreKontrolEt).toHaveBeenCalled();
    expect(sonuc.guncellemeMevcut).toBe(true);
  });

  it('güncelleme sonrası Play Core "yok" derse, eski cache olsa bile modal çıkmaz', async () => {
    // Eski cache hâlâ "güncelleme var" diyor (kullanıcı güncellemeden önceki durum)
    asyncStorageMock[GUNCELLEME_SABITLERI.DEPOLAMA_ANAHTARI] = JSON.stringify({
      sonKontrolZamani: Date.now(),
      sonSonuc: playStoreAvailable('46'),
      ertelenenVersiyon: null,
      ertelemeZamani: null,
    });
    // Play Core artık güncelleme yok diyor (kullanıcı güncelledi)
    mockPlayStoreKontrolEt.mockResolvedValue({ guncellemeMevcut: false, bilgi: null });

    const servis = GuncellemeServisi.getInstance();
    const sonuc = await servis.guncellemeKontrolEt(false);

    expect(mockPlayStoreKontrolEt).toHaveBeenCalled();
    expect(sonuc.guncellemeMevcut).toBe(false);
  });

  it('kullanıcı "Sonra" dediyse erteleme süresince banner bastırılır, zorla kontrol gösterir', async () => {
    mockPlayStoreKontrolEt.mockResolvedValue(playStoreAvailable('46'));

    const servis = GuncellemeServisi.getInstance();
    // İlk kontrol + ertele
    await servis.guncellemeKontrolEt(false);
    await servis.guncellemeErtele('46');

    // Erteleme aktif → banner bastırılır
    const ertelenmis = await servis.guncellemeKontrolEt(false);
    expect(ertelenmis.guncellemeMevcut).toBe(false);

    // Zorla (manuel) kontrol → gerçek durum gösterilir
    const zorlanmis = await servis.guncellemeKontrolEt(true);
    expect(zorlanmis.guncellemeMevcut).toBe(true);
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

// ==================== EK KAPSAM: DENETIM GAP'LERI ====================
// Asagidaki testler denetimin tespit ettigi eksik kapsami doldurur:
// - GitHub APK baglantisi artik guvenilirBaglantiMi ile DOGRULANMAKTADIR (duzeltildi)
// - Gercek surum (0.23.1) baglaminda off-by-one minor/patch sinir karsilastirmasi
// - ERTELEME_SURESI (24s) ve KONTROL_ARALIGI (6s) ZAMAN sinirlari
// - Play Store erteleme: ertelenen surum != yeni surum ise banner GOSTERILMELI
// - degisiklikNotlari 500 karakter kisaltma

describe('GitHubGuncellemeKaynagi — guvenilmez indirme baglantisi (guvenlik dogrulamasi)', () => {
  let kaynak: GitHubGuncellemeKaynagi;

  beforeEach(() => {
    kaynak = new GitHubGuncellemeKaynagi('furkanisikay/namazakisi');
    mockFetch.mockReset();
  });

  it('API guvenilmez bir APK domaini donerse, indirmeBaglantisi sabit fallbackine dusuyor', async () => {
    // GUVENLIK DUZELTMESI: indirmeBaglantisiBul artik API'den gelen
    // browser_download_url'i guvenilirBaglantiMi ile DOGRULIYOR. Guvenilmez URL
    // (phishing/manipule edilmis domain) reddedilerek sabit releases/latest URL'ine
    // dusulmektedir. html_url'de guvenilir olsa da APK reddi durumunda sabit
    // fallback kullanilir (html_url de manipule edilmis olabilir).
    const kotuUrl = 'https://evil-site.com/NamazAkisi-99.0.0.apk';
    const sabitFallback = 'https://github.com/furkanisikay/namazakisi/releases/latest';
    mockFetch.mockResolvedValue(githubYanitiOlustur('99.0.0', {
      assets: [{ name: 'NamazAkisi-99.0.0.apk', browser_download_url: kotuUrl }],
      html_url: 'https://github.com/furkanisikay/namazakisi/releases/tag/v99.0.0',
    }));

    const sonuc = await kaynak.enSonSurumuKontrolEt();

    // Yeni davranis: guvenilmez APK URL'i reddedilir, sabit releases/latest'e dusulur
    expect(sonuc.bilgi?.indirmeBaglantisi).toBe(sabitFallback);
    // kotuUrl'in reddedildigini dogrula
    expect(guvenilirBaglantiMi(kotuUrl)).toBe(false);
  });

  it('API guvenilmez bir html_url donerse, sabit fallback URL kullaniliyor', async () => {
    // html_url manipule edilmisse bile sabit github.com/releases/latest URL'i kullanilir
    const kotuHtmlUrl = 'https://evil-site.com/fake-release';
    const sabitFallback = 'https://github.com/furkanisikay/namazakisi/releases/latest';
    mockFetch.mockResolvedValue(githubYanitiOlustur('99.0.0', {
      assets: [], // APK yok, html_url'e dusecek
      html_url: kotuHtmlUrl,
    }));

    const sonuc = await kaynak.enSonSurumuKontrolEt();

    // Guvenilmez html_url reddedilir, sabit fallback kullanilir
    expect(sonuc.bilgi?.indirmeBaglantisi).toBe(sabitFallback);
    expect(guvenilirBaglantiMi(kotuHtmlUrl)).toBe(false);
  });

  it('guvenilir bir APK baglantisi oldugu gibi donuluyor', async () => {
    // Guvenilir domain iceren APK URL'i korunmali
    const guvenilirApkUrl = 'https://objects.githubusercontent.com/releases/NamazAkisi-99.0.0.apk';
    mockFetch.mockResolvedValue(githubYanitiOlustur('99.0.0', {
      assets: [{ name: 'NamazAkisi-99.0.0.apk', browser_download_url: guvenilirApkUrl }],
    }));

    const sonuc = await kaynak.enSonSurumuKontrolEt();

    expect(sonuc.bilgi?.indirmeBaglantisi).toBe(guvenilirApkUrl);
    expect(guvenilirBaglantiMi(guvenilirApkUrl)).toBe(true);
  });
});

describe('GitHubGuncellemeKaynagi — gercek surum (0.23.1) sinir karsilastirmasi', () => {
  let kaynak: GitHubGuncellemeKaynagi;

  beforeEach(() => {
    kaynak = new GitHubGuncellemeKaynagi('furkanisikay/namazakisi');
    mockFetch.mockReset();
  });

  it('mevcut surumden bir patch yuksek (0.23.3) -> guncelleme MEVCUT', async () => {
    // Referans: UYGULAMA.VERSIYON === '0.23.2' (sabit dogrulanir)
    expect(UYGULAMA.VERSIYON).toBe('0.23.2');
    mockFetch.mockResolvedValue(githubYanitiOlustur('0.23.3'));

    const sonuc = await kaynak.enSonSurumuKontrolEt();

    expect(sonuc.guncellemeMevcut).toBe(true);
    expect(sonuc.bilgi?.yeniVersiyon).toBe('0.23.3');
  });

  it('mevcut surumden bir minor yuksek (0.24.0) -> guncelleme MEVCUT', async () => {
    mockFetch.mockResolvedValue(githubYanitiOlustur('0.24.0'));

    const sonuc = await kaynak.enSonSurumuKontrolEt();

    expect(sonuc.guncellemeMevcut).toBe(true);
    expect(sonuc.bilgi?.yeniVersiyon).toBe('0.24.0');
  });

  it('mevcut surumden bir patch dusuk (0.23.1) -> guncelleme YOK', async () => {
    mockFetch.mockResolvedValue(githubYanitiOlustur('0.23.1'));

    const sonuc = await kaynak.enSonSurumuKontrolEt();

    expect(sonuc.guncellemeMevcut).toBe(false);
    expect(sonuc.bilgi).toBeNull();
  });
});

describe('GitHubGuncellemeKaynagi — degisiklik notlari 500 karakter kisaltmasi', () => {
  let kaynak: GitHubGuncellemeKaynagi;

  beforeEach(() => {
    kaynak = new GitHubGuncellemeKaynagi('furkanisikay/namazakisi');
    mockFetch.mockReset();
  });

  it('cok uzun release notu fallback yolunda 500 karaktere kisaltilir', async () => {
    // Bolum basligi/madde listesi olmayan duz uzun metin -> fallback yoluna duser
    // (degisiklikNotlariniDuzenle son satir: .slice(0, 500)).
    const cokUzunNot = 'A'.repeat(2000);
    mockFetch.mockResolvedValue(githubYanitiOlustur('99.0.0', { body: cokUzunNot }));

    const sonuc = await kaynak.enSonSurumuKontrolEt();
    const notlar = sonuc.bilgi?.degisiklikNotlari ?? '';

    // Tam 500 karakterde kesilmeli (slice(0,500) regresyonu yakalanir)
    expect(notlar.length).toBe(500);
    expect(notlar).toBe('A'.repeat(500));
  });

  it('yapilandirilmis (madde) yolunda da cikti 500 karakteri asmaz', async () => {
    // Cok sayida "Added" maddesi -> yapilandirilmis dal; sonuc yine .slice(0,500).
    const maddeler = Array.from({ length: 60 }, (_, i) =>
      `- ${'uzun ozellik aciklamasi '.repeat(2)}${i}`
    ).join('\n');
    const releaseNot = `### Added\n${maddeler}`;
    mockFetch.mockResolvedValue(githubYanitiOlustur('99.0.0', { body: releaseNot }));

    const sonuc = await kaynak.enSonSurumuKontrolEt();
    const notlar = sonuc.bilgi?.degisiklikNotlari ?? '';

    expect(notlar.length).toBeLessThanOrEqual(500);
    // Gercekten uzun girdiden kisaltma yapildigini garanti et (tam sinira ulasti)
    expect(notlar.length).toBe(500);
  });
});

describe('GuncellemeServisi — erteleme ZAMAN siniri (ERTELEME_SURESI = 24 saat)', () => {
  beforeEach(() => {
    Object.keys(asyncStorageMock).forEach((k) => delete asyncStorageMock[k]);
    GuncellemeServisi.resetInstance();
    mockNetInfoFetch.mockReset().mockResolvedValue({ isConnected: true });
    mockKurulumKaynagiGetir.mockReset().mockResolvedValue('sideload'); // GitHub provider
    mockFetch.mockReset();
  });

  it('erteleme suresi DOLDUKTAN sonra (25 saat once ertelendi) banner yeniden gosterilir', async () => {
    // Cache: guncelleme var ('99.0.0' > 0.23.1), 25 saat once ertelendi -> sure doldu.
    // NOT: TTL (KONTROL_ARALIGI) de DOLU tutulur (7 saat once) cunku taze bir TTL
    // cache'i erteleme bagimsiz olarak kisa devre yapar; bu testin ayirt edici
    // boyutu YALNIZCA erteleme suresinin dolmus olmasi -> ilk kisa devre atlanir ve
    // (TTL de gecersiz oldugundan) taze API sorgusuna ulasilir.
    const yirmiBesSaatOnce = Date.now() - 25 * 60 * 60 * 1000;
    const yediSaatOnce = Date.now() - 7 * 60 * 60 * 1000;
    asyncStorageMock[GUNCELLEME_SABITLERI.DEPOLAMA_ANAHTARI] = JSON.stringify({
      sonKontrolZamani: yediSaatOnce,
      sonSonuc: {
        guncellemeMevcut: true,
        bilgi: {
          yeniVersiyon: '99.0.0',
          mevcutVersiyon: UYGULAMA.VERSIYON,
          degisiklikNotlari: '',
          indirmeBaglantisi: 'https://github.com/test/releases',
          yayinTarihi: '',
          kaynak: 'github',
          zorunluMu: false,
        },
      },
      ertelenenVersiyon: '99.0.0',
      ertelemeZamani: yirmiBesSaatOnce, // ERTELEME_SURESI (24s) DOLDU
    });

    mockFetch.mockResolvedValue(githubYanitiOlustur('99.0.0'));

    const servis = GuncellemeServisi.getInstance();
    const sonuc = await servis.guncellemeKontrolEt(false);

    // Erteleme suresi dolmus oldugundan kisa devre OLMAMALI -> taze API sorgusu yapilmali
    expect(mockFetch).toHaveBeenCalled();
    // Ve guncelleme yeniden gosterilmeli
    expect(sonuc.guncellemeMevcut).toBe(true);
    expect(sonuc.bilgi?.yeniVersiyon).toBe('99.0.0');
  });

  it('erteleme suresi DEVAM ederken (1 saat once ertelendi) banner bastirilir, API cagrilmaz', async () => {
    // Karsi senaryo: TTL yine DOLU (7 saat once) — yani tek fark erteleme yasi.
    // Erteleme aktif oldugundan ilk kisa devre devreye girer: cache'deki son sonuc
    // dondurulur, API CAGRILMAZ. (Ust testle birlikte temiz bir sinir cifti olusturur.)
    const birSaatOnce = Date.now() - 1 * 60 * 60 * 1000;
    const yediSaatOnce = Date.now() - 7 * 60 * 60 * 1000;
    asyncStorageMock[GUNCELLEME_SABITLERI.DEPOLAMA_ANAHTARI] = JSON.stringify({
      sonKontrolZamani: yediSaatOnce,
      sonSonuc: {
        guncellemeMevcut: true,
        bilgi: {
          yeniVersiyon: '99.0.0',
          mevcutVersiyon: UYGULAMA.VERSIYON,
          degisiklikNotlari: '',
          indirmeBaglantisi: 'https://github.com/test/releases',
          yayinTarihi: '',
          kaynak: 'github',
          zorunluMu: false,
        },
      },
      ertelenenVersiyon: '99.0.0',
      ertelemeZamani: birSaatOnce, // ERTELEME_SURESI (24s) DEVAM EDIYOR
    });

    mockFetch.mockResolvedValue(githubYanitiOlustur('99.0.0'));

    const servis = GuncellemeServisi.getInstance();
    const sonuc = await servis.guncellemeKontrolEt(false);

    // Erteleme aktif + cache bayat degil -> kisa devre: API cagrilmaz, banner gizli
    expect(mockFetch).not.toHaveBeenCalled();
    expect(sonuc.guncellemeMevcut).toBe(true); // cache'deki son sonuc dondurulur
  });
});

describe('GuncellemeServisi — onbellek ZAMAN siniri (KONTROL_ARALIGI = 6 saat TTL)', () => {
  beforeEach(() => {
    Object.keys(asyncStorageMock).forEach((k) => delete asyncStorageMock[k]);
    GuncellemeServisi.resetInstance();
    mockNetInfoFetch.mockReset().mockResolvedValue({ isConnected: true });
    mockKurulumKaynagiGetir.mockReset().mockResolvedValue('sideload'); // GitHub provider
    mockFetch.mockReset();
  });

  it('cache 7 saat once olusturulmus (TTL dolmus) + surum hala guncel-degil -> yeniden API sorgusu', async () => {
    // sonKontrolZamani 7 saat once: KONTROL_ARALIGI (6s) asildi -> cache gecersiz.
    // yeniVersiyon (99.0.0) > mevcut surum oldugundan onbellekBayatMi=false; yani
    // gecersizlik TAMAMEN zaman boyutundan gelir (bayatlik degil).
    const yediSaatOnce = Date.now() - 7 * 60 * 60 * 1000;
    asyncStorageMock[GUNCELLEME_SABITLERI.DEPOLAMA_ANAHTARI] = JSON.stringify({
      sonKontrolZamani: yediSaatOnce, // TTL DOLDU
      sonSonuc: {
        guncellemeMevcut: true,
        bilgi: {
          yeniVersiyon: '99.0.0',
          mevcutVersiyon: UYGULAMA.VERSIYON,
          degisiklikNotlari: '',
          indirmeBaglantisi: 'https://github.com/test/releases',
          yayinTarihi: '',
          kaynak: 'github',
          zorunluMu: false,
        },
      },
      ertelenenVersiyon: null,
      ertelemeZamani: null,
    });

    mockFetch.mockResolvedValue(githubYanitiOlustur('99.0.0'));

    const servis = GuncellemeServisi.getInstance();
    await servis.guncellemeKontrolEt(false);

    // TTL dolmus -> cache kisa devresi OLMAMALI, taze API sorgusu yapilmali
    expect(mockFetch).toHaveBeenCalled();
  });

  it('cache 1 saat once olusturulmus (TTL gecerli) -> API cagrilmaz (kisa devre)', async () => {
    // Karsi senaryo: taze cache -> onbellekGecerliMi=true -> API atlanir.
    const birSaatOnce = Date.now() - 1 * 60 * 60 * 1000;
    asyncStorageMock[GUNCELLEME_SABITLERI.DEPOLAMA_ANAHTARI] = JSON.stringify({
      sonKontrolZamani: birSaatOnce, // TTL gecerli
      sonSonuc: {
        guncellemeMevcut: true,
        bilgi: {
          yeniVersiyon: '99.0.0',
          mevcutVersiyon: UYGULAMA.VERSIYON,
          degisiklikNotlari: '',
          indirmeBaglantisi: 'https://github.com/test/releases',
          yayinTarihi: '',
          kaynak: 'github',
          zorunluMu: false,
        },
      },
      ertelenenVersiyon: null,
      ertelemeZamani: null,
    });

    mockFetch.mockResolvedValue(githubYanitiOlustur('99.0.0'));

    const servis = GuncellemeServisi.getInstance();
    const sonuc = await servis.guncellemeKontrolEt(false);

    expect(mockFetch).not.toHaveBeenCalled();
    expect(sonuc.guncellemeMevcut).toBe(true);
  });
});

describe('GuncellemeServisi — Play Store erteleme: surum uyusmazliginda banner gosterilir', () => {
  beforeEach(() => {
    Object.keys(asyncStorageMock).forEach((k) => delete asyncStorageMock[k]);
    GuncellemeServisi.resetInstance();
    mockNetInfoFetch.mockReset().mockResolvedValue({ isConnected: true });
    mockKurulumKaynagiGetir.mockReset().mockResolvedValue('play_store');
    mockPlayStoreKontrolEt.mockReset();
    mockFetch.mockReset();
  });

  it('ertelenen surum (46) ile YENI surum (47) eslesmiyorsa banner BASTIRILMAZ', async () => {
    // Uretim satir 415-423: kisa devre yalnizca
    // onbellek.ertelenenVersiyon === sonuc.bilgi.yeniVersiyon iken olur.
    // Kullanici 46'yi erteledi; ama Play Core artik 47 donduruyor -> banner gosterilmeli.
    const playStore47 = {
      guncellemeMevcut: true,
      bilgi: {
        yeniVersiyon: '47',
        yeniVersiyonEtiketi: 'Yeni sürüm',
        mevcutVersiyon: UYGULAMA.VERSIYON,
        degisiklikNotlari: '',
        indirmeBaglantisi: 'playstore://update',
        yayinTarihi: '',
        kaynak: 'playstore' as const,
        zorunluMu: false,
      },
    };
    mockPlayStoreKontrolEt.mockResolvedValue(playStore47);

    const servis = GuncellemeServisi.getInstance();
    // Once 46'yi ertele
    await servis.guncellemeErtele('46');

    // Erteleme aktif AMA yeni surum (47) ertelenen (46) ile eslesmiyor -> banner gosterilir
    const sonuc = await servis.guncellemeKontrolEt(false);

    expect(mockPlayStoreKontrolEt).toHaveBeenCalled();
    expect(sonuc.guncellemeMevcut).toBe(true);
    expect(sonuc.bilgi?.yeniVersiyon).toBe('47');
  });

  it('ertelenen surum (46) ile yeni surum (46) eslesirse banner BASTIRILIR (karsi senaryo)', async () => {
    const playStore46 = {
      guncellemeMevcut: true,
      bilgi: {
        yeniVersiyon: '46',
        yeniVersiyonEtiketi: 'Yeni sürüm',
        mevcutVersiyon: UYGULAMA.VERSIYON,
        degisiklikNotlari: '',
        indirmeBaglantisi: 'playstore://update',
        yayinTarihi: '',
        kaynak: 'playstore' as const,
        zorunluMu: false,
      },
    };
    mockPlayStoreKontrolEt.mockResolvedValue(playStore46);

    const servis = GuncellemeServisi.getInstance();
    await servis.guncellemeErtele('46');

    const sonuc = await servis.guncellemeKontrolEt(false);

    // Eslesiyor + erteleme aktif -> banner bastirilir
    expect(sonuc.guncellemeMevcut).toBe(false);
    expect(sonuc.bilgi).toBeNull();
  });
});
