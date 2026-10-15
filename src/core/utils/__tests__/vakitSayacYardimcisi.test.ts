import {
  sayacBaslangicEsikleriHesapla,
  muhafizUyarilanVakitleriBul,
  sayacBaslangicSecenekleriOlustur,
  seciliSayacBaslangici,
} from '../vakitSayacYardimcisi';
import type { MuhafizMatrisi } from '../../muhafiz/matrisTipleri';
import { eskidenMatriseGoc } from '../../muhafiz/muhafizGoc';
import { MUHAFIZ_VAKITLERI } from '../../muhafiz/matrisTipleri';

/** Eski global ayarin matris karsiligi: tum vakitlerde ayni esikler. */
const tekDuzeMatris = eskidenMatriseGoc({
  esikler: { seviye1: 45, seviye2: 25, seviye3: 10, seviye4: 3 },
  sikliklar: { seviye1: 15, seviye2: 10, seviye3: 5, seviye4: 1 },
});

describe('sayacBaslangicEsikleriHesapla', () => {
  it('her seviye için ilgili eşiği TÜM vakitler için döndürür', () => {
    expect(sayacBaslangicEsikleriHesapla(1, tekDuzeMatris).ogle).toBe(45);
    expect(sayacBaslangicEsikleriHesapla(2, tekDuzeMatris).ogle).toBe(25);
    expect(sayacBaslangicEsikleriHesapla(3, tekDuzeMatris).ogle).toBe(10);
    expect(sayacBaslangicEsikleriHesapla(4, tekDuzeMatris).ogle).toBe(3);
  });

  it('tanımsız/geçersiz seviye → seviye1 (varsayılan, en erken)', () => {
    expect(sayacBaslangicEsikleriHesapla(undefined, tekDuzeMatris).ogle).toBe(45);
    expect(sayacBaslangicEsikleriHesapla(0, tekDuzeMatris).ogle).toBe(45);
    expect(sayacBaslangicEsikleriHesapla(99, tekDuzeMatris).ogle).toBe(45);
  });

  it('5 vaktin tamamı için değer üretir', () => {
    const esikler = sayacBaslangicEsikleriHesapla(1, tekDuzeMatris);
    for (const vakit of MUHAFIZ_VAKITLERI) {
      expect(esikler[vakit]).toBe(45);
    }
  });

  it('VAKİT BAZLI: her vakit kendi eşiğini döndürür (global değil)', () => {
    const matris: MuhafizMatrisi = JSON.parse(JSON.stringify(tekDuzeMatris));
    matris.ogle.seviyeler[0].esikDk = 60;
    matris.ikindi.seviyeler[0].esikDk = 52;

    const esikler = sayacBaslangicEsikleriHesapla(1, matris);
    expect(esikler.ogle).toBe(60);
    expect(esikler.ikindi).toBe(52);
    expect(esikler.aksam).toBe(45); // dokunulmayan vakit varsayılanda kalır
  });

  it('bozuk/eksik matris satırı → 0 (o vakit için sayaç planlanmaz)', () => {
    const bozuk = JSON.parse(JSON.stringify(tekDuzeMatris)) as MuhafizMatrisi;
    delete (bozuk as Partial<MuhafizMatrisi>).ogle;

    expect(sayacBaslangicEsikleriHesapla(1, bozuk).ogle).toBe(0);
    expect(sayacBaslangicEsikleriHesapla(1, bozuk).ikindi).toBe(45);
  });
});

describe('muhafizUyarilanVakitleriBul', () => {
  it('tüm seviyeleri bildirim olan matriste 5 vaktin tamamı döner', () => {
    expect(muhafizUyarilanVakitleriBul(tekDuzeMatris).sort()).toEqual([...MUHAFIZ_VAKITLERI].sort());
  });

  it('tüm adımları KAPALI olan vakit listeden ÇIKAR (#90 bastırması orada uygulanmaz)', () => {
    const matris: MuhafizMatrisi = JSON.parse(JSON.stringify(tekDuzeMatris));
    for (const seviye of matris.ogle.seviyeler) seviye.kanallar = {};

    const uyarilan = muhafizUyarilanVakitleriBul(matris);
    expect(uyarilan).not.toContain('ogle');
    expect(uyarilan).toContain('ikindi');
  });

  it('tek bir seviyesi bile açıksa vakit listede KALIR', () => {
    const matris: MuhafizMatrisi = JSON.parse(JSON.stringify(tekDuzeMatris));
    matris.ogle.seviyeler.forEach((s, i) => { s.kanallar = i === 3 ? { sesli: true } : {}; });

    expect(muhafizUyarilanVakitleriBul(matris)).toContain('ogle');
  });
});

