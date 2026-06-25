/**
 * seriSlice - thunk hata yollari, ayar/bildirim planlama, ozel gun thunk'lari,
 * saf reducer'lar ve selector'lar icin DAVRANISSAL testler.
 *
 * Mevcut test dosyalari (seriSlice.test.ts / .reconcile / .butunluk) su yollari KAPSAMIYORDU:
 * - seriVerileriniYukle.rejected (basarisiz / throw) -> hata mesaji + sonYukleme null kalir
 * - seriAyarlariniGuncelle bildirim planlama dallari (sabit / otomatik+imsak / otomatik-imsaksiz / kapali)
 * - seriKontrolet.rejected -> guncelleniyor=false + hata mesaji
 * - kutlamayiKaldir / kutlamalariTemizle / hataTemizle / seriStateSifirla saf reducer'lari
 * - ozelGunModuDurumunuGuncelle / ozelGunBaslat / ozelGunBitir / ozelGunIptal thunk'lari
 * - seriOzetiSelector / ilkKutlamaSelector / kazanilanRozetSayisiSelector
 */

import { configureStore } from '@reduxjs/toolkit';
import seriReducer, {
  seriVerileriniYukle,
  seriAyarlariniGuncelle,
  seriKontrolet,
  ozelGunModuDurumunuGuncelle,
  ozelGunBaslat,
  ozelGunBitir,
  ozelGunIptal,
  kutlamayiKaldir,
  kutlamalariTemizle,
  hataTemizle,
  seriStateSifirla,
  ilkKutlamaSelector,
  kazanilanRozetSayisiSelector,
  seriOzetiSelector,
} from '../seriSlice';
import { NamazAdi } from '../../../core/constants/UygulamaSabitleri';
import { GunlukNamazlar } from '../../../core/types';

// ==================== MOCKLAR ====================

const mockLocalTumSeriVerileriniGetir = jest.fn();
const mockLocalSeriAyarlariniKaydet = jest.fn();
const mockLocalOzelGunAyarlariniKaydet = jest.fn();
const mockLocalSeriDurumunuKaydet = jest.fn();
const mockLocalRozetleriKaydet = jest.fn();
const mockLocalBonusPuaniKaydet = jest.fn();
const mockLocalBonusPuaniGetir = jest.fn(async () => ({ basarili: true, veri: 0 as number | null }));

jest.mock('../../../data/local/LocalSeriServisi', () => ({
  // Proxy ile lazy-bind: jest.mock fabrikasi const'lardan ONCE hoist edilir; dogrudan referans
  // verirsek fabrika-eval aninda const'lar henuz undefined olur -> "is not a function".
  localTumSeriVerileriniGetir: (...a: unknown[]) => mockLocalTumSeriVerileriniGetir(...a),
  localSeriAyarlariniKaydet: (...a: unknown[]) => mockLocalSeriAyarlariniKaydet(...a),
  localOzelGunAyarlariniKaydet: (...a: unknown[]) => mockLocalOzelGunAyarlariniKaydet(...a),
  localSeriDurumunuKaydet: (...a: unknown[]) => mockLocalSeriDurumunuKaydet(...a),
  localRozetleriKaydet: (...a: unknown[]) => mockLocalRozetleriKaydet(...a),
  localBonusPuaniKaydet: (...a: unknown[]) => mockLocalBonusPuaniKaydet(...a),
  localBonusPuaniGetir: () => mockLocalBonusPuaniGetir(),
  localToparlanmaSayisiniArttir: jest.fn(async () => ({ basarili: true, veri: 0 })),
  VARSAYILAN_OZEL_GUN_AYARLARI: {
    ozelGunModuAktif: false,
    aktifOzelGun: null,
    gecmisKayitlar: [],
  },
}));

// localVerileriSenkronizasyonIcinAl (reconcile yolu) — bu dosyada reconcile'i tetiklemiyoruz
jest.mock('../../../data/local/LocalNamazServisi', () => ({
  localVerileriSenkronizasyonIcinAl: jest.fn(async () => []),
}));

// BildirimServisi mock — planla/iptal cagrilarini gercek argumanlariyla yakalamak icin
const mockBildirimPlanla = jest.fn();
const mockBildirimIptalEt = jest.fn();
jest.mock('../../../domain/services/BildirimServisi', () => ({
  BildirimServisi: {
    getInstance: jest.fn(() => ({
      bildirimPlanla: (...a: unknown[]) => mockBildirimPlanla(...a),
      bildirimIptalEt: (...a: unknown[]) => mockBildirimIptalEt(...a),
    })),
  },
}));

