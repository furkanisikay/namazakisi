/**
 * KazaHesaplayiciServisi Testleri
 * Saf hesap servisinin davranisi: sihirbaz borc tahmini, vakitlere paylastirma,
 * motivasyon onerileri, tempo istatistik tahmini, tarih formatlama ve mekruh vakit kontrolu.
 *
 * adhan mock'lanir; mekruh kontrolu icin "su an" jest.useFakeTimers + setSystemTime ile
 * sabit bir gune konumlandirilir, boylece sabit tarih sorunu yasanmaz.
 */

import {
  hesaplaTahminiBorcMiktari,
  borcuVakitlerePaylaştır,
  motivasyonOnerileriHesapla,
  kazaIstatistikHesapla,
  tahminiTarihiFormatla,
  mekruhVakitKontrolEt,
} from '../KazaHesaplayiciServisi';
import { KAZA_NAMAZ_LISTESI } from '../../../core/types/KazaTipleri';
import { KAZA_SABITLERI } from '../../../core/constants/UygulamaSabitleri';
import { tarihiISOFormatinaCevir } from '../../../core/utils/TarihYardimcisi';

// ─── adhan mock'u ───────────────────────────────────────────────────────────────
// Deterministik vakitler: sunrise 06:30, dhuhr 13:00, maghrib 19:00 (her gun icin).
// Koordinat NaN ise (gecersiz) PrayerTimes firlatir -> catch dalini test edebiliriz.
jest.mock('adhan', () => ({
  Coordinates: jest.fn().mockImplementation((lat: number, lng: number) => {
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      throw new Error('Gecersiz koordinat');
    }
    return { lat, lng };
  }),
  CalculationMethod: { Turkey: jest.fn(() => ({})) },
  PrayerTimes: jest.fn().mockImplementation((_coords: unknown, date: Date) => {
    const g = (saat: number, dakika = 0) =>
      new Date(date.getFullYear(), date.getMonth(), date.getDate(), saat, dakika);
    return {
      fajr: g(5, 0),
      sunrise: g(6, 30),
      dhuhr: g(13, 0),
      asr: g(16, 0),
      maghrib: g(19, 0),
      isha: g(20, 30),
    };
  }),
}));

const ISTANBUL = { lat: 41.0, lng: 29.0 };

