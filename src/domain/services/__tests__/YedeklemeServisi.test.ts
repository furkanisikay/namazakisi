/**
 * YedeklemeServisi testleri.
 *
 * Depolama I/O ve şifreleme mock'lanır (gerçek native/crypto'ya bağımlı kalmamak için).
 * Şifreleme mock'u: base64 round-trip (sifrele↔coz) + uzunluk-bazlı sahte checksum;
 * böylece kontrol doğrulaması gerçekçi (aynı düz-metin → aynı özet) ve tur-turu çalışır.
 */

import { Depolama } from '../../../data/local/Depolama';
import {
  sifrele as sifreleGercek,
  coz as cozGercek,
  kontrolHesapla as kontrolHesaplaGercek,
} from '../../../core/utils/yedekSifreleme';
import { yedekZarfiOlustur, zarfiCoz, yedeginiPaylas, mevcutVeriyiTopla } from '../YedeklemeServisi';
import { YEDEK_AYAR_ALANLARI } from '../YedekBirlestirmeServisi';
import { AZAMI_YEDEK_DOSYASI_BAYT } from '../../../core/yedek/yedekPayloadDogrula';
import { ROZET_TANIMLARI } from '../../../core/types/SeriTipleri';
import { YEDEK_BICIMI, YEDEK_SURUMU, YedekZarfi } from '../../../core/types';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';

// expo-file-system/legacy: klasik writeAsStringAsync + cacheDirectory mock'u.
// Değişken adları `mock` önekiyle başlar — jest.mock hoisting kuralı gereği.
const mockDosyaYaz = jest.fn().mockResolvedValue(undefined);
const beklenenDosyaUri = 'file:///cache/namaz-yedek-2026-06-14.json';
jest.mock('expo-file-system/legacy', () => ({
  writeAsStringAsync: (...args: unknown[]) => mockDosyaYaz(...args),
  cacheDirectory: 'file:///cache/',
  EncodingType: { UTF8: 'utf8' },
}));

// expo-sharing: isAvailableAsync + shareAsync mock'u.
const mockIsAvailable = jest.fn().mockResolvedValue(true);
const mockShareAsync = jest.fn().mockResolvedValue(undefined);
jest.mock('expo-sharing', () => ({
  isAvailableAsync: () => mockIsAvailable(),
  shareAsync: (...args: unknown[]) => mockShareAsync(...args),
}));

// TarihYardimcisi: bugunuAl deterministik döner.
jest.mock('../../../core/utils/TarihYardimcisi', () => ({
  bugunuAl: () => '2026-06-14',
}));

// Kaza Defteri 2.0: yedek, defteri `KazaDefteriServisi.defteriHesapla` ile okur
// (hareketler + çözülemeyen yeni sürüm öğeleri + türetilmiş görünüm). Bu suite
// Depolama'yı ve tarih yardımcılarını mock'ladığı için servis de mock'lanır;
// gerçek türetme `kazaDefteriHesabi.test.ts`'te ölçülür.
const mockKazaHareketi = {
  id: 'manuel:1',
  zaman: '2026-06-14T08:00:00.000Z',
  cihaz: 'abc123',
  kaynak: 'manuel',
  vakit: 'sabah',
  adet: 2,
};
const mockBilinmeyen = { id: 'gelecek:1', zaman: '2026-06-14T09:00:00.000Z', kaynak: 'yeniTur', ek: 1 };
jest.mock('../KazaDefteriServisi', () => ({
  defteriHesapla: jest.fn(async () => ({
    gorunum: {
      namazlar: [
        { namazAdi: 'Sabah', kalanBorc: 2, tamamlanan: 1, toplamBorc: 3 },
        { namazAdi: 'Öğle', kalanBorc: 0, tamamlanan: 0, toplamBorc: 0 },
      ],
      toplamKalan: 2,
      toplamTamamlanan: 1,
      gunlukHedef: 3,
      gunlukTamamlanan: 0,
      gunlukHedefTarihi: '2026-06-14',
      toplamGizleMi: false,
      guncellemeTarihi: '2026-06-14T08:00:00.000Z',
      fazla: {},
      toplamFazla: 0,
    },
    girdi: { hareketler: [mockKazaHareketi] },
    bilinmeyenler: [mockBilinmeyen],
    bozukAylar: [],
    eskiKayitBozuk: false,
    sonTarama: null,
    cihaz: 'abc123',
  })),
}));
jest.mock('../../../data/local/LocalKazaServisi', () => ({
  hareketleriEkle: jest.fn().mockResolvedValue(0),
}));

