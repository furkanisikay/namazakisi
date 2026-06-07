import {
  ISOTarihiDateNesnesiNeCevir,
  ayinIlkGunuAl,
  ayinSonGunuAl,
  ayniGunMu,
  bugunMu,
  bugunuAl,
  dunuAl,
  gecmisTarihMi,
  gunAdiniAl,
  gunEkle,
  haftaninBaslangiciniAl,
  sonNGunuAl,
  tarihAraliginiAl,
  tarihiISOFormatinaCevir,
} from '../TarihYardimcisi';

// Not: Uretim kodu YEREL saat Date kullanir (new Date(), new Date(yil, ay-1, gun)).
// Bu yuzden setSystemTime'a UTC ISO string DEGIL, yerel-kurucu (new Date(yil, ayIndex, gun, 12))
// bicimi verilir; boylece timezone offset gun sinirini kaydirmaz (saat 12:00 secildi).
describe('TarihYardimcisi — bugun/dun', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('dunuAl(), bugünden tam 1 gün önceyi ISO formatında döndürür', () => {
    jest.useFakeTimers();
    // 10 Eylul 2026 (ay index 8) -> dun 09 Eylul 2026
    jest.setSystemTime(new Date(2026, 8, 10, 12, 0, 0));
    expect(bugunuAl()).toBe('2026-09-10');
    expect(dunuAl()).toBe('2026-09-09');
  });

  it('dunuAl() YYYY-MM-DD formatında döner', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 8, 10, 12, 0, 0));
    expect(dunuAl()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('dunuAl() tek haneli ay/gün için padStart ile sıfır doldurur', () => {
    jest.useFakeTimers();
    // 5 Subat 2026 -> dun 04 Subat 2026: hem ay (02) hem gun (04) iki haneli olmali
    jest.setSystemTime(new Date(2026, 1, 5, 12, 0, 0));
    expect(dunuAl()).toBe('2026-02-04');
  });

  it('dunuAl() ay başında önceki ayın son gününü döndürür (1 Mart -> 28 Şubat, 2026 artık yıl değil)', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 2, 1, 12, 0, 0)); // 2026-03-01
    expect(dunuAl()).toBe('2026-02-28');
  });

  it('dunuAl() artık yıl ay sınırında 29 Şubat döndürür (1 Mart 2024 -> 29 Şubat 2024)', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2024, 2, 1, 12, 0, 0)); // 2024-03-01
    expect(dunuAl()).toBe('2024-02-29');
  });

  it('dunuAl() yıl sınırında önceki yılın 31 Aralık gününü döndürür (1 Ocak -> 31 Aralık)', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 0, 1, 12, 0, 0)); // 2026-01-01
    expect(dunuAl()).toBe('2025-12-31');
  });
});

