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
});

