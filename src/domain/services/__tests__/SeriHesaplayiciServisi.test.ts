import {
  seriHesapla,
  bosSeriDurumuOlustur,
  namazGunuHesapla,
  gunTamMi,
} from '../SeriHesaplayiciServisi';
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

  test('7+ gunluk seri bir gun kacirilinca toparlanma modu uretimden gelen hedefle (3) baslamali', () => {
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

    // Hedef, ayardan turetilir (uretim satir 392) — elle 5 yazilmaz, varsayilan 3'tur
    expect(sonuc.seriDurumu.toparlanmaDurumu?.hedefGunSayisi).toBe(
      varsayilanAyarlar.toparlanmaGunSayisi,
    );
    expect(varsayilanAyarlar.toparlanmaGunSayisi).toBe(3); // dokuman/hedef tutarliligi
    expect(sonuc.seriDurumu.toparlanmaDurumu?.tamamlananGun).toBe(1); // bugun ilk gun
    expect(sonuc.seriDurumu.toparlanmaDurumu?.oncekiSeri).toBe(10);
    expect(sonuc.seriBozuldu).toBe(true);
  });

  test('Toparlanmada 3 tam gun (hedef) kilindiginda eski seri kurtarilmali', () => {
    const bugun = '2025-12-25';
    jest.setSystemTime(new Date(bugun + 'T12:00:00'));

    // State'i uretimle uyumlu kur: hedef = ayardan (3), tamamlananGun = 2 => bugun 3. gun
    const mevcutDurum: SeriDurumu = {
      ...bosSeriDurumuOlustur(),
      mevcutSeri: 0, // Toparlanma modunda mevcutSeri 0 olur (ozet haric)
      sonTamGun: '2025-12-24',
      toparlanmaDurumu: {
        tamamlananGun: 2, // 3 gunluk hedefin 2'si bitti; bugun 3. gun
        baslangicTarihi: '2025-12-23',
        hedefGunSayisi: varsayilanAyarlar.toparlanmaGunSayisi, // = 3, kaynaktan turetilir
        oncekiSeri: 10,
      },
    };

    const sonuc = seriHesapla(mevcutDurum, tamNamazlar(bugun), null, varsayilanAyarlar);

    expect(sonuc.toparlanmaBasarili).toBe(true);
    expect(sonuc.seriDurumu.mevcutSeri).toBe(11); // oncekiSeri (10) + 1 (bugun)
    expect(sonuc.seriDurumu.toparlanmaDurumu).toBeNull();
  });

  test('Toparlanma hedef gununden ONCE (3 gunluk hedefte 2. gun) eski seri henuz kurtarilmaz', () => {
    const bugun = '2025-12-24';
    jest.setSystemTime(new Date(bugun + 'T12:00:00'));

    // hedef = 3, tamamlananGun = 1 => bugun 2. gun. Esik henuz dolmadi.
    const mevcutDurum: SeriDurumu = {
      ...bosSeriDurumuOlustur(),
      mevcutSeri: 0,
      sonTamGun: '2025-12-23',
      toparlanmaDurumu: {
        tamamlananGun: 1,
        baslangicTarihi: '2025-12-23',
        hedefGunSayisi: varsayilanAyarlar.toparlanmaGunSayisi, // = 3
        oncekiSeri: 10,
      },
    };

    const sonuc = seriHesapla(mevcutDurum, tamNamazlar(bugun), null, varsayilanAyarlar);

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
  // Mevcut testler hedef-tamam (3/3) ve hedef-on-1-gun (durum kurarak) durumuna bakar,
  // ama 'devam' dalinin (satir 322-335) sonTamGun guncellemesi ve 10 puani assert edilmiyor.
  test('Toparlanmanin orta gununde tamamlananGun artmali, sonTamGun bugune kaymali, 10 puan verilmeli', () => {
    const dun = '2026-06-14';
    const bugun = '2026-06-15';
    jest.setSystemTime(new Date(2026, 5, 15, 12, 0, 0));

    // hedef = 3, tamamlananGun = 1 => bugun 2. gun (henuz hedefe ulasilmadi)
    const mevcutDurum: SeriDurumu = {
      ...bosSeriDurumuOlustur(),
      mevcutSeri: 0,
      sonTamGun: dun,
      toparlanmaDurumu: {
        tamamlananGun: 1,
        baslangicTarihi: '2026-06-13',
        hedefGunSayisi: varsayilanAyarlar.toparlanmaGunSayisi, // = 3
        oncekiSeri: 10,
      },
    };

    const sonuc = seriHesapla(mevcutDurum, tamNamazlar(bugun), null, varsayilanAyarlar);

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

    // hedef = 3, tamamlananGun = 2 => bugun 3. (son) gun -> toparlanma tamamlanir
    const mevcutDurum: SeriDurumu = {
      ...bosSeriDurumuOlustur(),
      mevcutSeri: 0,
      sonTamGun: dun,
      toparlanmaDurumu: {
        tamamlananGun: 2,
        baslangicTarihi: '2026-06-13',
        hedefGunSayisi: varsayilanAyarlar.toparlanmaGunSayisi, // = 3
        oncekiSeri: 10,
      },
    };

    const sonuc = seriHesapla(mevcutDurum, tamNamazlar(bugun), null, varsayilanAyarlar);

    expect(sonuc.toparlanmaBasarili).toBe(true);
    expect(sonuc.seriDurumu.mevcutSeri).toBe(11); // oncekiSeri + bugun
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

