import AsyncStorage from '@react-native-async-storage/async-storage';
import { NAMAZ_ISIMLERI, NamazAdi, DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';
import {
  localNamazDurumunuGuncelle,
  localTumNamazlariGuncelle,
  localNamazlariGetir,
  localTarihAraligindakiNamazlariGetir,
  localVerileriSenkronizasyonIcinAl,
  kilinanVakitleriAl,
} from '../LocalNamazServisi';

describe('LocalNamazServisi — eşzamanlı yazma (race condition)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('aynı gün için 5 namazın eşzamanlı güncellenmesi hepsini korur (lost update olmamalı)', async () => {
    const tarih = '2026-06-06';

    // Hepsi aynı anda: serileştirme yoksa hepsi {} okur, son yazan diğerlerini ezer.
    await Promise.all(
      NAMAZ_ISIMLERI.map((ad) => localNamazDurumunuGuncelle(tarih, ad, true))
    );

    const sonuc = await localNamazlariGetir(tarih);
    const namazlar = sonuc.veri!.namazlar;
    for (const ad of NAMAZ_ISIMLERI) {
      expect(namazlar.find((n) => n.namazAdi === ad)?.tamamlandi).toBe(true);
    }
  });

  it('tekil ve toplu güncelleme eşzamanlı çalıştığında veri tutarlı kalır', async () => {
    const tarih = '2026-06-07';

    await Promise.all([
      localTumNamazlariGuncelle(tarih, true),
      localNamazDurumunuGuncelle(tarih, NamazAdi.Sabah, true),
      localNamazDurumunuGuncelle(tarih, NamazAdi.Yatsi, true),
    ]);

    const sonuc = await localNamazlariGetir(tarih);
    const namazlar = sonuc.veri!.namazlar;
    // Sıralı kuyruk sayesinde son durumda Sabah ve Yatsı kesin true olmalı.
    expect(namazlar.find((n) => n.namazAdi === NamazAdi.Sabah)?.tamamlandi).toBe(true);
    expect(namazlar.find((n) => n.namazAdi === NamazAdi.Yatsi)?.tamamlandi).toBe(true);
  });
});

describe('LocalNamazServisi — kilinanVakitleriAl', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('kayıt yoksa boş dizi döner', async () => {
    expect(await kilinanVakitleriAl('2026-06-07')).toEqual([]);
  });

  it('kayıtlı vakitleri doğru storage key ile okur', async () => {
    const anahtar = `${DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI}_kilinan_2026-06-07`;
    await AsyncStorage.setItem(anahtar, JSON.stringify(['ogle', 'ikindi']));
    expect(await kilinanVakitleriAl('2026-06-07')).toEqual(['ogle', 'ikindi']);
  });

  it('bozuk JSON gelirse boş dizi döner (çökmemeli)', async () => {
    const anahtar = `${DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI}_kilinan_2026-06-07`;
    await AsyncStorage.setItem(anahtar, '{bozuk-json');
    expect(await kilinanVakitleriAl('2026-06-07')).toEqual([]);
  });

  // Geçerli JSON ama dizi DEĞİL (obje/sayı/string): Array.isArray kapısı [] döndürmeli.
  // Downstream .includes/.map çağrıları crash etmesin diye kritik bir savunma dalı.
  it('geçerli JSON ama dizi değilse (obje) boş dizi döner', async () => {
    const anahtar = `${DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI}_kilinan_2026-06-07`;
    await AsyncStorage.setItem(anahtar, JSON.stringify({ ogle: true }));
    expect(await kilinanVakitleriAl('2026-06-07')).toEqual([]);
  });

  it('geçerli JSON ama dizi değilse (sayı) boş dizi döner', async () => {
    const anahtar = `${DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI}_kilinan_2026-06-07`;
    await AsyncStorage.setItem(anahtar, '42');
    expect(await kilinanVakitleriAl('2026-06-07')).toEqual([]);
  });
});