// Depolama: tüm metotları kontrol edilebilir mock olarak ver.
jest.mock('../../../data/local/Depolama', () => ({
  Depolama: {
    oku: jest.fn(),
    yaz: jest.fn().mockResolvedValue(undefined),
    onEkiOlanAnahtarlar: jest.fn(),
    cogunuOku: jest.fn(),
  },
}));

// Şifreleme: base64 round-trip + uzunluk-bazlı checksum (deterministik, native'siz).
jest.mock('../../../core/utils/yedekSifreleme', () => ({
  sifrele: jest.fn(async (m: string) => ({
    nonce: 'N',
    veri: Buffer.from(m).toString('base64'),
  })),
  coz: jest.fn((_n: string, v: string) => {
    try {
      return Buffer.from(v, 'base64').toString('utf8');
    } catch {
      return null;
    }
  }),
  kontrolHesapla: jest.fn(async (m: string) => 'sum-' + m.length),
}));

const okuMock = Depolama.oku as jest.Mock;
const yazMock = Depolama.yaz as jest.Mock;
const onEkiMock = Depolama.onEkiOlanAnahtarlar as jest.Mock;
const cogunuOkuMock = Depolama.cogunuOku as jest.Mock;
const sifreleMock = sifreleGercek as jest.Mock;
const cozMock = cozGercek as jest.Mock;
const kontrolMock = kontrolHesaplaGercek as jest.Mock;

const KILINAN_ONEK = `${DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI}_kilinan_`;

/**
 * Depolama mock'unu gerçekçi bir veri kümesiyle ayarlar: 1 namaz günü, 1 kılınan
 * vakit günü, seri/rozet/seviye/bonus/istatistik/kaza ve ayarlar.
 */
const depolamayiAyarla = (): void => {
  onEkiMock.mockImplementation(async (onek: string) => {
    if (onek === DEPOLAMA_ANAHTARLARI.NAMAZ_GUN_ONEK) {
      return [`${DEPOLAMA_ANAHTARLARI.NAMAZ_GUN_ONEK}2026-06-14`];
    }
    if (onek === KILINAN_ONEK) {
      return [`${KILINAN_ONEK}2026-06-14`];
    }
    return [];
  });

  cogunuOkuMock.mockImplementation(async (anahtarlar: string[]) => {
    return anahtarlar.map((a) => {
      if (a === `${DEPOLAMA_ANAHTARLARI.NAMAZ_GUN_ONEK}2026-06-14`) {
        return [a, JSON.stringify({ Sabah: true, 'Öğle': false })];
      }
      if (a === `${KILINAN_ONEK}2026-06-14`) {
        return [a, JSON.stringify(['ogle', 'ikindi'])];
      }
      return [a, null];
    });
  });

  okuMock.mockImplementation(async (anahtar: string) => {
    switch (anahtar) {
      case DEPOLAMA_ANAHTARLARI.SERI_DURUMU:
        return { mevcutSeri: 5 };
      case DEPOLAMA_ANAHTARLARI.ROZET_VERILERI:
        return [{ id: 'ilk_hafta' }];
      case DEPOLAMA_ANAHTARLARI.SEVIYE_DURUMU:
        return { seviye: 3 };
      case DEPOLAMA_ANAHTARLARI.BONUS_PUAN:
        return 50;
      case DEPOLAMA_ANAHTARLARI.TOPLAM_KILILAN_NAMAZ:
        return 1250;
      case DEPOLAMA_ANAHTARLARI.MUKEMMEL_GUN_SAYISI:
        return 42;
      case DEPOLAMA_ANAHTARLARI.TOPARLANMA_SAYISI:
        return 3;
      case DEPOLAMA_ANAHTARLARI.KAZA_DURUMU:
        return { borclar: {} };
      case DEPOLAMA_ANAHTARLARI.KAZA_TEMPO_GECMIS:
        return { '2026-06-14': 2 };
      case DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI:
        return { aktif: true };
      case DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI:
        return { sehir: 'İstanbul' };
      case DEPOLAMA_ANAHTARLARI.CAMIYE_GIT_AYARLARI:
        return { aktif: true, yurumeDk: 12 };
      case DEPOLAMA_ANAHTARLARI.KAZA_ONERI_AYARLARI:
        return { farzSonrasiOner: false };
      case DEPOLAMA_ANAHTARLARI.SADE_GORUNUM_AYARLARI:
        return { aktif: true };
      case DEPOLAMA_ANAHTARLARI.SEFERILIK_AYARLARI:
        return { kartAcik: true, mezhep: 'safii', ikamet: null };
      default:
        return null;
    }
  });
};

