import {
  seriHesapla,
  bosSeriDurumuOlustur,
  namazGunuHesapla,
} from '../SeriHesaplayiciServisi';
import {
  SeriDurumu,
  SeriAyarlari,
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
});

