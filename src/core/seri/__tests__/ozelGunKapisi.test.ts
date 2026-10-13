import { ozelGunAktifMi, ozelGunKapisiGirdisiniCoz } from '../ozelGunKapisi';
import { bugunuAl, gunEkle } from '../../utils/TarihYardimcisi';

const aralik = (baslangicTarihi: string, bitisTarihi: string) => ({
  ozelGunModuAktif: true,
  aktifOzelGun: { baslangicTarihi, bitisTarihi },
});

describe('ozelGunAktifMi — tek kapı (issue #272)', () => {
  const bugun = bugunuAl();

  test('aralığın içi ve İKİ UCU da dahildir', () => {
    const a = aralik(gunEkle(bugun, -2), gunEkle(bugun, 2));
    expect(ozelGunAktifMi(gunEkle(bugun, -2), a)).toBe(true);
    expect(ozelGunAktifMi(bugun, a)).toBe(true);
    expect(ozelGunAktifMi(gunEkle(bugun, 2), a)).toBe(true);
  });

  test('aralığın dışı kapalıdır — bitiş ertesi gün hatırlatmalar GERİ GELİR', () => {
    const a = aralik(gunEkle(bugun, -2), gunEkle(bugun, 2));
    expect(ozelGunAktifMi(gunEkle(bugun, -3), a)).toBe(false);
    expect(ozelGunAktifMi(gunEkle(bugun, 3), a)).toBe(false);
  });

  test('mod kapalıyken aralık bugünü kapsasa bile kapı KAPALI (seri motoruyla aynı)', () => {
    expect(
      ozelGunAktifMi(bugun, { ozelGunModuAktif: false, aktifOzelGun: { baslangicTarihi: bugun, bitisTarihi: bugun } })
    ).toBe(false);
  });

  test('aktif kayıt yoksa / girdi yoksa kapalı', () => {
    expect(ozelGunAktifMi(bugun, { ozelGunModuAktif: true, aktifOzelGun: null })).toBe(false);
    expect(ozelGunAktifMi(bugun, null)).toBe(false);
    expect(ozelGunAktifMi(bugun, undefined)).toBe(false);
  });

  test('ters aralık ve bozuk tarih çökmez, kapalı döner', () => {
    expect(ozelGunAktifMi(bugun, aralik(gunEkle(bugun, 2), gunEkle(bugun, -2)))).toBe(false);
    expect(ozelGunAktifMi(bugun, aralik('bozuk', bugun))).toBe(false);
    expect(ozelGunAktifMi('bozuk', aralik(bugun, bugun))).toBe(false);
  });

  test('ay ve yıl sınırlarında dize karşılaştırması takvim sırasıyla aynı', () => {
    const a = aralik('2026-12-30', '2027-01-02');
    expect(ozelGunAktifMi('2026-12-31', a)).toBe(true);
    expect(ozelGunAktifMi('2027-01-01', a)).toBe(true);
    expect(ozelGunAktifMi('2027-01-03', a)).toBe(false);
    expect(ozelGunAktifMi('2026-12-29', a)).toBe(false);
  });

  // SERİ DONDURMA BİREBİR KORUNUR: seri motorunun eski (Date tabanlı)
  // karşılaştırması ile yeni dize kapısı, motorun beslediği her gün için aynı
  // cevabı vermeli.
  test('eski Date tabanlı seri kapısıyla 60 günlük taramada BİREBİR aynı', () => {
    const eskiKapi = (tarih: string, bas: string, bit: string) => {
      const k = new Date(tarih);
      const b = new Date(bas);
      const s = new Date(bit);
      k.setHours(0, 0, 0, 0);
      b.setHours(0, 0, 0, 0);
      s.setHours(0, 0, 0, 0);
      return k >= b && k <= s;
    };
    const bas = gunEkle(bugun, -5);
    const bit = gunEkle(bugun, 7);
    for (let i = -30; i < 30; i++) {
      const gun = gunEkle(bugun, i);
      expect(ozelGunAktifMi(gun, aralik(bas, bit))).toBe(eskiKapi(gun, bas, bit));
    }
  });
});

describe('ozelGunKapisiGirdisiniCoz — diskten gelen ham değer', () => {
  test('geçerli kayıt alanları korunur, fazlası atılır', () => {
    expect(
      ozelGunKapisiGirdisiniCoz({
        ozelGunModuAktif: true,
        aktifOzelGun: { id: 'a', baslangicTarihi: '2026-10-01', bitisTarihi: '2026-10-05', olusturulmaTarihi: 'x' },
        gecmisKayitlar: [],
      })
    ).toEqual({
      ozelGunModuAktif: true,
      aktifOzelGun: { baslangicTarihi: '2026-10-01', bitisTarihi: '2026-10-05' },
    });
  });

  test('nesne-dışı değer (null/sayı/dize) null döner', () => {
    expect(ozelGunKapisiGirdisiniCoz(null)).toBeNull();
    expect(ozelGunKapisiGirdisiniCoz(42)).toBeNull();
    expect(ozelGunKapisiGirdisiniCoz('x')).toBeNull();
  });

  test('bozuk aktif kayıt kapıyı açmaz', () => {
    expect(ozelGunKapisiGirdisiniCoz({ ozelGunModuAktif: true, aktifOzelGun: { baslangicTarihi: 5 } })).toEqual({
      ozelGunModuAktif: true,
      aktifOzelGun: null,
    });
    expect(ozelGunKapisiGirdisiniCoz({ ozelGunModuAktif: 'evet' })).toEqual({
      ozelGunModuAktif: false,
      aktifOzelGun: null,
    });
  });
});