describe('YedeklemeServisi — yedekZarfiOlustur', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    depolamayiAyarla();
  });

  it('doğru biçim/sürüm/şifreli alanlarla ve checksum içeren zarf üretir', async () => {
    const zarfStr = await yedekZarfiOlustur();
    const zarf = JSON.parse(zarfStr) as YedekZarfi;

    expect(zarf.bicim).toBe(YEDEK_BICIMI);
    expect(zarf.surum).toBe(YEDEK_SURUMU);
    expect(zarf.sifreli).toBe(true);
    expect(typeof zarf.olusturulma).toBe('string');
    expect(typeof zarf.uygulamaSurumu).toBe('string');
    expect(zarf.nonce).toBe('N');
    expect(typeof zarf.veri).toBe('string');
    // Checksum, şifrelenmemiş payload düz-metni üzerinden hesaplanmalı.
    const duzMetin = Buffer.from(zarf.veri, 'base64').toString('utf8');
    expect(zarf.kontrol).toBe('sum-' + duzMetin.length);
    expect(kontrolMock).toHaveBeenCalledWith(duzMetin);
    expect(sifreleMock).toHaveBeenCalledWith(duzMetin);
  });

  it('payload tüm kategorileri toplar (namaz, kılınan, seri, istatistik, kaza, ayarlar)', async () => {
    const zarfStr = await yedekZarfiOlustur();
    const zarf = JSON.parse(zarfStr) as YedekZarfi;
    const duzMetin = Buffer.from(zarf.veri, 'base64').toString('utf8');
    const payload = JSON.parse(duzMetin);

    expect(payload.namazGunleri['2026-06-14']).toEqual({ Sabah: true, 'Öğle': false });
    expect(payload.kilinanVakitler['2026-06-14']).toEqual(['ogle', 'ikindi']);
    expect(payload.seri).toEqual({ mevcutSeri: 5 });
    expect(payload.rozetler).toEqual([{ id: 'ilk_hafta' }]);
    expect(payload.seviye).toEqual({ seviye: 3 });
    expect(payload.bonusPuan).toBe(50);
    expect(payload.istatistik).toEqual({ toplamKilinan: 1250, mukemmelGun: 42, toparlanma: 3 });
    // Kaza Defteri 2.0: diskteki eski KAZA_DURUMU DEĞİL, defterden TÜRETİLMİŞ eski
    // şekilli görüntü (eski sürümlü cihazlar ilerlemeyi görsün) + hareketler.
    expect(payload.kaza).toMatchObject({
      toplamKalan: 2,
      toplamTamamlanan: 1,
      namazlar: [
        { namazAdi: 'Sabah', kalanBorc: 2, tamamlanan: 1, toplamBorc: 3 },
        { namazAdi: 'Öğle', kalanBorc: 0, tamamlanan: 0, toplamBorc: 0 },
      ],
    });
    expect(typeof payload.kaza.defterOzeti).toBe('string');
    // Çözülemeyen (yeni sürüm) hareket de AYNEN taşınır (ileri uyumluluk).
    expect(payload.kazaHareketleri).toEqual([mockKazaHareketi, mockBilinmeyen]);
    expect(payload.kazaTempo).toEqual({ '2026-06-14': 2 });
    expect(payload.ayarlar.muhafiz).toEqual({ aktif: true });
    expect(payload.ayarlar.konum).toEqual({ sehir: 'İstanbul' });
    // "Camide kılacağım" (issue #292): beyaz listeye eklenmeseydi cihaz değişiminde kaybolurdu.
    expect(payload.ayarlar.camiyeGit).toEqual({ aktif: true, yurumeDk: 12 });
    // "Her farzla bir kaza" (issue #294): kapatılmış öneri cihaz değişiminde geri açılmasın.
    expect(payload.ayarlar.kazaOneri).toEqual({ farzSonrasiOner: false });
    // Sade görünüm (issue #295): yaşlı kullanıcının telefonu değişince ayar geri gelsin.
    expect(payload.ayarlar.sadeGorunum).toEqual({ aktif: true });
    // Seferîlik bilgi kartı (issue #296): mezhep ve ikamet yeri cihaz değişiminde korunsun.
    expect(payload.ayarlar.seferilik).toEqual({ kartAcik: true, mezhep: 'safii', ikamet: null });
  });

  it('seferîlik kart hafızası ("bu yolculukta kapattım") cihaza özgüdür — yedeğe girmez', async () => {
    await yedekZarfiOlustur();
    const { Depolama } = jest.requireMock('../../../data/local/Depolama');
    const okunanlar = (Depolama.oku as jest.Mock).mock.calls.map((c: unknown[]) => c[0]);
    expect(okunanlar).not.toContain(DEPOLAMA_ANAHTARLARI.SEFERILIK_KART_HAFIZASI);
  });

  it('SON_DISA_AKTARMA yedeğe girmez: payload oluşturma yolunda o anahtarla Depolama.oku hiç çağrılmaz', async () => {
    await yedekZarfiOlustur();
    // Önce Depolama.oku'nun GERÇEKTEN çağrıldığını doğrula — yoksa payload yolu ileride
    // cogunuOku/başka bir okuma yoluna taşınırsa bu test hiçbir şey ölçmeden yeşil kalır.
    expect(okuMock).toHaveBeenCalled();
    const cagrilanAnahtarlar = okuMock.mock.calls.map((cagri: unknown[]) => cagri[0]);
    expect(cagrilanAnahtarlar).not.toContain(DEPOLAMA_ANAHTARLARI.SON_DISA_AKTARMA);
  });

  it('eksik anahtarlar için güvenli varsayılanlar kullanır (null/0/[])', async () => {
    // Hiçbir anahtar yok: tüm okumalar null/boş.
    onEkiMock.mockResolvedValue([]);
    cogunuOkuMock.mockResolvedValue([]);
    okuMock.mockResolvedValue(null);

    const zarfStr = await yedekZarfiOlustur();
    const zarf = JSON.parse(zarfStr) as YedekZarfi;
    const payload = JSON.parse(Buffer.from(zarf.veri, 'base64').toString('utf8'));

    expect(payload.namazGunleri).toEqual({});
    expect(payload.kilinanVakitler).toEqual({});
    expect(payload.seri).toBeNull();
    expect(payload.rozetler).toEqual([]);
    expect(payload.bonusPuan).toBe(0);
    expect(payload.istatistik).toEqual({ toplamKilinan: 0, mukemmelGun: 0, toparlanma: 0 });
    expect(payload.kazaTempo).toEqual({});
  });
});

