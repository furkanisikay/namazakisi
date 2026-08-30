import {
  pencereUzunluguDkHesapla,
  adimPencereyeSigarMi,
  pencereSuresiMetni,
} from '../pencereUzunlugu';

/** Yerel saatte tarih üretir (UTC parse tuzağına düşmemek için `new Date(y,a,g,...)`). */
const t = (gun: number, saat: number, dakika = 0) => new Date(2026, 7, gun, saat, dakika, 0, 0);

describe('pencereUzunluguDkHesapla', () => {
  test('gün içi pencere: çıkış - giriş dakika olarak', () => {
    // Öğle 13:00 -> İkindi 16:30
    expect(pencereUzunluguDkHesapla(t(27, 13, 0), t(27, 16, 30))).toBe(210);
  });

  test('GECE YARISINI AŞAN pencere (yatsı -> imsak) doğru hesaplanır', () => {
    // Yatsı 21:15 -> ertesi günün imsağı 05:15 = 8 sa = 480 dk
    expect(pencereUzunluguDkHesapla(t(27, 21, 15), t(28, 5, 15))).toBe(480);
  });

  test('çıkış aynı günün ERKEN saatiyse ertesi güne sarar (yatsı için tek-gün verisi)', () => {
    // Ekran o günün vakit tablosunu okur: yatsı 21:15, imsak 05:15 AYNI gündedir.
    // Sarma olmasaydı negatif/sıfır pencere çıkar ve her adım "sığmıyor" görünürdü.
    expect(pencereUzunluguDkHesapla(t(27, 21, 15), t(27, 5, 15))).toBe(480);
  });

  test('saniye artıkları aşağı yuvarlanır (tam dakika)', () => {
    const giris = new Date(2026, 7, 27, 13, 0, 30);
    const cikis = new Date(2026, 7, 27, 13, 45, 10);
    expect(pencereUzunluguDkHesapla(giris, cikis)).toBe(44);
  });

  test('geçersiz tarihte 0 döner (çağıran "bilinmiyor" gibi ele alır)', () => {
    expect(pencereUzunluguDkHesapla(new Date(NaN), t(27, 13, 0))).toBe(0);
  });
});

describe('adimPencereyeSigarMi', () => {
  test('eşik pencereden küçükse sığar, eşit/büyükse sığmaz', () => {
    expect(adimPencereyeSigarMi(399, 400)).toBe(true);
    expect(adimPencereyeSigarMi(400, 400)).toBe(false);
    expect(adimPencereyeSigarMi(401, 400)).toBe(false);
  });

  test('pencere BİLİNMİYORSA sığar sayılır (yanlış alarm verme)', () => {
    expect(adimPencereyeSigarMi(45, undefined)).toBe(true);
    expect(adimPencereyeSigarMi(45, 0)).toBe(true);
  });
});

describe('pencereSuresiMetni', () => {
  test('saat + dakika, yalnız saat, yalnız dakika', () => {
    expect(pencereSuresiMetni(400)).toBe('6 sa 40 dk');
    expect(pencereSuresiMetni(120)).toBe('2 sa');
    expect(pencereSuresiMetni(45)).toBe('45 dk');
    expect(pencereSuresiMetni(0)).toBe('0 dk');
  });
});
