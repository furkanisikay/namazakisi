/**
 * kazaSlice — DAVRANIŞSAL testler (Kaza Defteri 2.0).
 *
 * Thunk'lar gerçek defter yolunu (LocalKazaServisi → KazaDefteriServisi →
 * saf türetme) bellek-içi AsyncStorage ile kullanır; hem Redux state'i hem
 * diske yazılan hareketler doğrulanır. Tarihe bağlı alanlar SABİT yazılmaz.
 */

import { configureStore } from '@reduxjs/toolkit';
import kazaReducer, {
  kazaVerileriniYukle,
  borcEkle,
  kazaTamamla,
  yeniTabanUygula,
  gunlukHedefiGuncelle,
  gizlemeToggle,
  hataTemizle,
  otomatikAyarla,
  gunKarariVer,
  temizlikUygula,
  temizlikGeriAl,
  fazlayiSifirla,
  kazaOneriAyarlariniYukle,
  kazaOneriAyarlariniGuncelle,
} from '../kazaSlice';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';
import { gunEkle, tarihiISOFormatinaCevir } from '../../../core/utils/TarihYardimcisi';
import { _testIcinSifirla, localKazayaBorcEkle } from '../../../data/local/LocalKazaServisi';
import type { KazaDefterGorunumu } from '../../../core/kaza/kazaDefteriHesabi';
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

// `otomatikAyarla` gün sonu muhasebesini tembel `require` ile tazeler (bildirim köprüsü).
const mockMuhasebeTazele = jest.fn().mockResolvedValue(undefined);
jest.mock('../../../domain/services/YatisHatirlatmaServisi', () => ({
  YatisHatirlatmaServisi: { getInstance: () => ({ hatirlatmalariGuncelle: mockMuhasebeTazele }) },
}));

const ONEK = DEPOLAMA_ANAHTARLARI.KAZA_HAREKET_ONEK;
const bugun = () => tarihiISOFormatinaCevir(new Date());
const yeniStore = () => configureStore({ reducer: { kaza: kazaReducer } });

const kalan = (d: KazaDefterGorunumu, ad: string) => d.namazlar.find((n) => n.namazAdi === ad)!.kalanBorc;
const tamamlanan = (d: KazaDefterGorunumu, ad: string) => d.namazlar.find((n) => n.namazAdi === ad)!.tamamlanan;

/** Diskteki bütün (tanınan) hareketler. */
const diskHareketleri = (): KazaHareketi[] =>
  Array.from(mockStore.entries())
    .filter(([k]) => k.startsWith(ONEK))
    .flatMap(([, v]) => JSON.parse(v) as KazaHareketi[]);

const SIFIR = { sabah: 0, ogle: 0, ikindi: 0, aksam: 0, yatsi: 0, vitir: 0 };

beforeEach(() => {
  mockStore.clear();
  _testIcinSifirla();
  jest.clearAllMocks();
});

describe('hataTemizle', () => {
  it('hata alanını null yapar, diğer state korunur', () => {
    const baslangic = kazaReducer(undefined, { type: '@@INIT' });
    const sonuc = kazaReducer({ ...baslangic, hata: 'patladı', yukleniyor: true }, hataTemizle());
    expect(sonuc.hata).toBeNull();
    expect(sonuc.yukleniyor).toBe(true);
  });
});