// KonumYoneticiServisi mock — imsak vaktini test bazinda degistirebilmek icin degisken
let mockImsakVakti: Date | null = null;
jest.mock('../../../domain/services/KonumYoneticiServisi', () => ({
  KonumYoneticiServisi: {
    getInstance: jest.fn(() => ({
      sonrakiGunImsakVaktiGetir: jest.fn(() => mockImsakVakti),
    })),
  },
}));

// ==================== YARDIMCI ====================

function storeOlustur() {
  return configureStore({
    reducer: { seri: seriReducer },
    middleware: (gdm) => gdm({ serializableCheck: false }),
  });
}

const tamNamazlar = (tarih: string): GunlukNamazlar => ({
  tarih,
  namazlar: [
    { namazAdi: NamazAdi.Sabah, tamamlandi: true, tarih },
    { namazAdi: NamazAdi.Ogle, tamamlandi: true, tarih },
    { namazAdi: NamazAdi.Ikindi, tamamlandi: true, tarih },
    { namazAdi: NamazAdi.Aksam, tamamlandi: true, tarih },
    { namazAdi: NamazAdi.Yatsi, tamamlandi: true, tarih },
  ],
});

const tamSeriVerileri = () => ({
  basarili: true,
  veri: {
    seriDurumu: {
      mevcutSeri: 10,
      enUzunSeri: 15,
      sonTamGun: '2026-02-14',
      seriBaslangici: '2026-02-04',
      toparlanmaDurumu: null,
      dondurulduMu: false,
      dondurulmaTarihi: null,
      sonGuncelleme: new Date().toISOString(),
    },
    rozetler: [
      { rozetId: 'ilk_adim', kazanildiMi: true, kazanilmaTarihi: '2026-02-10T00:00:00.000Z' },
      { rozetId: 'aliskanlik_ustasi', kazanildiMi: false, kazanilmaTarihi: null },
    ],
    seviyeDurumu: {
      mevcutSeviye: 3,
      toplamPuan: 450,
      mevcutSeviyePuani: 150,
      sonrakiSeviyeKalanPuan: 150,
      rank: 'Salik',
      rankIkonu: '🌟',
    },
    ayarlar: {
      tamGunEsigi: 5,
      gunBitisSaati: '05:00',
      bildirimlerAktif: true,
      toparlanmaGunSayisi: 5,
      gunSonuBildirimAktif: false,
      gunSonuBildirimDk: 60,
      gunSonuBildirimModu: 'otomatik' as const,
      bildirimImsakOncesiDk: 30,
      bildirimGunSecimi: 'ertesiGun' as const,
      bildirimSaati: 4,
      bildirimDakikasi: 0,
    },
    ozelGunAyarlari: { ozelGunModuAktif: false, aktifOzelGun: null, gecmisKayitlar: [] },
    toplamKilinanNamaz: 50,
    toparlanmaSayisi: 2,
    mukemmelGunSayisi: 5,
  },
});

beforeEach(() => {
  jest.clearAllMocks();
  mockImsakVakti = null;
  mockLocalBonusPuaniGetir.mockResolvedValue({ basarili: true, veri: 0 });
  mockLocalSeriAyarlariniKaydet.mockResolvedValue({ basarili: true });
  mockLocalOzelGunAyarlariniKaydet.mockResolvedValue({ basarili: true });
  mockLocalSeriDurumunuKaydet.mockResolvedValue({ basarili: true });
  mockLocalRozetleriKaydet.mockResolvedValue({ basarili: true });
  mockLocalBonusPuaniKaydet.mockResolvedValue({ basarili: true });
  mockBildirimPlanla.mockResolvedValue(undefined);
  mockBildirimIptalEt.mockResolvedValue(undefined);
});

// ==================== seriVerileriniYukle.rejected ====================

