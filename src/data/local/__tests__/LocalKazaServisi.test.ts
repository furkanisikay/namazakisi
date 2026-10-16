/**
 * LocalKazaServisi — Kaza Defteri 2.0 depolama katmanı.
 *
 * DAYANIKLILIK (AGENTS.md kaza dersi): okuma ASLA reddetmez; bozuk ay anahtarı
 * atlanır ve ÜZERİNE YAZILMAZ, yeni hareket kardeş anahtara gider; okunamayan
 * eski KAZA_DURUMU göç bayrağı yazılmadan korunur. İLERİ UYUMLULUK: bu sürümün
 * çözemediği (yeni sürüm) öğe diskte korunur.
 */

import {
  _testIcinSifirla,
  defteriOku,
  hareketleriEkle,
  localKazayaBorcEkle,
} from '../LocalKazaServisi';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';
import { defterHesapla } from '../../../core/kaza/kazaDefteriHesabi';
import type { KazaHareketi } from '../../../core/kaza/kazaHareketi';

const mockStore = new Map<string, string>();
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: async (k: string) => (mockStore.has(k) ? mockStore.get(k)! : null),
    setItem: async (k: string, v: string) => {
      mockStore.set(k, v);
    },
    removeItem: async (k: string) => {
      mockStore.delete(k);
    },
    getAllKeys: async () => Array.from(mockStore.keys()),
    multiGet: async (ks: readonly string[]) => ks.map((k) => [k, mockStore.has(k) ? mockStore.get(k)! : null]),
  },
}));

