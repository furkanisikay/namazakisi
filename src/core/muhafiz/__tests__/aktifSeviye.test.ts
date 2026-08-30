import { aktifSeviyeyiBul, esikSiralamasiGecerliMi } from '../aktifSeviye';
import type {
  SeviyeAyari,
  VakitMuhafizAyari,
  SeviyeKademe,
  UyariKanallari,
} from '../matrisTipleri';

/** Kanal kümesi kısayolları (Faz 2: `mod` enum'unun yerini aldı). */
const KAPALI = {};
const BILDIRIM = { bildirim: true };

const sv = (
  kademe: SeviyeKademe,
  esikDk: number,
  kanallar: UyariKanallari = BILDIRIM
): SeviyeAyari => ({ kademe, kanallar, esikDk, siklik: 'birkez', bildirimSesi: 'can', anonsMetni: '' });

const vakitAyari: VakitMuhafizAyari = {
  seviyeler: [sv('nazik', 30), sv('uyari', 15), sv('sert', 8), sv('acil', 3)],
};

describe('aktifSeviyeyiBul', () => {
  test('35 dk kala: hiçbir pencere kapsamaz → null', () => {
    expect(aktifSeviyeyiBul(vakitAyari, 35)).toBeNull();
  });
  test('20 dk kala: yalnız nazik(30) kapsar → nazik', () => {
    expect(aktifSeviyeyiBul(vakitAyari, 20)?.kademe).toBe('nazik');
  });
  test('5 dk kala: nazik+uyari+sert kapsar → en acil = sert(8)', () => {
    expect(aktifSeviyeyiBul(vakitAyari, 5)?.kademe).toBe('sert');
  });
  test('2 dk kala: hepsi kapsar → acil(3)', () => {
    expect(aktifSeviyeyiBul(vakitAyari, 2)?.kademe).toBe('acil');
  });
  test('kapalı adım pencere sağlamaz: acil kapalıysa 2 dk kala sert kazanır', () => {
    const v: VakitMuhafizAyari = { seviyeler: [sv('nazik', 30), sv('uyari', 15), sv('sert', 8), sv('acil', 3, KAPALI)] };
    expect(aktifSeviyeyiBul(v, 2)?.kademe).toBe('sert');
  });
  test('sınır: kalanDk == esikDk dahildir (8 dk kala sert kapsar)', () => {
    expect(aktifSeviyeyiBul(vakitAyari, 8)?.kademe).toBe('sert');
  });
  test('sınır: kalanDk == en büyük eşik (30) nazik kapsar', () => {
    expect(aktifSeviyeyiBul(vakitAyari, 30)?.kademe).toBe('nazik');
  });
});

/**
 * B1 NÖBETÇİSİ (Faz 1) — `girisindenItibaren` yönünde eskalasyon TERS DÖNER.
 *
 * Çıkış yönünde "kapsayan içinden en KÜÇÜK eşik kazanır" doğrudur (vakit
 * daraldıkça sertleşir). Aynı kural giriş yönünde uygulansaydı `olcuDk >= esikDk`
 * kapsaması 1. dakikada TÜM eşikleri kapsar ve en küçük eşik = en acil kademe
 * kazanırdı → kullanıcı vakit girer girmez "VAKİT ÇIKIYOR!" tonuyla karşılanır,
 * süre geçtikçe NAZİKLEŞİR ve en büyük eşik aşılınca motor tümden susardı.
 *
 * Fikstür eşiği bilerek 1'den başlar: `olcuDk >= esikDk` kuralıyla "1. dakikada
 * nazik" ancak nazik eşiği 1 iken tutar.
 */
