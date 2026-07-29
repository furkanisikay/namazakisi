import { aylikIzgaraOlustur } from '../aylikIzgara';

describe('aylikIzgaraOlustur', () => {
  test('Temmuz 2026 (1 Temmuz Carsamba) - Haziran 29-30 ile baslar, Agustos 1-2 ile biter, toplam 35', () => {
    const izgara = aylikIzgaraOlustur({
      yil: 2026,
      ay: 6, // Temmuz (0-tabanli)
      kayitlar: {},
      dondurulmusTarihler: new Set(),
      bugun: '2026-12-31', // hicbir gun 'gelecek' olmasin diye ileri bir tarih
    });

    expect(izgara).toHaveLength(35);
    expect(izgara[0].tarih).toBe('2026-06-29');
    expect(izgara[0].digerAy).toBe(true);
    expect(izgara[1].tarih).toBe('2026-06-30');
    expect(izgara[1].digerAy).toBe(true);
    expect(izgara[33].tarih).toBe('2026-08-01');
    expect(izgara[33].digerAy).toBe(true);
    expect(izgara[34].tarih).toBe('2026-08-02');
    expect(izgara[34].digerAy).toBe(true);

    const temmuzGunleri = izgara.filter((g) => !g.digerAy);
    expect(temmuzGunleri).toHaveLength(31);
    expect(temmuzGunleri[0].tarih).toBe('2026-07-01');
    expect(temmuzGunleri[30].tarih).toBe('2026-07-31');
  });

  test('Subat 2027 (pazartesi baslar, 28 gun) -> tam 28 hucre uretir', () => {
    const izgara = aylikIzgaraOlustur({
      yil: 2027,
      ay: 1, // Subat (0-tabanli)
      kayitlar: {},
      dondurulmusTarihler: new Set(),
      bugun: '2027-12-31',
    });

    expect(izgara).toHaveLength(28);
    expect(izgara[0].tarih).toBe('2027-02-01');
    expect(izgara[0].digerAy).toBe(false);
    expect(izgara[27].tarih).toBe('2027-02-28');
    expect(izgara.every((g) => !g.digerAy)).toBe(true);
  });

  test('bugun enjekte edilir: bugunden sonraki gunler gelecek, bugun gelecek DEGIL', () => {
    const izgara = aylikIzgaraOlustur({
      yil: 2026,
      ay: 6,
      kayitlar: {},
      dondurulmusTarihler: new Set(),
      bugun: '2026-07-15',
    });

    const bugunGunu = izgara.find((g) => g.tarih === '2026-07-15');
    const yarinGunu = izgara.find((g) => g.tarih === '2026-07-16');
    const dunGunu = izgara.find((g) => g.tarih === '2026-07-14');

    expect(bugunGunu?.durum.tip).not.toBe('gelecek');
    expect(yarinGunu?.durum.tip).toBe('gelecek');
    expect(dunGunu?.durum.tip).not.toBe('gelecek');
  });

  test('dondurulmus gun, kilinmis kaydi olsa bile dondurulmus gorunur', () => {
    const izgara = aylikIzgaraOlustur({
      yil: 2026,
      ay: 6,
      kayitlar: {
        '2026-07-10': [true, true, true, true, true],
      },
      dondurulmusTarihler: new Set(['2026-07-10']),
      bugun: '2026-12-31',
    });

    const gun = izgara.find((g) => g.tarih === '2026-07-10');
    expect(gun?.durum.tip).toBe('dondurulmus');
  });

  test('kaydi olmayan gecmis/bugun gun kilindi tipinde bos vakitlerle gorunur', () => {
    const izgara = aylikIzgaraOlustur({
      yil: 2026,
      ay: 6,
      kayitlar: {},
      dondurulmusTarihler: new Set(),
      bugun: '2026-12-31',
    });

    const gun = izgara.find((g) => g.tarih === '2026-07-05');
    expect(gun?.durum).toEqual({ tip: 'kilindi', vakitler: [false, false, false, false, false] });
  });

  test('kayitlardaki vakitler dogrudan yansitilir', () => {
    const izgara = aylikIzgaraOlustur({
      yil: 2026,
      ay: 6,
      kayitlar: {
        '2026-07-05': [true, false, true, false, true],
      },
      dondurulmusTarihler: new Set(),
      bugun: '2026-12-31',
    });

    const gun = izgara.find((g) => g.tarih === '2026-07-05');
    expect(gun?.durum).toEqual({ tip: 'kilindi', vakitler: [true, false, true, false, true] });
  });
});