jest.mock('../../../core/utils/Logger', () => ({
  Logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

const ONEK = DEPOLAMA_ANAHTARLARI.KAZA_HAREKET_ONEK;
const ESKI = DEPOLAMA_ANAHTARLARI.KAZA_DURUMU;
const BAYRAK = DEPOLAMA_ANAHTARLARI.KAZA_DEFTERI_GOCU;

const eskiDurum = (kalan: Record<string, number>, tamam: Record<string, number> = {}) =>
  JSON.stringify({
    namazlar: ['Sabah', 'Öğle', 'İkindi', 'Akşam', 'Yatsı', 'Vitir'].map((namazAdi) => ({
      namazAdi,
      kalanBorc: kalan[namazAdi] ?? 0,
      tamamlanan: tamam[namazAdi] ?? 0,
      toplamBorc: (kalan[namazAdi] ?? 0) + (tamam[namazAdi] ?? 0),
    })),
    toplamKalan: 0,
    toplamTamamlanan: 0,
    gunlukHedef: 4,
    gunlukTamamlanan: 0,
    gunlukHedefTarihi: '2026-01-01',
    toplamGizleMi: true,
    guncellemeTarihi: '2026-01-01',
  });

const gorunum = (hareketler: KazaHareketi[]) =>
  defterHesapla({
    hareketler,
    bugunNamazGunu: '2026-10-15',
    bugunTakvim: '2026-10-15',
    isaretliler: {},
    ozelGunler: new Set(),
    vitirDahil: false,
    gunlukHedef: 0,
    toplamGizleMi: false,
  });

const manuel = (id: string, zaman: string, adet = 1): KazaHareketi => ({
  id,
  zaman,
  cihaz: 'abc',
  kaynak: 'manuel',
  vakit: 'ogle',
  adet,
});

beforeEach(() => {
  mockStore.clear();
  _testIcinSifirla();
});

describe('defteriOku — göç ve dayanıklılık', () => {
  test('boş diskte boş defter döner ve göç bayrağı yazılır', async () => {
    const o = await defteriOku();
    expect(o).toEqual({ hareketler: [], bilinmeyenler: [], bozukAylar: [], eskiKayitBozuk: false });
    expect(mockStore.get(BAYRAK)).toBe('1');
  });

  test('eski KAZA_DURUMU göç edilir: her vakitte kalan BİREBİR aynı kalır, eski kayıt SİLİNMEZ', async () => {
    mockStore.set(ESKI, eskiDurum({ Sabah: 3, 'Öğle': 7 }, { Sabah: 2 }));
    const o = await defteriOku();
    const g = gorunum(o.hareketler);
    expect(g.namazlar.find((n) => n.namazAdi === 'Sabah')).toMatchObject({ kalanBorc: 3, tamamlanan: 2 });
    expect(g.namazlar.find((n) => n.namazAdi === 'Öğle')).toMatchObject({ kalanBorc: 7, tamamlanan: 0 });
    expect(g.toplamFazla).toBe(0);
    expect(mockStore.has(ESKI)).toBe(true);
    // Eski ayarlar (günlük hedef, gizle) defter ayarlarına taşınır.
    expect(JSON.parse(mockStore.get(DEPOLAMA_ANAHTARLARI.KAZA_AYARLARI)!)).toEqual({ gunlukHedef: 4, toplamGizleMi: true });
  });

  test('göç İDEMPOTENT: bayrak silinip yeniden çalışsa da hareketler çoğalmaz', async () => {
    mockStore.set(ESKI, eskiDurum({ Sabah: 3 }, { Sabah: 1 }));
    const ilk = await defteriOku();
    mockStore.delete(BAYRAK);
    _testIcinSifirla();
    const ikinci = await defteriOku();
    expect(ikinci.hareketler.map((h) => h.id)).toEqual(ilk.hareketler.map((h) => h.id));
    expect(gorunum(ikinci.hareketler).toplamKalan).toBe(3);
  });

  test('eşzamanlı açılışlar tek göçü paylaşır', async () => {
    mockStore.set(ESKI, eskiDurum({ Sabah: 3 }));
    const [a, b] = await Promise.all([defteriOku(), defteriOku()]);
    expect(a.hareketler).toHaveLength(1);
    expect(b.hareketler).toHaveLength(1);
  });

  test.each([['null'], ['{kesik'], ['42'], ['"metin"']])(
    'okunamayan eski kayıt (%s): REDDETMEZ, bayrak yazılmaz, ham kayıt korunur',
    async (ham) => {
      mockStore.set(ESKI, ham);
      const o = await defteriOku();
      expect(o.eskiKayitBozuk).toBe(true);
      expect(o.hareketler).toEqual([]);
      expect(mockStore.has(BAYRAK)).toBe(false);
      expect(mockStore.get(ESKI)).toBe(ham);
    }
  );

  test('bozuk ay anahtarı atlanır, ÜZERİNE YAZILMAZ; yeni hareket kardeş anahtara gider', async () => {
    mockStore.set(BAYRAK, '1');
    mockStore.set(`${ONEK}2026-10`, '{bozuk');
    const once = await defteriOku();
    expect(once.bozukAylar).toEqual([`${ONEK}2026-10`]);

    await hareketleriEkle([manuel('manuel:1', '2026-10-14T08:00:00.000Z', 2)]);
    expect(mockStore.get(`${ONEK}2026-10`)).toBe('{bozuk');
    expect(JSON.parse(mockStore.get(`${ONEK}2026-10_k1`)!)).toHaveLength(1);

    const sonra = await defteriOku();
    expect(sonra.hareketler.map((h) => h.id)).toEqual(['manuel:1']);
    expect(sonra.bozukAylar).toEqual([`${ONEK}2026-10`]);
  });

  test('dizi-dışı ay değeri (nesne) de bozuk sayılır', async () => {
    mockStore.set(BAYRAK, '1');
    mockStore.set(`${ONEK}2026-09`, JSON.stringify({ a: 1 }));
    expect((await defteriOku()).bozukAylar).toEqual([`${ONEK}2026-09`]);
  });
});

describe('hareketleriEkle — tek kapı', () => {
  beforeEach(() => mockStore.set(BAYRAK, '1'));

  test('hareket ayına (UTC) yazılır; aynı kimlik ikinci kez YAZILMAZ', async () => {
    const h = manuel('manuel:1', '2026-10-14T08:00:00.000Z');
    expect(await hareketleriEkle([h])).toBe(1);
    expect(await hareketleriEkle([h])).toBe(0);
    expect(JSON.parse(mockStore.get(`${ONEK}2026-10`)!)).toHaveLength(1);
  });

  test('yapısız değer atlanır, geçerli olan yazılır', async () => {
    const sayi = await hareketleriEkle([42, null, { id: 'x' }, manuel('manuel:2', '2026-09-01T00:00:00.000Z')]);
    expect(sayi).toBe(1);
    expect(mockStore.has(`${ONEK}2026-09`)).toBe(true);
  });

  test('İLERİ UYUMLULUK: çözülemeyen (yeni sürüm) öğe yazımdan sonra diskte KORUNUR', async () => {
    const gelecek = { id: 'gelecek:1', zaman: '2026-10-01T00:00:00.000Z', kaynak: 'yeniTur', alan: { x: 1 } };
    mockStore.set(`${ONEK}2026-10`, JSON.stringify([gelecek]));

    await hareketleriEkle([manuel('manuel:1', '2026-10-14T08:00:00.000Z')]);

    const disk = JSON.parse(mockStore.get(`${ONEK}2026-10`)!);
    expect(disk).toEqual(expect.arrayContaining([gelecek]));
    expect(disk).toHaveLength(2);
    const o = await defteriOku();
    expect(o.hareketler.map((h) => h.id)).toEqual(['manuel:1']);
    expect(o.bilinmeyenler).toEqual([gelecek]);
  });

  test('yedekten/buluttan gelen çözülemeyen öğe de diske yazılır (tekil)', async () => {
    const gelecek = { id: 'gelecek:2', zaman: '2026-08-01T00:00:00.000Z', kaynak: 'yeniTur' };
    expect(await hareketleriEkle([gelecek])).toBe(1);
    expect(await hareketleriEkle([gelecek])).toBe(0);
    expect(JSON.parse(mockStore.get(`${ONEK}2026-08`)!)).toEqual([gelecek]);
  });
});

describe('localKazayaBorcEkle — bildirimden "Kazaya ekle" (issue #290)', () => {
  test('referanslı `bildirim` hareketi yazar; geçersiz gün atlanır', async () => {
    const y = await localKazayaBorcEkle([
      { gun: '2026-10-12', vakit: 'ogle' },
      { gun: '12.10.2026', vakit: 'aksam' },
    ]);
    expect(y).toEqual({ basarili: true, veri: 1 });
    const o = await defteriOku();
    expect(o.hareketler).toHaveLength(1);
    expect(o.hareketler[0]).toMatchObject({ kaynak: 'bildirim', vakit: 'ogle', referans: '2026-10-12_ogle' });
  });

  test('aynı gün+vakit iki kez eklense de (iki cihaz) tek borç sayılır', async () => {
    await localKazayaBorcEkle([{ gun: '2026-10-12', vakit: 'ogle' }]);
    await localKazayaBorcEkle([{ gun: '2026-10-12', vakit: 'ogle' }]);
    const o = await defteriOku();
    expect(o.hareketler).toHaveLength(2);
    expect(gorunum(o.hareketler).toplamKalan).toBe(1);
  });

  test('bozuk eski kaydın ÜSTÜNE YAZMAZ: hareket ayrı anahtara gider, ham kayıt korunur', async () => {
    mockStore.set(ESKI, '{kesik');
    const y = await localKazayaBorcEkle([{ gun: '2026-10-12', vakit: 'yatsi' }]);
    expect(y.basarili).toBe(true);
    expect(mockStore.get(ESKI)).toBe('{kesik');
  });
});