describe('aktifSeviyeyiBul — girisindenItibaren yönü (B1)', () => {
  const girisAyari: VakitMuhafizAyari = {
    yon: 'girisindenItibaren',
    seviyeler: [sv('nazik', 1), sv('uyari', 15), sv('sert', 30), sv('acil', 45)],
  };

  test('1. dakikada NAZİK kazanır (ters eskalasyon yok)', () => {
    expect(aktifSeviyeyiBul(girisAyari, 1)?.kademe).toBe('nazik');
  });

  test('süre geçtikçe SERTLEŞİR', () => {
    expect(aktifSeviyeyiBul(girisAyari, 14)?.kademe).toBe('nazik');
    expect(aktifSeviyeyiBul(girisAyari, 15)?.kademe).toBe('uyari');
    expect(aktifSeviyeyiBul(girisAyari, 29)?.kademe).toBe('uyari');
    expect(aktifSeviyeyiBul(girisAyari, 30)?.kademe).toBe('sert');
    expect(aktifSeviyeyiBul(girisAyari, 45)?.kademe).toBe('acil');
  });

  test('pencere sonunda (en büyük eşik aşılmış) ACİL kazanmaya DEVAM eder', () => {
    // Motor susmamalı: "çıkana kadar devam et" isteğinin çekirdeği.
    expect(aktifSeviyeyiBul(girisAyari, 300)?.kademe).toBe('acil');
  });

  test('hiçbir eşik dolmadıysa null (0. dakika)', () => {
    expect(aktifSeviyeyiBul(girisAyari, 0)).toBeNull();
  });

  test('kapalı adım giriş yönünde de pencere sağlamaz', () => {
    const acilSessiz: VakitMuhafizAyari = {
      yon: 'girisindenItibaren',
      seviyeler: [sv('nazik', 1), sv('uyari', 15), sv('sert', 30), sv('acil', 45, KAPALI)],
    };
    expect(aktifSeviyeyiBul(acilSessiz, 60)?.kademe).toBe('sert');
  });

  test('EŞİT eşikte daha SERT kademe kazanır (çıkış yönüyle simetri)', () => {
    const esit: VakitMuhafizAyari = {
      yon: 'girisindenItibaren',
      seviyeler: [sv('nazik', 20), sv('uyari', 20), sv('sert', 20), sv('acil', 20)],
    };
    expect(aktifSeviyeyiBul(esit, 25)?.kademe).toBe('acil');
  });

  test('yön alanı YOKSA çıkış yönü davranışı birebir korunur', () => {
    expect(aktifSeviyeyiBul(vakitAyari, 5)?.kademe).toBe('sert');
    expect(aktifSeviyeyiBul({ ...vakitAyari, yon: 'cikisaDogru' }, 5)?.kademe).toBe('sert');
  });
});

describe('esikSiralamasiGecerliMi', () => {
  test('azalan eşik geçerli', () => {
    expect(esikSiralamasiGecerliMi([sv('nazik', 30), sv('uyari', 15), sv('sert', 8), sv('acil', 3)])).toBe(true);
  });
  test('ters/eşit sıra geçersiz', () => {
    expect(esikSiralamasiGecerliMi([sv('nazik', 10), sv('uyari', 15), sv('sert', 8), sv('acil', 3)])).toBe(false);
  });
  test('eşit eşik geçersiz (kesin azalan olmalı)', () => {
    expect(esikSiralamasiGecerliMi([sv('nazik', 15), sv('uyari', 15), sv('sert', 8), sv('acil', 3)])).toBe(false);
  });

  test('girisindenItibaren yönünde kesin ARTAN sıra geçerlidir', () => {
    const artan = [sv('nazik', 1), sv('uyari', 15), sv('sert', 30), sv('acil', 45)];
    expect(esikSiralamasiGecerliMi(artan, 'girisindenItibaren')).toBe(true);
    // Aynı liste çıkış yönünde GEÇERSİZ
    expect(esikSiralamasiGecerliMi(artan)).toBe(false);
  });

  test('girisindenItibaren yönünde azalan/eşit sıra geçersiz', () => {
    expect(
      esikSiralamasiGecerliMi([sv('nazik', 45), sv('uyari', 30), sv('sert', 15), sv('acil', 1)], 'girisindenItibaren')
    ).toBe(false);
    expect(
      esikSiralamasiGecerliMi([sv('nazik', 15), sv('uyari', 15), sv('sert', 30), sv('acil', 45)], 'girisindenItibaren')
    ).toBe(false);
  });
});
