/**
 * Seri sayaci girdilerinin HAM DEPOLAMADAN hazirlanmasi.
 *
 * Bu yol arka plan gorevinde (Redux YOK) da kosar; nobetciler onu korur.
 */

const mockSeriAyarlari = jest.fn();
const mockNamazlar = jest.fn();

jest.mock('../../../data/local/LocalSeriServisi', () => ({
  localSeriAyarlariniGetir: () => mockSeriAyarlari(),
}));
jest.mock('../../../data/local/LocalNamazServisi', () => ({
  localNamazlariGetir: (tarih: string) => mockNamazlar(tarih),
}));

import { koordinattanImsakSaglayici, seriSayacAyarlariniHazirla } from '../SeriSayacHazirlayici';

const ISTANBUL = { lat: 41.0082, lng: 28.9784 };

const ayarlar = (uzer: Record<string, unknown> = {}) => ({
  basarili: true,
  veri: {
    gunSonuBildirimAktif: true,
    tamGunEsigi: 5,
    gunBitisSaati: '05:00',
    ...uzer,
  },
});

const namazlar = (kilinanSayisi: number) => ({
  basarili: true,
  veri: {
    tarih: '2026-01-15',
    namazlar: Array.from({ length: 5 }, (_, i) => ({
      namazAdi: `n${i}`,
      tamamlandi: i < kilinanSayisi,
      tarih: '2026-01-15',
    })),
  },
});

beforeEach(() => {
  jest.clearAllMocks();
  mockSeriAyarlari.mockResolvedValue(ayarlar());
  mockNamazlar.mockResolvedValue(namazlar(0));
});

describe('koordinattanImsakSaglayici', () => {
  test('gerçek koordinatta imsak döner', () => {
    const imsak = koordinattanImsakSaglayici(ISTANBUL)(new Date(2026, 0, 15, 12, 0));
    expect(imsak).toBeInstanceOf(Date);
  });

  /** `{lat:0,lng:0}` bu projede "yapılandırılmadı" nöbetçisidir (AGENTS.md). */
  test('sıfır koordinat null döner — Gine Körfezi imsağına göre hesap YAPILMAZ', () => {
    expect(koordinattanImsakSaglayici({ lat: 0, lng: 0 })(new Date())).toBeNull();
  });
});

describe('seriSayacAyarlariniHazirla', () => {
  test('gün eksikse sayaç AÇIK ve hedef dolu', async () => {
    const sonuc = await seriSayacAyarlariniHazirla(ISTANBUL, new Date(2026, 0, 15, 2, 0));

    expect(sonuc.aktif).toBe(true);
    expect(sonuc.seriBugunTamMi).toBe(false);
    expect(sonuc.hedef).toBeInstanceOf(Date);
  });

  test('gün ZATEN TAMSA sayaç çıkmaz (kalıcı bildirimle boşuna meşgul etme)', async () => {
    mockNamazlar.mockResolvedValue(namazlar(5));

    const sonuc = await seriSayacAyarlariniHazirla(ISTANBUL, new Date(2026, 0, 15, 2, 0));

    expect(sonuc.seriBugunTamMi).toBe(true);
  });

  test('eşik 3 iken 3 namaz TAM sayılır (motorun kuralıyla aynı)', async () => {
    mockSeriAyarlari.mockResolvedValue(ayarlar({ tamGunEsigi: 3 }));
    mockNamazlar.mockResolvedValue(namazlar(3));

    const sonuc = await seriSayacAyarlariniHazirla(ISTANBUL, new Date(2026, 0, 15, 2, 0));

    expect(sonuc.seriBugunTamMi).toBe(true);
  });

  test('kullanıcı gün sonu hatırlatmasını KAPATMIŞSA sayaç çıkmaz', async () => {
    mockSeriAyarlari.mockResolvedValue(ayarlar({ gunSonuBildirimAktif: false }));

    const sonuc = await seriSayacAyarlariniHazirla(ISTANBUL, new Date(2026, 0, 15, 2, 0));

    expect(sonuc.aktif).toBe(false);
  });

  test('konum yapılandırılmamışsa (0,0) sayaç çıkmaz', async () => {
    const sonuc = await seriSayacAyarlariniHazirla({ lat: 0, lng: 0 }, new Date());

    expect(sonuc.aktif).toBe(false);
    expect(sonuc.hedef).toBeNull();
  });

  /** Bozuk tek bir anahtar yüzünden kullanıcıya YANLIŞ geri sayım gösterme. */
  test('depolama patlarsa sayaç KAPALI döner (fırlatmaz)', async () => {
    mockSeriAyarlari.mockRejectedValue(new Error('disk patladı'));

    const sonuc = await seriSayacAyarlariniHazirla(ISTANBUL, new Date());

    expect(sonuc).toEqual({ aktif: false, hedef: null, seriBugunTamMi: true });
  });

  test('namaz okuması başarısızsa sayaç KAPALI döner', async () => {
    mockNamazlar.mockResolvedValue({ basarili: false, hata: 'bozuk' });

    const sonuc = await seriSayacAyarlariniHazirla(ISTANBUL, new Date(2026, 0, 15, 2, 0));

    expect(sonuc.aktif).toBe(false);
  });

  /**
   * Seri günü takvim günü DEĞİLDİR — ertesi imsakta biter. Gece 02:00'de hâlâ
   * DÜNÜN seri günü sürer; bugünün (henüz boş) kaydına bakılsaydı sayaç, günü
   * çoktan tamamlamış kullanıcıya da çıkardı.
   */
  test('gece yarısından sonra DÜNÜN seri gününün kaydı okunur', async () => {
    await seriSayacAyarlariniHazirla(ISTANBUL, new Date(2026, 0, 15, 2, 0));

    expect(mockNamazlar).toHaveBeenCalledWith('2026-01-14');
  });

  test('gündüz BUGÜNÜN kaydı okunur', async () => {
    await seriSayacAyarlariniHazirla(ISTANBUL, new Date(2026, 0, 15, 14, 0));

    expect(mockNamazlar).toHaveBeenCalledWith('2026-01-15');
  });
});