describe('YedeklemeServisi — zarfiCoz', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    depolamayiAyarla();
  });

  it('geçerli zarfı tur-turu payload olarak çözer (namazGunleri tanımlı)', async () => {
    const zarfStr = await yedekZarfiOlustur();
    const payload = await zarfiCoz(zarfStr);

    expect(payload).not.toBeNull();
    expect(payload!.namazGunleri['2026-06-14']).toEqual({ Sabah: true, 'Öğle': false });
    expect(payload!.kilinanVakitler['2026-06-14']).toEqual(['ogle', 'ikindi']);
    expect(payload!.istatistik.toplamKilinan).toBe(1250);
  });

  it('geçersiz JSON içeriğinde null döner', async () => {
    expect(await zarfiCoz('{bozuk-json')).toBeNull();
  });

  it('yanlış biçimde null döner', async () => {
    const zarfStr = await yedekZarfiOlustur();
    const zarf = JSON.parse(zarfStr) as YedekZarfi;
    zarf.bicim = 'baska-uygulama';
    expect(await zarfiCoz(JSON.stringify(zarf))).toBeNull();
  });

  it('checksum uyuşmazlığında null döner', async () => {
    const zarfStr = await yedekZarfiOlustur();
    const zarf = JSON.parse(zarfStr) as YedekZarfi;
    zarf.kontrol = 'sum-9999'; // bozulmuş bütünlük özeti
    expect(await zarfiCoz(JSON.stringify(zarf))).toBeNull();
  });

  it('sürüm uygulamadan yeni ise (surum > YEDEK_SURUMU) null döner', async () => {
    const zarfStr = await yedekZarfiOlustur();
    const zarf = JSON.parse(zarfStr) as YedekZarfi;
    zarf.surum = YEDEK_SURUMU + 1;
    expect(await zarfiCoz(JSON.stringify(zarf))).toBeNull();
  });

  it('şifre çözme başarısız olursa (bozuk veri) null döner', async () => {
    const zarfStr = await yedekZarfiOlustur();
    const zarf = JSON.parse(zarfStr) as YedekZarfi;
    cozMock.mockReturnValueOnce(null); // çözme MAC hatası simülasyonu
    expect(await zarfiCoz(JSON.stringify(zarf))).toBeNull();
  });
});