describe('kazaVerileriniYukle', () => {
  it('pending → yukleniyor true & hata temizlenir', () => {
    const s = kazaReducer(
      { ...kazaReducer(undefined, { type: '@@INIT' }), hata: 'eski' },
      { type: kazaVerileriniYukle.pending.type }
    );
    expect(s.yukleniyor).toBe(true);
    expect(s.hata).toBeNull();
  });

  it('boş diskte fulfilled: boş görünüm, istatistik üretilir, otomatik ekleme KAPALI', async () => {
    const store = yeniStore();
    await store.dispatch(kazaVerileriniYukle());
    const st = store.getState().kaza;
    expect(st.yukleniyor).toBe(false);
    expect(st.kazaDurumu!.toplamKalan).toBe(0);
    expect(st.kazaDurumu!.otomatik.aktif).toBe(false);
    expect(st.istatistik!.tahminiTamamlanmaTarihi).toBeNull();
  });

  it('eski KAZA_DURUMU göç edilir ve göç öncesi tempo geçmişi okunur', async () => {
    mockStore.set(
      DEPOLAMA_ANAHTARLARI.KAZA_DURUMU,
      JSON.stringify({ namazlar: [{ namazAdi: 'Sabah', kalanBorc: 5, tamamlanan: 2, toplamBorc: 7 }], gunlukHedef: 3 })
    );
    mockStore.set(DEPOLAMA_ANAHTARLARI.KAZA_TEMPO_GECMIS, JSON.stringify({ '2026-01-01': 5 }));
    const store = yeniStore();
    await store.dispatch(kazaVerileriniYukle());
    const d = store.getState().kaza.kazaDurumu!;
    expect(kalan(d, 'Sabah')).toBe(5);
    expect(tamamlanan(d, 'Sabah')).toBe(2);
    expect(d.gunlukHedef).toBe(3);
    expect(store.getState().kaza.tempoGecmis['2026-01-01']).toBe(5);
  });

  it('bozuk eski kayıtta REDDETMEZ: fulfilled + "eski kayıt okunamadı" bayrağı (sonsuz yükleme yok)', async () => {
    mockStore.set(DEPOLAMA_ANAHTARLARI.KAZA_DURUMU, 'null');
    const store = yeniStore();
    const sonuc = await store.dispatch(kazaVerileriniYukle());
    expect(kazaVerileriniYukle.fulfilled.match(sonuc)).toBe(true);
    expect(store.getState().kaza.kazaDurumu).not.toBeNull();
    expect(store.getState().kaza.eskiKayitBozuk).toBe(true);
  });

  it('bozuk ay anahtarı bildirilir, sayfa yine açılır', async () => {
    mockStore.set(`${ONEK}2026-03`, '{bozuk');
    const store = yeniStore();
    await store.dispatch(kazaVerileriniYukle());
    expect(store.getState().kaza.bozukAylar).toEqual([`${ONEK}2026-03`]);
    expect(store.getState().kaza.kazaDurumu).not.toBeNull();
  });
});

