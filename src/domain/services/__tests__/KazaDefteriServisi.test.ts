/**
 * KazaDefteriServisi — girdiyi DİSKTEN kurar (hareketler + namaz kaydı ∪ muhafız
 * kılınmışlığı + özel gün + ortak mezhep), tarama günlüğü ve önizlemeler.
 * Saat ve imsak ENJEKTE edilir (deterministik).
 */
import {
  defteriHesapla,
  gecmisTaramaOnizlemesi,
  ozelGunleriCoz,
  taramaYap,
  temizlikOnizlemesi,
  yeniTabanOnizlemesiHesapla,
} from '../KazaDefteriServisi';
import { _testIcinSifirla, hareketleriEkle } from '../../../data/local/LocalKazaServisi';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';
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

/** 15 Ekim 2026 öğleden sonra; imsak 05:30 (yerel). Süren namaz günü: 15 Ekim. */
const SIMDI = new Date(2026, 9, 15, 14, 0, 0);
const imsak = (t: Date) => new Date(t.getFullYear(), t.getMonth(), t.getDate(), 5, 30);
const S = { simdi: SIMDI, imsakSaglayici: imsak };

const otoAc = (gun: string, kayitsiz: 'sor' | 'ekle' = 'ekle'): KazaHareketi => ({
  id: `oto:${gun}`,
  zaman: '2026-10-10T06:00:00.000Z',
  cihaz: 'abc',
  kaynak: 'otoAyar',
  aktif: true,
  gun,
  kayitsiz,
});

const namazGunu = (tarih: string, kayit: Record<string, boolean>) =>
  mockStore.set(`${DEPOLAMA_ANAHTARLARI.NAMAZ_GUN_ONEK}${tarih}`, JSON.stringify(kayit));
const TUMU = { Sabah: true, 'Öğle': true, 'İkindi': true, 'Akşam': true, 'Yatsı': true };

beforeEach(() => {
  mockStore.clear();
  _testIcinSifirla();
  mockStore.set(DEPOLAMA_ANAHTARLARI.KAZA_DEFTERI_GOCU, '1');
  mockStore.set(DEPOLAMA_ANAHTARLARI.NAMAZ_GUN_MIGRASYON, '1');
});

describe('defteriHesapla — girdi diskten', () => {
  it('işaretli = namaz kaydı ∪ muhafız kılınmışlığı; işaretsiz farz otomatik +1', async () => {
    await hareketleriEkle([otoAc('2026-10-13')]);
    namazGunu('2026-10-13', { ...TUMU, 'Yatsı': false });
    mockStore.set(`${DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI}_kilinan_2026-10-13`, JSON.stringify(['yatsi']));
    namazGunu('2026-10-14', { ...TUMU, Sabah: false });
    mockStore.set(DEPOLAMA_ANAHTARLARI.MEZHEP_AYARI, JSON.stringify({ mezhep: 'safii' }));
    const { gorunum, girdi } = await defteriHesapla(S);
    expect(girdi.bugunNamazGunu).toBe('2026-10-15');
    expect(gorunum.otomatikKayitlar.map((o) => o.referans)).toEqual(['2026-10-14_sabah']);
  });

  it('ortak mezhep Hanefî iken yatsı işaretsizse vitir de eklenir', async () => {
    await hareketleriEkle([otoAc('2026-10-14')]);
    namazGunu('2026-10-14', { ...TUMU, 'Yatsı': false });
    const { gorunum } = await defteriHesapla(S);
    expect(gorunum.otomatikKayitlar.map((o) => o.vakit).sort()).toEqual(['vitir', 'yatsi']);
  });

  it('gece yarısından sonra imsağa kadar dünün namaz günü sürer (kapanmamıştır)', async () => {
    await hareketleriEkle([otoAc('2026-10-13')]);
    namazGunu('2026-10-13', TUMU);
    const gece = { simdi: new Date(2026, 9, 15, 2, 0), imsakSaglayici: imsak };
    const { gorunum, girdi } = await defteriHesapla(gece);
    expect(girdi.bugunNamazGunu).toBe('2026-10-14');
    expect(gorunum.otomatikKayitlar).toEqual([]);
  });

  it('özel gün kaydı (GEÇMİŞ dahil) izdüşümden düşer', async () => {
    await hareketleriEkle([otoAc('2026-10-13')]);
    mockStore.set(
      DEPOLAMA_ANAHTARLARI.OZEL_GUN_AYARLARI,
      JSON.stringify({
        ozelGunModuAktif: false,
        aktifOzelGun: null,
        gecmisKayitlar: [{ baslangicTarihi: '2026-10-13T00:00:00.000Z', bitisTarihi: '2026-10-14T00:00:00.000Z' }],
      })
    );
    expect((await defteriHesapla(S)).gorunum.ozet.otomatik).toBe(0);
  });

  it('ozelGunleriCoz bozuk kayıtta boş küme', () => {
    expect(ozelGunleriCoz('x').size).toBe(0);
    expect(ozelGunleriCoz({ gecmisKayitlar: [{ baslangicTarihi: 1 }] }).size).toBe(0);
  });
});

