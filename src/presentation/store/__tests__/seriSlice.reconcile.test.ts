/**
 * seriSlice - puanlamayiYenidenHesapla (reconcile) testleri
 *
 * Karma turev/defter modeli:
 * - toplamKilinanNamaz / mukemmelGunSayisi / tabanPuan namaz kayitlarindan TURETILIR
 * - bonusPuan kalici (migrasyon: eski toplamPuan - eski taban; sisme cikarimda sadelesir)
 * - toplamPuan = tabanPuan + bonusPuan
 * - reconcile SESSIZdir (kutlama uretmez); seviye atlama yalniz sessiz=false ve gercek artista
 */

import { configureStore } from '@reduxjs/toolkit';
import seriReducer, {
  seriVerileriniYukle,
  puanlamayiYenidenHesapla,
} from '../seriSlice';
import { NamazAdi, NAMAZ_ISIMLERI } from '../../../core/constants/UygulamaSabitleri';

// ==================== MOCKLAR ====================

const mockLocalTumSeriVerileriniGetir = jest.fn();
const mockLocalBonusPuaniGetir = jest.fn();
const mockLocalBonusPuaniKaydet = jest.fn();
const mockLocalToplamKilinanNamaziKaydet = jest.fn();
const mockLocalMukemmelGunSayisiniKaydet = jest.fn();
const mockLocalSeviyeDurumunuKaydet = jest.fn();
const mockLocalVerileriSenkronizasyonIcinAl = jest.fn();