describe('seriVerileriniYukle hata yolu (rejected)', () => {
  test('local yanit basarisiz ise hata mesaji set edilir ve sonYukleme null kalir', async () => {
    mockLocalTumSeriVerileriniGetir.mockResolvedValue({
      basarili: false,
      hata: 'Disk okunamadi',
    });
    const store = storeOlustur();

    const sonuc = await store.dispatch(seriVerileriniYukle());

    expect(sonuc.type).toContain('rejected');
    const s = store.getState().seri;
    expect(s.yukleniyor).toBe(false);
    expect(s.hata).toBe('Disk okunamadi');
    // sonYukleme dolmamali -> sonraki seriKontrolet/reconcile condition guard ile bloklanir
    expect(s.sonYukleme).toBeNull();
    // veri yazilmadi -> baslangic durumu korunur
    expect(s.seviyeDurumu).toBeNull();
    expect(s.toplamKilinanNamaz).toBe(0);
  });

  test('basarili ama veri yoksa varsayilan hata mesaji kullanilir', async () => {
    // basarili:true ama veri:null/undefined -> thunk "Seri verileri yuklenemedi" firlatir
    mockLocalTumSeriVerileriniGetir.mockResolvedValue({ basarili: true, veri: null });
    const store = storeOlustur();

    const sonuc = await store.dispatch(seriVerileriniYukle());

    expect(sonuc.type).toContain('rejected');
    expect(store.getState().seri.hata).toBe('Seri verileri yuklenemedi');
    expect(store.getState().seri.sonYukleme).toBeNull();
  });

  test('servis throw ederse hata yakalanir ve state tutarli kalir', async () => {
    mockLocalTumSeriVerileriniGetir.mockRejectedValue(new Error('beklenmedik cokme'));
    const store = storeOlustur();

    const sonuc = await store.dispatch(seriVerileriniYukle());

    expect(sonuc.type).toContain('rejected');
    expect(store.getState().seri.hata).toBe('beklenmedik cokme');
    expect(store.getState().seri.yukleniyor).toBe(false);
  });

  test('pending sirasinda yukleniyor=true ve onceki hata temizlenir', async () => {
    const store = storeOlustur();
    // Once bir hata olustur
    mockLocalTumSeriVerileriniGetir.mockResolvedValueOnce({ basarili: false, hata: 'eski hata' });
    await store.dispatch(seriVerileriniYukle());
    expect(store.getState().seri.hata).toBe('eski hata');

    // Yeni yukleme: askida tut, pending durumunu gozlemle
    let coz: (v: ReturnType<typeof tamSeriVerileri>) => void;
    mockLocalTumSeriVerileriniGetir.mockReturnValueOnce(
      new Promise((resolve) => {
        coz = resolve;
      })
    );
    const beklemede = store.dispatch(seriVerileriniYukle());
    // pending islendi: yukleniyor true, hata null'a cekildi
    expect(store.getState().seri.yukleniyor).toBe(true);
    expect(store.getState().seri.hata).toBeNull();

    coz!(tamSeriVerileri());
    await beklemede;
    expect(store.getState().seri.yukleniyor).toBe(false);
  });
});

// ==================== seriAyarlariniGuncelle + bildirim planlama ====================

