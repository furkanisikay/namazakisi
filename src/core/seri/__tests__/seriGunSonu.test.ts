import {
  SERI_SAYAC_VARSAYILAN_ESIK_DK,
  sayacBaslamaliMi,
  sonrakiImsakVaktiBul,
} from '../seriGunSonu';

const tarih = (gun: number, saat: number, dakika = 0) => new Date(2026, 0, gun, saat, dakika);

/** Her gün 05:30'da imsak veren sağlayıcı. */
const sabitImsak = (gunSaati = 5, gunDakikasi = 30) => (t: Date) =>
  new Date(t.getFullYear(), t.getMonth(), t.getDate(), gunSaati, gunDakikasi);

describe('sonrakiImsakVaktiBul — "şu andan sonraki İLK fajr"', () => {
  /**
   * B4 NÖBETÇİSİ. Eski `sonrakiGunImsakVaktiGetir` KOŞULSUZ yarının fajr'ını
   * döndürüyordu: saat 02:00'de seri gününün gerçek sonu BUGÜNÜN imsağıdır
   * (~3,5 saat), yarınınki değil (~27,5 saat) → sayaç bir gün ileriyi sayardı.
   */
  test('gece yarısından SONRA, imsaktan önce → BUGÜNÜN imsağı', () => {
    const simdi = tarih(15, 2, 0);
    expect(sonrakiImsakVaktiBul(simdi, sabitImsak())).toEqual(tarih(15, 5, 30));
  });

  test('gündüz (imsak geçmiş) → YARININ imsağı', () => {
    const simdi = tarih(15, 14, 0);
    expect(sonrakiImsakVaktiBul(simdi, sabitImsak())).toEqual(tarih(16, 5, 30));
  });

  test('tam imsak anında → YARININ imsağı (geçmiş sayılır, sayaç sıfırda kalmaz)', () => {
    const simdi = tarih(15, 5, 30);
    expect(sonrakiImsakVaktiBul(simdi, sabitImsak())).toEqual(tarih(16, 5, 30));
  });

  test('sağlayıcı null dönerse (konum yapılandırılmamış) sonuç null', () => {
    expect(sonrakiImsakVaktiBul(tarih(15, 2, 0), () => null)).toBeNull();
  });

  test('sağlayıcı fırlatırsa null döner (sayaç bir hesap hatası yüzünden düşmez)', () => {
    expect(
      sonrakiImsakVaktiBul(tarih(15, 2, 0), () => {
        throw new Error('adhan patladı');
      })
    ).toBeNull();
  });

  test('sağlayıcı geçersiz tarih dönerse null', () => {
    expect(sonrakiImsakVaktiBul(tarih(15, 2, 0), () => new Date(Number.NaN))).toBeNull();
  });
});

describe('sayacBaslamaliMi — eşik penceresi', () => {
  test('varsayılan eşik 2 saattir', () => {
    expect(SERI_SAYAC_VARSAYILAN_ESIK_DK).toBe(120);
  });

  test('eşiğin dışında (hedefe daha çok var) BAŞLAMAZ', () => {
    expect(sayacBaslamaliMi(tarih(15, 2, 0), tarih(15, 5, 30), 120)).toBe(false);
  });

  test('eşiğin içinde BAŞLAR', () => {
    expect(sayacBaslamaliMi(tarih(15, 4, 0), tarih(15, 5, 30), 120)).toBe(true);
  });

  test('tam eşik anında BAŞLAR (sınır dahil)', () => {
    expect(sayacBaslamaliMi(tarih(15, 3, 30), tarih(15, 5, 30), 120)).toBe(true);
  });

  test('hedef GEÇMİŞSE başlamaz — chronometer sıfırı geçince saymaya devam eder', () => {
    expect(sayacBaslamaliMi(tarih(15, 6, 0), tarih(15, 5, 30), 120)).toBe(false);
  });

  test('tam hedef anında başlamaz (gösterilecek süre yok)', () => {
    expect(sayacBaslamaliMi(tarih(15, 5, 30), tarih(15, 5, 30), 120)).toBe(false);
  });

  test('hedef null ise başlamaz', () => {
    expect(sayacBaslamaliMi(tarih(15, 4, 0), null, 120)).toBe(false);
  });

  test('bozuk eşik varsayılana düşer', () => {
    // 4 sa önce: varsayılan 120 dk eşiğinin dışında
    expect(sayacBaslamaliMi(tarih(15, 1, 30), tarih(15, 5, 30), Number.NaN)).toBe(false);
    expect(sayacBaslamaliMi(tarih(15, 4, 0), tarih(15, 5, 30), 0)).toBe(true);
  });
});
