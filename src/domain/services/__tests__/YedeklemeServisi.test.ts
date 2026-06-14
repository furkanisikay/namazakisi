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
import { yedekZarfiOlustur, zarfiCoz } from '../YedeklemeServisi';
import { YEDEK_BICIMI, YEDEK_SURUMU, YedekZarfi } from '../../../core/types';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';

// Depolama: tüm metotları kontrol edilebilir mock olarak ver.
jest.mock('../../../data/local/Depolama', () => ({
  Depolama: {
    oku: jest.fn(),
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
    expect(payload.kaza).toEqual({ borclar: {} });
    expect(payload.kazaTempo).toEqual({ '2026-06-14': 2 });
    expect(payload.ayarlar.muhafiz).toEqual({ aktif: true });
    expect(payload.ayarlar.konum).toEqual({ sehir: 'İstanbul' });
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