// ── Faz 1 / B12: pencere yönü ────────────────────────────────────────────────
//
// Giriş yönüne çevrilmiş vakitte `esikDk` "girişten itibaren"dir; sayaç onu
// "çıkışa kala" sanıp yanlış anda başlar. Karar: dönüştürme DEĞİL bastırma —
// giriş-yönlü vakit "tümüyle kapsanmış" sayılır ve sayaç orada planlanmaz.
// Kullanıcı hatırlatmasız kalmaz: bastırma yalnız `muhafizAktif` iken uygulanır
// ve giriş yönünde muhafız pencere boyunca zaten uyarır.
describe('muhafizUyarilanVakitleriBul — pencere yönü (B12)', () => {
  const yonluMatris = (yon: 'cikisaDogru' | 'girisindenItibaren'): MuhafizMatrisi => {
    const matris: MuhafizMatrisi = JSON.parse(JSON.stringify(tekDuzeMatris));
    matris.yatsi.yon = yon;
    return matris;
  };

  it('giriş-yönlü vakit bastırma listesinde KALIR (sayaç orada planlanmaz)', () => {
    expect(muhafizUyarilanVakitleriBul(yonluMatris('girisindenItibaren'))).toContain('yatsi');
  });

  it('yön alanı olmayan matris birebir eski sonucu verir (sıfır göç)', () => {
    expect(muhafizUyarilanVakitleriBul(tekDuzeMatris).sort()).toEqual(
      muhafizUyarilanVakitleriBul(yonluMatris('cikisaDogru')).sort()
    );
  });

  it('EK ŞART: giriş-yönlü ama TÜM adımları kapalı vakit bastırılmaz', () => {
    // Aksi halde o vakitte ne muhafız ne de sayaç uyarısı kalırdı — yön kontrolü
    // aktif-adım filtresiyle AND'lenmeli, onun yerine geçmemeli.
    const matris = yonluMatris('girisindenItibaren');
    for (const seviye of matris.yatsi.seviyeler) seviye.kanallar = {};

    const uyarilan = muhafizUyarilanVakitleriBul(matris);
    expect(uyarilan).not.toContain('yatsi');
    expect(uyarilan).toContain('ogle');
  });
});

/**
 * MUHAFIZ KAPALIYKEN bastirma uygulanmaz ve esik ham okunur. Giris yonlu vaktin
 * `esikDk`'si "giristen itibaren" demektir; "cikisa kala" diye yorumlanirsa
 * sayac yanlis anda baslar (or. acil 180 dk, 87 dk'lik aksamda sayaci vakit
 * girer girmez baslatirdi).
 */
describe('sayacBaslangicEsikleriHesapla — giris yonlu vakit', () => {
  const girisVakti = (yonYedegi?: MuhafizMatrisi['yatsi']['yonYedegi']) => {
    const matris: MuhafizMatrisi = JSON.parse(JSON.stringify(tekDuzeMatris));
    matris.yatsi.yon = 'girisindenItibaren';
    matris.yatsi.seviyeler.forEach((s, i) => {
      s.esikDk = [15, 45, 90, 180][i]; // giris tablosu (uzun/normal)
    });
    if (yonYedegi) matris.yatsi.yonYedegi = yonYedegi;
    return matris;
  };

  it('CIKIS yedegi varsa esik ORADAN okunur', () => {
    const matris = girisVakti({
      cikisaDogru: [
        { esikDk: 60, siklik: 'birkez' },
        { esikDk: 30, siklik: 'birkez' },
        { esikDk: 15, siklik: 'birkez' },
        { esikDk: 5, siklik: 'birkez' },
      ],
    });

    expect(sayacBaslangicEsikleriHesapla(1, matris).yatsi).toBe(60);
    expect(sayacBaslangicEsikleriHesapla(4, matris).yatsi).toBe(5);
  });

  it('yedek yoksa tarihsel CIKIS varsayilanina duser (giris degeri SIZMAZ)', () => {
    const matris = girisVakti();

    expect(sayacBaslangicEsikleriHesapla(1, matris).yatsi).toBe(45);
    expect(sayacBaslangicEsikleriHesapla(4, matris).yatsi).toBe(3);
  });

  it('CIKIS yonlu vakitler etkilenmez (sifir davranis degisikligi)', () => {
    const matris = girisVakti();

    expect(sayacBaslangicEsikleriHesapla(1, matris).ogle).toBe(45);
    expect(sayacBaslangicEsikleriHesapla(3, matris).ikindi).toBe(10);
  });
});