describe('borcEkle / kazaTamamla', () => {
  it('borç ekler (kümülatif), her işlem diske BİR hareket olarak yazılır', async () => {
    const store = yeniStore();
    await store.dispatch(borcEkle({ namazAdi: 'Sabah', sayi: 3 }));
    await store.dispatch(borcEkle({ namazAdi: 'Sabah', sayi: 2, not: 'Yolculuk' }));
    expect(kalan(store.getState().kaza.kazaDurumu!, 'Sabah')).toBe(5);
    const h = diskHareketleri();
    expect(h).toHaveLength(2);
    expect(h.find((x) => x.adet === 2)).toMatchObject({ kaynak: 'manuel', vakit: 'sabah', not: 'Yolculuk' });
  });

  it('sıfır/negatif/kesirli sayı yazılmaz (rejected)', async () => {
    const store = yeniStore();
    for (const sayi of [0, -2, 1.5]) {
      const r = await store.dispatch(borcEkle({ namazAdi: 'Sabah', sayi }));
      expect(borcEkle.rejected.match(r)).toBe(true);
    }
    expect(diskHareketleri()).toEqual([]);
  });

  it('tamamlama: kalan düşer, tamamlanan ve BUGÜNÜN sayacı artar', async () => {
    const store = yeniStore();
    await store.dispatch(borcEkle({ namazAdi: 'Öğle', sayi: 4 }));
    await store.dispatch(kazaTamamla({ namazAdi: 'Öğle', sayi: 1 }));
    await store.dispatch(kazaTamamla({ namazAdi: 'Öğle', sayi: 2 }));
    const d = store.getState().kaza.kazaDurumu!;
    expect(kalan(d, 'Öğle')).toBe(1);
    expect(tamamlanan(d, 'Öğle')).toBe(3);
    expect(d.gunlukTamamlanan).toBe(3);
    expect(d.gunlukHedefTarihi).toBe(bugun());
  });

  it('REGRESYON: store dışından eklenen borç (bildirimden "Kazaya ekle") SİLİNMEZ', async () => {
    const store = yeniStore();
    await store.dispatch(borcEkle({ namazAdi: 'Öğle', sayi: 2 }));
    await localKazayaBorcEkle([{ gun: gunEkle(bugun(), -1), vakit: 'sabah' }]);
    await store.dispatch(kazaTamamla({ namazAdi: 'Öğle', sayi: 1 }));
    const d = store.getState().kaza.kazaDurumu!;
    expect(kalan(d, 'Öğle')).toBe(1);
    expect(kalan(d, 'Sabah')).toBe(1);
  });

  it('kalandan fazla kılınırsa kalan 0, fazlası AYRI gösterilir; sonra eklenen borç fazladan DÜŞÜLMEZ', async () => {
    const store = yeniStore();
    await store.dispatch(borcEkle({ namazAdi: 'Yatsı', sayi: 2 }));
    await store.dispatch(kazaTamamla({ namazAdi: 'Yatsı', sayi: 5 }));
    let d = store.getState().kaza.kazaDurumu!;
    expect(kalan(d, 'Yatsı')).toBe(0);
    expect(d.fazla['Yatsı']).toBe(3);
    await store.dispatch(borcEkle({ namazAdi: 'Yatsı', sayi: 4 }));
    d = store.getState().kaza.kazaDurumu!;
    expect(kalan(d, 'Yatsı')).toBe(4);
    expect(d.fazla['Yatsı']).toBe(3);
  });

  it('fazlayı sıfırla: fazla 0 olur, kalan DEĞİŞMEZ; işlem geçmişte −düzeltme olarak durur', async () => {
    const store = yeniStore();
    await store.dispatch(borcEkle({ namazAdi: 'Akşam', sayi: 1 }));
    await store.dispatch(kazaTamamla({ namazAdi: 'Akşam', sayi: 4 }));
    await store.dispatch(borcEkle({ namazAdi: 'Akşam', sayi: 2 }));
    await store.dispatch(fazlayiSifirla());
    const d = store.getState().kaza.kazaDurumu!;
    expect(d.toplamFazla).toBe(0);
    expect(kalan(d, 'Akşam')).toBe(2);
    expect(diskHareketleri().find((h) => h.kaynak === 'duzeltme')).toMatchObject({ vakit: 'aksam', adet: -3 });
  });
});

describe('yeniTabanUygula', () => {
  const taban = { ...SIFIR, sabah: 100, ogle: 100 };

  it('yeni taban yazılır; elle eklenen ve kılınan yeni tabana kendiliğinden uygulanır', async () => {
    const store = yeniStore();
    await store.dispatch(borcEkle({ namazAdi: 'Sabah', sayi: 5 }));
    await store.dispatch(kazaTamamla({ namazAdi: 'Sabah', sayi: 2 }));
    await store.dispatch(yeniTabanUygula({ taban, ortusme: 'ayrica' }));
    const d = store.getState().kaza.kazaDurumu!;
    expect(kalan(d, 'Sabah')).toBe(103);
    expect(kalan(d, 'Öğle')).toBe(100);
    expect(d.taban?.toplam).toBe(200);
  });

  it('önceki taban SİLİNMEZ (tarihçe); en son taban geçerli', async () => {
    const store = yeniStore();
    await store.dispatch(yeniTabanUygula({ taban, ortusme: 'ayrica' }));
    await store.dispatch(yeniTabanUygula({ taban: { ...SIFIR, sabah: 7 }, ortusme: 'ayrica' }));
    expect(diskHareketleri().filter((h) => h.kaynak === 'taban')).toHaveLength(2);
    expect(store.getState().kaza.kazaDurumu!.toplamKalan).toBe(7);
  });

  it('"gizle" seçimi örtüşen bildirim kayıtlarını TEK geri alınabilir temizlikle gizler', async () => {
    const store = yeniStore();
    await localKazayaBorcEkle([{ gun: gunEkle(bugun(), -3), vakit: 'ogle' }]);
    await store.dispatch(yeniTabanUygula({ taban, ortusme: 'gizle' }));
    expect(store.getState().kaza.kazaDurumu!.toplamKalan).toBe(200);
    const temizlik = diskHareketleri().filter((h) => h.kaynak === 'temizlik');
    expect(temizlik).toHaveLength(1);
    await store.dispatch(temizlikGeriAl({ temizlikId: temizlik[0].id }));
    expect(store.getState().kaza.kazaDurumu!.toplamKalan).toBe(201);
  });
});