describe('YedeklemeServisi — yedeginiPaylas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    depolamayiAyarla();
    mockIsAvailable.mockResolvedValue(true);
    mockDosyaYaz.mockResolvedValue(undefined);
    mockShareAsync.mockResolvedValue(undefined);
  });

  it('cache dizinine doğru isimde dosya yazar', async () => {
    await yedeginiPaylas();
    expect(mockDosyaYaz).toHaveBeenCalledTimes(1);
    const [uri, icerik, secenekler] = mockDosyaYaz.mock.calls[0] as [
      string,
      string,
      { encoding: string },
    ];
    expect(uri).toBe(beklenenDosyaUri);
    // Yedek içeriği geçerli JSON ve yedek zarfını içermeli.
    const zarf = JSON.parse(icerik) as YedekZarfi;
    expect(zarf.bicim).toBe(YEDEK_BICIMI);
    expect(secenekler.encoding).toBe('utf8');
  });

  it('shareAsync doğru uri, mimeType ve dialogTitle ile çağrılır', async () => {
    await yedeginiPaylas();
    expect(mockShareAsync).toHaveBeenCalledTimes(1);
    expect(mockShareAsync).toHaveBeenCalledWith(beklenenDosyaUri, {
      mimeType: 'application/json',
      dialogTitle: 'Yedeğinizi paylaşın',
    });
  });

  it('paylaşım desteklenmiyorsa (isAvailableAsync false) sessizce döner, shareAsync çağrılmaz', async () => {
    mockIsAvailable.mockResolvedValue(false);
    await expect(yedeginiPaylas()).resolves.toBeUndefined();
    expect(mockShareAsync).not.toHaveBeenCalled();
    // Dosya yine de yazılmış olmalı.
    expect(mockDosyaYaz).toHaveBeenCalledTimes(1);
  });

  it('paylaşım başarılıysa Depolama.yaz SON_DISA_AKTARMA anahtarıyla ISO zaman damgasıyla çağrılır', async () => {
    await yedeginiPaylas();
    expect(yazMock).toHaveBeenCalledTimes(1);
    const [anahtar, deger] = yazMock.mock.calls[0] as [string, string];
    expect(anahtar).toBe(DEPOLAMA_ANAHTARLARI.SON_DISA_AKTARMA);
    expect(() => new Date(deger).toISOString()).not.toThrow();
    expect(new Date(deger).toISOString()).toBe(deger);
  });

  it('paylaşım desteklenmiyorsa (isAvailableAsync false) damga da yazılmaz', async () => {
    mockIsAvailable.mockResolvedValue(false);
    await yedeginiPaylas();
    expect(yazMock).not.toHaveBeenCalled();
  });

  it('Depolama.yaz reddederse yedeginiPaylas yine de başarılı döner (paylaşım zaten tamamlandı)', async () => {
    yazMock.mockRejectedValueOnce(new Error('disk dolu'));
    await expect(yedeginiPaylas()).resolves.toBeUndefined();
    expect(mockShareAsync).toHaveBeenCalledTimes(1);
  });
});

// ─── Denetim B-2 / B-3: zarf anahtarı sır değil → içerik daraltılır ─────────