describe('seriAyarlariniGuncelle bildirim planlama dallari', () => {
  test('gunSonuBildirimAktif=false ise bildirim IPTAL edilir, planlanmaz', async () => {
    const store = storeOlustur();

    const sonuc = await store.dispatch(
      seriAyarlariniGuncelle({ ayarlar: { gunSonuBildirimAktif: false } })
    );

    expect(sonuc.type).toContain('fulfilled');
    expect(mockBildirimIptalEt).toHaveBeenCalledWith('gun_sonu_hatirlatici');
    expect(mockBildirimPlanla).not.toHaveBeenCalled();
    // Ayar state'e yansidi
    expect(store.getState().seri.ayarlar.gunSonuBildirimAktif).toBe(false);
    // Disk'e kaydedildi (mevcut + degisiklik birlesimi)
    expect(mockLocalSeriAyarlariniKaydet).toHaveBeenCalled();
  });

  test('SABIT mod: kullanicinin sectigi sabit saat/dakika ile planlanir', async () => {
    const store = storeOlustur();

    await store.dispatch(
      seriAyarlariniGuncelle({
        ayarlar: {
          gunSonuBildirimAktif: true,
          gunSonuBildirimModu: 'sabit',
          bildirimSaati: 22,
          bildirimDakikasi: 15,
        },
      })
    );

    expect(mockBildirimPlanla).toHaveBeenCalledTimes(1);
    const cagriArgs = mockBildirimPlanla.mock.calls[0];
    // (id, baslik, mesaj, saat, dakika)
    expect(cagriArgs[0]).toBe('gun_sonu_hatirlatici');
    expect(cagriArgs[3]).toBe(22); // saat
    expect(cagriArgs[4]).toBe(15); // dakika
    expect(mockBildirimIptalEt).not.toHaveBeenCalled();
    expect(store.getState().seri.ayarlar.gunSonuBildirimModu).toBe('sabit');
  });

  test('OTOMATIK mod + imsak vakti var: imsaktan X dk once planlanir', async () => {
    // Imsak 06:00, 30 dk once -> 05:30
    mockImsakVakti = new Date(2026, 5, 25, 6, 0, 0);
    const store = storeOlustur();

    await store.dispatch(
      seriAyarlariniGuncelle({
        ayarlar: {
          gunSonuBildirimAktif: true,
          gunSonuBildirimModu: 'otomatik',
          bildirimImsakOncesiDk: 30,
        },
      })
    );

    expect(mockBildirimPlanla).toHaveBeenCalledTimes(1);
    const cagriArgs = mockBildirimPlanla.mock.calls[0];
    expect(cagriArgs[3]).toBe(5); // saat = 05
    expect(cagriArgs[4]).toBe(30); // dakika = 30 (06:00 - 30dk)
  });

  test('OTOMATIK mod + imsak vakti yok (konum yok): varsayilan 04:00 ile planlanir', async () => {
    mockImsakVakti = null; // konum yok
    const store = storeOlustur();

    await store.dispatch(
      seriAyarlariniGuncelle({
        ayarlar: {
          gunSonuBildirimAktif: true,
          gunSonuBildirimModu: 'otomatik',
          bildirimImsakOncesiDk: 60,
        },
      })
    );

    expect(mockBildirimPlanla).toHaveBeenCalledTimes(1);
    const cagriArgs = mockBildirimPlanla.mock.calls[0];
    expect(cagriArgs[3]).toBe(4); // varsayilan saat
    expect(cagriArgs[4]).toBe(0); // varsayilan dakika
  });

  test('kismi ayar guncellemesi mevcut ayarlarla BIRLESTIRILIR', async () => {
    const store = storeOlustur();

    // Yalniz tamGunEsigi degistir -> diger varsayilan alanlar korunmali
    await store.dispatch(seriAyarlariniGuncelle({ ayarlar: { tamGunEsigi: 3 } }));

    const ayarlar = store.getState().seri.ayarlar;
    expect(ayarlar.tamGunEsigi).toBe(3);
    // Birlesim: dokunulmayan alan varsayilan degerini korur
    expect(ayarlar.toparlanmaGunSayisi).toBe(3); // VARSAYILAN_SERI_AYARLARI.toparlanmaGunSayisi
    expect(ayarlar.gunSonuBildirimModu).toBe('otomatik');
    // Diske yazilan deger de birlesik olmali
    const kaydedilen = mockLocalSeriAyarlariniKaydet.mock.calls[0][0];
    expect(kaydedilen.tamGunEsigi).toBe(3);
    expect(kaydedilen.bildirimSaati).toBe(4);
  });
});

// ==================== seriKontrolet.rejected ====================

describe('seriKontrolet hata yolu (rejected)', () => {
  test('seri yuklendikten sonra kaydetme cokerse guncelleniyor=false ve hata set edilir', async () => {
    const store = storeOlustur();
    // Once yukle ki condition guard gecsin (sonYukleme dolar)
    mockLocalTumSeriVerileriniGetir.mockResolvedValueOnce(tamSeriVerileri());
    await store.dispatch(seriVerileriniYukle());
    expect(store.getState().seri.sonYukleme).not.toBeNull();

    // seriKontrolet icinde Promise.all kaydetmelerinden biri patlasin
    mockLocalSeriDurumunuKaydet.mockRejectedValueOnce(new Error('kaydetme hatasi'));

    // sonTamGun cok eski + bugun 5/5 -> seriDegisti=true (kaydetme yoluna girer)
    const bugun = new Date().toISOString().split('T')[0];
    const sonuc = await store.dispatch(
      seriKontrolet({
        bugunNamazlar: tamNamazlar(bugun),
        dunNamazlar: null,
      })
    );

    expect(sonuc.type).toContain('rejected');
    const s = store.getState().seri;
    expect(s.guncelleniyor).toBe(false);
    expect(s.hata).toBe('kaydetme hatasi');
  });
});

// ==================== SAF REDUCER'LAR ====================

