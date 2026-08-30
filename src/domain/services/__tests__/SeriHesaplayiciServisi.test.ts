import {
  seriHesapla,
  bosSeriDurumuOlustur,
  namazGunuHesapla,
  gunTamMi,
  oncekiGunuAl,
} from '../SeriHesaplayiciServisi';
import { NamazVaktiHesaplayiciServisi } from '../NamazVaktiHesaplayiciServisi';
import {
  SeriDurumu,
  SeriAyarlari,
  OzelGunAyarlari,
  VARSAYILAN_SERI_AYARLARI,
} from '../../../core/types/SeriTipleri';
import { GunlukNamazlar } from '../../../core/types';
import * as TarihYardimcisi from '../../../core/utils/TarihYardimcisi';

import { NamazAdi } from '../../../core/constants/UygulamaSabitleri';

// Tarih yardimcisini gercek haliyle kullanalim
const { tarihiISOFormatinaCevir } = TarihYardimcisi;

describe('SeriHesaplayiciServisi Unit Testleri', () => {
  let varsayilanAyarlar: SeriAyarlari;

  beforeEach(() => {
    varsayilanAyarlar = { ...VARSAYILAN_SERI_AYARLARI, tamGunEsigi: 5 };
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

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

  const eksikNamazlar = (tarih: string): GunlukNamazlar => ({
    tarih,
    namazlar: [
      { namazAdi: NamazAdi.Sabah, tamamlandi: true, tarih },
      { namazAdi: NamazAdi.Ogle, tamamlandi: false, tarih },
      { namazAdi: NamazAdi.Ikindi, tamamlandi: true, tarih },
      { namazAdi: NamazAdi.Aksam, tamamlandi: false, tarih },
      { namazAdi: NamazAdi.Yatsi, tamamlandi: true, tarih },
    ],
  });

  // Belirli sayida namaz kilinan gun uretir (eşik sınır testleri için).
  // 5 namaz sabit sirayla isaretlenir: ilk `kilinanSayi` adet tamamlandi=true.
  const nNamazlar = (tarih: string, kilinanSayi: number): GunlukNamazlar => {
    const tumVakitler = [
      NamazAdi.Sabah,
      NamazAdi.Ogle,
      NamazAdi.Ikindi,
      NamazAdi.Aksam,
      NamazAdi.Yatsi,
    ];
    return {
      tarih,
      namazlar: tumVakitler.map((namazAdi, i) => ({
        namazAdi,
        tamamlandi: i < kilinanSayi,
        tarih,
      })),
    };
  };

  test('Yeni baslayan kullanici icin ilk tam gunde seri 1 olmali', () => {
    const bugun = '2025-12-21';
    jest.setSystemTime(new Date(bugun + 'T12:00:00'));

    const sonuc = seriHesapla(null, tamNamazlar(bugun), null, varsayilanAyarlar);

    expect(sonuc.seriDurumu.mevcutSeri).toBe(1);
    expect(sonuc.seriDurumu.sonTamGun).toBe(bugun);
    expect(sonuc.seriDegisti).toBe(true);
  });

  test('Seri devam ederken tam gun kilindiginda seri artmali (dun argumani sonucu etkilemez)', () => {
    const dun = '2025-12-20';
    const bugun = '2025-12-21';
    jest.setSystemTime(new Date(bugun + 'T12:00:00'));

    const mevcutDurum: SeriDurumu = {
      ...bosSeriDurumuOlustur(),
      mevcutSeri: 5,
      sonTamGun: dun,
    };

    // Seri devami yalnizca sonTamGun===dun ile belirlenir (uretim satir 358:
    // seriDevamEdiyor = sonTamGun === dun). dunNamazlar parametresi devam mantiginda
    // KULLANILMAZ, dolayisiyla tam/null/eksik girdiler ozdes sonuc vermelidir.
    const ileTam = seriHesapla(mevcutDurum, tamNamazlar(bugun), tamNamazlar(dun), varsayilanAyarlar);
    const ileNull = seriHesapla(mevcutDurum, tamNamazlar(bugun), null, varsayilanAyarlar);
    const ileEksik = seriHesapla(mevcutDurum, tamNamazlar(bugun), eksikNamazlar(dun), varsayilanAyarlar);

    expect(ileTam.seriDurumu.mevcutSeri).toBe(6);
    expect(ileNull.seriDurumu.mevcutSeri).toBe(6); // dun verisi yokken de ayni
    expect(ileEksik.seriDurumu.mevcutSeri).toBe(6); // dun eksik kilinmis olsa da ayni

    expect(ileTam.seriDurumu.sonTamGun).toBe(bugun);
    expect(ileTam.seriDegisti).toBe(true);
  });

  test('Bir gun kactiginda seri bozulmali ve toparlanma modu baslamali (bugun tam ise)', () => {
    const evvelsiGun = '2025-12-19';
    const dun = '2025-12-20'; // Bu gun kacirildi
    const bugun = '2025-12-21'; // Bugun tam
    jest.setSystemTime(new Date(bugun + 'T12:00:00'));

    const mevcutDurum: SeriDurumu = {
      ...bosSeriDurumuOlustur(),
      mevcutSeri: 10,
      sonTamGun: evvelsiGun,
    };

    const sonuc = seriHesapla(mevcutDurum, tamNamazlar(bugun), eksikNamazlar(dun), varsayilanAyarlar);

    expect(sonuc.seriDurumu.toparlanmaDurumu).toBeDefined();
    expect(sonuc.seriDurumu.toparlanmaDurumu?.oncekiSeri).toBe(10);
    expect(sonuc.seriDurumu.toparlanmaDurumu?.tamamlananGun).toBe(1);
    // Toparlanma hedefi ayarlardan gelmeli (sabit deger degil): VARSAYILAN = 3 gun.
    // Sabit 3 yazmak yerine ayardan turetiyoruz ki ayar degisirse test kirilmasin.
    expect(sonuc.seriDurumu.toparlanmaDurumu?.hedefGunSayisi).toBe(
      varsayilanAyarlar.toparlanmaGunSayisi,
    );
    // Toparlanma bugunden baslamali (uretim satir 391: baslangicTarihi = bugun)
    expect(sonuc.seriDurumu.toparlanmaDurumu?.baslangicTarihi).toBe(bugun);
    expect(sonuc.seriBozuldu).toBe(true);
  });

  test('7+ gunluk seri bir gun kacirilinca toparlanma modu uretimden gelen hedefle baslamali', () => {
    // Toparlanmayi elle kurmak yerine GERCEK uretim akisiyla tetikliyoruz:
    // 10 gunluk seri + 1 gun bosluk + bugun tam => toparlanma modu acilir.
    const evvelsiGun = '2025-12-19';
    const dun = '2025-12-20'; // kacirildi
    const bugun = '2025-12-21';
    jest.setSystemTime(new Date(bugun + 'T12:00:00'));

    const mevcutDurum: SeriDurumu = {
      ...bosSeriDurumuOlustur(),
      mevcutSeri: 10,
      sonTamGun: evvelsiGun,
    };

    const sonuc = seriHesapla(mevcutDurum, tamNamazlar(bugun), eksikNamazlar(dun), varsayilanAyarlar);

    // Hedef, ayardan turetilir (uretim satir 392) — testte sabit sayi yazilmaz
    expect(sonuc.seriDurumu.toparlanmaDurumu?.hedefGunSayisi).toBe(
      varsayilanAyarlar.toparlanmaGunSayisi,
    );
    // Dokuman/hedef tutarliligi: kural 2 gundur (AGENTS.md + SeriTipleri varsayilani)
    expect(VARSAYILAN_SERI_AYARLARI.toparlanmaGunSayisi).toBe(2);
    expect(sonuc.seriDurumu.toparlanmaDurumu?.tamamlananGun).toBe(1); // bugun ilk gun
    expect(sonuc.seriDurumu.toparlanmaDurumu?.oncekiSeri).toBe(10);
    expect(sonuc.seriBozuldu).toBe(true);
  });

  test('Toparlanmada hedef gun sayisi kadar tam gun kilindiginda eski seri kurtarilmali', () => {
    const bugun = '2025-12-25';
    jest.setSystemTime(new Date(bugun + 'T12:00:00'));

    // State'i uretimle uyumlu kur: hedefin son gunu bugun olsun (tamamlanan = hedef - 1)
    const mevcutDurum: SeriDurumu = {
      ...bosSeriDurumuOlustur(),
      mevcutSeri: 0, // Toparlanma modunda mevcutSeri 0 olur (ozet haric)
      sonTamGun: '2025-12-24',
      toparlanmaDurumu: {
        tamamlananGun: varsayilanAyarlar.toparlanmaGunSayisi - 1, // bugun son gun
        baslangicTarihi: '2025-12-23',
        hedefGunSayisi: varsayilanAyarlar.toparlanmaGunSayisi, // kaynaktan turetilir
        oncekiSeri: 10,
      },
    };

    const sonuc = seriHesapla(mevcutDurum, tamNamazlar(bugun), null, varsayilanAyarlar);

    expect(sonuc.toparlanmaBasarili).toBe(true);
    // Toparlanmada kilinan TUM gunler serinin uzerine eklenir: oncekiSeri (10) + hedef
    expect(sonuc.seriDurumu.mevcutSeri).toBe(10 + varsayilanAyarlar.toparlanmaGunSayisi);
    expect(sonuc.seriDurumu.toparlanmaDurumu).toBeNull();
  });

  test('Toparlanma hedef gununden ONCE (3 gunluk hedefte 2. gun) eski seri henuz kurtarilmaz', () => {
    const bugun = '2025-12-24';
    jest.setSystemTime(new Date(bugun + 'T12:00:00'));

    // Hedef ayardan gelir; "ortada bir gun" olabilmesi icin bu senaryo 3 gunluk hedef kurar
    const ucGunlukAyarlar: SeriAyarlari = { ...varsayilanAyarlar, toparlanmaGunSayisi: 3 };

    // hedef = 3, tamamlananGun = 1 => bugun 2. gun. Esik henuz dolmadi.
    const mevcutDurum: SeriDurumu = {
      ...bosSeriDurumuOlustur(),
      mevcutSeri: 0,
      sonTamGun: '2025-12-23',
      toparlanmaDurumu: {
        tamamlananGun: 1,
        baslangicTarihi: '2025-12-23',
        hedefGunSayisi: ucGunlukAyarlar.toparlanmaGunSayisi, // = 3
        oncekiSeri: 10,
      },
    };

    const sonuc = seriHesapla(mevcutDurum, tamNamazlar(bugun), null, ucGunlukAyarlar);

    // 2. gun tamamlandi ama hedef 3 oldugu icin toparlanma HENUZ bitmemeli
    expect(sonuc.toparlanmaBasarili).toBe(false);
    expect(sonuc.seriDurumu.toparlanmaDurumu).not.toBeNull();
    expect(sonuc.seriDurumu.toparlanmaDurumu?.tamamlananGun).toBe(2);
    expect(sonuc.seriDurumu.toparlanmaDurumu?.hedefGunSayisi).toBe(3);
    // Seri henuz kurtarilmadigi icin oncekiSeri'ye geri donulmedi
    expect(sonuc.seriDurumu.mevcutSeri).toBe(0);
  });

  test('Toparlanma modunda bir gun kacirilirsa seri tamamen sifirlanmali', () => {
    const dun = '2025-12-24';
    const bugun = '2025-12-25';
    jest.setSystemTime(new Date(bugun + 'T12:00:00'));

    const mevcutDurum: SeriDurumu = {
      ...bosSeriDurumuOlustur(),
      mevcutSeri: 0,
      sonTamGun: '2025-12-23', // Dun kacirildi (24)
      toparlanmaDurumu: {
        tamamlananGun: 2,
        baslangicTarihi: '2025-12-21',
        hedefGunSayisi: varsayilanAyarlar.toparlanmaGunSayisi, // = 3, kaynaktan turetilir
        oncekiSeri: 10,
      },
    };

    // Bugun eksik kilindi
    const sonuc = seriHesapla(mevcutDurum, eksikNamazlar(bugun), eksikNamazlar(dun), varsayilanAyarlar);

    // Duzeltilen bug sayesinde: Eger dun kacirildiysa (fark > 1) toparlanma bozulur
    expect(sonuc.seriDurumu.mevcutSeri).toBe(0);
    expect(sonuc.seriDurumu.toparlanmaDurumu).toBeNull();
    expect(sonuc.seriBozuldu).toBe(true);
  });

  test('Gun bitis saatinden once yapilan islemler bir onceki gune sayilmali', () => {
    const bugun = '2025-12-21';
    const geceYarisi = new Date(bugun + 'T02:00:00'); // Saat 02:00, gun bitisi 05:00

    const hesaplananGun = namazGunuHesapla(geceYarisi, '05:00');

    expect(hesaplananGun).toBe('2025-12-20');
  });

  test('UTC kaymasi testi - Gece yarisi islem yapildiginda yerel tarih kullanilmali', () => {
    // 2025-12-21 01:00 (Yerel) -> 2025-12-20 22:00 (UTC)
    // toISOString() 2025-12-20 dondurur, ama biz 21 olmasini (veya gun bitisine gore 20 olmasini) bekleriz
    const yerelTarih = new Date(2025, 11, 21, 1, 0, 0); // 21 Aralik 01:00

    const sonuc = tarihiISOFormatinaCevir(yerelTarih);
    expect(sonuc).toBe('2025-12-21');
  });

  // ==================== GAP 6: gunTamMi esik sinir davranisi ====================
  // 'Gun tam mi' karari tum seri hesabinin temelidir; uretim `kilinan >= esik` kullanir.
  // Esik degerinde true, bir altinda false olmali (off-by-one regresyonunu yakalar).
  describe('gunTamMi esik sinir davranisi', () => {
    test('tamGunEsigi=5 iken tam 5 namaz tam sayilmali (esikte true)', () => {
      expect(gunTamMi(nNamazlar('2026-06-15', 5), 5)).toBe(true);
    });

    test('tamGunEsigi=5 iken 4 namaz tam sayilMAMALI (esik altinda false)', () => {
      expect(gunTamMi(nNamazlar('2026-06-15', 4), 5)).toBe(false);
    });

    test('Dusuk esik (3) ile 3 namaz tam sayilmali, 2 namaz sayilmamali', () => {
      expect(gunTamMi(nNamazlar('2026-06-15', 3), 3)).toBe(true);
      expect(gunTamMi(nNamazlar('2026-06-15', 2), 3)).toBe(false);
    });

    test('Hic namaz yoksa veya veri null ise tam sayilmamali', () => {
      expect(gunTamMi(nNamazlar('2026-06-15', 0), 5)).toBe(false);
      expect(gunTamMi(null, 5)).toBe(false);
    });
  });

  // ==================== GAP 2: Gece yarisi (gun bitis saati) ucu uca seri akisi ====================
  // namazGunuHesapla birim olarak test edilse de, seriHesapla gun-bitis sinirinda HIC
  // calistirilmamis. Saat 02:00'de (gun bitisi 05:00) yapilan islem ONCEKI takvim gunune
  // sayilmali ve seriyi o gun uzerinden dogru islemeli.
  test('Saat 02:00 (gun bitisi 05:00) islemi onceki takvim gunune sayilmali ve seri o gune yazilmali', () => {
    // Yerel kurucu: 16 Haziran 2026 saat 02:00 -> gun bitisi 05:00 oncesi -> namaz gunu 15 Haziran
    jest.setSystemTime(new Date(2026, 5, 16, 2, 0, 0));

    const beklenenNamazGunu = '2026-06-15'; // 16'nin 02:00'i hala 15'in gunu
    const oncekiTamGun = '2026-06-14'; // serinin devami icin sonTamGun = namaz gununun dunu

    const mevcutDurum: SeriDurumu = {
      ...bosSeriDurumuOlustur(),
      mevcutSeri: 3,
      sonTamGun: oncekiTamGun,
    };

    // bugunNamazlar.tarih degil, sistem saati (new Date()) uzerinden namaz gunu hesaplanir
    const sonuc = seriHesapla(
      mevcutDurum,
      tamNamazlar(beklenenNamazGunu),
      tamNamazlar(oncekiTamGun),
      varsayilanAyarlar,
    );

    // Islem 16'ya degil, gun-bitisine gore 15'e yazilmali ve seri 3 -> 4 olmali
    expect(sonuc.seriDurumu.sonTamGun).toBe(beklenenNamazGunu);
    expect(sonuc.seriDurumu.mevcutSeri).toBe(4);
    expect(sonuc.seriDegisti).toBe(true);
  });

  // ==================== GAP 3: Toparlanma esigi (7) sinirinin iki tarafi ====================
  // 7+ gunluk seride gun kacirilinca toparlanma modu acilir; 7'nin altinda toparlanma YOK,
  // seri sifirdan (mevcutSeri=1) yeniden baslar. Bu kritik dallanma noktasinin her iki tarafi.
  test('6 gunluk seri (esik altinda) bir gun kacirilinca toparlanma YOK, seri 1e sifirlanmali', () => {
    const evvelsiGun = '2026-06-13';
    const dun = '2026-06-14'; // kacirildi
    const bugun = '2026-06-15';
    jest.setSystemTime(new Date(2026, 5, 15, 12, 0, 0));

    const mevcutDurum: SeriDurumu = {
      ...bosSeriDurumuOlustur(),
      mevcutSeri: 6, // 7'nin ALTINDA
      enUzunSeri: 6,
      sonTamGun: evvelsiGun,
    };

    const sonuc = seriHesapla(mevcutDurum, tamNamazlar(bugun), eksikNamazlar(dun), varsayilanAyarlar);

    // 7 altinda: toparlanma acilmaz, seri sifirdan 1'e baslar
    expect(sonuc.seriDurumu.toparlanmaDurumu).toBeNull();
    expect(sonuc.seriDurumu.mevcutSeri).toBe(1);
    expect(sonuc.seriDurumu.sonTamGun).toBe(bugun);
    expect(sonuc.seriBozuldu).toBe(true);
    // Yeni seri puani (toparlanma degil): uretim satir 411 -> 10
    expect(sonuc.kazanilanPuan).toBe(10);
    // enUzunSeri korunmali (rekor sifir altina kosturulmaz)
    expect(sonuc.seriDurumu.enUzunSeri).toBe(6);
  });

  test('7 gunluk seri (esikte) bir gun kacirilinca toparlanma modu acilmali', () => {
    const evvelsiGun = '2026-06-13';
    const dun = '2026-06-14'; // kacirildi
    const bugun = '2026-06-15';
    jest.setSystemTime(new Date(2026, 5, 15, 12, 0, 0));

    const mevcutDurum: SeriDurumu = {
      ...bosSeriDurumuOlustur(),
      mevcutSeri: 7, // TAM esikte (>=7)
      enUzunSeri: 7,
      sonTamGun: evvelsiGun,
    };

    const sonuc = seriHesapla(mevcutDurum, tamNamazlar(bugun), eksikNamazlar(dun), varsayilanAyarlar);

    // 7'de toparlanma modu acilir
    expect(sonuc.seriDurumu.toparlanmaDurumu).not.toBeNull();
    expect(sonuc.seriDurumu.toparlanmaDurumu?.oncekiSeri).toBe(7);
    expect(sonuc.seriDurumu.toparlanmaDurumu?.tamamlananGun).toBe(1); // bugun ilk gun
    expect(sonuc.seriBozuldu).toBe(true);
    // Toparlanma baslangic puani: uretim satir 398 -> 5
    expect(sonuc.kazanilanPuan).toBe(5);
  });

  // ==================== GAP 4: yeniHedefTamamlandi (hedef/rozet tetikleme) ====================
  // 6->7 'Ilk Hafta', 20->21 'Aliskanlik Ustasi' hedefi dondurulmeli (tamamlananHedefiBul).
  // Gamification'in cekirdegi; yanlis esikte hedef tetiklenmezse sessizce kaybolur.
  test('Seri 6->7 olunca Ilk Hafta hedefi tamamlanmali', () => {
    const dun = '2026-06-14';
    const bugun = '2026-06-15';
    jest.setSystemTime(new Date(2026, 5, 15, 12, 0, 0));

    const mevcutDurum: SeriDurumu = {
      ...bosSeriDurumuOlustur(),
      mevcutSeri: 6,
      enUzunSeri: 6,
      sonTamGun: dun, // seri devam ediyor
    };

    const sonuc = seriHesapla(mevcutDurum, tamNamazlar(bugun), tamNamazlar(dun), varsayilanAyarlar);

    expect(sonuc.seriDurumu.mevcutSeri).toBe(7);
    expect(sonuc.yeniHedefTamamlandi).not.toBeNull();
    expect(sonuc.yeniHedefTamamlandi?.gun).toBe(7);
    expect(sonuc.yeniHedefTamamlandi?.ad).toBe('İlk Hafta');
  });

  test('Seri 20->21 olunca Aliskanlik Ustasi hedefi tamamlanmali', () => {
    const dun = '2026-06-14';
    const bugun = '2026-06-15';
    jest.setSystemTime(new Date(2026, 5, 15, 12, 0, 0));

    const mevcutDurum: SeriDurumu = {
      ...bosSeriDurumuOlustur(),
      mevcutSeri: 20,
      enUzunSeri: 20,
      sonTamGun: dun,
    };

    const sonuc = seriHesapla(mevcutDurum, tamNamazlar(bugun), tamNamazlar(dun), varsayilanAyarlar);

    expect(sonuc.seriDurumu.mevcutSeri).toBe(21);
    expect(sonuc.yeniHedefTamamlandi?.gun).toBe(21);
    expect(sonuc.yeniHedefTamamlandi?.ad).toBe('Alışkanlık Ustası');
  });

  test('Hedef sinirini gecmeyen normal artisla (5->6) hedef tamamlanmamali', () => {
    const dun = '2026-06-14';
    const bugun = '2026-06-15';
    jest.setSystemTime(new Date(2026, 5, 15, 12, 0, 0));

    const mevcutDurum: SeriDurumu = {
      ...bosSeriDurumuOlustur(),
      mevcutSeri: 5,
      enUzunSeri: 5,
      sonTamGun: dun,
    };

    const sonuc = seriHesapla(mevcutDurum, tamNamazlar(bugun), tamNamazlar(dun), varsayilanAyarlar);

    expect(sonuc.seriDurumu.mevcutSeri).toBe(6);
    expect(sonuc.yeniHedefTamamlandi).toBeNull();
  });

  // ==================== GAP 5: Toparlanmanin orta gunu (devam) ====================
  // Mevcut testler hedef-tamam ve hedef-on-1-gun (durum kurarak) durumuna bakar,
  // ama 'devam' dalinin (satir 322-335) sonTamGun guncellemesi ve 10 puani assert edilmiyor.
  test('Toparlanmanin orta gununde tamamlananGun artmali, sonTamGun bugune kaymali, 10 puan verilmeli', () => {
    const dun = '2026-06-14';
    const bugun = '2026-06-15';
    jest.setSystemTime(new Date(2026, 5, 15, 12, 0, 0));

    // "Orta gun" ancak hedef 2'den buyukken vardir -> bu senaryo 3 gunluk hedef kurar
    const ucGunlukAyarlar: SeriAyarlari = { ...varsayilanAyarlar, toparlanmaGunSayisi: 3 };

    // hedef = 3, tamamlananGun = 1 => bugun 2. gun (henuz hedefe ulasilmadi)
    const mevcutDurum: SeriDurumu = {
      ...bosSeriDurumuOlustur(),
      mevcutSeri: 0,
      sonTamGun: dun,
      toparlanmaDurumu: {
        tamamlananGun: 1,
        baslangicTarihi: '2026-06-13',
        hedefGunSayisi: ucGunlukAyarlar.toparlanmaGunSayisi, // = 3
        oncekiSeri: 10,
      },
    };

    const sonuc = seriHesapla(mevcutDurum, tamNamazlar(bugun), null, ucGunlukAyarlar);

    // Devam dali: hedefe ulasilmadi, ama ilerleme kaydedilmeli
    expect(sonuc.toparlanmaBasarili).toBe(false);
    expect(sonuc.seriDurumu.toparlanmaDurumu?.tamamlananGun).toBe(2);
    expect(sonuc.seriDurumu.toparlanmaDurumu?.oncekiSeri).toBe(10); // korunmali
    expect(sonuc.seriDurumu.sonTamGun).toBe(bugun); // ilerleme bugune yazilmali
    expect(sonuc.kazanilanPuan).toBe(10); // toparlanma gun puani
    expect(sonuc.seriDegisti).toBe(true);
  });

  // ==================== GAP 7: Idempotency / cift sayim guvenligi ====================
  // Ayni gun icin seriHesapla iki kez cagrilirsa (durum.sonTamGun === bugun erken-donus,
  // satir 287) seri TEKRAR artmamali. Cift sayim/yaris durumuna karsi kritik garanti.
  test('Ayni gun icin ikinci kez cagrilinca seri tekrar artmamali (idempotent)', () => {
    const dun = '2026-06-14';
    const bugun = '2026-06-15';
    jest.setSystemTime(new Date(2026, 5, 15, 12, 0, 0));

    const mevcutDurum: SeriDurumu = {
      ...bosSeriDurumuOlustur(),
      mevcutSeri: 4,
      enUzunSeri: 4,
      sonTamGun: dun,
    };

    // Ilk cagri: seri 4 -> 5
    const ilk = seriHesapla(mevcutDurum, tamNamazlar(bugun), tamNamazlar(dun), varsayilanAyarlar);
    expect(ilk.seriDurumu.mevcutSeri).toBe(5);
    expect(ilk.seriDurumu.sonTamGun).toBe(bugun);

    // Ikinci cagri: ilk sonucun durumu ile (sonTamGun === bugun) -> degisiklik olmamali
    const ikinci = seriHesapla(ilk.seriDurumu, tamNamazlar(bugun), tamNamazlar(dun), varsayilanAyarlar);
    expect(ikinci.seriDurumu.mevcutSeri).toBe(5); // 6'ya CIKMAMALI
    expect(ikinci.seriDegisti).toBe(false);
    expect(ikinci.kazanilanPuan).toBe(0);
  });

  // ==================== GAP 8: kazanilanPuan referans degerleri ====================
  // Puan/seviye sisteminin dogrulugu. Normal tam gun = 10 + yeniSeri (uretim satir 378).
  // (Toparlanma bonusu=25, baslangic=5, gun=10 sirasiyla GAP3/GAP5 ve mevcut testlerde.)
  test('Normal tam gunde kazanilanPuan 10 + yeniSeri olmali', () => {
    const dun = '2026-06-14';
    const bugun = '2026-06-15';
    jest.setSystemTime(new Date(2026, 5, 15, 12, 0, 0));

    const mevcutDurum: SeriDurumu = {
      ...bosSeriDurumuOlustur(),
      mevcutSeri: 4,
      enUzunSeri: 4,
      sonTamGun: dun,
    };

    const sonuc = seriHesapla(mevcutDurum, tamNamazlar(bugun), tamNamazlar(dun), varsayilanAyarlar);

    // yeniSeri = 5 => puan = 10 + 5 = 15
    expect(sonuc.seriDurumu.mevcutSeri).toBe(5);
    expect(sonuc.kazanilanPuan).toBe(15);
  });

  test('Toparlanma basarili olunca 25 bonus puan verilmeli', () => {
    const dun = '2026-06-14';
    const bugun = '2026-06-15';
    jest.setSystemTime(new Date(2026, 5, 15, 12, 0, 0));

    // bugun hedefin SON gunu olsun (tamamlanan = hedef - 1) -> toparlanma tamamlanir
    const mevcutDurum: SeriDurumu = {
      ...bosSeriDurumuOlustur(),
      mevcutSeri: 0,
      sonTamGun: dun,
      toparlanmaDurumu: {
        tamamlananGun: varsayilanAyarlar.toparlanmaGunSayisi - 1,
        baslangicTarihi: '2026-06-13',
        hedefGunSayisi: varsayilanAyarlar.toparlanmaGunSayisi,
        oncekiSeri: 10,
      },
    };

    const sonuc = seriHesapla(mevcutDurum, tamNamazlar(bugun), null, varsayilanAyarlar);

    expect(sonuc.toparlanmaBasarili).toBe(true);
    expect(sonuc.seriDurumu.mevcutSeri).toBe(10 + varsayilanAyarlar.toparlanmaGunSayisi);
    expect(sonuc.kazanilanPuan).toBe(25); // toparlanma bonusu
  });

  // ==================== GAP 1: Ozel gun (mazeret) dondurma/cozme ====================
  // ozelGunAktifMi + ozelGunAyarlari ile seri dondurulur (dondurulduMu=true) ve ozel gun
  // bittiginde seri BOZULMADAN cozulur (sonTamGun=dun ile devam). Kritik ve karmasik dal.
  describe('Ozel gun (mazeret) dondurma mantigi', () => {
    const ozelGunAyarlariOlustur = (
      aktif: boolean,
      baslangic: string,
      bitis: string,
    ): OzelGunAyarlari => ({
      ozelGunModuAktif: aktif,
      aktifOzelGun: aktif
        ? {
            id: 'test-ozel-gun',
            baslangicTarihi: baslangic,
            bitisTarihi: bitis,
            olusturulmaTarihi: '2026-06-01T00:00:00.000Z',
          }
        : null,
      gecmisKayitlar: [],
    });

    test('Ozel gun aktifken seri dondurulmali (dondurulduMu=true) ve mevcutSeri korunmali', () => {
      const bugun = '2026-06-15';
      jest.setSystemTime(new Date(2026, 5, 15, 12, 0, 0));

      const mevcutDurum: SeriDurumu = {
        ...bosSeriDurumuOlustur(),
        mevcutSeri: 8,
        enUzunSeri: 8,
        sonTamGun: '2026-06-14',
      };

      // Ozel gun bugunu kapsiyor
      const ozelGun = ozelGunAyarlariOlustur(true, '2026-06-15', '2026-06-17');

      // Bugun eksik kilinmis olsa bile seri BOZULMAMALI cunku dondurulmus
      const sonuc = seriHesapla(mevcutDurum, eksikNamazlar(bugun), null, varsayilanAyarlar, ozelGun);

      expect(sonuc.seriDurumu.dondurulduMu).toBe(true);
      expect(sonuc.seriDurumu.dondurulmaTarihi).toBe(bugun);
      expect(sonuc.seriDurumu.mevcutSeri).toBe(8); // korunmali, bozulmamali
      expect(sonuc.seriBozuldu).toBe(false);
      expect(sonuc.seriDegisti).toBe(true);
    });

    test('Ozel gun zaten dondurulmussa tekrar isaretlenmemeli (seriDegisti=false)', () => {
      const bugun = '2026-06-15';
      jest.setSystemTime(new Date(2026, 5, 15, 12, 0, 0));

      const mevcutDurum: SeriDurumu = {
        ...bosSeriDurumuOlustur(),
        mevcutSeri: 8,
        sonTamGun: '2026-06-14',
        dondurulduMu: true,
        dondurulmaTarihi: '2026-06-14',
      };

      const ozelGun = ozelGunAyarlariOlustur(true, '2026-06-13', '2026-06-17');

      const sonuc = seriHesapla(mevcutDurum, eksikNamazlar(bugun), null, varsayilanAyarlar, ozelGun);

      // Zaten dondurulmus -> ek bir degisiklik olmamali
      expect(sonuc.seriDegisti).toBe(false);
      expect(sonuc.seriDurumu.dondurulduMu).toBe(true);
    });

    test('Ozel gun bittiginde dondurma cozulmeli ve seri bozulmadan devam etmeli', () => {
      const bugun = '2026-06-15';
      jest.setSystemTime(new Date(2026, 5, 15, 12, 0, 0));

      // Onceden dondurulmus bir seri; bugun artik ozel gun DEGIL (cozulme gunu)
      const mevcutDurum: SeriDurumu = {
        ...bosSeriDurumuOlustur(),
        mevcutSeri: 5,
        enUzunSeri: 5,
        sonTamGun: '2026-06-10', // dondurma oncesi son tam gun
        dondurulduMu: true,
        dondurulmaTarihi: '2026-06-12',
      };

      // Ozel gun bugunu KAPSAMIYOR -> cozulme dali (uretim satir 268-281)
      const ozelGun = ozelGunAyarlariOlustur(true, '2026-06-11', '2026-06-14');

      // Bugun tam kilindi -> cozulme sonrasi seri devam etmeli
      const sonuc = seriHesapla(mevcutDurum, tamNamazlar(bugun), null, varsayilanAyarlar, ozelGun);

      // Dondurma cozuldu
      expect(sonuc.seriDurumu.dondurulduMu).toBe(false);
      expect(sonuc.seriDurumu.dondurulmaTarihi).toBeNull();
      // Cozulurken sonTamGun=dun yapildigi icin seri BOZULMADAN devam etti: 5 -> 6
      expect(sonuc.seriDurumu.mevcutSeri).toBe(6);
      expect(sonuc.seriDurumu.sonTamGun).toBe(bugun);
      expect(sonuc.seriBozuldu).toBe(false);
    });
  });
});

describe('SeriHesaplayiciServisi - Bug #4: ayni gun tam-alti dusurulunce geri sarma', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-14T12:00:00'));
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  const ayarlar: SeriAyarlari = { ...VARSAYILAN_SERI_AYARLARI, tamGunEsigi: 5 };
  const gun = (tarih: string, kilinan: number): GunlukNamazlar => ({
    tarih,
    namazlar: [NamazAdi.Sabah, NamazAdi.Ogle, NamazAdi.Ikindi, NamazAdi.Aksam, NamazAdi.Yatsi]
      .map((namazAdi, i) => ({ namazAdi, tamamlandi: i < kilinan, tarih })),
  });
  const baslangicDurumu = (sonTamGun: string): SeriDurumu => ({
    mevcutSeri: 5, enUzunSeri: 8, sonTamGun, seriBaslangici: '2026-06-09',
    toparlanmaDurumu: null, dondurulduMu: false, dondurulmaTarihi: null,
    sonGuncelleme: new Date().toISOString(),
  });

  test('5/5 sayilan gun ayni gun 4/5e dusurulunce mevcutSeri ve sonTamGun geri sarilir', () => {
    const bugun = namazGunuHesapla(new Date(), '05:00');
    const dun = oncekiGunuAl(bugun);

    const s1 = seriHesapla(baslangicDurumu(dun), gun(bugun, 5), null, ayarlar);
    expect(s1.seriDurumu.mevcutSeri).toBe(6);
    expect(s1.seriDurumu.sonTamGun).toBe(bugun);
    expect(s1.kazanilanPuan).toBeGreaterThan(0); // bugun seri/gun bonusu verildi

    const s2 = seriHesapla(s1.seriDurumu, gun(bugun, 4), null, ayarlar);
    expect(s2.seriDegisti).toBe(true);
    expect(s2.seriDurumu.mevcutSeri).toBe(5);
    expect(s2.seriDurumu.sonTamGun).toBe(dun);
    expect(s2.seriDurumu.enUzunSeri).toBe(8); // rekor dusurulmez
    // Faz 1b: bugun verilen bonus da geri alindi (negatif, esit miktar)
    expect(s2.kazanilanPuan).toBe(-(s1.kazanilanPuan));
  });

  test('geri aldiktan sonra tekrar 5/5 yapilinca yeniden sayilir (simetrik)', () => {
    const bugun = namazGunuHesapla(new Date(), '05:00');
    const dun = oncekiGunuAl(bugun);

    const s1 = seriHesapla(baslangicDurumu(dun), gun(bugun, 5), null, ayarlar);
    const s2 = seriHesapla(s1.seriDurumu, gun(bugun, 4), null, ayarlar);
    const s3 = seriHesapla(s2.seriDurumu, gun(bugun, 5), null, ayarlar);
    expect(s3.seriDurumu.mevcutSeri).toBe(6);
    expect(s3.seriDurumu.sonTamGun).toBe(bugun);
  });
});


describe('SeriHesaplayiciServisi - Toparlanmada ayni-gun geri-alimi (bayat snapshot regresyonu)', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  const gun = (tarih: string, kilinan: number): GunlukNamazlar => ({
    tarih,
    namazlar: [NamazAdi.Sabah, NamazAdi.Ogle, NamazAdi.Ikindi, NamazAdi.Aksam, NamazAdi.Yatsi]
      .map((namazAdi, i) => ({ namazAdi, tamamlandi: i < kilinan, tarih })),
  });

  /**
   * 22 gunluk seri -> 06-12 kacirildi -> toparlanmanin 1. gunu (06-13) tamamlandi.
   * Donen durum, kullanicinin ertesi gune (06-14) TASIDIGI gercek state'tir; icinde
   * 06-13'e ait "bugun oncesi" snapshot'i vardir (bayat snapshot kaynagi).
   */
  const toparlanmaninIkinciGunu = (ayarlar: SeriAyarlari): SeriDurumu => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-13T12:00:00'));
    const bozukSeri: SeriDurumu = {
      mevcutSeri: 22,
      enUzunSeri: 22,
      sonTamGun: '2026-06-11', // 06-12 kacirildi
      seriBaslangici: '2026-05-21',
      toparlanmaDurumu: null,
      dondurulduMu: false,
      dondurulmaTarihi: null,
      sonGuncelleme: new Date().toISOString(),
    };
    const ilkGun = seriHesapla(bozukSeri, gun('2026-06-13', 3), gun('2026-06-12', 0), ayarlar);
    expect(ilkGun.seriDurumu.toparlanmaDurumu?.tamamlananGun).toBe(1);

    // Ertesi gun
    jest.setSystemTime(new Date('2026-06-14T12:00:00'));
    return ilkGun.seriDurumu;
  };

  describe('hedef 2 gun (guncel kural): 2. gun toparlanmayi bitirir', () => {
    const ayarlar: SeriAyarlari = { ...VARSAYILAN_SERI_AYARLARI, tamGunEsigi: 3 };

    test('2. gun tam -> seri kurtarilir; ayni gun geri alininca toparlanmaya DONULUR', () => {
      const dunkuDurum = toparlanmaninIkinciGunu(ayarlar);

      const tam = seriHesapla(dunkuDurum, gun('2026-06-14', 3), gun('2026-06-13', 3), ayarlar);
      expect(tam.toparlanmaBasarili).toBe(true);
      expect(tam.seriDurumu.mevcutSeri).toBe(24); // 22 + toparlanmada kilinan 2 gun

      // Ayni gun bir namaz geri alinir -> 1/2'lik toparlanmaya geri sarilmali
      const geriAl = seriHesapla(tam.seriDurumu, gun('2026-06-14', 2), gun('2026-06-13', 3), ayarlar);
      expect(geriAl.seriDurumu.toparlanmaDurumu?.tamamlananGun).toBe(1);
      expect(geriAl.seriDurumu.toparlanmaDurumu?.oncekiSeri).toBe(22);
      expect(geriAl.seriDurumu.sonTamGun).toBe('2026-06-13');
    });

    test('geri alip tekrar isaretleyince seri YINE kurtarilir (yeni toparlanma baslamaz)', () => {
      const dunkuDurum = toparlanmaninIkinciGunu(ayarlar);

      const tam = seriHesapla(dunkuDurum, gun('2026-06-14', 3), gun('2026-06-13', 3), ayarlar);
      const geriAl = seriHesapla(tam.seriDurumu, gun('2026-06-14', 2), gun('2026-06-13', 3), ayarlar);
      const tekrar = seriHesapla(geriAl.seriDurumu, gun('2026-06-14', 3), gun('2026-06-13', 3), ayarlar);

      expect(tekrar.toparlanmaBasarili).toBe(true);
      expect(tekrar.seriDurumu.toparlanmaDurumu).toBeNull();
      expect(tekrar.seriDurumu.mevcutSeri).toBe(24);
      expect(tekrar.seriDurumu.sonTamGun).toBe('2026-06-14');
    });

    // NOBETCI: `toparlanmaSayisi` olay-tetiklemeli ve KALICI bir sayactir (rozet
    // kosulu: 3 kez toparlanma). Geri-alim toparlanmayi yeniden tamamlanabilir
    // yaptigi icin, geri sarma bildirilmezse isaretle/geri-al dongusu sayaci
    // sinirsizca sisirir ve rozet tek gunde farm edilebilir.
    test('BITEN toparlanma geri alininca `toparlanmaGeriAlindi` bildirilir', () => {
      const dunkuDurum = toparlanmaninIkinciGunu(ayarlar);

      const tam = seriHesapla(dunkuDurum, gun('2026-06-14', 3), gun('2026-06-13', 3), ayarlar);
      expect(tam.toparlanmaBasarili).toBe(true);
      expect(tam.toparlanmaGeriAlindi).toBe(false);

      const geriAl = seriHesapla(tam.seriDurumu, gun('2026-06-14', 2), gun('2026-06-13', 3), ayarlar);
      expect(geriAl.toparlanmaGeriAlindi).toBe(true);
      expect(geriAl.toparlanmaBasarili).toBe(false);
    });
  });

  describe('hedef 3 gun: toparlanmanin ORTA gunu geri alinip tekrar isaretlenir', () => {
    // Asil regresyon: onceki gunden kalan snapshot uygulanip toparlanma 2/N -> 1/N'e
    // dusuyor, hatta hedef gun sayisi guncel ayara gore YENIDEN kuruluyordu.
    const ayarlar: SeriAyarlari = {
      ...VARSAYILAN_SERI_AYARLARI,
      tamGunEsigi: 3,
      toparlanmaGunSayisi: 3,
    };

    test('2. gun geri alininca 1. gune donulur, toparlanma MODU korunur', () => {
      const dunkuDurum = toparlanmaninIkinciGunu(ayarlar);

      const tam = seriHesapla(dunkuDurum, gun('2026-06-14', 3), gun('2026-06-13', 3), ayarlar);
      expect(tam.seriDurumu.toparlanmaDurumu?.tamamlananGun).toBe(2);

      const geriAl = seriHesapla(tam.seriDurumu, gun('2026-06-14', 2), gun('2026-06-13', 3), ayarlar);
      expect(geriAl.seriDurumu.toparlanmaDurumu).not.toBeNull();
      expect(geriAl.seriDurumu.toparlanmaDurumu?.tamamlananGun).toBe(1);
      expect(geriAl.seriDurumu.toparlanmaDurumu?.oncekiSeri).toBe(22);
      expect(geriAl.seriDurumu.sonTamGun).toBe('2026-06-13');
    });

    test('geri alip tekrar isaretleyince toparlanma 2. gunde kalir, 1. gune SIFIRLANMAZ', () => {
      const dunkuDurum = toparlanmaninIkinciGunu(ayarlar);

      const tam = seriHesapla(dunkuDurum, gun('2026-06-14', 3), gun('2026-06-13', 3), ayarlar);
      const geriAl = seriHesapla(tam.seriDurumu, gun('2026-06-14', 2), gun('2026-06-13', 3), ayarlar);
      const tekrar = seriHesapla(geriAl.seriDurumu, gun('2026-06-14', 3), gun('2026-06-13', 3), ayarlar);

      expect(tekrar.seriDurumu.toparlanmaDurumu?.tamamlananGun).toBe(2);
      expect(tekrar.seriDurumu.toparlanmaDurumu?.hedefGunSayisi).toBe(3);
      expect(tekrar.seriDurumu.toparlanmaDurumu?.baslangicTarihi).toBe('2026-06-13');
      expect(tekrar.seriDurumu.toparlanmaDurumu?.oncekiSeri).toBe(22);
      expect(tekrar.seriDurumu.sonTamGun).toBe('2026-06-14');
    });

    // Toparlanma HENUZ bitmemisken geri-alim sayaci ilgilendirmez (hic artmamisti).
    test('SUREN toparlanmanin gunu geri alininca `toparlanmaGeriAlindi` false kalir', () => {
      const dunkuDurum = toparlanmaninIkinciGunu(ayarlar);

      const tam = seriHesapla(dunkuDurum, gun('2026-06-14', 3), gun('2026-06-13', 3), ayarlar);
      const geriAl = seriHesapla(tam.seriDurumu, gun('2026-06-14', 2), gun('2026-06-13', 3), ayarlar);

      expect(geriAl.toparlanmaGeriAlindi).toBe(false);
    });
  });
});