describe('sayacBaslangicEsikleriHesapla — kronolojik N. hatırlatma (issue #274)', () => {
  const adim = (kademe: 'nazik' | 'uyari' | 'sert' | 'acil', esikDk: number) => ({
    kademe,
    kanallar: { bildirim: true },
    esikDk,
    siklik: 'birkez' as const,
    bildirimSesi: 'varsayilan',
    anonsMetni: '',
  });
  const matrisKur = (seviyeler: ReturnType<typeof adim>[]): MuhafizMatrisi =>
    Object.fromEntries(MUHAFIZ_VAKITLERI.map((v) => [v, { seviyeler }])) as MuhafizMatrisi;

  it('numara TONU değil SIRAYI anlatır: 2. hatırlatma ikinci en büyük eşiktir', () => {
    // Tonlar sırasız: sert önce, nazik sonra.
    const m = matrisKur([adim('sert', 50), adim('nazik', 20), adim('acil', 5)]);
    expect(sayacBaslangicEsikleriHesapla(2, m).ogle).toBe(20);
  });

  it('vakitte o kadar hatırlatma yoksa SON hatırlatmaya düşer', () => {
    const m = matrisKur([adim('nazik', 30), adim('sert', 8)]);
    expect(sayacBaslangicEsikleriHesapla(4, m).yatsi).toBe(8);
  });

  it('5. ve 6. hatırlatma seçilebilir', () => {
    const m = matrisKur([60, 50, 40, 30, 20, 10].map((e) => adim('uyari', e)));
    expect(sayacBaslangicEsikleriHesapla(6, m).aksam).toBe(10);
    expect(sayacBaslangicEsikleriHesapla(7, m).aksam).toBe(60); // aralık dışı → 1.
  });
});

describe('sayacBaslangicSecenekleriOlustur (issue #274 — bayat global eşik yok)', () => {
  it('tek düze matris: 4 seçenek, metin gerçek kronolojik eşik', () => {
    expect(sayacBaslangicSecenekleriOlustur(tekDuzeMatris)).toEqual([
      { seviye: 1, metin: 'Son 45 Dakika' },
      { seviye: 2, metin: 'Son 25 Dakika' },
      { seviye: 3, metin: 'Son 10 Dakika' },
      { seviye: 4, metin: 'Son 3 Dakika' },
    ]);
  });

  it('seçenek sayısı matristeki EN FAZLA adım sayısıdır; eksik vakit SON adıma düşer', () => {
    const matris: MuhafizMatrisi = JSON.parse(JSON.stringify(tekDuzeMatris));
    const sablon = matris.ogle.seviyeler;
    for (const v of MUHAFIZ_VAKITLERI) matris[v].seviyeler = matris[v].seviyeler.slice(2); // 10, 3
    matris.ogle.seviyeler = [
      sablon[0], // 45
      sablon[1], // 25
      { ...sablon[1], esikDk: 20 },
      { ...sablon[1], esikDk: 15 },
      sablon[2], // 10
      sablon[3], // 3
    ];
    const secenekler = sayacBaslangicSecenekleriOlustur(matris);
    expect(secenekler).toHaveLength(6);
    expect(secenekler[0].metin).toBe('Son 10–45 Dakika (vakte göre)');
    // 2 adımlı vakitlerde 6. hatırlatma yok → son hatırlatma (3 dk).
    expect(secenekler[5].metin).toBe('Son 3 Dakika');
  });

  it('bayat global eşikleri OKUMAZ (matristen gelir)', () => {
    const matris: MuhafizMatrisi = JSON.parse(JSON.stringify(tekDuzeMatris));
    for (const v of MUHAFIZ_VAKITLERI) {
      matris[v].seviyeler = [matris[v].seviyeler[1], matris[v].seviyeler[3]]; // 25, 3
    }
    expect(sayacBaslangicSecenekleriOlustur(matris).map((s) => s.metin)).toEqual([
      'Son 25 Dakika',
      'Son 3 Dakika',
    ]);
  });

  it('seçili değer seçenek sayısını aşarsa son seçenek seçili görünür', () => {
    expect(seciliSayacBaslangici(undefined, 4)).toBe(1);
    expect(seciliSayacBaslangici(3, 4)).toBe(3);
    expect(seciliSayacBaslangici(5, 2)).toBe(2);
  });
});