describe('otomatikAyarla', () => {
  it('açar; defterde otoAyar hareketi olarak durur ve gün sonu muhasebesi tazelenir', async () => {
    const store = yeniStore();
    await store.dispatch(otomatikAyarla({ aktif: true, kayitsiz: 'sor' }));
    expect(store.getState().kaza.kazaDurumu!.otomatik.aktif).toBe(true);
    expect(diskHareketleri().find((h) => h.kaynak === 'otoAyar')).toMatchObject({ aktif: true, kayitsiz: 'sor' });
    expect(mockMuhasebeTazele).toHaveBeenCalled();
  });

  it('geçersiz, gelecekteki ya da bir yıldan eski başlangıç YAZILMAZ (rejected)', async () => {
    const store = yeniStore();
    for (const gun of ['15.10.2026', gunEkle(bugun(), 3), gunEkle(bugun(), -400)]) {
      const r = await store.dispatch(otomatikAyarla({ aktif: true, gun }));
      expect(otomatikAyarla.rejected.match(r)).toBe(true);
    }
    expect(diskHareketleri()).toEqual([]);
  });

  it('geçmiş tarama: başlangıç geriye alınınca işaretsiz günler sorulur ("bana sorun")', async () => {
    const store = yeniStore();
    await store.dispatch(otomatikAyarla({ aktif: true, gun: gunEkle(bugun(), -3), kayitsiz: 'sor' }));
    expect(store.getState().kaza.kazaDurumu!.bekleyenGunler.length).toBeGreaterThanOrEqual(2);
  });
});

describe('gunKarariVer', () => {
  afterEach(() => jest.restoreAllMocks());

  it('birden çok günü TEK işlemde karar verir; kimlikler aynı ms ve sabit rastgelede bile tekil', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const store = yeniStore();
    await store.dispatch(otomatikAyarla({ aktif: true, gun: gunEkle(bugun(), -4), kayitsiz: 'sor' }));
    const bekleyen = store.getState().kaza.kazaDurumu!.bekleyenGunler;
    expect(bekleyen.length).toBeGreaterThanOrEqual(3);
    await store.dispatch(gunKarariVer({ gunler: bekleyen, karar: 'ekle' }));
    const kararlar = diskHareketleri().filter((h) => h.kaynak === 'gunKarari');
    expect(new Set(kararlar.map((h) => h.id)).size).toBe(bekleyen.length);
    const d = store.getState().kaza.kazaDurumu!;
    expect(d.bekleyenGunler).toEqual([]);
    // 5 farz + vitir (varsayılan ortak mezhep Hanefî: vitir vaciptir).
    expect(d.ozet.otomatik).toBe(bekleyen.length * 6);
  });

  it('"yok say" kararı izdüşüme katmaz', async () => {
    const store = yeniStore();
    await store.dispatch(otomatikAyarla({ aktif: true, gun: gunEkle(bugun(), -2), kayitsiz: 'sor' }));
    const bekleyen = store.getState().kaza.kazaDurumu!.bekleyenGunler;
    await store.dispatch(gunKarariVer({ gunler: bekleyen, karar: 'yoksay' }));
    expect(store.getState().kaza.kazaDurumu!.toplamKalan).toBe(0);
    expect(store.getState().kaza.kazaDurumu!.bekleyenGunler).toEqual([]);
  });
});