describe('LocalNamazServisi — okuma kontratı ve round-trip', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('kayıt yokken 5 namazı tamamlandi:false ile döndürür', async () => {
    const sonuc = await localNamazlariGetir('2026-06-10');
    expect(sonuc.basarili).toBe(true);
    const namazlar = sonuc.veri!.namazlar;
    // NAMAZ_ISIMLERI tam 5 vakit (Sabah, Öğle, İkindi, Akşam, Yatsı) — Güneş namaz değil.
    expect(namazlar).toHaveLength(NAMAZ_ISIMLERI.length);
    expect(namazlar.every((n) => n.tamamlandi === false)).toBe(true);
    expect(namazlar.map((n) => n.namazAdi)).toEqual([...NAMAZ_ISIMLERI]);
  });

  // Ana namaz verisi (NAMAZ_VERILERI) bozuksa tumVerileriAl {} döner; servis çökmeden
  // 5 namazı tamamlandi:false ile döndürmeli. (kilinanVakitleriAl değil, asıl okuma yolu.)
  it('NAMAZ_VERILERI bozuk JSON ise çökmeden 5 namazı false döndürür', async () => {
    await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.NAMAZ_VERILERI, '{bozuk-json');
    const sonuc = await localNamazlariGetir('2026-06-10');
    expect(sonuc.basarili).toBe(true);
    const namazlar = sonuc.veri!.namazlar;
    expect(namazlar).toHaveLength(NAMAZ_ISIMLERI.length);
    expect(namazlar.every((n) => n.tamamlandi === false)).toBe(true);
  });

  // Round-trip kontratı: tek namaz işaretlenince SADECE o namaz true, diğer 4'ü false kalmalı.
  it('tek namaz işaretlenince sadece o namaz true, diğerleri false kalır (yaz->oku)', async () => {
    const tarih = '2026-06-11';
    await localNamazDurumunuGuncelle(tarih, NamazAdi.Ikindi, true);

    const sonuc = await localNamazlariGetir(tarih);
    const namazlar = sonuc.veri!.namazlar;
    for (const ad of NAMAZ_ISIMLERI) {
      const beklenen = ad === NamazAdi.Ikindi;
      expect(namazlar.find((n) => n.namazAdi === ad)?.tamamlandi).toBe(beklenen);
    }
  });

  // İşaretlemenin geri alınması (true -> false) da aynı gün için doğru yansımalı.
  it('namaz true yapılıp sonra false yapılınca okuma false döndürür', async () => {
    const tarih = '2026-06-12';
    await localNamazDurumunuGuncelle(tarih, NamazAdi.Aksam, true);
    await localNamazDurumunuGuncelle(tarih, NamazAdi.Aksam, false);

    const sonuc = await localNamazlariGetir(tarih);
    const aksam = sonuc.veri!.namazlar.find((n) => n.namazAdi === NamazAdi.Aksam);
    expect(aksam?.tamamlandi).toBe(false);
  });

  // Farklı tarihlerin birbirini ezmemesi (read-modify-write doğruluğu).
  it('bir günü işaretlemek başka günün verisini ezmez', async () => {
    await localNamazDurumunuGuncelle('2026-06-13', NamazAdi.Sabah, true);
    await localNamazDurumunuGuncelle('2026-06-14', NamazAdi.Yatsi, true);

    const gun1 = await localNamazlariGetir('2026-06-13');
    const gun2 = await localNamazlariGetir('2026-06-14');

    expect(gun1.veri!.namazlar.find((n) => n.namazAdi === NamazAdi.Sabah)?.tamamlandi).toBe(true);
    expect(gun1.veri!.namazlar.find((n) => n.namazAdi === NamazAdi.Yatsi)?.tamamlandi).toBe(false);
    expect(gun2.veri!.namazlar.find((n) => n.namazAdi === NamazAdi.Yatsi)?.tamamlandi).toBe(true);
    expect(gun2.veri!.namazlar.find((n) => n.namazAdi === NamazAdi.Sabah)?.tamamlandi).toBe(false);
  });
});