// gunEkle'nin takvimsel aritmetigini dogrudan, sistem saatinden bagimsiz sabit
// literal beklenen degerlerle kilitler. dunuAl bu fonksiyona dayandigi icin
// buradaki bir regresyon dunuAl'i da bozardi.
describe('TarihYardimcisi — gunEkle takvim aritmetiği', () => {
  it('gün ekler (artı yön)', () => {
    expect(gunEkle('2026-09-09', 1)).toBe('2026-09-10');
  });

  it('gün çıkarır (eksi yön)', () => {
    expect(gunEkle('2026-09-10', -1)).toBe('2026-09-09');
  });

  it('ay sınırını ileri aşar (28 Şubat 2026 + 1 -> 1 Mart, artık yıl değil)', () => {
    expect(gunEkle('2026-02-28', 1)).toBe('2026-03-01');
  });

  it('artık yıl ay sınırını ileri aşar (28 Şubat 2024 + 1 -> 29 Şubat)', () => {
    expect(gunEkle('2024-02-28', 1)).toBe('2024-02-29');
  });

  it('ay sınırını geri aşar (1 Mart 2026 - 1 -> 28 Şubat)', () => {
    expect(gunEkle('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('yıl sınırını geri aşar (1 Ocak 2026 - 1 -> 31 Aralık 2025)', () => {
    expect(gunEkle('2026-01-01', -1)).toBe('2025-12-31');
  });

  it('yıl sınırını ileri aşar (31 Aralık 2025 + 1 -> 1 Ocak 2026)', () => {
    expect(gunEkle('2025-12-31', 1)).toBe('2026-01-01');
  });

  it('birden çok ayı kapsayan büyük adımı doğru hesaplar (31 Ocak + 31 -> 3 Mart 2026)', () => {
    // Ocak 31 + 31 gun: Subat 28 gun (2026 artik yil degil) -> 3 Mart
    expect(gunEkle('2026-01-31', 31)).toBe('2026-03-03');
  });
});

// ISO <-> Date donusumunun cift yonlu (round-trip) tutarliligi ve padStart davranisi.
// getMonth()+1 / ay-1 indeks kaymasi bu testlerle kilitlenir; bir off-by-one
// regresyonu tum tarih modulunu (seri, takvim, istatistik) sessizce kaydirirdi.
describe('TarihYardimcisi — ISO/Date donusumu ve round-trip', () => {
  it('tarihiISOFormatinaCevir() yerel Date nesnesini dogru ISO string e cevirir', () => {
    // 7 Haziran 2026 (ay index 5)
    expect(tarihiISOFormatinaCevir(new Date(2026, 5, 7))).toBe('2026-06-07');
  });

  it('tarihiISOFormatinaCevir() tek haneli ay ve gunu sifirla doldurur (padStart)', () => {
    // 3 Subat 2026 -> ay 02, gun 03 (ikisi de iki haneli olmali)
    expect(tarihiISOFormatinaCevir(new Date(2026, 1, 3))).toBe('2026-02-03');
  });

  it('ISOTarihiDateNesnesiNeCevir() ay indeksini dogru kurar (1-tabanli ay -> 0-tabanli getMonth)', () => {
    const tarih = ISOTarihiDateNesnesiNeCevir('2026-06-07');
    expect(tarih.getFullYear()).toBe(2026);
    expect(tarih.getMonth()).toBe(5); // Haziran = index 5
    expect(tarih.getDate()).toBe(7);
  });

  it('ISO -> Date -> ISO round-trip degeri korur (artik yil 29 Subat dahil)', () => {
    for (const iso of ['2026-06-07', '2024-02-29', '2025-12-31', '2026-01-01']) {
      expect(tarihiISOFormatinaCevir(ISOTarihiDateNesnesiNeCevir(iso))).toBe(iso);
    }
  });
});

// gunAdiniAl bilinen takvim gunlerine karsi dogrulanir; GUN_ISIMLERI dizisinin
// sirasi (getDay()===0 -> Pazar) bu sabit referanslarla kilitlenir.
describe('TarihYardimcisi — gunAdiniAl', () => {
  it('bilinen tarihlerin gun adini dogru dondurur', () => {
    expect(gunAdiniAl('2026-06-07')).toBe('Pazar'); // getDay()===0
    expect(gunAdiniAl('2026-06-08')).toBe('Pazartesi');
    expect(gunAdiniAl('2026-06-12')).toBe('Cuma');
    expect(gunAdiniAl('2025-12-31')).toBe('Carsamba');
    expect(gunAdiniAl('2024-02-29')).toBe('Persembe'); // artik yil sinir gunu
  });
});

// haftaninBaslangiciniAl Pazartesi-tabanli; en kritik kose durumu Pazar (getDay()===0)
// olup -6 gun kaydirma dalidir. Yanlis hesap tum takvim/istatistik haftalarini kaydirir.
describe('TarihYardimcisi — haftaninBaslangiciniAl (Pazartesi)', () => {
  it('Pazar gununde bir onceki Pazartesi ye doner (getDay()===0 -> -6 dali)', () => {
    // 2026-06-07 Pazar -> haftanin baslangici 2026-06-01 Pazartesi
    expect(haftaninBaslangiciniAl('2026-06-07')).toBe('2026-06-01');
  });

  it('Pazartesi gununde kendisini dondurur (fark 0)', () => {
    expect(haftaninBaslangiciniAl('2026-06-08')).toBe('2026-06-08');
  });

  it('hafta ortasi (Carsamba) ayni haftanin Pazartesi sine doner', () => {
    // 2026-06-10 Carsamba -> 2026-06-08 Pazartesi
    expect(haftaninBaslangiciniAl('2026-06-10')).toBe('2026-06-08');
  });

  it('dondurulen gun her zaman Pazartesi dir (anlamsal kontrat)', () => {
    for (const iso of ['2026-06-07', '2026-06-08', '2026-06-10', '2024-02-29']) {
      expect(gunAdiniAl(haftaninBaslangiciniAl(iso))).toBe('Pazartesi');
    }
  });
});

// ayinIlkGunuAl / ayinSonGunuAl: ozellikle new Date(yil, ay+1, 0) ile son gun hilesi
// ve 28/29/30/31 gunluk aylar + artik yil Subat sonu referans degerlerle dogrulanir.
describe('TarihYardimcisi — ayinIlkGunuAl / ayinSonGunuAl', () => {
  it('ayin ilk gunu her zaman 01 doner (gun bilgisinden bagimsiz)', () => {
    expect(ayinIlkGunuAl('2026-06-07')).toBe('2026-06-01');
    expect(ayinIlkGunuAl('2026-02-28')).toBe('2026-02-01');
  });

  it('28 gunluk Subat (artik yil DEGIL) son gununu dogru bulur', () => {
    expect(ayinSonGunuAl('2026-02-15')).toBe('2026-02-28');
  });

  it('29 gunluk Subat (artik yil) son gununu dogru bulur', () => {
    expect(ayinSonGunuAl('2024-02-10')).toBe('2024-02-29');
  });

  it('30 gunluk ay (Nisan) son gununu dogru bulur', () => {
    expect(ayinSonGunuAl('2026-04-05')).toBe('2026-04-30');
  });

  it('31 gunluk ay (Ocak) son gununu dogru bulur', () => {
    expect(ayinSonGunuAl('2026-01-20')).toBe('2026-01-31');
  });

  it('31 gunluk ay (Aralik) son gununu dogru bulur (yil sonu)', () => {
    expect(ayinSonGunuAl('2025-12-09')).toBe('2025-12-31');
  });
});

// tarihAraliginiAl: ISO string sirali oldugu icin string < karsilastirmasi calisir;
// ay/yil sinirini dogru astigi, tek-eleman ve ters (baslangic>bitis -> bos) vakalari kilitlenir.
describe('TarihYardimcisi — tarihAraliginiAl', () => {
  it('ay sinirini asan araligi (kapsayici) dogru uretir', () => {
    expect(tarihAraliginiAl('2026-02-27', '2026-03-02')).toEqual([
      '2026-02-27',
      '2026-02-28',
      '2026-03-01',
      '2026-03-02',
    ]);
  });

  it('yil sinirini asan araligi dogru uretir', () => {
    expect(tarihAraliginiAl('2025-12-30', '2026-01-02')).toEqual([
      '2025-12-30',
      '2025-12-31',
      '2026-01-01',
      '2026-01-02',
    ]);
  });

  it('baslangic === bitis tek elemanli dizi doner (kapsayici alt/ust sinir)', () => {
    expect(tarihAraliginiAl('2026-06-07', '2026-06-07')).toEqual(['2026-06-07']);
  });

  it('baslangic > bitis oldugunda bos dizi doner', () => {
    expect(tarihAraliginiAl('2026-06-08', '2026-06-07')).toEqual([]);
  });
});

// sonNGunuAl: tam N gun donmeli, bugunle BITMELI ve siralilik (eski -> yeni) korunmali.
// Sistem saati 2026-06-07 12:00 e DONDURULUR; ham gercek-zaman kullanilmaz (CI gun-siniri flaky onlenir).
describe('TarihYardimcisi — sonNGunuAl', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('tam N gun dondurur, son eleman bugun ve dizi eskiden yeniye siralidir', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 5, 7, 12, 0, 0)); // 2026-06-07
    const sonuc = sonNGunuAl(3);
    expect(sonuc).toHaveLength(3);
    expect(sonuc).toEqual(['2026-06-05', '2026-06-06', '2026-06-07']);
    expect(sonuc[sonuc.length - 1]).toBe(bugunuAl()); // bugunle biter
  });

  it('N=1 yalnizca bugunu dondurur', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 5, 7, 12, 0, 0));
    expect(sonNGunuAl(1)).toEqual(['2026-06-07']);
  });

  it('ay basinda geriye giderken onceki aya tasar', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 2, 1, 12, 0, 0)); // 2026-03-01
    expect(sonNGunuAl(3)).toEqual(['2026-02-27', '2026-02-28', '2026-03-01']);
  });
});