describe('taramaYap — tarama günlüğü', () => {
  it('giren referansları tek bir `tarama` hareketine yazar; ikinci tur yeni hareket yazmaz', async () => {
    await hareketleriEkle([otoAc('2026-10-14')]);
    namazGunu('2026-10-14', { ...TUMU, 'Öğle': false });
    mockStore.set(DEPOLAMA_ANAHTARLARI.MEZHEP_AYARI, JSON.stringify({ mezhep: 'safii' }));
    await taramaYap(S);
    await taramaYap(S);
    const { girdi, sonTarama } = await defteriHesapla(S);
    const taramalar = girdi.hareketler.filter((h) => h.kaynak === 'tarama');
    expect(taramalar).toHaveLength(1);
    expect(taramalar[0].eklenen).toEqual(['2026-10-14_ogle']);
    expect(sonTarama).toBe(SIMDI.toISOString());
  });

  it('sonradan "kıldım" denince çıkan referansı günlüğe yazar (sayı zaten kayıttan türer)', async () => {
    await hareketleriEkle([otoAc('2026-10-14')]);
    mockStore.set(DEPOLAMA_ANAHTARLARI.MEZHEP_AYARI, JSON.stringify({ mezhep: 'safii' }));
    namazGunu('2026-10-14', { ...TUMU, 'Öğle': false });
    await taramaYap(S);
    namazGunu('2026-10-14', TUMU);
    await taramaYap(S);
    const { girdi, gorunum } = await defteriHesapla(S);
    expect(gorunum.toplamKalan).toBe(0);
    expect(girdi.hareketler.filter((h) => h.kaynak === 'tarama').map((h) => h.cikan)).toEqual([[], ['2026-10-14_ogle']]);
  });
});

describe('önizlemeler (HİÇBİR ŞEY YAZMAZ)', () => {
  it('yeniTabanOnizlemesiHesapla: eski/yeni kalan, kapsam bitişi = süren namaz günü', async () => {
    await hareketleriEkle([
      { id: 'm1', zaman: '2026-10-01T00:00:00.000Z', cihaz: 'a', kaynak: 'manuel', vakit: 'sabah', adet: 30 },
      { id: 'k1', zaman: '2026-10-02T00:00:00.000Z', cihaz: 'a', kaynak: 'kilindi', vakit: 'sabah', adet: 10 },
    ]);
    const hareketAnahtarlari = () =>
      Array.from(mockStore.entries()).filter(([k]) => k.startsWith(DEPOLAMA_ANAHTARLARI.KAZA_HAREKET_ONEK));
    const once = JSON.stringify(hareketAnahtarlari());
    const o = await yeniTabanOnizlemesiHesapla({ sabah: 100, ogle: 0, ikindi: 0, aksam: 0, yatsi: 0, vitir: 0 }, S);
    expect(o).toMatchObject({ kapsamBitis: '2026-10-15', eskiKalan: 20, ayricaKalan: 120, yeniTaban: 100, eskiTaban: null });
    expect(o.ozet).toMatchObject({ elle: 30, kilinan: 10 });
    expect(JSON.stringify(hareketAnahtarlari())).toBe(once);
  });

  it('gecmisTaramaOnizlemesi: başlangıç geriye alınınca eklenecek sayı', async () => {
    namazGunu('2026-10-13', { ...TUMU, Sabah: false });
    namazGunu('2026-10-14', TUMU);
    mockStore.set(DEPOLAMA_ANAHTARLARI.MEZHEP_AYARI, JSON.stringify({ mezhep: 'safii' }));
    const o = await gecmisTaramaOnizlemesi('2026-10-13', S);
    expect(o).toMatchObject({ eklenecek: 1, bekleyenGun: 0, eskiKalan: 0, yeniKalan: 1 });
    await expect(gecmisTaramaOnizlemesi('2024-01-01', S)).rejects.toThrow();
  });

  it('temizlikOnizlemesi kalanı defterin kendi türetmesiyle ölçer', async () => {
    await hareketleriEkle([{ id: 'm1', zaman: '2026-10-01T00:00:00.000Z', cihaz: 'a', kaynak: 'manuel', vakit: 'ogle', adet: 4 }]);
    expect(await temizlikOnizlemesi(['m1'], S)).toEqual({ eskiKalan: 4, yeniKalan: 0 });
    expect(await temizlikOnizlemesi([], S)).toEqual({ eskiKalan: 4, yeniKalan: 4 });
  });
});