describe('LocalNamazServisi — yazma kuyruğu dayanıklılığı (hata izolasyonu)', () => {
  // Orijinal setItem referansını saklayıp her testten sonra GERİ YÜKLEMEK kritik:
  // jest.spyOn(...).mockRejectedValueOnce gerçek implementasyonu kalıcı olarak
  // gölgeleyip sonraki testlerde storage'ı sessizce bozuyor (yazmalar düşmüyor).
  // Bu yüzden setItem'i manuel sarıp ilk çağrıda fırlatıyor, sonrasında gerçek
  // implementasyona delege ediyor; afterEach ile orijinali aynen geri koyuyoruz.
  const orijinalSetItem = AsyncStorage.setItem;

  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  afterEach(() => {
    (AsyncStorage as { setItem: typeof orijinalSetItem }).setItem = orijinalSetItem;
  });

  /**
   * setItem'in YALNIZCA ilk çağrısında verilen hatayı fırlatan, sonraki tüm
   * çağrılarda gerçek (kalıcı) implementasyona delege eden bir sarmalayıcı kurar.
   */
  const ilkSetItemdeHataFirlat = (mesaj: string): void => {
    let ilkCagri = true;
    (AsyncStorage as { setItem: typeof orijinalSetItem }).setItem = jest.fn(
      async (...args: Parameters<typeof orijinalSetItem>) => {
        if (ilkCagri) {
          ilkCagri = false;
          throw new Error(mesaj);
        }
        return orijinalSetItem(...args);
      }
    ) as typeof orijinalSetItem;
  };

  // En kritik garanti: bir yazma setItem hatasıyla başarısız olsa bile { basarili:false }
  // döner, KUYRUK KIRILMAZ ve SONRAKİ yazma hâlâ çalışıp veriyi kalıcı yapar.
  it('bir yazma setItem hatasıyla başarısız olsa bile kuyruk ölmez, sonraki yazma çalışır', async () => {
    ilkSetItemdeHataFirlat('disk dolu');

    // 1. yazma: setItem reject -> basarili:false, ama kuyruğu kırmamalı.
    const hataliSonuc = await localNamazDurumunuGuncelle('2026-06-15', NamazAdi.Ogle, true);
    expect(hataliSonuc.basarili).toBe(false);
    expect(hataliSonuc.hata).toBe('disk dolu');

    // 2. yazma: artık setItem normal çalışır -> başarılı olmalı (kuyruk ölmedi).
    const ikinciSonuc = await localNamazDurumunuGuncelle('2026-06-15', NamazAdi.Ikindi, true);
    expect(ikinciSonuc.basarili).toBe(true);

    // Kalıcılık: ikinci yazma gerçekten storage'a düşmüş olmalı.
    const okunan = await localNamazlariGetir('2026-06-15');
    expect(okunan.veri!.namazlar.find((n) => n.namazAdi === NamazAdi.Ikindi)?.tamamlandi).toBe(true);
  });

  // Toplu güncelleme yolu da aynı hata sözleşmesini izlemeli.
  it('localTumNamazlariGuncelle setItem hatasında basarili:false döner ve kuyruğu kırmaz', async () => {
    ilkSetItemdeHataFirlat('yazma hatası');

    const hataliSonuc = await localTumNamazlariGuncelle('2026-06-16', true);
    expect(hataliSonuc.basarili).toBe(false);
    expect(hataliSonuc.hata).toBe('yazma hatası');

    const sonrakiSonuc = await localNamazDurumunuGuncelle('2026-06-16', NamazAdi.Sabah, true);
    expect(sonrakiSonuc.basarili).toBe(true);

    // Kalıcılık: kuyruk ölmediği için sonraki yazma storage'a düşmüş olmalı.
    const okunan = await localNamazlariGetir('2026-06-16');
    expect(okunan.veri!.namazlar.find((n) => n.namazAdi === NamazAdi.Sabah)?.tamamlandi).toBe(true);
  });
});

