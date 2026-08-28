import { sayacBaslangicEsikleriHesapla, muhafizUyarilanVakitleriBul } from '../vakitSayacYardimcisi';
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
    matris.ikindi.seviyeler[0].esikDk = 12;

    const esikler = sayacBaslangicEsikleriHesapla(1, matris);
    expect(esikler.ogle).toBe(60);
    expect(esikler.ikindi).toBe(12);
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

  it('tüm seviyeleri sessiz olan vakit listeden ÇIKAR (#90 bastırması orada uygulanmaz)', () => {
    const matris: MuhafizMatrisi = JSON.parse(JSON.stringify(tekDuzeMatris));
    for (const seviye of matris.ogle.seviyeler) seviye.mod = 'sessiz';

    const uyarilan = muhafizUyarilanVakitleriBul(matris);
    expect(uyarilan).not.toContain('ogle');
    expect(uyarilan).toContain('ikindi');
  });

  it('tek bir seviyesi bile açıksa vakit listede KALIR', () => {
    const matris: MuhafizMatrisi = JSON.parse(JSON.stringify(tekDuzeMatris));
    matris.ogle.seviyeler.forEach((s, i) => { s.mod = i === 3 ? 'sesli' : 'sessiz'; });

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
    for (const seviye of matris.yatsi.seviyeler) seviye.mod = 'sessiz';

    const uyarilan = muhafizUyarilanVakitleriBul(matris);
    expect(uyarilan).not.toContain('yatsi');
    expect(uyarilan).toContain('ogle');
  });
});
