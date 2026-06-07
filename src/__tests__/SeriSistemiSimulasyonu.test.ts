import {
  seriHesapla,
  bosSeriDurumuOlustur,
} from '../domain/services/SeriHesaplayiciServisi';
import {
  tamGuncellemeyiYap,
  bosKullaniciRozetleriOlustur,
  bosSeviyeDurumuOlustur,
} from '../domain/services/RozetYoneticisiServisi';
import {
  SeriDurumu,
  SeriAyarlari,
  VARSAYILAN_SERI_AYARLARI,
  KullaniciRozeti,
  SeviyeDurumu,
} from '../core/types/SeriTipleri';
import { GunlukNamazlar } from '../core/types';
import * as TarihYardimcisi from '../core/utils/TarihYardimcisi';
import { NamazAdi } from '../core/constants/UygulamaSabitleri';

const { gunEkle } = TarihYardimcisi;

describe('Seri Sistemi Entegrasyon Simulasyonu', () => {
  let seriDurumu: SeriDurumu;
  let rozetler: KullaniciRozeti[];
  let seviyeDurumu: SeviyeDurumu;
  let toplamKilinanNamaz: number;
  let toparlanmaSayisi: number;
  let mukemmelGunSayisi: number;
  let ayarlar: SeriAyarlari;

  beforeEach(() => {
    seriDurumu = bosSeriDurumuOlustur();
    rozetler = bosKullaniciRozetleriOlustur();
    seviyeDurumu = bosSeviyeDurumuOlustur();
    toplamKilinanNamaz = 0;
    toparlanmaSayisi = 0;
    mukemmelGunSayisi = 0;
    ayarlar = { ...VARSAYILAN_SERI_AYARLARI, tamGunEsigi: 5 };
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

  // Belirli sayida namazin kilindigi kismi gun (tamGunEsigi sinir testleri icin).
  // Ilk `kilinanSayi` namaz tamamlanmis, kalanlari eksik.
  const kismiNamazlar = (tarih: string, kilinanSayi: number): GunlukNamazlar => {
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

  const gunSimuleEt = (tarih: string, namazlar: GunlukNamazlar | null) => {
    jest.setSystemTime(new Date(tarih + 'T12:00:00'));

    // 1. Seri hesapla
    const hesapSonucu = seriHesapla(seriDurumu, namazlar, null, ayarlar);

    // 2. Istatistikleri guncelle
    if (namazlar) {
      const kilinan = namazlar.namazlar.filter(n => n.tamamlandi).length;
      toplamKilinanNamaz += kilinan;
      if (kilinan === 5) mukemmelGunSayisi += 1;
    }

    if (hesapSonucu.toparlanmaBasarili) toparlanmaSayisi += 1;

    // 3. Tam guncellemeyi yap (rozetler, seviye, kutlamalar)
    const guncellemeSonucu = tamGuncellemeyiYap(
      hesapSonucu.seriDurumu,
      rozetler,
      seviyeDurumu,
      toplamKilinanNamaz,
      toparlanmaSayisi,
      mukemmelGunSayisi,
      hesapSonucu.kazanilanPuan,
      hesapSonucu.toparlanmaBasarili
    );

    // 4. State'i guncelle
    seriDurumu = hesapSonucu.seriDurumu;
    rozetler = guncellemeSonucu.yeniKullaniciRozetleri;
    seviyeDurumu = guncellemeSonucu.yeniSeviyeDurumu;

    return {
      hesapSonucu,
      guncellemeSonucu
    };
  };

  test('15 gunluk tam seri, 1 gun bosluk, 3 gun toparlanma senaryosu', () => {
    let mevcutTarih = '2025-01-01';

    // 1. Ilk 15 gun tam kiliniyor
    for (let i = 0; i < 15; i++) {
      gunSimuleEt(mevcutTarih, tamNamazlar(mevcutTarih));
      mevcutTarih = gunEkle(mevcutTarih, 1);
    }

    expect(seriDurumu.mevcutSeri).toBe(15);

    // Toplam puan, uretimle BAGIMSIZ yontemle hesaplanan kesin referans degere esit olmali.
    // Seri puani: her tam gun icin kazanilanPuan = 10 + yeniSeri (SeriHesaplayiciServisi:378).
    //   Sigma_{yeniSeri=1..15}(10 + yeniSeri) = 10*15 + (1+2+...+15) = 150 + 120 = 270.
    // Rozet puani: 7. gunde 'ilk_adim' (bronz) kazanilir.
    //   rozetPuaniHesapla(bronz) = PUAN_DEGERLERI.rozet_kazanildi(50) * ROZET_SEVIYE_CARPANI.bronz(1) = 50.
    //   (15 gun x 5 = 75 namaz < 100 -> 'yuz_namaz' yok; 15 mukemmel gun < 30 -> 'mukemmeliyetci' yok)
    // Toplam = 270 + 50 = 320.
    expect(seviyeDurumu.toplamPuan).toBe(320);

    // 320 puan SEVIYE_TANIMLARI esiklerine gore: seviye3 minPuan=300, seviye4 minPuan=600.
    // 300 <= 320 < 600 -> seviye 3 (Salik). Seviye atlama ve esik mantigi regresyonunu yakalar.
    expect(seviyeDurumu.mevcutSeviye).toBe(3);
    expect(seviyeDurumu.rank).toBe('Sâlik');

    // 7 gun rozeti kazanilmis olmali
    const ilkAdimRozeti = rozetler.find(r => r.rozetId === 'ilk_adim');
    expect(ilkAdimRozeti?.kazanildiMi).toBe(true);

    // Bu senaryoda SADECE 'ilk_adim' rozeti kazanilmali; baska bir rozetin yanlislikla
    // tetiklenmesi (ornegin esik kaymasi) puan matematigini bozar ve burada yakalanir.
    const kazanilanRozetIdleri = rozetler
      .filter(r => r.kazanildiMi)
      .map(r => r.rozetId);
    expect(kazanilanRozetIdleri).toEqual(['ilk_adim']);

    // 2. Bir gun kaciriliyor (2025-01-16)
    // Bu gunu pas geciyoruz (namaz yok)
    mevcutTarih = gunEkle(mevcutTarih, 1);

    // 3. Sonraki gun tam kiliniyor (2025-01-17)
    // Seri bozulmali ve toparlanma baslamali
    const gun17 = gunSimuleEt(mevcutTarih, tamNamazlar(mevcutTarih));
    expect(gun17.hesapSonucu.seriBozuldu).toBe(true);
    expect(seriDurumu.toparlanmaDurumu).toBeDefined();
    expect(seriDurumu.toparlanmaDurumu?.oncekiSeri).toBe(15);
    expect(seriDurumu.toparlanmaDurumu?.tamamlananGun).toBe(1);

    // 4. Toparlanma devam ediyor (2 gun daha tam — 3 gunluk toparlanma)
    for (let i = 0; i < 2; i++) {
      mevcutTarih = gunEkle(mevcutTarih, 1);
      gunSimuleEt(mevcutTarih, tamNamazlar(mevcutTarih));
    }

    // 5. Toparlanma basarili olmali
    expect(seriDurumu.toparlanmaDurumu).toBeNull();
    expect(seriDurumu.mevcutSeri).toBe(16); // 15 (kurtarilan) + 1 (son toparlanma gunu)
    expect(toparlanmaSayisi).toBe(1);
  });

  test('Ozel gun (mazeret) dondurma testi', () => {
    let mevcutTarih = '2025-02-01';

    // 5 gun tam seri
    for (let i = 0; i < 5; i++) {
      gunSimuleEt(mevcutTarih, tamNamazlar(mevcutTarih));
      mevcutTarih = gunEkle(mevcutTarih, 1);
    }
    expect(seriDurumu.mevcutSeri).toBe(5);

    // Ozel gun basliyor (3 gunluk)
    const ozelGunBaslangic = mevcutTarih;
    const ozelGunBitis = gunEkle(mevcutTarih, 2);
    const ozelGunAyarlari = {
      ozelGunModuAktif: true,
      aktifOzelGun: {
        id: 'test-mazeret',
        baslangicTarihi: ozelGunBaslangic,
        bitisTarihi: ozelGunBitis,
        olusturulmaTarihi: new Date().toISOString()
      },
      gecmisKayitlar: []
    };

    // Ozel gun suresince namaz kilinmiyor
    for (let i = 0; i < 3; i++) {
      jest.setSystemTime(new Date(mevcutTarih + 'T12:00:00'));
      const hesapSonucu = seriHesapla(seriDurumu, null, null, ayarlar, ozelGunAyarlari);
      seriDurumu = hesapSonucu.seriDurumu;
      expect(seriDurumu.dondurulduMu).toBe(true);
      expect(seriDurumu.mevcutSeri).toBe(5); // Seri sabit kalmali
      mevcutTarih = gunEkle(mevcutTarih, 1);
    }

    // Ozel gun bitti, ilk tam gun
    const sonuc = gunSimuleEt(mevcutTarih, tamNamazlar(mevcutTarih));
    expect(seriDurumu.dondurulduMu).toBe(false);
    expect(seriDurumu.mevcutSeri).toBe(6); // Seri 5'ten 6'ya cikmali
  });

  // ==================== GUN BITIS SAATI / GECE YARISI SINIRI ====================
  // Projenin en kritik domain kurali: gun ne zaman biter. namazGunuHesapla,
  // gun bitis saatinden (varsayilan 05:00) ONCE yapilan islemleri ONCEKI gune sayar.
  // Bu sinir, simulasyon hep 12:00'de calistigi icin hic dogrulanmamisti.
  test('Gece yarisindan sonra (04:00) yapilan islem onceki gunun serisini surdurur', () => {
    // Once 2025-03-08 gunune kadar 3 gunluk seri kuruyoruz (12:00'de, normal).
    let tarih = '2025-03-06';
    for (let i = 0; i < 3; i++) {
      gunSimuleEt(tarih, tamNamazlar(tarih));
      tarih = gunEkle(tarih, 1);
    }
    expect(seriDurumu.mevcutSeri).toBe(3);
    expect(seriDurumu.sonTamGun).toBe('2025-03-08');

    // Simdi sistem saatini 2025-03-10 SAAT 04:00 yapiyoruz (gun bitis 05:00'ten ONCE).
    // namazGunuHesapla bunu '2025-03-09' (onceki takvim gunu) gunune saymali.
    // Boylece sonTamGun(2025-03-08) === dun(2025-03-08) -> seri KESINTISIZ devam etmeli.
    jest.setSystemTime(new Date(2025, 2, 10, 4, 0, 0)); // ay indeksi 2 = Mart
    const sonuc = seriHesapla(seriDurumu, tamNamazlar('2025-03-10'), null, ayarlar);

    // Uretim namazGunuHesapla'yi DOGRU uygularsa bugun=2025-03-09, seri 4'e cikar.
    // Yanlis uygularsa (gun cikarma yapilmazsa) bugun=2025-03-10 olur, sonTamGun ile
    // arada 2 gun fark dogar ve seri BOZULUR -> bu test onu yakalar.
    expect(sonuc.seriBozuldu).toBe(false);
    expect(sonuc.seriDurumu.sonTamGun).toBe('2025-03-09');
    expect(sonuc.seriDurumu.mevcutSeri).toBe(4);
  });

  test('Gun bitis saatinden SONRA (12:00) yapilan islem AYNI takvim gunune sayilir', () => {
    // Kontrol testi: ayni veriyle 12:00'de calisinca bugun=2025-03-09 DEGIL, 2025-03-10 olur.
    // Bu, 04:00 testindeki davranisin gercekten saate bagli oldugunu kanitlar
    // (her zaman onceki gune saymiyor; yalnizca bitis saatinden once).
    let tarih = '2025-03-06';
    for (let i = 0; i < 3; i++) {
      gunSimuleEt(tarih, tamNamazlar(tarih));
      tarih = gunEkle(tarih, 1);
    }
    expect(seriDurumu.sonTamGun).toBe('2025-03-08');

    // 2025-03-10 SAAT 12:00 (bitis saatinden sonra) -> bugun gercekten 2025-03-10.
    // sonTamGun 2025-03-08 ile arada 2 gun fark var -> seri bozulur.
    jest.setSystemTime(new Date(2025, 2, 10, 12, 0, 0));
    const sonuc = seriHesapla(seriDurumu, tamNamazlar('2025-03-10'), null, ayarlar);
    expect(sonuc.seriDurumu.sonTamGun).toBe('2025-03-10');
    expect(sonuc.seriBozuldu).toBe(true);
  });

  // ==================== <7 GUN: TOPARLANMASIZ SIFIRLAMA (esik=7) ====================
  // Kritik dallanma: mevcutSeri<7 iken arada gun kacarsa toparlanma BASLAMAZ,
  // seri dogrudan 1'e sifirlanir (SeriHesaplayiciServisi:399-412).
  test('6 gunluk seri bozulunca toparlanma YOK, seri 1e sifirlanir', () => {
    let tarih = '2025-04-01';
    for (let i = 0; i < 6; i++) {
      gunSimuleEt(tarih, tamNamazlar(tarih));
      tarih = gunEkle(tarih, 1);
    }
    expect(seriDurumu.mevcutSeri).toBe(6);

    // Bir gun atla (2025-04-07 pas), sonra 2025-04-08 tam kil.
    tarih = gunEkle(tarih, 1); // 2025-04-08 (07'yi atladik)
    const sonuc = gunSimuleEt(tarih, tamNamazlar(tarih));

    expect(sonuc.hesapSonucu.seriBozuldu).toBe(true);
    // 7'nin ALTINDA seri -> toparlanma moduna GIRMEMELI
    expect(seriDurumu.toparlanmaDurumu).toBeNull();
    // Sifirdan yeni seri: 1
    expect(seriDurumu.mevcutSeri).toBe(1);
    expect(seriDurumu.sonTamGun).toBe('2025-04-08');
  });

  test('7 gunluk seri bozulunca toparlanma moduna GECER (esik sinir farki)', () => {
    let tarih = '2025-05-01';
    for (let i = 0; i < 7; i++) {
      gunSimuleEt(tarih, tamNamazlar(tarih));
      tarih = gunEkle(tarih, 1);
    }
    expect(seriDurumu.mevcutSeri).toBe(7);

    // Bir gun atla, sonra tam kil -> 7+ oldugu icin toparlanma baslamali (sifirlanmamali).
    tarih = gunEkle(tarih, 1); // bir gun atladik
    const sonuc = gunSimuleEt(tarih, tamNamazlar(tarih));

    expect(sonuc.hesapSonucu.seriBozuldu).toBe(true);
    expect(seriDurumu.toparlanmaDurumu).not.toBeNull();
    expect(seriDurumu.toparlanmaDurumu?.oncekiSeri).toBe(7);
    expect(seriDurumu.toparlanmaDurumu?.tamamlananGun).toBe(1);
  });

  // ==================== TOPARLANMA BASARISIZ: TAM SIFIRLAMA ====================
  // En kritik ceza mantigi: toparlanma sirasinda bir gun kacirilirsa
  // (gunFarkiniHesapla(sonTam, bugun) > 1) tum seri bosSeriDurumuOlustur ile
  // SIFIRLANIR (SeriHesaplayiciServisi:336-345). Mutlu-yol disinda hic test yoktu.
  test('Toparlanma sirasinda gun kacirilinca seri tamamen sifirlanir', () => {
    let tarih = '2025-07-01';
    // 8 gunluk saglam seri
    for (let i = 0; i < 8; i++) {
      gunSimuleEt(tarih, tamNamazlar(tarih));
      tarih = gunEkle(tarih, 1);
    }
    expect(seriDurumu.mevcutSeri).toBe(8);

    // Bir gun atla -> tam kil: toparlanma baslar (oncekiSeri=8, tamamlanan=1)
    tarih = gunEkle(tarih, 1); // bir gun atladik
    gunSimuleEt(tarih, tamNamazlar(tarih));
    expect(seriDurumu.toparlanmaDurumu?.oncekiSeri).toBe(8);
    expect(seriDurumu.toparlanmaDurumu?.tamamlananGun).toBe(1);
    const toparlanmaSonTam = seriDurumu.sonTamGun; // toparlanmanin ilk gunu

    // Toparlanma sirasinda BIR GUN KACIR (arada bos gun olacak sekilde namaz YOK).
    // sonTamGun ile bugun arasinda 2 gun fark -> toparlanma bozulmali.
    const kacirilanGunSonrasi = gunEkle(toparlanmaSonTam!, 2);
    const sonuc = gunSimuleEt(kacirilanGunSonrasi, null);

    expect(sonuc.hesapSonucu.seriBozuldu).toBe(true);
    // Tam sifirlama: bosSeriDurumuOlustur
    expect(seriDurumu.toparlanmaDurumu).toBeNull();
    expect(seriDurumu.mevcutSeri).toBe(0);
    expect(seriDurumu.sonTamGun).toBeNull();
  });

  // ==================== tamGunEsigi (KISMI GUN) DAVRANISI ====================
  // gunTamMi sinir davranisi: kilinanNamazSayisi >= esik. Simulasyon yalnizca
  // 5/5 veya 0/5 kullaniyordu; ara degerler (3-4 namaz) hic test edilmemisti.
  test('tamGunEsigi=5 iken 4 namazlik gun TAM SAYILMAZ ve seriyi bozar', () => {
    let tarih = '2025-08-01';
    for (let i = 0; i < 3; i++) {
      gunSimuleEt(tarih, tamNamazlar(tarih));
      tarih = gunEkle(tarih, 1);
    }
    expect(seriDurumu.mevcutSeri).toBe(3);

    // Ertesi gun yalnizca 4 namaz (esik=5) -> tam sayilmaz, seri ilerlemez.
    const eksikGun = gunSimuleEt(tarih, kismiNamazlar(tarih, 4));
    expect(eksikGun.hesapSonucu.seriDegisti).toBe(false);
    expect(seriDurumu.mevcutSeri).toBe(3); // Seri ARTMADI (4 < 5 esik)
    expect(seriDurumu.sonTamGun).toBe('2025-08-03'); // 3. tam gunde kaldi
  });

  test('tamGunEsigi=3 iken 3 namaz YETERLI, seri ilerler (esik sinir)', () => {
    // Esik=3 ile yeni ayarlar; gunTamMi'nin === sinirini dogrular (3 >= 3).
    ayarlar = { ...VARSAYILAN_SERI_AYARLARI, tamGunEsigi: 3 };

    let tarih = '2025-09-01';
    const gun1 = gunSimuleEt(tarih, kismiNamazlar(tarih, 3));
    expect(gun1.hesapSonucu.seriDegisti).toBe(true);
    expect(seriDurumu.mevcutSeri).toBe(1);

    // Ertesi gun yalnizca 2 namaz (esik=3) -> tam degil, seri ilerlemez.
    tarih = gunEkle(tarih, 1);
    const gun2 = gunSimuleEt(tarih, kismiNamazlar(tarih, 2));
    expect(gun2.hesapSonucu.seriDegisti).toBe(false);
    expect(seriDurumu.mevcutSeri).toBe(1);
  });

  // ==================== enUzunSeri REKORU + TOPARLANMA KUTLAMASI ====================
  // tamGuncellemeyiYap'in urettigi kutlamalar/seviye hic incelenmiyordu.
  // Toparlanma sonrasi mevcutSeri=16 -> enUzunSeri de 16 olmali (rekor) ve
  // toparlanma_tamamlandi kutlamasi uretilmeli.
  test('Toparlanma sonrasi enUzunSeri rekoru guncellenir ve kutlama uretilir', () => {
    let tarih = '2025-10-01';
    // 15 gunluk seri
    for (let i = 0; i < 15; i++) {
      gunSimuleEt(tarih, tamNamazlar(tarih));
      tarih = gunEkle(tarih, 1);
    }
    expect(seriDurumu.mevcutSeri).toBe(15);
    expect(seriDurumu.enUzunSeri).toBe(15);

    // 1 gun atla -> toparlanma baslar
    tarih = gunEkle(tarih, 1); // atlanan gun
    gunSimuleEt(tarih, tamNamazlar(tarih)); // toparlanma 1. gun

    // 2 gun daha tam -> 3 gunluk toparlanma tamamlanir (VARSAYILAN_SERI_AYARLARI.toparlanmaGunSayisi=3)
    let sonGun;
    for (let i = 0; i < 2; i++) {
      tarih = gunEkle(tarih, 1);
      sonGun = gunSimuleEt(tarih, tamNamazlar(tarih));
    }

    // Seri 16'ya cikti (15 kurtarilan + 1) ve REKOR da 16 olmali.
    expect(seriDurumu.mevcutSeri).toBe(16);
    expect(seriDurumu.enUzunSeri).toBe(16);

    // Toparlanma basarili kutlamasi uretildi mi?
    expect(sonGun!.hesapSonucu.toparlanmaBasarili).toBe(true);
    const toparlanmaKutlamasi = sonGun!.guncellemeSonucu.kutlamalar.find(
      k => k.tip === 'toparlanma_tamamlandi'
    );
    expect(toparlanmaKutlamasi).toBeDefined();
  });

  // ==================== OZEL ROZET ESIKLERI (mukemmeliyetci=30) ====================
  // gunSimuleEt mukemmelGunSayisi'ni biriktiriyor; bu ozel-rozet yolu (kosul=30)
  // hicbir senaryoda esige ulasmadigi icin ASLA dogrulanmiyordu (olu kapsam).
  test('30 mukemmel (5/5) gun sonunda mukemmeliyetci rozeti kazanilir', () => {
    let tarih = '2025-11-01';
    let mukemmeliyetciKazanildigiGun = -1;
    for (let i = 0; i < 30; i++) {
      const gun = gunSimuleEt(tarih, tamNamazlar(tarih));
      const kazanildi = gun.guncellemeSonucu.kazanilanRozetler.some(
        r => r.id === 'mukemmeliyetci'
      );
      if (kazanildi && mukemmeliyetciKazanildigiGun === -1) {
        mukemmeliyetciKazanildigiGun = i + 1; // 1-tabanli gun numarasi
      }
      tarih = gunEkle(tarih, 1);
    }

    expect(mukemmelGunSayisi).toBe(30);
    const mukemmeliyetci = rozetler.find(r => r.rozetId === 'mukemmeliyetci');
    expect(mukemmeliyetci?.kazanildiMi).toBe(true);

    // Rozet TAM 30. gunde kazanilmali (esik=30). 29 veya daha erken kazanilirsa
    // esik kaymasi/off-by-one vardir; bu assertion onu yakalar.
    expect(mukemmeliyetciKazanildigiGun).toBe(30);
  });

  // ==================== OZEL ROZET ESIKLERI (toparlanma_ustasi=3) ====================
  // toparlanmaSayisi 3'e ulasinca toparlanma_ustasi rozeti kazanilmali; bu yol da
  // hicbir senaryoda tetiklenmiyordu.
  test('3 basarili toparlanma sonunda toparlanma_ustasi rozeti kazanilir', () => {
    let tarih = '2026-01-01';

    // 3 kez: 7 gun seri kur -> boz -> 3 gun toparlanma (basarili) dongusu.
    for (let dongu = 0; dongu < 3; dongu++) {
      // 7 gunluk seri (toparlanma esigi 7'yi gecmek icin)
      for (let i = 0; i < 7; i++) {
        gunSimuleEt(tarih, tamNamazlar(tarih));
        tarih = gunEkle(tarih, 1);
      }
      // 1 gun atla -> toparlanma baslar (1. gun)
      tarih = gunEkle(tarih, 1);
      gunSimuleEt(tarih, tamNamazlar(tarih));
      // 2 gun daha -> toparlanma tamamlanir (3 gunluk)
      for (let i = 0; i < 2; i++) {
        tarih = gunEkle(tarih, 1);
        gunSimuleEt(tarih, tamNamazlar(tarih));
      }
      tarih = gunEkle(tarih, 1);
    }

    expect(toparlanmaSayisi).toBe(3);
    const toparlanmaUstasi = rozetler.find(r => r.rozetId === 'toparlanma_ustasi');
    expect(toparlanmaUstasi?.kazanildiMi).toBe(true);
  });
});