describe('LocalNamazServisi — localTarihAraligindakiNamazlariGetir', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('tek günlük aralık (baslangic === bitis) yalnız o günü döndürür', async () => {
    const sonuc = await localTarihAraligindakiNamazlariGetir('2026-06-10', '2026-06-10');
    expect(sonuc.basarili).toBe(true);
    expect(sonuc.veri).toHaveLength(1);
    expect(sonuc.veri![0].tarih).toBe('2026-06-10');
    expect(sonuc.veri![0].namazlar).toHaveLength(NAMAZ_ISIMLERI.length);
  });

  it('çok günlük aralıkta tüm ardışık günleri sırayla üretir', async () => {
    const sonuc = await localTarihAraligindakiNamazlariGetir('2026-06-10', '2026-06-13');
    expect(sonuc.veri!.map((g) => g.tarih)).toEqual([
      '2026-06-10',
      '2026-06-11',
      '2026-06-12',
      '2026-06-13',
    ]);
  });

  // Ay sonu -> sonraki ay geçişi (gunEkle aritmetiği): 06-30 -> 07-01.
  it('ay sonu sınırında sonraki aya doğru geçer (2026-06-30 -> 2026-07-01)', async () => {
    const sonuc = await localTarihAraligindakiNamazlariGetir('2026-06-30', '2026-07-01');
    expect(sonuc.veri!.map((g) => g.tarih)).toEqual(['2026-06-30', '2026-07-01']);
  });

  // Artık yıl sınırı: 2024 Şubat 28 -> 29 -> Mart 1 (29 Şubat var olmalı).
  it('artık yıl Şubat sınırını doğru aşar (2024-02-28 -> 02-29 -> 03-01)', async () => {
    const sonuc = await localTarihAraligindakiNamazlariGetir('2024-02-28', '2024-03-01');
    expect(sonuc.veri!.map((g) => g.tarih)).toEqual([
      '2024-02-28',
      '2024-02-29',
      '2024-03-01',
    ]);
  });

  // Yıl sınırı: 2025-12-31 -> 2026-01-01.
  it('yıl sınırında sonraki yıla doğru geçer (2025-12-31 -> 2026-01-01)', async () => {
    const sonuc = await localTarihAraligindakiNamazlariGetir('2025-12-31', '2026-01-01');
    expect(sonuc.veri!.map((g) => g.tarih)).toEqual(['2025-12-31', '2026-01-01']);
  });

  // baslangic > bitis: while koşulu hiç girmez -> boş dizi (çökmeden).
  it('baslangic > bitis ise boş dizi döner', async () => {
    const sonuc = await localTarihAraligindakiNamazlariGetir('2026-06-15', '2026-06-10');
    expect(sonuc.basarili).toBe(true);
    expect(sonuc.veri).toEqual([]);
  });

  it('aralıktaki kayıtlı işaretler doğru güne yansır', async () => {
    await localNamazDurumunuGuncelle('2026-06-11', NamazAdi.Ogle, true);

    const sonuc = await localTarihAraligindakiNamazlariGetir('2026-06-10', '2026-06-12');
    const gun11 = sonuc.veri!.find((g) => g.tarih === '2026-06-11')!;
    const gun10 = sonuc.veri!.find((g) => g.tarih === '2026-06-10')!;

    expect(gun11.namazlar.find((n) => n.namazAdi === NamazAdi.Ogle)?.tamamlandi).toBe(true);
    expect(gun10.namazlar.find((n) => n.namazAdi === NamazAdi.Ogle)?.tamamlandi).toBe(false);
  });
});

describe('LocalNamazServisi — localVerileriSenkronizasyonIcinAl', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('kayıt yokken boş dizi döner', async () => {
    expect(await localVerileriSenkronizasyonIcinAl()).toEqual([]);
  });

  it('yazılan namaz işaretlerini düz {tarih, namazAdi, tamamlandi} listesine çevirir', async () => {
    await localNamazDurumunuGuncelle('2026-06-20', NamazAdi.Sabah, true);
    await localNamazDurumunuGuncelle('2026-06-20', NamazAdi.Yatsi, false);

    const sonuc = await localVerileriSenkronizasyonIcinAl();

    expect(sonuc).toContainEqual({ tarih: '2026-06-20', namazAdi: NamazAdi.Sabah, tamamlandi: true });
    expect(sonuc).toContainEqual({ tarih: '2026-06-20', namazAdi: NamazAdi.Yatsi, tamamlandi: false });
  });

  // NAMAZ_ISIMLERI dışındaki anahtarlar (ör. 'gunes' veya bozuk anahtar) filtrelenmeli.
  it('NAMAZ_ISIMLERI dışındaki anahtarları (ör. gunes) düzleştirmeye dahil etmez', async () => {
    // Storage'a manuel olarak geçerli bir namaz + namaz olmayan bir anahtar yaz.
    await AsyncStorage.setItem(
      DEPOLAMA_ANAHTARLARI.NAMAZ_VERILERI,
      JSON.stringify({
        '2026-06-21': {
          [NamazAdi.Ogle]: true,
          gunes: true, // namaz değil — atlanmalı
          rastgele: false, // bilinmeyen anahtar — atlanmalı
        },
      })
    );

    const sonuc = await localVerileriSenkronizasyonIcinAl();

    expect(sonuc).toEqual([{ tarih: '2026-06-21', namazAdi: NamazAdi.Ogle, tamamlandi: true }]);
    expect(sonuc.some((e) => (e.namazAdi as string) === 'gunes')).toBe(false);
    expect(sonuc.some((e) => (e.namazAdi as string) === 'rastgele')).toBe(false);
  });

  it('birden fazla tarihteki işaretleri tek listede toplar', async () => {
    await localNamazDurumunuGuncelle('2026-06-22', NamazAdi.Ikindi, true);
    await localNamazDurumunuGuncelle('2026-06-23', NamazAdi.Aksam, true);

    const sonuc = await localVerileriSenkronizasyonIcinAl();

    expect(sonuc).toContainEqual({ tarih: '2026-06-22', namazAdi: NamazAdi.Ikindi, tamamlandi: true });
    expect(sonuc).toContainEqual({ tarih: '2026-06-23', namazAdi: NamazAdi.Aksam, tamamlandi: true });
  });
});