/** Kaynak koddaki açık anahtarla herkesin üretebileceği "geçerli" zarf (mock şifrelemeyle). */
const zarfla = (icerik: unknown): string => {
  const duzMetin = JSON.stringify(icerik);
  return JSON.stringify({
    bicim: YEDEK_BICIMI,
    surum: YEDEK_SURUMU,
    olusturulma: '2026-06-14T08:00:00.000Z',
    uygulamaSurumu: '0.0.0',
    sifreli: true,
    nonce: 'N',
    veri: Buffer.from(duzMetin).toString('base64'),
    kontrol: 'sum-' + duzMetin.length,
  });
};

/** Depolamayı uygulamanın GERÇEKTE yazdığı şekillerle doldurur (her ayar alanı dolu). */
const gercekciDepolama = (): void => {
  const gunler: Record<string, unknown> = {
    '2026-06-13': { Sabah: true, 'Öğle': true, 'İkindi': true, 'Akşam': true, 'Yatsı': true },
    '2026-06-14': { Sabah: true, 'Öğle': false },
  };
  const kilinan: Record<string, unknown> = {
    '2026-06-13': ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'],
    '2026-06-14': [],
  };
  onEkiMock.mockImplementation(async (onek: string) => {
    if (onek === DEPOLAMA_ANAHTARLARI.NAMAZ_GUN_ONEK) return Object.keys(gunler).map((t) => `${onek}${t}`);
    if (onek === KILINAN_ONEK) return Object.keys(kilinan).map((t) => `${onek}${t}`);
    return [];
  });
  cogunuOkuMock.mockImplementation(async (anahtarlar: string[]) =>
    anahtarlar.map((a) => {
      const kaynak = a.startsWith(KILINAN_ONEK) ? kilinan : gunler;
      const onek = a.startsWith(KILINAN_ONEK) ? KILINAN_ONEK : DEPOLAMA_ANAHTARLARI.NAMAZ_GUN_ONEK;
      return [a, JSON.stringify(kaynak[a.slice(onek.length)])];
    })
  );
  const sabitler: Record<string, unknown> = {
    [DEPOLAMA_ANAHTARLARI.SERI_DURUMU]: {
      mevcutSeri: 12,
      enUzunSeri: 45,
      sonTamGun: '2026-06-13',
      seriBaslangici: '2026-06-02',
      toparlanmaDurumu: { tamamlananGun: 1, baslangicTarihi: '2026-06-01', hedefGunSayisi: 2, oncekiSeri: 30 },
      dondurulduMu: false,
      dondurulmaTarihi: null,
      sonGuncelleme: '2026-06-14T05:12:00.000Z',
      bugunOncesi: null,
      bugunKazanilanPuan: 25,
    },
    [DEPOLAMA_ANAHTARLARI.ROZET_VERILERI]: ROZET_TANIMLARI.map((tanim, sira) => ({
      rozetId: tanim.id,
      kazanildiMi: sira === 0,
      kazanilmaTarihi: sira === 0 ? '2026-05-01T10:00:00.000Z' : null,
    })),
    [DEPOLAMA_ANAHTARLARI.SEVIYE_DURUMU]: {
      mevcutSeviye: 4,
      toplamPuan: 1830,
      mevcutSeviyePuani: 330,
      sonrakiSeviyeKalanPuan: 170,
      rank: 'Rank',
      rankIkonu: '⭐',
    },
    [DEPOLAMA_ANAHTARLARI.BONUS_PUAN]: 240,
    [DEPOLAMA_ANAHTARLARI.TOPLAM_KILILAN_NAMAZ]: 1250,
    [DEPOLAMA_ANAHTARLARI.MUKEMMEL_GUN_SAYISI]: 42,
    [DEPOLAMA_ANAHTARLARI.TOPARLANMA_SAYISI]: 3,
    [DEPOLAMA_ANAHTARLARI.KAZA_TEMPO_GECMIS]: { '2026-06-10': 3 },
  };
  okuMock.mockImplementation(async (anahtar: string) =>
    // Tanımlı olmayan her anahtar (= ayar anahtarları) kendine özgü dolu bir ayar nesnesi döner.
    anahtar in sabitler ? sabitler[anahtar] : { aktif: true, kaynakAnahtar: anahtar }
  );
};

