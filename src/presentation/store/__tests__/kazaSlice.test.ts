/**
 * kazaSlice — DAVRANIŞSAL testler
 *
 * Thunk'lar gerçek LocalKazaServisi + KazaHesaplayiciServisi'ni (AsyncStorage
 * in-memory mock'lu) kullanır; gerçek store üzerinde dispatch edilip hem Redux
 * state'i hem diske yazılan blob doğrulanır. Tarihe bağlı alanlar SABİT yazılmaz
 * (tarihiISOFormatinaCevir ile bugünden türetilir).
 */

import { configureStore } from '@reduxjs/toolkit';
import kazaReducer, {
  kazaVerileriniYukle,
  borcEkle,
  kazaTamamla,
  sihirbazIleBaslat,
  gunlukHedefiGuncelle,
  gizlemeToggle,
  hataTemizle,
} from '../kazaSlice';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';
import { tarihiISOFormatinaCevir } from '../../../core/utils/TarihYardimcisi';
import type { KazaDurumu } from '../../../core/types/KazaTipleri';

// In-memory AsyncStorage mock (mock* öneki: jest.mock fabrikası closure'a erişebilsin)
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
  },
}));

// Logger sustur
jest.mock('../../../core/utils/Logger', () => ({
  Logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

const DURUM_KEY = DEPOLAMA_ANAHTARLARI.KAZA_DURUMU;
const TEMPO_KEY = DEPOLAMA_ANAHTARLARI.KAZA_TEMPO_GECMIS;

const bugun = () => tarihiISOFormatinaCevir(new Date());

/** Diskten KazaDurumu blob'unu okur (yoksa null). */
const diskDurumOku = (): KazaDurumu | null => {
  const v = mockStore.get(DURUM_KEY);
  return v ? (JSON.parse(v) as KazaDurumu) : null;
};

const yeniStore = () => configureStore({ reducer: { kaza: kazaReducer } });

const kalan = (d: KazaDurumu, ad: string) =>
  d.namazlar.find((n) => n.namazAdi === ad)!.kalanBorc;
const tamamlanan = (d: KazaDurumu, ad: string) =>
  d.namazlar.find((n) => n.namazAdi === ad)!.tamamlanan;

beforeEach(() => {
  mockStore.clear();
});

// ==================== hataTemizle reducer ====================

describe('hataTemizle', () => {
  it('hata alanını null yapar, diğer state korunur', () => {
    const baslangic = kazaReducer(undefined, { type: '@@INIT' });
    const hataliState = { ...baslangic, hata: 'bir şey patladı', yukleniyor: true };
    const sonuc = kazaReducer(hataliState, hataTemizle());
    expect(sonuc.hata).toBeNull();
    expect(sonuc.yukleniyor).toBe(true); // dokunulmadı
  });
});

// ==================== kazaVerileriniYukle ====================

describe('kazaVerileriniYukle', () => {
  it('pending → yukleniyor true & hata temizlenir', () => {
    const s = kazaReducer(
      { kazaDurumu: null, istatistik: null, tempoGecmis: {}, yukleniyor: false, hata: 'eski' },
      { type: kazaVerileriniYukle.pending.type }
    );
    expect(s.yukleniyor).toBe(true);
    expect(s.hata).toBeNull();
  });

  it('boş diskte fulfilled: boş durum yüklenir, istatistik üretilir', async () => {
    const store = yeniStore();
    await store.dispatch(kazaVerileriniYukle());
    const st = store.getState().kaza;
    expect(st.yukleniyor).toBe(false);
    expect(st.kazaDurumu).not.toBeNull();
    expect(st.kazaDurumu!.namazlar.length).toBeGreaterThan(0);
    expect(st.istatistik).not.toBeNull();
    // toplamKalan 0 iken tahmin yok, motivasyon önerisi boş
    expect(st.istatistik!.tahminiTamamlanmaTarihi).toBeNull();
    expect(st.istatistik!.motivasyonOnerileri).toEqual([]);
  });

  it('diskteki tempo geçmişi state.tempoGecmis olarak yüklenir', async () => {
    const tempo = { '2026-01-01': 5, '2026-01-02': 3 };
    mockStore.set(TEMPO_KEY, JSON.stringify(tempo));
    const store = yeniStore();
    await store.dispatch(kazaVerileriniYukle());
    expect(store.getState().kaza.tempoGecmis).toEqual(tempo);
  });

  it('gunlukHedefTarihi dünden ise günlük sayaç sıfırlanır', async () => {
    const durum: KazaDurumu = {
      namazlar: [{ namazAdi: 'Sabah', toplamBorc: 5, kalanBorc: 5, tamamlanan: 0 }],
      toplamKalan: 5,
      toplamTamamlanan: 0,
      gunlukHedef: 3,
      gunlukTamamlanan: 7, // dünkü ilerleme
      gunlukHedefTarihi: '2000-01-01', // geçmiş tarih → sıfırlanmalı
      toplamGizleMi: false,
      guncellemeTarihi: '2000-01-01',
    };
    mockStore.set(DURUM_KEY, JSON.stringify(durum));
    const store = yeniStore();
    await store.dispatch(kazaVerileriniYukle());
    const st = store.getState().kaza.kazaDurumu!;
    expect(st.gunlukTamamlanan).toBe(0);
    expect(st.gunlukHedefTarihi).toBe(bugun());
  });

  it('gunlukHedefTarihi bugün ise günlük sayaç KORUNUR', async () => {
    const durum: KazaDurumu = {
      namazlar: [{ namazAdi: 'Sabah', toplamBorc: 5, kalanBorc: 5, tamamlanan: 0 }],
      toplamKalan: 5,
      toplamTamamlanan: 0,
      gunlukHedef: 3,
      gunlukTamamlanan: 4,
      gunlukHedefTarihi: bugun(),
      toplamGizleMi: false,
      guncellemeTarihi: bugun(),
    };
    mockStore.set(DURUM_KEY, JSON.stringify(durum));
    const store = yeniStore();
    await store.dispatch(kazaVerileriniYukle());
    expect(store.getState().kaza.kazaDurumu!.gunlukTamamlanan).toBe(4);
  });

  it('rejected: kaza servisi başarısız olursa hata state\'e yazılır', async () => {
    // localKazaDurumunuGetir bozuk veride bile başarılı döner; reddi tetiklemek için
    // servisi doğrudan mock'layıp {basarili:false} döndürmek gerekir. Burada thunk'ın
    // rejected reducer'ını izole test ediyoruz (gerçek reddedilmiş action ile).
    const s = kazaReducer(
      { kazaDurumu: null, istatistik: null, tempoGecmis: {}, yukleniyor: true, hata: null },
      {
        type: kazaVerileriniYukle.rejected.type,
        error: { message: 'Kaza verileri yüklenemedi' },
      }
    );
    expect(s.yukleniyor).toBe(false);
    expect(s.hata).toBe('Kaza verileri yüklenemedi');
  });

  it('rejected: error.message yoksa varsayılan mesaj kullanılır', () => {
    const s = kazaReducer(
      { kazaDurumu: null, istatistik: null, tempoGecmis: {}, yukleniyor: true, hata: null },
      { type: kazaVerileriniYukle.rejected.type, error: {} }
    );
    expect(s.hata).toBe('Kaza verileri yüklenemedi');
  });
});

// ==================== borcEkle ====================

describe('borcEkle', () => {
  it('boş state\'ten Sabah\'a borç ekler, toplamlar güncellenir, diske yazılır', async () => {
    const store = yeniStore();
    await store.dispatch(borcEkle({ namazAdi: 'Sabah', sayi: 10 }));
    const st = store.getState().kaza.kazaDurumu!;
    expect(kalan(st, 'Sabah')).toBe(10);
    expect(st.namazlar.find((n) => n.namazAdi === 'Sabah')!.toplamBorc).toBe(10);
    expect(st.toplamKalan).toBe(10);
    // diğer namazlar etkilenmedi
    expect(kalan(st, 'Öğle')).toBe(0);
    // diske yazıldı
    expect(kalan(diskDurumOku()!, 'Sabah')).toBe(10);
  });

  it('mevcut borca ekler (kümülatif), istatistik tahmini üretir', async () => {
    const store = yeniStore();
    await store.dispatch(borcEkle({ namazAdi: 'Öğle', sayi: 5 }));
    await store.dispatch(borcEkle({ namazAdi: 'Öğle', sayi: 3 }));
    const st = store.getState().kaza;
    expect(kalan(st.kazaDurumu!, 'Öğle')).toBe(8);
    expect(st.kazaDurumu!.toplamKalan).toBe(8);
    // toplamKalan > 0 → motivasyon önerileri var
    expect(st.istatistik!.motivasyonOnerileri.length).toBeGreaterThan(0);
  });

  it('guncellemeTarihi ISO damgası yazılır', async () => {
    const store = yeniStore();
    await store.dispatch(borcEkle({ namazAdi: 'Vitir', sayi: 1 }));
    const ts = store.getState().kaza.kazaDurumu!.guncellemeTarihi;
    expect(Number.isNaN(Date.parse(ts))).toBe(false);
  });
});

// ==================== kazaTamamla ====================

describe('kazaTamamla', () => {
  const borcluStoreHazirla = async () => {
    const store = yeniStore();
    await store.dispatch(borcEkle({ namazAdi: 'Sabah', sayi: 10 }));
    await store.dispatch(borcEkle({ namazAdi: 'Öğle', sayi: 4 }));
    return store;
  };

  it('belirli namazdan tamamlama: kalan düşer, tamamlanan artar, günlük sayaç artar', async () => {
    const store = await borcluStoreHazirla();
    await store.dispatch(kazaTamamla({ namazAdi: 'Sabah', sayi: 3 }));
    const st = store.getState().kaza;
    const d = st.kazaDurumu!;
    expect(kalan(d, 'Sabah')).toBe(7);
    expect(tamamlanan(d, 'Sabah')).toBe(3);
    expect(d.gunlukTamamlanan).toBe(3);
    // Öğle dokunulmadı
    expect(kalan(d, 'Öğle')).toBe(4);
    // tempo geçmişine bugünün toplamı yazıldı
    expect(st.tempoGecmis[bugun()]).toBe(3);
  });

  it('kalandan fazla istense bile 0\'ın altına inmez (clamp); fazlalık tamamlanana sayılmaz', async () => {
    const store = await borcluStoreHazirla();
    await store.dispatch(kazaTamamla({ namazAdi: 'Öğle', sayi: 100 }));
    const d = store.getState().kaza.kazaDurumu!;
    expect(kalan(d, 'Öğle')).toBe(0);
    expect(tamamlanan(d, 'Öğle')).toBe(4); // 100 değil, gerçek kalan kadar
    // günlük tamamlanan gerçekleşen miktar (4) olmalı, 100 değil
    expect(d.gunlukTamamlanan).toBe(4);
  });

  it('genel tamamlama (namazAdi=null): en yüksek kalandan düşer, orijinal sıra korunur', async () => {
    const store = await borcluStoreHazirla(); // Sabah=10, Öğle=4
    await store.dispatch(kazaTamamla({ namazAdi: null, sayi: 3 }));
    const d = store.getState().kaza.kazaDurumu!;
    // en yüksek kalan Sabah(10) → 3 ondan düşer
    expect(kalan(d, 'Sabah')).toBe(7);
    expect(kalan(d, 'Öğle')).toBe(4);
    // sıra korundu: ilk eleman hala Sabah
    expect(d.namazlar[0].namazAdi).toBe('Sabah');
    expect(d.gunlukTamamlanan).toBe(3);
  });

  it('genel tamamlama bir vakti aşınca sonraki en yüksek vakte taşar', async () => {
    const store = await borcluStoreHazirla(); // Sabah=10, Öğle=4
    // 13 düş: Sabah(10) biter, kalan 3 Öğle'den düşer
    await store.dispatch(kazaTamamla({ namazAdi: null, sayi: 13 }));
    const d = store.getState().kaza.kazaDurumu!;
    expect(kalan(d, 'Sabah')).toBe(0);
    expect(kalan(d, 'Öğle')).toBe(1);
    expect(d.toplamKalan).toBe(1);
    expect(d.gunlukTamamlanan).toBe(13);
  });

  it('borç yokken genel tamamlama günlük sayacı bozmaz (gerçek tamamlanan 0)', async () => {
    const store = yeniStore();
    await store.dispatch(kazaTamamla({ namazAdi: null, sayi: 5 }));
    const d = store.getState().kaza.kazaDurumu!;
    expect(d.toplamKalan).toBe(0);
    expect(d.gunlukTamamlanan).toBe(0);
  });

  it('art arda tamamlamalar günlük sayacı kümülatif biriktirir', async () => {
    const store = await borcluStoreHazirla();
    await store.dispatch(kazaTamamla({ namazAdi: 'Sabah', sayi: 2 }));
    await store.dispatch(kazaTamamla({ namazAdi: 'Sabah', sayi: 3 }));
    const d = store.getState().kaza.kazaDurumu!;
    expect(d.gunlukTamamlanan).toBe(5);
    expect(store.getState().kaza.tempoGecmis[bugun()]).toBe(5);
  });
});

// ==================== sihirbazIleBaslat ====================

describe('sihirbazIleBaslat', () => {
  it('toplam borcu 6 vakte dağıtır, toplamKalan dağıtılan toplamına eşittir', async () => {
    const store = yeniStore();
    // Bugün doğmuş biri için (ergenlik gelecekte) borç 0 olur; geçmiş doğum tarihi ver
    await store.dispatch(
      sihirbazIleBaslat({ dogumTarihi: '1990-01-01', ergenlikYasi: 14, kildigiTahminiYuzdesi: 0 })
    );
    const d = store.getState().kaza.kazaDurumu!;
    const dagilimToplami = d.namazlar.reduce((s, n) => s + n.kalanBorc, 0);
    expect(d.toplamKalan).toBe(dagilimToplami);
    expect(d.toplamKalan).toBeGreaterThan(0);
    // toplamBorc = kalan + tamamlanan invariantı (tamamlanan 0)
    d.namazlar.forEach((n) => expect(n.toplamBorc).toBe(n.kalanBorc + n.tamamlanan));
    // diske yazıldı
    expect(diskDurumOku()!.toplamKalan).toBe(d.toplamKalan);
  });

  it('ergenlik geleceyse (sıfır borç) tüm kalanlar 0 olur', async () => {
    const store = yeniStore();
    await store.dispatch(
      sihirbazIleBaslat({ dogumTarihi: '2025-01-01', ergenlikYasi: 14, kildigiTahminiYuzdesi: 0 })
    );
    const d = store.getState().kaza.kazaDurumu!;
    expect(d.toplamKalan).toBe(0);
    d.namazlar.forEach((n) => expect(n.kalanBorc).toBe(0));
  });

  it('mevcut tamamlanan değeri sihirbaz sonrası toplamBorc invariantında korunur', async () => {
    const store = yeniStore();
    // önce bir tamamlama yap (Sabah'a borç ekle + 2 tamamla)
    await store.dispatch(borcEkle({ namazAdi: 'Sabah', sayi: 5 }));
    await store.dispatch(kazaTamamla({ namazAdi: 'Sabah', sayi: 2 }));
    const tamamlananOnce = tamamlanan(store.getState().kaza.kazaDurumu!, 'Sabah');
    expect(tamamlananOnce).toBe(2);
    // sihirbazı çalıştır
    await store.dispatch(
      sihirbazIleBaslat({ dogumTarihi: '1990-01-01', ergenlikYasi: 14, kildigiTahminiYuzdesi: 0 })
    );
    const sabah = store.getState().kaza.kazaDurumu!.namazlar.find((n) => n.namazAdi === 'Sabah')!;
    expect(sabah.tamamlanan).toBe(2); // korundu
    expect(sabah.toplamBorc).toBe(sabah.kalanBorc + 2); // invariant
  });
});

// ==================== gunlukHedefiGuncelle ====================

describe('gunlukHedefiGuncelle', () => {
  it('hedefi günceller ve diske yazar', async () => {
    const store = yeniStore();
    await store.dispatch(gunlukHedefiGuncelle({ hedef: 8 }));
    expect(store.getState().kaza.kazaDurumu!.gunlukHedef).toBe(8);
    expect(diskDurumOku()!.gunlukHedef).toBe(8);
  });

  it('negatif hedef 0\'a kenetlenir (Math.max)', async () => {
    const store = yeniStore();
    await store.dispatch(gunlukHedefiGuncelle({ hedef: -5 }));
    expect(store.getState().kaza.kazaDurumu!.gunlukHedef).toBe(0);
  });
});

// ==================== gizlemeToggle ====================

describe('gizlemeToggle', () => {
  it('toplamGizleMi değerini tersine çevirir (false→true)', async () => {
    const store = yeniStore();
    await store.dispatch(gizlemeToggle());
    expect(store.getState().kaza.kazaDurumu!.toplamGizleMi).toBe(true);
    expect(diskDurumOku()!.toplamGizleMi).toBe(true);
  });

  it('iki kez toggle başa döner (true→false)', async () => {
    const store = yeniStore();
    await store.dispatch(gizlemeToggle());
    await store.dispatch(gizlemeToggle());
    expect(store.getState().kaza.kazaDurumu!.toplamGizleMi).toBe(false);
  });
});

// ==================== entegrasyon: yükle → ekle → tamamla → kalıcılık ====================

describe('entegrasyon: yaşam döngüsü kalıcılığı', () => {
  it('borç ekleyip tamamlanan ilerleme yeniden yüklendiğinde korunur', async () => {
    const store1 = yeniStore();
    await store1.dispatch(borcEkle({ namazAdi: 'İkindi', sayi: 6 }));
    await store1.dispatch(kazaTamamla({ namazAdi: 'İkindi', sayi: 2 }));

    // yeni store ile diskten yükle
    const store2 = yeniStore();
    await store2.dispatch(kazaVerileriniYukle());
    const d = store2.getState().kaza.kazaDurumu!;
    expect(kalan(d, 'İkindi')).toBe(4);
    expect(tamamlanan(d, 'İkindi')).toBe(2);
    expect(d.toplamKalan).toBe(4);
  });
});
