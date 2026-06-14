/**
 * seriSlice - VERI BUTUNLUGU entegrasyon testleri (diff review kritik bulgusu)
 *
 * Kritik yaris/veri kaybi: bonusPuan acilista diskten state'e yuklenmeli; seriKontrolet
 * ile reconcile ayni karede yarismamali (tek-yazici). Bu testler load -> seriKontrolet ->
 * reconcile sirasinda MESRU tarihsel bonusun KAYBOLMADIGINI ve toplamPuan=tabanPuan+bonusPuan
 * invariantını dogrular. Stateful disk mock'u gercek AsyncStorage davranisini taklit eder.
 */

import { configureStore } from '@reduxjs/toolkit';
import seriReducer, {
  seriVerileriniYukle,
  seriKontrolet,
  puanlamayiYenidenHesapla,
} from '../seriSlice';
import { NamazAdi, NAMAZ_ISIMLERI } from '../../../core/constants/UygulamaSabitleri';
import { GunlukNamazlar } from '../../../core/types';
import { namazGunuHesapla } from '../../../domain/services/SeriHesaplayiciServisi';

// ==================== STATEFUL DISK MOCK ====================

let mockDiskBonus: number | null = null;
const mockLocalTumSeriVerileriniGetir = jest.fn();
const mockLocalVerileriSenkronizasyonIcinAl = jest.fn();

jest.mock('../../../data/local/LocalSeriServisi', () => ({
  localTumSeriVerileriniGetir: (...a: any[]) => mockLocalTumSeriVerileriniGetir(...a),
  localBonusPuaniGetir: async () => ({ basarili: true, veri: mockDiskBonus }),
  localBonusPuaniKaydet: async (p: number) => { mockDiskBonus = p; return { basarili: true }; },
  localToplamKilinanNamaziKaydet: async () => ({ basarili: true }),
  localMukemmelGunSayisiniKaydet: async () => ({ basarili: true }),
  localSeviyeDurumunuKaydet: async () => ({ basarili: true }),
  localSeriDurumunuKaydet: async () => ({ basarili: true }),
  localRozetleriKaydet: async () => ({ basarili: true }),
  localToparlanmaSayisiniArttir: async () => ({ basarili: true, veri: 0 }),
  VARSAYILAN_OZEL_GUN_AYARLARI: { ozelGunModuAktif: false, aktifOzelGun: null, gecmisKayitlar: [] },
}));

jest.mock('../../../data/local/LocalNamazServisi', () => ({
  localVerileriSenkronizasyonIcinAl: (...a: any[]) => mockLocalVerileriSenkronizasyonIcinAl(...a),
}));

jest.mock('../../../domain/services/BildirimServisi', () => ({
  BildirimServisi: { getInstance: jest.fn(() => ({ bildirimPlanla: jest.fn(), bildirimIptalEt: jest.fn() })) },
}));
jest.mock('../../../domain/services/KonumYoneticiServisi', () => ({
  KonumYoneticiServisi: { getInstance: jest.fn(() => ({ sonrakiGunImsakVaktiGetir: jest.fn(() => null) })) },
}));

function storeOlustur() {
  return configureStore({ reducer: { seri: seriReducer }, middleware: (g) => g({ serializableCheck: false }) });
}

const tamNamazlar = (tarih: string): GunlukNamazlar => ({
  tarih,
  namazlar: NAMAZ_ISIMLERI.map((namazAdi) => ({ namazAdi, tamamlandi: true, tarih })),
});
const gunKayitlari = (tarih: string, kilinan: number) =>
  NAMAZ_ISIMLERI.map((namazAdi, i) => ({ tarih, namazAdi: namazAdi as NamazAdi, tamamlandi: i < kilinan }));

const seriVerileri = (over: { toplamPuan: number; toplamKilinanNamaz: number }) => ({
  basarili: true,
  veri: {
    seriDurumu: {
      mevcutSeri: 10, enUzunSeri: 15, sonTamGun: '2026-02-14', seriBaslangici: '2026-02-04',
      toparlanmaDurumu: null, dondurulduMu: false, dondurulmaTarihi: null, sonGuncelleme: new Date().toISOString(),
    },
    // ilk_adim (7 gun) zaten kazanilmis -> seriKontrolet'te yeni rozet gurultusu olmasin
    rozetler: [{ rozetId: 'ilk_adim', kazanildiMi: true, kazanilmaTarihi: '2026-02-10T00:00:00.000Z' }],
    seviyeDurumu: {
      mevcutSeviye: 3, toplamPuan: over.toplamPuan, mevcutSeviyePuani: 150,
      sonrakiSeviyeKalanPuan: 150, rank: 'Salik', rankIkonu: 'X',
    },
    ayarlar: {
      tamGunEsigi: 5, gunBitisSaati: '05:00', bildirimlerAktif: true, toparlanmaGunSayisi: 5,
      gunSonuBildirimAktif: false, gunSonuBildirimDk: 60, gunSonuBildirimModu: 'otomatik',
      bildirimImsakOncesiDk: 30, bildirimGunSecimi: 'ertesiGun', bildirimSaati: 4, bildirimDakikasi: 0,
    },
    ozelGunAyarlari: { ozelGunModuAktif: false, aktifOzelGun: null, gecmisKayitlar: [] },
    toplamKilinanNamaz: over.toplamKilinanNamaz,
    toparlanmaSayisi: 2,
    mukemmelGunSayisi: 5,
  },
});

