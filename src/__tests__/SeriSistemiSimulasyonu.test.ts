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

  test('15 gunluk tam seri, 1 gun bosluk, 5 gun toparlanma senaryosu', () => {
    let mevcutTarih = '2025-01-01';

    // 1. Ilk 15 gun tam kiliniyor
    for (let i = 0; i < 15; i++) {
      gunSimuleEt(mevcutTarih, tamNamazlar(mevcutTarih));
      mevcutTarih = gunEkle(mevcutTarih, 1);
    }

    expect(seriDurumu.mevcutSeri).toBe(15);
    expect(seviyeDurumu.toplamPuan).toBeGreaterThan(0);
    // 7 gun rozeti kazanilmis olmali
    const ilkAdimRozeti = rozetler.find(r => r.rozetId === 'ilk_adim');
    expect(ilkAdimRozeti?.kazanildiMi).toBe(true);

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

    // 4. Toparlanma devam ediyor (4 gun daha tam)
    for (let i = 0; i < 4; i++) {
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