jest.mock('../../../data/local/LocalSeriServisi', () => ({
  localTumSeriVerileriniGetir: (...a: any[]) => mockLocalTumSeriVerileriniGetir(...a),
  localBonusPuaniGetir: (...a: any[]) => mockLocalBonusPuaniGetir(...a),
  localBonusPuaniKaydet: (...a: any[]) => mockLocalBonusPuaniKaydet(...a),
  localToplamKilinanNamaziKaydet: (...a: any[]) => mockLocalToplamKilinanNamaziKaydet(...a),
  localMukemmelGunSayisiniKaydet: (...a: any[]) => mockLocalMukemmelGunSayisiniKaydet(...a),
  localSeviyeDurumunuKaydet: (...a: any[]) => mockLocalSeviyeDurumunuKaydet(...a),
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

// ==================== YARDIMCI ====================

function storeOlustur() {
  return configureStore({
    reducer: { seri: seriReducer },
    middleware: (gdm) => gdm({ serializableCheck: false }),
  });
}

const gunKayitlari = (tarih: string, kilinan: number) =>
  NAMAZ_ISIMLERI.map((namazAdi, i) => ({ tarih, namazAdi: namazAdi as NamazAdi, tamamlandi: i < kilinan }));

const seriVerileri = (over: Partial<{ toplamPuan: number; toplamKilinanNamaz: number; mukemmelGunSayisi: number; tamGunEsigi: number; mevcutSeviye: number }> = {}) => ({
  basarili: true,
  veri: {
    seriDurumu: {
      mevcutSeri: 10, enUzunSeri: 15, sonTamGun: '2026-02-14', seriBaslangici: '2026-02-04',
      toparlanmaDurumu: null, dondurulduMu: false, dondurulmaTarihi: null, sonGuncelleme: new Date().toISOString(),
    },
    rozetler: [],
    seviyeDurumu: {
      mevcutSeviye: over.mevcutSeviye ?? 3, toplamPuan: over.toplamPuan ?? 450, mevcutSeviyePuani: 150,
      sonrakiSeviyeKalanPuan: 150, rank: 'Salik', rankIkonu: 'X',
    },
    ayarlar: {
      tamGunEsigi: over.tamGunEsigi ?? 5, gunBitisSaati: '05:00', bildirimlerAktif: true, toparlanmaGunSayisi: 5,
      gunSonuBildirimAktif: true, gunSonuBildirimDk: 60, gunSonuBildirimModu: 'otomatik',
      bildirimImsakOncesiDk: 30, bildirimGunSecimi: 'ertesiGun', bildirimSaati: 4, bildirimDakikasi: 0,
    },
    ozelGunAyarlari: { ozelGunModuAktif: false, aktifOzelGun: null, gecmisKayitlar: [] },
    toplamKilinanNamaz: over.toplamKilinanNamaz ?? 50,
    toparlanmaSayisi: 2,
    mukemmelGunSayisi: over.mukemmelGunSayisi ?? 5,
  },
});

async function yukleVeReconcile(store: ReturnType<typeof storeOlustur>, sessiz = true) {
  await store.dispatch(seriVerileriniYukle());
  await store.dispatch(puanlamayiYenidenHesapla({ sessiz }));
}

// ==================== TESTLER ====================

describe('puanlamayiYenidenHesapla (reconcile)', () => {
  let store: ReturnType<typeof storeOlustur>;

  beforeEach(() => {
    jest.clearAllMocks();
    store = storeOlustur();
    mockLocalToplamKilinanNamaziKaydet.mockResolvedValue({ basarili: true });
    mockLocalMukemmelGunSayisiniKaydet.mockResolvedValue({ basarili: true });
    mockLocalSeviyeDurumunuKaydet.mockResolvedValue({ basarili: true });
    mockLocalBonusPuaniKaydet.mockResolvedValue({ basarili: true });
  });

  test('ilk calismada bonusPuan migrate edilir (eski toplam - eski taban) ve sisme dusurulur', async () => {
    // Eski: toplamPuan=450, toplamKilinan=50 (yani 50 sahte sismis olabilir). Gercek kayit: 10 kilinan.
    mockLocalTumSeriVerileriniGetir.mockResolvedValue(seriVerileri({ toplamPuan: 450, toplamKilinanNamaz: 50 }));
    mockLocalBonusPuaniGetir.mockResolvedValue({ basarili: true, veri: null }); // ilk calisma
    mockLocalVerileriSenkronizasyonIcinAl.mockResolvedValue([
      ...gunKayitlari('2026-06-13', 5),
      ...gunKayitlari('2026-06-14', 5),
    ]);

    await yukleVeReconcile(store);
    const s = store.getState().seri;

    // bonus = 450 - (50*5) = 200 ; taban = 10*5 = 50 ; toplam = 250
    expect(s.bonusPuan).toBe(200);
    expect(s.toplamKilinanNamaz).toBe(10);
    expect(s.tabanPuan).toBe(50);
    expect(s.mukemmelGunSayisi).toBe(2);
    expect(s.seviyeDurumu?.toplamPuan).toBe(250);
    expect(mockLocalBonusPuaniKaydet).toHaveBeenCalledWith(200);
  });

  test('mevcut bonusPuan varsa migrasyon yapilmaz', async () => {
    mockLocalTumSeriVerileriniGetir.mockResolvedValue(seriVerileri({ toplamPuan: 450, toplamKilinanNamaz: 50 }));
    mockLocalBonusPuaniGetir.mockResolvedValue({ basarili: true, veri: 200 }); // zaten var
    mockLocalVerileriSenkronizasyonIcinAl.mockResolvedValue(gunKayitlari('2026-06-14', 4));

    await yukleVeReconcile(store);
    const s = store.getState().seri;

    expect(mockLocalBonusPuaniKaydet).not.toHaveBeenCalled();
    expect(s.bonusPuan).toBe(200);
    expect(s.tabanPuan).toBe(20); // 4*5
    expect(s.seviyeDurumu?.toplamPuan).toBe(220);
  });

  test('reconcile SESSIZdir: kutlama uretmez (sessiz=true)', async () => {
    mockLocalTumSeriVerileriniGetir.mockResolvedValue(seriVerileri({ toplamPuan: 0, toplamKilinanNamaz: 0 }));
    mockLocalBonusPuaniGetir.mockResolvedValue({ basarili: true, veri: 0 });
    // Cok namaz -> seviye degisir ama sessiz oldugu icin kutlama olmamali
    mockLocalVerileriSenkronizasyonIcinAl.mockResolvedValue(
      Array.from({ length: 60 }, (_, i) => gunKayitlari(`2026-04-${(i % 28) + 1}`, 5)).flat()
    );

    await yukleVeReconcile(store, true);
    const s = store.getState().seri;

    expect(s.bekleyenKutlamalar).toHaveLength(0);
  });

  test('mukemmel gun esige gore: tamGunEsigi=3 ise 3 kilinan gun mukemmel sayilir', async () => {
    mockLocalTumSeriVerileriniGetir.mockResolvedValue(seriVerileri({ tamGunEsigi: 3, toplamPuan: 0, toplamKilinanNamaz: 0 }));
    mockLocalBonusPuaniGetir.mockResolvedValue({ basarili: true, veri: 0 });
    mockLocalVerileriSenkronizasyonIcinAl.mockResolvedValue(gunKayitlari('2026-06-14', 3));

    await yukleVeReconcile(store);
    expect(store.getState().seri.mukemmelGunSayisi).toBe(1);
  });

  test('sessiz=false ve gercek seviye atlamada kutlama eklenir', async () => {
    // Baslangic seviye 1, puan 0; 21 namaz -> taban 105 -> seviye 2 (esik 100). Atlama kutlanir.
    mockLocalTumSeriVerileriniGetir.mockResolvedValue(
      seriVerileri({ toplamPuan: 0, toplamKilinanNamaz: 0, mevcutSeviye: 1 })
    );
    mockLocalBonusPuaniGetir.mockResolvedValue({ basarili: true, veri: 0 });
    mockLocalVerileriSenkronizasyonIcinAl.mockResolvedValue(
      Array.from({ length: 5 }, (_, g) => gunKayitlari(`2026-05-0${g + 1}`, 5)).flat().slice(0, 21)
    );

    await store.dispatch(seriVerileriniYukle());
    await store.dispatch(puanlamayiYenidenHesapla({ sessiz: false }));
    const s = store.getState().seri;

    expect(s.tabanPuan).toBe(105);
    expect(s.seviyeDurumu!.mevcutSeviye).toBeGreaterThanOrEqual(2);
    expect(s.bekleyenKutlamalar).toHaveLength(1);
    expect(s.bekleyenKutlamalar[0].tip).toBe('seviye_atlandi');
  });

  test('idempotent: ayni kayitlarla iki kez reconcile -> sismeme (toggle on/off/on senaryosu)', async () => {
    mockLocalTumSeriVerileriniGetir.mockResolvedValue(seriVerileri({ toplamPuan: 0, toplamKilinanNamaz: 0 }));
    mockLocalBonusPuaniGetir.mockResolvedValue({ basarili: true, veri: 0 });
    mockLocalVerileriSenkronizasyonIcinAl.mockResolvedValue(gunKayitlari('2026-06-14', 5));

    await store.dispatch(seriVerileriniYukle());
    await store.dispatch(puanlamayiYenidenHesapla({ sessiz: true }));
    const ilk = store.getState().seri;

    // Kayit ayni kaldigi surece tekrar reconcile sonucu DEGISTIRMEZ (sisme imkansiz)
    await store.dispatch(puanlamayiYenidenHesapla({ sessiz: true }));
    const ikinci = store.getState().seri;

    expect(ikinci.toplamKilinanNamaz).toBe(ilk.toplamKilinanNamaz);
    expect(ikinci.tabanPuan).toBe(ilk.tabanPuan);
    expect(ikinci.seviyeDurumu!.toplamPuan).toBe(ilk.seviyeDurumu!.toplamPuan);
    expect(ikinci.toplamKilinanNamaz).toBe(5);
  });
});