describe('seriSlice veri butunlugu: load -> seriKontrolet -> reconcile', () => {
  let store: ReturnType<typeof storeOlustur>;
  beforeEach(() => {
    jest.clearAllMocks();
    mockDiskBonus = null;
    store = storeOlustur();
  });

  test('KRITIK: mesru tarihsel bonus (migrasyon) seriKontrolet yarisinda KAYBOLMAZ', async () => {
    // Disk bonus yok (null) -> migrate edilecek. Eski toplam 450, taban 50*5=250 -> bonus 200.
    // Gercek kayit yalnizca 10 kilinan (taban 50). Donen kullanici bugun 5/5 -> seriKontrolet seriDegisti=true.
    mockLocalTumSeriVerileriniGetir.mockResolvedValue(seriVerileri({ toplamPuan: 450, toplamKilinanNamaz: 50 }));
    mockLocalVerileriSenkronizasyonIcinAl.mockResolvedValue([
      ...gunKayitlari('2026-06-13', 5),
      ...gunKayitlari('2026-06-14', 5),
    ]);

    const bugun = namazGunuHesapla(new Date(), '05:00');
    await store.dispatch(seriVerileriniYukle());
    await store.dispatch(seriKontrolet({ bugunNamazlar: tamNamazlar(bugun), dunNamazlar: null }));
    await store.dispatch(puanlamayiYenidenHesapla({ sessiz: true }));

    const s = store.getState().seri;
    // Mesru 200 bonus korunmali (eski hatada bayat-0 uzerine yazilip ~55'e duserdi)
    expect(s.bonusPuan).toBeGreaterThanOrEqual(200);
    // Taban kayittan turev: 10*5=50
    expect(s.tabanPuan).toBe(50);
    // Invariant: toplamPuan = tabanPuan + bonusPuan
    expect(s.seviyeDurumu!.toplamPuan).toBe(s.tabanPuan + s.bonusPuan);
  });

  test('KRITIK: diskte hazir bonus (300) load+seriKontrolet+reconcile sonrasi korunur', async () => {
    mockDiskBonus = 300; // zaten migrate edilmis mesru bonus
    mockLocalTumSeriVerileriniGetir.mockResolvedValue(seriVerileri({ toplamPuan: 550, toplamKilinanNamaz: 50 }));
    mockLocalVerileriSenkronizasyonIcinAl.mockResolvedValue(gunKayitlari('2026-06-14', 5));

    const bugun = namazGunuHesapla(new Date(), '05:00');
    await store.dispatch(seriVerileriniYukle());
    await store.dispatch(seriKontrolet({ bugunNamazlar: tamNamazlar(bugun), dunNamazlar: null }));
    await store.dispatch(puanlamayiYenidenHesapla({ sessiz: true }));

    const s = store.getState().seri;
    expect(s.bonusPuan).toBeGreaterThanOrEqual(300);
    expect(s.seviyeDurumu!.toplamPuan).toBe(s.tabanPuan + s.bonusPuan);
  });

  test('Invariant ters sirada da korunur: reconcile -> seriKontrolet -> reconcile', async () => {
    mockDiskBonus = 100;
    mockLocalTumSeriVerileriniGetir.mockResolvedValue(seriVerileri({ toplamPuan: 350, toplamKilinanNamaz: 50 }));
    mockLocalVerileriSenkronizasyonIcinAl.mockResolvedValue(gunKayitlari('2026-06-14', 5));

    const bugun = namazGunuHesapla(new Date(), '05:00');
    await store.dispatch(seriVerileriniYukle());
    await store.dispatch(puanlamayiYenidenHesapla({ sessiz: true }));
    await store.dispatch(seriKontrolet({ bugunNamazlar: tamNamazlar(bugun), dunNamazlar: null }));
    await store.dispatch(puanlamayiYenidenHesapla({ sessiz: true }));

    const s = store.getState().seri;
    expect(s.bonusPuan).toBeGreaterThanOrEqual(100);
    expect(s.seviyeDurumu!.toplamPuan).toBe(s.tabanPuan + s.bonusPuan);
  });
});