describe('saf reducer aksiyonlari (izole reducer cagrisi)', () => {
  const k1 = { tip: 'seviye_atlandi' as const, baslik: 'A', mesaj: 'm', ikon: '⭐' };
  const k2 = { tip: 'rozet_kazanildi' as const, baslik: 'B', mesaj: 'm', ikon: '🏅' };

  const baslangic = () =>
    seriReducer(undefined, { type: '@@INIT' });

  test('kutlamayiKaldir ilk kutlamayi cikarir', () => {
    const stateIle = {
      ...baslangic(),
      bekleyenKutlamalar: [k1, k2],
    };
    const yeni = seriReducer(stateIle, kutlamayiKaldir());
    expect(yeni.bekleyenKutlamalar).toEqual([k2]);
  });

  test('kutlamalariTemizle kuyrugu bosaltir', () => {
    const stateIle = { ...baslangic(), bekleyenKutlamalar: [k1, k2] };
    const yeni = seriReducer(stateIle, kutlamalariTemizle());
    expect(yeni.bekleyenKutlamalar).toEqual([]);
  });

  test('hataTemizle hata alanini null yapar', () => {
    const stateIle = { ...baslangic(), hata: 'bir hata' };
    const yeni = seriReducer(stateIle, hataTemizle());
    expect(yeni.hata).toBeNull();
  });

  test('seriStateSifirla ayarlari KORUR, gerisini baslangica dondurur', () => {
    const ozelAyar = { ...baslangic().ayarlar, tamGunEsigi: 4, bildirimSaati: 21 };
    const stateIle = {
      ...baslangic(),
      ayarlar: ozelAyar,
      toplamKilinanNamaz: 99,
      bonusPuan: 500,
      tabanPuan: 200,
      seviyeDurumu: {
        mevcutSeviye: 5,
        toplamPuan: 700,
        mevcutSeviyePuani: 0,
        sonrakiSeviyeKalanPuan: 0,
        rank: 'X',
        rankIkonu: 'Y',
      },
      bekleyenKutlamalar: [k1],
      hata: 'x',
    };
    const yeni = seriReducer(stateIle, seriStateSifirla());

    // Ayarlar korunur
    expect(yeni.ayarlar).toEqual(ozelAyar);
    // Gerisi baslangica doner
    expect(yeni.toplamKilinanNamaz).toBe(0);
    expect(yeni.bonusPuan).toBe(0);
    expect(yeni.tabanPuan).toBe(0);
    expect(yeni.seviyeDurumu).toBeNull();
    expect(yeni.bekleyenKutlamalar).toEqual([]);
    expect(yeni.hata).toBeNull();
    expect(yeni.sonYukleme).toBeNull();
  });
});

// ==================== OZEL GUN THUNK'LARI ====================