// ════════════════════════════════════════════════════════════════════════════════
// SIHIRBAZ HESABI — hesaplaTahminiBorcMiktari
// ════════════════════════════════════════════════════════════════════════════════
describe('hesaplaTahminiBorcMiktari', () => {
  // "Su an"i sabitlemek davranisi deterministik yapar.
  beforeEach(() => {
    jest.useFakeTimers();
    // 2030-06-15: testin yazildigi gunden bagimsiz, deterministik referans an.
    jest.setSystemTime(new Date(2030, 5, 15, 12, 0, 0));
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('ergenlik tarihi henuz gelmediyse 0 borc dondurur', () => {
    // 2025 dogumlu + 14 yas ergenlik = 2039 -> 2030'da henuz gelmedi
    const borc = hesaplaTahminiBorcMiktari({
      dogumTarihi: '2025-01-01',
      ergenlikYasi: 14,
      kildigiTahminiYuzdesi: 0,
    });
    expect(borc).toBe(0);
  });

  it('ergenlikten bugune gecen gun x 6 vakit toplam borcu verir (hic kilinmamis)', () => {
    // Ergenlik = 2010-06-15 (2000 dogum + 10 yas), bugun 2030-06-15 -> tam 20 yil.
    const borc = hesaplaTahminiBorcMiktari({
      dogumTarihi: '2000-06-15',
      ergenlikYasi: 10,
      kildigiTahminiYuzdesi: 0,
    });
    // 20 yilda artik yillar (2012,2016,2020,2024,2028) = 5 -> 20*365 + 5 = 7305 gun
    const beklenenGun = 7305;
    expect(borc).toBe(beklenenGun * KAZA_NAMAZ_LISTESI.length);
  });

  it('kildigi yuzdesini borctan duser (yari kilinmis ~yari borc)', () => {
    const tam = hesaplaTahminiBorcMiktari({
      dogumTarihi: '2000-06-15',
      ergenlikYasi: 10,
      kildigiTahminiYuzdesi: 0,
    });
    const yari = hesaplaTahminiBorcMiktari({
      dogumTarihi: '2000-06-15',
      ergenlikYasi: 10,
      kildigiTahminiYuzdesi: 50,
    });
    expect(yari).toBe(Math.round(tam * 0.5));
  });

  it('%100 kilindiysa borc 0 olur', () => {
    const borc = hesaplaTahminiBorcMiktari({
      dogumTarihi: '2000-06-15',
      ergenlikYasi: 10,
      kildigiTahminiYuzdesi: 100,
    });
    expect(borc).toBe(0);
  });

  it('yuzde 100 ustu degerler 100 ile sinirlanir (negatif borc uretmez)', () => {
    const borc = hesaplaTahminiBorcMiktari({
      dogumTarihi: '2000-06-15',
      ergenlikYasi: 10,
      kildigiTahminiYuzdesi: 250,
    });
    expect(borc).toBe(0);
  });

  it('negatif yuzde 0 ile sinirlanir (tam borca esit)', () => {
    const tam = hesaplaTahminiBorcMiktari({
      dogumTarihi: '2000-06-15',
      ergenlikYasi: 10,
      kildigiTahminiYuzdesi: 0,
    });
    const negatif = hesaplaTahminiBorcMiktari({
      dogumTarihi: '2000-06-15',
      ergenlikYasi: 10,
      kildigiTahminiYuzdesi: -40,
    });
    expect(negatif).toBe(tam);
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// borcuVakitlerePaylaştır
// ════════════════════════════════════════════════════════════════════════════════
describe('borcuVakitlerePaylaştır', () => {
  it('tam bolunen borcu 6 vakite esit dagitir', () => {
    const dagilim = borcuVakitlerePaylaştır(60);
    KAZA_NAMAZ_LISTESI.forEach((ad) => {
      expect(dagilim[ad]).toBe(10);
    });
    const toplam = Object.values(dagilim).reduce((a, b) => a + b, 0);
    expect(toplam).toBe(60);
  });

  it('kalanli borcu ilk vakitlere +1 ekleyerek dagitir (toplam korunur)', () => {
    // 64 / 6 = 10 kalan 4 -> ilk 4 vakit 11, son 2 vakit 10
    const dagilim = borcuVakitlerePaylaştır(64);
    const degerler = KAZA_NAMAZ_LISTESI.map((ad) => dagilim[ad]);
    expect(degerler).toEqual([11, 11, 11, 11, 10, 10]);
    const toplam = degerler.reduce((a, b) => a + b, 0);
    expect(toplam).toBe(64);
  });

  it('sifir borcta tum vakitler 0 olur', () => {
    const dagilim = borcuVakitlerePaylaştır(0);
    KAZA_NAMAZ_LISTESI.forEach((ad) => {
      expect(dagilim[ad]).toBe(0);
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// motivasyonOnerileriHesapla
// ════════════════════════════════════════════════════════════════════════════════
describe('motivasyonOnerileriHesapla', () => {
  it('toplam kalan <= 0 ise bos dizi dondurur', () => {
    expect(motivasyonOnerileriHesapla(0)).toEqual([]);
    expect(motivasyonOnerileriHesapla(-5)).toEqual([]);
  });

  it('her senaryo icin bir oneri uretir', () => {
    const oneriler = motivasyonOnerileriHesapla(1000);
    expect(oneriler).toHaveLength(KAZA_SABITLERI.MOTIVASYON_SENARYOLARI.length);
    expect(oneriler.map((o) => o.kazaAdediPerVakit)).toEqual([
      ...KAZA_SABITLERI.MOTIVASYON_SENARYOLARI,
    ]);
  });

  it('gunluk kaza = vakit basina x 6 ve gun sayisi yukari yuvarlanir', () => {
    // toplamKalan 100, senaryo 1/vakit -> gunluk 6 -> ceil(100/6) = 17 gun
    const oneri = motivasyonOnerileriHesapla(100).find((o) => o.kazaAdediPerVakit === 1)!;
    expect(oneri.toplamGunlukKaza).toBe(6);
    expect(oneri.tamamlanmaGunSayisi).toBe(17);
  });

  it('gun bicimi (<=30 gun): "X gunde biter" der', () => {
    // senaryo 10/vakit, kalan 600 -> gunluk 60 -> 10 gun -> gun ifadesi
    const oneri = motivasyonOnerileriHesapla(600).find((o) => o.kazaAdediPerVakit === 10)!;
    expect(oneri.tamamlanmaGunSayisi).toBe(10);
    expect(oneri.aciklama).toContain('10 günde biter');
  });

  it('ay bicimi (>30 gun, <=12 ay): "~N ayda biter" der', () => {
    // senaryo 1/vakit, kalan 600 -> gunluk 6 -> 100 gun -> ~3.3 ay -> ay ifadesi
    const oneri = motivasyonOnerileriHesapla(600).find((o) => o.kazaAdediPerVakit === 1)!;
    expect(oneri.tamamlanmaGunSayisi).toBe(100);
    expect(oneri.aciklama).toContain('ayda biter');
    expect(oneri.aciklama).not.toContain('günde biter');
    expect(oneri.aciklama).not.toContain('yılda biter');
  });

  it('yil bicimi (>12 ay): "~N yilda biter" der', () => {
    // senaryo 1/vakit, kalan 100000 -> gunluk 6 -> 16667 gun -> ~555 ay -> yil ifadesi
    const oneri = motivasyonOnerileriHesapla(100000).find((o) => o.kazaAdediPerVakit === 1)!;
    expect(oneri.aciklama).toContain('yılda biter');
    expect(oneri.aciklama).not.toContain('ayda biter');
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// kazaIstatistikHesapla
// ════════════════════════════════════════════════════════════════════════════════
describe('kazaIstatistikHesapla', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2030, 5, 15, 12, 0, 0));
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  // Son N gunun ISO tarih anahtarlarini bugune gore uretir (sabit tarih yazmadan).
  const sonGunler = (gunSayisi: number): string[] => {
    const bugun = new Date();
    const liste: string[] = [];
    for (let i = 0; i < gunSayisi; i++) {
      const t = new Date(bugun);
      t.setDate(bugun.getDate() - i);
      liste.push(tarihiISOFormatinaCevir(t));
    }
    return liste;
  };

  it('toplam kalan <= 0 ise sifir ortalama ve null tahmin dondurur', () => {
    const sonuc = kazaIstatistikHesapla(0, { [sonGunler(1)[0]]: 5 });
    expect(sonuc.haftaOrtalamasi).toBe(0);
    expect(sonuc.tahminiTamamlanmaTarihi).toBeNull();
    expect(sonuc.tahminiTamamlanmaGunSayisi).toBeNull();
    // toplamKalan 0 olsa bile motivasyon onerileri (bos) dahil edilir
    expect(sonuc.motivasyonOnerileri).toEqual([]);
  });

  it('tempo gecmisi bos ise (son 7 gunde kayit yok) tahmin null doner', () => {
    // Anahtarlar var ama 7 gun penceresi disinda -> gunSayisi 0
    const eskiTarih = '2000-01-01';
    const sonuc = kazaIstatistikHesapla(100, { [eskiTarih]: 10 });
    expect(sonuc.haftaOrtalamasi).toBe(0);
    expect(sonuc.tahminiTamamlanmaTarihi).toBeNull();
    expect(sonuc.tahminiTamamlanmaGunSayisi).toBeNull();
    // toplamKalan > 0 oldugu icin motivasyon onerileri dolu gelir
    expect(sonuc.motivasyonOnerileri.length).toBeGreaterThan(0);
  });

  it('son 7 gun ortalamasi 0 ise (hep 0 kaza) tahmin null doner', () => {
    const gecmis: Record<string, number> = {};
    sonGunler(KAZA_SABITLERI.TEMPO_HESAP_GUNLERI).forEach((t) => {
      gecmis[t] = 0;
    });
    const sonuc = kazaIstatistikHesapla(100, gecmis);
    expect(sonuc.haftaOrtalamasi).toBe(0);
    expect(sonuc.tahminiTamamlanmaTarihi).toBeNull();
    expect(sonuc.tahminiTamamlanmaGunSayisi).toBeNull();
  });

  it('pozitif tempo ile haftalik ortalama ve tahmini tarih hesaplar', () => {
    // Son 7 gunun hepsinde 10 kaza -> ortalama 10. Kalan 100 -> ceil(100/10)=10 gun.
    const gecmis: Record<string, number> = {};
    sonGunler(KAZA_SABITLERI.TEMPO_HESAP_GUNLERI).forEach((t) => {
      gecmis[t] = 10;
    });
    const sonuc = kazaIstatistikHesapla(100, gecmis);
    expect(sonuc.haftaOrtalamasi).toBe(10);
    expect(sonuc.tahminiTamamlanmaGunSayisi).toBe(10);

    // Tahmini tarih = bugun + 10 gun
    const beklenen = new Date(2030, 5, 15);
    beklenen.setDate(beklenen.getDate() + 10);
    expect(sonuc.tahminiTamamlanmaTarihi).toBe(tarihiISOFormatinaCevir(beklenen));
  });

  it('kismi gunlu tempoda yalniz mevcut gunlerin ortalamasini alir', () => {
    // Sadece 2 gunde kayit (bugun 6, dun 4) -> ortalama 5. Kalan 50 -> ceil(50/5)=10 gun.
    const gunler = sonGunler(KAZA_SABITLERI.TEMPO_HESAP_GUNLERI);
    const gecmis: Record<string, number> = {
      [gunler[0]]: 6,
      [gunler[1]]: 4,
    };
    const sonuc = kazaIstatistikHesapla(50, gecmis);
    expect(sonuc.haftaOrtalamasi).toBe(5);
    expect(sonuc.tahminiTamamlanmaGunSayisi).toBe(10);
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// tahminiTarihiFormatla
// ════════════════════════════════════════════════════════════════════════════════
describe('tahminiTarihiFormatla', () => {
  it('ISO tarihi "gun Ay yil" formatinda dondurur', () => {
    expect(tahminiTarihiFormatla('2026-07-14')).toBe('14 Temmuz 2026');
  });

  it('yilin ilk gununu dogru formatlar (Ocak)', () => {
    expect(tahminiTarihiFormatla('2026-01-01')).toBe('1 Ocak 2026');
  });

  it('yilin son gununu dogru formatlar (Aralik)', () => {
    expect(tahminiTarihiFormatla('2026-12-31')).toBe('31 Aralık 2026');
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// mekruhVakitKontrolEt
// ════════════════════════════════════════════════════════════════════════════════
describe('mekruhVakitKontrolEt', () => {
  // Mock vakitler: sunrise 06:30, dhuhr 13:00, maghrib 19:00; tolerans 20 dk, istiwa 5 dk.
  const gun = new Date(2030, 5, 15);
  const anaAyarla = (saat: number, dakika: number) => {
    jest.setSystemTime(new Date(2030, 5, 15, saat, dakika, 0));
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('suruk (gunes dogus) penceresinde mekruh dondurur', () => {
    // sunrise 06:30 .. +20dk -> 06:50 arasi mekruh. 06:40 sec.
    anaAyarla(6, 40);
    const sonuc = mekruhVakitKontrolEt(ISTANBUL.lat, ISTANBUL.lng);
    expect(sonuc.mekruhMu).toBe(true);
    expect(sonuc.aciklama).toContain('şuruk');
    // bitis = sunrise + 20dk
    expect(sonuc.bitis).toEqual(new Date(gun.getFullYear(), gun.getMonth(), gun.getDate(), 6, 50));
  });

  it('suruk penceresinin tam sinirinda (sunrise ani) mekruh sayilir', () => {
    anaAyarla(6, 30);
    const sonuc = mekruhVakitKontrolEt(ISTANBUL.lat, ISTANBUL.lng);
    expect(sonuc.mekruhMu).toBe(true);
    expect(sonuc.aciklama).toContain('şuruk');
  });

  it('istiwa (ogle oncesi 5dk) penceresinde mekruh dondurur', () => {
    // dhuhr 13:00, istiwa 12:55..13:00. 12:57 sec.
    anaAyarla(12, 57);
    const sonuc = mekruhVakitKontrolEt(ISTANBUL.lat, ISTANBUL.lng);
    expect(sonuc.mekruhMu).toBe(true);
    expect(sonuc.aciklama).toContain('istiwa');
    expect(sonuc.bitis).toEqual(new Date(gun.getFullYear(), gun.getMonth(), gun.getDate(), 13, 0));
  });

  it('gurub (gunes batis oncesi 20dk) penceresinde mekruh dondurur', () => {
    // maghrib 19:00, gurub 18:40..19:00. 18:50 sec.
    anaAyarla(18, 50);
    const sonuc = mekruhVakitKontrolEt(ISTANBUL.lat, ISTANBUL.lng);
    expect(sonuc.mekruhMu).toBe(true);
    expect(sonuc.aciklama).toContain('gurub');
    expect(sonuc.bitis).toEqual(new Date(gun.getFullYear(), gun.getMonth(), gun.getDate(), 19, 0));
  });

  it('mekruh disi normal vakitte (ogleden sonra) mekruh degil dondurur', () => {
    anaAyarla(15, 0);
    const sonuc = mekruhVakitKontrolEt(ISTANBUL.lat, ISTANBUL.lng);
    expect(sonuc).toEqual({ mekruhMu: false, aciklama: null, bitis: null });
  });

  it('suruk penceresi bittikten 1dk sonra (06:51) mekruh degil', () => {
    anaAyarla(6, 51);
    const sonuc = mekruhVakitKontrolEt(ISTANBUL.lat, ISTANBUL.lng);
    expect(sonuc.mekruhMu).toBe(false);
  });

  it('farz namaz tipinde aciklama "namaz" ifadesini kullanir (kaza namazi degil)', () => {
    anaAyarla(6, 40);
    const sonuc = mekruhVakitKontrolEt(ISTANBUL.lat, ISTANBUL.lng, 'farz');
    expect(sonuc.mekruhMu).toBe(true);
    expect(sonuc.aciklama).toContain('namaz kılınması');
    expect(sonuc.aciklama).not.toContain('kaza namazı');
  });

  it('kaza namaz tipinde (varsayilan) aciklama "kaza namazi" ifadesini kullanir', () => {
    anaAyarla(6, 40);
    const sonuc = mekruhVakitKontrolEt(ISTANBUL.lat, ISTANBUL.lng, 'kaza');
    expect(sonuc.aciklama).toContain('kaza namazı kılınması');
  });

  it('gecersiz koordinatta (NaN) hata yutulur, mekruh degil dondurur (catch dali)', () => {
    anaAyarla(6, 40); // mekruh penceresinde bile olsa, koordinat hatasi guvenli sonuc verir
    const sonuc = mekruhVakitKontrolEt(NaN, NaN);
    expect(sonuc).toEqual({ mekruhMu: false, aciklama: null, bitis: null });
  });
});