describe('YedeklemeServisi — zarfiCoz içeriği daraltır (B-2 / B-3)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    gercekciDepolama();
  });

  it('NÖBETÇİ: uygulamanın ürettiği yedek çözülünce toplanan içerikle DERİN EŞİT (hiçbir alan kaybolmaz)', async () => {
    const toplanan = JSON.parse(JSON.stringify(await mevcutVeriyiTopla()));
    const cozulen = await zarfiCoz(await yedekZarfiOlustur());
    expect(cozulen).toEqual(toplanan);
    // Fikstür gerçekten dolu: boş içerik eşitliği hiçbir şey kanıtlamaz.
    expect(Object.keys(cozulen!.namazGunleri)).toHaveLength(2);
    expect(cozulen!.rozetler).toHaveLength(ROZET_TANIMLARI.length);
    expect(cozulen!.kazaHareketleri).toEqual([mockKazaHareketi, mockBilinmeyen]);
    expect(cozulen!.seri).toMatchObject({ mevcutSeri: 12, enUzunSeri: 45 });
  });

  it('NÖBETÇİ: yedeğe yazılan her ayar alanı daraltıcının beyaz listesindedir (liste ayrışırsa ayar sessizce kaybolur)', async () => {
    const toplanan = await mevcutVeriyiTopla();
    expect(Object.keys(toplanan.ayarlar).sort()).toEqual([...YEDEK_AYAR_ALANLARI].sort());
    const cozulen = await zarfiCoz(await yedekZarfiOlustur());
    for (const alan of YEDEK_AYAR_ALANLARI) expect(cozulen!.ayarlar[alan]).toEqual(toplanan.ayarlar[alan]);
  });

  it('kötü amaçlı zarf: null rozet, dize/dev bonus ve çöp tarih anahtarı atılmış/sıfırlanmış döner', async () => {
    const cozulen = await zarfiCoz(
      zarfla({
        namazGunleri: { '../x': { Sabah: true }, '2026-06-14': { Sabah: true, Teheccud: true }, __yabanci: {} },
        kilinanVakitler: { '../y': ['imsak'], '2026-06-14': ['imsak', 'cop'] },
        seri: 'bozuk',
        rozetler: [null, { rozetId: { x: 1 }, kazanildiMi: 'evet' }, { rozetId: 'ilk_adim', kazanildiMi: true, kazanilmaTarihi: null }],
        seviye: 7,
        bonusPuan: 'abc',
        istatistik: { toplamKilinan: 1e308, mukemmelGun: -1, toparlanma: null },
        kaza: 'yok',
        kazaTempo: { '../z': 5, '2026-06-10': 1e308 },
        kazaHareketleri: 'yok',
        ayarlar: { muhafiz: { aktif: true }, yabanci: { x: 1 } },
        yabanciAlan: [1, 2, 3],
      })
    );
    expect(cozulen).toEqual({
      namazGunleri: { '2026-06-14': { Sabah: true } },
      kilinanVakitler: { '2026-06-14': ['imsak'] },
      seri: null,
      rozetler: [{ rozetId: 'ilk_adim', kazanildiMi: true, kazanilmaTarihi: null }],
      seviye: null,
      bonusPuan: 0,
      istatistik: { toplamKilinan: 10_000_000, mukemmelGun: 0, toparlanma: 0 },
      kaza: null,
      kazaTempo: { '2026-06-10': 100_000 },
      ayarlar: { muhafiz: { aktif: true } },
    });
  });

  it('zarf geçerli ama içerik düz nesne değilse (dizi, sayı, null) null döner', async () => {
    expect(await zarfiCoz(zarfla([{ namazGunleri: {} }]))).toBeNull();
    expect(await zarfiCoz(zarfla(42))).toBeNull();
    expect(await zarfiCoz(zarfla(null))).toBeNull();
  });

  it('sınırı aşan dosya içeriği ayrıştırılmadan reddedilir (null; şifre çözme hiç çağrılmaz)', async () => {
    const dev = zarfla({ namazGunleri: {} }) + ' '.repeat(AZAMI_YEDEK_DOSYASI_BAYT);
    expect(await zarfiCoz(dev)).toBeNull();
    expect(cozMock).not.toHaveBeenCalled();
  });
});