describe('LocalNamazServisi — gun-bazli goc (Faz 1)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('eski tek-blob ilk erisimde gun-anahtarlarina tasinir ve eski blob SILINMEZ', async () => {
    await AsyncStorage.setItem(
      DEPOLAMA_ANAHTARLARI.NAMAZ_VERILERI,
      JSON.stringify({
        '2026-03-01': { [NamazAdi.Sabah]: true, [NamazAdi.Ogle]: true },
        '2026-03-02': { [NamazAdi.Yatsi]: true },
      })
    );

    // Ilk erisim gocu tetikler
    const g1 = await localNamazlariGetir('2026-03-01');
    expect(g1.veri!.namazlar.find((n) => n.namazAdi === NamazAdi.Sabah)?.tamamlandi).toBe(true);
    expect(g1.veri!.namazlar.find((n) => n.namazAdi === NamazAdi.Ogle)?.tamamlandi).toBe(true);

    // Gun-anahtari yazilmis olmali
    expect(await AsyncStorage.getItem('namaz_gun_2026-03-01')).not.toBeNull();
    // Eski blob SILINMEMIS olmali (veri-kaybi korumasi)
    expect(await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.NAMAZ_VERILERI)).not.toBeNull();
    // Migrasyon bayragi set edilmis
    expect(await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.NAMAZ_GUN_MIGRASYON)).toBe('1');

    // Ikinci gun de tasinmis
    const g2 = await localNamazlariGetir('2026-03-02');
    expect(g2.veri!.namazlar.find((n) => n.namazAdi === NamazAdi.Yatsi)?.tamamlandi).toBe(true);
  });

  it('goc idempotent: goc sonrasi yeni isaret eski blob tarafindan EZILMEZ', async () => {
    await AsyncStorage.setItem(
      DEPOLAMA_ANAHTARLARI.NAMAZ_VERILERI,
      JSON.stringify({ '2026-03-05': { [NamazAdi.Sabah]: true } })
    );

    await localNamazlariGetir('2026-03-05'); // ilk goc
    await localNamazDurumunuGuncelle('2026-03-05', NamazAdi.Ogle, true); // gocten sonra yeni isaret

    const g = await localNamazlariGetir('2026-03-05'); // migrasyonyiGarantile yine cagrilir (no-op)
    expect(g.veri!.namazlar.find((n) => n.namazAdi === NamazAdi.Sabah)?.tamamlandi).toBe(true);
    expect(g.veri!.namazlar.find((n) => n.namazAdi === NamazAdi.Ogle)?.tamamlandi).toBe(true);
  });

  it('goc edilen veri senkronizasyon listesine de yansir', async () => {
    await AsyncStorage.setItem(
      DEPOLAMA_ANAHTARLARI.NAMAZ_VERILERI,
      JSON.stringify({ '2026-03-08': { [NamazAdi.Ikindi]: true } })
    );

    const sonuc = await localVerileriSenkronizasyonIcinAl();
    expect(sonuc).toContainEqual({ tarih: '2026-03-08', namazAdi: NamazAdi.Ikindi, tamamlandi: true });
  });
});