// gecmisTarihMi / bugunMu / ayniGunMu: bugune gore dun/bugun/yarin sinir karsilastirmalari.
// Sistem saati sabit oglene DONDURULUR; gun donumu flaky'sini onlemek icin.
describe('TarihYardimcisi — gecmisTarihMi / bugunMu / ayniGunMu', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('dun gecmis, bugun ve yarin gecmis DEGIL (sinir karsilastirmasi)', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 5, 7, 12, 0, 0)); // bugun 2026-06-07
    expect(gecmisTarihMi('2026-06-06')).toBe(true); // dun
    expect(gecmisTarihMi('2026-06-07')).toBe(false); // bugun gecmis degil
    expect(gecmisTarihMi('2026-06-08')).toBe(false); // yarin
  });

  it('bugunMu yalnizca bugun icin true, dun ve yarin icin false', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 5, 7, 12, 0, 0));
    expect(bugunMu('2026-06-07')).toBe(true);
    expect(bugunMu('2026-06-06')).toBe(false);
    expect(bugunMu('2026-06-08')).toBe(false);
  });

  it('ayniGunMu yalnizca esit ISO stringlerde true doner', () => {
    expect(ayniGunMu('2026-06-07', '2026-06-07')).toBe(true);
    expect(ayniGunMu('2026-06-07', '2026-06-08')).toBe(false);
  });
});