describe('ozel gun thunk\'lari', () => {
  test('ozelGunModuDurumunuGuncelle aktif=true yapar ve diske kaydeder', async () => {
    const store = storeOlustur();
    const sonuc = await store.dispatch(ozelGunModuDurumunuGuncelle({ aktif: true }));

    expect(sonuc.type).toContain('fulfilled');
    expect(store.getState().seri.ozelGunAyarlari.ozelGunModuAktif).toBe(true);
    const kaydedilen = mockLocalOzelGunAyarlariniKaydet.mock.calls[0][0];
    expect(kaydedilen.ozelGunModuAktif).toBe(true);
  });

  test('ozelGunBaslat yeni aktif kayit olusturur (id + olusturulmaTarihi dolu)', async () => {
    const store = storeOlustur();
    const sonuc = await store.dispatch(
      ozelGunBaslat({
        baslangicTarihi: '2026-07-01',
        bitisTarihi: '2026-07-10',
        aciklama: 'Seyahat',
      })
    );

    expect(sonuc.type).toContain('fulfilled');
    const aktif = store.getState().seri.ozelGunAyarlari.aktifOzelGun!;
    expect(aktif).not.toBeNull();
    expect(aktif.baslangicTarihi).toBe('2026-07-01');
    expect(aktif.bitisTarihi).toBe('2026-07-10');
    expect(aktif.aciklama).toBe('Seyahat');
    expect(typeof aktif.id).toBe('string');
    expect(aktif.id.length).toBeGreaterThan(0);
    expect(typeof aktif.olusturulmaTarihi).toBe('string');
  });

  test('ozelGunBitir aktif gunu gecmise tasir ve aktifi temizler', async () => {
    const store = storeOlustur();
    // Once bir ozel gun baslat
    await store.dispatch(
      ozelGunBaslat({ baslangicTarihi: '2026-07-01', bitisTarihi: '2026-07-05' })
    );
    const aktifId = store.getState().seri.ozelGunAyarlari.aktifOzelGun!.id;

    const sonuc = await store.dispatch(ozelGunBitir());
    expect(sonuc.type).toContain('fulfilled');

    const oz = store.getState().seri.ozelGunAyarlari;
    expect(oz.aktifOzelGun).toBeNull();
    // Gecmis kayitlara EN BASA eklendi
    expect(oz.gecmisKayitlar[0].id).toBe(aktifId);
    expect(oz.gecmisKayitlar.length).toBe(1);
  });

  test('ozelGunBitir aktif gun yoksa mevcut ayarlari aynen dondurur (no-op)', async () => {
    const store = storeOlustur();
    // aktifOzelGun null (baslangic)
    const sonuc = await store.dispatch(ozelGunBitir());
    expect(sonuc.type).toContain('fulfilled');
    expect(store.getState().seri.ozelGunAyarlari.aktifOzelGun).toBeNull();
    expect(store.getState().seri.ozelGunAyarlari.gecmisKayitlar).toEqual([]);
    // Aktif gun yoksa diske yazma yapilmaz
    expect(mockLocalOzelGunAyarlariniKaydet).not.toHaveBeenCalled();
  });

  test('ozelGunIptal aktif gunu siler (gecmise TASIMAZ)', async () => {
    const store = storeOlustur();
    await store.dispatch(
      ozelGunBaslat({ baslangicTarihi: '2026-08-01', bitisTarihi: '2026-08-03' })
    );
    expect(store.getState().seri.ozelGunAyarlari.aktifOzelGun).not.toBeNull();

    const sonuc = await store.dispatch(ozelGunIptal());
    expect(sonuc.type).toContain('fulfilled');

    const oz = store.getState().seri.ozelGunAyarlari;
    expect(oz.aktifOzelGun).toBeNull();
    // Iptal -> gecmise EKLENMEZ (bitir'den farki)
    expect(oz.gecmisKayitlar).toEqual([]);
  });

  test('ozelGunIptal aktif gun yoksa no-op (diske yazmaz)', async () => {
    const store = storeOlustur();
    const sonuc = await store.dispatch(ozelGunIptal());
    expect(sonuc.type).toContain('fulfilled');
    expect(mockLocalOzelGunAyarlariniKaydet).not.toHaveBeenCalled();
  });
});

// ==================== SELECTOR'LAR ====================

describe('selector\'lar', () => {
  test('kazanilanRozetSayisiSelector yalniz kazanildiMi=true rozetleri sayar', async () => {
    const store = storeOlustur();
    mockLocalTumSeriVerileriniGetir.mockResolvedValueOnce(tamSeriVerileri());
    await store.dispatch(seriVerileriniYukle());

    // Yuklenen veride 1 kazanilmis (ilk_adim) + 1 kazanilmamis (aliskanlik_ustasi)
    expect(kazanilanRozetSayisiSelector(store.getState())).toBe(1);
  });

  test('ilkKutlamaSelector kuyruk bosken null, doluyken ilk elemani dondurur', () => {
    const k = { tip: 'seviye_atlandi' as const, baslik: 'A', mesaj: 'm', ikon: '⭐' };
    const bosState = { seri: seriReducer(undefined, { type: '@@INIT' }) };
    expect(ilkKutlamaSelector(bosState)).toBeNull();

    const doluState = {
      seri: {
        ...bosState.seri,
        bekleyenKutlamalar: [k, { ...k, baslik: 'B' }],
      },
    };
    expect(ilkKutlamaSelector(doluState)).toEqual(k);
  });

  test('seriOzetiSelector seriDurumu null iken cokmeden bir ozet dondurur', () => {
    const bosState = { seri: seriReducer(undefined, { type: '@@INIT' }) };
    // seriDurumu null; selector seriOzetiniOlustur'a guvenle delege etmeli (throw etmemeli)
    const ozet = seriOzetiSelector(bosState);
    expect(ozet).toBeDefined();
  });

  test('seriOzetiSelector memoize: ayni girdide ayni referansi dondurur', async () => {
    const store = storeOlustur();
    mockLocalTumSeriVerileriniGetir.mockResolvedValueOnce(tamSeriVerileri());
    await store.dispatch(seriVerileriniYukle());

    const ilk = seriOzetiSelector(store.getState());
    const ikinci = seriOzetiSelector(store.getState());
    // createSelector memoize -> degismeyen girdide ayni referans
    expect(ikinci).toBe(ilk);
  });
});