// ==================== FAZ 5a: GUN SINIRI = ERTESI IMSAK ====================
/**
 * Seri gunu artik sabit 05:00'te degil, ERTESI IMSAK'ta biter. Kayma CIFT YONLUDUR:
 * yazin imsak (~03:30) 05:00'ten ONCE oldugu icin sinir GERIYE, kisin (~06:40)
 * SONRA oldugu icin ILERI kayar. Imsak kaynagi (konum) hazir degilse eski 05:00
 * davranisi birebir korunur.
 */
describe('SeriHesaplayiciServisi - Gun siniri imsaga baglidir (Faz 5a)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  /** Verilen gunun imsakini sabit bir saat:dakikaya kilitleyen saglayici. */
  const imsakta = (saat: number, dakika: number) => (tarih: Date) =>
    new Date(tarih.getFullYear(), tarih.getMonth(), tarih.getDate(), saat, dakika, 0, 0);

  /** Imsak kaynagi hazir degil (konum yok). */
  const imsakYok = () => null;

  const tamGun = (tarih: string): GunlukNamazlar => ({
    tarih,
    namazlar: [
      NamazAdi.Sabah,
      NamazAdi.Ogle,
      NamazAdi.Ikindi,
      NamazAdi.Aksam,
      NamazAdi.Yatsi,
    ].map((namazAdi) => ({ namazAdi, tamamlandi: true, tarih })),
  });

  describe('YAZ — imsak 03:30 (sinir GERIYE kayar)', () => {
    test('04:00 BUGUNE sayilir (eski 05:00 kurali duneye sayiyordu)', () => {
      const an = new Date(2026, 6, 2, 4, 0, 0);
      expect(namazGunuHesapla(an, '05:00', imsakta(3, 30))).toBe('2026-07-02');
    });

    test('03:00 hala DUNE sayilir (imsak henuz girmedi)', () => {
      const an = new Date(2026, 6, 2, 3, 0, 0);
      expect(namazGunuHesapla(an, '05:00', imsakta(3, 30))).toBe('2026-07-01');
    });

    test('tam imsak dakikasinda (03:30) BUGUNE sayilir', () => {
      const an = new Date(2026, 6, 2, 3, 30, 0);
      expect(namazGunuHesapla(an, '05:00', imsakta(3, 30))).toBe('2026-07-02');
    });
  });

  describe('KIS — imsak 06:40 (sinir ILERI kayar)', () => {
    test('05:30 DUNE sayilir (eski 05:00 kurali buguneye sayiyordu)', () => {
      const an = new Date(2026, 0, 15, 5, 30, 0);
      expect(namazGunuHesapla(an, '05:00', imsakta(6, 40))).toBe('2026-01-14');
    });

    test('06:45 BUGUNE sayilir', () => {
      const an = new Date(2026, 0, 15, 6, 45, 0);
      expect(namazGunuHesapla(an, '05:00', imsakta(6, 40))).toBe('2026-01-15');
    });
  });

  describe('Imsak kaynagi yok -> 05:00 fallback (eski davranis birebir)', () => {
    test('04:00 DUNE, 05:00 BUGUNE', () => {
      expect(namazGunuHesapla(new Date(2026, 6, 2, 4, 0, 0), '05:00', imsakYok)).toBe('2026-07-01');
      expect(namazGunuHesapla(new Date(2026, 6, 2, 5, 0, 0), '05:00', imsakYok)).toBe('2026-07-02');
    });

    test('saglayici patlarsa da 05:00 fallback uygulanir (sessiz cokme yok)', () => {
      const patlayan = () => {
        throw new Error('konum kaynagi hazir degil');
      };
      expect(namazGunuHesapla(new Date(2026, 6, 2, 4, 0, 0), '05:00', patlayan)).toBe('2026-07-01');
    });

    test('gecersiz Date donen saglayici yok sayilir', () => {
      const gecersiz = () => new Date(NaN);
      expect(namazGunuHesapla(new Date(2026, 6, 2, 4, 0, 0), '05:00', gecersiz)).toBe('2026-07-01');
    });

    test('BASKA takvim gunune dusen imsak degeri yok sayilir (uc enlem korumasi)', () => {
      const baskaGun = () => new Date(2026, 6, 5, 3, 30, 0);
      expect(namazGunuHesapla(new Date(2026, 6, 2, 4, 0, 0), '05:00', baskaGun)).toBe('2026-07-01');
    });
  });

  describe('KABLOLAMA — seriHesapla gercek imsak kaynagini kullanir', () => {
    const ayarlar: SeriAyarlari = { ...VARSAYILAN_SERI_AYARLARI, tamGunEsigi: 5 };

    const imsakKaynaginiKur = (saat: number, dakika: number) => {
      jest.spyOn(NamazVaktiHesaplayiciServisi, 'getInstance').mockReturnValue({
        getKonfig: () => ({ latitude: 41.0082, longitude: 28.9784 }),
        getGunlukVakitler: (tarih: Date) => ({
          imsak: new Date(tarih.getFullYear(), tarih.getMonth(), tarih.getDate(), saat, dakika, 0, 0),
        }),
      } as unknown as NamazVaktiHesaplayiciServisi);
    };

    test('imsak 03:30 iken 04:00te isaretlenen namazlar BUGUNE (2 Temmuz) yazilir', () => {
      jest.setSystemTime(new Date(2026, 6, 2, 4, 0, 0));
      imsakKaynaginiKur(3, 30);

      const sonuc = seriHesapla(null, tamGun('2026-07-02'), null, ayarlar);

      expect(sonuc.seriDurumu.sonTamGun).toBe('2026-07-02');
    });

    test('konum yapilandirilmamissa (0,0 nobetcisi) 05:00 davranisina duser', () => {
      jest.setSystemTime(new Date(2026, 6, 2, 4, 0, 0));
      jest.spyOn(NamazVaktiHesaplayiciServisi, 'getInstance').mockReturnValue({
        getKonfig: () => ({ latitude: 0, longitude: 0 }),
        getGunlukVakitler: () => ({ imsak: new Date(2026, 6, 2, 3, 30, 0) }),
      } as unknown as NamazVaktiHesaplayiciServisi);

      const sonuc = seriHesapla(null, tamGun('2026-07-01'), null, ayarlar);

      expect(sonuc.seriDurumu.sonTamGun).toBe('2026-07-01');
    });
  });

  describe('KALICI VERI — sinir kaydiktan sonra diskteki kayitlar bozulmaz', () => {
    const ayarlar: SeriAyarlari = { ...VARSAYILAN_SERI_AYARLARI, tamGunEsigi: 5 };

    test('BAYAT bugunOncesi snapshot (eski 05:00 kuraliyla yazilmis) UYGULANMAZ', () => {
      // Kullanici 1 Temmuz 04:00'te (eski kural: hala 30 Haziran gunu) bir snapshot
      // biriktirmis; yeni kuralda 04:00 artik 2 Temmuz'a ait. sonTamGun bugune esit
      // olsa bile snapshot'in tarihi tutmadigi icin geri-alma UYGULANMAMALI.
      jest.setSystemTime(new Date(2026, 6, 2, 4, 0, 0));
      jest.spyOn(NamazVaktiHesaplayiciServisi, 'getInstance').mockReturnValue({
        getKonfig: () => ({ latitude: 41.0082, longitude: 28.9784 }),
        getGunlukVakitler: (tarih: Date) => ({
          imsak: new Date(tarih.getFullYear(), tarih.getMonth(), tarih.getDate(), 3, 30, 0, 0),
        }),
      } as unknown as NamazVaktiHesaplayiciServisi);

      const durum: SeriDurumu = {
        ...bosSeriDurumuOlustur(),
        mevcutSeri: 9,
        enUzunSeri: 9,
        sonTamGun: '2026-07-02',
        seriBaslangici: '2026-06-24',
        bugunOncesi: {
          tarih: '2026-07-01', // eski sinirla yazilmis -> bayat
          mevcutSeri: 8,
          enUzunSeri: 9,
          sonTamGun: '2026-07-01',
          seriBaslangici: '2026-06-24',
          toparlanmaDurumu: null,
          dondurulduMu: false,
          dondurulmaTarihi: null,
        },
        bugunKazanilanPuan: 19,
      };

      const eksik: GunlukNamazlar = {
        ...tamGun('2026-07-02'),
        namazlar: tamGun('2026-07-02').namazlar.map((n, i) => ({ ...n, tamamlandi: i < 4 })),
      };

      const sonuc = seriHesapla(durum, eksik, null, ayarlar);

      expect(sonuc.seriDegisti).toBe(false);
      expect(sonuc.seriDurumu.mevcutSeri).toBe(9);
      expect(sonuc.kazanilanPuan).toBe(0);
    });
  });
});