describe('temizlikUygula / temizlikGeriAl', () => {
  it('seçili kayıtları gizler (silmez) ve geri alınabilir', async () => {
    const store = yeniStore();
    await store.dispatch(borcEkle({ namazAdi: 'İkindi', sayi: 6 }));
    const id = diskHareketleri()[0].id;
    const r = await store.dispatch(temizlikUygula({ hedefIdler: [id] }));
    expect(store.getState().kaza.kazaDurumu!.toplamKalan).toBe(0);
    expect(diskHareketleri().some((h) => h.id === id)).toBe(true);
    const temizlikId = (r.payload as { temizlikId: string }).temizlikId;
    await store.dispatch(temizlikGeriAl({ temizlikId }));
    expect(store.getState().kaza.kazaDurumu!.toplamKalan).toBe(6);
  });

  it('boş seçim yazılmaz', async () => {
    const r = await yeniStore().dispatch(temizlikUygula({ hedefIdler: [] }));
    expect(temizlikUygula.rejected.match(r)).toBe(true);
  });
});

describe('gunlukHedefiGuncelle / gizlemeToggle', () => {
  it('hedefi defter ayarına yazar; negatif 0\'a kenetlenir', async () => {
    const store = yeniStore();
    await store.dispatch(gunlukHedefiGuncelle({ hedef: 7 }));
    expect(store.getState().kaza.kazaDurumu!.gunlukHedef).toBe(7);
    await store.dispatch(gunlukHedefiGuncelle({ hedef: -3 }));
    expect(store.getState().kaza.kazaDurumu!.gunlukHedef).toBe(0);
    expect(JSON.parse(mockStore.get(DEPOLAMA_ANAHTARLARI.KAZA_AYARLARI)!).gunlukHedef).toBe(0);
  });

  it('toplamGizleMi iki kez toggle başa döner', async () => {
    const store = yeniStore();
    await store.dispatch(gizlemeToggle());
    expect(store.getState().kaza.kazaDurumu!.toplamGizleMi).toBe(true);
    await store.dispatch(gizlemeToggle());
    expect(store.getState().kaza.kazaDurumu!.toplamGizleMi).toBe(false);
  });
});

describe('entegrasyon: yaşam döngüsü kalıcılığı', () => {
  it('borç ekleyip kılınan ilerleme yeni bir store ile yeniden yüklendiğinde korunur', async () => {
    const s1 = yeniStore();
    await s1.dispatch(borcEkle({ namazAdi: 'Sabah', sayi: 5 }));
    await s1.dispatch(kazaTamamla({ namazAdi: 'Sabah', sayi: 1 }));
    const s2 = yeniStore();
    await s2.dispatch(kazaVerileriniYukle());
    const d = s2.getState().kaza.kazaDurumu!;
    expect(kalan(d, 'Sabah')).toBe(4);
    expect(tamamlanan(d, 'Sabah')).toBe(1);
  });
});

// ==================== kaza önerisi ayarı (issue #294) ====================

describe('kaza önerisi ayarı', () => {
  const AYAR_KEY = DEPOLAMA_ANAHTARLARI.KAZA_ONERI_AYARLARI;

  it('kayıt yoksa varsayılan AÇIK yüklenir ve "yüklendi" işaretlenir', async () => {
    const store = yeniStore();
    expect(store.getState().kaza.oneriAyarlariYuklendi).toBe(false);
    await store.dispatch(kazaOneriAyarlariniYukle());
    expect(store.getState().kaza.oneriAyarlari).toEqual({ farzSonrasiOner: true });
    expect(store.getState().kaza.oneriAyarlariYuklendi).toBe(true);
  });

  it('bozuk kayıtta REDDETMEZ, varsayılana düşer', async () => {
    mockStore.set(AYAR_KEY, '{bozuk');
    const store = yeniStore();
    const sonuc = await store.dispatch(kazaOneriAyarlariniYukle());
    expect(kazaOneriAyarlariniYukle.fulfilled.match(sonuc)).toBe(true);
    expect(store.getState().kaza.oneriAyarlari).toEqual({ farzSonrasiOner: true });
  });

  it('kapatma diske yazılır ve yeniden yüklemede korunur', async () => {
    await yeniStore().dispatch(kazaOneriAyarlariniGuncelle({ farzSonrasiOner: false }));
    expect(JSON.parse(mockStore.get(AYAR_KEY)!)).toEqual({ farzSonrasiOner: false });
    const store2 = yeniStore();
    await store2.dispatch(kazaOneriAyarlariniYukle());
    expect(store2.getState().kaza.oneriAyarlari).toEqual({ farzSonrasiOner: false });
  });
});
